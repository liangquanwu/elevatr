"use client";

import { onAuthStateChangedHelper } from "../utilities/firebase/firebase";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import SignIn from "./signin/sign-in";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="w-screen h-screen bg-gradient-to-br from-white to-gray-100 text-black flex items-center justify-center px-4">
      <section className="text-center max-w-xl animate-fadeIn">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            Elevatr
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Connect with startups or applicants through short, powerful elevator
          pitch videos.
        </p>

        <SignIn user={user} />

        {/* --- gentle safety note --- */}
        <p className="mt-6 text-sm text-gray-500 max-w-md mx-auto">
         Please note that this is a demo application. Please use a test email to create an account. Watch quick runthrough of application on github README file
        </p>
      </section>
    </main>
  );
}