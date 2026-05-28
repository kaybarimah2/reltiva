import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alertId = params.id;
    const existingAlert = await db.alert.findUnique({
      where: { id: alertId }
    });

    if (!existingAlert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    if (existingAlert.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { isActive } = body;

    const currentFilters = (typeof existingAlert.filters === "string" 
      ? JSON.parse(existingAlert.filters) 
      : existingAlert.filters) as Record<string, unknown>;

    const updatedFilters = {
      ...currentFilters,
      isActive: isActive !== undefined ? isActive : currentFilters.isActive
    };

    const updated = await db.alert.update({
      where: { id: alertId },
      data: {
        filters: updatedFilters
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alertId = params.id;
    const existingAlert = await db.alert.findUnique({
      where: { id: alertId }
    });

    if (!existingAlert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    if (existingAlert.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    await db.alert.delete({
      where: { id: alertId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
