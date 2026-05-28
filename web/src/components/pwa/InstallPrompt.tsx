"use client";

import React, { useState, useEffect } from "react";
import { Share, PlusSquare, X, Download, Home } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // 1. Check if running in standalone mode (already installed)
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // 2. Check if user dismissed the prompt recently
    const isDismissed = localStorage.getItem("r-pwa-dismissed") === "true";
    if (isDismissed) return;

    // 3. Handle Android/Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Handle iOS detection (Safari does not fire beforeinstallprompt)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/crios|fxios|opios|twitter|fbios|instagram/.test(ua);

    if (isIosDevice && isSafari && !isStandalone) {
      setIsIos(true);
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Trigger prompt
    await deferredPrompt.prompt();
    
    // Check outcome
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Install Prompt Outcome: ${outcome}`);
    
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("r-pwa-dismissed", "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 z-50 flex items-start gap-4 animate-in slide-in-from-bottom duration-300">
      
      {/* Platform Branding Icon */}
      <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
        <Home className="h-5.5 w-5.5 stroke-[2.5]" />
      </div>

      {/* Content */}
      <div className="flex-1 text-left">
        <h4 className="text-sm font-black text-gray-800 leading-none">Install Reltiva</h4>
        
        {isIos ? (
          <p className="text-[11px] text-gray-500 font-semibold leading-normal mt-1.5 flex flex-wrap items-center gap-1">
            Tap <Share className="h-3 w-3 inline text-emerald-600 shrink-0" /> Share, then scroll down and select
            <span className="font-bold inline-flex items-center gap-0.5 bg-gray-50 border border-gray-200 px-1 py-0.5 rounded text-[10px] text-gray-700">
              <PlusSquare className="h-3.5 w-3.5 text-gray-700 shrink-0" /> Add to Home Screen
            </span>
          </p>
        ) : (
          <>
            <p className="text-[11px] text-gray-500 font-semibold leading-normal mt-1.5">
              Add Reltiva to your device home screen for fast loading and offline access.
            </p>
            <button
              onClick={handleInstallClick}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Install App
            </button>
          </>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all shrink-0 focus:outline-none"
        aria-label="Dismiss install banner"
      >
        <X className="h-4.5 w-4.5" />
      </button>

    </div>
  );
}
