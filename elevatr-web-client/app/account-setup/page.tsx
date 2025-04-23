"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChangedHelper } from "../utilities/firebase/firebase";
import { User } from "firebase/auth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { patchUser, uploadPrivateDocument } from "../utilities/firebase/functions";

interface UserProps {
  uid: string,
  email: string,
  lastSeenIndex?: number,
  displayName: string,
  bio?: string,
  websiteUrl?: string,
  accountType: string,
  profilePictureUrl?: string,
  resume?: string,
  updatedAt: string,
  likes: string[]
  matches: string[],
}

interface UploadFileProps {
  infoFile: File | null,
}

export default function AccountSetup() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [accountType, setAccountType] = useState("applicant");
  const [displayName, setDisplayName] = useState("");
  const [infoFile, setInfoFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [bio, setBio] = useState("");

  const router = useRouter();

  const handleUpdateUser = async (user: UserProps) => {
    const userData: UserProps = {
      uid: user.uid,
      email: user.email || "",
      lastSeenIndex: user.lastSeenIndex || 0,
      displayName: user.displayName || "",
      bio: user.bio || "",
      websiteUrl: user.websiteUrl || "",
      accountType: user.accountType || "",
      resume: user.resume || "",
      likes: user.likes || [],
      matches: user.matches || [],
      updatedAt: new Date().toISOString(),
      profilePictureUrl: user.profilePictureUrl,
    };

    await patchUser(userData);
  };

  const handleUploadFiles = async (files: UploadFileProps) => {
    if (files.infoFile) {
      await uploadPrivateDocument(files.infoFile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      if (!user) {
        router.push("/");
      } else {
        setUser(user);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center">
        <p className="text-xl">Checking credentials...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 text-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-lg space-y-6">
        <h2 className="text-2xl font-bold">Tell Us About Yourself</h2>

        <div className="space-y-1">
          <Label>Account Type *</Label>
          <RadioGroup defaultValue="applicant" onValueChange={setAccountType} className="flex gap-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="applicant" id="applicant" className="accent-blue-600" />
              <Label htmlFor="applicant">Applicant</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="startup" id="startup" className="accent-blue-600" />
              <Label htmlFor="startup">Start Up</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-1">
          <Label>Display Name *</Label>
          <Input
            type="text"
            placeholder={accountType === "applicant" ? "Enter your display name (Required)" : "Enter your start up name (Required)"}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label>{accountType === "applicant" ? "Resume (Optional)" : "Pitch Deck/Info (Optional)"}</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setInfoFile(e.target.files[0])}
            className="file:text-black file:border file:border-gray-400 file:px-1 file:rounded"
          />
        </div>

        <div className="space-y-1">
          <Label>Website or Portfolio (Optional)</Label>
          <Input
            type="text"
            placeholder="Website or Portfolio (Optional)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label>Short Bio (Optional)</Label>
          <Textarea
            placeholder="Short bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button
            className="mt-4"
            onClick={() => {
              console.log("profile Picture URL", user?.photoURL);
              try {
                handleUpdateUser({
                  displayName,
                  accountType,
                  bio,
                  websiteUrl: url,
                  resume: infoFile?.name,
                  uid: user?.uid || "",
                  email: user?.email || "",
                  lastSeenIndex: 0,
                  profilePictureUrl: user?.photoURL || "",
                } as UserProps);
                handleUploadFiles({ infoFile });
                router.push(`/user/${user?.uid}`);
              } catch (error) {
                console.error(error);
              }
            }}
          >
            Finish
          </Button>
        </div>
      </div>
    </main>
  );
}