import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import BuyerSavedPropertiesClient, { SavedPropItem } from "@/components/dashboard/buyer/BuyerSavedPropertiesClient";

export const revalidate = 0; // Fetch fresh data on every request

export default async function BuyerSavedPropertiesServer() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    notFound();
  }

  const userId = session.user.id;

  const savedDb = await db.savedProperty.findMany({
    where: { userId },
    orderBy: { savedAt: "desc" },
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

  const savedProperties: SavedPropItem[] = savedDb.map((s) => ({
    id: s.property.id,
    title: s.property.title,
    price: s.property.price,
    location: `${s.property.neighborhood}, ${s.property.city}`,
    beds: s.property.bedrooms,
    baths: s.property.bathrooms,
    image: s.property.images.length > 0 ? s.property.images[0].url : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300",
    isRent: s.property.listingType === "RENT",
    savedAtTime: s.savedAt.getTime()
  }));

  return <BuyerSavedPropertiesClient initialProperties={savedProperties} />;
}
