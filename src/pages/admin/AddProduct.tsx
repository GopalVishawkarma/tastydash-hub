
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChevronLeft, ImagePlus, Loader2 } from "lucide-react";

// Validation schema for the form
const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  featured: z.boolean().default(false),
  image: z.string().url("Please enter a valid image URL").or(z.string().length(0)),
});

type FormValues = z.infer<typeof formSchema>;

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      featured: false,
      image: "",
    },
  });
  
  const handleImageUrlChange = (url: string) => {
    setImagePreview(url || null);
  };
  
  const onSubmit = async (data: FormValues) => {
    setUploading(true);
    
    try {
      // Add document to Firestore
      await addDoc(collection(db, "foodItems"), {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        featured: data.featured,
        image: data.image,
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Product Added",
        description: "The product has been successfully added.",
      });
      
      navigate("/admin/products");
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add product. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/admin/products")}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Products
          </Button>
          <h1 className="text-2xl font-bold">Add New Product</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Pizza, Burger, Dessert" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Featured Product</FormLabel>
                          <p className="text-sm text-gray-500">
                            Display this product on the home page
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the product..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Image URL</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Input
                            placeholder="Enter image URL"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleImageUrlChange(e.target.value);
                            }}
                          />
                          
                          <div className="flex justify-center">
                            {imagePreview ? (
                              <div className="relative h-40 w-40 border rounded-md overflow-hidden">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="h-full w-full object-cover"
                                  onError={() => setImagePreview(null)}
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-40 w-40 border rounded-md text-gray-400">
                                <ImagePlus className="h-10 w-10 mb-2" />
                                <span className="text-xs text-center">
                                  Image preview will appear here
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/products")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Product
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAddProduct;
