
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "customer";
  createdAt: any;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  featured: boolean;
  createdAt: any;
}

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  address: string;
  paymentMethod: string;
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface PaymentDetails {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}
