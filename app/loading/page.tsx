"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoadingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) return;
    const role = session.user?.role;
    if (role === "resident") {
      router.replace("/resident-page");
    } else if (role === "admin" || role === "super admin") {
      router.replace("/dashboard");
    } else {
      // fallback: go to home or error
      router.replace("/");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 border-solid mb-6"></div>
      <p className="text-lg text-green-700 font-semibold">Checking your access...</p>
    </div>
  );
}
