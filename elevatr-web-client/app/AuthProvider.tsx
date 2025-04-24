// src/app/AuthProvider.tsx
"use client";

import {
  onAuthStateChangedHelper,
} from "./utilities/firebase/firebase";
import { getUser } from "./utilities/firebase/functions";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "firebase/auth";

interface ProfileDoc {
  accountType?: string;  // undefined ⇒ needs onboarding
  uid: string;
}

type AuthCtx = {
  fbUser: User | null;
  profile: ProfileDoc | null;
  loading: boolean;
};

const AuthContext = createContext<AuthCtx>({
  fbUser: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [fbUser, setFbUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileDoc | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router   = useRouter();
  

  useEffect(() => {
    const unsub = onAuthStateChangedHelper(async (user) => {
      setFbUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
        // If they’re on a protected route, kick them to /signin
        if (pathname?.startsWith("/upload")    ||
            pathname?.startsWith("/swipe")     ||
            pathname?.startsWith("/account-setup") ||
            pathname?.startsWith("/user")) {
          router.replace("/signin");
        }
        return;
      }

      // fetch Firestore doc
      const snap = await getUser(user.uid);
      while (!snap) {
        const snap = await getUser(user.uid);
      }
      const doc: ProfileDoc = snap.data ? (snap.data as ProfileDoc) : { uid: user.uid };
      setProfile(doc as ProfileDoc);
      setLoading(false);

      // Routing rules --------------------------------
      if (!doc.accountType && !pathname.startsWith("/account-setup")) {
        router.replace("/account-setup");
        return;
      }
      if (doc.accountType && pathname === "/account-setup") {
        router.replace(`/user/${user.uid}`);
        return;
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ fbUser, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);