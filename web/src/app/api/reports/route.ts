import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendReportEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "You must be logged in to report a listing" }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId, reason } = body;

    if (!propertyId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify property exists
    const property = await db.property.findUnique({
      where: { id: propertyId }
    });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const report = await db.report.create({
      data: {
        propertyId,
        reporterId: session.user.id,
        reason,
        status: "PENDING",
      }
    });

    // Send email alert to system admins
    try {
      const admins = await db.user.findMany({
        where: { role: "ADMIN" }
      });
      
      const reporterName = session.user.name || "A Reltiva User";
      
      for (const admin of admins) {
        await sendReportEmail(
          admin.email,
          admin.name,
          reporterName,
          property.title,
          reason,
          property.id
        );
      }
    } catch (emailError) {
      console.error("Report notification email failed:", emailError);
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
