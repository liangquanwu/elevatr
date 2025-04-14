"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "../utilities/firebase/firebase";
import { onAuthStateChangedHelper } from "../utilities/firebase/firebase";
import { User } from "firebase/auth";

export default function Dashboard() {
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

  return (
    // <Navbaraz></Navbar>
    <main className="w-screen h-screen bg-gradient-to-br from-[#1E2122] to-[#111314] text-white flex items-center justify-center px-4">
      <h1 className="text-4xl">🚀 Welcome to your dashboard, {user?.displayName || "User"}!</h1>
      <button onClick={signOut} className="w-[300] bg-white">Log Out</button>
    </main>
  );
}