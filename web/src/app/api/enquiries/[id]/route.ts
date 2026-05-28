import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    
    // Find the enquiry
    const enquiry = await db.enquiry.findUnique({
      where: { id }
    });

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    // Verify ownership (only the recipient agent can update status)
    if (enquiry.agentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body; // e.g. "READ" or "NEW"

    if (!status || (status !== "READ" && status !== "NEW")) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await db.enquiry.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, enquiry: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
