"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Key,
  CheckCircle,
  Upload,
  AlertCircle
} from "lucide-react";

export default function AgentSettingsPage() {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    agencyName: "",
    licenseNumber: "",
    experienceYears: "",
    bio: "",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150"
  });

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Load Profile from DB
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile({
            fullName: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            agencyName: data.profile?.agency || "",
            licenseNumber: data.profile?.licenseNumber || "",
            experienceYears: String(data.profile?.yearsExp || 0),
            bio: data.profile?.bio || "",
            avatar: data.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150"
          });
        }
      } catch (err) {
        console.error("Failed to load agent profile", err);
      }
    };
    loadProfile();
  }, []);

  // Avatar Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // 2MB size limit for avatars
    if (file.size > 2 * 1024 * 1024) {
      setValidationError("Avatar image must not exceed 2MB size limit.");
      return;
    }

    setUploading(true);
    setValidationError("");

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data
      });

      if (res.ok) {
        const json = await res.json();
        setProfile((prev) => ({
          ...prev,
          avatar: json.url
        }));
      } else {
        const json = await res.json();
        setValidationError(json.error || "Failed to upload avatar image.");
      }
    } catch (err) {
      console.error(err);
      setValidationError("An error occurred during image upload.");
    } finally {
      setUploading(false);
    }
  };

  // Submit Settings to DB
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.fullName || !profile.email || !profile.phone) {
      setValidationError("Name, Email, and Phone number are required fields.");
      return;
    }

    setLoading(true);
    setValidationError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          avatar: profile.avatar,
          bio: profile.bio,
          agency: profile.agencyName,
          licenseNumber: profile.licenseNumber,
          yearsExp: profile.experienceYears
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        const json = await res.json();
        setValidationError(json.error || "Failed to update profile settings.");
      }
    } catch (err) {
      console.error(err);
      setValidationError("An error occurred while saving profile.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Passwords to DB
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setValidationError("Please fill out all password fields.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setValidationError("New password and confirm password fields do not match.");
      return;
    }

    setLoading(true);
    setValidationError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        const json = await res.json();
        setValidationError(json.error || "Failed to update credentials.");
      }
    } catch (err) {
      console.error(err);
      setValidationError("An error occurred while updating credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-none">Profile Settings</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1.5">Update your personal information, licensing credentials, and account settings.</p>
      </div>

      {/* Success alert */}
      {saveSuccess && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded-2xl border border-emerald-100 flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Error alert */}
      {validationError && (
        <div className="bg-red-50 text-red-700 text-xs font-semibold p-4 rounded-2xl border border-red-100 flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 1. Profile Photo and General Details Form */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-base font-black text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-1.5">
          <User className="h-5 w-5 text-emerald-600" /> Account details
        </h3>

        {/* Profile Photo upload layout */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-2">
          <img
            src={profile.avatar}
            alt={profile.fullName || "Avatar"}
            className="h-20 w-20 rounded-full object-cover border-2 border-emerald-300 shrink-0"
          />
          <div className="space-y-2 text-center sm:text-left">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs flex items-center gap-1.5 focus:outline-none"
            >
              <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Change Profile Photo"}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />
            <p className="text-[10px] text-gray-400 font-semibold">Supports JPG, PNG formats. Max file size of 2MB.</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name *</label>
              <input
                type="text"
                required
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address *</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number *</label>
              <input
                type="text"
                required
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Agency Name</label>
              <input
                type="text"
                value={profile.agencyName}
                onChange={(e) => setProfile({ ...profile, agencyName: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">License Number</label>
              <input
                type="text"
                value={profile.licenseNumber}
                onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Years of Experience</label>
              <input
                type="number"
                value={profile.experienceYears}
                onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Agent Bio</label>
            <textarea
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Profile Settings"}
          </button>
        </form>
      </div>

      {/* 2. Password Change Form */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-base font-black text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-1.5">
          <Key className="h-5 w-5 text-emerald-600" /> Change Credentials
        </h3>

        <form onSubmit={handleSavePassword} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Current Password</label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-950 text-white font-black rounded-xl text-xs transition-colors disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Credentials"}
          </button>
        </form>
      </div>

    </div>
  );
}
