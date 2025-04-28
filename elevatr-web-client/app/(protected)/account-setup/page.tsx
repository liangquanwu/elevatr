"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChangedHelper } from "../../utilities/firebase/firebase";
import { User } from "firebase/auth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import {
  patchUser,
} from "../../utilities/firebase/functions";

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

export default function AccountSetup() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [accountType, setAccountType] = useState("applicant");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [linkedinUsername, setLinkedinUsername] = useState("");
  const [githubUsername, setGithubUsername] = useState("");

  const [bio, setBio] = useState("");

  const router = useRouter();

  const handleUpdateUser = async (user: UserProps) => {
    const userData: UserProps = {
      uid: user.uid,
      email: user.email || "",
      lastSeenIndex: user.lastSeenIndex || 0,
      displayName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
      bio: user.bio || "",
      accountType: user.accountType || "",
      likes: user.likes || [],
      matches: user.matches || [],
      updatedAt: new Date().toISOString(),
      profilePictureUrl: user.profilePictureUrl,
      linkedinUsername: user.linkedinUsername || "",
      githubUsername: user.githubUsername || "",
    };

    await patchUser(userData);
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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    await handleUpdateUser({
      uid: user.uid,
      email: user.email ?? "",
      accountType,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      bio,
      profilePictureUrl: user.photoURL ?? "",
      updatedAt: new Date().toISOString(),
      likes: [],
      matches: [],
      linkedinUsername,
      githubUsername,
    });

    router.push(`/user/${user.uid}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 text-black flex items-center justify-center px-4">
      <form onSubmit={onSubmit}>
        <div className="w-[50vw] max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-lg space-y-6">
          <h2 className="text-2xl font-bold">Tell Us About Yourself</h2>

          <div className="space-y-1">
            <Label>Account Type *</Label>
            <RadioGroup
              defaultValue="applicant"
              onValueChange={setAccountType}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="applicant"
                  id="applicant"
                  className="accent-blue-600"
                />
                <Label htmlFor="applicant">Applicant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="startup"
                  id="startup"
                  className="accent-blue-600"
                />
                <Label htmlFor="startup">Start Up</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-1">
            <Label>First Name *</Label>
            <Input
              required
              minLength={2}
              type="text"
              placeholder={"Enter your first name (Required)"}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Last Name *</Label>
            <Input
              required
              minLength={2}
              type="text"
              placeholder={"Enter your last name (Required)"}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Linkedin Username</Label>
            <Input
              type="text"
              placeholder={"Enter your linkedin name (optional)"}
              value={linkedinUsername}
              onChange={(e) => setLinkedinUsername(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Github Username</Label>
            <Input
              type="text"
              placeholder={"Enter your github name (optional)"}
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
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
            <Button type="submit">Submit</Button>
          </div>
        </div>
      </form>
    </main>
  );
}
