"use client";

import React, { useState } from "react";
import {
  Mail,
  MailOpen,
  MessageSquare,
  Phone,
  Search,
  Inbox,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export interface AgentEnquiryItem {
  id: string;
  buyerName: string;
  property: string;
  date: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
}

interface AgentEnquiriesClientProps {
  initialEnquiries: AgentEnquiryItem[];
}

export default function AgentEnquiriesClient({ initialEnquiries }: AgentEnquiriesClientProps) {
  const [enquiries, setEnquiries] = useState<AgentEnquiryItem[]>(initialEnquiries);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Sync read status on the backend PATCH API
  const syncReadStatus = async (id: string, read: boolean) => {
    try {
      await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: read ? "READ" : "NEW" })
      });
    } catch (err) {
      console.error("Failed to sync read status:", err);
    }
  };

  // Toggle expand enquiry card
  const handleToggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      
      // Find the enquiry to check if it's currently unread
      const target = enquiries.find((e) => e.id === id);
      if (target && !target.read) {
        // Mark as read locally
        setEnquiries(
          enquiries.map((e) => (e.id === id ? { ...e, read: true } : e))
        );
        // Sync on backend
        syncReadStatus(id, true);
      }
    }
  };

  // Toggle mark read/unread manually
  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = enquiries.find((item) => item.id === id);
    if (!target) return;

    const newReadState = !target.read;
    
    // Update locally
    setEnquiries(
      enquiries.map((item) => (item.id === id ? { ...item, read: newReadState } : item))
    );

    // Sync on backend
    syncReadStatus(id, newReadState);
  };

  // Filtering Logic
  const filteredEnquiries = enquiries.filter((item) => {
    const matchesFilter =
      filterStatus === "ALL" ||
      (filterStatus === "UNREAD" && !item.read) ||
      (filterStatus === "READ" && item.read);

    const matchesSearch =
      item.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-none">Enquiries Inbox</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1.5">Manage and respond to purchase and tenancy enquiries from buyers.</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
        
        {/* Read Status Filters */}
        <div className="flex bg-gray-50 border border-gray-100 p-1.5 rounded-2xl gap-1 w-full sm:w-auto">
          {(["ALL", "UNREAD", "READ"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                filterStatus === status
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by buyer, property or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Enquiries rows */}
      {filteredEnquiries.length > 0 ? (
        <div className="space-y-4">
          {filteredEnquiries.map((enq) => {
            const isExpanded = expandedId === enq.id;
            return (
              <div
                key={enq.id}
                onClick={() => handleToggleExpand(enq.id)}
                className={`bg-white border rounded-3xl p-5 hover:shadow-md transition-all duration-200 cursor-pointer text-left flex flex-col gap-4 relative overflow-hidden ${
                  enq.read ? "border-gray-100" : "border-emerald-500 ring-2 ring-emerald-500/10"
                }`}
              >
                {/* Unread Indicator dot */}
                {!enq.read && (
                  <div className="absolute top-5 left-0 w-1 bg-emerald-500 bottom-5 rounded-r" />
                )}

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 items-center">
                      <h3 className="font-extrabold text-gray-900 text-sm">{enq.buyerName}</h3>
                      <span className="text-[10px] text-gray-400 font-bold">{enq.date}</span>
                    </div>
                    <p className="text-xs font-bold text-emerald-600 truncate" title={enq.property}>
                      {enq.property}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Mark Read/Unread toggler button */}
                    <button
                      onClick={(e) => handleToggleRead(enq.id, e)}
                      className={`p-1.5 hover:bg-gray-50 rounded-xl transition-colors ${
                        enq.read ? "text-gray-400 hover:text-emerald-600" : "text-emerald-600 hover:text-gray-400"
                      }`}
                      title={enq.read ? "Mark as Unread" : "Mark as Read"}
                    >
                      {enq.read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    </button>

                    {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-gray-400" /> : <ChevronDown className="h-4.5 w-4.5 text-gray-400" />}
                  </div>
                </div>

                {/* Message preview or expanded details */}
                <div className="text-xs font-semibold leading-relaxed text-gray-600">
                  {isExpanded ? (
                    <div className="space-y-4">
                      {/* Expanded text block */}
                      <p className="whitespace-pre-line bg-gray-50/50 p-4 rounded-2xl border border-gray-100 text-gray-800">
                        {enq.message}
                      </p>

                      {/* Contact metadata info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-50 pt-4 text-xs font-bold text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 uppercase tracking-wider text-[10px] w-12 block">Email:</span>
                          <span className="text-gray-800">{enq.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 uppercase tracking-wider text-[10px] w-12 block">Phone:</span>
                          <span className="text-gray-800">{enq.phone}</span>
                        </div>
                      </div>

                      {/* Reply CTAs */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        <a
                          href={`https://wa.me/${enq.phone.replace(/[^\d]/g, "")}?text=Hi%20${encodeURIComponent(enq.buyerName)},%20thank%20you%20for%20enquiring%20about%20"${encodeURIComponent(enq.property)}".`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs transition-colors shadow"
                        >
                          <MessageSquare className="h-4 w-4" /> Reply via WhatsApp
                        </a>
                        <a
                          href={`mailto:${enq.email}?subject=Enquiry:%20${encodeURIComponent(enq.property)}`}
                          className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 font-black px-4 py-2 rounded-xl text-xs transition-colors"
                        >
                          <Mail className="h-4 w-4" /> Reply via Email
                        </a>
                        <a
                          href={`tel:${enq.phone}`}
                          className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-black px-4 py-2 rounded-xl text-xs transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5" /> Direct Call
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 font-medium truncate">{enq.message}</p>
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
            <h3 className="font-extrabold text-gray-800 text-base">No enquiries found</h3>
            <p className="text-xs text-gray-400 font-semibold">Your inbox is clean. Buyer enquiries for your properties will appear here.</p>
          </div>
        </div>
      )}

    </div>
  );
}
