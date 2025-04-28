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
    const handleUser = async () => {
      if (!user) {
        return;
      }

      setIsCreating(true);
      let attempts = 0;
      let userData: UserProps | null = null;

      console.log("Check");

      while (attempts < 5) {
        const result = await getUser(user.uid);
        if (result?.data) {
          userData = result.data as UserProps;
          setIsCreating(false);
          break;
        }
        attempts++;
        await new Promise((res) => setTimeout(res, 2000));
      }

      if (userData?.accountType) {
        router.push(`/user/${userData.uid}`);
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
        <div className="flex flex-col items-center space-y-2">
          <button
            className="px-6 py-3 text-base md:text-lg font-medium bg-white text-black border border-gray-300 hover:border-gray-400 rounded-xl shadow-sm"
            onClick={handleSignIn}
          >
            Sign in with Google
          </button>
          <p className="text-xs text-gray-500 max-w-xs text-center">
            Tip: Use a dummy Google account while we're in early testing! (You
            can check a YouTube video linked in the GitHub README for a quick
            runthrough.)
          </p>
        </div>
      )}
      {isCreating && (
        <div className="mt-4 text-center text-gray-600 text-sm">
          Loading details… please wait ⏳
        </div>
      )}
    </Fragment>
  );
}
