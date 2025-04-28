"use client";

import { Fragment } from "react";
import { signInWithGoogle } from "../../utilities/firebase/firebase";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { getUser } from "../../utilities/firebase/functions";
import { logSecurityEvent, SecurityEventType } from "../../utilities/security/logger";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleUser = async () => {
      if (!user) {
        return;
      }

      setIsCreating(true);
      setError(null);
      let attempts = 0;
      const maxAttempts = 10;
      const retryDelay = 1000;

      try {
        while (attempts < maxAttempts) {
          const result = await getUser(user.uid);
          
          if (result?.data) {
            const userData = result.data as UserProps;
            setIsCreating(false);
            
            logSecurityEvent({
              type: SecurityEventType.AUTHENTICATION,
              userId: user.uid,
              details: { status: 'success', attempts }
            });

            if (userData.accountType) {
              router.push(`/user/${userData.uid}`);
            } else {
              router.push("/account-setup");
            }
            return;
          }

          attempts++;
          await new Promise((res) => setTimeout(res, retryDelay));
        }

        setError("Unable to load user data. Please try signing in again.");
        logSecurityEvent({
          type: SecurityEventType.ERROR,
          userId: user.uid,
          details: { 
            error: 'User data not found after max attempts',
            attempts: maxAttempts
          }
        });
      } catch (err) {
        setError("An error occurred. Please try again.");
        logSecurityEvent({
          type: SecurityEventType.ERROR,
          userId: user.uid,
          details: { 
            error: err instanceof Error ? err.message : 'Unknown error',
            attempts
          }
        });
      } finally {
        setIsCreating(false);
      }
    };

    handleUser();
  }, [user, router]);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      logSecurityEvent({
        type: SecurityEventType.ERROR,
        details: { 
          error: err instanceof Error ? err.message : 'Sign in failed'
        }
      });
    }
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
      {error && (
        <div className="mt-4 text-center text-red-600 text-sm">
          {error}
        </div>
      )}
    </Fragment>
  );
}
