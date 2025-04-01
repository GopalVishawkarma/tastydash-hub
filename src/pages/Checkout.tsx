
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { formatCurrency, generateOrderId, validateCardNumber, validateExpiryDate, validateCVV } from "@/lib/utils";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PaymentDetails } from "@/types";

const Checkout = () => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });
  const [errors, setErrors] = useState<Partial<PaymentDetails>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handlePaymentDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === "cardNumber") {
      const cleanValue = value.replace(/\s+/g, "");
      if (cleanValue.length > 16) return;
      
      // Format with spaces after every 4 digits
      const formatted = cleanValue.replace(/(\d{4})(?=\d)/g, "$1 ");
      setPaymentDetails({ ...paymentDetails, [name]: formatted });
      return;
    }
    
    // Format expiry date as MM/YY
    if (name === "expiryDate") {
      const cleanValue = value.replace(/[^0-9]/g, "");
      if (cleanValue.length > 4) return;
      
      let formatted = cleanValue;
      if (cleanValue.length > 2) {
        formatted = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
      }
      
      setPaymentDetails({ ...paymentDetails, [name]: formatted });
      return;
    }
    
    // Limit CVV to 3 digits
    if (name === "cvv") {
      const cleanValue = value.replace(/[^0-9]/g, "");
      if (cleanValue.length > 3) return;
      
      setPaymentDetails({ ...paymentDetails, [name]: cleanValue });
      return;
    }
    
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };
  
  const validateForm = () => {
    const newErrors: Partial<PaymentDetails> = {};
    
    if (!address.trim()) {
      return false;
    }
    
    if (paymentMethod === "card") {
      if (!paymentDetails.cardholderName.trim()) {
        newErrors.cardholderName = "Cardholder name is required";
      }
      
      if (!validateCardNumber(paymentDetails.cardNumber.replace(/\s+/g, ""))) {
        newErrors.cardNumber = "Please enter a valid 16-digit card number";
      }
      
      if (!validateExpiryDate(paymentDetails.expiryDate)) {
        newErrors.expiryDate = "Please enter a valid expiry date (MM/YY)";
      }
      
      if (!validateCVV(paymentDetails.cvv)) {
        newErrors.cvv = "Please enter a valid 3-digit CVV";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const orderId = generateOrderId();
      const subtotal = getTotalPrice();
      const deliveryFee = 40;
      const tax = subtotal * 0.05;
      const totalAmount = subtotal + deliveryFee + tax;
      
      // Create order in Firestore
      await setDoc(doc(db, "orders", orderId), {
        id: orderId,
        userId: currentUser?.uid,
        userName: currentUser?.displayName,
        items: cart.map(item => ({
          foodId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount,
        status: "pending",
        address,
        paymentMethod,
        paymentDetails: paymentMethod === "card" ? {
          cardNumber: paymentDetails.cardNumber.slice(-4), // Only store last 4 digits
          cardholderName: paymentDetails.cardholderName
        } : null,
        createdAt: serverTimestamp()
      });
      
      // Clear the cart
      clearCart();
      
      // Navigate to success page
      navigate("/order-success", { state: { orderId } });
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }
  
  const subtotal = getTotalPrice();
  const deliveryFee = 40;
  const tax = subtotal * 0.05;
  const total = subtotal + deliveryFee + tax;
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Delivery Address */}
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Address</CardTitle>
                    <CardDescription>
                      Enter the address where you want your food to be delivered.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address">Complete Address</Label>
                        <Textarea
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Enter your full address including apartment/house number, street, landmark, etc."
                          rows={3}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>
                      Choose your preferred payment method.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs 
                      defaultValue="card" 
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="card">Credit Card</TabsTrigger>
                        <TabsTrigger value="cod">Cash on Delivery</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="card" className="mt-4">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                              id="cardNumber"
                              name="cardNumber"
                              value={paymentDetails.cardNumber}
                              onChange={handlePaymentDetailsChange}
                              placeholder="1234 5678 9012 3456"
                              className="mt-1"
                            />
                            {errors.cardNumber && (
                              <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="cardholderName">Cardholder Name</Label>
                            <Input
                              id="cardholderName"
                              name="cardholderName"
                              value={paymentDetails.cardholderName}
                              onChange={handlePaymentDetailsChange}
                              placeholder="John Doe"
                              className="mt-1"
                            />
                            {errors.cardholderName && (
                              <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiryDate">Expiry Date</Label>
                              <Input
                                id="expiryDate"
                                name="expiryDate"
                                value={paymentDetails.expiryDate}
                                onChange={handlePaymentDetailsChange}
                                placeholder="MM/YY"
                                className="mt-1"
                              />
                              {errors.expiryDate && (
                                <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="cvv">CVV</Label>
                              <Input
                                id="cvv"
                                name="cvv"
                                value={paymentDetails.cvv}
                                onChange={handlePaymentDetailsChange}
                                placeholder="123"
                                className="mt-1"
                              />
                              {errors.cvv && (
                                <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start">
                            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                            <p className="text-sm text-yellow-700">
                              This is a demo app. You can enter any fake card details for testing.
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="cod" className="mt-4">
                        <div className="bg-gray-50 rounded-md p-4">
                          <p className="text-gray-700">
                            You will pay for your order when it's delivered to you.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatCurrency(total)}`
                  )}
                </Button>
              </div>
            </form>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between py-2">
                      <span className="flex-grow">
                        {item.name} <span className="text-gray-500">x{item.quantity}</span>
                      </span>
                      <span className="text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t mt-4 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                </div>
                
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
