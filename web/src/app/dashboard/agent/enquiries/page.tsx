import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AgentEnquiriesClient, { AgentEnquiryItem } from "@/components/dashboard/agent/AgentEnquiriesClient";
import { notFound } from "next/navigation";

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

export default async function AgentEnquiriesPageServer() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    notFound();
  }

  const agentId = session.user.id;

  // Query enquiries
  const enquiriesDb = await db.enquiry.findMany({
    where: { agentId },
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: {
          name: true,
          phone: true,
          email: true
        }
      },
      property: {
        select: {
          title: true
        }
      }
    }
  });

  const formattedEnquiries: AgentEnquiryItem[] = enquiriesDb.map((e) => ({
    id: e.id,
    buyerName: e.sender.name,
    property: e.property.title,
    date: formatRelativeTime(e.createdAt),
    email: e.sender.email,
    phone: e.sender.phone || "+233240000000",
    message: e.message,
    read: e.status === "READ"
  }));

  return (
    <AgentEnquiriesClient initialEnquiries={formattedEnquiries} />
  );
}
