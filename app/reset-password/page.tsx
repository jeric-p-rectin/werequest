'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      // Show success message and redirect
      alert('Password has been reset successfully!');
      router.push('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
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
      
      {/* Right side with form */}
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
            
            <h1 className="text-2xl font-bold text-center text-black">Reset Password</h1>
            
            <p className="text-sm font-medium text-center text-black">
              Enter your new password below
            </p>
            
            {error && (
              <div className="w-full p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="w-full space-y-4 mt-4">
              <div className="w-full relative">
                <label htmlFor="password" className="block text-sm font-medium mb-1 text-black">New Password</label>
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password" 
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

              <div className="w-full relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-black">Confirm Password</label>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border border-[#4d5f30] rounded-3xl text-black focus:ring-2 focus:ring-[#80eb15] focus:border-transparent transition"
                  required 
                />
                <button 
                  type="button"
                  className="absolute right-3 top-8 text-sm text-black"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "hide" : "show"}
                </button>
              </div>
            </div>
            
            <div className="w-full mt-6">
              <button 
                type="submit"
                disabled={isLoading}
                className="block w-full text-white text-center py-3 rounded-3xl transition duration-300 ease-in-out bg-[#80eb15] hover:bg-[#3c5e1a] disabled:bg-gray-400"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
            
            <Link href="/" className="text-black hover:underline mt-2">
              Back to Login
            </Link>
          </form>
        </div>
      </div>
    </main>
  );
}
