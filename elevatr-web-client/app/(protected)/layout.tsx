"use client";
import { useAuth } from "@/app/AuthProvider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Checking credentials…
      </main>
    );
  }

  return <>{children}</>;
}