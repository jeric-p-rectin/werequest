"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";

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
      <div className="w-3/5 relative flex items-center justify-center overflow-hidden">
        <Image
          src="/images/baranggay hall.jpg"
          alt="Barangay Hall of San Andres, Guimba"
          fill
          style={{ objectFit: 'cover' }}
          priority
          className="z-0"
        />
        {/* Overlay for visual effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#34450e]/80 via-[#4d5f30]/60 to-transparent z-10" />
        {/* Description at the bottom left */}
        <div className="absolute bottom-8 left-8 z-20 max-w-[80%]">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">Barangay Hall of San Andres, Guimba</h2>
          <p className="text-lg text-white drop-shadow-md bg-black/40 rounded-lg px-4 py-2">
            The heart of our community, where service, unity, and progress begin. Welcome to Barangay San Andres, Guimba—your home, your future.
          </p>
        </div>
      </div>
      
      {/* Right side with login form */}
      <div className="w-2/5 bg-white flex items-center justify-center min-h-screen">
        <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-md px-8 py-10 rounded-lg items-center justify-center">
          <Image 
            src="/images/logo.png" 
            alt="Logo" 
            width={200}
            height={200}
            className="rounded-full border-4 border-[#4d5f30] mb-2"
          />
          <h1 className="text-2xl font-bold text-center text-black">Welcome Users</h1>
          <p className="text-sm font-medium text-center text-black mb-2">Barangay San Andres, Guimba</p>
          {error && (
            <div className="w-full p-2 bg-red-100 border border-red-400 text-red-700 rounded text-center">
              {error}
            </div>
          )}
          <div className="w-full space-y-4">
            <div className="w-full">
              <label htmlFor="username" className="block text-sm font-medium mb-1 text-black">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border border-[#4d5f30] rounded-3xl text-sm text-black focus:ring-2 focus:ring-[#80eb15] focus:border-transparent transition" 
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
                className="w-full p-2 border border-[#4d5f30] rounded-3xl text-sm text-black focus:ring-2 focus:ring-[#80eb15] focus:border-transparent transition" 
                required 
              />
              <button 
                type="button"
                className="absolute cursor-pointer right-3 top-8 text-xl text-black"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="block w-full cursor-pointer text-sm text-white text-center py-3 rounded-3xl transition duration-300 ease-in-out bg-[#80eb15] hover:bg-[#3c5e1a] disabled:bg-gray-400 mt-2"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <Link href="/forgot" className="text-sm text-black hover:underline mt-1">
            Forgot Password
          </Link>
          <div className="w-full flex items-center justify-center mt-2">
            <p className="text-sm text-black">Don't have an account?</p>
          </div>
          <button 
            type="button"
            className="block w-full cursor-pointer text-sm text-white text-center py-3 rounded-3xl transition duration-300 ease-in-out bg-[#80eb15] hover:bg-[#3c5e1a] disabled:bg-gray-400"
            onClick={() => router.push("/create-account")}
          >
            Create Account
          </button>
        </form>
      </div>
    </main>
  );
}