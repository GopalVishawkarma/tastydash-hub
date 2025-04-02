
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Search, RefreshCw, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getUserOrders } from "@/utils/firebaseUtils";
import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const UserOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching orders for user ID:", currentUser.uid);
      const fetchedOrders = await getUserOrders(currentUser.uid);
      console.log("Fetched orders:", fetchedOrders);
      setOrders(fetchedOrders);
      setFilteredOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again later.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders. Please try again later.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(
        order => 
          order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [orders, searchTerm]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getOrderStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold">My Orders</h1>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search orders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
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
                          {order.createdAt ? 
                            new Date(order.createdAt.toDate ? order.createdAt.toDate() : order.createdAt).toLocaleString() 
                            : "N/A"}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <Badge 
                          variant="outline"
                          className={`${getOrderStatusStyle(order.status)}`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Total:</span> {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Items:</span> {order.items.length}
                        </p>
                      </div>
                      
                      <Link to={`/my-orders/${order.id}`} className="mt-3 sm:mt-0">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <ShoppingBag className="h-8 w-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <Link to="/menu">
              <Button>Browse Menu</Button>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UserOrders;
