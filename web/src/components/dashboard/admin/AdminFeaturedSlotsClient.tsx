"use client";

import React, { useState } from "react";
import {
  Star,
  Plus,
  Trash2,
  X,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Search
} from "lucide-react";

export interface FeaturedListingItem {
  id: string; // Property ID
  title: string;
  price: number;
  start: string;
  end: string;
  image: string;
}

export interface EligibleListingItem {
  id: string; // Property ID
  title: string;
  price: number;
  image: string;
}

interface AdminFeaturedSlotsClientProps {
  initialFeatured: FeaturedListingItem[];
  initialEligibleListings: EligibleListingItem[];
}

export default function AdminFeaturedSlotsClient({
  initialFeatured,
  initialEligibleListings
}: AdminFeaturedSlotsClientProps) {
  const [featured, setFeatured] = useState<FeaturedListingItem[]>(initialFeatured);
  const [eligibleListings, setEligibleListings] = useState<EligibleListingItem[]>(initialEligibleListings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const maxSlots = 10;
  const currentSlotsCount = featured.length;

  // New Featured Form State
  const [form, setForm] = useState({
    propertyId: "",
    start: new Date().toISOString().split("T")[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  });
  const [modalSearch, setModalSearch] = useState("");

  // Remove featured listing
  const handleRemoveFeatured = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: false })
      });
      if (res.ok) {
        const removedItem = featured.find((f) => f.id === id);
        if (removedItem) {
          setFeatured(featured.filter((f) => f.id !== id));
          // Put back to eligible
          setEligibleListings([
            ...eligibleListings,
            { id: removedItem.id, title: removedItem.title, price: removedItem.price, image: removedItem.image }
          ]);
          setSuccessMsg(`Listing "${removedItem.title}" removed from featured slots.`);
          setTimeout(() => setSuccessMsg(""), 3000);
        }
      }
    } catch (err) {
      console.error("Failed to remove featured listing", err);
    } finally {
      setLoading(false);
    }
  };

  // Add featured listing submit
  const handleAddFeatured = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.propertyId || !form.start || !form.end) return;

    if (currentSlotsCount >= maxSlots) {
      alert("Featured slots limit reached! Please remove an existing slot first.");
      return;
    }

    const matchedProp = eligibleListings.find((p) => p.id === form.propertyId);
    if (!matchedProp) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${form.propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: true })
      });

      if (res.ok) {
        const newFeatured: FeaturedListingItem = {
          id: matchedProp.id,
          title: matchedProp.title,
          price: matchedProp.price,
          start: form.start,
          end: form.end,
          image: matchedProp.image
        };

        setFeatured([...featured, newFeatured]);
        setEligibleListings(eligibleListings.filter((p) => p.id !== form.propertyId));
        setIsModalOpen(false);
        setSuccessMsg(`Featured listing: "${matchedProp.title}" configured successfully!`);
        setTimeout(() => setSuccessMsg(""), 2500);

        // Reset Form
        setForm({
          propertyId: "",
          start: new Date().toISOString().split("T")[0],
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        });
      }
    } catch (err) {
      console.error("Failed to feature listing", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-none">Featured Slots</h1>
          <p className="text-sm text-gray-500 font-semibold mt-1.5">Feature premium listings on homepage scrolls. Limit promotions to maintain exclusivity.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-black px-4.5 py-2.5 rounded-xl text-sm transition-all shadow shadow-purple-600/10 flex items-center justify-center gap-1.5 w-full sm:w-auto"
        >
          <Plus className="h-4.5 w-4.5" /> Feature Active Listing
        </button>
      </div>

      {/* Success alert */}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded-2xl border border-emerald-100 flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Slot Capacity indicator bar */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 leading-none">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Promotional Slot Limits</span>
          <h3 className="text-base font-black text-gray-800">
            {currentSlotsCount} of {maxSlots} Slots Occupied
          </h3>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">Maximum limit set to {maxSlots} properties to preserve premium positioning.</p>
        </div>

        {/* Capacity Bar Indicator */}
        <div className="w-full sm:w-60 h-3 bg-gray-100 rounded-full overflow-hidden shrink-0 border border-gray-200/50">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              currentSlotsCount / maxSlots >= 0.8
                ? "bg-red-500"
                : currentSlotsCount / maxSlots >= 0.5
                ? "bg-amber-500"
                : "bg-purple-600"
            }`}
            style={{ width: `${(currentSlotsCount / maxSlots) * 100}%` }}
          />
        </div>
      </div>

      {/* Featured Slots Grid */}
      {featured.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
            >
              
              {/* Star Indicator / delete */}
              <button
                onClick={() => handleRemoveFeatured(item.id)}
                disabled={loading}
                className="absolute top-4 right-4 h-9 w-9 bg-white/95 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow hover:scale-105 active:scale-95 transition-all z-10 disabled:opacity-50"
                title="Remove Featured Slot"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>

              {/* Card Image */}
              <div className="h-40 w-full bg-gray-100 relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-3 left-3 bg-amber-500 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-white stroke-none" /> Featured
                </span>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5 text-left">
                  <h4 className="font-extrabold text-gray-900 text-xs line-clamp-1 leading-snug" title={item.title}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-emerald-600 font-black">
                    GHS {item.price.toLocaleString()}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-gray-50 flex flex-col gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider text-left">
                  <span>Start: <span className="text-gray-700 font-semibold tracking-normal">{item.start}</span></span>
                  <span>End: <span className="text-gray-700 font-semibold tracking-normal">{item.end}</span></span>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
            <Star className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-gray-800 text-base">No active promotions</h3>
            <p className="text-xs text-gray-400 font-semibold max-w-xs mx-auto">Select active listings from registered agents to schedule on featured homepage banners.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1 mt-2"
          >
            <Plus className="h-4 w-4" /> Feature First Listing
          </button>
        </div>
      )}

      {/* SCHEDULE FEATURED MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <form
            onSubmit={handleAddFeatured}
            className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 w-full max-w-md relative z-10 text-left space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-1.5">
                <Sliders className="h-5 w-5 text-purple-600" /> Schedule Featured ad
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-950 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {currentSlotsCount >= maxSlots ? (
              <div className="bg-red-50 text-red-700 text-xs font-semibold p-4 rounded-2xl border border-red-100 flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>Featured capacity reached! Remove a listing to assign this slot.</span>
              </div>
            ) : (
              <div className="space-y-3.5">
                
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Select Property *</label>
                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder="Search active properties..."
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    required
                    value={form.propertyId}
                    onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none"
                  >
                    <option value="">Choose Active Listing...</option>
                    {eligibleListings.filter(p => 
                      p.title.toLowerCase().includes(modalSearch.toLowerCase())
                    ).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} (GHS {p.price.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={form.start}
                      onChange={(e) => setForm({ ...form, start: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">End Date *</label>
                    <input
                      type="date"
                      required
                      value={form.end}
                      onChange={(e) => setForm({ ...form, end: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={currentSlotsCount >= maxSlots || loading}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm disabled:opacity-50"
              >
                {loading ? "Assigning..." : "Assign Featured Slot"}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
