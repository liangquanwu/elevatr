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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const functions = getFunctions(getApp(), 'us-east1');

const generateProfilePicturesFileUploadUrl = httpsCallable(functions, 'generateProfilePicturesFileUploadUrl')
const generatePrivateDocumentFileUploadUrl = httpsCallable(functions, 'generatePrivateDocumentFileUploadUrl')
export const getUser = httpsCallable(functions, 'getUser')
export const createUser = httpsCallable(functions, 'createUser')
export const patchUser = httpsCallable(functions, 'patchUser')
export const generateUploadUrl = httpsCallable(functions, 'generateUploadUrl')
export const getVideos = httpsCallable(functions, 'getVideos')


export async function uploadProfilePicture(file: File) {
    const response: any = await generateProfilePicturesFileUploadUrl({
        fileExtension: file.name.split('.').pop(),
        contentType: file.type
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

export async function uploadPrivateDocument(file: File) {
  const response: any = await generatePrivateDocumentFileUploadUrl({
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
