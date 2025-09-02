'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Shield, Terminal, Flag, Users, Trophy, BookOpen } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { name: 'Challenges', href: '/challenges', icon: Flag },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Learn', href: '/learn', icon: BookOpen },
    { name: 'Teams', href: '/teams', icon: Users },
  ]

  const isActive = (href) => pathname === href

  return (
    <nav className="bg-slate-900 border-b border-slate-700 shadow-lg fixed min-w-screen z-50">
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
                  CTF
                </span>
                <span className="text-xl font-light text-cyan-400 ml-1 tracking-wider group-hover:text-cyan-300 transition-colors duration-200">
                  PLAYGROUND
                </span>
                <Terminal className="h-4 w-4 text-green-400 ml-2 animate-pulse" />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href)
              return (
                <Link
                  key={link.name}

                  href={link.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group ${
                    active
                      ? 'text-cyan-400 bg-slate-800 border-b-2 border-cyan-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`h-4 w-4 mr-2 transition-colors duration-200 ${
                    active ? 'text-cyan-400' : 'group-hover:text-cyan-400'
                  }`} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/Auth/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-md transition-all duration-200 hover:bg-slate-800"
            >
              Login
            </Link>
            <Link
              href="/Auth/register"
              className="px-4 py-2 text-sm text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-all duration-200 shadow-lg hover:shadow-cyan-400/25 font-semibold"
            >
              Register
            </Link>
          </div>

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
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-800 border-t border-slate-700">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href)
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  active
                    ? 'text-cyan-400 bg-slate-700 border-l-4 border-cyan-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className={`h-4 w-4 mr-3 ${
                  active ? 'text-cyan-400' : 'text-slate-400'
                }`} />
                {link.name}
              </Link>
            );
          })}
          <div className="pt-4 pb-3 border-t border-slate-700">
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
          </div>
        </div>
      </div>
    </nav>
  )
}