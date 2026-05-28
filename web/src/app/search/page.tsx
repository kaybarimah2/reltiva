"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  Map as MapIcon,
  X,
  Heart,
  BedDouble,
  Bath,
  Maximize2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check
} from "lucide-react";

// Mock database listings (based on the prisma seed data)
interface PropertyItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: string;
  listingType: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  size: number | null;
  region: string;
  city: string;
  neighborhood: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  agentName: string;
  agentAvatar: string;
  image: string;
  amenities: string[];
  furnishing: string;
  createdAt: string;
}

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Northern",
  "Volta",
  "Bono",
  "Ahafo",
];

const CITIES_BY_REGION: Record<string, string[]> = {
  "Greater Accra": ["Accra", "Tema", "Kasoa", "Madina", "Adenta"],
  Ashanti: ["Kumasi", "Obuasi", "Konongo"],
  Western: ["Takoradi", "Sekondi", "Tarkwa"],
  Central: ["Cape Coast", "Elmina", "Kasoa"],
  Northern: ["Tamale", "Yendi"],
  Volta: ["Ho", "Keta"],
};

const NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  Accra: ["East Legon", "Cantonments", "Airport Residential", "Spintex", "Osu", "Labone", "Achimota", "Dome", "Teshie", "Nungua"],
  Tema: ["Community 1", "Community 12", "Community 25"],
  Madina: ["Zongo Junction", "Social Welfare", "Madina Estates"],
  Adenta: ["Barrier", "Frafraha", "Housing Downs"],
  Kumasi: ["Nhyiaeso", "Asokwa", "Patasi", "KNUST Area", "Adum"],
  Takoradi: ["Beach Road", "Anaji", "Harbour Area"],
  Tamale: ["Fuo", "Kalariga", "Tamale Central"],
};

const AMENITIES_LIST = [
  { id: "Pool", label: "Swimming Pool" },
  { id: "Generator", label: "Standby Generator" },
  { id: "Security", label: "24/7 Security" },
  { id: "Parking", label: "Parking Space" },
  { id: "AC", label: "Air Conditioning" },
  { id: "Boys Quarters", label: "Boys Quarters" },
  { id: "Water Tank", label: "Water Tank / Polytank" },
  { id: "Borehole", label: "Borehole" },
];

function SearchPageBody() {
  const searchParams = useSearchParams();

  // Search/Filter State
  const [region, setRegion] = useState(searchParams.get("region") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [neighborhood, setNeighborhood] = useState(searchParams.get("neighborhood") || "");
  const [listingType, setListingType] = useState<"SALE" | "RENT" | "ANY">(
    (searchParams.get("type") as "SALE" | "RENT" | "ANY") || "ANY"
  );
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("beds") || "");
  const [bathrooms, setBathrooms] = useState("");
  const [furnishing, setFurnishing] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // UI state
  const [viewMode, setViewMode] = useState<"GRID" | "LIST" | "MAP">("GRID");
  const [sortOption, setSortOption] = useState("NEWEST");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [totalPropertiesCount, setTotalPropertiesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  // Filter dynamic lists
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableNeighborhoods, setAvailableNeighborhoods] = useState<string[]>([]);

  // Update cascade dropdowns
  useEffect(() => {
    if (region && CITIES_BY_REGION[region]) {
      setAvailableCities(CITIES_BY_REGION[region]);
    } else {
      setAvailableCities([]);
      setCity("");
    }
  }, [region]);

  useEffect(() => {
    if (city && NEIGHBORHOODS_BY_CITY[city]) {
      setAvailableNeighborhoods(NEIGHBORHOODS_BY_CITY[city]);
    } else {
      setAvailableNeighborhoods([]);
      setNeighborhood("");
    }
  }, [city]);

  // Load from search params initially
  useEffect(() => {
    const typeParam = searchParams.get("typeSelected");
    if (typeParam) setPropertyType(typeParam);
    const locParam = searchParams.get("location");
    if (locParam) {
      const matchedRegion = GHANA_REGIONS.find((r) =>
        r.toLowerCase().includes(locParam.toLowerCase())
      );
      if (matchedRegion) setRegion(matchedRegion);
    }
  }, [searchParams]);

  // Load saved property IDs for logged in users, fallback to LocalStorage for guests
  useEffect(() => {
    async function loadSavedProperties() {
      if (session?.user) {
        try {
          const res = await fetch("/api/saved-properties");
          const data = await res.json();
          if (data.savedIds) {
            setSavedIds(data.savedIds);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
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
      }
    }
    loadSavedProperties();
  }, [session]);

  // Fetch properties from database API
  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (region) queryParams.set("region", region);
        if (city) queryParams.set("city", city);
        if (neighborhood) queryParams.set("neighborhood", neighborhood);
        if (listingType !== "ANY") queryParams.set("listingType", listingType);
        if (propertyType) queryParams.set("propertyType", propertyType);
        if (minPrice) queryParams.set("minPrice", minPrice);
        if (maxPrice) queryParams.set("maxPrice", maxPrice);
        if (bedrooms) queryParams.set("bedrooms", bedrooms);
        if (bathrooms) queryParams.set("bathrooms", bathrooms);
        if (furnishing) queryParams.set("furnishing", furnishing);
        if (selectedAmenities.length > 0) {
          queryParams.set("amenities", selectedAmenities.join(","));
        }
        queryParams.set("sort", sortOption);
        queryParams.set("page", String(currentPage));
        queryParams.set("limit", String(viewMode === "MAP" ? 4 : 6));

        const res = await fetch(`/api/properties?${queryParams.toString()}`);
        const data = await res.json();
        if (data.properties) {
          setProperties(data.properties);
          setTotalPropertiesCount(data.total);
        }
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, [
    region,
    city,
    neighborhood,
    listingType,
    propertyType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    furnishing,
    selectedAmenities,
    sortOption,
    currentPage,
    viewMode
  ]);

  // Toggle Amenity check
  const toggleAmenity = (id: string) => {
    if (selectedAmenities.includes(id)) {
      setSelectedAmenities(selectedAmenities.filter((x) => x !== id));
    } else {
      setSelectedAmenities([...selectedAmenities, id]);
    }
  };

  const handleClearFilters = () => {
    setRegion("");
    setCity("");
    setNeighborhood("");
    setListingType("ANY");
    setPropertyType("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setBathrooms("");
    setFurnishing("");
    setSelectedAmenities([]);
    setCurrentPage(1);
  };

  // Saved/Heart listing toggle
  const toggleSave = async (id: string) => {
    if (session?.user) {
      try {
        const res = await fetch("/api/saved-properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId: id })
        });
        const data = await res.json();
        if (data.saved) {
          setSavedIds([...savedIds, id]);
        } else {
          setSavedIds(savedIds.filter(x => x !== id));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
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
    }
  };

  const itemsPerPage = viewMode === "MAP" ? 4 : 6;
  const totalPages = Math.ceil(totalPropertiesCount / itemsPerPage) || 1;
  const paginatedProperties = properties;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 relative">
        {/* Mobile Sticky Filter/Sort bar */}
        <div className="md:hidden flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 shadow-sm sticky top-16 z-30">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-emerald-600 focus:outline-none"
          >
            <SlidersHorizontal className="h-4.5 w-4.5 text-emerald-600" />
            Filters
            {selectedAmenities.length + (region ? 1 : 0) + (propertyType ? 1 : 0) > 0 && (
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="text-xs font-bold text-gray-700 bg-gray-50 border-none rounded-lg py-1.5 focus:outline-none focus:ring-0"
            >
              <option value="NEWEST">Newest</option>
              <option value="PRICE_ASC">Price Low-High</option>
              <option value="PRICE_DESC">Price High-Low</option>
              <option value="MOST_POPULAR">Most Popular</option>
            </select>
            <button
              onClick={() => setViewMode(viewMode === "MAP" ? "GRID" : "MAP")}
              className="p-1.5 bg-gray-50 text-gray-600 rounded-lg"
            >
              <MapIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex gap-6">
          {/* 1. FILTER SIDEBAR (Desktop) */}
          <aside className="hidden md:block w-72 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm shrink-0 h-fit sticky top-20 self-start max-h-[85vh] overflow-y-auto scrollbar-thin">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Filter className="h-4.5 w-4.5 text-emerald-600" />
                Filter Options
              </h2>
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-5 text-left">
              {/* Location selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  <option value="">Select Region</option>
                  {GHANA_REGIONS.map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {region && availableCities.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    City / Town
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    <option value="">Select City</option>
                    {availableCities.map((c, i) => (
                      <option key={i} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {city && availableNeighborhoods.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Neighborhood
                  </label>
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    <option value="">Select Neighborhood</option>
                    {availableNeighborhoods.map((n, i) => (
                      <option key={i} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Listing Type Toggle */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Listing Type
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-50 border border-gray-100 rounded-xl">
                  {(["ANY", "SALE", "RENT"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setListingType(type)}
                      className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                        listingType === type
                          ? "bg-white text-emerald-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-950"
                      }`}
                    >
                      {type === "ANY" ? "Any" : type === "SALE" ? "Buy" : "Rent"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type Dropdown */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  <option value="">Any Type</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="LAND">Land</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="COMPOUND_HOUSE">Compound House</option>
                  <option value="CHAMBER_AND_HALL">Chamber and Hall</option>
                  <option value="BOYS_QUARTERS">Boys Quarters</option>
                </select>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Price Budget (GHS)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min GHS"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Max GHS"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Beds / Baths Selector */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Beds
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Any</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5+">5+</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Baths
                  </label>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>

              {/* Furnishing Status */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Furnishing
                </label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Any Status</option>
                  <option value="Furnished">Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>

              {/* Amenities checklist */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Amenities
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {AMENITIES_LIST.map((am) => (
                    <label key={am.id} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer select-none">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(am.id)}
                          onChange={() => toggleAmenity(am.id)}
                          className="sr-only"
                        />
                        <div
                          className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all ${
                            selectedAmenities.includes(am.id)
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {selectedAmenities.includes(am.id) && (
                            <Check className="h-3 w-3 stroke-[3]" />
                          )}
                        </div>
                      </div>
                      {am.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* 2. RESULTS CONTAINER */}
          <main className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Results Header (Desktop) */}
            <div className="hidden md:flex justify-between items-center bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm">
              <span className="text-sm font-semibold text-gray-600">
                <strong className="text-gray-900">{totalPropertiesCount}</strong> properties found
              </span>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort by</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="NEWEST">Newest</option>
                    <option value="PRICE_ASC">Price: Low to High</option>
                    <option value="PRICE_DESC">Price: High to Low</option>
                    <option value="MOST_POPULAR">Most Popular</option>
                  </select>
                </div>

                {/* View togglers */}
                <div className="flex bg-gray-50 border border-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode("GRID")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "GRID" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("LIST")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "LIST" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    }`}
                    title="List View"
                  >
                    <List className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("MAP")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "MAP" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    }`}
                    title="Split Map View"
                  >
                    <MapIcon className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Layout Switcher */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm min-h-[400px]">
                <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
                <h3 className="text-sm font-bold text-gray-900">Loading properties...</h3>
              </div>
            ) : paginatedProperties.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
                <SlidersHorizontal className="h-12 w-12 text-gray-300 stroke-[1.5] mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No properties match your filters</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                  Try clearing some of your selection options or location filters to see wider results.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === "MAP" ? (
              /* MAP VIEWER (Split screen) */
              <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[500px]">
                {/* Properties list (Left) */}
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[650px] pr-2 scrollbar-thin">
                  {paginatedProperties.map((prop) => (
                    <div
                      key={prop.id}
                      onMouseEnter={() => setHighlightedPropertyId(prop.id)}
                      onMouseLeave={() => setHighlightedPropertyId(null)}
                      className={`bg-white rounded-2xl overflow-hidden border p-4 flex gap-4 transition-all duration-300 hover:shadow-md ${
                        highlightedPropertyId === prop.id
                          ? "border-emerald-500 ring-2 ring-emerald-500/20"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="h-32 w-40 shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
                        <img src={prop.image} alt={prop.title} className="h-full w-full object-cover" />
                        <span className="absolute top-2 left-2 bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                          {prop.listingType === "SALE" ? "Buy" : "Rent"}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-emerald-600 uppercase">
                            {prop.type.replace("_", " ")}
                          </h4>
                          <h3 className="font-bold text-gray-900 text-sm truncate" title={prop.title}>
                            {prop.title}
                          </h3>
                          <p className="text-[11px] text-gray-500 truncate">{prop.neighborhood}, {prop.city}</p>
                        </div>
                        <div className="flex items-end justify-between">
                          <span className="text-lg font-black text-gray-900">
                            GHS {prop.price.toLocaleString()}
                            {prop.listingType === "RENT" && <span className="text-xs text-gray-500 font-semibold">/mo</span>}
                          </span>
                          <div className="flex gap-2 text-[11px] text-gray-600 font-semibold">
                            <span className="flex items-center gap-0.5"><BedDouble className="h-3.5 w-3.5 text-emerald-500" /> {prop.bedrooms}</span>
                            <span className="flex items-center gap-0.5"><Bath className="h-3.5 w-3.5 text-emerald-500" /> {prop.bathrooms}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Google Map Mock Placeholder (Right) */}
                <div className="w-full lg:w-[350px] xl:w-[450px] bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 shadow-inner relative flex items-center justify-center min-h-[300px]">
                  <div className="absolute inset-0 bg-slate-200 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />
                  
                  {/* Mock Grid Lines & Center Point */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-300/30" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300/30" />

                  {/* Render pins on mock map */}
                  {paginatedProperties.map((prop, idx) => {
                    // Spread pins realistically within map boundary
                    const topOffset = 30 + (idx * 14) % 55;
                    const leftOffset = 25 + (idx * 17) % 60;
                    const isHighlighted = highlightedPropertyId === prop.id;

                    return (
                      <button
                        key={prop.id}
                        onClick={() => setHighlightedPropertyId(prop.id)}
                        className="absolute z-10 transition-all duration-300 focus:outline-none flex flex-col items-center"
                        style={{ top: `${topOffset}%`, left: `${leftOffset}%` }}
                      >
                        <div
                          className={`px-2 py-1 rounded-lg text-[10px] font-black text-white shadow-md transition-all flex items-center gap-0.5 ${
                            isHighlighted
                              ? "bg-emerald-600 scale-110 ring-4 ring-emerald-500/20"
                              : "bg-gray-800 hover:bg-emerald-600"
                          }`}
                        >
                          ₵{prop.price >= 1000000 ? `${(prop.price/1000000).toFixed(1)}M` : prop.price >= 1000 ? `${(prop.price/1000).toFixed(0)}K` : prop.price}
                        </div>
                        <div className={`h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm mt-0.5 ${isHighlighted ? "bg-emerald-600 animate-ping" : "bg-gray-800"}`} />
                      </button>
                    );
                  })}

                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl p-3 shadow-md text-center max-w-[280px] mx-auto z-20">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Google Maps Integration</p>
                    <p className="text-xs text-gray-700 font-semibold leading-tight">Pins reflect location coordinates on mock map.</p>
                  </div>
                </div>
              </div>
            ) : viewMode === "GRID" ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col text-left"
                  >
                    <div className="h-48 relative bg-gray-100 overflow-hidden">
                      <img
                        src={prop.image}
                        alt={prop.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-lg text-[9px] tracking-wider uppercase">
                        {prop.listingType === "SALE" ? "Buy" : "Rent"}
                      </span>
                      <button
                        onClick={() => toggleSave(prop.id)}
                        className="absolute top-3 right-3 h-8 w-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-600 transition-colors focus:outline-none"
                      >
                        <Heart
                          className={`h-4.5 w-4.5 ${
                            savedIds.includes(prop.id)
                              ? "fill-red-500 stroke-red-500"
                              : "stroke-gray-600"
                          }`}
                        />
                      </button>
                      <span className="absolute bottom-3 right-3 bg-gray-950/70 text-white font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase">
                        {prop.type.replace("_", " ")}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-xl font-black text-emerald-600">
                          GHS {prop.price.toLocaleString()}
                          {prop.listingType === "RENT" && <span className="text-xs text-gray-500 font-bold ml-1">/mo</span>}
                        </span>
                        <h3 className="font-bold text-gray-900 text-sm group-hover:text-emerald-600 transition-colors truncate">
                          {prop.title}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{prop.neighborhood}, {prop.city}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-4">
                        <div className="flex items-center gap-3 text-xs font-semibold text-gray-700">
                          {prop.bedrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <BedDouble className="h-4 w-4 text-emerald-500" />
                              {prop.bedrooms} Bed
                            </span>
                          )}
                          {prop.bathrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <Bath className="h-4 w-4 text-emerald-500" />
                              {prop.bathrooms} Bath
                            </span>
                          )}
                          {prop.size && (
                            <span className="flex items-center gap-1">
                              <Maximize2 className="h-3.5 w-3.5 text-emerald-500" />
                              {prop.size} sqm
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <img src={prop.agentAvatar} alt={prop.agentName} className="h-6 w-6 rounded-full object-cover border border-emerald-300" />
                          <span className="text-[10px] font-bold text-gray-500 truncate max-w-[60px]">{prop.agentName.split(" ")[0]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-4">
                {paginatedProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col sm:flex-row text-left"
                  >
                    <div className="h-48 sm:h-auto sm:w-64 shrink-0 relative bg-gray-100 overflow-hidden">
                      <img
                        src={prop.image}
                        alt={prop.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-lg text-[9px] tracking-wider uppercase">
                        {prop.listingType === "SALE" ? "Buy" : "Rent"}
                      </span>
                      <button
                        onClick={() => toggleSave(prop.id)}
                        className="absolute top-3 right-3 h-8 w-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-600 transition-colors focus:outline-none"
                      >
                        <Heart
                          className={`h-4.5 w-4.5 ${
                            savedIds.includes(prop.id)
                              ? "fill-red-500 stroke-red-500"
                              : "stroke-gray-600"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between min-w-0">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-2xl font-black text-emerald-600">
                            GHS {prop.price.toLocaleString()}
                            {prop.listingType === "RENT" && <span className="text-xs text-gray-500 font-bold ml-1">/mo</span>}
                          </span>
                          <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wide">
                            {prop.type.replace("_", " ")}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-base group-hover:text-emerald-600 transition-colors truncate">
                          {prop.title}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{prop.neighborhood}, {prop.city}</p>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                          {prop.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-4">
                        <div className="flex items-center gap-4 text-xs font-semibold text-gray-700">
                          {prop.bedrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <BedDouble className="h-4 w-4 text-emerald-500" />
                              {prop.bedrooms} Beds
                            </span>
                          )}
                          {prop.bathrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <Bath className="h-4 w-4 text-emerald-500" />
                              {prop.bathrooms} Baths
                            </span>
                          )}
                          {prop.size && (
                            <span className="flex items-center gap-1">
                              <Maximize2 className="h-3.5 w-3.5 text-emerald-500" />
                              {prop.size} sqm
                            </span>
                          )}
                          <span className="hidden sm:flex items-center gap-1 text-gray-400 font-normal">
                            <Calendar className="h-3.5 w-3.5" />
                            {prop.createdAt}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <img src={prop.agentAvatar} alt={prop.agentName} className="h-7 w-7 rounded-full object-cover border border-emerald-300" />
                          <div className="text-left leading-none">
                            <p className="text-xs font-bold text-gray-800">{prop.agentName}</p>
                            <p className="text-[9px] text-gray-400 font-semibold">Verified Agent</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. PAGINATION */}
            {totalPropertiesCount > itemsPerPage && (
              <div className="flex justify-center items-center gap-2 mt-8 py-4">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-10 w-10 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-10 w-10 font-bold text-sm rounded-xl transition-all ${
                      currentPage === page
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-10 w-10 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 4. MOBILE SLIDE-OUT FILTER DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Drawer container */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-300 z-10 text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="h-4.5 w-4.5 text-emerald-600" />
                Filter Options
              </h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 flex-1">
              {/* Region */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">All Regions</option>
                  {GHANA_REGIONS.map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Any Type</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="LAND">Land</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="COMPOUND_HOUSE">Compound House</option>
                  <option value="CHAMBER_AND_HALL">Chamber and Hall</option>
                  <option value="BOYS_QUARTERS">Boys Quarters</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Price (GHS)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Beds */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Beds
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Any Beds</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5+">5+</option>
                </select>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Amenities
                </label>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {AMENITIES_LIST.map((am) => (
                    <label key={am.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(am.id)}
                        onChange={() => toggleAmenity(am.id)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                      {am.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-150 flex gap-2">
              <button
                onClick={handleClearFilters}
                className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center font-sans">
          <div className="text-emerald-600 font-semibold text-lg animate-pulse">
            Loading search results...
          </div>
        </div>
      }
    >
      <SearchPageBody />
    </Suspense>
  );
}
