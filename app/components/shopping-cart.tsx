"use client"

import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "../context/cart-context"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface ShoppingCartProps {
  onCheckout: () => void
}

export default function ShoppingCartComponent({ onCheckout }: ShoppingCartProps) {
  const { state, dispatch } = useCart()
  const { toast } = useToast()

  const updateQuantity = (id: string, quantity: number) => {
    const item = state.items.find((i) => i.id === id)
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })

    if (item) {
      toast({
        title: "Cart updated",
        description: `${item.name} quantity updated to ${quantity}.`,
        duration: 1500,
      })
    }
  }

  const removeItem = (id: string) => {
    const item = state.items.find((i) => i.id === id)
    dispatch({ type: "REMOVE_ITEM", payload: id })

    if (item) {
      toast({
        title: "Item removed",
        description: `${item.name} has been removed from your cart.`,
        duration: 2000,
      })
    }
  }

  if (state.items.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <CardTitle className="mb-2">Your cart is empty</CardTitle>
          <CardDescription>Add some GPUs to your cart to get started.</CardDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {state.items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-32 h-24 relative">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-600">
                    {item.manufacturer} • {item.memory}
                  </p>
                  <p className="text-xl font-bold mt-2">${item.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Badge variant="secondary" className="px-3 py-1">
                      {item.quantity}
                    </Badge>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="flex items-center space-x-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {state.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${state.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <Button onClick={onCheckout} className="w-full mt-6" size="lg">
            Proceed to Checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
