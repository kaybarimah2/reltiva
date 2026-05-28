import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Only agents can access statistics." }, { status: 403 });
    }

    const agentId = session.user.id;

    // 1. Query metrics
    const totalListings = await db.property.count({
      where: { agentId }
    });

    const viewsAggregation = await db.property.aggregate({
      where: { agentId },
      _sum: { viewCount: true }
    });
    const combinedViews = viewsAggregation._sum.viewCount || 0;

    const totalEnquiries = await db.enquiry.count({
      where: { agentId }
    });

    const savedCount = await db.savedProperty.count({
      where: {
        property: { agentId }
      }
    });

    // 2. Query subscription plan info
    const subscription = await db.subscription.findFirst({
      where: { userId: agentId },
      orderBy: { startDate: "desc" }
    });

    const subscriptionPlan = subscription ? subscription.plan.toString() : "FREE";
    const subscriptionEndDate = subscription?.endDate
      ? subscription.endDate.toISOString().split("T")[0]
      : null;

    return NextResponse.json({
      totalListings,
      combinedViews,
      totalEnquiries,
      savedCount,
      subscriptionPlan,
      subscriptionEndDate
    });
  } catch (error) {
    console.error("Error retrieving agent statistics:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
