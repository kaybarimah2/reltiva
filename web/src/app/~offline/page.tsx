"use client";

import React from "react";
import { WifiOff, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans text-left">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center space-y-6">
        
        {/* Branding header */}
        <div className="flex justify-center items-center gap-2 text-emerald-600 mb-2">
          <Home className="h-7 w-7 stroke-[2.5]" />
          <span className="text-2xl font-black tracking-tight text-gray-900 uppercase">
            RELTIVA
          </span>
        </div>

        {/* Offline Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 animate-pulse">
            <WifiOff className="h-10 w-10 stroke-[1.5]" />
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-2">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">You are Offline</h2>
          <p className="text-sm text-gray-500 font-semibold leading-relaxed">
            It looks like you have lost your connection to the internet. 
            Reltiva is currently unable to sync fresh listings or load new properties.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleRetry}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none"
          >
            Go to Cached Home
          </Link>
        </div>

        {/* Footer info */}
        <div className="border-t border-gray-50 pt-4 text-xs text-gray-400 font-medium">
          Once your connection is restored, cached actions (like saved properties) will sync automatically.
        </div>

      </div>
    </div>
  );
}
