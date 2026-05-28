import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendPaymentFailedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error("❌ Paystack Secret Key not configured for webhooks");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    // 1. Verify HMAC SHA512 Signature
    const hash = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.warn("⚠️ Invalid Paystack webhook signature received");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2. Process Paystack Webhook Event
    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    console.log(`📩 Paystack webhook event received: ${event}`);

    switch (event) {
      case "charge.success": {
        const userEmail = data.customer?.email;
        const userId = data.metadata?.userId;
        const planType = data.metadata?.planType;
        const planCode = data.plan?.plan_code;
        const reference = data.reference;

        // Resolve which plan is purchased
        let finalPlan: "FREE" | "BASIC" | "PRO" = "FREE";
        if (planCode === process.env.PAYSTACK_PRO_PLAN_CODE || planType === "PRO") {
          finalPlan = "PRO";
        } else if (planCode === process.env.PAYSTACK_BASIC_PLAN_CODE || planType === "BASIC") {
          finalPlan = "BASIC";
        }

        // Locate user in database
        let user = null;
        if (userId) {
          user = await db.user.findUnique({ where: { id: userId } });
        }
        if (!user && userEmail) {
          user = await db.user.findUnique({ where: { email: userEmail } });
        }

        if (!user) {
          console.error(`❌ User not found for email: ${userEmail} or ID: ${userId}`);
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user already has an active or past subscription record
        const existingSub = await db.subscription.findFirst({
          where: { userId: user.id }
        });

        if (existingSub) {
          await db.subscription.update({
            where: { id: existingSub.id },
            data: {
              plan: finalPlan,
              status: "ACTIVE",
              paystackRef: reference,
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days renewal cycle
            }
          });
        } else {
          await db.subscription.create({
            data: {
              userId: user.id,
              plan: finalPlan,
              status: "ACTIVE",
              paystackRef: reference,
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
          });
        }

        console.log(`✅ Successfully upgraded User ${user.email} to ${finalPlan} subscription`);
        break;
      }

      case "subscription.disable": {
        // Disables/Downgrades agent plan to FREE when subscription is disabled or canceled
        const userEmail = data.customer?.email || data.email;

        if (userEmail) {
          const user = await db.user.findUnique({ where: { email: userEmail } });
          if (user) {
            await db.subscription.updateMany({
              where: { userId: user.id },
              data: {
                plan: "FREE",
                status: "CANCELLED",
                endDate: new Date(),
              },
            });
            console.log(`📉 Downgraded User ${user.email} subscription to FREE`);
          }
        }
        break;
      }

      case "invoice.payment_failed":
      case "charge.failed": {
        // Notify agent when a renewal or direct payment attempt fails
        const userEmail = data.customer?.email || data.email;
        const planName = data.plan?.name || "Premium Agent Plan";

        if (userEmail) {
          const user = await db.user.findUnique({ where: { email: userEmail } });
          if (user) {
            await sendPaymentFailedEmail(user.email, user.name, planName);
            console.log(`⚠️ Sent payment failed notification to agent: ${user.email}`);
          }
        }
        break;
      }

      default:
        console.log(`ℹ️ Webhook event ignored: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Paystack webhook runtime error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
