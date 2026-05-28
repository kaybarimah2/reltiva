import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Retrieve list of saved property IDs or full property details for the currently logged in user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ savedIds: [], properties: [] });
    }

    const { searchParams } = new URL(request.url);
    const details = searchParams.get("details") === "true";

    if (details) {
      const saved = await db.savedProperty.findMany({
        where: { userId: session.user.id },
        orderBy: { savedAt: "desc" },
        include: {
          property: {
            include: {
              images: {
                orderBy: { order: "asc" }
              }
            }
          }
        }
      });

      const formatted = saved.map((s) => ({
        id: s.property.id,
        title: s.property.title,
        price: s.property.price,
        neighborhood: s.property.neighborhood,
        city: s.property.city,
        region: s.property.region,
        bedrooms: s.property.bedrooms,
        bathrooms: s.property.bathrooms,
        image: s.property.images.length > 0 ? s.property.images[0].url : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300",
        listingType: s.property.listingType,
        type: s.property.type
      }));

      return NextResponse.json({ properties: formatted });
    } else {
      const saved = await db.savedProperty.findMany({
        where: { userId: session.user.id },
        select: { propertyId: true }
      });

      return NextResponse.json({
        savedIds: saved.map((s) => s.propertyId)
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Toggle saving/unsaving a property
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID required" }, { status: 400 });
    }

    // Check if property exists
    const propertyExists = await db.property.findUnique({
      where: { id: propertyId }
    });
    if (!propertyExists) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Check if already saved
    const existing = await db.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: session.user.id,
          propertyId
        }
      }
    });

    if (existing) {
      // Remove save
      await db.savedProperty.delete({
        where: {
          userId_propertyId: {
            userId: session.user.id,
            propertyId
          }
        }
      });
      return NextResponse.json({ saved: false });
    } else {
      // Create save
      await db.savedProperty.create({
        data: {
          userId: session.user.id,
          propertyId
        }
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
