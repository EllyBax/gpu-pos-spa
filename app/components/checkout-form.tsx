"use client";

import type React from "react";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "../context/cart-context";
import { useSales } from "../context/sales-context";
import { useInventory } from "../context/inventory-context";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutFormProps {
  onSuccess: () => void;
}

export default function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const { dispatch: salesDispatch } = useSales();
  const { dispatch: inventoryDispatch } = useInventory();

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleStripeCheckout = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      console.log("Creating checkout session with data:", {
        items: cartState.items,
        customerInfo,
        successUrl: `${window.location.origin}/checkout/success`,
        cancelUrl: `${window.location.origin}/checkout/cancel`,
      });

      // Create checkout session with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100000); // 10 second timeout

      const response = await fetch("/api/create-payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartState.items,
          customerInfo,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.error || "Failed to create checkout session"
        );
      }

      const { sessionId } = responseData;

      if (!sessionId) {
        throw new Error("No session ID received from server");
      }

      // Show redirecting state
      setIsRedirecting(true);

      // Add timeout for redirect as well
      const redirectTimeout = setTimeout(() => {
        setIsRedirecting(false);
        setPaymentError(
          "Redirect is taking longer than expected. Please try again or use a different payment method."
        );
      }, 15000); // 15 seconds for redirect

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      clearTimeout(redirectTimeout);
      setIsRedirecting(false);

      if (error) {
        throw error;
      }
    } catch (error) {
      setIsRedirecting(false);
      console.error("Stripe checkout error:", error);

      if (error.name === "AbortError") {
        setPaymentError(
          "Request timed out. Please check your connection and try again."
        );
      } else {
        setPaymentError(
          `Failed to redirect to Stripe checkout: ${error.message}`
        );
      }
    }
  };

  const handleCashOnDelivery = async () => {
    // Simulate processing delay for cash on delivery
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create sale record for COD
    const sale = {
      id: `sale_${Date.now()}`,
      date: new Date().toISOString(),
      items: cartState.items,
      total: cartState.total,
      customerInfo,
      paymentMethod: "cod" as const,
      status: "pending" as const,
    };

    // Add sale to sales history
    salesDispatch({ type: "ADD_SALE", payload: sale });

    // Update inventory stock
    cartState.items.forEach((item) => {
      inventoryDispatch({
        type: "UPDATE_STOCK",
        payload: { id: item.id, stock: item.stock - item.quantity },
      });
    });

    // Clear cart
    cartDispatch({ type: "CLEAR_CART" });

    onSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPaymentError(null);

    try {
      if (paymentMethod === "stripe") {
        await handleStripeCheckout();
      } else {
        await handleCashOnDelivery();
      }
    } catch (error) {
      setPaymentError("An unexpected error occurred. Please try again.");
      console.error("Checkout error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartState.items.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <CardTitle className="mb-2">No items in cart</CardTitle>
          <CardDescription>
            Please add items to your cart before checkout.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>
            Please provide your delivery details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Info Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <Label>Payment Method *</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="stripe" id="stripe" />
                  <Label htmlFor="stripe">Credit/Debit Card (Stripe)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod">Cash on Delivery</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Redirecting State */}
            {isRedirecting && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-blue-700">
                    Redirecting to Stripe... This may take a moment.
                  </p>
                </div>
              </div>
            )}

            {/* Payment Method Info */}
            {paymentMethod === "stripe" && !isRedirecting && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  You will be redirected to Stripe's secure checkout page to
                  complete your payment.
                </p>
              </div>
            )}

            {/* Error Display */}
            {paymentError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{paymentError}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isRedirecting}
            >
              {isRedirecting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Redirecting to Stripe...</span>
                </div>
              ) : isSubmitting ? (
                "Processing..."
              ) : paymentMethod === "stripe" ? (
                "Continue to Stripe Checkout"
              ) : (
                "Place Order (Pay on Delivery)"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>Review your order details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cartState.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">
                  ${(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>${cartState.total.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800">
                  {paymentMethod === "stripe"
                    ? "Stripe Checkout"
                    : "Cash on Delivery"}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-blue-700">
                {paymentMethod === "stripe"
                  ? "Secure payment processing via Stripe. You'll be redirected to complete payment."
                  : "Pay when your order is delivered to your address."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
