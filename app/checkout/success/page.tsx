"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Package,
  Mail,
  ArrowRight,
  Download,
  Home,
} from "lucide-react";

interface OrderDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get session_id from URL parameters
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!sessionId) {
        // No session ID - probably came from COD or direct navigation
        setOrderDetails({
          id: `order_${Date.now()}`,
          amount: 0,
          currency: "usd",
          status: "paid",
          customerEmail: "customer@example.com",
          items: [],
        });
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching order details for session:", sessionId);

        const response = await fetch(
          `/api/checkout/session?session_id=${sessionId}`
        );
        const responseData = await response.json();

        console.log("API response:", responseData);

        if (response.ok) {
          setOrderDetails(responseData);
        } else {
          console.error("API error:", responseData.error);
          // Still show success page with generic data
          setOrderDetails({
            id: sessionId,
            amount: 0,
            currency: "usd",
            status: "paid",
            customerEmail: "customer@example.com",
            items: [],
          });
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        // Still show success page even if we can't fetch details
        setOrderDetails({
          id: sessionId || `order_${Date.now()}`,
          amount: 0,
          currency: "usd",
          status: "paid",
          customerEmail: "customer@example.com",
          items: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId]);

  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const handleContinueShopping = () => {
    router.push("/");
  };

  const handleViewOrders = () => {
    router.push("/orders");
  };

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    const receiptData = {
      orderId: orderDetails?.id,
      date: new Date().toISOString(),
      amount: orderDetails?.amount,
      currency: orderDetails?.currency,
      items: orderDetails?.items,
    };

    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${orderDetails?.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Processing your order...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">✕</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Something went wrong
              </h2>
              <p className="text-gray-600">{error}</p>
              <Button onClick={handleContinueShopping} className="mt-4">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Successful!
                </h1>
                <p className="text-gray-600">
                  Thank you for your order. Your payment has been processed
                  successfully.
                </p>
              </div>

              {orderDetails && (
                <div className="bg-gray-50 rounded-lg p-4 w-full">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Order ID:</span>
                    <Badge variant="outline" className="font-mono">
                      {orderDetails.id}
                    </Badge>
                  </div>
                  {orderDetails.amount > 0 && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-600">
                        Amount Paid:
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(
                          orderDetails.amount,
                          orderDetails.currency
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        {orderDetails &&
          orderDetails.items &&
          orderDetails.items.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Details
                </CardTitle>
                <CardDescription>Items in your order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderDetails.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.price * item.quantity * 100)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* What's Next */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Confirmation Email</p>
                  <p className="text-sm text-gray-600">
                    We've sent a confirmation email to{" "}
                    {orderDetails?.customerEmail || "your email address"}
                    with your order details and receipt.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Package className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-sm text-gray-600">
                    Your order is being prepared and will be shipped within 2-3
                    business days. You'll receive tracking information once it's
                    shipped.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleDownloadReceipt}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>

          <Button onClick={handleContinueShopping} className="flex-1">
            Continue Shopping
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@yourstore.com"
              className="text-blue-600 hover:underline"
            >
              support@yourstore.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
