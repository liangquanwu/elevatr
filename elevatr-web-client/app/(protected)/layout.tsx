// src/app/(protected)/layout.tsx
"use client";
import { useAuth } from "@/app/AuthProvider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, fbUser } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Checking credentials…
      </main>
    );
  }

  // fbUser === null means AuthProvider has already redirected to /signin;
  // this branch is only reached for a split second on fast connections.
  return <>{children}</>;
}