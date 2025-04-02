
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  collection,
  query,
  getDocs,
  orderBy,
  doc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FoodItem } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { PlusCircle, Pencil, Trash, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/utils";

const AdminProducts = () => {
  const [products, setProducts] = useState<FoodItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsQuery = query(
          collection(db, "foodItems"),
          orderBy("name")
        );
        const querySnapshot = await getDocs(productsQuery);
        const fetchedProducts: FoodItem[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ 
            id: doc.id, 
            ...doc.data() 
          } as FoodItem);
        });
        
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [toast]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchTerm]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "foodItems", id));
      
      // Update local state
      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      
      toast({
        title: "Product Deleted",
        description: "The product has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete product. Please try again.",
      });
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const productRef = doc(db, "foodItems", id);
      await updateDoc(productRef, {
        featured: !currentFeatured
      });
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === id 
            ? { ...product, featured: !currentFeatured } 
            : product
        )
      );
      
      toast({
        title: "Product Updated",
        description: `Product ${!currentFeatured ? "added to" : "removed from"} featured items.`,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update product status. Please try again.",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Manage Products</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Link to="/admin/products/add">
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-48 bg-gray-200 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-0">
                  <div className="relative h-40 bg-gray-100">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Link to={`/admin/products/edit/${product.id}`}>
                        <Button variant="secondary" size="icon" className="h-7 w-7">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-7 w-7">
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this product
                              from the database.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(product.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      <span className="font-medium text-primary">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">
                        {product.category}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Featured</span>
                        <Switch
                          checked={product.featured}
                          onCheckedChange={() => toggleFeatured(product.id, product.featured)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? "No products found matching your search." : "No products available."}
            </p>
            <Link to="/admin/products/add">
              <Button className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Product
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
