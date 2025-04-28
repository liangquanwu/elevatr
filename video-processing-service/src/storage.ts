// Google Cloud Storage file interactions
// Local file interactions

import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import * as dotenv from 'dotenv';

dotenv.config();

const storage = new Storage();

// Environment variables for bucket names
const rawApplicantVideoBucketName = process.env.RAW_APPLICANT_VIDEO_BUCKET || 'elevatr-applicant-raw-videos';
const rawStartupVideoBucketName = process.env.RAW_STARTUP_VIDEO_BUCKET || 'elevatr-startup-raw-videos';
const processedApplicantVideoBucketName = process.env.PROCESSED_APPLICANT_VIDEO_BUCKET || 'elevatr-applicant-processed-videos';
const processedStartupVideoBucketName = process.env.PROCESSED_STARTUP_VIDEO_BUCKET || 'elevatr-startup-processed-videos';

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = process.env.LOCAL_PROCESSED_VIDEO_PATH || './processed-videos';

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
    });
    console.log(`gs://${accountType === "applicant" ? processedApplicantVideoBucketName : processedStartupVideoBucketName}/${fileName} uploaded to ${localProcessedVideoPath}/${fileName}`);
    // Any one with a link can view this file without authentication
    await bucket.file(fileName).makePublic();
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