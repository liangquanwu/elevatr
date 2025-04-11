"use client"

import { onAuthStateChangedHelper } from "./utilities/firebase/firebase";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import SignIn from "./navbar/sign-in";



export default function Home() {

    const [user, setUser] = useState<User | null>(null);
  
    // call this once
    useEffect(() => {
      const unsubscribe = onAuthStateChangedHelper((user) => {
        setUser(user);
      });
  
      // clean up the subscription on unmount
      return () => unsubscribe();
    });

  return (
    <main className="w-screen h-screen bg-gradient-to-br from-[#1E2122] to-[#111314] text-white flex items-center justify-center px-4">
      <section className="text-center max-w-xl animate-fadeIn">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          Welcome to <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Elevatr</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Connect with startups or applicants through short, powerful elevator pitch videos.
        </p>
        <SignIn user={user} />
      </section>
      </main>
  );
}

