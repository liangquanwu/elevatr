"use client";

import React, { useState } from "react";
import Upload from "../upload/upload";
import Navbar from "../../shared-components/navbar/navbar";
import { uploadVideo } from "../../utilities/firebase/functions";
import { toast } from "sonner"; 

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      setLoading(true);
      const response = await uploadVideo(file);
      toast.success("Video uploaded successfully!");
      console.log(response);
    } catch (error) {
      toast.error("Failed to upload video");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 p-6 grid grid-rows-[auto_1fr_auto] gap-8">
        <section
          className={`border-4 ${dragActive ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50"} border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-6 shadow-inner transition`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p className="text-xl font-medium text-gray-600">
            Drag & drop your video file here
          </p>
          <p className="text-sm text-gray-500">or</p>
          <Upload onUpload={handleUpload} loading={loading} />
        </section>
      </main>
    </div>
  );
}
