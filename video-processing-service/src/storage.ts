// Google Cloud Storage file interactions
// Local file interactions

import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import dotenv from "dotenv";

dotenv.config();

const storage = new Storage();

// google cloud storage bucket strings has to be globally unique

// Download from this bucket
// const rawVideoBucketName = process.env.RAW_VIDEO_BUCKET!;
const rawStartupVideoBucketName = "elevatr-startup-raw-videos";
const rawApplicantVideoBucketName = "elevatr-applicant-raw-videos";
const processedStartupVideoBucketName = "elevatr-startup-processed-videos";
const processedApplicantVideoBucketName = "elevatr-applicant-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

// Creates local directory within docker container for the raw files and processes files
export function setupDirectories() {
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}

/**
 * Converts a raw video to a processed format.
 *
 * @param {string} rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param {string} processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}.
 * @returns {Promise<void>} A promise that resolves when the video has been converted.
 */

export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-2:1080") // Scale the video to 360p
        .on("end", () => {
            console.log("Processing finished successfully")
            resolve();
        })
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`)
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`)
    });
}

/**
 * Converts a raw video to a processed format.
 *
 * @param fileName - The name of the file to download from the 
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder. 
 * @returns A promise that resolves when the file has been promised
 */


export async function downloadRawVideo(fileName: string, accountType: string) {
    await storage.bucket(accountType === "applicant" ? rawApplicantVideoBucketName : rawStartupVideoBucketName)
        .file(fileName)
        .download({destination: `${localRawVideoPath}/${fileName}`})

    console.log(`gs://${accountType === "applicant" ? rawApplicantVideoBucketName : rawStartupVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to upload from the 
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */

export async function uploadProcessedVideo(fileName: string, accountType: string) {
    const bucket = storage.bucket(accountType === "applicant" ? processedApplicantVideoBucketName : processedStartupVideoBucketName);
    await storage.bucket(accountType === "applicant" ? processedApplicantVideoBucketName : processedStartupVideoBucketName).upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    })
    console.log(`gs://${accountType === "applicant" ? processedApplicantVideoBucketName : processedStartupVideoBucketName}/${fileName} uploaded to ${localProcessedVideoPath}/${fileName}`);
    // Any one with a link can view this file without authentication
    await bucket.file(fileName).makePublic();
    // see what else we need to add here for authentication
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 * 
 */

export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`)
}

/**
* @param fileName - The name of the file to delete from the
* {@link localProcessedVideoPath} folder.
* @returns A promise that resolves when the file has been deleted.
* 
*/

export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`)
}

/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */


function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Failed to delete path at ${filePath}`, err)
                    reject();
                } else {
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            })
        } else {
            console.log(`File not found at ${filePath}, skipping the delete.`)
            resolve();
        }
    }) 
}

function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true});
        console.log(`Directory created at ${dirPath}`)
    }
}