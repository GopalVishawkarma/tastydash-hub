
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  collection,
  query,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  where,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, OrderStatus } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersQuery = query(
          collection(db, "orders"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(ordersQuery);
        const fetchedOrders: Order[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({ 
            id: doc.id, 
            ...doc.data() 
          } as Order);
        });
        
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load orders. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [toast]);

  useEffect(() => {
    let result = orders;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        order => 
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus
      });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus } 
            : order
        )
      );
      
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
          <h1 className="text-2xl font-bold">Manage Orders</h1>
          
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
        
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-24 bg-gray-200 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
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
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
