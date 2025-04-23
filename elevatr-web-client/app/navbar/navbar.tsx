"use client";

import {
  UploadCloud,
  Settings,
  Home,
  ListVideo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { onAuthStateChangedHelper } from "../utilities/firebase/firebase";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  // call this once
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      if (!user) {
        router.push("/");
      } else {
        setUser(user);
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <nav className="flex items-center justify-between p-4 border-b shadow-sm">
      <div className="text-xl font-bold flex items-center gap-2">
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            Elevatr
          </span>
        </h1>{" "}
      </div>
      <div className="flex gap-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => router.push(`/user/${user?.uid}`)}
        >
          <Home className="h-4 w-4" onClick={() => router.push(`/user/${user?.uid}`)} /> Home
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => router.push("/upload-page")}
        >
          <UploadCloud className="h-4 w-4" onClick={() => router.push("/upload-page")} /> Upload
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => router.push("/swipe")}
        >
          <ListVideo
            className="h-4 w-4"
            onClick={() => router.push("/swipe")}
          />{" "}
          Swipe
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => router.push("/settings")}
        >
          <Settings className="h-4 w-4" /> Settings
        </Button>
      </div>
    </nav>
  );
}
