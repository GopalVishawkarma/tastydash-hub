
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Order } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, CheckCircle, XCircle, Clock, Truck, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getOrderById } from "@/utils/firebaseUtils";

const UserOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchOrderDetails = async () => {
    if (!id || !currentUser) return;
    
    try {
      setLoading(true);
      const orderData = await getOrderById(id);
      
      // Verify this order belongs to the current user
      if (orderData.userId !== currentUser.uid) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to view this order.",
        });
        setOrder(null);
      } else {
        setOrder(orderData);
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id, currentUser, toast]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrderDetails();
  };

  const getStatusIcon = (status: string) => {
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

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "pending":
        return "Your order has been received and is being processed.";
      case "confirmed":
        return "Your order has been confirmed and is being prepared.";
      case "delivered":
        return "Your order has been delivered successfully.";
      case "cancelled":
        return "Your order has been cancelled.";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
            <p className="text-gray-500 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link to="/my-orders">
              <Button>Back to My Orders</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/my-orders">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to My Orders
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
                        {order.createdAt ? 
                          new Date(order.createdAt.toDate ? order.createdAt.toDate() : order.createdAt).toLocaleString() 
                          : "N/A"}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Delivery Address</h3>
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
                
                <p className="text-sm text-gray-500 mb-4">
                  {getStatusDescription(order.status)}
                </p>
                
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{
                        width:
                          order.status === "pending"
                            ? "25%"
                            : order.status === "confirmed"
                            ? "50%"
                            : order.status === "delivered"
                            ? "100%"
                            : "0%",
                      }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        order.status === "cancelled"
                          ? "bg-red-500"
                          : "bg-primary"
                      }`}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className={order.status === "pending" || order.status === "confirmed" || order.status === "delivered" ? "font-medium text-primary" : ""}>Ordered</span>
                    <span className={order.status === "confirmed" || order.status === "delivered" ? "font-medium text-primary" : ""}>Confirmed</span>
                    <span className={order.status === "delivered" ? "font-medium text-primary" : ""}>Delivered</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/my-orders" className="w-full">
                  <Button variant="outline" className="w-full">
                    Back to All Orders
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserOrderDetails;
