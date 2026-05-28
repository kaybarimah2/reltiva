import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AdminUsersClient, { AdminUserItem } from "@/components/dashboard/admin/AdminUsersClient";

export const revalidate = 0; // Fetch fresh data on every request

export default async function AdminUsersServer() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "ADMIN") {
    notFound();
  }

  const usersDb = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      profile: {
        select: { verified: true }
      }
    }
  });

  const users: AdminUserItem[] = usersDb.map((u) => {
    let status = "ACTIVE";
    if (u.role === "AGENT" && (!u.profile || !u.profile.verified)) {
      status = "PENDING_VERIFICATION";
    }
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role.toString(),
      status,
      joined: u.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      phone: u.phone || "Not specified",
      avatar: u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    };
  });

  return <AdminUsersClient initialUsers={users} />;
}
