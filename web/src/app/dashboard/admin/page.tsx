import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AdminOverviewClient, { PendingApprovalItem, RecentRegItem } from "@/components/dashboard/admin/AdminOverviewClient";

export const revalidate = 0; // Fetch fresh data on every request

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function AdminDashboardOverviewServer() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "ADMIN") {
    notFound();
  }

  // 1. Fetch counts
  const totalUsersCount = await db.user.count();
  const totalListingsCount = await db.property.count();
  const totalEnquiriesCount = await db.enquiry.count();

  // 2. Fetch MRR from active subscriptions
  const activeSubs = await db.subscription.findMany({
    where: { status: "ACTIVE" }
  });
  const revenue = activeSubs.reduce((sum, sub) => {
    if (sub.plan === "BASIC") return sum + 200;
    if (sub.plan === "PRO") return sum + 500;
    return sum;
  }, 0);
  const totalRevenueStr = `GHS ${revenue.toLocaleString()}`;

  // 3. Fetch pending listings (verified = false)
  const pendingDb = await db.property.findMany({
    where: { verified: false },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      agent: {
        select: { name: true }
      }
    }
  });

  const pendingListings: PendingApprovalItem[] = pendingDb.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    agentName: p.agent.name,
    date: formatRelativeTime(p.createdAt)
  }));

  // 4. Fetch recent users registrations
  const recentUsersDb = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      profile: {
        select: { verified: true }
      }
    }
  });

  const recentRegistrations: RecentRegItem[] = recentUsersDb.map((u) => {
    let status = "ACTIVE";
    if (u.role === "AGENT" && (!u.profile || !u.profile.verified)) {
      status = "PENDING_VERIFICATION";
    }
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role.toString(),
      status,
      date: formatRelativeTime(u.createdAt)
    };
  });

  return (
    <AdminOverviewClient
      adminName={session.user.name || "Administrator"}
      totalUsersCount={totalUsersCount}
      totalListingsCount={totalListingsCount}
      totalEnquiriesCount={totalEnquiriesCount}
      totalRevenueStr={totalRevenueStr}
      initialPendingListings={pendingListings}
      recentRegistrations={recentRegistrations}
    />
  );
}
