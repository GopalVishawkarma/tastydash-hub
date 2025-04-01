
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  getCountFromServer
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatCurrency } from "@/lib/utils";
import { Order, OrderStatus } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Users, ShoppingBag, TrendingUp, AlertCircle } from "lucide-react";

// Define chart colors
const COLORS = ["#FF5A5F", "#FFC043", "#40C057", "#339AF0"];
const STATUS_COLORS = {
  pending: "#FFC043",
  confirmed: "#339AF0",
  delivered: "#40C057",
  cancelled: "#FF5A5F"
};

const Dashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<{ name: string; value: number }[]>([]);
  const [revenueData, setRevenueData] = useState<{ name: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get total orders count
        const ordersCountSnapshot = await getCountFromServer(collection(db, "orders"));
        setTotalOrders(ordersCountSnapshot.data().count);
        
        // Get total users count
        const usersCountSnapshot = await getCountFromServer(
          query(collection(db, "users"), where("role", "==", "customer"))
        );
        setTotalUsers(usersCountSnapshot.data().count);
        
        // Get recent orders
        const recentOrdersQuery = query(
          collection(db, "orders"),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
        const recentOrdersData = recentOrdersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
        setRecentOrders(recentOrdersData);
        
        // Calculate total revenue
        const revenue = recentOrdersData.reduce((total, order) => {
          if (order.status !== "cancelled") {
            return total + order.totalAmount;
          }
          return total;
        }, 0);
        setTotalRevenue(revenue);
        
        // Get order status counts
        const statuses: OrderStatus[] = ["pending", "confirmed", "delivered", "cancelled"];
        const statusPromises = statuses.map(async (status) => {
          const statusCountSnapshot = await getCountFromServer(
            query(collection(db, "orders"), where("status", "==", status))
          );
          return {
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: statusCountSnapshot.data().count
          };
        });
        
        const statusResults = await Promise.all(statusPromises);
        setOrderStatusData(statusResults);
        
        // Generate sample revenue data for chart
        // In a real app, this would be aggregated from actual order data
        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const sampleRevenueData = daysOfWeek.map(day => ({
          name: day,
          revenue: Math.floor(Math.random() * 10000) + 5000
        }));
        setRevenueData(sampleRevenueData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-200 animate-pulse h-32 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-gray-500 mt-1">All-time orders</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-gray-500 mt-1">Registered customers</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-gray-500 mt-1">From completed orders</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <AlertCircle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orderStatusData.find(item => item.name === "Pending")?.value || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `₹${value/1000}k`}
                      />
                      <Tooltip 
                        formatter={(value) => [`₹${value}`, "Revenue"]}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Bar dataKey="revenue" fill="#FF5A5F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`}
                            fill={STATUS_COLORS[entry.name.toLowerCase() as OrderStatus] || COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => [value, "Orders"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-3 font-medium text-gray-500">Order ID</th>
                      <th className="pb-3 font-medium text-gray-500">Customer</th>
                      <th className="pb-3 font-medium text-gray-500">Date</th>
                      <th className="pb-3 font-medium text-gray-500">Amount</th>
                      <th className="pb-3 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <tr key={order.id} className="border-t border-gray-100">
                          <td className="py-3">{order.id}</td>
                          <td className="py-3">{order.userName}</td>
                          <td className="py-3">
                            {order.createdAt 
                              ? new Date((order.createdAt as Timestamp).toDate()).toLocaleDateString() 
                              : "N/A"}
                          </td>
                          <td className="py-3">{formatCurrency(order.totalAmount)}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-gray-500">
                          No recent orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </AdminLayout>
  );
};

export default Dashboard;
