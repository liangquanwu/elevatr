"use client";

import React from "react";
import Upload from "../upload/upload";
import Navbar from "../../shared-components/navbar/navbar";

export default function UploadPage() {

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main content */}
      <main className="flex-1 p-6 grid grid-rows-[auto_1fr_auto] gap-8">
        {/* Upload Section */}
        <section className="border-4 border-dashed border-gray-300 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 bg-gray-50 shadow-inner">
          <p className="text-xl font-medium text-gray-600">Drag & drop your video file here</p>
          <p className="text-sm text-gray-500">or</p>
          <Upload></Upload>
        </section>
      </main>
    </div>
  );
}
