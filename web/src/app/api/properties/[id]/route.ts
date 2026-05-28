import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PropertyStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

// Retrieve a single property's details by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const propertyDb = await db.property.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: "asc" }
        },
        amenities: {
          include: {
            amenity: true
          }
        },
        agent: {
          include: {
            profile: true,
            _count: {
              select: { properties: true }
            }
          }
        }
      }
    });

    if (!propertyDb) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Increment viewCount asynchronously
    db.property.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    }).catch(err => console.error("Failed to increment views:", err));

    const reviewsRating = await db.review.aggregate({
      where: { agentId: propertyDb.agentId },
      _avg: { rating: true }
    });
    const agentRating = reviewsRating._avg.rating || 4.8;

    let derivedFurnishing = "Unfurnished";
    if (propertyDb.description.toLowerCase().includes("semi-furnished")) {
      derivedFurnishing = "Semi-Furnished";
    } else if (propertyDb.description.toLowerCase().includes("fully furnished") || propertyDb.description.toLowerCase().includes("furnished")) {
      derivedFurnishing = "Furnished";
    }

    const session = await getServerSession(authOptions);
    let isSaved = false;
    if (session?.user?.id) {
      const savedCount = await db.savedProperty.count({
        where: {
          userId: session.user.id,
          propertyId: propertyDb.id
        }
      });
      isSaved = savedCount > 0;
    }

    const formattedProperty = {
      id: propertyDb.id,
      title: propertyDb.title,
      description: propertyDb.description,
      price: propertyDb.price,
      currency: propertyDb.currency,
      type: propertyDb.type,
      listingType: propertyDb.listingType,
      status: propertyDb.status,
      bedrooms: propertyDb.bedrooms,
      bathrooms: propertyDb.bathrooms,
      toilets: propertyDb.toilets,
      size: propertyDb.size,
      region: propertyDb.region,
      city: propertyDb.city,
      neighborhood: propertyDb.neighborhood,
      address: propertyDb.address,
      latitude: propertyDb.latitude,
      longitude: propertyDb.longitude,
      agentId: propertyDb.agentId,
      agentName: propertyDb.agent.name,
      agentPhone: propertyDb.agent.phone || "+233240000000",
      agentAgency: propertyDb.agent.profile?.agency || "Independent Agency",
      agentRating: agentRating,
      agentListingsCount: propertyDb.agent._count.properties,
      agentJoined: propertyDb.agent.createdAt.getFullYear().toString(),
      agentAvatar: propertyDb.agent.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
      images: propertyDb.images.map((img) => img.url),
      amenities: propertyDb.amenities.map((am) => am.amenity.name),
      furnishing: derivedFurnishing,
      createdAt: propertyDb.createdAt.toISOString().split("T")[0],
      isNegotiable: propertyDb.description.toLowerCase().includes("negotiable") || propertyDb.price > 100000,
      views: propertyDb.viewCount + 1,
      isSaved
    };

    return NextResponse.json({ property: formattedProperty });
  } catch (error) {
    console.error("Error retrieving property:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}


// Edit property status / featured status
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    
    // Find the property
    const property = await db.property.findUnique({
      where: { id }
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Verify ownership or admin role
    if (property.agentId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status, featured } = body;

    const data: { status?: PropertyStatus; featured?: boolean } = {};
    if (status) data.status = status as PropertyStatus;
    if (featured !== undefined) data.featured = featured;

    const updated = await db.property.update({
      where: { id },
      data
    });

    return NextResponse.json({ success: true, property: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Delete property
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Find the property
    const property = await db.property.findUnique({
      where: { id }
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Verify ownership or admin role
    if (property.agentId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.property.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
