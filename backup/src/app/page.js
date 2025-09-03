"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import { Flag, Trophy, Users, Shield, Terminal, Zap } from "lucide-react";

export default function HomePage() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalChallenges: 0,
    totalUsers: 0,
    totalSolves: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [challengesRes, usersRes] = await Promise.all([
        fetch("/api/challenges"),
        fetch("/api/users")
      ]);
      
      const challengesData = await challengesRes.json();
      const usersData = await usersRes.json();
      
      const totalSolves = challengesData.challenges?.reduce((acc, challenge) => 
        acc + (challenge.solveCount || 0), 0) || 0;
      
      setStats({
        totalChallenges: challengesData.challenges?.length || 0,
        totalUsers: usersData.users?.length || 0,
        totalSolves
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center items-center mb-8">
              <Shield className="h-16 w-16 text-cyan-400 mr-4" />
              <Terminal className="h-12 w-12 text-green-400 animate-pulse" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                CTF
              </span>
              <span className="text-white ml-4">PLAYGROUND</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Sharpen your cybersecurity skills with hands-on challenges. 
              Compete, learn, and master the art of ethical hacking.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/challenges"
                    className="inline-flex items-center px-8 py-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-cyan-600/25"
                  >
                    <Flag className="h-5 w-5 mr-2" />
                    Start Challenges
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="inline-flex items-center px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-lg font-semibold transition-all duration-200"
                  >
                    <Trophy className="h-5 w-5 mr-2" />
                    View Leaderboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center px-8 py-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-cyan-600/25"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-lg font-semibold transition-all duration-200"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">
                {stats.totalChallenges}
              </div>
              <div className="text-gray-300">Active Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {stats.totalUsers}
              </div>
              <div className="text-gray-300">Registered Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {stats.totalSolves}
              </div>
              <div className="text-gray-300">Total Solves</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose CTF Playground?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to develop your cybersecurity expertise
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-colors duration-200">
              <Flag className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Diverse Challenges</h3>
              <p className="text-gray-400">
                Web security, cryptography, forensics, reverse engineering, and more. 
                Challenges for every skill level.
              </p>
            </div>
            
            <div className="bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-colors duration-200">
              <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Competitive Scoring</h3>
              <p className="text-gray-400">
                Track your progress and compete with others on our real-time leaderboard. 
                Earn points and climb the ranks.
              </p>
            </div>
            
            <div className="bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-colors duration-200">
              <Zap className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Instant Feedback</h3>
              <p className="text-gray-400">
                Get immediate validation when you solve challenges. 
                Learn from hints and detailed explanations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Welcome Section */}
      {isAuthenticated && (
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Welcome back, {user.username}! 👋
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              Current Score: <span className="text-green-400 font-bold">{user.score} points</span>
              {user.role === 'sudo' && (
                <span className="ml-4 bg-red-600 px-3 py-1 rounded text-sm">ADMIN</span>
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/challenges"
                className="inline-flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-all duration-200"
              >
                Continue Solving
              </Link>
              {user.role === 'sudo' && (
                <Link
                  href="/admin/challenges"
                  className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all duration-200"
                >
                  Manage Challenges
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join our community of ethical hackers and cybersecurity enthusiasts
            </p>
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-cyan-600/25"
            >
              Create Account - It's Free!
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}