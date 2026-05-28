import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import BuyerEnquiriesClient, { BuyerEnquiryItem } from "@/components/dashboard/buyer/BuyerEnquiriesClient";

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

export default async function BuyerEnquiriesServer() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    notFound();
  }

  const userId = session.user.id;

  const enquiriesDb = await db.enquiry.findMany({
    where: { senderId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      property: {
        include: {
          images: { orderBy: { order: "asc" } }
        }
      },
      agent: {
        select: {
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  const enquiries: BuyerEnquiryItem[] = enquiriesDb.map((e) => ({
    id: e.id,
    propertyId: e.property.id,
    propertyTitle: e.property.title,
    propertyImage: e.property.images.length > 0 ? e.property.images[0].url : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300",
    agentName: e.agent.name,
    agentEmail: e.agent.email,
    agentPhone: e.agent.phone || "",
    date: formatRelativeTime(e.createdAt),
    status: e.status,
    message: e.message
  }));

  return <BuyerEnquiriesClient initialEnquiries={enquiries} />;
}
