"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, ShoppingCart, Home } from "lucide-react";

export default function CheckoutCancelPage() {
  const router = useRouter();

  const handleBackToCart = () => {
    router.push("/cart");
  };

  const handleContinueShopping = () => {
    router.push("/");
  };

  const handleTryAgain = () => {
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Cancel Icon */}
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-orange-600" />
            </div>

            {/* Title and Description */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Payment Cancelled
              </h1>
              <p className="text-gray-600">
                Your payment was cancelled. No charges were made to your
                account.
              </p>
            </div>

            {/* What happened */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 w-full">
              <h3 className="font-medium text-orange-800 mb-2">
                What happened?
              </h3>
              <p className="text-sm text-orange-700">
                You cancelled the payment process or closed the payment window.
                Your items are still in your cart if you'd like to try again.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col w-full space-y-3">
              <Button onClick={handleTryAgain} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Payment Again
              </Button>

              <Button
                onClick={handleBackToCart}
                variant="outline"
                className="w-full"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Back to Cart
              </Button>

              <Button
                onClick={handleContinueShopping}
                variant="ghost"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center">
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
        </CardContent>
      </Card>
    </div>
  );
}
