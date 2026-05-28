"use client";

import React, { useState } from "react";
import {
  Mail,
  Search,
  Inbox,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Phone,
  Building,
  Plus
} from "lucide-react";
import Link from "next/link";

export interface BuyerEnquiryItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  date: string;
  status: string;
  message: string;
}

interface BuyerEnquiriesClientProps {
  initialEnquiries: BuyerEnquiryItem[];
}

export default function BuyerEnquiriesClient({
  initialEnquiries
}: BuyerEnquiriesClientProps) {
  const enquiries = initialEnquiries;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "READ":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "REPLIED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const filteredEnquiries = enquiries.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.propertyTitle.toLowerCase().includes(query) ||
      item.agentName.toLowerCase().includes(query) ||
      item.message.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-none">My Enquiries</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1.5">View your message history and conversations with Ghana real estate agents.</p>
      </div>

      {/* Search Bar */}
      <div className="flex bg-white border border-gray-100 rounded-3xl p-4 shadow-sm items-center justify-between">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search enquiries by agent, property, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none font-semibold"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
        </div>
      </div>

      {/* Enquiries List */}
      {filteredEnquiries.length > 0 ? (
        <div className="space-y-4">
          {filteredEnquiries.map((enq) => {
            const isExpanded = expandedId === enq.id;
            return (
              <div
                key={enq.id}
                onClick={() => handleToggleExpand(enq.id)}
                className="bg-white border border-gray-100 rounded-3xl p-5 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col gap-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4">
                  
                  {/* Property Image & Agent Info */}
                  <div className="flex gap-4 items-start min-w-0">
                    <img
                      src={enq.propertyImage}
                      alt={enq.propertyTitle}
                      className="h-12 w-16 object-cover rounded-xl bg-gray-50 border border-gray-100 shrink-0"
                    />
                    <div className="min-w-0 leading-tight space-y-1">
                      <h4 className="font-extrabold text-gray-900 text-sm truncate" title={enq.propertyTitle}>
                        {enq.propertyTitle}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-semibold">
                        Agent Partner: <span className="font-bold text-gray-700">{enq.agentName}</span> • {enq.date}
                      </p>
                    </div>
                  </div>

                  {/* Badges & Expand trigger */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(enq.status)}`}>
                      {enq.status}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-gray-400" /> : <ChevronDown className="h-4.5 w-4.5 text-gray-400" />}
                  </div>

                </div>

                {/* Message & Expanded details */}
                <div className="text-xs font-semibold leading-relaxed text-gray-600">
                  {isExpanded ? (
                    <div className="space-y-4 pt-2 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">My Message</p>
                        <p className="whitespace-pre-line bg-gray-50 p-4 rounded-2xl border border-gray-100 text-gray-800">
                          {enq.message}
                        </p>
                      </div>

                      {/* Agent contact metadata */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 text-xs font-bold text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 uppercase tracking-wider text-[10px] w-12 block">Email:</span>
                          <span className="text-gray-800">{enq.agentEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 uppercase tracking-wider text-[10px] w-12 block">Phone:</span>
                          <span className="text-gray-800">{enq.agentPhone || "Not specified"}</span>
                        </div>
                      </div>

                      {/* Quick Reply / Navigation CTAs */}
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/properties/${enq.propertyId}`}
                          className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-950 text-white font-black px-4 py-2 rounded-xl text-xs transition-colors shadow"
                        >
                          <Building className="h-4 w-4" /> View Listing Detail
                        </Link>

                        {enq.agentPhone && (
                          <a
                            href={`https://wa.me/${enq.agentPhone.replace(/[^\d]/g, "")}?text=Hi%20${encodeURIComponent(enq.agentName)},%20I%20sent%20an%20enquiry%20on%20Reltiva%20regarding%20"${encodeURIComponent(enq.propertyTitle)}".`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs transition-colors shadow"
                          >
                            <MessageSquare className="h-4 w-4" /> Chat on WhatsApp
                          </a>
                        )}

                        <a
                          href={`mailto:${enq.agentEmail}?subject=Enquiry%20regarding%20"${encodeURIComponent(enq.propertyTitle)}"`}
                          className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 font-black px-4 py-2 rounded-xl text-xs transition-colors"
                        >
                          <Mail className="h-4 w-4" /> Send Email
                        </a>

                        {enq.agentPhone && (
                          <a
                            href={`tel:${enq.agentPhone}`}
                            className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-black px-4 py-2 rounded-xl text-xs transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5" /> Direct Call
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-450 font-medium truncate">{enq.message}</p>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
            <Inbox className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-gray-800 text-base">No enquiries sent yet</h3>
            <p className="text-xs text-gray-400 font-semibold max-w-xs mx-auto">Found a property you like? Fill out the sidebar form on the property details page to start a conversation.</p>
          </div>
          <Link
            href="/search"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1 mt-2"
          >
            <Plus className="h-4 w-4" /> Start Searching Properties
          </Link>
        </div>
      )}

    </div>
  );
}
