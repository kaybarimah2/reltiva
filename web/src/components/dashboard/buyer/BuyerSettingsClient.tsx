"use client";

import React, { useState, useRef } from "react";
import {
  User,
  Key,
  CheckCircle,
  Upload,
  AlertCircle,
  BellRing,
  ShieldAlert,
  Trash2
} from "lucide-react";
import { signOut } from "next-auth/react";

interface ProfileState {
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  prefEnquiries: boolean;
  prefAlerts: boolean;
  prefMarketing: boolean;
}

interface BuyerSettingsClientProps {
  initialProfile: {
    fullName: string;
    email: string;
    phone: string;
    avatar: string;
  };
}

export default function BuyerSettingsClient({
  initialProfile
}: BuyerSettingsClientProps) {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [profile, setProfile] = useState<ProfileState>({
    fullName: initialProfile.fullName,
    email: initialProfile.email,
    phone: initialProfile.phone || "",
    avatar: initialProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    prefEnquiries: true,
    prefAlerts: true,
    prefMarketing: false
  });

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Real Avatar Upload to Cloudinary via backend
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // 2MB size limit
    if (file.size > 2 * 1024 * 1024) {
      setValidationError("Avatar image size must not exceed 2MB.");
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
      setValidationError("An error occurred during file upload.");
    } finally {
      setUploading(false);
    }
  };

  // Submit Settings
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
          avatar: profile.avatar
        })
      });

      if (!res.ok) {
        const data = await res.json();
        setValidationError(data.error || "Failed to update profile settings.");
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch {
      setValidationError("An error occurred during updating profile.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Passwords
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

      if (!res.ok) {
        const data = await res.json();
        setValidationError(data.error || "Failed to update credentials.");
      } else {
        setSaveSuccess(true);
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch {
      setValidationError("An error occurred during password update.");
    } finally {
      setLoading(false);
    }
  };

  // Confirm delete account
  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE"
      });
      if (res.ok) {
        signOut({ callbackUrl: "/" });
      }
    } catch {
      setValidationError("Failed to delete account.");
    }
  };

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-none">Profile Settings</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1.5">Manage your contact credentials, profile picture, and subscription alert preferences.</p>
      </div>

      {/* Success alert */}
      {saveSuccess && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded-2xl border border-emerald-100 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Profile settings saved successfully!</span>
        </div>
      )}

      {/* Error alert */}
      {validationError && (
        <div className="bg-red-50 text-red-700 text-xs font-semibold p-4 rounded-2xl border border-red-100 flex items-center gap-2 animate-fade-in">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 1. Profile Photo and General Details Form */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-base font-black text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-1.5">
          <User className="h-5 w-5 text-emerald-600" /> Account Details
        </h3>

        {/* Profile Photo upload */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-2">
          <img
            src={profile.avatar}
            alt={profile.fullName}
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
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name *</label>
            <input
              type="text"
              required
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address *</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number *</label>
              <input
                type="text"
                required
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
              />
            </div>
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

      {/* 2. Email Notifications Preferences */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-base font-black text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-1.5">
          <BellRing className="h-5 w-5 text-emerald-600" /> Notifications Settings
        </h3>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer text-xs text-gray-600 font-semibold select-none">
            <input
              type="checkbox"
              checked={profile.prefEnquiries}
              onChange={(e) => setProfile({ ...profile, prefEnquiries: e.target.checked })}
              className="h-4.5 w-4.5 text-emerald-600 border-gray-200 rounded mt-0.5"
            />
            <div>
              <p className="font-extrabold text-gray-900">New enquiry replies</p>
              <p className="text-[10px] text-gray-400 font-medium">Send me email notifications immediately when agents reply to my property messages.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer text-xs text-gray-600 font-semibold select-none">
            <input
              type="checkbox"
              checked={profile.prefAlerts}
              onChange={(e) => setProfile({ ...profile, prefAlerts: e.target.checked })}
              className="h-4.5 w-4.5 text-emerald-600 border-gray-200 rounded mt-0.5"
            />
            <div>
              <p className="font-extrabold text-gray-900">Property alert emails</p>
              <p className="text-[10px] text-gray-400 font-medium">Email me when new listings matching my saved search parameters are uploaded.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer text-xs text-gray-600 font-semibold select-none">
            <input
              type="checkbox"
              checked={profile.prefMarketing}
              onChange={(e) => setProfile({ ...profile, prefMarketing: e.target.checked })}
              className="h-4.5 w-4.5 text-emerald-600 border-gray-200 rounded mt-0.5"
            />
            <div>
              <p className="font-extrabold text-gray-900">Marketing & Newsletters</p>
              <p className="text-[10px] text-gray-400 font-medium">Send me monthly newsletters about real estate price trends in Accra and Kumasi.</p>
            </div>
          </label>
        </div>
      </div>

      {/* 3. Password Change Form */}
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
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
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

      {/* 4. Account Deletion (Danger Zone) */}
      <div className="bg-red-50/40 border border-red-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-black text-red-950 flex items-center gap-1.5">
          <ShieldAlert className="h-5 w-5 text-red-600" /> Danger Zone
        </h3>
        <p className="text-xs text-red-800 font-semibold leading-relaxed">
          Once you delete your account, there is no going back. All saved properties, alerts configurations, and ongoing message threads with agents will be permanently removed.
        </p>
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-black px-4.5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" /> Permanently Delete Account
        </button>
      </div>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setDeleteModalOpen(false)} />
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 w-full max-w-sm relative z-10 text-left space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-5 w-5" />
              <h3 className="font-black text-gray-900 text-base">Confirm Account Deletion</h3>
            </div>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Are you sure you want to permanently delete your Reltiva buyer account? You will lose all your message history and alerts immediately.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600"
              >
                No, Keep It
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs text-center block"
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
