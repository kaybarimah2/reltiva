"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Building,
  Mail,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  Clock
} from "lucide-react";

export interface PendingApprovalItem {
  id: string;
  title: string;
  price: number;
  agentName: string;
  date: string;
}

export interface RecentRegItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  date: string;
}

interface AdminOverviewClientProps {
  adminName: string;
  totalUsersCount: number;
  totalListingsCount: number;
  totalEnquiriesCount: number;
  totalRevenueStr: string;
  initialPendingListings: PendingApprovalItem[];
  recentRegistrations: RecentRegItem[];
}

export default function AdminOverviewClient({
  adminName,
  totalUsersCount,
  totalListingsCount,
  totalEnquiriesCount,
  totalRevenueStr,
  initialPendingListings,
  recentRegistrations
}: AdminOverviewClientProps) {
  const [pendingListings, setPendingListings] = useState<PendingApprovalItem[]>(initialPendingListings);
  const [successMsg, setSuccessMsg] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApproveListing = async (id: string, title: string) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: id, action: "APPROVE" })
      });

      if (res.ok) {
        setPendingListings(pendingListings.filter((p) => p.id !== id));
        setSuccessMsg(`Approved: "${title}" is now active!`);
        setTimeout(() => setSuccessMsg(""), 2500);
      }
    } catch (err) {
      console.error("Failed to approve listing", err);
    } finally {
      setLoadingId(null);
    }
  };

  const STATS = [
    { label: "Total Users", value: totalUsersCount, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Total Listings", value: totalListingsCount, icon: Building, color: "text-purple-600 bg-purple-50" },
    { label: "Total Enquiries", value: totalEnquiriesCount, icon: Mail, color: "text-amber-600 bg-amber-50" },
    { label: "Total Revenue", value: totalRevenueStr, icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Overview Header Welcome panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-none">Admin Control Overview</h1>
          <p className="text-sm text-gray-500 font-semibold mt-1.5">{adminName}, welcome back. Monitor listings moderation and user reports feedback.</p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/admin/listings"
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl flex items-center gap-1 border border-purple-100"
          >
            Moderate Listings <Clock className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard/admin/reports"
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl flex items-center gap-1 border border-red-100"
          >
            Review Reports <AlertOctagon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Success alert message */}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded-2xl border border-emerald-100 flex items-center gap-2 animate-fade-in">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <Icon className="h-5.5 w-5.5" />
              </div>
              <div className="leading-none text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-black text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Spans 2) - Pending Listings Approvals */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <h2 className="text-base font-black text-gray-900">Pending Listings Approvals</h2>
              <Link href="/dashboard/admin/listings" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-0.5">
                Full Queue <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {pendingListings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                      <th className="pb-3 pt-3 px-4">Property Title</th>
                      <th className="pb-3 pt-3 px-4">Agent</th>
                      <th className="pb-3 pt-3 px-4">Price</th>
                      <th className="pb-3 pt-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                    {pendingListings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-gray-50/40">
                        <td className="py-3.5 px-4 pr-2 max-w-[200px] truncate" title={listing.title}>
                          <p className="font-extrabold text-gray-900">{listing.title}</p>
                          <span className="text-[10px] text-gray-400 font-medium">{listing.date}</span>
                        </td>
                        <td className="py-3.5 px-4 pr-2">
                          {listing.agentName}
                        </td>
                        <td className="py-3.5 px-4 pr-2 text-emerald-600 font-extrabold">
                          GHS {listing.price.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleApproveListing(listing.id, listing.title)}
                            disabled={loadingId === listing.id}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 disabled:opacity-50"
                          >
                            {loadingId === listing.id ? "Approving..." : "Approve"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs font-bold text-gray-400">All submissions moderated! No pending listings.</div>
            )}
          </div>
        </div>

        {/* Right Column (Span 1) - Recent Registrations */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-left space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <h2 className="text-base font-black text-gray-900">Recent Users</h2>
            <Link href="/dashboard/admin/users" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-0.5">
              All Users <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {recentRegistrations.map((user) => (
              <div key={user.id} className="flex justify-between items-center border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                <div className="leading-tight min-w-0 flex-1">
                  <h4 className="font-extrabold text-gray-900 text-xs truncate" title={user.name}>
                    {user.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-semibold truncate">
                    {user.email} • {user.date}
                  </p>
                  <span className="text-[8px] bg-gray-100 text-gray-500 font-black px-1.5 py-0.5 rounded tracking-wider uppercase inline-block mt-1">
                    {user.role}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold tracking-wider shrink-0 uppercase border ${
                  user.status === "ACTIVE" 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                    : user.status === "BANNED"
                    ? "bg-red-50 text-red-700 border-red-100"
                    : "bg-amber-50 text-amber-700 border-amber-100"
                }`}>
                  {user.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
