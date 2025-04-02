
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { doc, updateDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, OrderStatus } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { Search, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getAllOrders } from "@/utils/firebaseUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const { toast } = useToast();

  // Use React Query to fetch and cache orders
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: getAllOrders,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Apply filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm.trim() === "" || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.userName && order.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // First verify the order exists
      const orderRef = doc(db, "orders", orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        toast({
          variant: "destructive",
          title: "Order Not Found",
          description: `Could not find order with ID ${orderId}`,
        });
        return;
      }
      
      // Update the status
      await updateDoc(orderRef, {
        status: newStatus
      });
      
      // Refresh the data
      refetch();
      
      toast({
        title: "Order Updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update order status. Please try again.",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center">
            <Flame className="h-6 w-6 mr-2 text-primary" />
            Manage Orders
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search orders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error 
                ? error.message 
                : "Failed to load orders. Please try again later."}
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-24 bg-gray-200 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between mb-4">
                      <div>
                        <h3 className="font-medium">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {order.createdAt instanceof Timestamp
                            ? new Date(order.createdAt.toDate()).toLocaleString()
                            : order.createdAt
                              ? new Date(order.createdAt).toLocaleString()
                              : "N/A"}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Customer:</span> {order.userName}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Total:</span> {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Items:</span> {order.items.length}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                        {order.status !== "delivered" && order.status !== "cancelled" && (
                          <>
                            {order.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, "confirmed")}
                              >
                                Confirm
                              </Button>
                            )}
                            {order.status === "confirmed" && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, "delivered")}
                              >
                                Mark Delivered
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateOrderStatus(order.id, "cancelled")}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        <Link to={`/admin/orders/${order.id}`}>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/80 rounded-lg shadow-sm backdrop-blur-sm">
            <p className="text-gray-500">No orders found.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
