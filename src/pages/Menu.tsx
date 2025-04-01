
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import FoodCard from "@/components/FoodCard";
import CategoryCard from "@/components/CategoryCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FoodItem, Category } from "@/types";
import { Search } from "lucide-react";

const Menu = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesQuery = query(
          collection(db, "categories"),
          orderBy("name")
        );
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Category));
        setCategories([{ id: "all", name: "All Items" }, ...categoriesData]);
        
        // Fetch food items
        const foodsQuery = query(
          collection(db, "foods"),
          orderBy("name")
        );
        const foodsSnapshot = await getDocs(foodsQuery);
        const foodsData = foodsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FoodItem));
        setFoods(foodsData);
        setFilteredFoods(foodsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Apply filters when selectedCategory or searchQuery change
  useEffect(() => {
    let result = foods;
    
    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(food => food.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(food => 
        food.name.toLowerCase().includes(query) ||
        food.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredFoods(result);
  }, [selectedCategory, searchQuery, foods]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The useEffect will handle the filtering
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Our Menu</h1>
        
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </form>
        </div>
        
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-20 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isActive={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Food Items */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {selectedCategory === "all" ? "All Items" : 
             categories.find(cat => cat.id === selectedCategory)?.name || "Menu Items"}
          </h2>
          
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
          ) : filteredFoods.length > 0 ? (
            <div className="food-container">
              {filteredFoods.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No items found matching your criteria.</p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="mt-4"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Menu;
