import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {Storage} from "@google-cloud/storage";
import {HttpsError, onCall} from "firebase-functions/v2/https";
import { validateUserProfile, validateVideoData, validateFileUpload, handleValidationError } from "./validation";
import { checkRateLimit } from "./rateLimiter";
import { validateFileUploadRequest, generateSecureFileName, getMaxFileSize } from "./fileUploadSecurity";

admin.initializeApp();

const firestore = admin.firestore();
const storage = new Storage();

// Good place to implement name into env file
const privateDocumentsBucket = "elevatr-private-documents";
const rawStartupVideoBucketName = "elevatr-startup-raw-videos";
const rawApplicantVideoBucketName = "elevatr-applicant-raw-videos";

const videoCollectionId = "videos";

export interface Video {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed";
  title?: string;
  description?: string;
}

export const createUser = functions
  .region("us-east1")
  .auth.user()
  .onCreate((user) => {
    const userInfo = {
      uid: user.uid,
      email: user.email,
      lastSeenIndex: 0,
      likes: [],
      matches: [],
      profilePictureUrl: user.photoURL,
    };
    logger.info(`User Created: ${JSON.stringify(userInfo)}`);

    return firestore.collection("users").doc(user.uid).set(userInfo);
  });

export const getUser = onCall(
  {region: "us-east1", maxInstances: 1}, // Specify the region
  async (request) => {
    const {auth, data} = request;
    if (!auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "you must be signed in"
      );
    }

    const uid = data?.uid || auth.uid;
    const userDoc = await firestore.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User not found");
    } else {
      return userDoc.data();
    }
  }
);

export const patchUser = onCall(
  {region: "us-east1", maxInstances: 1},
  async (request) => {
    const {auth, data} = request;
    if (!auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in"
      );
    }
    const uid = auth.uid;

    try {
      // Check rate limit
      await checkRateLimit(uid);

      // Validate user profile data
      validateUserProfile(data);

      const sanitizedData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );

      await firestore
        .collection("users")
        .doc(uid)
        .update({
          ...sanitizedData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        success: true,
      };
    } catch (error) {
      logger.error("Error updating user profile", error);
      throw handleValidationError(error);
    }
  }
);

export const generatePrivateDocumentFileUploadUrl = onCall(
  {region: "us-east1", maxInstances: 1},
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }

    const {auth, data} = request;

    try {
      // Check rate limit
      await checkRateLimit(auth.uid);

      // Validate file upload request
      validateFileUploadRequest(data.fileExtension, data.contentType, 'pdf');

      const bucket = storage.bucket(privateDocumentsBucket);

      // Generate a secure file name
      const fileName = generateSecureFileName(auth.uid, `${Date.now()}.${data.fileExtension}`);

      const [url] = await bucket.file(fileName).getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + 15 * 60 * 1000,
        contentType: data.contentType,
      });

      return {
        url,
        fileName,
        maxFileSize: getMaxFileSize('pdf')
      };
    } catch (error) {
      logger.error("Error generating upload URL", error);
      throw handleValidationError(error);
    }
  }
);

// export const generateProfilePicturesFileUploadUrl = onCall(
//   {region: "us-east1", maxInstances: 1}, // Specify the region
//   async (request) => {
//     if (!request.auth) {
//       throw new functions.https.HttpsError(
//         "failed-precondition",
//         "The function must be called while authenticated."
//       );
//     }

//     const {auth, data} = request;

//     const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];
//     if (!allowedExtensions.includes(data.fileExtension)) {
//       throw new functions.https.HttpsError(
//         "invalid-argument",
//         "Unsupported file extension."
//       );
//     }

//     const bucket = storage.bucket(profilePicturesBucket);

//     const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;
//     const [url] = await bucket.file(fileName).getSignedUrl({
//       version: "v4",
//       action: "write",
//       expires: Date.now() + 15 * 60 * 1000,
//       contentType: data.contentType,
//     });

//     return {url, fileName};
//   }
// );

export const generateUploadUrl = onCall(
  {region: "us-east1", maxInstances: 1},
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }

    const {auth, data} = request;
    const uid = auth.uid;

    try {
      // Check rate limit
      await checkRateLimit(uid);

      const userDoc = await firestore.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError("not-found", "User not found");
      }

      const accountType = userDoc.data()?.accountType;
      const bucket = storage.bucket(
        accountType === "applicant" ?
          rawApplicantVideoBucketName :
          rawStartupVideoBucketName
      );

      // Validate file upload request
      validateFileUploadRequest(data.fileExtension, data.contentType, 'video');

      // Generate a secure file name
      const fileName = generateSecureFileName(uid, `${accountType}-${Date.now()}.${data.fileExtension}`);

      const [url] = await bucket.file(fileName).getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + 15 * 60 * 1000,
        contentType: data.contentType,
      });

      return {
        url,
        fileName,
        maxFileSize: getMaxFileSize('video')
      };
    } catch (error) {
      logger.error("Error generating upload URL", error);
      throw handleValidationError(error);
    }
  }
);

export const getVideos = onCall(
  {region: "us-east1", maxInstances: 1, invoker: ["firebaseauthusers"]},
  async (req) => {
    const {auth, data} = req;
    const uid = auth?.uid;
    const videoTypeData = data?.videoType;

    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign in first.");
    }

    try {
      // Check rate limit
      await checkRateLimit(uid);

      validateVideoData(data);

      const queryRef = firestore
        .collection(videoCollectionId)
        .where("videoType", "==", `${videoTypeData}`)
        .where("moderation", "==", "clean")
        .orderBy("createdAt", "asc")
        .limit(50);

      const snapshot = await queryRef.get();
      const videos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {videos};
    } catch (error) {
      logger.error("Error fetching videos", error);
      throw handleValidationError(error);
    }
  }
);

export const likeVideos = onCall(
  {region: "us-east1", maxInstances: 1},
  async (req) => {
    const {auth, data} = req;

    if (!auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in"
      );
    }

    const userUid = auth.uid;
    const likedVideoUid = data.uid;

    // Check if the user exists

    const userDoc = await firestore.collection("users").doc(userUid).get();
    const likedUserDoc = await firestore
      .collection("users")
      .doc(likedVideoUid)
      .get();
    if (!userDoc.exists || !likedUserDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User not found");
    }

    // Check the two users liked list
    // If matched already return right here

    const userData = await userDoc.data();
    const likedUserData = await likedUserDoc.data();

    if (userData?.likes.includes(likedVideoUid)) {
      throw new functions.https.HttpsError("already-exists", "Already liked");
    } else {
      // Adds the other uid to the
      await userDoc.ref.update({
        likes: admin.firestore.FieldValue.arrayUnion(likedVideoUid),
      });
    }

    if (likedUserData?.likes?.includes(userUid)) {
      // Add to matches
      await userDoc.ref.update({
        matches: admin.firestore.FieldValue.arrayUnion(likedVideoUid),
      });
      await likedUserDoc.ref.update({
        matches: admin.firestore.FieldValue.arrayUnion(userUid),
      });
      return {matched: true};
    }

    return {matched: false};
  }
);

export const getUsersByIds = onCall(
  {region: "us-east1", maxInstances: 1, invoker: ["firebaseauthusers"]},
  async (request) => {
    const {ids} = request.data;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "IDs must be a non-empty array."
      );
    }

    const usersSnapshot = await firestore.getAll(
      ...ids.map((id) => firestore.doc(`users/${id}`))
    );
    return usersSnapshot.map((docSnap) => ({
      uid: docSnap.id,
      ...docSnap.data(),
    }));
  }
);
