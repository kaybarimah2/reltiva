import React from "react";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import PropertyDetailClient, { PropertyDetail, SimilarProperty } from "@/components/property-detail/PropertyDetailClient";
import { PropertyStatus } from "@prisma/client";

export const revalidate = 0; // Fetch fresh data on every request

interface PropertyPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyDetailPageServer({ params }: PropertyPageProps) {
  const { id } = params;

  // 1. Fetch target property with details, agent profile, images, and amenities
  const propertyDb = await db.property.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { order: "asc" }
      },
      amenities: {
        include: {
          amenity: true
        }
      },
      agent: {
        include: {
          profile: true,
          _count: {
            select: { properties: true }
          }
        }
      }
    }
  });

  // 2. Return 404 if property doesn't exist
  if (!propertyDb) {
    notFound();
  }

  // 3. Increment views in the database
  await db.property.update({
    where: { id },
    data: {
      viewCount: {
        increment: 1
      }
    }
  });

  // 4. Calculate agent average rating from reviews
  const reviewsRating = await db.review.aggregate({
    where: { agentId: propertyDb.agentId },
    _avg: { rating: true }
  });
  const agentRating = reviewsRating._avg.rating || 4.8; // Default to 4.8 if no reviews yet

  // 5. Fetch up to 4 similar properties (same region or property type, excluding current)
  const similarDb = await db.property.findMany({
    where: {
      id: { not: propertyDb.id },
      status: PropertyStatus.AVAILABLE,
      OR: [
        { region: propertyDb.region },
        { type: propertyDb.type }
      ]
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 4,
    include: {
      images: {
        orderBy: { order: "asc" }
      }
    }
  });

  // 6. Check if currently saved by logged-in user
  const session = await getServerSession(authOptions);
  let isSavedInitially = false;
  if (session?.user?.id) {
    const savedCount = await db.savedProperty.count({
      where: {
        userId: session.user.id,
        propertyId: propertyDb.id
      }
    });
    isSavedInitially = savedCount > 0;
  }

  // 7. Format the properties to component props interfaces
  let derivedFurnishing = "Unfurnished";
  if (propertyDb.description.toLowerCase().includes("semi-furnished")) {
    derivedFurnishing = "Semi-Furnished";
  } else if (propertyDb.description.toLowerCase().includes("fully furnished") || propertyDb.description.toLowerCase().includes("furnished")) {
    derivedFurnishing = "Furnished";
  }

  const formattedProperty: PropertyDetail = {
    id: propertyDb.id,
    title: propertyDb.title,
    description: propertyDb.description,
    price: propertyDb.price,
    currency: propertyDb.currency,
    type: propertyDb.type,
    listingType: propertyDb.listingType,
    status: propertyDb.status,
    bedrooms: propertyDb.bedrooms,
    bathrooms: propertyDb.bathrooms,
    toilets: propertyDb.toilets,
    size: propertyDb.size,
    region: propertyDb.region,
    city: propertyDb.city,
    neighborhood: propertyDb.neighborhood,
    address: propertyDb.address,
    latitude: propertyDb.latitude,
    longitude: propertyDb.longitude,
    agentId: propertyDb.agentId,
    agentName: propertyDb.agent.name,
    agentPhone: propertyDb.agent.phone || "+233240000000",
    agentAgency: propertyDb.agent.profile?.agency || "Independent Agency",
    agentRating: agentRating,
    agentListingsCount: propertyDb.agent._count.properties,
    agentJoined: propertyDb.agent.createdAt.getFullYear().toString(),
    agentAvatar: propertyDb.agent.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
    images: propertyDb.images.map((img) => img.url),
    amenities: propertyDb.amenities.map((am) => am.amenity.name),
    furnishing: derivedFurnishing,
    createdAt: propertyDb.createdAt.toISOString().split("T")[0],
    isNegotiable: propertyDb.description.toLowerCase().includes("negotiable") || propertyDb.price > 100000,
    views: propertyDb.viewCount + 1 // Reflect the incremented count
  };

  const formattedSimilar: SimilarProperty[] = similarDb.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    currency: p.currency,
    type: p.type,
    listingType: p.listingType,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    neighborhood: p.neighborhood,
    city: p.city,
    images: p.images.map((img) => img.url),
    createdAt: p.createdAt.toISOString().split("T")[0]
  }));

  return (
    <PropertyDetailClient
      property={formattedProperty}
      similarProperties={formattedSimilar}
      isSavedInitially={isSavedInitially}
    />
  );
}
