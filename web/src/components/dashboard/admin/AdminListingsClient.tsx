"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building,
  Search,
  Check,
  XCircle,
  Flag,
  Trash2,
  Filter,
  Eye,
  X,
  AlertTriangle,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

export interface AdminListingItem {
  id: string;
  title: string;
  location: string;
  agent: string;
  type: string;
  price: number;
  status: string;
  date: string;
  image: string;
}

interface AdminListingsClientProps {
  initialListings: AdminListingItem[];
}

export default function AdminListingsClient({ initialListings }: AdminListingsClientProps) {
  const [listings, setListings] = useState<AdminListingItem[]>(initialListings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 5;

  // Rejection and Deletion Modal States
  const [rejectTarget, setRejectTarget] = useState<{ id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Approve Listing Action
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: id, action: "APPROVE" })
      });
      if (res.ok) {
        setListings(listings.map((l) => (l.id === id ? { ...l, status: "ACTIVE" } : l)));
      }
    } catch (err) {
      console.error("Failed to approve listing", err);
    }
  };

  // Flag Suspicious Listing Action
  const handleFlag = async (id: string) => {
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: id, action: "FLAG" })
      });
      if (res.ok) {
        setListings(listings.map((l) => (l.id === id ? { ...l, status: "FLAGGED" } : l)));
      }
    } catch (err) {
      console.error("Failed to flag listing", err);
    }
  };

  // Reject Listing Submit
  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget || !rejectReason.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: rejectTarget.id, action: "REJECT", rejectionReason: rejectReason })
      });
      if (res.ok) {
        setListings(
          listings.map((l) =>
            l.id === rejectTarget.id ? { ...l, status: "REJECTED" } : l
          )
        );
        setRejectTarget(null);
        setRejectReason("");
      }
    } catch (err) {
      console.error("Failed to reject listing", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete Listing Confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings?propertyId=${deleteTargetId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setListings(listings.filter((l) => l.id !== deleteTargetId));
        setDeleteTargetId(null);
      }
    } catch (err) {
      console.error("Failed to delete listing", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredListings = listings.filter((l) => {
    const matchesSearch = 
      l.title.toLowerCase().includes(search.toLowerCase()) || 
      l.location.toLowerCase().includes(search.toLowerCase()) ||
      l.agent.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination math
  const totalPages = Math.ceil(filteredListings.length / listingsPerPage);
  const indexOfLastListing = currentPage * listingsPerPage;
  const indexOfFirstListing = indexOfLastListing - listingsPerPage;
  const currentListings = filteredListings.slice(indexOfFirstListing, indexOfLastListing);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-100";
      case "FLAGGED":
        return "bg-rose-100 text-rose-800 border-rose-200 animate-pulse";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-none">Listing Moderation</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1.5">Moderate property submissions. Approve matching ads or reject listings violating platform guidelines.</p>
      </div>

      {/* Filter and Search Bar row */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by title, location, or agent..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-purple-500 focus:outline-none"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="ACTIVE">Active</option>
            <option value="REJECTED">Rejected</option>
            <option value="FLAGGED">Flagged</option>
          </select>
        </div>

      </div>

      {/* Listings Table */}
      {currentListings.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                  <th className="py-4 px-6">Property</th>
                  <th className="py-4 px-4">Agent</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Submitted</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                {currentListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50/20">
                    
                    {/* Thumbnail & Title */}
                    <td className="py-4 px-6 flex gap-3.5 items-center min-w-[280px]">
                      <img
                        src={listing.image}
                        alt=""
                        className="h-10 w-14 object-cover rounded-lg bg-gray-50 border border-gray-100 shrink-0"
                      />
                      <div className="leading-tight">
                        <h4 className="font-extrabold text-gray-900 line-clamp-1 truncate max-w-[200px]" title={listing.title}>
                          {listing.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{listing.location}</p>
                      </div>
                    </td>

                    {/* Agent */}
                    <td className="py-4 px-4 text-gray-900">{listing.agent}</td>

                    {/* Type */}
                    <td className="py-4 px-4">
                      <span className="text-[9px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded tracking-wider">
                        {listing.type.replace("_", " ")}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 text-emerald-600 font-extrabold">
                      GHS {listing.price.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase border ${getStatusColor(listing.status)}`}>
                        {listing.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-gray-400 font-medium">{listing.date}</td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        {listing.status === "PENDING" && (
                          <button
                            onClick={() => handleApprove(listing.id)}
                            className="p-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg"
                            title="Approve Listing"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {listing.status !== "REJECTED" && (
                          <button
                            onClick={() => setRejectTarget({ id: listing.id, title: listing.title })}
                            className="p-1 text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg"
                            title="Reject Listing"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        {listing.status !== "FLAGGED" && (
                          <button
                            onClick={() => handleFlag(listing.id)}
                            className="p-1 text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-lg"
                            title="Flag as Suspicious"
                          >
                            <Flag className="h-4 w-4" />
                          </button>
                        )}
                        <Link
                          href={`/properties/${listing.id}`}
                          className="p-1 text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg"
                          title="View Listing Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTargetId(listing.id)}
                          className="p-1 text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg"
                          title="Delete Listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
            <Building className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-gray-800 text-base">No matching listings</h3>
            <p className="text-xs text-gray-400 font-semibold max-w-xs mx-auto">Try adjusting your filters or search keywords to locate property listings.</p>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setRejectTarget(null)} />
          <form
            onSubmit={handleRejectConfirm}
            className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 w-full max-w-md relative z-10 text-left space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-1.5">
                <XCircle className="h-5 w-5 text-red-600" /> Reject Property ad
              </h3>
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="p-1 text-gray-400 hover:text-gray-950 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Please specify the reason for rejecting <span className="font-extrabold text-gray-900">&quot;{rejectTarget.title}&quot;</span>. The agent will receive this message detailing what guidelines they failed to meet.
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Rejection Reason *</label>
              <textarea
                required
                rows={4}
                placeholder="e.g. Image resolution is too low, or listed price contains invalid currency formats..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-red-500 font-semibold"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs disabled:opacity-50"
              >
                {loading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE LISTING CONFIRMATION MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setDeleteTargetId(null)} />
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 w-full max-w-sm relative z-10 text-left space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-black text-gray-900 text-base">Confirm Listing Deletion</h3>
            </div>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Are you sure you want to permanently delete this listing from the database? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
