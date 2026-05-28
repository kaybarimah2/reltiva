import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AdminSubscriptionsClient, { AdminSubscriptionItem } from "@/components/dashboard/admin/AdminSubscriptionsClient";

export const revalidate = 0; // Fetch fresh data on every request

export default async function AdminSubscriptionsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "ADMIN") {
    notFound();
  }

  // 1. Fetch subscriptions
  const subscriptionsDb = await db.subscription.findMany({
    orderBy: { startDate: "desc" },
    include: {
      user: {
        select: {
          name: true
        }
      }
    }
  });

  // 2. Compute MRR and counters
  let mrr = 0;
  let activeProCount = 0;
  let activeBasicCount = 0;

  const mappedSubscriptions: AdminSubscriptionItem[] = subscriptionsDb.map((sub) => {
    const isPro = sub.plan === "PRO";
    const isBasic = sub.plan === "BASIC";
    const isActive = sub.status === "ACTIVE";

    if (isActive) {
      if (isPro) {
        mrr += 500;
        activeProCount += 1;
      } else if (isBasic) {
        mrr += 200;
        activeBasicCount += 1;
      }
    }

    return {
      id: sub.id,
      agentName: sub.user.name || "Unknown Agent",
      plan: sub.plan.toString(),
      status: sub.status.toString(),
      start: sub.startDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }),
      end: sub.endDate
        ? sub.endDate.toLocaleDateString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          })
        : "N/A",
      ref: sub.paystackRef || "FREE-ACCOUNT"
    };
  });

  return (
    <AdminSubscriptionsClient
      initialSubscriptions={mappedSubscriptions}
      mrr={mrr}
      activeProCount={activeProCount}
      activeBasicCount={activeBasicCount}
    />
  );
}
