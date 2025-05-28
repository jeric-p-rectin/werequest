"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4d5f30] mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Image 
              src="/images/logo.png" 
              alt="Logo" 
              width={50} 
              height={50} 
              className="rounded-full border-2 border-[#4d5f30]"
            />
            <h1 className="ml-3 text-xl font-bold text-gray-900">WeRequest Dashboard</h1>
          </div>
          <div className="flex items-center">
            <span className="mr-4 text-gray-700">
              Welcome, {session?.user?.email || "User"}
            </span>
            <button
              onClick={handleSignOut}
              className="bg-[#4d5f30] hover:bg-[#3c5e1a] text-white px-4 py-2 rounded-md transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-100 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Pending Requests</h3>
              <p className="text-3xl font-bold">12</p>
            </div>
            
            <div className="bg-blue-100 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Approved Requests</h3>
              <p className="text-3xl font-bold">45</p>
            </div>
            
            <div className="bg-yellow-100 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Completed Requests</h3>
              <p className="text-3xl font-bold">78</p>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-medium mb-4">Recent Activity</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <tr key={item} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">REQ-{1000 + item}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Barangay Clearance</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-11-{10 + item}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}