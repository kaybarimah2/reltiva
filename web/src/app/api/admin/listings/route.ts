import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const listings = await db.property.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        agent: {
          select: {
            name: true,
            email: true
          }
        },
        images: {
          orderBy: { order: "asc" }
        }
      }
    });

    return NextResponse.json(listings);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { propertyId, action } = body;

    if (!propertyId || !action) {
      return NextResponse.json({ error: "Property ID and Action are required" }, { status: 400 });
    }

    const existingProperty = await db.property.findUnique({
      where: { id: propertyId }
    });

    if (!existingProperty) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      await db.property.update({
        where: { id: propertyId },
        data: { verified: true }
      });
    } else if (action === "REJECT" || action === "FLAG") {
      await db.property.update({
        where: { id: propertyId },
        data: { verified: false }
      });
    }

    return NextResponse.json({ message: "Action executed successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    await db.property.delete({
      where: { id: propertyId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
