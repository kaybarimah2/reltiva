"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  PlusCircle,
  Mail,
  BarChart3,
  CreditCard,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  Building
} from "lucide-react";

const SIDEBAR_LINKS = [
  { href: "/dashboard/agent", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/agent/listings", label: "My Listings", icon: Building },
  { href: "/dashboard/agent/listings/new", label: "Add New Listing", icon: PlusCircle },
  { href: "/dashboard/agent/enquiries", label: "Enquiries Inbox", icon: Mail },
  { href: "/dashboard/agent/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/agent/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/agent/settings", label: "Profile Settings", icon: Settings },
];

export default function AgentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Mock Notification Inbox
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New enquiry received for Adenta Apartment", unread: true, date: "10 mins ago" },
    { id: 2, text: "Your listing ' Dome House' is now verified!", unread: true, date: "2 hrs ago" },
    { id: 3, text: "Subscription renewal coming up in 3 days", unread: false, date: "1 day ago" }
  ]);

  const unreadNotificationsCount = notifications.filter(n => n.unread).length;

  const handleMarkNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

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
              Reltiva <span className="text-emerald-600 font-extrabold text-xs lowercase">agent</span>
            </span>
          </Link>
        </div>

        {/* Topbar Actions */}
        <div className="flex items-center gap-4 relative">
          
          {/* Notifications Dropdown toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                if (!notificationsOpen) handleMarkNotificationsRead();
              }}
              className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl focus:outline-none relative"
            >
              <Bell className="h-5 w-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              )}
            </button>

            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl py-3 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 pb-2 border-b border-gray-50 flex justify-between items-center">
                    <span className="text-xs font-black text-gray-900 uppercase tracking-wider">Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-lg text-[9px]">
                        {unreadNotificationsCount} New
                      </span>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto mt-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-2.5 hover:bg-gray-50 flex flex-col gap-0.5 border-b border-gray-50 last:border-0 ${
                          n.unread ? "bg-emerald-50/20" : ""
                        }`}
                      >
                        <p className="text-xs text-gray-700 font-semibold">{n.text}</p>
                        <span className="text-[10px] text-gray-400 font-medium">{n.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User profile capsule */}
          <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150"
              alt="Kofi Mensah"
              className="h-8 w-8 rounded-full object-cover border border-emerald-300"
            />
            <div className="hidden sm:block text-left leading-none">
              <p className="text-xs font-black text-gray-800">Kofi Mensah</p>
              <span className="text-[10px] text-emerald-600 font-bold">Pro Agent</span>
            </div>
          </div>
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
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
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
                isActive ? "text-emerald-600 font-extrabold" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <Icon className="h-5.5 w-5.5 shrink-0" />
              <span className="text-[9px] font-bold">{link.label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <Link
          key="settings"
          href="/dashboard/agent/settings"
          className={`flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-all ${
            pathname === "/dashboard/agent/settings" ? "text-emerald-600 font-extrabold" : "text-gray-400"
          }`}
        >
          <Settings className="h-5.5 w-5.5 shrink-0" />
          <span className="text-[9px] font-bold">Settings</span>
        </Link>
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
                <span className="text-base font-black text-gray-800">AGENT PANEL</span>
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
                          ? "bg-emerald-600 text-white shadow"
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
