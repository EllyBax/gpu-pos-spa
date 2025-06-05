"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  Monitor,
  Shield,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GPUCatalog from "./components/gpu-catalog";
import ShoppingCartComponent from "./components/shopping-cart";
import CheckoutForm from "./components/checkout-form";
import SalesDashboard from "./components/sales-dashboard";
import InventoryManagement from "./components/inventory-management";
import { CartProvider } from "./context/cart-context";
import { InventoryProvider } from "./context/inventory-context";
import { SalesProvider } from "./context/sales-context";
import AdminInterface from "./components/admin-interface";
import { useCart } from "./context/cart-context";

// Separate component for the main app content that uses cart context
function MainAppContent() {
  const [activeTab, setActiveTab] = useState("catalog");
  const { state: cartState } = useCart();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
          <TabsTrigger value="catalog" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Catalog</span>
          </TabsTrigger>
          <TabsTrigger
            value="cart"
            className="flex items-center space-x-2 relative"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartState.items.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {cartState.items.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="checkout" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Checkout</span>
          </TabsTrigger>
          <TabsTrigger
            value="dashboard"
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="flex items-center space-x-2"
          >
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <GPUCatalog />
        </TabsContent>

        <TabsContent value="cart">
          <ShoppingCartComponent onCheckout={() => setActiveTab("checkout")} />
        </TabsContent>

        <TabsContent value="checkout">
          <CheckoutForm onSuccess={() => setActiveTab("dashboard")} />
        </TabsContent>

        <TabsContent value="dashboard">
          <SalesDashboard />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryManagement />
        </TabsContent>

        <TabsContent value="admin">
          <AdminInterface />
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default function GPUPOSApp() {
  const [isAnonymousUser, setIsAnonymousUser] = useState(false);

  useEffect(() => {
    // Simulate anonymous sign-in
    const anonymousId =
      localStorage.getItem("anonymousUserId") || `anon_${Date.now()}`;
    localStorage.setItem("anonymousUserId", anonymousId);
    setIsAnonymousUser(true);
  }, []);

  const userId = localStorage.getItem("anonymousUserId");
  if (!isAnonymousUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Monitor className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <CardTitle>GPU Point of Sale</CardTitle>
            <CardDescription>Initializing anonymous session...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <SalesProvider>
      <InventoryProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-8 w-8 text-blue-600" />
                    <h1 className="text-xl font-bold text-gray-900">
                      GPU Store POS
                    </h1>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      User: {userId ?? "Refresh page to generate ID!"}
                    </Badge>
                  </div>
                </div>
              </div>
            </header>

            <MainAppContent />
          </div>
        </CartProvider>
      </InventoryProvider>
    </SalesProvider>
  );
}
