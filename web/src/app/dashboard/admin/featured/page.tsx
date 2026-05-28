import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AdminFeaturedSlotsClient, {
  FeaturedListingItem,
  EligibleListingItem
} from "@/components/dashboard/admin/AdminFeaturedSlotsClient";

export const revalidate = 0; // Fetch fresh data on every request

export default async function AdminFeaturedSlotsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "ADMIN") {
    notFound();
  }

  // 1. Fetch featured listings
  const featuredDb = await db.property.findMany({
    where: { featured: true },
    include: {
      images: {
        orderBy: { order: "asc" },
        take: 1
      }
    }
  });

  // 2. Fetch eligible listings (verified active properties that are not currently featured)
  const eligibleDb = await db.property.findMany({
    where: { featured: false, verified: true },
    include: {
      images: {
        orderBy: { order: "asc" },
        take: 1
      }
    }
  });

  const initialFeatured: FeaturedListingItem[] = featuredDb.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    start: p.createdAt.toLocaleDateString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }),
    end: new Date(p.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }),
    image: p.images.length > 0 ? p.images[0].url : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=150"
  }));

  const initialEligibleListings: EligibleListingItem[] = eligibleDb.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    image: p.images.length > 0 ? p.images[0].url : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=150"
  }));

  return (
    <AdminFeaturedSlotsClient
      initialFeatured={initialFeatured}
      initialEligibleListings={initialEligibleListings}
    />
  );
}
