"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./navbar.module.css";
import SignIn from "./sign-in";
import { onAuthStateChangedHelper } from "../utilities/firebase/firebase";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import Upload from "./upload";

export default function Navbar() {
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
    <nav className={styles.nav}>
      <Link href="/" className={styles.logoContainer}>
        <Image
          width={90}
          height={20}
          src="/youtube-logo.svg"
          alt="YouTube Logo"
        />
      </Link>
      {
        user && <Upload />
      }
      <SignIn user={user} />
    </nav>
  );
}
