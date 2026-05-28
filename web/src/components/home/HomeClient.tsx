"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import {
  Building2,
  Home,
  Map,
  Briefcase,
  Users,
  Compass,
  Search,
  BedDouble,
  Bath,
  ArrowRight,
  Heart,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

interface PropertyImage {
  id: string;
  url: string;
}

interface DBProperty {
  id: string;
  title: string;
  price: number;
  currency: string;
  type: string;
  listingType: string;
  bedrooms: number;
  bathrooms: number;
  city: string;
  neighborhood: string;
  images: PropertyImage[];
}

interface DBAgent {
  name: string;
  avatar: string | null;
  profile: {
    agency: string | null;
    verified: boolean;
  } | null;
  _count: {
    properties: number;
  };
}

interface HomeClientProps {
  featuredProperties: DBProperty[];
  recentProperties: DBProperty[];
  topAgents: DBAgent[];
}

const PROPERTY_TYPES = [
  { name: "Apartment", icon: Building2, type: "APARTMENT" },
  { name: "House", icon: Home, type: "HOUSE" },
  { name: "Land", icon: Map, type: "LAND" },
  { name: "Commercial", icon: Briefcase, type: "COMMERCIAL" },
  { name: "Compound House", icon: Users, type: "COMPOUND_HOUSE" },
  { name: "Chamber & Hall", icon: Compass, type: "CHAMBER_AND_HALL" },
];

export default function HomeClient({
  featuredProperties,
  recentProperties,
  topAgents
}: HomeClientProps) {
  const [searchTab, setSearchTab] = useState<"BUY" | "RENT" | "DEVELOPMENTS">("BUY");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Simple client-side toggle for saved properties (guests save to state or localStorage)
  const toggleSave = (id: string) => {
    let updated: string[];
    if (savedIds.includes(id)) {
      updated = savedIds.filter((x) => x !== id);
    } else {
      updated = [...savedIds, id];
    }
    setSavedIds(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("reltiva_saved_listings", JSON.stringify(updated));
    }
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("reltiva_saved_listings");
      if (stored) {
        try {
          setSavedIds(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 transition-all duration-[10s]"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-gray-950/40" />

        <div className="relative z-10 max-w-4xl w-full px-4 text-center space-y-6">
          <div className="space-y-3">
            <span className="inline-block bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider">
              Affordable Housing Platform for Ghana
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Find Your Perfect Home in Ghana
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 max-w-xl mx-auto font-medium">
              Rent, buy, or list properties with transparent pricing in Ghana Cedis (GHS).
            </p>
          </div>

          {/* Search Panel Container */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20 text-left max-w-3xl mx-auto">
            {/* Search Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-100 pb-3">
              {(["BUY", "RENT", "DEVELOPMENTS"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSearchTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    searchTab === tab
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {tab === "BUY" ? "Buy" : tab === "RENT" ? "Rent" : "New Homes"}
                </button>
              ))}
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Location Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. East Legon, Kumasi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Property Type Dropdown */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  <option value="">Any Type</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="LAND">Land</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="COMPOUND_HOUSE">Compound House</option>
                  <option value="CHAMBER_AND_HALL">Chamber and Hall</option>
                </select>
              </div>

              {/* Max Price Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Max Price (GHS)
                </label>
                <input
                  type="number"
                  placeholder="Any price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Bedrooms Dropdown */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Bedrooms
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  <option value="">Any Beds</option>
                  <option value="1">1 Bed</option>
                  <option value="2">2 Beds</option>
                  <option value="3">3 Beds</option>
                  <option value="4">4 Beds</option>
                  <option value="5">5+ Beds</option>
                </select>
              </div>
            </div>

            {/* Search Submit Button */}
            <div className="mt-4 flex sm:justify-end">
              <Link
                href={`/search?type=${searchTab === "DEVELOPMENTS" ? "SALE" : searchTab}&location=${location}&typeSelected=${propertyType}&maxPrice=${maxPrice}&beds=${bedrooms}`}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10"
              >
                <Search className="h-4 w-4" />
                Search Properties
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Property Type Quick Links */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Browse by Property Type
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Select one of our popular categories to start looking at custom listings.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {PROPERTY_TYPES.map((pt, index) => (
              <Link
                key={index}
                href={`/search?propertyType=${pt.type}`}
                className="flex flex-col items-center p-5 border border-gray-100 bg-gray-50/50 hover:bg-white rounded-2xl hover:shadow-lg hover:border-emerald-100 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="p-3 bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white rounded-xl mb-3 transition-colors duration-300">
                  <pt.icon className="h-6 w-6 stroke-[2]" />
                </div>
                <span className="text-sm font-bold text-gray-800 tracking-tight text-center">
                  {pt.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Featured Properties
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Handpicked premium properties matching our high quality benchmarks.
              </p>
            </div>
            <div className="hidden sm:flex gap-2">
              <button className="h-10 w-10 border border-gray-200 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-600 active:scale-95 transition-all">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="h-10 w-10 border border-gray-200 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-600 active:scale-95 transition-all">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Carousel wrapper */}
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 -mx-4 px-4 sm:mx-0 sm:px-0">
            {featuredProperties.map((prop) => {
              const defaultImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600";
              const coverImage = prop.images && prop.images.length > 0 ? prop.images[0].url : defaultImage;
              return (
                <div
                  key={prop.id}
                  className="w-[280px] sm:w-[320px] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm shrink-0 hover:shadow-lg transition-shadow duration-300"
                >
                  <Link href={`/properties/${prop.id}`}>
                    <div className="h-48 relative bg-gray-100 cursor-pointer">
                      <img
                        src={coverImage}
                        alt={prop.title}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg text-xs tracking-wider uppercase">
                        {prop.listingType === "SALE" ? "For Sale" : "For Rent"}
                      </span>
                      <span className="absolute bottom-3 right-3 bg-gray-950/70 text-white font-bold px-2 py-0.5 rounded-lg text-[10px] uppercase">
                        {prop.type.replace("_", " ")}
                      </span>
                    </div>
                  </Link>
                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-xl font-black text-emerald-600">
                        {prop.currency} {prop.price.toLocaleString()}
                      </span>
                      {prop.listingType === "RENT" && (
                        <span className="text-xs text-gray-500 font-bold ml-1">/mo</span>
                      )}
                    </div>
                    <Link href={`/properties/${prop.id}`}>
                      <h3 className="font-bold text-gray-900 text-sm truncate hover:text-emerald-600 transition-colors cursor-pointer" title={prop.title}>
                        {prop.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 truncate">{prop.neighborhood ? `${prop.neighborhood}, ${prop.city}` : prop.city}</p>
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-700 border-t border-gray-50 pt-3">
                      <div className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4 text-emerald-500" />
                        {prop.bedrooms} Beds
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4 text-emerald-500" />
                        {prop.bathrooms} Baths
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {featuredProperties.length === 0 && (
              <div className="w-full text-center py-8 text-gray-400 text-xs font-bold">No featured properties found.</div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-black tracking-tight">How Reltiva Works</h2>
            <p className="mt-2 text-emerald-100 text-sm">
              We make the process of securing a home in Ghana simple, direct, and hassle-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-bold mb-2">Search Properties</h3>
              <p className="text-sm text-emerald-100">
                Filter by location, price, and amenity. Browse verified photos and detailed property features.
              </p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-bold mb-2">Connect Directly</h3>
              <p className="text-sm text-emerald-100">
                Use our direct WhatsApp buttons, phone numbers, or email forms to contact agents without middlemen fees.
              </p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-bold mb-2">Move In Securely</h3>
              <p className="text-sm text-emerald-100">
                Inspect your properties, agree on prices, and complete transactions following our standard safety guides.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Listed Properties Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Recently Listed Properties
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Fresh listings added by verified agents across Ghana over the past 24 hours.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {recentProperties.map((prop) => {
              const defaultImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600";
              const coverImage = prop.images && prop.images.length > 0 ? prop.images[0].url : defaultImage;
              return (
                <div
                  key={prop.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="h-56 relative bg-gray-100">
                    <Link href={`/properties/${prop.id}`}>
                      <img
                        src={coverImage}
                        alt={prop.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                      />
                    </Link>
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-lg text-[10px] tracking-wider uppercase">
                        {prop.listingType === "SALE" ? "Buy" : "Rent"}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleSave(prop.id)}
                      className="absolute top-3 right-3 h-8 w-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-600 transition-colors focus:outline-none z-10"
                    >
                      <Heart
                        className={`h-4.5 w-4.5 ${
                          savedIds.includes(prop.id)
                            ? "fill-red-500 stroke-red-500"
                            : "stroke-gray-600"
                        }`}
                      />
                    </button>
                    <span className="absolute bottom-3 right-3 bg-gray-950/70 text-white font-bold px-2 py-0.5 rounded-lg text-[10px] uppercase">
                      {prop.type.replace("_", " ")}
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xl font-black text-emerald-600">
                          {prop.currency} {prop.price.toLocaleString()}
                        </span>
                        {prop.listingType === "RENT" && (
                          <span className="text-xs text-gray-500 font-bold ml-1">/mo</span>
                        )}
                      </div>
                    </div>
                    <Link href={`/properties/${prop.id}`}>
                      <h3 className="font-bold text-gray-900 text-sm group-hover:text-emerald-600 transition-colors truncate cursor-pointer">
                        {prop.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 truncate">{prop.neighborhood ? `${prop.neighborhood}, ${prop.city}` : prop.city}</p>
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-700 border-t border-gray-50 pt-3">
                      <div className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4 text-emerald-500" />
                        {prop.bedrooms} Beds
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4 text-emerald-500" />
                        {prop.bathrooms} Baths
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {recentProperties.length === 0 && (
              <div className="w-full text-center py-8 text-gray-400 text-xs font-bold col-span-3">No recent properties found.</div>
            )}
          </div>

          <div className="flex justify-center">
            <Link
              href="/search"
              className="flex items-center gap-2 border border-emerald-600 hover:bg-emerald-50 text-emerald-700 font-bold px-8 py-3 rounded-xl transition-colors"
            >
              View All Listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Agent Spotlight Section */}
      <section className="py-16 bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Agent Spotlight
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Get in touch with certified real estate agents who have active listings in Ghana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topAgents.map((agent, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-gray-50/50"
              >
                <div className="h-24 w-24 relative mb-4 rounded-full overflow-hidden border-2 border-emerald-500">
                  <img
                    src={agent.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300"}
                    alt={agent.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-1.5 justify-center mb-0.5">
                  <h3 className="font-bold text-gray-900 text-base">{agent.name}</h3>
                  {agent.profile?.verified && (
                    <CheckCircle className="h-4 w-4 text-emerald-500 fill-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium">{agent.profile?.agency || "Independent Agent"}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-xs">
                  {agent._count.properties} Active Listings
                </span>
                <Link
                  href="/search"
                  className="mt-4 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  View Listings ➡️
                </Link>
              </div>
            ))}
            {topAgents.length === 0 && (
              <div className="w-full text-center py-8 text-gray-400 text-xs font-bold col-span-3">No agents found.</div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
