"use client"

import { useState } from "react"
import { Calendar, DollarSign, Package, TrendingUp, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSales, type Sale } from "../context/sales-context"

export default function SalesDashboard() {
  const { state: salesState, dispatch: salesDispatch } = useSales()
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const totalRevenue = salesState.sales.reduce((sum, sale) => sum + sale.total, 0)
  const totalOrders = salesState.sales.length
  const totalItems = salesState.sales.reduce(
    (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  )

  const recentSales = salesState.sales
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  const updateSaleStatus = (saleId: string, status: Sale["status"]) => {
    salesDispatch({ type: "UPDATE_SALE_STATUS", payload: { id: saleId, status } })
  }

  const getStatusColor = (status: Sale["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Completed transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Total GPUs sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Latest transactions and order status</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No sales recorded yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.id.slice(-8).toUpperCase()}</TableCell>
                    <TableCell>{sale.customerInfo.name}</TableCell>
                    <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                    <TableCell>{sale.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                    <TableCell>${sale.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(sale.status)}>{sale.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedSale(sale)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Order Details</DialogTitle>
                              <DialogDescription>Order #{sale.id.slice(-8).toUpperCase()}</DialogDescription>
                            </DialogHeader>
                            {selectedSale && (
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Customer Information</h4>
                                  <p>
                                    <strong>Name:</strong> {selectedSale.customerInfo.name}
                                  </p>
                                  <p>
                                    <strong>Email:</strong> {selectedSale.customerInfo.email}
                                  </p>
                                  <p>
                                    <strong>Phone:</strong> {selectedSale.customerInfo.phone}
                                  </p>
                                  <p>
                                    <strong>Address:</strong> {selectedSale.customerInfo.address}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Order Items</h4>
                                  <div className="space-y-2">
                                    {selectedSale.items.map((item) => (
                                      <div key={item.id} className="flex justify-between">
                                        <span>
                                          {item.name} × {item.quantity}
                                        </span>
                                        <span>${(item.price * item.quantity).toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-bold">
                                      <span>Total</span>
                                      <span>${selectedSale.total.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => updateSaleStatus(selectedSale.id, "delivered")}
                                    disabled={selectedSale.status === "delivered"}
                                  >
                                    Mark Delivered
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => updateSaleStatus(selectedSale.id, "cancelled")}
                                    disabled={selectedSale.status === "cancelled"}
                                  >
                                    Cancel Order
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
