"use client";

import Navbar from "../../../shared-components/navbar/navbar";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUser, getUsersByIds } from "../../../utilities/firebase/functions";
import backgroundImage from "../../../../public/pexels-thatguycraig000-1574851.jpg";
import { User } from "firebase/auth";
import { useAuth } from "@/app/AuthProvider";

interface UserProps {
  uid: string;
  email: string;
  lastSeenIndex?: number;
  displayName: string;
  updatedAt: string;
  likes: string[];
  matches: string[];
  firstName?: string;
  lastName?: string;
  bio?: string;
  accountType: string;
  profilePictureUrl?: string;
  resume?: string;
  linkedinUsername?: string;
  githubUsername?: string;
}

export default function ProfilePage() {
  const { fbUser } = useAuth(); 
  const params = useParams();
  const uid = params?.uid as string;
  const router = useRouter();

  const [user] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProps | null>(null);
  const [matchData, setMatchData] = useState<UserProps[]>([]);

  useEffect(() => {
    const handleUser = async () => {
      if (!fbUser) {
        return;
      }
      console.log(uid)
      const result = await getUser({ uid: uid });
      console.log(result)
      setUserData(result.data as UserProps);
      if ((result.data as UserProps).matches.length !== 0) {
        const matchData = await getUsersByIds({
          ids: (result.data as UserProps).matches,
        });
        setMatchData(matchData.data as UserProps[]);
      }
    };
    handleUser();
  }, [user, router]);

  if (!fbUser || !userData) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full
                          border-4 border-gray-300 border-t-green-600" />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      {fbUser?.uid === uid && (
        <div className="flex flex items-center flex-col">
          <div className="w-[65vw]">
            <h1 className="text-xl mb-10 mt-5">Your Matches</h1>
            <div className="flex space-x-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
              {matchData.map((user) => (
                <div
                  className="flex-shrink-0 flex flex-col items-center w-[180px] hover:scale-105 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]       cursor-pointer   "
                  key={user.uid}
                  onClick={() => router.push(`/user/${user.uid}`)}
                >
                  <img
                    src={user?.profilePictureUrl}
                    alt="Matched User"
                    className="w-[155px] h-[155px] rounded-full object-cover shadow-md"
                  />
                  <h1 className="mt-2 font-medium">{user?.displayName}</h1>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="relative flex flex-col items-center h-screen rounded-lg z-0">
        <img
          src={backgroundImage.src}
          className="items-center h-[40vh] w-[65vw] mt-5 z-0"
        ></img>
        <div className="absolute top-42/100 left-[25vw] transform -translate-y-1/2 z-10 w-[155px] h-[155px] rounded-full object-cover flex flex-col items-center">
          <img
            src={userData?.profilePictureUrl}
            className="z-10 w-[155px] h-[155px] rounded-full object-cover"
          ></img>
          <h1 className="text-lg">{userData?.displayName}</h1>
        </div>
        <div className="border-2 border-gray-300 h-[40vh] w-[65vw] flex">
          <div className="mt-[15vh] p-[15px] w-[45vw]">
            <p>{userData?.bio}</p>
          </div>
          <div className="justify-end">
            <div className="w-[20vw] mt-5 flex flex-col gap-5">
              {userData?.linkedinUsername && (
                <div className="flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-linkedin-icon lucide-linkedin mr-2"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <p>{userData?.linkedinUsername}</p>
                </div>
              )}
              {userData?.githubUsername && (
                <div className="flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-github-icon lucide-github mr-2"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                  <p>{userData?.githubUsername}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
