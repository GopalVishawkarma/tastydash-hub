
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useCart, CartItem } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Trash2, Plus, Minus, AlertTriangle } from "lucide-react";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    updateQuantity(id, quantity);
  };
  
  const handleRemoveItem = (item: CartItem) => {
    removeFromCart(item.id);
  };
  
  const handleCheckout = () => {
    if (!currentUser) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
    } else {
      navigate("/checkout");
    }
  };
  
  if (cart.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/menu">
              <Button>Browse Menu</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Order Items</h2>
                  <Button 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => clearCart()}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear cart
                  </Button>
                </div>
                
                <div className="divide-y">
                  {cart.map((item) => (
                    <div key={item.id} className="py-4 flex flex-col sm:flex-row items-center sm:items-start">
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden mb-3 sm:mb-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-grow sm:ml-4 text-center sm:text-left">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-primary font-semibold mt-1">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      
                      <div className="flex items-center mt-3 sm:mt-0">
                        <div className="flex items-center border rounded">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-10 text-center">{item.quantity}</span>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 ml-2"
                          onClick={() => handleRemoveItem(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(getTotalPrice())}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>{formatCurrency(40)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes</span>
                  <span>{formatCurrency(getTotalPrice() * 0.05)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(getTotalPrice() + 40 + getTotalPrice() * 0.05)}</span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-6" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              
              <div className="mt-4">
                <Link to="/menu">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;
