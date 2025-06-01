"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
        setIsLoading(false);
      } else {
        router.push("/loading");
      }
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* Left side with background */}
      <div 
        className="w-3/5 relative" 
        style={{ background: "radial-gradient(#4d5f30, #34450e)" }}
      ></div>
      
      {/* Right side with login form */}
      <div className="w-2/5 bg-white flex items-center justify-center">
        <div className="w-4/5 max-w-md">
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
            <div className="mt-10 mb-5">
              <Image 
                src="/images/logo.png" 
                alt="Logo" 
                width={140}
                height={140}
                className="rounded-full border-4 border-[#4d5f30]"
              />
            </div>
            
            <h1 className="text-2xl font-bold text-center text-black">Welcome Users</h1>
            
            <p className="text-sm font-medium text-center text-black">
              Barangay San Andres, Guimba
            </p>
            
            {error && (
              <div className="w-full p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="w-full space-y-4 mt-4">
              <div className="w-full">
                <label htmlFor="username" className="block text-sm font-medium mb-1 text-black">Username</label>
                <input 
                  type="text" 
                  id="username" 
                  name="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border border-[#4d5f30] rounded-3xl text-black focus:ring-2 focus:ring-[#80eb15] focus:border-transparent transition" 
                  required 
                />
              </div>
              
              <div className="w-full relative">
                <label htmlFor="password" className="block text-sm font-medium mb-1 text-black">Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-[#4d5f30] rounded-3xl text-black focus:ring-2 focus:ring-[#80eb15] focus:border-transparent transition" 
                  required 
                />
                <button 
                  type="button"
                  className="absolute right-3 top-8 text-sm text-black"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "hide" : "show"}
                </button>
              </div>
            </div>
            
            <div className="w-full mt-6">
              <button 
                type="submit"
                disabled={isLoading}
                className="block w-full text-white text-center py-3 rounded-3xl transition duration-300 ease-in-out bg-[#80eb15] hover:bg-[#3c5e1a] disabled:bg-gray-400"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
            
            <Link href="/forgot" className="text-black hover:underline mt-2">
              Forgot Password
            </Link>
          </form>
        </div>
      </div>
    </main>
  );
}