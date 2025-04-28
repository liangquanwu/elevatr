"use client";

import { Fragment } from "react";
import { signInWithGoogle } from "../../utilities/firebase/firebase";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { getUser } from "../../utilities/firebase/functions";

interface SignInProps {
  user: User | null;
}

interface UserProps {
  uid: string;
  email: string;
  lastSeenIndex: number;
  displayName: string;
  bio: string;
  website: string;
  accountType: string;
  resume: string;
  updatedAt: string;
}

export default function SignIn({ user }: SignInProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
  
    const init = async () => {
      setIsCreating(true);
      try {
        await user.getIdToken(true);        
        const { data } = await getUser() as { data: UserProps };    
  
        if (data?.accountType) {
          router.push(`/user/${data.uid}`);
        } else {
          router.push("/account-setup");
        }
      } catch (err: unknown) {
        if ((err as { code?: string }).code === "functions/not-found") {
          router.push("/account-setup");
        } else {
          console.error(err);              
        }
      } finally {
        setIsCreating(false);
      }
    };
  
    init();
  }, [user, router]);

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <Fragment>
      {!user && (
        <button
          className="px-6 py-3 text-base md:text-lg font-medium bg-white text-black border border-gray-300 hover:border-gray-400 rounded-xl shadow-sm"
          onClick={handleSignIn}
        >
          Sign in with Google
        </button>
      )}
      {isCreating && (
        <div className="mt-4 text-center text-gray-600 text-sm">
          Loading account… please wait ⏳
        </div>
      )}
    </Fragment>
  );
}
