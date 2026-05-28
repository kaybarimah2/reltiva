"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CreditCard,
  Check,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Sparkles
} from "lucide-react";

interface SubscriptionData {
  id?: string;
  plan: "FREE" | "BASIC" | "PRO";
  status: string;
  startDate: string;
  endDate: string | null;
  paystackRef: string | null;
}

// Plan Tiers
const PLANS = [
  {
    id: "FREE",
    name: "Free Trial Plan",
    price: "0",
    period: "forever",
    description: "Ideal for individual landlords listing personal properties.",
    features: [
      "Maximum of 3 active listings",
      "Standard search results placement",
      "Direct WhatsApp & phone contact buttons",
      "Email enquiry notifications",
      "Basic details upload"
    ],
    badgeColor: "bg-gray-100 text-gray-800 border-gray-200",
    buttonText: "Choose Free",
    active: false
  },
  {
    id: "BASIC",
    name: "Basic Agent Plan",
    price: "200",
    period: "month",
    description: "Great for small agencies and professional local agents.",
    features: [
      "Maximum of 10 active listings",
      "Verified Agent badge on profile",
      "Direct link to dedicated agent profile page",
      "Email enquiry inbox dashboard",
      "Access to basic views counter",
      "Standard search placement"
    ],
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    buttonText: "Upgrade to Basic",
    active: false
  },
  {
    id: "PRO",
    name: "Pro Agency Plan",
    price: "500",
    period: "month",
    description: "Best for commercial agencies and premium realtors.",
    features: [
      "Unlimited active listings",
      "Priority top placement in search feeds",
      "Verified Agency badge on listings",
      "Detailed Line/Bar performance analytics",
      "Feature up to 5 properties at once",
      "24/7 dedicated account support team"
    ],
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    buttonText: "Upgrade to Pro",
    active: false
  }
];

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const statusParam = searchParams.get("status");
  const referenceParam = searchParams.get("reference");

  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [upgradedPlanId, setUpgradedPlanId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/subscription");
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      } else {
        setError("Failed to retrieve subscription status.");
      }
    } catch {
      setError("Network error fetching subscription.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    
    if (statusParam === "success" && referenceParam) {
      setSuccessMessage("Upgrade Successful! Paystack payment complete. Database sync is processing in the background.");
      // Clear URL params to clean up view
      setTimeout(() => {
        router.replace("/dashboard/agent/subscription");
      }, 5000);
    }
  }, [statusParam, referenceParam, router]);

  const handleUpgrade = async (planId: string) => {
    if (planId === "FREE") {
      setError("Free plan is default. You can upgrade to paid plans below.");
      return;
    }
    
    setUpgradedPlanId(planId);
    setError("");
    
    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: planId }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize checkout");
      }
      
      if (data.authorizationUrl) {
        // Redirect to Paystack check-out URL
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error("No authorization URL returned from billing API.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setUpgradedPlanId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <span className="text-xs font-semibold">Loading subscription info...</span>
      </div>
    );
  }

  const activePlanId = subscription?.plan || "FREE";
  const activePlanDetails = PLANS.find(p => p.id === activePlanId) || PLANS[0];
  
  let renewalDate = null;
  if (subscription?.endDate) {
    try {
      renewalDate = new Date(subscription.endDate).toLocaleDateString(undefined, { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
    } catch {
      renewalDate = null;
    }
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-none">Subscription Details</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1.5">Manage your active plans, pricing limits, and premium features options.</p>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-emerald-800 text-sm font-semibold">
          <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>{successMessage}</div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-800 text-sm font-semibold">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Current Active Plan Banner */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-4 items-center">
          <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
            <CreditCard className="h-6 w-6" />
          </div>
          <div className="leading-none text-left space-y-1">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Plan</p>
            <h3 className="text-lg font-black text-gray-800">
              {activePlanDetails.name} {activePlanId !== "FREE" ? `(GHS ${activePlanDetails.price}/mo)` : ""}
            </h3>
            <span className="text-[10px] text-gray-400 font-semibold block">
              {activePlanId === "FREE" 
                ? "Upgrade below to unlock verified agent status and listing boosts." 
                : renewalDate 
                  ? `Billing cycle renews automatically on ${renewalDate}.`
                  : "Paystack integration active."
              }
            </span>
          </div>
        </div>

        <span className="bg-emerald-50 text-emerald-700 font-black px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
          <ShieldCheck className="h-4 w-4" /> Account Active
        </span>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {PLANS.map((plan) => {
          const isCurrent = activePlanId === plan.id;
          const isUpgrading = upgradedPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 relative ${
                isCurrent
                  ? "border-emerald-500 ring-2 ring-emerald-500/10 scale-[1.02]"
                  : "border-gray-100 hover:border-gray-300"
              }`}
            >
              {/* Featured Ribbon for Pro */}
              {plan.id === "PRO" && (
                <span className="absolute -top-3 right-6 bg-emerald-600 text-white font-black text-[9px] px-3.5 py-1 rounded-full shadow tracking-wider uppercase">
                  Best Value
                </span>
              )}

              <div className="space-y-4">
                {/* Title & Pricing */}
                <div className="space-y-1 text-left">
                  <h3 className="font-extrabold text-gray-900 text-base">{plan.name}</h3>
                  <p className="text-xs text-gray-400 font-semibold">{plan.description}</p>
                  
                  <div className="pt-3 block">
                    <span className="text-3xl font-black text-gray-900">GHS {plan.price}</span>
                    <span className="text-xs text-gray-400 font-bold ml-1">/ {plan.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2 text-xs font-semibold text-gray-600 border-t border-gray-50 pt-4 text-left">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action upgrade button */}
              <div className="pt-6">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-black rounded-xl text-xs border border-emerald-100 cursor-default"
                  >
                    Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgradedPlanId !== null}
                    className="w-full py-2.5 bg-gray-900 hover:bg-gray-950 text-white font-black rounded-xl text-xs transition-colors disabled:opacity-50"
                  >
                    {isUpgrading ? "Connecting Paystack..." : plan.buttonText}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

export default function AgentSubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20 text-gray-500">
        Loading...
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}
