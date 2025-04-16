"use client";

import Navbar from "../navbar/navbar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { getVideos, getUser, patchUser } from "../utilities/firebase/functions";
import { onAuthStateChangedHelper } from "../utilities/firebase/firebase";
import { User } from "firebase/auth";

interface UserProps {
  uid: string,
  email: string,
  lastSeenIndex?: number,
  displayName: string,
  bio?: string,
  websiteUrl?: string,
  accountType: string,
  profilePictureUrl?: string,
  resume?: string,
  updatedAt: string,
}

interface VideoProps {
  id: string,
  uid: string,
  videoType: string,
  filename: string,
  status: 'processing' | 'processed',
  title: string,
  description: string
}

export default function SwipePage() {
  
  const [videos, setVideos] = useState([]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  const [accountType, setAccountType] = useState("applicant");

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) return;
      const account = await getUser(user.uid) as unknown as UserProps;
      setIndex(account.data.lastSeenIndex || 0);
      const vids = await getVideos({accountType: account.accountType === "startup" ? "applicant" : "startup"});
      const processedVideos = Object.values(vids.data.videos).filter((vid) => {
        return vid.status == "processed";
      })
      setVideos(processedVideos);
    };

  fetchVideos();

  }, [user]);

  const handleSwipe = async (dir) => {
    if (videos && index >= videos.length) return console.log("No more videos")


    if (dir === "right") {
      // this means they swiped right

      
    }


    await patchUser({
      lastSeenIndex: index + 1
    })

    setDirection(dir);
    setTimeout(() => {
      setIndex((prev) => prev + 1);
      setDirection(null);
    }, 300);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });
  
  const currentVideo = videos[index];

  return (
    <div>
      <Navbar />
      <main className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-white to-gray-100 text-black">
        {index >= videos.length ? (
          <div className="flex flex-col items-center justify-center h-screen p-4">
            <h1 className="text-xl font-semibold text-gray-600">
              🎉 No more videos to watch
            </h1>
            <Button className="mt-4" onClick={() => setIndex(0)}>
              Restart
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-screen p-4">
            <AnimatePresence>
              {currentVideo && (
                <motion.div
                  key={currentVideo.id}
                  {...swipeHandlers}
                  initial={{ opacity: 0, x: direction === "left" ? 100 : -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction === "left" ? -100 : 100 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-md"
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <video
                        src={`https://storage.googleapis.com/elevatr-${accountType}-processed-videos/${currentVideo.filename}`}
                        controls
                        autoPlay
                        className="w-full h-[500px] object-cover"
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
  
            <div className="flex gap-4 mt-4">
              <Button onClick={() => handleSwipe("left")}>Reject</Button>
              <Button onClick={() => handleSwipe("right")}>Like</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}