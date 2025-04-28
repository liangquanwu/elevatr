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
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleUser = async () => {
      if (!user) {
        return;
      }

      setIsCreating(true);
      let attempts = 0;
      let userData: UserProps | null = null;
      const maxAttempts = 5;
      const retryDelay = 2000;

      while (attempts < maxAttempts) {
        const result = await getUser(user.uid);
        if (result?.data) {
          userData = result.data as UserProps;
          setIsCreating(false);
          break;
        }
        attempts++;
        setRetryCount(attempts);
        await new Promise((res) => setTimeout(res, retryDelay));
      }

      if (userData?.accountType) {
        router.push(`/user/${userData.uid}`);
      } else if (userData) {
        router.push("/account-setup");
      } else {
        // Only force reload once per session to avoid infinite loop
        if (!sessionStorage.getItem("elevatrReloaded")) {
          sessionStorage.setItem("elevatrReloaded", "true");
          window.location.reload();
        } else {
          setError("Unable to load user data. Please try again.");
          setIsCreating(false);
        }
      }
    };
    handleUser();
  }, [user, router]);

  const handleSignIn = async () => {
    await signInWithGoogle();
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
          Setting up your account… please wait ⏳
          {retryCount > 2 && <div>(This can take a few seconds for new accounts)</div>}
        </div>
      )}
      {error && (
        <div className="mt-4 text-center text-red-600 text-sm">
          {error}
          <button onClick={() => window.location.reload()} className="ml-2 underline text-blue-600">Try Again</button>
        </div>
      )}
    </Fragment>
  );
}
