"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white">
              🚩 CTF Playground
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/challenges"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Challenges
            </Link>
            <Link
              href="/leaderboard"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Leaderboard
            </Link>

            {/* Only render auth-dependent content after client hydration */}
            {isClient && !loading && (
              <>
                {user ? (
                  <>
                    {user.role === "sudo" && (
                      <Link
                        href="/admin/challenges"
                        className="text-yellow-400 hover:text-yellow-300 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Admin
                      </Link>
                    )}
                    <span className="text-gray-300 text-sm">
                      Welcome, {user.username}!
                    </span>
                    <button
                      onClick={logout}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Register
                    </Link>
                  </>
                )}
              </>
            )}
            
            {/* Show loading state during hydration */}
            {(!isClient || loading) && (
              <div className="text-gray-400 text-sm px-3 py-2">
                Loading...
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}