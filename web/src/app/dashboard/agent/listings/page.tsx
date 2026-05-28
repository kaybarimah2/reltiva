import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AgentListingsClient, { AgentListingItem } from "@/components/dashboard/agent/AgentListingsClient";
import { notFound } from "next/navigation";

export const revalidate = 0; // Fetch fresh data on every request

export default async function AgentListingsPageServer() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    notFound();
  }

  const agentId = session.user.id;

  // Query all listings for this agent
  const propertiesDb = await db.property.findMany({
    where: { agentId },
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        orderBy: { order: "asc" }
      },
      _count: {
        select: { enquiries: true }
      }
    }
  });

  const formattedProperties: AgentListingItem[] = propertiesDb.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    type: p.type,
    listingType: p.listingType,
    status: p.status,
    views: p.viewCount,
    enquiries: p._count.enquiries,
    image: p.images.length > 0 ? p.images[0].url : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300",
    featured: p.featured
  }));

  return (
    <AgentListingsClient initialProperties={formattedProperties} />
  );
}
