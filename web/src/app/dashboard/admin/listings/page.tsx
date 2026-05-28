import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AdminListingsClient, { AdminListingItem } from "@/components/dashboard/admin/AdminListingsClient";

export const revalidate = 0; // Fetch fresh data on every request

export default async function AdminListingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "ADMIN") {
    notFound();
  }

  const properties = await db.property.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      agent: {
        select: {
          name: true,
        },
      },
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
      reports: {
        select: {
          status: true,
        },
      },
    },
  });

  const mappedListings: AdminListingItem[] = properties.map((p) => {
    // If the listing has pending (unresolved) reports, mark it as FLAGGED
    const hasPendingReports = p.reports.some((r) => r.status === "PENDING");
    let status = p.verified ? "ACTIVE" : "PENDING";
    if (hasPendingReports) {
      status = "FLAGGED";
    }

    return {
      id: p.id,
      title: p.title,
      location: `${p.neighborhood}, ${p.city}`,
      agent: p.agent.name,
      type: p.type,
      price: p.price,
      status,
      date: p.createdAt.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      image: p.images.length > 0 ? p.images[0].url : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=150",
    };
  });

  return <AdminListingsClient initialListings={mappedListings} />;
}
