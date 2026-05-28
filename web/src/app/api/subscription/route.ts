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

    const userId = session.user.id;

    // Find the latest subscription for this user
    const subscription = await db.subscription.findFirst({
      where: { userId },
      orderBy: { startDate: "desc" }
    });

    if (!subscription) {
      // Default fallback for users without a billing record
      return NextResponse.json({
        plan: "FREE",
        status: "ACTIVE",
        startDate: new Date(),
        endDate: null,
        paystackRef: null
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Fetch subscription error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
