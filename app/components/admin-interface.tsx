"use client"

import { useState } from "react"
import { Shield, CheckCircle, XCircle, Clock, DollarSign, Truck, Eye, Filter, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSales, type Sale } from "../context/sales-context"

export default function AdminInterface() {
  const { state: salesState, dispatch: salesDispatch } = useSales()
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")

  // Enhanced sale type with payment status
  interface EnhancedSale extends Sale {
    paymentStatus?: "pending" | "paid" | "failed"
    deliveryStatus?: "pending" | "shipped" | "delivered" | "cancelled"
  }

  const updateDeliveryStatus = (saleId: string, status: EnhancedSale["deliveryStatus"]) => {
    // Find the sale and update both delivery and main status
    const sale = salesState.sales.find((s) => s.id === saleId)
    if (sale) {
      const newStatus = status === "delivered" ? "delivered" : status === "cancelled" ? "cancelled" : "pending"
      salesDispatch({ type: "UPDATE_SALE_STATUS", payload: { id: saleId, status: newStatus } })
    }
  }

  const updatePaymentStatus = (saleId: string, paymentStatus: EnhancedSale["paymentStatus"]) => {
    // In a real app, this would update a separate payment status field
    // For now, we'll store it in localStorage
    const paymentStatuses = JSON.parse(localStorage.getItem("payment-statuses") || "{}")
    paymentStatuses[saleId] = paymentStatus
    localStorage.setItem("payment-statuses", JSON.stringify(paymentStatuses))
    // Force re-render by updating a dummy state
    setSelectedSale((prev) => (prev ? { ...prev } : null))
  }

  const getPaymentStatus = (saleId: string): EnhancedSale["paymentStatus"] => {
    const paymentStatuses = JSON.parse(localStorage.getItem("payment-statuses") || "{}")
    return paymentStatuses[saleId] || "pending"
  }

  const getDeliveryStatus = (sale: Sale): EnhancedSale["deliveryStatus"] => {
    switch (sale.status) {
      case "delivered":
        return "delivered"
      case "cancelled":
        return "cancelled"
      default:
        return "pending"
    }
  }

  const filteredSales = salesState.sales.filter((sale) => {
    const deliveryStatus = getDeliveryStatus(sale)
    const paymentStatus = getPaymentStatus(sale.id)

    const statusMatch = statusFilter === "all" || deliveryStatus === statusFilter
    const paymentMatch = paymentFilter === "all" || paymentStatus === paymentFilter

    return statusMatch && paymentMatch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "paid":
        return <DollarSign className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Statistics
  const totalOrders = salesState.sales.length
  const pendingOrders = salesState.sales.filter((sale) => sale.status === "pending").length
  const deliveredOrders = salesState.sales.filter((sale) => sale.status === "delivered").length
  const paidOrders = salesState.sales.filter((sale) => getPaymentStatus(sale.id) === "paid").length

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-blue-900">Administrative Interface</CardTitle>
          </div>
          <CardDescription className="text-blue-700">Manage order delivery and payment confirmations</CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveredOrders}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidOrders}</div>
            <p className="text-xs text-muted-foreground">Payment confirmed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Order Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Delivery Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by delivery status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Payment Status</label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Payment Pending</SelectItem>
                  <SelectItem value="paid">Payment Confirmed</SelectItem>
                  <SelectItem value="failed">Payment Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Management */}
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>Manage delivery and payment status for all orders</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders found matching the selected filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Delivery Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => {
                  const deliveryStatus = getDeliveryStatus(sale)
                  const paymentStatus = getPaymentStatus(sale.id)

                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">#{sale.id.slice(-8).toUpperCase()}</TableCell>
                      <TableCell>{sale.customerInfo.name}</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                      <TableCell>${sale.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(deliveryStatus)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(deliveryStatus)}
                            <span className="capitalize">{deliveryStatus}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(paymentStatus)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(paymentStatus)}
                            <span className="capitalize">{paymentStatus}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedSale(sale)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Manage
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Order Management</DialogTitle>
                              <DialogDescription>
                                Order #{sale.id.slice(-8).toUpperCase()} - {sale.customerInfo.name}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedSale && (
                              <Tabs defaultValue="details" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="details">Order Details</TabsTrigger>
                                  <TabsTrigger value="delivery">Delivery Management</TabsTrigger>
                                  <TabsTrigger value="payment">Payment Management</TabsTrigger>
                                </TabsList>

                                <TabsContent value="details" className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="font-semibold mb-3">Customer Information</h4>
                                      <div className="space-y-2 text-sm">
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
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-3">Order Summary</h4>
                                      <div className="space-y-2">
                                        {selectedSale.items.map((item) => (
                                          <div key={item.id} className="flex justify-between text-sm">
                                            <span>
                                              {item.name} × {item.quantity}
                                            </span>
                                            <span>${(item.price * item.quantity).toLocaleString()}</span>
                                          </div>
                                        ))}
                                        <div className="border-t pt-2 mt-2">
                                          <div className="flex justify-between font-bold">
                                            <span>Total</span>
                                            <span>${selectedSale.total.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="delivery" className="space-y-4">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-3">Current Delivery Status</h4>
                                      <Badge className={getStatusColor(getDeliveryStatus(selectedSale))}>
                                        <div className="flex items-center space-x-1">
                                          {getStatusIcon(getDeliveryStatus(selectedSale))}
                                          <span className="capitalize">{getDeliveryStatus(selectedSale)}</span>
                                        </div>
                                      </Badge>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-3">Update Delivery Status</h4>
                                      <div className="flex flex-wrap gap-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => updateDeliveryStatus(selectedSale.id, "pending")}
                                          disabled={getDeliveryStatus(selectedSale) === "pending"}
                                        >
                                          <Clock className="h-4 w-4 mr-1" />
                                          Mark Pending
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => updateDeliveryStatus(selectedSale.id, "shipped")}
                                          disabled={getDeliveryStatus(selectedSale) === "shipped"}
                                        >
                                          <Truck className="h-4 w-4 mr-1" />
                                          Mark Shipped
                                        </Button>
                                        <Button
                                          variant="default"
                                          onClick={() => updateDeliveryStatus(selectedSale.id, "delivered")}
                                          disabled={getDeliveryStatus(selectedSale) === "delivered"}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          Mark Delivered
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => updateDeliveryStatus(selectedSale.id, "cancelled")}
                                          disabled={getDeliveryStatus(selectedSale) === "cancelled"}
                                        >
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Cancel Order
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="payment" className="space-y-4">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-3">Current Payment Status</h4>
                                      <Badge className={getStatusColor(getPaymentStatus(selectedSale.id))}>
                                        <div className="flex items-center space-x-1">
                                          {getStatusIcon(getPaymentStatus(selectedSale.id))}
                                          <span className="capitalize">{getPaymentStatus(selectedSale.id)}</span>
                                        </div>
                                      </Badge>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-3">Update Payment Status</h4>
                                      <div className="flex flex-wrap gap-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => updatePaymentStatus(selectedSale.id, "pending")}
                                          disabled={getPaymentStatus(selectedSale.id) === "pending"}
                                        >
                                          <Clock className="h-4 w-4 mr-1" />
                                          Mark Pending
                                        </Button>
                                        <Button
                                          variant="default"
                                          onClick={() => updatePaymentStatus(selectedSale.id, "paid")}
                                          disabled={getPaymentStatus(selectedSale.id) === "paid"}
                                        >
                                          <DollarSign className="h-4 w-4 mr-1" />
                                          Confirm Payment
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => updatePaymentStatus(selectedSale.id, "failed")}
                                          disabled={getPaymentStatus(selectedSale.id) === "failed"}
                                        >
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Mark Failed
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <h5 className="font-medium text-blue-900 mb-2">Payment Information</h5>
                                      <p className="text-sm text-blue-700">
                                        <strong>Payment Method:</strong> Pay on Delivery
                                      </p>
                                      <p className="text-sm text-blue-700">
                                        <strong>Amount Due:</strong> ${selectedSale.total.toLocaleString()}
                                      </p>
                                      <p className="text-sm text-blue-700 mt-2">
                                        Confirm payment once cash has been collected from the customer upon delivery.
                                      </p>
                                    </div>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
