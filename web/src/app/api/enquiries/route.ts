import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEnquiryEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, id: userId } = session.user;

    let enquiriesDb;
    if (role === "AGENT") {
      // Fetch received enquiries for the agent
      enquiriesDb = await db.enquiry.findMany({
        where: { agentId: userId },
        orderBy: { createdAt: "desc" },
        include: {
          property: {
            include: {
              images: { orderBy: { order: "asc" } }
            }
          },
          sender: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          }
        }
      });

      const enquiries = enquiriesDb.map((e) => ({
        id: e.id,
        propertyId: e.property.id,
        propertyTitle: e.property.title,
        propertyImage: e.property.images.length > 0 ? e.property.images[0].url : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300",
        senderName: e.sender.name,
        senderEmail: e.sender.email,
        senderPhone: e.sender.phone || "",
        createdAt: e.createdAt.toISOString(),
        status: e.status,
        message: e.message
      }));

      return NextResponse.json({ enquiries });
    } else {
      // Fetch sent enquiries for the buyer
      enquiriesDb = await db.enquiry.findMany({
        where: { senderId: userId },
        orderBy: { createdAt: "desc" },
        include: {
          property: {
            include: {
              images: { orderBy: { order: "asc" } }
            }
          },
          agent: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          }
        }
      });

      const enquiries = enquiriesDb.map((e) => ({
        id: e.id,
        propertyId: e.property.id,
        propertyTitle: e.property.title,
        propertyImage: e.property.images.length > 0 ? e.property.images[0].url : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300",
        agentName: e.agent.name,
        agentEmail: e.agent.email,
        agentPhone: e.agent.phone || "",
        createdAt: e.createdAt.toISOString(),
        status: e.status,
        message: e.message
      }));

      return NextResponse.json({ enquiries });
    }
  } catch (error) {
    console.error("Error retrieving enquiries:", error);
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
      return NextResponse.json({ error: "You must be logged in to send an enquiry" }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId, agentId, message } = body;

    if (!propertyId || !agentId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify property and agent exist
    const property = await db.property.findUnique({
      where: { id: propertyId },
      include: { agent: true }
    });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const enquiry = await db.enquiry.create({
      data: {
        propertyId,
        agentId,
        senderId: session.user.id,
        message,
        status: "NEW",
      }
    });

    // Send email alert to listing agent
    try {
      await sendEnquiryEmail(
        property.agent.email,
        property.agent.name,
        session.user.name || "A Reltiva Buyer",
        session.user.email || "",
        (session.user as { phone?: string | null }).phone || null,
        property.title,
        message,
        property.id
      );
    } catch (emailError) {
      console.error("Enquiry notification email failed:", emailError);
    }

    return NextResponse.json({ success: true, enquiry });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
