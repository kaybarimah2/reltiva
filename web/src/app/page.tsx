import React from "react";
import { db } from "@/lib/db";
import HomeClient from "@/components/home/HomeClient";
import { PropertyStatus } from "@prisma/client";

export const revalidate = 0; // Fetch fresh data on every request

export default async function HomePageServer() {
  // 1. Fetch featured properties (latest 6 featured available listings)
  const featuredDb = await db.property.findMany({
    where: {
      featured: true,
      status: PropertyStatus.AVAILABLE,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
    include: {
      images: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  // 2. Fetch recently listed properties (latest 6 available listings)
  const recentDb = await db.property.findMany({
    where: {
      status: PropertyStatus.AVAILABLE,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
    include: {
      images: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  // 3. Fetch spotlight agents (top 3 agents by property count)
  const agentsDb = await db.user.findMany({
    where: {
      role: "AGENT",
    },
    select: {
      name: true,
      avatar: true,
      profile: {
        select: {
          agency: true,
          verified: true,
        },
      },
      _count: {
        select: {
          properties: true,
        },
      },
    },
    orderBy: {
      properties: {
        _count: "desc",
      },
    },
    take: 3,
  });

  // Mapped formatting to fit component props contract
  const featuredProps = featuredDb.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    currency: p.currency,
    type: p.type,
    listingType: p.listingType,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    city: p.city,
    neighborhood: p.neighborhood,
    images: p.images.map((img) => ({ id: img.id, url: img.url })),
  }));

  const recentProps = recentDb.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    currency: p.currency,
    type: p.type,
    listingType: p.listingType,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    city: p.city,
    neighborhood: p.neighborhood,
    images: p.images.map((img) => ({ id: img.id, url: img.url })),
  }));

  return (
    <HomeClient
      featuredProperties={featuredProps}
      recentProperties={recentProps}
      topAgents={agentsDb}
    />
  );
}
