"use client";

import React from "react";
import Link from "next/link";
import {
  Heart,
  Mail,
  Bell,
  Eye,
  ChevronRight,
  MapPin,
  MessageSquare
} from "lucide-react";

export interface DashboardPropItem {
  id: string;
  title: string;
  price: number;
  location: string;
  beds: number;
  baths: number;
  image: string;
  isRent: boolean;
}

export interface DashboardEnquiryItem {
  id: string;
  propertyTitle: string;
  agentName: string;
  message: string;
  date: string;
  status: string;
}

interface BuyerOverviewClientProps {
  buyerName: string;
  savedCount: number;
  enquiriesCount: number;
  alertsCount: number;
  totalViewsCount: number;
  recentlySaved: DashboardPropItem[];
  recentEnquiries: DashboardEnquiryItem[];
  suggestedProperties: DashboardPropItem[];
}

export default function BuyerOverviewClient({
  buyerName,
  savedCount,
  enquiriesCount,
  alertsCount,
  totalViewsCount,
  recentlySaved,
  recentEnquiries,
  suggestedProperties,
}: BuyerOverviewClientProps) {
  
  const STATS = [
    { label: "Saved Properties", value: savedCount, icon: Heart, color: "text-red-600 bg-red-50" },
    { label: "Active Enquiries", value: enquiriesCount, icon: Mail, color: "text-blue-600 bg-blue-50" },
    { label: "Property Alerts", value: alertsCount, icon: Bell, color: "text-amber-600 bg-amber-50" },
    { label: "Properties Viewed", value: totalViewsCount, icon: Eye, color: "text-emerald-600 bg-emerald-50" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Overview Header Welcome panel */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-none">Welcome back, {buyerName}</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1.5">Here is an overview of your property search activities today.</p>
      </div>

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

      {/* 2-Column Dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Spans 2) - Saved & Enquiries */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recently Saved Properties Carousel / List */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <h2 className="text-base font-black text-gray-900">Recently Saved</h2>
              <Link href="/dashboard/buyer/saved" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentlySaved.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recentlySaved.map((prop) => (
                  <Link
                    key={prop.id}
                    href={`/properties/${prop.id}`}
                    className="group flex flex-col bg-gray-50/50 hover:bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all shadow-sm"
                  >
                    <div className="h-28 w-full bg-gray-100 relative overflow-hidden">
                      <img
                        src={prop.image}
                        alt={prop.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3.5 space-y-1 text-left flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-xs line-clamp-1 leading-snug" title={prop.title}>
                          {prop.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-bold flex items-center gap-0.5 mt-1">
                          <MapPin className="h-3 w-3 text-emerald-500 shrink-0" /> {prop.location}
                        </p>
                      </div>
                      <div className="pt-2 flex justify-between items-center border-t border-gray-100 mt-2">
                        <span className="text-xs font-black text-emerald-600">
                          GHS {prop.price.toLocaleString()}
                          {prop.isRent && <span className="text-[9px] font-bold text-gray-400">/mo</span>}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400">{prop.beds}b / {prop.baths}ba</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-xs font-medium space-y-2">
                <p>You haven&apos;t saved any listings yet.</p>
                <Link href="/search" className="text-emerald-600 hover:underline font-bold">
                  Start searching
                </Link>
              </div>
            )}
          </div>

          {/* Recent Enquiries */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <h2 className="text-base font-black text-gray-900">Recent Enquiries</h2>
              <Link href="/dashboard/buyer/enquiries" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                Inbox <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentEnquiries.length > 0 ? (
              <div className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                {recentEnquiries.map((enq) => (
                  <div key={enq.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 first:pt-0 last:pb-0">
                    <div className="leading-snug">
                      <p className="font-extrabold text-gray-900">{enq.propertyTitle}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Contact Agent: <span className="font-bold text-gray-600">{enq.agentName}</span> • {enq.date}</p>
                      <p className="text-xs text-gray-400 font-medium line-clamp-1 mt-1 flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0" /> {enq.message}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold tracking-wider shrink-0 self-start sm:self-center border ${
                      enq.status === "REPLIED" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : enq.status === "READ"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                      {enq.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-xs font-medium space-y-2">
                <p>No enquiries sent yet.</p>
                <Link href="/search" className="text-emerald-600 hover:underline font-bold">
                  Browse properties to contact agents
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Span 1) - Suggested Properties */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-left space-y-4">
            <div className="pb-2 border-b border-gray-50">
              <h2 className="text-base font-black text-gray-900">Suggested For You</h2>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Based on your saved houses and search criteria</p>
            </div>

            <div className="space-y-4">
              {suggestedProperties.length > 0 ? (
                suggestedProperties.map((prop) => (
                  <Link
                    key={prop.id}
                    href={`/properties/${prop.id}`}
                    className="group flex gap-3.5 items-center border-b border-gray-50 last:border-0 pb-4 last:pb-0"
                  >
                    <div className="h-16 w-24 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 relative">
                      <img src={prop.image} alt={prop.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 leading-tight space-y-0.5">
                      <span className="text-[8px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">Recommended</span>
                      <h4 className="font-extrabold text-gray-900 text-xs truncate mt-1 group-hover:text-emerald-600 transition-colors" title={prop.title}>
                        {prop.title}
                      </h4>
                      <p className="text-[10px] text-emerald-600 font-extrabold mt-1">
                        GHS {prop.price.toLocaleString()}
                        {prop.isRent && <span className="text-[9px] font-bold text-gray-400">/mo</span>}
                      </p>
                      <p className="text-[9px] text-gray-400 font-semibold truncate">
                        {prop.location}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-8 text-center text-gray-400 text-xs font-medium">
                  No suggestions available.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
