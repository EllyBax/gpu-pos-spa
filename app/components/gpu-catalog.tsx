"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "../context/cart-context"
import { useInventory } from "../context/inventory-context"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function GPUCatalog() {
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const { state: inventoryState } = useInventory()
  const [searchTerm, setSearchTerm] = useState("")
  const [manufacturerFilter, setManufacturerFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  const filteredGPUs = inventoryState.gpus
    .filter(
      (gpu) =>
        gpu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gpu.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gpu.model.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((gpu) => manufacturerFilter === "all" || gpu.manufacturer === manufacturerFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "stock":
          return b.stock - a.stock
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const manufacturers = Array.from(new Set(inventoryState.gpus.map((gpu) => gpu.manufacturer)))

  const { toast } = useToast()

  const addToCart = (gpu: any) => {
    cartDispatch({ type: "ADD_ITEM", payload: gpu })
    toast({
      title: "Added to cart",
      description: `${gpu.name} has been added to your cart.`,
      duration: 2000,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search GPUs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by manufacturer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Manufacturers</SelectItem>
            {manufacturers.map((manufacturer) => (
              <SelectItem key={manufacturer} value={manufacturer}>
                {manufacturer}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="stock">Stock Level</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGPUs.map((gpu) => (
          <Card key={gpu.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <Image src={gpu.image} alt={gpu.name} fill className="object-cover" />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{gpu.name}</CardTitle>
                  <CardDescription>
                    {gpu.manufacturer} • {gpu.memory}
                  </CardDescription>
                </div>
                <Badge variant={gpu.stock > 10 ? "default" : gpu.stock > 0 ? "secondary" : "destructive"}>
                  {gpu.stock > 0 ? `${gpu.stock} in stock` : "Out of stock"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">${gpu.price.toLocaleString()}</span>
                <Button
                  onClick={() => addToCart(gpu)}
                  disabled={gpu.stock === 0}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add to Cart</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGPUs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No GPUs found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
