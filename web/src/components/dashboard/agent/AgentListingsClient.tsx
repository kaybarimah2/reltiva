"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building,
  Plus,
  Eye,
  Mail,
  Edit2,
  Trash2,
  Star,
  AlertTriangle
} from "lucide-react";

export interface AgentListingItem {
  id: string;
  title: string;
  price: number;
  type: string;
  listingType: string;
  status: string;
  views: number;
  enquiries: number;
  image: string;
  featured: boolean;
}

interface AgentListingsClientProps {
  initialProperties: AgentListingItem[];
}

export default function AgentListingsClient({ initialProperties }: AgentListingsClientProps) {
  const [properties, setProperties] = useState<AgentListingItem[]>(initialProperties);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Update property status via PATCH API
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setLoadingId(id);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update property status");
      }

      setProperties(
        properties.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  // Toggle Featured status via PATCH API
  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    setLoadingId(id);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentFeatured })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update featured status");
      }

      setProperties(
        properties.map((p) => (p.id === id ? { ...p, featured: !currentFeatured } : p))
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to toggle featured");
    } finally {
      setLoadingId(null);
    }
  };

  // Delete Property via DELETE API
  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setLoadingId(deleteTargetId);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/properties/${deleteTargetId}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete property");
      }

      setProperties(properties.filter((p) => p.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete property");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SOLD":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "RENTED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "UNDER_OFFER":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-none">My Listings</h1>
          <p className="text-sm text-gray-500 font-semibold mt-1.5">Manage, update statuses, or create property ads.</p>
        </div>

        <Link
          href="/dashboard/agent/listings/new"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4.5 py-2.5 rounded-xl text-sm transition-all shadow shadow-emerald-600/10 flex items-center justify-center gap-1.5 w-full sm:w-auto"
        >
          <Plus className="h-4.5 w-4.5" /> Add New Listing
        </Link>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-xs font-semibold p-4 rounded-xl border border-red-100">
          {errorMsg}
        </div>
      )}

      {/* Grid displays */}
      {properties.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                  <th className="py-4 px-6">Property Details</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Performance</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                {properties.map((prop) => (
                  <tr key={prop.id} className={`hover:bg-gray-50/20 ${loadingId === prop.id ? "opacity-60" : ""}`}>
                    
                    {/* Thumbnail & Title */}
                    <td className="py-4 px-6 flex gap-4 items-center min-w-[280px]">
                      <div className="h-14 w-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 relative">
                        <img src={prop.image} alt={prop.title} className="h-full w-full object-cover" />
                        {prop.featured && (
                          <span className="absolute top-1 left-1 bg-amber-500 text-white p-0.5 rounded-md" title="Featured Property">
                            <Star className="h-2.5 w-2.5 fill-white stroke-none" />
                          </span>
                        )}
                      </div>
                      <div className="leading-tight">
                        <h4 className="font-extrabold text-gray-900 text-sm line-clamp-1" title={prop.title}>
                          {prop.title}
                        </h4>
                        <p className="text-xs text-emerald-600 font-black mt-1">
                          GHS {prop.price.toLocaleString()}
                          {prop.listingType === "RENT" && <span className="text-[10px] font-bold text-gray-400">/mo</span>}
                        </p>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">
                          {prop.type.replace("_", " ")}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(prop.status)}`}>
                        {prop.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Stats */}
                    <td className="py-4 px-4 text-xs font-bold text-gray-500">
                      <div className="flex flex-col gap-1 leading-none text-left">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-gray-400" /> {prop.views} Views
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-gray-400" /> {prop.enquiries} Enquiries
                        </span>
                      </div>
                    </td>

                    {/* Actions Panel */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        
                        {/* Status Toggle buttons */}
                        {prop.status === "AVAILABLE" && (
                          <>
                            {prop.listingType === "SALE" ? (
                              <button
                                disabled={loadingId !== null}
                                onClick={() => handleUpdateStatus(prop.id, "SOLD")}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 disabled:opacity-50"
                              >
                                Mark Sold
                              </button>
                            ) : (
                              <button
                                disabled={loadingId !== null}
                                onClick={() => handleUpdateStatus(prop.id, "RENTED")}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100 disabled:opacity-50"
                              >
                                Mark Rented
                              </button>
                            )}
                          </>
                        )}

                        {prop.status !== "AVAILABLE" && (
                          <button
                            disabled={loadingId !== null}
                            onClick={() => handleUpdateStatus(prop.id, "AVAILABLE")}
                            className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-lg border border-gray-200 disabled:opacity-50"
                          >
                            Mark Available
                          </button>
                        )}

                        {/* Featured Pro Plan Toggle */}
                        <button
                          disabled={loadingId !== null}
                          onClick={() => handleToggleFeatured(prop.id, prop.featured)}
                          className={`p-1.5 rounded-xl border transition-colors disabled:opacity-50 ${
                            prop.featured
                              ? "bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100/50"
                              : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100"
                          }`}
                          title={prop.featured ? "Remove from Featured (Pro Plan)" : "Feature this listing (Pro Plan)"}
                        >
                          <Star className={`h-4 w-4 ${prop.featured ? "fill-amber-500" : ""}`} />
                        </button>

                        {/* Edit Button */}
                        <Link
                          href={`/dashboard/agent/listings/edit/${prop.id}`}
                          className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition-colors inline-block"
                          title="Edit Property"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          disabled={loadingId !== null}
                          onClick={() => setDeleteTargetId(prop.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-100 transition-colors disabled:opacity-50"
                          title="Delete Property"
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
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
            <Building className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-gray-800 text-base">No properties listed yet</h3>
            <p className="text-xs text-gray-400 font-semibold">Start marketing your properties and receive direct buyer enquiries today.</p>
          </div>
          <Link
            href="/dashboard/agent/listings/new"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1 mt-2"
          >
            <Plus className="h-4 w-4" /> Create First Listing
          </Link>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setDeleteTargetId(null)} />
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 w-full max-w-sm relative z-10 text-left space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-black text-gray-900 text-base">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Are you sure you want to permanently delete this listing? This action is irreversible and all views, stats, and enquiries associated with this listing will be lost.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600"
              >
                No, Keep It
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
