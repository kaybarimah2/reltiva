import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planType } = body;

    if (planType !== "BASIC" && planType !== "PRO") {
      return NextResponse.json({ error: "Invalid plan selection" }, { status: 400 });
    }

    // 1. Resolve pricing details and Paystack plan codes
    let amount = 0;
    let planCode = "";

    if (planType === "BASIC") {
      amount = 200 * 100; // Paystack accepts amount in pesewas/cents (GHS 200.00 = 20000)
      planCode = process.env.PAYSTACK_BASIC_PLAN_CODE || "";
    } else if (planType === "PRO") {
      amount = 500 * 100; // GHS 500.00 = 50000
      planCode = process.env.PAYSTACK_PRO_PLAN_CODE || "";
    }

    if (!planCode) {
      return NextResponse.json({ error: `Paystack Plan Code for ${planType} is not configured` }, { status: 500 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Paystack Secret Key is not configured" }, { status: 500 });
    }

    // 2. Call Paystack's Transaction Initialization Endpoint
    const callbackUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/agent/subscription?status=success`;

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: session.user.email,
        amount: amount.toString(),
        plan: planCode,
        callback_url: callbackUrl,
        metadata: {
          userId: session.user.id,
          planType,
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      return NextResponse.json(
        { error: paystackData.message || "Failed to initialize Paystack transaction" },
        { status: paystackResponse.status || 500 }
      );
    }

    // 3. Return the authorization redirect URL and transaction reference
    return NextResponse.json({
      authorizationUrl: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
    });
  } catch (error) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
