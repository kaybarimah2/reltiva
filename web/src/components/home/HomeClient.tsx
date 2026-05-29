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
  BedDouble,
  Bath,
  ArrowRight,
  Heart,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [searchTab, setSearchTab] = useState<"buy" | "rent" | "sold">("buy");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const handleSearch = () => {
    let url = `/search?location=${encodeURIComponent(location)}`;
    if (searchTab === "buy") {
      url += "&type=SALE";
    } else if (searchTab === "rent") {
      url += "&type=RENT";
    } else if (searchTab === "sold") {
      url += "&type=SALE&status=SOLD";
    }
    router.push(url);
  };

  // Toggle saving listings locally for guests
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

  const formatPropertyTitle = (bedrooms: number, type: string, listingType: string) => {
    const typeLabel = type.replace("_", " ").toLowerCase();
    const actionLabel = listingType === "SALE" ? "for sale" : "to rent";
    if (type === "LAND") {
      return `Premium land ${actionLabel}`;
    }
    return `${bedrooms > 0 ? `${bedrooms} bedroom ` : ""}${typeLabel} ${actionLabel}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Search Section - Mimicking Rightmove "Find your happy" */}
      <section className="relative h-[520px] flex items-center justify-center overflow-hidden bg-brand-navy">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-100"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/35 to-brand-navy/60" />

        <div className="relative z-10 max-w-3xl w-full px-4 text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight text-shadow-sm">
              Find your happy.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 font-medium max-w-md mx-auto">
              Search properties for sale and to rent in Ghana
            </p>
          </div>

          {/* Glassmorphism search box */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-[24px] shadow-2xl max-w-2xl w-full mx-auto text-left space-y-5">
            {/* Tabs List */}
            <div>
              <div className="flex gap-2" role="tablist">
                <button
                  role="tab"
                  aria-selected={searchTab === "buy"}
                  onClick={() => setSearchTab("buy")}
                  data-id="buy"
                  data-monitor-testid="for-sale-tab"
                  className={`px-4 py-2 text-sm sm:text-base font-bold transition-all rounded-full focus:outline-none font-sans text-white ${
                    searchTab === "buy"
                      ? "bg-white/20"
                      : "opacity-70 hover:opacity-100 hover:bg-white/5"
                  }`}
                >
                  Buy
                </button>
                <button
                  role="tab"
                  aria-selected={searchTab === "rent"}
                  onClick={() => setSearchTab("rent")}
                  data-id="rent"
                  data-monitor-testid="to-rent-tab"
                  className={`px-4 py-2 text-sm sm:text-base font-bold transition-all rounded-full focus:outline-none font-sans text-white ${
                    searchTab === "rent"
                      ? "bg-white/20"
                      : "opacity-70 hover:opacity-100 hover:bg-white/5"
                  }`}
                >
                  Rent
                </button>
                <button
                  role="tab"
                  aria-selected={searchTab === "sold"}
                  onClick={() => setSearchTab("sold")}
                  data-id="sold"
                  data-monitor-testid="sold-prices-tab"
                  className={`px-4 py-2 text-sm sm:text-base font-bold transition-all rounded-full focus:outline-none font-sans text-white ${
                    searchTab === "sold"
                      ? "bg-white/20"
                      : "opacity-70 hover:opacity-100 hover:bg-white/5"
                  }`}
                >
                  Sold
                </button>
              </div>
            </div>

            {/* Tab Panel */}
            <div role="tabpanel" id={`panel-${searchTab}`} aria-labelledby={`tab-${searchTab}`} className="space-y-4">
              <h2 className="text-[17px] font-semibold text-white">
                {searchTab === "buy"
                  ? "Search properties to buy"
                  : searchTab === "rent"
                  ? "Search properties to rent"
                  : "Search sold house prices"}
              </h2>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <div data-testid="search-panel-typeahead" className="flex-1 relative flex items-center bg-white rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-brand-green transition-all">
                  <span aria-hidden="true" className="pl-4 text-gray-500">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M14.1922 15.6064C13.0236 16.4816 11.5723 17 10 17c-3.866 0-7-3.134-7-7s3.134-7 7-7 7 3.134 7 7c0 1.5723-.5184 3.0236-1.3936 4.1922l5.1007 5.1007c.3905.3905.3905 1.0237 0 1.4142s-1.0237.3905-1.4142 0zM15 10c0 2.7614-2.2386 5-5 5s-5-2.2386-5-5 2.2386-5 5-5 5 2.2386 5 5"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <input
                    id="ta_searchInput"
                    name="locationSearch"
                    type="text"
                    maxLength={100}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    className="w-full px-3 py-3.5 bg-transparent text-brand-navy font-bold placeholder-gray-400 text-base focus:outline-none"
                    placeholder={
                      searchTab === "buy"
                        ? "e.g. East Legon, Airport Residential or Cantonments"
                        : searchTab === "rent"
                        ? "e.g. Osu, Labone or Dzorwulu"
                        : "e.g. Accra, Kumasi or Tema"
                    }
                    data-testid="typeahead-searchbox"
                    data-monitor-testid={`${searchTab}-search-input`}
                    autoComplete="off"
                  />
                </div>

                <div className="ta_homepageControls flex">
                  <button
                    type="button"
                    onClick={handleSearch}
                    id="rmds_light-theme"
                    title="Search"
                    data-testid="searchCta"
                    data-monitor-testid={`${searchTab}-search-button`}
                    className="w-full sm:w-auto bg-brand-green hover:bg-brand-green-hover text-white font-extrabold py-3.5 px-8 rounded-xl text-base shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center whitespace-nowrap"
                  >
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instant Action Banner */}
      <section className="py-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-base font-bold text-brand-navy">Are you a property owner or real estate agent?</h3>
              <p className="text-xs text-gray-500">Reach thousands of home seekers in Ghana. List your apartments, houses, or land today.</p>
            </div>
            <Link
              href="/dashboard/agent"
              className="bg-brand-navy hover:bg-brand-navy/90 text-white text-xs font-bold px-6 py-2.5 rounded-lg tracking-wide uppercase transition-colors"
            >
              Advertise with us
            </Link>
          </div>
        </div>
      </section>

      {/* Property Type Shortcuts */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy tracking-tight">
              Browse by Property Type
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Select a category to filter listings instantly.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {PROPERTY_TYPES.map((pt, index) => (
              <Link
                key={index}
                href={`/search?propertyType=${pt.type}`}
                className="flex flex-col items-center p-4 border border-gray-150 bg-gray-50/50 hover:bg-white rounded-xl hover:shadow-md hover:border-brand-green/20 transition-all duration-300 group"
              >
                <div className="p-3 bg-brand-green/10 text-brand-green group-hover:bg-brand-green group-hover:text-white rounded-lg mb-3 transition-colors duration-300">
                  <pt.icon className="h-5 w-5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold text-brand-navy tracking-tight text-center">
                  {pt.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Carousel - Rightmove Clean Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy tracking-tight">
                Featured Properties
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Premium properties promoted by top verified agents.
              </p>
            </div>
            <div className="hidden sm:flex gap-2">
              <button className="h-8 w-8 border border-gray-200 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-600 active:scale-95 transition-all">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="h-8 w-8 border border-gray-200 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-600 active:scale-95 transition-all">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 -mx-4 px-4 sm:mx-0 sm:px-0">
            {featuredProperties.map((prop) => {
              const defaultImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600";
              const coverImage = prop.images && prop.images.length > 0 ? prop.images[0].url : defaultImage;
              return (
                <div
                  key={prop.id}
                  className="w-[280px] sm:w-[310px] bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm shrink-0 hover:shadow-md transition-shadow duration-300"
                >
                  <Link href={`/properties/${prop.id}`}>
                    <div className="h-44 relative bg-gray-100 cursor-pointer">
                      <img
                        src={coverImage}
                        alt={prop.title}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-brand-navy text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {prop.listingType === "SALE" ? "For Sale" : "For Rent"}
                      </span>
                    </div>
                  </Link>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-extrabold text-brand-navy">
                        {prop.currency} {prop.price.toLocaleString()}
                      </span>
                      {prop.listingType === "RENT" && (
                        <span className="text-xs text-gray-500 font-bold ml-0.5">/mo</span>
                      )}
                    </div>
                    <Link href={`/properties/${prop.id}`}>
                      <h3 className="font-bold text-brand-navy text-sm truncate hover:text-brand-green transition-colors cursor-pointer" title={prop.title}>
                        {formatPropertyTitle(prop.bedrooms, prop.type, prop.listingType)}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 truncate">{prop.neighborhood ? `${prop.neighborhood}, ${prop.city}` : prop.city}</p>
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 border-t border-gray-100 pt-2.5 mt-2">
                      <div className="flex items-center gap-1">
                        <BedDouble className="h-3.5 w-3.5 text-brand-green" />
                        {prop.bedrooms} Beds
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5 text-brand-green" />
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
      <section className="py-16 bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">How Reltiva works</h2>
            <p className="mt-2 text-gray-300 text-sm">
              We make the property search process direct, simple, and transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-brand-green flex items-center justify-center text-base font-extrabold mb-4">
                1
              </div>
              <h3 className="text-base font-bold mb-2">Search Location</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Filter and browse through verified listings across Ghana with high-resolution imagery and direct pricing.
              </p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-brand-green flex items-center justify-center text-base font-extrabold mb-4">
                2
              </div>
              <h3 className="text-base font-bold mb-2">Contact Directly</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Skip the middlemen. Connect with verified landlords and listing agents via WhatsApp, call, or email enquiry.
              </p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-brand-green flex items-center justify-center text-base font-extrabold mb-4">
                3
              </div>
              <h3 className="text-base font-bold mb-2">Close Securely</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Inspect physical properties, complete standard leasing/buying protocols, and move in without hassle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Listed Properties Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy tracking-tight">
              Recently Listed Properties
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Fresh properties uploaded across major regions in Ghana over the last 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {recentProperties.map((prop) => {
              const defaultImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600";
              const coverImage = prop.images && prop.images.length > 0 ? prop.images[0].url : defaultImage;
              return (
                <div
                  key={prop.id}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="h-48 relative bg-gray-100">
                    <Link href={`/properties/${prop.id}`}>
                      <img
                        src={coverImage}
                        alt={prop.title}
                        className="h-full w-full object-cover cursor-pointer"
                      />
                    </Link>
                    <span className="absolute top-3 left-3 bg-brand-navy text-white text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wide uppercase">
                      {prop.listingType === "SALE" ? "Buy" : "Rent"}
                    </span>
                    <button
                      onClick={() => toggleSave(prop.id)}
                      className="absolute top-3 right-3 h-8 w-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-600 transition-colors focus:outline-none z-10"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          savedIds.includes(prop.id)
                            ? "fill-red-500 stroke-red-500"
                            : "stroke-brand-navy"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-extrabold text-brand-navy">
                        {prop.currency} {prop.price.toLocaleString()}
                      </span>
                      {prop.listingType === "RENT" && (
                        <span className="text-xs text-gray-500 font-bold ml-0.5">/mo</span>
                      )}
                    </div>
                    <Link href={`/properties/${prop.id}`}>
                      <h3 className="font-bold text-brand-navy text-sm group-hover:text-brand-green transition-colors truncate cursor-pointer">
                        {formatPropertyTitle(prop.bedrooms, prop.type, prop.listingType)}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 truncate">{prop.neighborhood ? `${prop.neighborhood}, ${prop.city}` : prop.city}</p>
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 border-t border-gray-100 pt-2.5 mt-2">
                      <div className="flex items-center gap-1">
                        <BedDouble className="h-3.5 w-3.5 text-brand-green" />
                        {prop.bedrooms} Beds
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5 text-brand-green" />
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
              className="flex items-center gap-1.5 border border-brand-navy hover:bg-brand-navy hover:text-white text-brand-navy font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              View all listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Locations Quick Search Grid - Rightmove Layout style */}
      <section className="py-16 bg-white border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy tracking-tight">Popular searches in Ghana</h2>
            <p className="text-xs text-gray-500 mt-1">Explore real estate options in top hotspots and regions.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            {/* Column 1: Accra Sales */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-brand-navy border-b border-gray-100 pb-2">Accra Properties for Sale</h3>
              <ul className="space-y-2 text-xs text-gray-600 font-semibold">
                <li><Link href="/search?type=SALE&location=East+Legon" className="hover:text-brand-green transition-colors">Properties for sale in East Legon</Link></li>
                <li><Link href="/search?type=SALE&location=Airport+Residential" className="hover:text-brand-green transition-colors">Properties for sale in Airport Residential</Link></li>
                <li><Link href="/search?type=SALE&location=Cantonments" className="hover:text-brand-green transition-colors">Properties for sale in Cantonments</Link></li>
                <li><Link href="/search?type=SALE&location=Spintex" className="hover:text-brand-green transition-colors">Properties for sale in Spintex</Link></li>
                <li><Link href="/search?type=SALE&location=Tema" className="hover:text-brand-green transition-colors">Properties for sale in Tema</Link></li>
              </ul>
            </div>

            {/* Column 2: Accra Rent */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-brand-navy border-b border-gray-100 pb-2">Accra Properties to Rent</h3>
              <ul className="space-y-2 text-xs text-gray-600 font-semibold">
                <li><Link href="/search?type=RENT&location=Osu" className="hover:text-brand-green transition-colors">Properties to rent in Osu</Link></li>
                <li><Link href="/search?type=RENT&location=Labone" className="hover:text-brand-green transition-colors">Properties to rent in Labone</Link></li>
                <li><Link href="/search?type=RENT&location=Dzorwulu" className="hover:text-brand-green transition-colors">Properties to rent in Dzorwulu</Link></li>
                <li><Link href="/search?type=RENT&location=Roman+Ridge" className="hover:text-brand-green transition-colors">Properties to rent in Roman Ridge</Link></li>
                <li><Link href="/search?type=RENT&location=East+Legon" className="hover:text-brand-green transition-colors">Properties to rent in East Legon</Link></li>
              </ul>
            </div>

            {/* Column 3: Kumasi Searches */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-brand-navy border-b border-gray-100 pb-2">Kumasi Properties</h3>
              <ul className="space-y-2 text-xs text-gray-600 font-semibold">
                <li><Link href="/search?location=Ahodwo" className="hover:text-brand-green transition-colors">Properties in Ahodwo</Link></li>
                <li><Link href="/search?location=Nhyiaeso" className="hover:text-brand-green transition-colors">Properties in Nhyiaeso</Link></li>
                <li><Link href="/search?location=Asokwa" className="hover:text-brand-green transition-colors">Properties in Asokwa</Link></li>
                <li><Link href="/search?location=Kwadaso" className="hover:text-brand-green transition-colors">Properties in Kwadaso</Link></li>
                <li><Link href="/search?location=Ridge+Kumasi" className="hover:text-brand-green transition-colors">Properties in Ridge, Kumasi</Link></li>
              </ul>
            </div>

            {/* Column 4: Other Key Regions */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-brand-navy border-b border-gray-100 pb-2">Regions & Cities</h3>
              <ul className="space-y-2 text-xs text-gray-600 font-semibold">
                <li><Link href="/search?location=Takoradi" className="hover:text-brand-green transition-colors">Properties in Sekondi-Takoradi</Link></li>
                <li><Link href="/search?location=Cape+Coast" className="hover:text-brand-green transition-colors">Properties in Cape Coast</Link></li>
                <li><Link href="/search?location=Tamale" className="hover:text-brand-green transition-colors">Properties in Tamale</Link></li>
                <li><Link href="/search?location=Koforidua" className="hover:text-brand-green transition-colors">Properties in Koforidua</Link></li>
                <li><Link href="/search?location=Ho" className="hover:text-brand-green transition-colors">Properties in Ho, Volta Region</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Spotlight */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy tracking-tight">
              Agent Spotlight
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Get in touch with certified real estate firms active in Ghana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topAgents.map((agent, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-20 w-20 relative mb-4 rounded-full overflow-hidden border-2 border-brand-green">
                  <img
                    src={agent.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300"}
                    alt={agent.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-1 justify-center mb-0.5">
                  <h3 className="font-bold text-brand-navy text-sm">{agent.name}</h3>
                  {agent.profile?.verified && (
                    <CheckCircle className="h-4 w-4 text-brand-green fill-brand-green/20" />
                  )}
                </div>
                <p className="text-xs text-gray-500 font-semibold">{agent.profile?.agency || "Independent Broker"}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-brand-green/10 text-brand-green font-bold rounded-full text-xs">
                  {agent._count.properties} Active Listings
                </span>
                <Link
                  href="/search"
                  className="mt-4 text-xs font-bold text-brand-navy hover:text-brand-green transition-colors"
                >
                  View Listings &rarr;
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
