import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import BuyerAlertsClient, { BuyerAlertItem } from "@/components/dashboard/buyer/BuyerAlertsClient";

export const revalidate = 0; // Fetch fresh data on every request

interface AlertFilters {
  location?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  isActive?: boolean;
}

export default async function BuyerAlertsServer() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    notFound();
  }

  const userId = session.user.id;

  const alertsDb = await db.alert.findMany({
    where: { userId },
    orderBy: { lastSent: "desc" }
  });

  const alerts: BuyerAlertItem[] = alertsDb.map((al) => {
    const filters = (typeof al.filters === "string" 
      ? JSON.parse(al.filters) 
      : al.filters) as AlertFilters;

    return {
      id: al.id,
      location: filters?.location || "",
      propertyType: filters?.propertyType || "APARTMENT",
      listingType: filters?.listingType || "RENT",
      minPrice: filters?.minPrice || 0,
      maxPrice: filters?.maxPrice || 0,
      bedrooms: filters?.bedrooms || 0,
      frequency: al.frequency,
      isActive: filters?.isActive !== undefined ? !!filters.isActive : true,
      lastTriggered: al.lastSent ? al.lastSent.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Never triggered"
    };
  });

  return <BuyerAlertsClient initialAlerts={alerts} />;
}
