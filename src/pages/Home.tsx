
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import FoodCard from "@/components/FoodCard";
import { Button } from "@/components/ui/button";
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FoodItem } from "@/types";
import { ArrowRight } from "lucide-react";

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState<FoodItem[]>([]);
  const [popularItems, setPopularItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        // Fetch featured items
        const featuredQuery = query(
          collection(db, "foods"),
          where("featured", "==", true),
          limit(4)
        );
        const featuredSnapshot = await getDocs(featuredQuery);
        const featuredData = featuredSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FoodItem));
        setFeaturedItems(featuredData);
        
        // Fetch popular items
        const popularQuery = query(
          collection(db, "foods"),
          orderBy("createdAt", "desc"),
          limit(8)
        );
        const popularSnapshot = await getDocs(popularQuery);
        const popularData = popularSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FoodItem));
        setPopularItems(popularData);
      } catch (error) {
        console.error("Error fetching food items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFoodItems();
  }, []);
  
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Delicious Food, Delivered to Your Doorstep
            </h1>
            <p className="text-lg mb-8 text-gray-700">
              Order your favorite meals online and enjoy the convenience of home delivery. 
              Quality ingredients, tasty dishes, and prompt service.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/menu">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Menu
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Items Section */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Dishes</h2>
            <Link to="/menu" className="text-primary hover:underline flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="food-container">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="food-card animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3 w-full"></div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-8 bg-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredItems.length > 0 ? (
            <div className="food-container">
              {featuredItems.map((item) => (
                <FoodCard key={item.id} food={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No featured items available yet.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-12 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                <div className="bg-primary text-white text-xl font-bold h-12 w-12 rounded-full flex items-center justify-center">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Select Your Food</h3>
              <p className="text-gray-600">
                Browse our menu and select your favorite dishes.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-secondary/10 rounded-full p-4 mb-4">
                <div className="bg-secondary text-secondary-foreground text-xl font-bold h-12 w-12 rounded-full flex items-center justify-center">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Place Your Order</h3>
              <p className="text-gray-600">
                Add items to your cart and complete the checkout process.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-accent/10 rounded-full p-4 mb-4">
                <div className="bg-accent text-accent-foreground text-xl font-bold h-12 w-12 rounded-full flex items-center justify-center">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy Your Meal</h3>
              <p className="text-gray-600">
                Receive your delivery and enjoy your delicious meal.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Items Section */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Popular Dishes</h2>
            <Link to="/menu" className="text-primary hover:underline flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="food-container">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="food-card animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3 w-full"></div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-8 bg-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : popularItems.length > 0 ? (
            <div className="food-container">
              {popularItems.map((item) => (
                <FoodCard key={item.id} food={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No items available yet.</p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
