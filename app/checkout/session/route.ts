// app/api/checkout/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    console.log("Received session_id:", sessionId);

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    if (!sessionId.startsWith("cs_")) {
      return NextResponse.json(
        { error: "Invalid session ID format" },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    });

    console.log("Retrieved session:", {
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
    });

    // Transform the session data
    const orderData = {
      id: session.payment_intent?.id || session.id,
      amount: session.amount_total || 0,
      currency: session.currency || "usd",
      status: session.payment_status,
      customerEmail: session.customer_email,
      items:
        session.line_items?.data.map((item) => ({
          name: item.description || "Unknown Item",
          quantity: item.quantity || 1,
          price: (item.amount_total || 0) / (item.quantity || 1),
        })) || [],
    };

    return NextResponse.json(orderData);
  } catch (error) {
    console.error("Error retrieving session:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to retrieve session details" },
      { status: 500 }
    );
  }
}
