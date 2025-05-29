"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Edit, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useInventory } from "../context/inventory-context"
import type { GPU } from "../context/cart-context"

export default function InventoryManagement() {
  const { state: inventoryState, dispatch: inventoryDispatch } = useInventory()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingGPU, setEditingGPU] = useState<GPU | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    model: "",
    memory: "",
    price: "",
    stock: "",
    image: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      manufacturer: "",
      model: "",
      memory: "",
      price: "",
      stock: "",
      image: "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const gpuData: GPU = {
      id: editingGPU?.id || `gpu_${Date.now()}`,
      name: formData.name,
      manufacturer: formData.manufacturer,
      model: formData.model,
      memory: formData.memory,
      price: Number.parseFloat(formData.price),
      stock: Number.parseInt(formData.stock),
      image: formData.image,
    }

    if (editingGPU) {
      inventoryDispatch({ type: "UPDATE_STOCK", payload: { id: gpuData.id, stock: gpuData.stock } })
    } else {
      inventoryDispatch({ type: "ADD_GPU", payload: gpuData })
    }

    resetForm()
    setEditingGPU(null)
    setIsAddDialogOpen(false)
  }

  const handleEdit = (gpu: GPU) => {
    setEditingGPU(gpu)
    setFormData({
      name: gpu.name,
      manufacturer: gpu.manufacturer,
      model: gpu.model,
      memory: gpu.memory,
      price: gpu.price.toString(),
      stock: gpu.stock.toString(),
      image: gpu.image,
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this GPU?")) {
      inventoryDispatch({ type: "REMOVE_GPU", payload: id })
    }
  }

  const updateStock = (id: string, newStock: number) => {
    inventoryDispatch({ type: "UPDATE_STOCK", payload: { id, stock: newStock } })
  }

  const totalValue = inventoryState.gpus.reduce((sum, gpu) => sum + gpu.price * gpu.stock, 0)
  const totalItems = inventoryState.gpus.reduce((sum, gpu) => sum + gpu.stock, 0)
  const lowStockItems = inventoryState.gpus.filter((gpu) => gpu.stock < 10).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current stock value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Units in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items below 10 units</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>GPU Inventory</CardTitle>
              <CardDescription>Manage your GPU stock and pricing</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm()
                    setEditingGPU(null)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add GPU
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingGPU ? "Edit GPU" : "Add New GPU"}</DialogTitle>
                  <DialogDescription>
                    {editingGPU ? "Update GPU information" : "Add a new GPU to your inventory"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">GPU Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="memory">Memory</Label>
                    <Input
                      id="memory"
                      value={formData.memory}
                      onChange={(e) => setFormData((prev) => ({ ...prev, memory: e.target.value }))}
                      placeholder="e.g., 16GB GDDR6X"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                      placeholder="e.g., /GeForce RTX 4090.png"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingGPU ? "Update GPU" : "Add GPU"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Memory</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryState.gpus.map((gpu) => (
                <TableRow key={gpu.id}>
                  <TableCell className="font-medium">{gpu.name}</TableCell>
                  <TableCell>{gpu.manufacturer}</TableCell>
                  <TableCell>{gpu.memory}</TableCell>
                  <TableCell>${gpu.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={gpu.stock}
                      onChange={(e) => updateStock(gpu.id, Number.parseInt(e.target.value) || 0)}
                      className="w-20"
                      min="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={gpu.stock > 10 ? "default" : gpu.stock > 0 ? "secondary" : "destructive"}>
                      {gpu.stock > 10 ? "In Stock" : gpu.stock > 0 ? "Low Stock" : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(gpu)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(gpu.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
