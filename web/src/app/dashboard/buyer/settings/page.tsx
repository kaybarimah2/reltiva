import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import BuyerSettingsClient from "@/components/dashboard/buyer/BuyerSettingsClient";

export const revalidate = 0; // Fetch fresh data on every request

export default async function BuyerSettingsServer() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    notFound();
  }

  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    notFound();
  }

  const initialProfile = {
    fullName: user.name,
    email: user.email,
    phone: user.phone || "",
    avatar: user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
  };

  return <BuyerSettingsClient initialProfile={initialProfile} />;
}
