"use client";

import { Fragment } from "react";
import { signInWithGoogle } from "../utilities/firebase/firebase";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { useEffect } from "react";
import { getUser } from "../utilities/firebase/functions";

interface SignInProps {
  user: User | null;
}

interface UserProps {
  uid: string;
  email: string;
  displayName: string;
  bio: string;
  website: string;
  accountType: string;
  profilePicture: string;
  resume: string;
  updatedAt: string;
}

export default function SignIn({ user }: SignInProps) {
  const router = useRouter();

  useEffect(() => {
    const handleUser = async () => {
      if (!user) {
        return;
      }
      console.log(user);
      const result = await getUser(user?.uid);
      const userData = result.data as UserProps;
      if (userData?.accountType) {
        router.push("/home");
      } else {
        router.push("/account-setup");
      }
    };
    handleUser();
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
    </Fragment>
  );
}
