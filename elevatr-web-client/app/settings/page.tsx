// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { signOut } from "../utilities/firebase/firebase";
// import { onAuthStateChangedHelper } from "../utilities/firebase/firebase";
// import { User } from "firebase/auth";

// export default function Dashboard() {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChangedHelper((user) => {
//       if (!user) {
//         router.push("/"); // redirect if not signed in
//       } else {
//         setUser(user);
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, [router]);

//   if (loading) {
//     return (
//       <main className="min-h-screen bg-black text-white flex items-center justify-center">
//         <p className="text-xl">Checking credentials...</p>
//       </main>
//     );
//   }

//   return (
//     // <Navbaraz></Navbar>
//     <main className="w-screen h-screen bg-gradient-to-br from-[#1E2122] to-[#111314] text-white flex items-center justify-center px-4">
//       <h1 className="text-4xl">🚀 Welcome to your dashboard, {user?.displayName || "User"}!</h1>
//       <button onClick={signOut} className="w-[300] bg-white">Log Out</button>
//     </main>
//   );
// }

"use client";

import { useRouter } from "next/navigation";
import { signOut } from "../utilities/firebase/firebase";
import { onAuthStateChangedHelper } from "../utilities/firebase/firebase";
import { User } from "firebase/auth";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Navbar from "../navbar/navbar";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState("larrywu");
  const [email, setEmail] = useState("larrywu@email.com");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleSave = () => {
    console.log("Settings updated:", {
      username,
      email,
      emailNotifications,
      darkMode,
    });
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto py-10 space-y-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <Card>
          <CardContent className="space-y-5 p-6 b-0 m-0">
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Enable Email Notifications</span>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Dark Mode</span>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>

            <Button className="w-full" onClick={handleSave}>
              Save Changes
            </Button>
          </CardContent>
        </Card>
        <button
          onClick={signOut}
          className="w-[100px] bg-black text-white border border-white py-2 rounded hover:bg-gray-900 transition align-self-end"
        >
          Log Out
        </button>{" "}
      </div>
    </div>
  );
}
