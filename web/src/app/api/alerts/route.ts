import { NextResponse, NextRequest } from "next/server";
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

    const alerts = await db.alert.findMany({
      where: { userId: session.user.id }
    });

    return NextResponse.json(alerts);
  } catch (error) {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { location, propertyType, listingType, minPrice, maxPrice, bedrooms, frequency } = body;

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    const filtersJson = {
      location,
      propertyType,
      listingType,
      minPrice: minPrice ? parseInt(minPrice) : 0,
      maxPrice: maxPrice ? parseInt(maxPrice) : 0,
      bedrooms: bedrooms ? parseInt(bedrooms) : 0,
      isActive: true
    };

    const newAlert = await db.alert.create({
      data: {
        userId: session.user.id,
        filters: filtersJson,
        frequency: frequency || "Daily"
      }
    });

    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
