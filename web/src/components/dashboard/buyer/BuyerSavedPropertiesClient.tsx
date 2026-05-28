"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MapPin,
  ChevronRight,
  Plus
} from "lucide-react";

export interface SavedPropItem {
  id: string;
  title: string;
  price: number;
  location: string;
  beds: number;
  baths: number;
  image: string;
  isRent: boolean;
  savedAtTime: number;
}

interface BuyerSavedPropertiesClientProps {
  initialProperties: SavedPropItem[];
}

export default function BuyerSavedPropertiesClient({
  initialProperties
}: BuyerSavedPropertiesClientProps) {
  const [properties, setProperties] = useState(initialProperties);
  const [sortBy, setSortBy] = useState("RECENT");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Remove from saved (Heart Toggle)
  const handleRemove = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/saved-properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ propertyId: id })
      });
      if (res.ok) {
        setProperties(properties.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Error removing saved property", err);
    } finally {
      setLoadingId(null);
    }
  };

  // Sort properties client-side
  const getSortedProperties = () => {
    const list = [...properties];
    if (sortBy === "PRICE_ASC") {
      return list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "PRICE_DESC") {
      return list.sort((a, b) => b.price - a.price);
    }
    // Default: Recently Saved (by savedAtTime desc)
    return list.sort((a, b) => b.savedAtTime - a.savedAtTime);
  };

  const sortedProperties = getSortedProperties();

  return (
    <div className="space-y-6 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-none">Saved Properties</h1>
          <p className="text-sm text-gray-500 font-semibold mt-1.5">Quickly track prices, status updates, or contact listing agents.</p>
        </div>

        {properties.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="RECENT">Recently Saved</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
            </select>
          </div>
        )}
      </div>

      {/* Grid of Saved Properties */}
      {sortedProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProperties.map((prop) => (
            <div
              key={prop.id}
              className="group flex flex-col bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
            >
              {/* Heart Badge/Toggle */}
              <button
                onClick={() => handleRemove(prop.id)}
                disabled={loadingId === prop.id}
                className="absolute top-4 right-4 h-9 w-9 bg-white/95 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow hover:scale-105 active:scale-95 transition-all z-10 disabled:opacity-50"
                title="Remove from Saved"
              >
                <Heart className={`h-5 w-5 fill-red-500 stroke-red-500 ${loadingId === prop.id ? "animate-pulse" : ""}`} />
              </button>

              {/* Card Image */}
              <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                <img
                  src={prop.image}
                  alt={prop.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-gray-900 text-sm line-clamp-1 leading-snug" title={prop.title}>
                    {prop.title}
                  </h4>
                  <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {prop.location}
                  </p>
                </div>

                <div className="flex gap-4 text-xs font-bold text-gray-400">
                  <span>{prop.beds} Beds</span>
                  <span>{prop.baths} Baths</span>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                  <div className="leading-none text-left">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Price</span>
                    <span className="text-base font-black text-emerald-600">
                      GHS {prop.price.toLocaleString()}
                      {prop.isRent && <span className="text-xs font-bold text-gray-400">/mo</span>}
                    </span>
                  </div>

                  <Link
                    href={`/properties/${prop.id}`}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold px-3 py-2 rounded-xl text-xs transition-colors flex items-center gap-0.5"
                  >
                    Details <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <Heart className="h-8 w-8 fill-red-500 stroke-red-500" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-gray-800 text-base">No saved properties yet</h3>
            <p className="text-xs text-gray-400 font-semibold max-w-xs mx-auto">Explore houses listed across Ghana and tap the heart icon on any ad to save it here.</p>
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
