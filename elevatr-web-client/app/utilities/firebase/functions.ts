import {getFunctions, httpsCallable} from 'firebase/functions';

import { getApp } from 'firebase/app';
const functions = getFunctions(getApp(), 'us-east1');

const generateUploadUrl = httpsCallable(functions, 'generateUploadUrl')

export async function uploadVideo(file: File) {
    const response: any = await generateUploadUrl({
        fileExtension: file.name.split('.').pop()
    })

    // Upload the file via the signed URL
    // Also add the headers
    await fetch(response?.data?.url, {
        method: "PUT",
        body: file,
        headers: {
            'Content-Type': file.type
        }
    });

    return;
}