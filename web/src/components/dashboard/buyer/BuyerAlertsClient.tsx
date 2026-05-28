"use client";

import React, { useState } from "react";
import {
  Bell,
  Trash2,
  Plus,
  X,
  Sliders,
  CheckCircle,
  MapPin
} from "lucide-react";

export interface BuyerAlertItem {
  id: string;
  location: string;
  propertyType: string;
  listingType: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  frequency: string;
  isActive: boolean;
  lastTriggered: string;
}

interface BuyerAlertsClientProps {
  initialAlerts: BuyerAlertItem[];
}

export default function BuyerAlertsClient({
  initialAlerts
}: BuyerAlertsClientProps) {
  const [alerts, setAlerts] = useState<BuyerAlertItem[]>(initialAlerts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Alert Form State
  const [form, setForm] = useState({
    location: "",
    propertyType: "APARTMENT",
    listingType: "RENT",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    frequency: "Daily"
  });

  // Toggle active alert
  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive })
      });
      if (res.ok) {
        setAlerts(
          alerts.map((al) => (al.id === id ? { ...al, isActive: !al.isActive } : al))
        );
      }
    } catch (err) {
      console.error("Failed to toggle alert active state", err);
    }
  };

  // Delete Alert
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setAlerts(alerts.filter((al) => al.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete alert", err);
    }
  };

  // Create alert submit
  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.location) return;

    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        const newAlertDb = await res.json();
        const filters = typeof newAlertDb.filters === "string" 
          ? JSON.parse(newAlertDb.filters) 
          : newAlertDb.filters;

        const newAlert: BuyerAlertItem = {
          id: newAlertDb.id,
          location: filters.location,
          propertyType: filters.propertyType,
          listingType: filters.listingType,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          bedrooms: filters.bedrooms,
          frequency: newAlertDb.frequency,
          isActive: filters.isActive,
          lastTriggered: "Never triggered"
        };

        setAlerts([newAlert, ...alerts]);
        setIsModalOpen(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);

        // Reset Form
        setForm({
          location: "",
          propertyType: "APARTMENT",
          listingType: "RENT",
          minPrice: "",
          maxPrice: "",
          bedrooms: "",
          frequency: "Daily"
        });
      }
    } catch (err) {
      console.error("Failed to save search alert", err);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-none">Property Alerts</h1>
          <p className="text-sm text-gray-500 font-semibold mt-1.5">Manage search parameters and receive immediate emails when matching homes list.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4.5 py-2.5 rounded-xl text-sm transition-all shadow shadow-emerald-600/10 flex items-center justify-center gap-1.5 w-full sm:w-auto"
        >
          <Plus className="h-4.5 w-4.5" /> Create New Alert
        </button>
      </div>

      {/* Success notifier */}
      {saveSuccess && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded-2xl border border-emerald-100 flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>New property search alert configured successfully!</span>
        </div>
      )}

      {/* Alerts Grid */}
      {alerts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {alerts.map((al) => (
            <div
              key={al.id}
              className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${
                al.isActive ? "border-emerald-100" : "border-gray-100 opacity-70"
              }`}
            >
              <div className="space-y-4">
                
                {/* Location and Category badges */}
                <div className="flex justify-between items-start gap-4">
                  <div className="leading-snug">
                    <p className="font-extrabold text-gray-900 text-sm flex items-center gap-1">
                      <MapPin className="h-4.5 w-4.5 text-emerald-500 shrink-0" /> {al.location}
                    </p>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">
                      {al.propertyType.replace("_", " ")} • {al.listingType === "SALE" ? "Buy" : "Rent"}
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={al.isActive}
                      onChange={() => handleToggleActive(al.id, al.isActive)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                  </label>
                </div>

                {/* Search specifications details */}
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-600 border-y border-gray-50 py-3.5 text-left">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Price boundaries</span>
                    <span className="text-gray-900 mt-0.5 block font-bold">
                      {al.minPrice > 0 || al.maxPrice > 0 ? (
                        <>
                          GHS {al.minPrice.toLocaleString()} - {al.maxPrice > 0 ? al.maxPrice.toLocaleString() : "Any"}
                        </>
                      ) : (
                        "Any Price"
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Bedrooms size</span>
                    <span className="text-gray-900 mt-0.5 block font-bold">{al.bedrooms > 0 ? `${al.bedrooms} Beds` : "Any Bedrooms"}</span>
                  </div>
                </div>

              </div>

              {/* Card actions */}
              <div className="flex justify-between items-center pt-4 mt-4">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {al.frequency} email notifications • Triggered: {al.lastTriggered}
                </span>

                <button
                  onClick={() => handleDelete(al.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100/50"
                  title="Delete Alert"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
            <Bell className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-gray-800 text-base">No property alerts set up</h3>
            <p className="text-xs text-gray-400 font-semibold max-w-xs mx-auto">Create a customized property alert to monitor Ghana real estate and get emailed immediately when matches load.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1 mt-2"
          >
            <Plus className="h-4 w-4" /> Setup First Alert
          </button>
        </div>
      )}

      {/* CREATE ALERT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <form
            onSubmit={handleSaveAlert}
            className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 w-full max-w-md relative z-10 text-left space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-1.5">
                <Sliders className="h-5 w-5 text-emerald-600" /> Create Search Alert
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-950 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Location / Area *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. East Legon, Accra"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Listing Type</label>
                  <select
                    value={form.listingType}
                    onChange={(e) => setForm({ ...form, listingType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  >
                    <option value="SALE">Buy / Sale</option>
                    <option value="RENT">Rent / Lease</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Property Type</label>
                  <select
                    value={form.propertyType}
                    onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  >
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                    <option value="LAND">Land</option>
                    <option value="COMMERCIAL">Commercial Space</option>
                    <option value="CHAMBER_AND_HALL">Chamber and Hall</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Min Price (GHS)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1000"
                    value={form.minPrice}
                    onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Max Price (GHS)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={form.maxPrice}
                    onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Bedrooms</label>
                  <input
                    type="number"
                    placeholder="e.g. 2"
                    value={form.bedrooms}
                    onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  >
                    <option value="Daily">Daily Summary</option>
                    <option value="Weekly">Weekly Digest</option>
                  </select>
                </div>
              </div>

            </div>

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
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                Save Search Alert
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
