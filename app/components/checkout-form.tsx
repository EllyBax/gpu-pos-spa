"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useCart } from "../context/cart-context"
import { useSales } from "../context/sales-context"
import { useInventory } from "../context/inventory-context"

interface CheckoutFormProps {
  onSuccess: () => void
}

export default function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const { dispatch: salesDispatch } = useSales()
  const { dispatch: inventoryDispatch } = useInventory()

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create sale record
    const sale = {
      id: `sale_${Date.now()}`,
      date: new Date().toISOString(),
      items: cartState.items,
      total: cartState.total,
      customerInfo,
      status: "pending" as const,
    }

    // Add sale to sales history
    salesDispatch({ type: "ADD_SALE", payload: sale })

    // Update inventory stock
    cartState.items.forEach((item) => {
      inventoryDispatch({
        type: "UPDATE_STOCK",
        payload: { id: item.id, stock: item.stock - item.quantity },
      })
    })

    // Clear cart
    cartDispatch({ type: "CLEAR_CART" })

    setIsSubmitting(false)
    onSuccess()
  }

  if (cartState.items.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <CardTitle className="mb-2">No items in cart</CardTitle>
          <CardDescription>Please add items to your cart before checkout.</CardDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Please provide your delivery details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Place Order (Pay on Delivery)"}
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
                <p className="font-medium">${(item.price * item.quantity).toLocaleString()}</p>
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
                <Badge className="bg-blue-100 text-blue-800">Payment Method</Badge>
              </div>
              <p className="mt-2 text-sm text-blue-700">
                Pay on Delivery - You will pay when your order is delivered to your address.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
