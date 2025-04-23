"use client";

import { useRouter } from "next/navigation";
import { signOut } from "../utilities/firebase/firebase";
import { onAuthStateChangedHelper } from "../utilities/firebase/firebase";
import { User } from "firebase/auth";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Navbar from "../navbar/navbar";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState("larrywu");
  const [email, setEmail] = useState("larrywu@email.com");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      if (!user) {
        router.push("/"); // redirect if not signed in
      } else {
        setUser(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">Checking credentials...</p>
      </main>
    );
  }

  const handleSave = () => {
    console.log("Settings updated:", {
      username,
      email,
      emailNotifications,
      darkMode,
    });
  };

  return (
    <div>
      <Navbar />
      <button
          onClick={signOut}
          className="w-[100px] bg-black text-white border border-white py-2 rounded hover:bg-gray-900 transition align-self-end"
        >
          Log Out
        </button>{" "}
    </div>
  );
}
