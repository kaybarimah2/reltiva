import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import BuyerOverviewClient, { DashboardPropItem, DashboardEnquiryItem } from "@/components/dashboard/buyer/BuyerOverviewClient";

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

export default async function BuyerDashboardOverviewServer() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    notFound();
  }

  const userId = session.user.id;

  // 1. Fetch counts
  const savedCount = await db.savedProperty.count({
    where: { userId }
  });

  const enquiriesCount = await db.enquiry.count({
    where: { senderId: userId }
  });

  const alertsCount = await db.alert.count({
    where: { userId }
  });

  // Calculate sum of views on saved properties as dynamic proxy for "properties viewed"
  const savedPropsForViews = await db.savedProperty.findMany({
    where: { userId },
    include: {
      property: {
        select: { viewCount: true }
      }
    }
  });
  const totalViewsCount = savedPropsForViews.reduce((sum, item) => sum + item.property.viewCount, 0);

  // 2. Query recently saved properties
  const recentlySavedDb = await db.savedProperty.findMany({
    where: { userId },
    orderBy: { savedAt: "desc" },
    take: 3,
    include: {
      property: {
        include: {
          images: {
            orderBy: { order: "asc" }
          }
        }
      }
    }
  });

  const recentlySaved: DashboardPropItem[] = recentlySavedDb.map((s) => ({
    id: s.property.id,
    title: s.property.title,
    price: s.property.price,
    location: `${s.property.neighborhood}, ${s.property.city}`,
    beds: s.property.bedrooms,
    baths: s.property.bathrooms,
    image: s.property.images.length > 0 ? s.property.images[0].url : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300",
    isRent: s.property.listingType === "RENT"
  }));

  // 3. Query recent enquiries
  const recentEnquiriesDb = await db.enquiry.findMany({
    where: { senderId: userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      property: {
        select: { title: true }
      },
      agent: {
        select: { name: true }
      }
    }
  });

  const recentEnquiries: DashboardEnquiryItem[] = recentEnquiriesDb.map((e) => ({
    id: e.id,
    propertyTitle: e.property.title,
    agentName: e.agent.name,
    message: e.message,
    date: formatRelativeTime(e.createdAt),
    status: e.status
  }));

  // 4. Query suggested properties (type matches saved items or featured ones)
  const savedTypes = Array.from(new Set(recentlySavedDb.map((s) => s.property.type)));
  const savedIds = recentlySavedDb.map((s) => s.property.id);

  const suggestedDb = await db.property.findMany({
    where: {
      id: { notIn: savedIds },
      status: "AVAILABLE",
      ...(savedTypes.length > 0 ? { type: { in: savedTypes } } : { featured: true })
    },
    orderBy: { createdAt: "desc" },
    take: 2,
    include: {
      images: {
        orderBy: { order: "asc" }
      }
    }
  });

  const suggestedProperties: DashboardPropItem[] = suggestedDb.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    location: `${p.neighborhood}, ${p.city}`,
    beds: p.bedrooms,
    baths: p.bathrooms,
    image: p.images.length > 0 ? p.images[0].url : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300",
    isRent: p.listingType === "RENT"
  }));

  return (
    <BuyerOverviewClient
      buyerName={session.user.name || "Buyer"}
      savedCount={savedCount}
      enquiriesCount={enquiriesCount}
      alertsCount={alertsCount}
      totalViewsCount={totalViewsCount}
      recentlySaved={recentlySaved}
      recentEnquiries={recentEnquiries}
      suggestedProperties={suggestedProperties}
    />
  );
}
