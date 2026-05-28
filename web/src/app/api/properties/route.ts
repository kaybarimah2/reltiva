import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { PropertyStatus, PropertyType, ListingType, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region");
    const city = searchParams.get("city");
    const neighborhood = searchParams.get("neighborhood");
    const listingType = searchParams.get("listingType"); // SALE, RENT, ANY
    const propertyType = searchParams.get("propertyType");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const bathrooms = searchParams.get("bathrooms");
    const furnishing = searchParams.get("furnishing");
    
    // Split amenities string if present
    const amenitiesRaw = searchParams.get("amenities");
    const amenities = amenitiesRaw ? amenitiesRaw.split(",").filter(Boolean) : [];
    
    const sort = searchParams.get("sort") || "NEWEST";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");

    const offset = (page - 1) * limit;

    // Build the query where object
    const agentId = searchParams.get("agentId");
    const where: Prisma.PropertyWhereInput = {};

    if (agentId) {
      where.agentId = agentId;
    } else {
      where.status = {
        in: [PropertyStatus.AVAILABLE, PropertyStatus.UNDER_OFFER]
      };
    }

    if (region) where.region = region;
    if (city) where.city = city;
    if (neighborhood) where.neighborhood = neighborhood;

    if (listingType && listingType !== "ANY") {
      where.listingType = listingType as ListingType;
    }
    
    if (propertyType) {
      where.type = propertyType as PropertyType;
    }

    if (minPrice || maxPrice) {
      const priceFilter: Prisma.FloatFilter = {};
      if (minPrice) priceFilter.gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
      where.price = priceFilter;
    }

    if (bedrooms) {
      if (bedrooms === "5+") {
        where.bedrooms = { gte: 5 };
      } else {
        where.bedrooms = parseInt(bedrooms);
      }
    }

    if (bathrooms) {
      // E.g. "2" means 2+ bathrooms
      where.bathrooms = { gte: parseFloat(bathrooms) };
    }

    // Note: Since furnishing is a text field in description or details (not in schema),
    // we can use a loose matches condition on the description if searched,
    // or ignore since schema does not contain an explicit furnishing field.
    // Let's filter description loosely if furnishing is selected.
    if (furnishing) {
      where.description = {
        contains: furnishing,
        mode: "insensitive"
      };
    }

    // Filter by ALL selected amenities (AND mapping)
    if (amenities.length > 0) {
      where.AND = amenities.map((amName) => ({
        amenities: {
          some: {
            amenity: {
              name: {
                contains: amName,
                mode: "insensitive"
              }
            }
          }
        }
      }));
    }

    // Handle sort options
    let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "PRICE_ASC") {
      orderBy = { price: "asc" };
    } else if (sort === "PRICE_DESC") {
      orderBy = { price: "desc" };
    } else if (sort === "MOST_POPULAR") {
      orderBy = { viewCount: "desc" };
    }

    // Query database
    const [properties, total] = await Promise.all([
      db.property.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          images: {
            orderBy: { order: "asc" }
          },
          agent: {
            select: {
              name: true,
              avatar: true,
            }
          },
          amenities: {
            include: {
              amenity: true
            }
          }
        }
      }),
      db.property.count({ where })
    ]);

    // Format for front-end structure
    const formattedProperties = properties.map((p) => {
      // Extract furnishing if mentioned in description for UI consistency
      let derivedFurnishing = "Unfurnished";
      if (p.description.toLowerCase().includes("semi-furnished")) {
        derivedFurnishing = "Semi-Furnished";
      } else if (p.description.toLowerCase().includes("fully furnished") || p.description.toLowerCase().includes("furnished")) {
        derivedFurnishing = "Furnished";
      }

      return {
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        currency: p.currency,
        type: p.type,
        listingType: p.listingType,
        status: p.status,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        toilets: p.toilets,
        size: p.size,
        region: p.region,
        city: p.city,
        neighborhood: p.neighborhood,
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude,
        agentName: p.agent.name,
        agentAvatar: p.agent.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
        image: p.images.length > 0 ? p.images[0].url : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600",
        amenities: p.amenities.map((a) => a.amenity.name),
        furnishing: derivedFurnishing,
        createdAt: p.createdAt.toISOString().split("T")[0]
      };
    });

    return NextResponse.json({
      properties: formattedProperties,
      total
    });
  } catch (error) {
    console.error("Error query properties:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Only agents can create listings." }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      currency,
      type,
      listingType,
      bedrooms,
      bathrooms,
      toilets,
      size,
      region,
      city,
      neighborhood,
      address,
      latitude,
      longitude,
      amenities, // string[]
      images, // string[]
    } = body;

    if (!title || !description || !price || !type || !listingType || !region || !city || !neighborhood || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create property
    const createdProperty = await db.property.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        currency: currency || "GHS",
        type: type as PropertyType,
        listingType: listingType as ListingType,
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseFloat(bathrooms) || 0,
        toilets: parseInt(toilets) || 0,
        size: size ? parseFloat(size) : null,
        region,
        city,
        neighborhood,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        agentId: session.user.id,
      }
    });

    // 2. Create images
    if (images && images.length > 0) {
      await db.propertyImage.createMany({
        data: images.map((url: string, index: number) => ({
          propertyId: createdProperty.id,
          url,
          order: index,
        }))
      });
    }

    // 3. Connect amenities (upserting to ensure they exist)
    if (amenities && amenities.length > 0) {
      for (const amName of amenities) {
        const am = await db.amenity.upsert({
          where: { name: amName },
          update: {},
          create: { name: amName, icon: "Check" }
        });

        await db.propertyAmenity.create({
          data: {
            propertyId: createdProperty.id,
            amenityId: am.id,
          }
        });
      }
    }

    return NextResponse.json({ success: true, property: createdProperty });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
