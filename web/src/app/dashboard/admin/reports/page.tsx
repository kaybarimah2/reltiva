import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AdminReportsClient, { AdminReportItem } from "@/components/dashboard/admin/AdminReportsClient";

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

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "ADMIN") {
    notFound();
  }

  const reportsDb = await db.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      property: {
        select: {
          title: true,
          id: true
        }
      },
      reporter: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  const mappedReports: AdminReportItem[] = reportsDb.map((rep) => {
    // Extract a short reason label from the reason text, or fallback
    let reasonLabel = "Flagged Listing";
    const text = rep.reason.toLowerCase();
    if (text.includes("pricing") || text.includes("price") || text.includes("cheap")) {
      reasonLabel = "Fraudulent Pricing";
    } else if (text.includes("duplicate") || text.includes("copied")) {
      reasonLabel = "Duplicate Listing";
    } else if (text.includes("incorrect") || text.includes("fake") || text.includes("wrong")) {
      reasonLabel = "Incorrect Information";
    } else if (text.includes("offensive") || text.includes("scam") || text.includes("abuse")) {
      reasonLabel = "Scam / Abuse";
    }

    return {
      id: rep.id,
      propertyId: rep.propertyId,
      propertyTitle: rep.property?.title || "Deleted Property",
      reporterName: rep.reporter.name,
      reporterEmail: rep.reporter.email,
      reason: reasonLabel,
      details: rep.reason,
      date: formatRelativeTime(rep.createdAt),
      status: rep.status
    };
  });

  return <AdminReportsClient initialReports={mappedReports} />;
}
