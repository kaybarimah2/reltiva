"use client";

import React from "react";
import Link from "next/link";
import {
  Building,
  Eye,
  Mail,
  Heart,
  Plus,
  ArrowRight,
  CreditCard,
  MessageSquare,
  ChevronRight
} from "lucide-react";

export interface EnqueryItem {
  id: string;
  buyerName: string;
  property: string;
  date: string;
  email: string;
  phone: string;
  message: string;
}

export interface ListingItem {
  id: string;
  title: string;
  price: number;
  type: string;
  views: number;
  enquiries: number;
  image: string;
}

interface AgentOverviewClientProps {
  agentName: string;
  totalListings: number;
  combinedViews: number;
  totalEnquiries: number;
  savedCount: number;
  subscriptionPlan: string;
  subscriptionEndDate: string | null;
  recentEnquiries: EnqueryItem[];
  recentListings: ListingItem[];
}

export default function AgentOverviewClient({
  agentName,
  totalListings,
  combinedViews,
  totalEnquiries,
  savedCount,
  subscriptionPlan,
  subscriptionEndDate,
  recentEnquiries,
  recentListings
}: AgentOverviewClientProps) {
  
  const METRICS = [
    { label: "Total Listings", value: totalListings, icon: Building, color: "text-blue-600 bg-blue-50" },
    { label: "Combined Views", value: combinedViews, icon: Eye, color: "text-emerald-600 bg-emerald-50" },
    { label: "Total Enquiries", value: totalEnquiries, icon: Mail, color: "text-purple-600 bg-purple-50" },
    { label: "Saved by Buyers", value: savedCount, icon: Heart, color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Overview Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-none">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 font-semibold mt-1.5">Welcome back, {agentName}. Here is how your listings are performing today.</p>
        </div>

        <Link
          href="/dashboard/agent/listings/new"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4.5 py-2.5 rounded-xl text-sm transition-all shadow shadow-emerald-600/10 flex items-center justify-center gap-1.5 w-full sm:w-auto"
        >
          <Plus className="h-4.5 w-4.5" /> Add New Listing
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${m.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="leading-none text-left">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{m.label}</p>
                <p className="text-xl font-black text-gray-900 mt-1">{m.value.toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Enquiries Table (Spans 2) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <h2 className="text-base font-black text-gray-900">Recent Enquiries</h2>
              <Link href="/dashboard/agent/enquiries" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                Inbox <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentEnquiries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <th className="pb-3">Buyer</th>
                      <th className="pb-3">Property</th>
                      <th className="pb-3">Message</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                    {recentEnquiries.map((enq) => (
                      <tr key={enq.id} className="hover:bg-gray-50/40">
                        <td className="py-3.5 pr-2">
                          <p className="font-extrabold text-gray-900 leading-tight">{enq.buyerName}</p>
                          <span className="text-[10px] text-gray-400 font-medium">{enq.date}</span>
                        </td>
                        <td className="py-3.5 pr-2 max-w-[150px] truncate" title={enq.property}>
                          {enq.property}
                        </td>
                        <td className="py-3.5 pr-2 max-w-[200px] truncate text-gray-400 font-medium" title={enq.message}>
                          {enq.message}
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex gap-2 justify-end">
                            <a
                              href={`https://wa.me/${enq.phone.replace(/[^\d]/g, "")}?text=Hi%20${encodeURIComponent(enq.buyerName)},%20I'm%20replying%20to%20your%20enquiry%20on%20Reltiva.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors"
                              title="Reply on WhatsApp"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </a>
                            <a
                              href={`mailto:${enq.email}`}
                              className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                              title="Reply via Email"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400 text-xs font-semibold">
                No enquiries received yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Listings Preview & Subscription (Span 1) */}
        <div className="space-y-6">
          
          {/* Subscription Banner */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-md text-left flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -left-6 -top-6 h-20 w-20 bg-emerald-500/30 rounded-full blur-lg" />

            <div className="space-y-1 relative z-10">
              <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" /> Current Subscription
              </span>
              <p className="text-2xl font-black">{subscriptionPlan} Plan</p>
              <p className="text-xs text-emerald-100 font-semibold mt-1">
                {subscriptionPlan === "FREE" && "Basic listing search exposure."}
                {subscriptionPlan === "BASIC" && "Featured exposure, standard analytics access."}
                {subscriptionPlan === "PRO" && "Unlimited listings, priority analytics placement."}
              </p>
            </div>

            <div className="flex justify-between items-center relative z-10 pt-4 border-t border-white/15">
              <span className="text-xs font-bold text-emerald-100">
                {subscriptionEndDate ? `Renews on ${subscriptionEndDate}` : "Lifetime membership"}
              </span>
              <Link
                href="/dashboard/agent/subscription"
                className="bg-white hover:bg-emerald-50 text-emerald-700 font-black px-3.5 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-0.5"
              >
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Listings Quick Preview */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <h2 className="text-base font-black text-gray-900">My Listings</h2>
              <Link href="/dashboard/agent/listings" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentListings.length > 0 ? (
              <div className="space-y-3">
                {recentListings.map((listing) => (
                  <div key={listing.id} className="flex gap-3 items-center border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="h-12 w-16 object-cover rounded-lg bg-gray-50 shrink-0 border border-gray-100"
                    />
                    <div className="flex-1 min-w-0 leading-tight">
                      <h4 className="font-bold text-gray-900 text-xs truncate" title={listing.title}>
                        {listing.title}
                      </h4>
                      <p className="text-[10px] text-emerald-600 font-extrabold mt-1">
                        GHS {listing.price.toLocaleString()}
                      </p>
                      <div className="flex gap-3 text-[9px] text-gray-400 font-bold mt-0.5">
                        <span>{listing.views} Views</span>
                        <span>{listing.enquiries} Enquiries</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-xs font-semibold">
                No active listings.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
