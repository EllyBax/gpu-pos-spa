// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received request body:", body);

    const { items, customerInfo, successUrl, cancelUrl } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("No items provided:", items);
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Validate Stripe secret key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Stripe secret key not found");
      return NextResponse.json(
        { error: "Stripe configuration error" },
        { status: 500 }
      );
    }

    console.log("Processing items:", items);

    // Create line items for Stripe checkout
    const lineItems = items.map((item: any) => {
      console.log("Processing item:", item);

      if (!item.name || !item.price || !item.quantity) {
        throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: `Quantity: ${item.quantity}`,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    console.log("Created line items:", lineItems);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${
        successUrl || request.nextUrl.origin + "/checkout/success"
      }?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        cancelUrl || request.nextUrl.origin + "/checkout/cancel"
      }?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: customerInfo?.email,
      metadata: {
        customer_name: customerInfo?.name || "",
        customer_phone: customerInfo?.phone || "",
        customer_address: customerInfo?.address || "",
        order_items: JSON.stringify(
          items.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          }))
        ),
      },
      // Removed shipping and billing collection for faster checkout
    });

    console.log("Created session:", session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Checkout Session API is working",
    timestamp: new Date().toISOString(),
  });
}
