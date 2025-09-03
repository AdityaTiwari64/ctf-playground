"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Shield,
  Terminal,
  Flag,
  Trophy,
  CircleUser,
  LogOut,
  Settings
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { logout, isAuthenticated, user } = useAuth();

  const navLinks = [
    { name: "Challenges", href: "/challenges", icon: Flag },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  ];

  const adminLinks = [
    { name: "Challenges", href: "/admin/challenges", icon: Settings },
    { name: "Users", href: "/admin/users", icon: Settings },
  ];

  const isActive = (href) => pathname === href;

  return (
    <nav className="bg-slate-900 border-b border-slate-700 shadow-lg fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <div className="relative">
                <Shield className="h-8 w-8 text-cyan-400 mr-3 group-hover:text-cyan-300 transition-colors duration-200" />
                <div className="absolute inset-0 bg-cyan-400 opacity-20 blur-sm rounded-full group-hover:opacity-30 transition-opacity duration-200"></div>
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold text-white tracking-wider group-hover:text-slate-100 transition-colors duration-200">
                  HackSecure
                </span>
                <span className="text-xl font-light text-cyan-400 ml-1 tracking-wider group-hover:text-cyan-300 transition-colors duration-200">
                  2025
                </span>
                <Terminal className="h-4 w-4 text-green-400 ml-2 animate-pulse" />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group ${
                    active
                      ? "text-cyan-400 bg-slate-800 border-b-2 border-cyan-400"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 mr-2 transition-colors duration-200 ${
                      active ? "text-cyan-400" : "group-hover:text-cyan-400"
                    }`}
                  />
                  {link.name}
                </Link>
              );
            })}
            {/* Admin Links - Only show when authenticated */}
            {isAuthenticated && adminLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group ${
                    active
                      ? "text-orange-400 bg-slate-800 border-b-2 border-orange-400"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 mr-2 transition-colors duration-200 ${
                      active ? "text-orange-400" : "group-hover:text-orange-400"
                    }`}
                  />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Buttons */}
          {!isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-md transition-all duration-200 hover:bg-slate-800"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-all duration-200 shadow-lg hover:shadow-cyan-400/25 font-semibold"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              {/* User Info */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg">
                <CircleUser className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium text-white">
                  {user?.username || user?.name}
                </span>
              </div>
              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 hover:border-red-600/50 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-800 border-t border-slate-700">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  active
                    ? "text-cyan-400 bg-slate-700 border-l-4 border-cyan-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon
                  className={`h-4 w-4 mr-3 ${
                    active ? "text-cyan-400" : "text-slate-400"
                  }`}
                />
                {link.name}
              </Link>
            );
          })}
          {/* Admin Links - Only show when authenticated */}
          {isAuthenticated && adminLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  active
                    ? "text-orange-400 bg-slate-700 border-l-4 border-orange-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon
                  className={`h-4 w-4 mr-3 ${
                    active ? "text-orange-400" : "text-slate-400"
                  }`}
                />
                {link.name}
              </Link>
            );
          })}
          <div className="pt-4 pb-3 border-t border-slate-700">
            {!isAuthenticated ? (
              <div className="flex flex-col space-y-3 px-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-md transition-all duration-200 hover:bg-slate-700 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-all duration-200 shadow-lg font-semibold text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex justify-center items-center space-x-4">
                {/* User Info */}
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg">
                  <CircleUser className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-medium text-white">
                    {user?.username || user?.name}
                  </span>
                </div>
                {/* Logout Button */}
                <button
                  onClick={() => {
                    logout();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 hover:border-red-600/50 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}