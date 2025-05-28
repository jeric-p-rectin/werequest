'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/request-reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send reset email');
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
            
            <h1 className="text-2xl font-bold text-center text-black">Forgot Password</h1>
            
            <p className="text-sm font-medium text-center text-black">
              Enter your email address to receive password reset instructions
            </p>
            
            {error && (
              <div className="w-full p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="w-full p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                If the email exists in our system, you will receive password reset instructions shortly.
              </div>
            )}
            
            <div className="w-full space-y-4 mt-4">
              <div className="w-full">
                <label htmlFor="email" className="block text-sm font-medium mb-1 text-black">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-[#4d5f30] rounded-3xl text-black focus:ring-2 focus:ring-[#80eb15] focus:border-transparent transition" 
                  required 
                  disabled={success}
                />
              </div>
            </div>
            
            <div className="w-full mt-6">
              <button 
                type="submit"
                disabled={isLoading || success}
                className="block w-full text-white text-center py-3 rounded-3xl transition duration-300 ease-in-out bg-[#80eb15] hover:bg-[#3c5e1a] disabled:bg-gray-400"
              >
                {isLoading ? "Sending..." : success ? "Email Sent" : "Reset Password"}
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