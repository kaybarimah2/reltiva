"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Building,
  MapPin,
  Sliders,
  Image as ImageIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Upload,
  Trash2,
  AlertCircle,
  DollarSign
} from "lucide-react";

// List of all 16 regions of Ghana
const ALL_GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Central", "Eastern",
  "Northern", "Volta", "Upper East", "Upper West", "Oti",
  "Bono", "Bono East", "Ahafo", "Savannah", "North East", "Western North"
];

const AMENITIES_OPTIONS = [
  "Swimming Pool", "Standby Generator", "24/7 Security", "Parking Space",
  "Air Conditioning", "Boys Quarters", "Water Tank / Polytank", "Borehole",
  "Prepaid Meter", "Tiled Floors", "Fenced Yard"
];

const PRELOADED_NEIGHBORHOODS_ACCRA = [
  "East Legon", "Cantonments", "Airport Residential", "Spintex", "Osu", "Labone", "Achimota", "Dome", "Teshie", "Madina", "Adenta"
];

export default function AgentNewListingPage() {
  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    listingType: "SALE", // SALE or RENT
    propertyType: "APARTMENT",
    price: "",
    isNegotiable: false,
    availabilityDate: "",
    region: "",
    city: "",
    neighborhood: "",
    address: "",
    latitude: "",
    longitude: "",
    bedrooms: "",
    bathrooms: "",
    toilets: "",
    size: "",
    furnishing: "Unfurnished",
    amenities: [] as string[],
    images: [] as string[],
    floorPlan: "",
    virtualTourUrl: ""
  });

  // Step names
  const steps = ["Basic Info", "Location", "Details", "Media", "Preview & Submit"];

  // Toggle Amenity check
  const handleToggleAmenity = (name: string) => {
    if (formData.amenities.includes(name)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((x) => x !== name)
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, name]
      });
    }
  };

  // Real Upload Images to Cloudinary via backend
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.images.length + files.length > 20) {
      setValidationError("You can upload up to 20 images maximum.");
      return;
    }

    setUploading(true);
    setValidationError("");

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
          setValidationError(`File "${file.name}" exceeds 5MB limit and was skipped.`);
          continue;
        }

        const data = new FormData();
        data.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: data
        });

        if (res.ok) {
          const json = await res.json();
          uploadedUrls.push(json.url);
        } else {
          const json = await res.json();
          setValidationError(json.error || `Failed to upload "${file.name}"`);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
      }
    } catch (err) {
      console.error(err);
      setValidationError("An error occurred during file upload.");
    } finally {
      setUploading(false);
    }
  };

  // Remove individual image
  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  // Move image up (reorder mock)
  const handleMoveImageUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...formData.images];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    setFormData({ ...formData, images: reordered });
  };

  // Validation before step forwarding
  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.title || !formData.description || !formData.price || !formData.availabilityDate) {
        setValidationError("Please fill in all fields (Title, Description, Price, Availability Date).");
        return;
      }
    } else if (step === 2) {
      if (!formData.region || !formData.city || !formData.neighborhood || !formData.address) {
        setValidationError("Please select or fill in all location details (Region, City, Neighborhood, Address).");
        return;
      }
    } else if (step === 3) {
      if (!formData.bedrooms || !formData.bathrooms || !formData.toilets || !formData.size) {
        setValidationError("Please specify Bedrooms, Bathrooms, Toilets, and Property Size counts.");
        return;
      }
    } else if (step === 4) {
      if (formData.images.length === 0) {
        setValidationError("Please upload at least 1 image of the property to continue.");
        return;
      }
    }
    setValidationError("");
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setValidationError("");
    setStep(step - 1);
  };

  // Publish Form Actions
  const handlePublish = async () => {
    setSubmitting(true);
    setValidationError("");
    
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          type: formData.propertyType,
          listingType: formData.listingType,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          toilets: formData.toilets,
          size: formData.size,
          region: formData.region,
          city: formData.city,
          neighborhood: formData.neighborhood,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          amenities: formData.amenities,
          images: formData.images
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create listing");
      }

      setIsSubmitted(true);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Failed to publish property listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-none">Add New Listing</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1.5">List a new property for sale or rent on Reltiva.</p>
      </div>

      {/* Progress Tracker bar */}
      {!isSubmitted && (
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((name, index) => {
              const currentIdx = index + 1;
              const isPast = step > currentIdx;
              const isActive = step === currentIdx;

              return (
                <div key={name} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`h-8 w-8 rounded-full border-2 font-bold text-xs flex items-center justify-center transition-all ${
                      isPast
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : isActive
                        ? "bg-white border-emerald-600 text-emerald-600 scale-105 shadow"
                        : "bg-white border-gray-200 text-gray-400"
                    }`}
                  >
                    {currentIdx}
                  </div>
                  <span className={`hidden sm:inline text-[9px] font-black uppercase tracking-wider ${
                    isActive ? "text-emerald-600" : "text-gray-400"
                  }`}>
                    {name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Validation alert */}
      {validationError && (
        <div className="bg-red-50 text-red-700 text-xs font-semibold p-4 rounded-2xl border border-red-100 flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* STEP CARD RENDERING */}
      {isSubmitted ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 shadow-sm text-center space-y-4">
          <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle className="h-8 w-8 stroke-[2.5]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-gray-900">Listing Submitted Successfully!</h2>
            <p className="text-sm text-gray-500 font-semibold max-w-sm mx-auto">
              Your property ad has been sent to our moderation team for compliance checking. Verification takes under 4 hours.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-4">
            <Link
              href="/dashboard/agent/listings"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors"
            >
              Go to My Listings
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
          
          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="text-base font-black text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-1.5">
                <Building className="h-5 w-5 text-emerald-600" /> Basic Info
              </h3>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Listing Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Spacious 3-Bedroom Self Contain in Spintex"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Listing Type *</label>
                  <select
                    value={formData.listingType}
                    onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="SALE">For Sale</option>
                    <option value="RENT">For Rent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Property Category *</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                    <option value="LAND">Land</option>
                    <option value="COMMERCIAL">Commercial Space</option>
                    <option value="COMPOUND_HOUSE">Compound House</option>
                    <option value="CHAMBER_AND_HALL">Chamber and Hall</option>
                    <option value="BOYS_QUARTERS">Boys Quarters</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Price (GHS) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 850000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  <label className="flex items-center gap-2 mt-1.5 cursor-pointer text-xs text-gray-500 font-bold select-none">
                    <input
                      type="checkbox"
                      checked={formData.isNegotiable}
                      onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
                      className="h-4 w-4 text-emerald-600 border-gray-200 rounded"
                    />
                    <span>Price is Negotiable</span>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Availability Date *</label>
                  <input
                    type="date"
                    value={formData.availabilityDate}
                    onChange={(e) => setFormData({ ...formData, availabilityDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Description *</label>
                <textarea
                  rows={5}
                  placeholder="Provide a detailed description of the property rooms, utilities, access roads, layout, and target leases..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-base font-black text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-1.5">
                <MapPin className="h-5 w-5 text-emerald-600" /> Location Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Region *</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="">Select Region</option>
                    {ALL_GHANA_REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">City *</label>
                  <input
                    type="text"
                    placeholder="e.g. Accra"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Neighborhood *</label>
                {formData.city.toLowerCase() === "accra" ? (
                  <select
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="">Select Neighborhood</option>
                    {PRELOADED_NEIGHBORHOODS_ACCRA.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Asokwa"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Full Address *</label>
                <input
                  type="text"
                  placeholder="e.g. House No. 24 Batsonaa Road, Spintex, Accra"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Latitude (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 5.626"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Longitude (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. -0.098"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PROPERTY DETAILS */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-base font-black text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-1.5">
                <Sliders className="h-5 w-5 text-emerald-600" /> Property Specifications
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Bedrooms *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 3"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Bathrooms *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Toilets *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 3"
                    value={formData.toilets}
                    onChange={(e) => setFormData({ ...formData, toilets: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Size (sqm) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 180"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Furnishing Status</label>
                  <select
                    value={formData.furnishing}
                    onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="Furnished">Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Local Amenities Checklist</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AMENITIES_OPTIONS.map((name) => (
                    <label key={name} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(name)}
                        onChange={() => handleToggleAmenity(name)}
                        className="h-4 w-4 text-emerald-600 border-gray-200 rounded"
                      />
                      <span>{name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: MEDIA */}
          {step === 4 && (
            <div className="space-y-5">
              <h3 className="text-base font-black text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-1.5">
                <ImageIcon className="h-5 w-5 text-emerald-600" /> Media Uploads
              </h3>

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer bg-gray-50/50 hover:bg-emerald-50/10 transition-all flex flex-col items-center justify-center gap-2 select-none"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-gray-700">
                    {uploading ? "Uploading to Cloudinary..." : "Click here to upload photos of the property"}
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold">
                    Supports up to 20 images. Maximum file size 5MB each.
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Images Grid */}
              {formData.images.length > 0 && (
                <div className="space-y-2 pt-2 text-left">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Uploaded Images ({formData.images.length} of 20)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="h-20 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden relative group">
                        <img src={img} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImageUp(index)}
                              className="p-1 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-[9px] font-bold"
                            >
                              Move Up
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Floor Plan & Virtual tour */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Floor Plan Diagram (Optional)</label>
                  <input
                    type="file"
                    disabled
                    className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 border border-gray-200 rounded-xl bg-gray-50/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Virtual Tour Video Link (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. https://youtube.com/watch?v=..."
                    value={formData.virtualTourUrl}
                    onChange={(e) => setFormData({ ...formData, virtualTourUrl: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PREVIEW & SUBMIT */}
          {step === 5 && (
            <div className="space-y-6 text-left">
              <h3 className="text-base font-black text-gray-900 border-b border-gray-50 pb-2">
                Preview Listing Details
              </h3>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <img
                    src={formData.images[0]}
                    alt=""
                    className="h-24 w-32 object-cover rounded-xl border border-gray-100 shrink-0 bg-gray-50"
                  />
                  <div className="leading-tight space-y-1.5 flex-1 min-w-0">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {formData.listingType === "SALE" ? "For Sale" : "For Rent"}
                    </span>
                    <h4 className="font-extrabold text-gray-900 text-base truncate">{formData.title || "No Title Specified"}</h4>
                    <p className="text-sm text-emerald-600 font-black">
                      GHS {parseInt(formData.price || "0").toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                      {formData.address}, {formData.neighborhood}, {formData.city}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-y border-gray-50 py-3.5 text-xs text-gray-500 font-bold">
                  <div>Bedrooms: <span className="text-gray-900">{formData.bedrooms} Beds</span></div>
                  <div>Bathrooms: <span className="text-gray-900">{formData.bathrooms} Baths</span></div>
                  <div>Size: <span className="text-gray-900">{formData.size} sqm</span></div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description Summary</p>
                  <p className="text-xs text-gray-600 leading-relaxed font-semibold line-clamp-3">
                    {formData.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center border-t border-gray-100 pt-6 mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold flex items-center gap-1 focus:outline-none"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-1 focus:outline-none"
              >
                Next Step <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handlePublish()}
                  className="px-4.5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handlePublish()}
                  className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-1 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit for Review"}
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
