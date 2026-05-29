"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, LayoutDashboard, Settings } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getDashboardRoute = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "/dashboard/admin";
      case "AGENT":
        return "/dashboard/agent";
      case "BUYER":
      default:
        return "/dashboard/buyer";
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section: Logo and Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <svg className="h-8 w-8 transition-transform group-hover:scale-105" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Stylized house silhouette */}
                <path d="M6 12L16 4L26 12V28H21V18H11V28H6V12Z" fill="#262637" />
                {/* Modern green overlapping roof overlay for R structure */}
                <path d="M16 4L26 12V18L16 10L6 18V12L16 4Z" fill="#00ad80" />
                {/* R leg indicator */}
                <circle cx="16" cy="14" r="3.5" fill="#ffffff" />
              </svg>
              <span className="text-2xl font-extrabold tracking-tight text-brand-navy group-hover:text-brand-green transition-colors">
                Reltiva
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6 h-full">
              <Link
                href="/search?type=SALE"
                className="text-sm font-bold text-brand-navy hover:text-brand-green h-full flex items-center border-b-2 border-transparent hover:border-brand-green transition-all px-1"
              >
                Buy
              </Link>
              <Link
                href="/search?type=RENT"
                className="text-sm font-bold text-brand-navy hover:text-brand-green h-full flex items-center border-b-2 border-transparent hover:border-brand-green transition-all px-1"
              >
                Rent
              </Link>
              <Link
                href="/new-homes"
                className="text-sm font-bold text-brand-navy hover:text-brand-green h-full flex items-center border-b-2 border-transparent hover:border-brand-green transition-all px-1"
              >
                New Homes
              </Link>
              <Link
                href="/agents"
                className="text-sm font-bold text-brand-navy hover:text-brand-green h-full flex items-center border-b-2 border-transparent hover:border-brand-green transition-all px-1"
              >
                Agents
              </Link>
            </div>
          </div>

          {/* Right section: Auth buttons / User profile */}
          <div className="hidden md:flex items-center">
            {status === "loading" ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {session.user.avatar ? (
                    <img
                      src={session.user.avatar}
                      alt={session.user.name || "User"}
                      className="h-9 w-9 rounded-full object-cover border border-brand-green"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold border border-brand-green/30">
                      {session.user.name ? session.user.name[0].toUpperCase() : "U"}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2.5 border-b border-gray-50">
                        <p className="text-sm font-semibold text-brand-navy truncate">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {session.user.email}
                        </p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-brand-green/10 text-brand-green rounded-full">
                          {session.user.role}
                        </span>
                      </div>
                      <Link
                        href={getDashboardRoute(session.user.role)}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-navy hover:text-brand-green hover:bg-brand-green/5 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-gray-400" />
                        Dashboard
                      </Link>
                      <Link
                        href={`${getDashboardRoute(session.user.role)}/settings`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-navy hover:text-brand-green hover:bg-brand-green/5 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 transition-colors border-t border-gray-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/auth/login"
                  className="text-sm font-bold text-brand-navy hover:text-brand-green transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-bold text-brand-green border border-brand-green hover:bg-brand-green hover:text-white rounded-lg transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <Link
            href="/search?type=SALE"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-bold text-brand-navy hover:bg-brand-green/5 hover:text-brand-green"
          >
            Buy
          </Link>
          <Link
            href="/search?type=RENT"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-bold text-brand-navy hover:bg-brand-green/5 hover:text-brand-green"
          >
            Rent
          </Link>
          <Link
            href="/new-homes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-bold text-brand-navy hover:bg-brand-green/5 hover:text-brand-green"
          >
            New Homes
          </Link>
          <Link
            href="/agents"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-bold text-brand-navy hover:bg-brand-green/5 hover:text-brand-green"
          >
            Agents
          </Link>
 
          <div className="border-t border-gray-100 pt-4 mt-2">
            {session?.user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  {session.user.avatar ? (
                    <img
                      src={session.user.avatar}
                      alt={session.user.name || "User"}
                      className="h-10 w-10 rounded-full object-cover border border-brand-green"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold">
                      {session.user.name ? session.user.name[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-brand-navy truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <Link
                  href={getDashboardRoute(session.user.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-base font-semibold text-brand-navy hover:bg-brand-green/5 hover:text-brand-green"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left block px-3 py-2.5 rounded-lg text-base font-semibold text-red-600 hover:bg-red-50"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-3">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 border border-gray-300 rounded-xl text-center text-sm font-bold text-brand-navy hover:bg-gray-50"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 bg-brand-green hover:bg-brand-green-hover text-white rounded-xl text-center text-sm font-bold shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
