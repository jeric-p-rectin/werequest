"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoadingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/"); // Redirect to login if no session
      return;
    }

    // Check user role and redirect accordingly
    if (session.user.role === "resident") {
      router.push("/resident");
    } else if (session.user.role === "admin") {
      router.push("/add-resident");
    } else {
      // If role is not recognized, redirect to login
      router.push("/");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-700">Loading...</h2>
        <p className="mt-2 text-gray-500">Please wait while we redirect you</p>
      </div>
    </div>
  );
}
