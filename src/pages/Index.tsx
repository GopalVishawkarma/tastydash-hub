
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, ArrowRight } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { FoodItem } from "@/types";
import { getFeaturedFoodItems } from "@/utils/firebaseUtils";
import FoodCard from "@/components/FoodCard";

const Index = () => {
  const [featuredItems, setFeaturedItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const items = await getFeaturedFoodItems();
        setFeaturedItems(items.slice(0, 4)); // Get just the first 4 featured items
      } catch (error) {
        console.error("Error fetching featured items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="py-16 md:py-24 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to TastyDash</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Delicious food delivered to your doorstep. Order now and enjoy the best cuisine right at home!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/menu">
              <Button size="lg" className="w-full sm:w-auto">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Browse Menu
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <User className="mr-2 h-5 w-5" />
                Create Account
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Featured Items Section */}
        {(loading || featuredItems.length > 0) && (
          <div className="py-12 bg-gray-50 rounded-lg px-6 mb-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Featured Items</h2>
              <Link to="/menu" className="text-primary flex items-center hover:underline">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-3"></div>
                      <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {featuredItems.map((item) => (
                  <FoodCard key={item.id} food={item} />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* How It Works Section */}
        <div className="py-12 mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse Menu</h3>
              <p className="text-gray-600">Explore our extensive menu with various categories and dishes.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Add to Cart</h3>
              <p className="text-gray-600">Select your favorite items and add them to your cart.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy Your Food</h3>
              <p className="text-gray-600">Complete your order and enjoy delicious food at your doorstep.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
