import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FoodItem, Category, Order, OrderStatus } from "@/types";

// Food Items Collection Operations
export const addFoodItem = async (foodData: Omit<FoodItem, 'id' | 'createdAt'>) => {
  try {
    // Add document to Firestore
    const docRef = await addDoc(collection(db, "foodItems"), {
      ...foodData,
      createdAt: serverTimestamp(),
    });

    return { id: docRef.id, ...foodData, createdAt: new Date() };
  } catch (error) {
    console.error("Error adding food item:", error);
    throw error;
  }
};

export const updateFoodItem = async (id: string, foodData: Partial<FoodItem>) => {
  try {
    const foodRef = doc(db, "foodItems", id);
    const foodDoc = await getDoc(foodRef);
    
    if (!foodDoc.exists()) {
      throw new Error("Food item not found");
    }
    
    const currentData = foodDoc.data() as FoodItem;
    
    // Update document in Firestore
    await updateDoc(foodRef, {
      ...foodData
    });
    
    return { id, ...currentData, ...foodData };
  } catch (error) {
    console.error("Error updating food item:", error);
    throw error;
  }
};

export const deleteFoodItem = async (id: string) => {
  try {
    const foodRef = doc(db, "foodItems", id);
    const foodDoc = await getDoc(foodRef);
    
    if (!foodDoc.exists()) {
      throw new Error("Food item not found");
    }
    
    // Delete document from Firestore
    await deleteDoc(foodRef);
    
    return id;
  } catch (error) {
    console.error("Error deleting food item:", error);
    throw error;
  }
};

export const getAllFoodItems = async () => {
  try {
    const foodsQuery = query(collection(db, "foodItems"), orderBy("name"));
    const snapshot = await getDocs(foodsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FoodItem));
  } catch (error) {
    console.error("Error fetching food items:", error);
    throw error;
  }
};

export const getFoodItemsByCategory = async (category: string) => {
  try {
    const foodsQuery = query(
      collection(db, "foodItems"), 
      where("category", "==", category),
      orderBy("name")
    );
    const snapshot = await getDocs(foodsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FoodItem));
  } catch (error) {
    console.error("Error fetching food items by category:", error);
    throw error;
  }
};

export const getFeaturedFoodItems = async () => {
  try {
    console.log("Getting featured food items...");
    const foodsQuery = query(
      collection(db, "foodItems"), 
      where("featured", "==", true)
    );
    const snapshot = await getDocs(foodsQuery);
    
    const featuredItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FoodItem));
    
    console.log("Featured items fetched:", featuredItems);
    return featuredItems;
  } catch (error) {
    console.error("Error fetching featured food items:", error);
    throw error;
  }
};

// Categories Collection Operations
export const addCategory = async (categoryData: Omit<Category, 'id'>) => {
  try {
    // Add document to Firestore
    const docRef = await addDoc(collection(db, "categories"), {
      ...categoryData,
    });

    return { id: docRef.id, ...categoryData };
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

export const updateCategory = async (id: string, categoryData: Partial<Category>) => {
  try {
    const categoryRef = doc(db, "categories", id);
    const categoryDoc = await getDoc(categoryRef);
    
    if (!categoryDoc.exists()) {
      throw new Error("Category not found");
    }
    
    const currentData = categoryDoc.data() as Category;
    
    // Update document in Firestore
    await updateDoc(categoryRef, {
      ...categoryData,
    });
    
    return { id, ...currentData, ...categoryData };
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const categoriesQuery = query(collection(db, "categories"), orderBy("name"));
    const snapshot = await getDocs(categoriesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Category));
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Orders Collection Operations
export const getOrderById = async (orderId: string) => {
  try {
    console.log(`Fetching order with ID: ${orderId}`);
    const orderDoc = await getDoc(doc(db, "orders", orderId));
    
    if (orderDoc.exists()) {
      console.log(`Order found: ${orderId}`, orderDoc.data());
      return { id: orderDoc.id, ...orderDoc.data() } as Order;
    }
    
    console.error(`Order not found: ${orderId}`);
    throw new Error("Order not found");
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

export const getUserOrders = async (userId: string) => {
  try {
    console.log("Fetching orders for user:", userId);
    
    if (!userId) {
      console.error("getUserOrders called with empty userId");
      return [];
    }

    const ordersQuery = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    console.log("Executing query for user orders...");
    
    const snapshot = await getDocs(ordersQuery);
    console.log(`Found ${snapshot.docs.length} orders for user ${userId}`);
    
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt
      } as Order;
    });
    
    console.log("Processed orders:", orders);
    return orders;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw new Error(`Failed to fetch user orders: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  try {
    console.log(`Updating order ${orderId} status to ${status}`);
    const orderRef = doc(db, "orders", orderId);
    
    const orderDoc = await getDoc(orderRef);
    if (!orderDoc.exists()) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    await updateDoc(orderRef, { status });
    console.log(`Successfully updated order ${orderId} status to ${status}`);
    
    return { id: orderId, status };
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
  try {
    console.log("Creating new order:", orderData);
    
    const docRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      createdAt: serverTimestamp(),
    });
    
    console.log("Order created successfully with ID:", docRef.id);
    
    return { id: docRef.id, ...orderData, createdAt: new Date() };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(ordersQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};
