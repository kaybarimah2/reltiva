"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Filter,
  DollarSign,
  TrendingUp,
  Award,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

export interface AdminSubscriptionItem {
  id: string;
  agentName: string;
  plan: string; // "FREE", "BASIC", "PRO"
  status: string; // "ACTIVE", "EXPIRED", "CANCELLED"
  start: string;
  end: string;
  ref: string;
}

interface AdminSubscriptionsClientProps {
  initialSubscriptions: AdminSubscriptionItem[];
  mrr: number;
  activeProCount: number;
  activeBasicCount: number;
}

export default function AdminSubscriptionsClient({
  initialSubscriptions,
  mrr,
  activeProCount,
  activeBasicCount
}: AdminSubscriptionsClientProps) {
  const [subscriptions] = useState<AdminSubscriptionItem[]>(initialSubscriptions);
  const [planFilter, setPlanFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const subsPerPage = 5;

  // Filtering
  const filteredSubs = subscriptions.filter((sub) => {
    const matchesPlan = planFilter === "ALL" || sub.plan === planFilter;
    const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
    return matchesPlan && matchesStatus;
  });

  // Pagination computations
  const totalPages = Math.ceil(filteredSubs.length / subsPerPage);
  const indexOfLastSub = currentPage * subsPerPage;
  const indexOfFirstSub = indexOfLastSub - subsPerPage;
  const currentSubs = filteredSubs.slice(indexOfFirstSub, indexOfLastSub);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "EXPIRED":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-none">Subscriptions</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1.5">Track agent subscription transactions, platform MRR, and expired membership logs.</p>
      </div>

      {/* Revenue and Active Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* MRR Revenue Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="leading-none text-left">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Monthly Revenue (MRR)</p>
            <p className="text-xl font-black text-gray-900 mt-1">GHS {mrr.toLocaleString()}</p>
          </div>
        </div>

        {/* Pro Subscriptions count */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div className="leading-none text-left">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Pro Agencies</p>
            <p className="text-xl font-black text-gray-900 mt-1">{activeProCount} Accounts</p>
          </div>
        </div>

        {/* Basic subscriptions count */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="leading-none text-left">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Basic Agents</p>
            <p className="text-xl font-black text-gray-900 mt-1">{activeBasicCount} Accounts</p>
          </div>
        </div>

      </div>

      {/* Filter Row */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Filter className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Plan:</span>
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Tiers</option>
            <option value="FREE">Free Agent (GHS 0/mo)</option>
            <option value="BASIC">Basic Agent (GHS 200/mo)</option>
            <option value="PRO">Pro Agency (GHS 500/mo)</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      {currentSubs.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                  <th className="py-4 px-6">Agent Partner</th>
                  <th className="py-4 px-4">Membership Plan</th>
                  <th className="py-4 px-4">Trigger Date</th>
                  <th className="py-4 px-4">Renewal Date</th>
                  <th className="py-4 px-4">Paystack Ref</th>
                  <th className="py-4 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                {currentSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/20">
                    <td className="py-4 px-6 font-extrabold text-gray-900">{sub.agentName}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded tracking-wider border ${
                        sub.plan === "PRO" 
                          ? "bg-amber-100 text-amber-800 border-amber-200" 
                          : sub.plan === "BASIC"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}>
                        {sub.plan}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500">{sub.start}</td>
                    <td className="py-4 px-4 text-gray-500">{sub.end}</td>
                    <td className="py-4 px-4 text-gray-400 font-mono font-medium">{sub.ref}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase border ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-50">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-colors disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-colors disabled:opacity-40"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
            <CreditCard className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-gray-800 text-base">No active transactions</h3>
            <p className="text-xs text-gray-400 font-semibold max-w-xs mx-auto">No subscriptions matching these filters are recorded in the database.</p>
          </div>
        </div>
      )}

    </div>
  );
}
