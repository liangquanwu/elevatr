"use client";

import Navbar from "../../shared-components/navbar/navbar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  getVideos,
  getUser,
  patchUser,
  likeVideo,
} from "../../utilities/firebase/functions";
import { onAuthStateChangedHelper } from "../../utilities/firebase/firebase";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 

interface UserProps {
  data: {
    uid: string;
    email: string;
    lastSeenIndex?: number;
    displayName: string;
    bio?: string;
    websiteUrl?: string;
    accountType: string;
    profilePictureUrl: string;
    resume?: string;
    updatedAt: string;
  }
}

interface VideoProps {
  data: {
    id: string;
    uid: string;
    videoType: string;
    filename: string;
    status: "processing" | "processed";
    title: string;
    description: string;
  }
}

interface VideoDataProps {
  id: string;
  uid: string;
  videoType: string;
  filename: string;
  status: "processing" | "processed";
  title: string;
  description: string;
}

interface matchProps {
  data: {
    matched: boolean;
  }
}


export default function SwipePage() {
  const [videos, setVideos] = useState<VideoDataProps[]>([]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<string | null>(null);
  const [accountType, setAccountType] = useState("applicant");

  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) return;
      const account = (await getUser(user.uid)) as unknown as UserProps;
      if (!account) {
        return;
      }
      setAccountType(account.data.accountType); // also update state if needed
      const vids = await getVideos({
        videoType:
          account.data.accountType === "startup" ? "applicant" : "startup",
      });
      const processedVideos = Object.values((vids.data as { videos: Record<string, VideoDataProps> }).videos).filter((vid) => {
        return vid.status == "processed";
      });
      setVideos(processedVideos);
    };

    fetchVideos();
  }, [user]);

  const handleSwipe = async (dir: string) => {
    if (videos && index >= videos.length) return console.log("No more videos");

    if (dir === "right") {
      // this means they swiped right
      // Check if we have liked this video before: if not (Add this video to our check)
      // Check if the other person has liked us before
      // If both liked each other add to the match fire store of each user and do some frontend thing.

      const result = (await likeVideo({
        uid: (videos[index] as VideoDataProps).uid,
      })) as unknown as matchProps;
      if (result?.data?.matched) {
        toast.success("🎉 You matched!", { duration: 2000 });
      }
      // we gotta make this work
    }

    await patchUser({
      lastSeenIndex: index + 1,
    });

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

  const currentVideo = videos[index] as VideoDataProps;

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
                        src={`https://storage.googleapis.com/elevatr-${
                          accountType === "startup" ? "applicant" : "startup"
                        }-processed-videos/${currentVideo.filename}`}
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
              <Button onClick={() => router.push(`/user/${currentVideo.uid}`)}>
                View Profile
              </Button>
              <Button onClick={() => handleSwipe("right")}>Like</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
