"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import  Upload  from "../upload/upload";
import Navbar from "../navbar/navbar";

export default function HomePage() {

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

        {/* Past Uploads Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Past Uploads</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((video) => (
              <Card key={video} className="hover:shadow-md transition">
                <CardContent className="p-4">
                  <video
                    className="w-full h-48 object-cover rounded-lg"
                    controls
                    src={`https://placehold.co/400x300?text=Video+${video}`}
                  />
                  <div className="mt-2 text-sm text-gray-600">Video {video}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Matches Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Startup A", "Applicant B", "Startup C"].map((match, idx) => (
              <Card key={idx} className="hover:shadow-md transition">
                <CardContent className="p-4">
                  <div className="text-lg font-medium">{match}</div>
                  <div className="text-sm text-gray-500">Matched recently</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
