
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FoodItem, Category } from "@/types";

// Food Items Collection Operations
export const addFoodItem = async (foodData: Omit<FoodItem, 'id' | 'createdAt'>) => {
  try {
    // Add document to Firestore
    const docRef = await addDoc(collection(db, "foodItems"), {
      ...foodData,
      createdAt: new Date(),
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
