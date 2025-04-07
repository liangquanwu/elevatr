import {httpsCallable} from "firebase/functions";
import {functions} from "./firebase";

const generateUploadUrl = httpsCallable<{ fileExtension: string }, { url: string }>(functions, "generateUploadUrl");
const getVideosCallable = httpsCallable(functions, "getVideos");

export interface Video {
  id?: string;
  uid?: string;
  filename?: string;
  status?: "processing" | "processed";
  title?: string;
  description?: string;
}


export async function uploadVideo(file: File) {
  const response = await generateUploadUrl({
    fileExtension: file.name.split(".").pop() || "",
  });

  // Upload the file via the signed URL
  // Also add the headers
  await fetch(response?.data?.url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  return;
}

export async function getVideos() {
  const response = await getVideosCallable();
  return response.data as Video[];
}
