"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  BedDouble,
  Bath,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Flag,
  Phone,
  MessageSquare,
  Mail,
  Star,
  Calculator,
  Calendar,
  MapPin,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  Link as LinkIcon
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export interface PropertyDetail {
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
  agentId: string;
  agentName: string;
  agentPhone: string;
  agentAgency: string;
  agentRating: number;
  agentListingsCount: number;
  agentJoined: string;
  agentAvatar: string;
  images: string[];
  amenities: string[];
  furnishing: string;
  createdAt: string;
  isNegotiable: boolean;
  views: number;
}

export interface SimilarProperty {
  id: string;
  title: string;
  price: number;
  currency: string;
  type: string;
  listingType: string;
  bedrooms: number;
  bathrooms: number;
  neighborhood: string;
  city: string;
  images: string[];
  createdAt: string;
}

interface PropertyDetailClientProps {
  property: PropertyDetail;
  similarProperties: SimilarProperty[];
  isSavedInitially: boolean;
}

export default function PropertyDetailClient({
  property,
  similarProperties,
  isSavedInitially
}: PropertyDetailClientProps) {
  const { data: session } = useSession();

  // Gallery States
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Read More State
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // Mortgage Calculator States
  const [downPaymentPercent, setDownPaymentPercent] = useState(10);
  const [interestRate, setInterestRate] = useState(25); // Default Ghana banking rate
  const [loanTerm, setLoanTerm] = useState(15);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  // Enquiry Form States
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: `Hi ${property.agentName.split(" ")[0]}, I am interested in your property "${property.title}". Please get in touch.`
  });
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");

  // Share & Report States
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(isSavedInitially);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, []);

  // Update form prefill if session updates
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

  // Calculate Mortgage effect
  useEffect(() => {
    const downPaymentAmount = property.price * (downPaymentPercent / 100);
    const principal = property.price - downPaymentAmount;
    const monthlyRate = interestRate / 12 / 100;
    const numberOfPayments = loanTerm * 12;

    if (monthlyRate === 0) {
      setMonthlyPayment(principal / numberOfPayments);
      return;
    }

    const calc =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    setMonthlyPayment(isNaN(calc) ? 0 : calc);
  }, [downPaymentPercent, interestRate, loanTerm, property.price]);

  // Touch Swipe for mobile gallery
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;

    if (diff > 50) {
      // Swipe Left (Next Image)
      setActiveImageIdx((prev) => (prev + 1) % property.images.length);
      setTouchStart(null);
    } else if (diff < -50) {
      // Swipe Right (Prev Image)
      setActiveImageIdx((prev) => (prev - 1 + property.images.length) % property.images.length);
      setTouchStart(null);
    }
  };

  // Submit Enquiry to Database API
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setEnquiryError("You must be logged in to submit an enquiry. Please sign in.");
      return;
    }

    setEnquirySubmitting(true);
    setEnquiryError("");

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          agentId: property.agentId,
          message: formData.message
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send enquiry");
      }

      setEnquirySubmitted(true);
      setTimeout(() => {
        setEnquirySubmitted(false);
        setEnquiryOpen(false);
      }, 3000);
    } catch (err) {
      setEnquiryError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEnquirySubmitting(false);
    }
  };

  // Submit Report to Database API
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setReportError("You must be logged in to report a listing. Please sign in.");
      return;
    }
    if (!reportReason) return;

    setReportSubmitting(true);
    setReportError("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          reason: reportReason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send report");
      }

      setReportSubmitted(true);
      setTimeout(() => {
        setReportSubmitted(false);
        setReportOpen(false);
        setReportReason("");
      }, 3000);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Saved/Heart listing toggle
  const toggleSave = async () => {
    if (session?.user) {
      try {
        const res = await fetch("/api/saved-properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId: property.id })
        });
        const data = await res.json();
        if (data.saved !== undefined) {
          setIsSaved(data.saved);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // LocalStorage fallback for guests
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("reltiva_saved_listings");
        let list: string[] = [];
        if (stored) {
          try {
            list = JSON.parse(stored);
          } catch (e) {
            console.error(e);
          }
        }
        
        let updated: string[];
        if (list.includes(property.id)) {
          updated = list.filter((x) => x !== property.id);
          setIsSaved(false);
        } else {
          updated = [...list, property.id];
          setIsSaved(true);
        }
        localStorage.setItem("reltiva_saved_listings", JSON.stringify(updated));
      }
    }
  };

  // Sync state with LocalStorage for guests on mount
  useEffect(() => {
    if (!session?.user && typeof window !== "undefined") {
      const stored = localStorage.getItem("reltiva_saved_listings");
      if (stored) {
        try {
          const list = JSON.parse(stored) as string[];
          setIsSaved(list.includes(property.id));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [session, property.id]);

  // Formatting helpers
  const ghsPriceStr = `GHS ${property.price.toLocaleString()}`;
  const usdPriceStr = `USD ${(property.price / 14.5).toLocaleString(undefined, {
    maximumFractionDigits: 0
  })}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* 12. BREADCRUMB NAVIGATION */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href={`/search?type=${property.listingType}`}
            className="hover:text-emerald-600 transition-colors"
          >
            {property.listingType === "SALE" ? "Buy" : "Rent"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href={`/search?region=${property.region}`}
            className="hover:text-emerald-600 transition-colors"
          >
            {property.region}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 truncate max-w-[200px] sm:max-w-xs">{property.title}</span>
        </nav>

        {/* Dynamic Details Page Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Content Column (Left - Span 2) */}
          <div className="lg:col-span-2 flex flex-col gap-6 text-left">
            
            {/* 1. IMAGE GALLERY */}
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
              {/* Hero Active Image */}
              <div
                className="h-80 sm:h-96 md:h-[480px] w-full rounded-2xl overflow-hidden bg-gray-100 relative cursor-zoom-in group select-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onClick={() => setLightboxOpen(true)}
              >
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[activeImageIdx]}
                    alt={`${property.title} - View ${activeImageIdx + 1}`}
                    className="h-full w-full object-cover transition-all duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-2 bg-gray-100">
                    <Maximize2 className="h-12 w-12 stroke-[1.5]" />
                    <span className="text-sm font-semibold">No images uploaded for this listing</span>
                  </div>
                )}

                {/* Listing Type Tag Overlay */}
                <span className="absolute top-4 left-4 bg-emerald-600 text-white font-black px-3.5 py-1 rounded-xl text-xs uppercase tracking-wider shadow">
                  {property.listingType === "SALE" ? "For Sale" : "For Rent"}
                </span>

                {/* Heart Button Overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave();
                  }}
                  className="absolute top-4 right-4 h-10 w-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-700 transition-all shadow hover:scale-105 active:scale-95"
                >
                  <Heart className={`h-5 w-5 ${isSaved ? "fill-red-500 stroke-red-500" : ""}`} />
                </button>

                {/* Counter index overlay */}
                {property.images && property.images.length > 0 && (
                  <span className="absolute bottom-4 right-4 bg-gray-950/70 text-white font-bold text-xs px-3 py-1 rounded-full shadow">
                    {activeImageIdx + 1} of {property.images.length}
                  </span>
                )}

                {/* Arrow navigation triggers */}
                {property.images && property.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIdx(
                          (prev) => (prev - 1 + property.images.length) % property.images.length
                        );
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/70 hover:bg-white shadow flex items-center justify-center text-gray-800 transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIdx((prev) => (prev + 1) % property.images.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/70 hover:bg-white shadow flex items-center justify-center text-gray-800 transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails strip below */}
              {property.images && property.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                  {property.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`h-16 w-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all relative ${
                        activeImageIdx === idx ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      {activeImageIdx !== idx && <div className="absolute inset-0 bg-white/20 hover:bg-transparent transition-colors" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. PROPERTY HEADER */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      property.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {property.status.replace("_", " ")}
                    </span>
                    {property.isNegotiable && (
                      <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        Negotiable
                      </span>
                    )}
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Verified Listing
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                    {property.title}
                  </h1>
                  <p className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold">
                     <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                    {property.address}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 block">
                    {ghsPriceStr}
                    {property.listingType === "RENT" && <span className="text-sm font-bold text-gray-500">/mo</span>}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-400 block mt-1">
                    ~ {usdPriceStr}
                    {property.listingType === "RENT" && <span>/mo</span>}
                  </span>
                </div>
              </div>

              {/* View Count & Dates block */}
              <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Listed on {property.createdAt}
                </span>
                <span>{property.views} Page Views</span>
              </div>
            </div>

            {/* 3. KEY DETAILS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <BedDouble className="h-5 w-5" />
                </div>
                <div className="leading-none text-left">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Bedrooms</p>
                  <p className="text-base font-black text-gray-900 mt-1">{property.bedrooms || "0"}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <Bath className="h-5 w-5" />
                </div>
                <div className="leading-none text-left">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Bathrooms</p>
                  <p className="text-base font-black text-gray-900 mt-1">{property.bathrooms || "0"}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <Maximize2 className="h-5 w-5" />
                </div>
                <div className="leading-none text-left">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Size</p>
                  <p className="text-base font-black text-gray-900 mt-1">{property.size ? `${property.size} sqm` : "N/A"}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <Check className="h-5 w-5" />
                </div>
                <div className="leading-none text-left">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Furnishing</p>
                  <p className="text-base font-black text-gray-900 mt-1 truncate max-w-[100px]" title={property.furnishing}>{property.furnishing}</p>
                </div>
              </div>
            </div>

            {/* 4. DESCRIPTION SECTION */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-black text-gray-900 mb-4 border-b border-gray-50 pb-2">
                Property Description
              </h2>
              <div className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
                {property.description.length > 220 && !descriptionExpanded ? (
                  <>
                    <p>{property.description.substring(0, 220)}...</p>
                    <button
                      onClick={() => setDescriptionExpanded(true)}
                      className="text-emerald-600 font-bold hover:text-emerald-700 mt-2 block hover:underline focus:outline-none"
                    >
                      Read More
                    </button>
                  </>
                ) : (
                  <>
                    <p>{property.description}</p>
                    {property.description.length > 220 && (
                      <button
                        onClick={() => setDescriptionExpanded(false)}
                        className="text-emerald-600 font-bold hover:text-emerald-700 mt-2 block hover:underline focus:outline-none"
                      >
                        Collapse
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 5. AMENITIES SECTION */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-black text-gray-900 mb-4 border-b border-gray-50 pb-2">
                Property Amenities
              </h2>
              {property.amenities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {property.amenities.map((am, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 p-3 rounded-xl">
                      <div className="h-5 w-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{am}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-400">No specific amenities specified for this listing.</p>
              )}
            </div>

            {/* 6. LOCATION SECTION */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-black text-gray-900 mb-4 border-b border-gray-50 pb-2">
                Property Location
              </h2>
              <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500 mb-4">
                <span className="bg-gray-100 px-3 py-1 rounded-lg">Region: {property.region}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-lg">City: {property.city}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-lg">Neighborhood: {property.neighborhood}</span>
              </div>

              {/* Google Map Mock Canvas */}
              <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-gray-100 relative bg-slate-200 flex items-center justify-center">
                <div className="absolute inset-0 bg-slate-200 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-75" />
                
                {/* Mock grid streets overlay */}
                <div className="absolute top-1/3 left-0 right-0 h-1 bg-white/40" />
                <div className="absolute top-2/3 left-0 right-0 h-1.5 bg-white/40" />
                <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-white/40" />
                <div className="absolute left-3/4 top-0 bottom-0 w-1.5 bg-white/40" />

                {/* Coordinate marker */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-emerald-600 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-lg border border-white flex items-center gap-1.5">
                    <MapPin className="h-4.5 w-4.5" />
                    <span>{property.neighborhood} Listing</span>
                  </div>
                  <div className="h-3 w-3 bg-emerald-600 border-2 border-white rounded-full shadow mt-1 animate-ping absolute -bottom-4" />
                  <div className="h-3 w-3 bg-emerald-600 border-2 border-white rounded-full shadow mt-1 absolute -bottom-4" />
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur border border-gray-100 rounded-2xl p-3 shadow-md max-w-[320px] mx-auto text-center">
                  <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest mb-0.5">Google Maps Integration</p>
                  <p className="text-xs text-gray-700 font-semibold leading-tight">Interactive map coordinates: Lat {property.latitude ? property.latitude.toFixed(3) : "5.603"}, Lng {property.longitude ? property.longitude.toFixed(3) : "-0.187"}</p>
                </div>
              </div>
            </div>

            {/* 8. MORTGAGE CALCULATOR */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
                <Calculator className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-black text-gray-900">
                  Ghana Bank Mortgage Calculator
                </h2>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-6">
                Calculate your estimated monthly payments using typical Ghana commercial bank lending rates (which average between 20% and 30%).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  {/* Property Price (prefilled) */}
                  <div className="space-y-1">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Property Price</span>
                    <span className="block font-black text-base text-gray-900 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-left">
                      {ghsPriceStr}
                    </span>
                  </div>

                  {/* Down Payment slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                      <span>Down Payment</span>
                      <span className="text-emerald-600">{downPaymentPercent}% (GHS {((property.price * downPaymentPercent) / 100).toLocaleString()})</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="80"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  {/* Interest rate input */}
                  <div className="space-y-1">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Interest Rate (Annual %)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <span className="text-xs font-extrabold text-amber-600 shrink-0 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100">
                        Avg Ghana Bank: 25%
                      </span>
                    </div>
                  </div>

                  {/* Loan term years selector */}
                  <div className="space-y-1">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Loan Term</span>
                    <select
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="5">5 Years</option>
                      <option value="10">10 Years</option>
                      <option value="15">15 Years</option>
                      <option value="20">20 Years</option>
                      <option value="25">25 Years</option>
                    </select>
                  </div>
                </div>

                {/* Calculation outcome box */}
                <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 text-center space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">Estimated Payment</span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-700 block">
                      GHS {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      <span className="text-sm font-extrabold">/mo</span>
                    </div>
                  </div>

                  <div className="text-xs text-emerald-800/80 leading-relaxed font-semibold">
                    <div className="flex justify-between border-b border-emerald-200/50 pb-1.5">
                      <span>Loan Principal:</span>
                      <span>GHS {(property.price - (property.price * downPaymentPercent) / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span>Total Payments:</span>
                      <span>{loanTerm * 12} installments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 11. SHARE AND REPORT */}
            <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShareOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-xl text-xs font-bold text-gray-700 transition-colors focus:outline-none"
                >
                  <Share2 className="h-4 w-4 text-emerald-600" /> Share Listing
                </button>
              </div>

              <button
                onClick={() => setReportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-100 hover:bg-red-100/50 rounded-xl text-xs font-bold text-red-700 transition-colors focus:outline-none"
              >
                <Flag className="h-4 w-4" /> Report Listing
              </button>
            </div>

          </div>

          {/* Sticky Agent / Action Column (Right - Span 1) */}
          <div className="lg:col-span-1 flex flex-col gap-6 text-left lg:sticky lg:top-24">
            
            {/* 7. AGENT CONTACT CARD */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6">
              {/* Agent mini-header */}
              <div className="flex items-center gap-4">
                <img
                  src={property.agentAvatar}
                  alt={property.agentName}
                  className="h-14 w-14 rounded-full object-cover border-2 border-emerald-300"
                />
                <div className="leading-none text-left">
                  <h3 className="font-extrabold text-gray-900 text-base">{property.agentName}</h3>
                  <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">{property.agentAgency}</p>
                  
                  {/* Stars rating */}
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < Math.floor(property.agentRating) ? "fill-amber-400" : ""}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">({property.agentRating})</span>
                  </div>
                </div>
              </div>

              {/* Agent Stats */}
              <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-3.5 text-center text-xs font-semibold text-gray-600">
                <div className="leading-none">
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Member Since</p>
                  <p className="text-sm font-black text-gray-800 mt-1">{property.agentJoined}</p>
                </div>
                <div className="leading-none border-l border-gray-100">
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Total Listings</p>
                  <p className="text-sm font-black text-gray-800 mt-1">{property.agentListingsCount} listings</p>
                </div>
              </div>

              {/* Quick Communication Actions */}
              <div className="flex flex-col gap-3">
                <a
                  href={`tel:${property.agentPhone}`}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm transition-all shadow shadow-emerald-600/10 flex items-center justify-center gap-2"
                >
                  <Phone className="h-4.5 w-4.5" /> Call {property.agentName.split(" ")[0]}
                </a>
                
                <a
                  href={`https://wa.me/${property.agentPhone.replace(/[^\d]/g, "")}?text=Hi%20${property.agentName.split(" ")[0]},%20I'm%20interested%20in%20your%20listing%20"${encodeURIComponent(property.title)}"`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-emerald-200"
                >
                  <MessageSquare className="h-4.5 w-4.5" /> WhatsApp Agent
                </a>

                <button
                  onClick={() => setEnquiryOpen(!enquiryOpen)}
                  className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-gray-200 focus:outline-none"
                >
                  <Mail className="h-4.5 w-4.5" /> Email Enquiry
                </button>
              </div>

              {/* Enquiry Form */}
              {enquiryOpen && (
                <div className="border-t border-gray-50 pt-4 text-left">
                  {enquirySubmitted ? (
                    <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-3.5 rounded-lg border border-emerald-100 text-center">
                      Enquiry sent! The agent will contact you shortly.
                    </div>
                  ) : (
                    <form onSubmit={handleEnquirySubmit} className="space-y-3.5">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Send Message</h4>
                      
                      {enquiryError && (
                        <div className="bg-red-50 text-red-700 text-xs font-semibold p-2.5 rounded-lg border border-red-100">
                          {enquiryError}
                        </div>
                      )}

                      {!session?.user ? (
                        <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-500 font-semibold mb-2">You must be signed in to submit an enquiry.</p>
                          <Link href="/auth/login" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline">
                            Login / Register
                          </Link>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Name</label>
                            <input
                              type="text"
                              disabled
                              value={session.user.name || ""}
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Email</label>
                            <input
                              type="email"
                              disabled
                              value={session.user.email || ""}
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Message *</label>
                            <textarea
                              rows={3}
                              required
                              value={formData.message}
                              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={enquirySubmitting}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors"
                          >
                            {enquirySubmitting ? "Submitting..." : "Submit Enquiry"}
                          </button>
                        </>
                      )}
                    </form>
                  )}
                </div>
              )}

              <Link
                href={`/agents/${property.agentName.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-xs font-bold text-gray-500 hover:text-emerald-600 flex items-center justify-center gap-1 mt-2 focus:outline-none"
              >
                View Agent Profile <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            
          </div>

        </div>

        {/* 9. SIMILAR PROPERTIES */}
        <div className="border-t border-gray-200 pt-8 mt-4 text-left">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6">
            Similar Properties You May Like
          </h2>
          
          {similarProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {similarProperties.map((prop) => (
                <Link
                  href={`/properties/${prop.id}`}
                  key={prop.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col"
                >
                  <div className="h-40 bg-gray-100 overflow-hidden relative">
                    <img
                      src={prop.images[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600"}
                      alt={prop.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider">
                      {prop.listingType === "SALE" ? "Buy" : "Rent"}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-gray-950/70 text-white font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase">
                      {prop.type.replace("_", " ")}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-base font-black text-emerald-600 block">
                        GHS {prop.price.toLocaleString()}
                        {prop.listingType === "RENT" && <span className="text-xs text-gray-500 font-bold ml-0.5">/mo</span>}
                      </span>
                      <h3 className="font-bold text-gray-900 text-xs group-hover:text-emerald-600 transition-colors truncate">
                        {prop.title}
                      </h3>
                      <p className="text-[10px] text-gray-400 truncate">{prop.neighborhood}, {prop.city}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-3 text-[10px] font-bold text-gray-600">
                      <div className="flex gap-2">
                        {prop.bedrooms > 0 && <span className="flex items-center gap-0.5"><BedDouble className="h-3 w-3 text-emerald-500" /> {prop.bedrooms}</span>}
                        {prop.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3 text-emerald-500" /> {prop.bathrooms}</span>}
                      </div>
                      <span className="text-[9px] text-gray-400">{prop.createdAt}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm font-semibold text-gray-400">No similar properties found matching the region or category.</p>
          )}
        </div>

      </div>

      <Footer />

      {/* 10. ACTION BAR (sticky bottom on mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-2xl flex items-center justify-between gap-3">
        <button
          onClick={toggleSave}
          className="h-11 w-11 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 shrink-0"
        >
          <Heart className={`h-5 w-5 ${isSaved ? "fill-red-500 stroke-red-500" : ""}`} />
        </button>

        <a
          href={`tel:${property.agentPhone}`}
          className="flex-1 h-11 bg-gray-900 hover:bg-gray-950 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 shadow"
        >
          <Phone className="h-4 w-4" /> Call
        </a>

        <a
          href={`https://wa.me/${property.agentPhone.replace(/[^\d]/g, "")}?text=Hi%20${property.agentName.split(" ")[0]},%20I'm%20interested%20in%20your%20listing%20"${encodeURIComponent(property.title)}"`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 shadow"
        >
          <MessageSquare className="h-4 w-4" /> WhatsApp
        </a>

        <button
          onClick={() => setEnquiryOpen(true)}
          className="flex-1 h-11 bg-emerald-50 text-emerald-800 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 border border-emerald-100 focus:outline-none"
        >
          <Mail className="h-4 w-4" /> Enquiry
        </button>
      </div>

      {/* LIGHTBOX OVERLAY */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 focus:outline-none"
          >
            <X className="h-8 w-8" />
          </button>

          <div
            className="relative w-full max-w-4xl max-h-[70vh] flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {property.images && property.images.length > 0 && (
              <img
                src={property.images[activeImageIdx]}
                alt=""
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}

            {property.images && property.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIdx(
                      (prev) => (prev - 1 + property.images.length) % property.images.length
                    )
                  }
                  className="absolute left-2 text-white/70 hover:text-white bg-white/10 p-2 rounded-full"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIdx((prev) => (prev + 1) % property.images.length)
                  }
                  className="absolute right-2 text-white/70 hover:text-white bg-white/10 p-2 rounded-full"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox counter indicator */}
          {property.images && property.images.length > 0 && (
            <div className="text-gray-400 text-sm font-semibold mt-4">
              Image {activeImageIdx + 1} of {property.images.length}
            </div>
          )}
        </div>
      )}

      {/* SHARE MODAL OVERLAY */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShareOpen(false)} />
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 w-full max-w-sm relative z-10 text-left space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <h3 className="font-extrabold text-gray-900 text-base">Share Property</h3>
              <button onClick={() => setShareOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center py-2">
              <a
                href={`https://wa.me/?text=Check%20out%20this%20property%20on%20Reltiva:%20${encodeURIComponent(property.title)}%20-%20${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 focus:outline-none"
              >
                <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-gray-600">WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 focus:outline-none"
              >
                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </div>
                <span className="text-[10px] font-bold text-gray-600">Facebook</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(property.title)}&url=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 focus:outline-none"
              >
                <div className="h-12 w-12 bg-sky-50 rounded-full flex items-center justify-center text-sky-600 hover:bg-sky-100 transition-colors">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </div>
                <span className="text-[10px] font-bold text-gray-600">Twitter</span>
              </a>

              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-1.5 focus:outline-none"
              >
                <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-gray-600">{linkCopied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL OVERLAY */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setReportOpen(false)} />
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 w-full max-w-sm relative z-10 text-left space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5 text-red-700">
                <Flag className="h-4.5 w-4.5" /> Report Listing
              </h3>
              <button onClick={() => setReportOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded-xl border border-emerald-100 text-center">
                Report submitted successfully. Thank you for helping keep Reltiva safe.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <p className="text-xs text-gray-500 font-semibold">
                  Why are you reporting this listing? Our moderation team will investigate.
                </p>

                {reportError && (
                  <div className="bg-red-50 text-red-700 text-xs font-semibold p-2.5 rounded-lg border border-red-100">
                    {reportError}
                  </div>
                )}

                {!session?.user ? (
                  <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-2">You must be signed in to submit a report.</p>
                    <Link href="/auth/login" className="text-xs font-bold text-red-600 hover:text-red-700 underline">
                      Login / Register
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {[
                        "Incorrect pricing or details",
                        "Fake or duplicated listing",
                        "Spam or misleading information",
                        "Unavailable property listed as active",
                        "Inappropriate photos or content"
                      ].map((reason, i) => (
                        <label key={i} className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-700">
                          <input
                            type="radio"
                            name="reportReason"
                            value={reason}
                            checked={reportReason === reason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                          />
                          <span>{reason}</span>
                        </label>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setReportOpen(false)}
                        className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!reportReason || reportSubmitting}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs"
                      >
                        {reportSubmitting ? "Submitting..." : "Submit Report"}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
