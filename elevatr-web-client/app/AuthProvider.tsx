"use client";

import {
  onAuthStateChangedHelper,
} from "./utilities/firebase/firebase";
import { getUser } from "./utilities/firebase/functions";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "firebase/auth";

interface ProfileDoc {
  accountType?: string;  
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
      let snap = await getUser(user.uid);  
      let retryCount = 0;  
      const maxRetries = 5;  
      while (!snap && retryCount < maxRetries) {  
        retryCount++;  
        snap = await getUser(user.uid);  
      }  
      if (!snap) {  
        console.error("Failed to fetch user data after maximum retries.");  
        setProfile(null);  
        setLoading(false);  
        return;  
      }  
      const doc: ProfileDoc = snap.data ? (snap.data as ProfileDoc) : { uid: user.uid };
      setProfile(doc as ProfileDoc);
      setLoading(false);

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
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ fbUser, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);