
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { FoodItem, Category } from "@/types";

// Food Items Collection Operations
export const addFoodItem = async (foodData: Omit<FoodItem, 'id' | 'createdAt'>, imageFile?: File) => {
  try {
    // Upload image if provided
    let imageUrl = "";
    if (imageFile) {
      const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }

    // Add document to Firestore
    const docRef = await addDoc(collection(db, "foodItems"), {
      ...foodData,
      image: imageUrl,
      createdAt: new Date(),
    });

    return { id: docRef.id, ...foodData, image: imageUrl, createdAt: new Date() };
  } catch (error) {
    console.error("Error adding food item:", error);
    throw error;
  }
};

export const updateFoodItem = async (id: string, foodData: Partial<FoodItem>, imageFile?: File) => {
  try {
    const foodRef = doc(db, "foodItems", id);
    const foodDoc = await getDoc(foodRef);
    
    if (!foodDoc.exists()) {
      throw new Error("Food item not found");
    }
    
    const currentData = foodDoc.data() as FoodItem;
    let imageUrl = currentData.image;
    
    // Upload new image if provided
    if (imageFile) {
      // Delete old image if exists
      if (currentData.image) {
        try {
          const oldImageRef = ref(storage, currentData.image);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.log("Old image not found or could not be deleted");
        }
      }
      
      // Upload new image
      const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }
    
    // Update document in Firestore
    await updateDoc(foodRef, {
      ...foodData,
      image: imageUrl,
    });
    
    return { id, ...currentData, ...foodData, image: imageUrl };
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
    
    const foodData = foodDoc.data() as FoodItem;
    
    // Delete image if exists
    if (foodData.image) {
      try {
        const imageRef = ref(storage, foodData.image);
        await deleteObject(imageRef);
      } catch (error) {
        console.log("Image not found or could not be deleted");
      }
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
    const foodsQuery = query(
      collection(db, "foodItems"), 
      where("featured", "==", true),
      orderBy("name")
    );
    const snapshot = await getDocs(foodsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FoodItem));
  } catch (error) {
    console.error("Error fetching featured food items:", error);
    throw error;
  }
};

// Categories Collection Operations
export const addCategory = async (categoryData: Omit<Category, 'id'>, imageFile?: File) => {
  try {
    // Upload image if provided
    let imageUrl = "";
    if (imageFile) {
      const imageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }

    // Add document to Firestore
    const docRef = await addDoc(collection(db, "categories"), {
      ...categoryData,
      image: imageUrl,
    });

    return { id: docRef.id, ...categoryData, image: imageUrl };
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

export const updateCategory = async (id: string, categoryData: Partial<Category>, imageFile?: File) => {
  try {
    const categoryRef = doc(db, "categories", id);
    const categoryDoc = await getDoc(categoryRef);
    
    if (!categoryDoc.exists()) {
      throw new Error("Category not found");
    }
    
    const currentData = categoryDoc.data() as Category;
    let imageUrl = currentData.image;
    
    // Upload new image if provided
    if (imageFile) {
      // Delete old image if exists
      if (currentData.image) {
        try {
          const oldImageRef = ref(storage, currentData.image);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.log("Old image not found or could not be deleted");
        }
      }
      
      // Upload new image
      const imageRef = ref(storage, `categories/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }
    
    // Update document in Firestore
    await updateDoc(categoryRef, {
      ...categoryData,
      image: imageUrl,
    });
    
    return { id, ...currentData, ...categoryData, image: imageUrl };
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
