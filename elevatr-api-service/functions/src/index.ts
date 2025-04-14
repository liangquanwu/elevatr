import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";

admin.initializeApp();

const firestore = admin.firestore();
const storage = new Storage();

// Good place to implement name into env file
const privateDocumentsBucket = "elevatr-private-documents";
const profilePicturesBucket = "elevatr-profile-pictures";
const rawVideoBucketName = "elevatr-raw-videos";

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
    };
    logger.info(`User Created: ${JSON.stringify(userInfo)}`);

    return firestore.collection("users").doc(user.uid).set(userInfo);
  });

export const getUser = onCall(
  {region: "us-east1", maxInstances: 1}, // Specify the region
  async (request) => {
    const {auth} = request;
    if (!auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "you must be signed in"
      );
    }
    const uid = auth.uid;
    const userDoc = await firestore.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User not found");
    } else {
      console.log("Return data");
      return userDoc.data();
    }
  }
);

export const patchUser = onCall(
  {region: "us-east1", maxInstances: 1}, // Specify the region
  async (request) => {
    const {auth, data} = request;
    if (!auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in"
      );
    }
    const uid = auth.uid;

    const sanitizedData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    try {
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
      throw new functions.https.HttpsError(
        "internal",
        "Error updating user profile"
      );
    }
  }
);

export const generatePrivateDocumentFileUploadUrl = onCall(
  {region: "us-east1", maxInstances: 1}, // Specify the region
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }

    const {auth, data} = request;

    const allowedExtensions = ["pdf"];
    if (!allowedExtensions.includes(data.fileExtension)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Unsupported file extension."
      );
    }

    const bucket = storage.bucket(privateDocumentsBucket);

    const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;
    const [url] = await bucket.file(fileName).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType: data.contentType,
    });

    return {url, fileName};
  }
);

export const generateProfilePicturesFileUploadUrl = onCall(
  {region: "us-east1", maxInstances: 1}, // Specify the region
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }

    const {auth, data} = request;

    const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];
    if (!allowedExtensions.includes(data.fileExtension)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Unsupported file extension."
      );
    }

    const bucket = storage.bucket(profilePicturesBucket);

    const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;
    const [url] = await bucket.file(fileName).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType: data.contentType,
    });

    return {url, fileName};
  }
);

export const generateUploadUrl = onCall(
  {region: "us-east1", maxInstances: 1}, // Specify the region
  async (request) => {
    // Check if user is authenticated
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }

    const {auth, data} = request;
    const bucket = storage.bucket(rawVideoBucketName);

    // Generate a unique file name
    const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;

    // Get a v4 signed URL for uploading a file
    const [url] = await bucket.file(fileName).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
    });
    return {url, fileName};
  }
);

export const getVideos = onCall(
  {region: "us-east1", maxInstances: 1, invoker: ["public"]},
  async () => {
    const snapshot = await firestore
      .collection(videoCollectionId)
      .limit(10)
      .get();
    const videos = snapshot.docs.map((doc) => doc.data());
    return videos;
  }
);
