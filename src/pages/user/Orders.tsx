
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Search, RefreshCw, AlertCircle, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getUserOrders } from "@/utils/firebaseUtils";
import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";

const UserOrders = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // Use React Query to fetch and cache orders
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['userOrders', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) {
        return [];
      }
      console.log('Fetching orders with React Query for user:', currentUser.uid);
      return getUserOrders(currentUser.uid);
    },
    enabled: !!currentUser?.uid,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Filter orders based on search term
  const filteredOrders = searchTerm.trim() === "" 
    ? orders 
    : orders.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing orders",
      description: "Fetching your latest orders...",
    });
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
          <h1 className="text-2xl font-bold flex items-center">
            <Flame className="h-6 w-6 mr-2 text-primary" />
            My Orders
          </h1>
          
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
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
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
          <div className="text-center py-12 bg-white/80 rounded-lg shadow-sm backdrop-blur-sm">
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
