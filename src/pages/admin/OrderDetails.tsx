
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, OrderStatus } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, CheckCircle, XCircle, Clock, Truck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      
      try {
        const orderDoc = await getDoc(doc(db, "orders", id));
        
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() } as Order);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Order not found.",
          });
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load order details. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id, toast]);

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    if (!id || !order) return;
    
    try {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, {
        status: newStatus
      });
      
      // Update local state
      setOrder({ ...order, status: newStatus });
      
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

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "delivered":
        return <Truck className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-4">The order you're looking for doesn't exist.</p>
          <Link to="/admin/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/orders">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Orders
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
                      <p>
                        {order.createdAt instanceof Timestamp
                          ? new Date(order.createdAt.toDate()).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                      <p>{order.userName}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Address</h3>
                      <p>{order.address}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                      <p>{order.paymentMethod}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Order Items</h3>
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {order.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                {formatCurrency(item.price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {formatCurrency(item.price * item.quantity)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={3}>
                              Total
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                              {formatCurrency(order.totalAmount)}
                            </th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  {getStatusIcon(order.status)}
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
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Update Status
                  </label>
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatus(value as OrderStatus)}
                    disabled={order.status === "delivered" || order.status === "cancelled"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  {order.status !== "delivered" && order.status !== "cancelled" && (
                    <>
                      {order.status === "pending" && (
                        <Button 
                          className="w-full" 
                          onClick={() => updateOrderStatus("confirmed")}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Confirm Order
                        </Button>
                      )}
                      
                      {order.status === "confirmed" && (
                        <Button 
                          className="w-full"
                          onClick={() => updateOrderStatus("delivered")}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Mark as Delivered
                        </Button>
                      )}
                      
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => updateOrderStatus("cancelled")}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Order
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/admin/orders" className="w-full">
                  <Button variant="outline" className="w-full">
                    Back to All Orders
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetails;
