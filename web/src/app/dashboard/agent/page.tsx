import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AgentOverviewClient, { EnqueryItem, ListingItem } from "@/components/dashboard/agent/AgentOverviewClient";
import { notFound } from "next/navigation";

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

export default async function AgentDashboardOverviewServer() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.id) {
    notFound();
  }

  const agentId = session.user.id;

  // 1. Query metrics
  const totalListings = await db.property.count({
    where: { agentId }
  });

  const viewsAggregation = await db.property.aggregate({
    where: { agentId },
    _sum: { viewCount: true }
  });
  const combinedViews = viewsAggregation._sum.viewCount || 0;

  const totalEnquiries = await db.enquiry.count({
    where: { agentId }
  });

  const savedCount = await db.savedProperty.count({
    where: {
      property: { agentId }
    }
  });

  // 2. Query recent 5 enquiries
  const recentEnquiriesDb = await db.enquiry.findMany({
    where: { agentId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      sender: {
        select: {
          name: true,
          phone: true,
          email: true
        }
      },
      property: {
        select: {
          title: true
        }
      }
    }
  });

  const recentEnquiries: EnqueryItem[] = recentEnquiriesDb.map((e) => ({
    id: e.id,
    buyerName: e.sender.name,
    property: e.property.title,
    date: formatRelativeTime(e.createdAt),
    email: e.sender.email,
    phone: e.sender.phone || "+233240000000",
    message: e.message
  }));

  // 3. Query recent 3 listings
  const recentListingsDb = await db.property.findMany({
    where: { agentId },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      images: {
        orderBy: { order: "asc" }
      },
      _count: {
        select: { enquiries: true }
      }
    }
  });

  const recentListings: ListingItem[] = recentListingsDb.map((l) => ({
    id: l.id,
    title: l.title,
    price: l.price,
    type: l.type,
    views: l.viewCount,
    enquiries: l._count.enquiries,
    image: l.images.length > 0 ? l.images[0].url : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300"
  }));

  // 4. Query subscription plan info
  const subscription = await db.subscription.findFirst({
    where: { userId: agentId },
    orderBy: { startDate: "desc" }
  });

  const subscriptionPlan = subscription ? subscription.plan.toString() : "FREE";
  const subscriptionEndDate = subscription?.endDate
    ? subscription.endDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <AgentOverviewClient
      agentName={session.user.name || "Agent"}
      totalListings={totalListings}
      combinedViews={combinedViews}
      totalEnquiries={totalEnquiries}
      savedCount={savedCount}
      subscriptionPlan={subscriptionPlan}
      subscriptionEndDate={subscriptionEndDate}
      recentEnquiries={recentEnquiries}
      recentListings={recentListings}
    />
  );
}
