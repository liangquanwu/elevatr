import {getFunctions, httpsCallable} from 'firebase/functions';
import {getApp, getApps, initializeApp} from 'firebase/app';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
    appId: process.env.NEXT_PUBLIC_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID!,
};
  
// gurantees app is initialized only once
if (getApps().length === 0) {
    initializeApp(firebaseConfig);
}
const functions = getFunctions(getApp(), 'us-east1');

export const getUser = httpsCallable(functions, 'getUser')
export const createUser = httpsCallable(functions, 'createUser')
export const patchUser = httpsCallable(functions, 'patchUser')
export const generateUploadUrl = httpsCallable(functions, 'generateUploadUrl')
export const getVideos = httpsCallable(functions, 'getVideos')
export const likeVideo = httpsCallable(functions, 'likeVideos')
export const getUsersByIds = httpsCallable(functions, 'getUsersByIds')

interface UploadUrlResponse {
    data: {
        url: string;
    };
}

export async function uploadVideo(file: File) {
    const response = await generateUploadUrl({
        fileExtension: file.name.split('.').pop()
    }) as UploadUrlResponse

    await fetch(response?.data?.url, {
        method: "PUT",
        body: file,
        headers: {
            'Content-Type': file.type
        }
    });

    return;
}


