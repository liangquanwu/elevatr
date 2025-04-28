"use client";

import { useRouter } from "next/navigation";
import { signOut } from "../../utilities/firebase/firebase";
import { onAuthStateChangedHelper } from "../../utilities/firebase/firebase";
import { User } from "firebase/auth";
import { useState, useEffect } from "react";
import Navbar from "../../shared-components/navbar/navbar";

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
      <div className="flex flex-col items-center justify-center text-center h-screen">
        <h1 className="text-2xl font-bold">See you next time!</h1>
        <p className="text-gray-600 mt-2 max-w-md">
          You put in a lot of effort to make this work. We appreciate your time
          and effort. We are always here to help you with your journey to find
          your best fit.
        </p>
        <button
          onClick={signOut}
          className="w-[100px] bg-black text-white border border-white py-2 rounded hover:bg-gray-900 transition mt-5"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
