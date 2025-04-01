
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;
  
  useEffect(() => {
    // If user navigates directly to this page without an order ID, redirect them
    if (!orderId) {
      navigate("/");
    }
  }, [orderId, navigate]);
  
  if (!orderId) {
    return null;
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. Your order has been placed successfully and is being processed.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="font-medium">Order ID: {orderId}</p>
          </div>
          
          <p className="text-gray-600 mb-8">
            You will receive an update when your order is confirmed.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/my-orders">
              <Button variant="default" className="w-full sm:w-auto">
                View My Orders
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderSuccess;
