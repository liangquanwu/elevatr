"use client";

import { Fragment } from "react";
import { signInWithGoogle } from "../utilities/firebase/firebase";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { useEffect } from "react"; 

interface SignInProps {
  user: User | null;
}

export default function SignIn({ user }: SignInProps) {
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user?.metadata.creationTime === user?.metadata.lastSignInTime) {
        router.push("/account-setup");
      }
      else {
        router.push("/dashboard");
      }    
    }
  }, [user, router])


  const handleSignIn = async () => {
    await signInWithGoogle();
  };
  
  return (
    <Fragment>
      {!user && (
        <button className="px-6 py-3 text-base md:text-lg font-medium bg-white text-black rounded-xl " onClick={handleSignIn}>
          Sign in with Google
        </button>
      )}
    </Fragment>
  );
}
