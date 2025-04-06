import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";
import dotenv from "dotenv";

dotenv.config();

admin.initializeApp();

const firestore = admin.firestore();
const storage = new Storage();

// Good place to implement name into env file
const rawVideoBucketName = process.env.RAW_VIDEO_BUCKET!;

export const createUser = functions
  .region("us-east1")
  .auth.user()
  .onCreate((user) => {
    const userInfo = {
      uid: user.uid,
      email: user.email,
      photoUrl: user.photoURL,
    };
    logger.info(`User Created: ${JSON.stringify(userInfo)}`);

    return firestore.collection("users").doc(user.uid).set(userInfo);
  });

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
