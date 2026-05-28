"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Home,
  Users,
  Building,
  AlertTriangle,
  Star,
  CreditCard,
  BarChart3,
  Menu,
  X,
  LogOut
} from "lucide-react";

const SIDEBAR_LINKS = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Users Management", icon: Users },
  { href: "/dashboard/admin/listings", label: "Listing Moderation", icon: Building },
  { href: "/dashboard/admin/reports", label: "Reports Inbox", icon: AlertTriangle },
  { href: "/dashboard/admin/featured", label: "Featured Slots", icon: Star },
  { href: "/dashboard/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/dashboard/admin/analytics", label: "Site Analytics", icon: BarChart3 },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-left">
      
      {/* TOP HEADER PANEL */}
      <header className="h-16 bg-white border-b border-gray-100 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1.5 text-gray-500 hover:bg-gray-50 rounded-xl focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <Link href="/" className="flex items-center gap-2 text-emerald-600">
            <Home className="h-5.5 w-5.5 stroke-[2.5]" />
            <span className="text-lg font-black tracking-tight text-gray-900 uppercase">
              Reltiva <span className="text-purple-600 font-extrabold text-xs lowercase">admin</span>
            </span>
          </Link>
        </div>

        {/* Topbar User profile capsule */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
            <img
              src={session?.user?.image || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150"}
              alt="System Admin"
              className="h-8 w-8 rounded-full object-cover border border-purple-300"
            />
            <div className="hidden sm:block text-left leading-none">
              <p className="text-xs font-black text-gray-800">{session?.user?.name || "System Admin"}</p>
              <span className="text-[10px] text-purple-600 font-bold">System Admin</span>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl text-xs font-bold text-red-600 transition-colors"
            title="Exit Dashboard"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Logout</span>
          </Link>
        </div>
      </header>

      {/* BODY WRAPPER */}
      <div className="flex-1 flex relative">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 shrink-0 sticky top-16 h-[calc(100vh-64px)] justify-between py-6 px-4">
          <nav className="flex flex-col gap-1.5">
            {SIDEBAR_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/10"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Log Out Anchor */}
          <Link
            href="/"
            className="flex items-center gap-3 px-4.5 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Exit Dashboard
          </Link>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <main className="flex-1 min-w-0 bg-gray-50 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-40 px-3 flex items-center justify-around shadow-lg">
        {SIDEBAR_LINKS.slice(0, 4).map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-all ${
                isActive ? "text-purple-600 font-extrabold" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <Icon className="h-5.5 w-5.5 shrink-0" />
              <span className="text-[9px] font-bold truncate max-w-full">{link.label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl text-gray-400 hover:text-gray-700 focus:outline-none"
        >
          <Menu className="h-5.5 w-5.5 shrink-0" />
          <span className="text-[9px] font-bold">More</span>
        </button>
      </nav>

      {/* MOBILE DRAWER SIDEBAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-xs bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-left duration-300 z-10 justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-base font-black text-gray-800">ADMIN PANEL</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-950 focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1.5">
                {SIDEBAR_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                        isActive
                          ? "bg-purple-600 text-white shadow"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4.5 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-gray-50 pt-4"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Exit Dashboard
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
