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

export default function AccountSetup() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [accountType, setAccountType] = useState("applicant");
  const [displayName, setDisplayName] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [infoFile, setInfoFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [bio, setBio] = useState("");

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      if (!user) {
        router.push("/"); // redirect if not signed in
      } else {
        setUser(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">Checking credentials...</p>
      </main>
    );
  }

  return (
    <main className="w-screen h-screen bg-gradient-to-br from-[#1E2122] to-[#111314] text-white flex items-center justify-center px-4">
      <div className="items-center justify-center bg-[#2E3235] h-[650px] w-[450px] rounded-xl">
        <h2 className="text-2xl font-bold p-5">Tell Us About Yourself</h2>
        <div className="space-y-1 pl-5 pr-5 pb-3">
          <Label>Account Type *</Label>
          <RadioGroup
            className="flex p-3 gap-30"
            defaultValue="applicant"
            onValueChange={(value) => {
              setAccountType(value);
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="applicant"
                id="applicant"
                className="accent-transparent bg-white checked:bg-white checked:border-white"
              />
              <Label htmlFor="applicant">Applicant</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="startup"
                id="startup"
                className="accent-transparent bg-white checked:bg-white checked:border-white"
              />
              <Label htmlFor="startup">Start Up</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-1 pl-5 pr-5 pb-3">
          <Label className="pb-3">Display Name *</Label>
          {accountType === "applicant" ? (
            <Input
              type="text"
              placeholder="Enter your display name (Required)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-[#2E3235] text-white border border-gray-600 focus:border-white focus:ring-0"
            />
          ) : (
            <Input
              type="text"
              placeholder="Enter your start up name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-[#2E3235] text-white border border-gray-600 focus:border-white focus:ring-0"
            />
          )}
        </div>
        <div className="space-y-1 pl-5 pr-5 pb-3">
          <Label className="pb-1">Profile Picture *</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) setProfilePicture(e.target.files[0]);
            }}
            className="file:text-white border-0 file:border file:border-white file:px-4  file:rounded "
          />
        </div>
        <div className="space-y-1 pl-5 pr-5 pb-3">
          {accountType === "applicant" ? (
            <Label className="pb-1">Resume (Optional)</Label>
          ) : (
            <Label className="pb-1">Pitch Deck/Info (Optional)</Label>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) setInfoFile(e.target.files[0]);
            }}
            className="file:text-white border-0 file:border file:border-white file:px-4  file:rounded "
          />
        </div>
        <div className="space-y-1 pl-5 pr-5 pb-3">
          <Label className="pb-3">Website or Portfolio (Optional)</Label>
          <Input
            type="text"
            placeholder="Website or Portfolio (Optional)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-[#2E3235] text-white border border-gray-600 focus:border-white focus:ring-0"
          />
        </div>
        <div className="space-y-1 pl-5 pr-5 pb-3">
          <Label className="pb-3">Short Bio (Optional)</Label>
          <Textarea
            placeholder="Short bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="bg-[#2E3235] text-white border border-gray-600 focus:border-white focus:ring-0 h-30"
          />
        </div>
        <div className="flex justify-end">
           {/* Once user presses finish, we will patch (update) their datastore profile and also upload the files to the storage buckets */}
          <Button className="mr-5 cursor-pointer" onClick={() => router.push("/dashboard")}>Finish</Button>
        </div>
      </div>
    </main>
  );
}
