"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  Eye,
  Check,
  Trash2,
  Filter,
  X,
  User,
  ShieldAlert
} from "lucide-react";

export interface AdminReportItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  reporterName: string;
  reporterEmail: string;
  reason: string;
  details: string;
  date: string;
  status: string; // "PENDING", "RESOLVED", "DISMISSED"
}

interface AdminReportsClientProps {
  initialReports: AdminReportItem[];
}

export default function AdminReportsClient({ initialReports }: AdminReportsClientProps) {
  const [reports, setReports] = useState<AdminReportItem[]>(initialReports);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const activeReport = reports.find((r) => r.id === activeReportId);

  // Mark Reviewed (RESOLVED)
  const handleMarkReviewed = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: id, status: "RESOLVED" })
      });
      if (res.ok) {
        setReports(reports.map((r) => (r.id === id ? { ...r, status: "RESOLVED" } : r)));
        setActiveReportId(null);
        setSuccessMsg("Report marked as resolved.");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Failed to resolve report", err);
    } finally {
      setLoading(false);
    }
  };

  // Dismiss Report
  const handleDismiss = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: id, status: "DISMISSED" })
      });
      if (res.ok) {
        setReports(reports.map((r) => (r.id === id ? { ...r, status: "DISMISSED" } : r)));
        setActiveReportId(null);
        setSuccessMsg("Report dismissed.");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Failed to dismiss report", err);
    } finally {
      setLoading(false);
    }
  };

  // Remove Property Listing (permanently removes the ad and cascades to report)
  const handleRemoveListing = async (reportId: string, propertyId: string, propertyTitle: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings?propertyId=${propertyId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setReports(reports.filter((r) => r.propertyId !== propertyId));
        setActiveReportId(null);
        setSuccessMsg(`Listing "${propertyTitle}" has been removed.`);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Failed to remove listing", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredReports = reports.filter((r) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "OPEN" || statusFilter === "PENDING") {
      return r.status === "PENDING" || r.status === "OPEN";
    }
    if (statusFilter === "REVIEWED" || statusFilter === "RESOLVED") {
      return r.status === "RESOLVED" || r.status === "REVIEWED";
    }
    return r.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
      case "PENDING":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "REVIEWED":
      case "RESOLVED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DISMISSED":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-none">Reports Inbox</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1.5">Review issues flagged by platform users. Inspect suspicious profiles or block scam advertisements.</p>
      </div>

      {/* Success alert message */}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded-2xl border border-emerald-100 flex items-center gap-2">
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter row */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-3">
        <Filter className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Filter status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
        >
          <option value="ALL">All Reports</option>
          <option value="OPEN">Open (Pending)</option>
          <option value="REVIEWED">Resolved (Reviewed)</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
      </div>

      {/* Reports Table */}
      {filteredReports.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                  <th className="py-4 px-6">Subject Property</th>
                  <th className="py-4 px-4">Reporter</th>
                  <th className="py-4 px-4">Reason Type</th>
                  <th className="py-4 px-4">Flagged Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                {filteredReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-gray-50/20">
                    
                    {/* Subject Property */}
                    <td className="py-4 px-6 min-w-[240px]">
                      <h4 className="font-extrabold text-gray-900 line-clamp-1 truncate max-w-[200px]" title={rep.propertyTitle}>
                        {rep.propertyTitle}
                      </h4>
                    </td>

                    {/* Reporter */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-900 leading-tight">{rep.reporterName}</p>
                      <span className="text-[10px] text-gray-400 font-medium">{rep.reporterEmail}</span>
                    </td>

                    {/* Reason */}
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-700 border border-red-100 text-[9px] font-bold">
                        {rep.reason}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-gray-400 font-medium">{rep.date}</td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${getStatusColor(rep.status)}`}>
                        {rep.status === "PENDING" ? "OPEN" : rep.status === "RESOLVED" ? "RESOLVED" : rep.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setActiveReportId(rep.id)}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-0.5 ml-auto border border-purple-100"
                      >
                        Inspect Report <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-gray-800 text-base">No complaints reported</h3>
            <p className="text-xs text-gray-400 font-semibold max-w-xs mx-auto">All Reltiva ads comply with listings guidelines. The reports inbox is currently empty.</p>
          </div>
        </div>
      )}

      {/* INSPECT REPORT DRAWER */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setActiveReportId(null)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 z-10 text-left border-l border-gray-100">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="font-black text-gray-900 text-sm">Complaint Inspection</h3>
              </div>
              <button
                onClick={() => setActiveReportId(null)}
                className="p-1.5 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Target Property */}
              <div className="space-y-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Flagged listing</p>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex justify-between items-center">
                  <h4 className="font-extrabold text-gray-900 text-xs truncate max-w-[200px]" title={activeReport.propertyTitle}>
                    {activeReport.propertyTitle}
                  </h4>
                  <Link
                    href={`/properties/${activeReport.propertyId}`}
                    target="_blank"
                    className="p-1.5 bg-white text-gray-700 hover:text-emerald-600 border border-gray-200 rounded-xl flex items-center gap-0.5 text-[10px] font-bold"
                  >
                    View Ad <Eye className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Complaint details */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Complaint reason</p>
                  <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-700 border border-red-100 text-[9px] font-bold">
                    {activeReport.reason}
                  </span>
                </div>
                <div className="p-4 bg-red-50/30 border border-red-100 rounded-2xl text-xs font-semibold text-gray-700 leading-relaxed">
                  {activeReport.details}
                </div>
              </div>

              {/* Reporter details */}
              <div className="space-y-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Submitted by</p>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-3">
                  <div className="h-9 w-9 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <div className="leading-tight text-xs">
                    <p className="font-extrabold text-gray-800">{activeReport.reporterName}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{activeReport.reporterEmail}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Actions Drawer */}
            <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDismiss(activeReport.id)}
                disabled={loading}
                className="py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 disabled:opacity-50"
              >
                Dismiss Report
              </button>
              <button
                onClick={() => handleMarkReviewed(activeReport.id)}
                disabled={loading}
                className="py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-100 disabled:opacity-50"
              >
                Mark Reviewed
              </button>
              <button
                onClick={() => handleRemoveListing(activeReport.id, activeReport.propertyId, activeReport.propertyTitle)}
                disabled={loading}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove Ad
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
