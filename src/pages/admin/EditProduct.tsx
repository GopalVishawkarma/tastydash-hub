import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChevronLeft, ImagePlus, Loader2 } from "lucide-react";
import { FoodItem } from "@/types";

// Validation schema for the form
const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  featured: z.boolean().default(false),
  image: z.instanceof(FileList).refine(
    (files) => files.length === 0 || (files.length === 1 && files[0].type.startsWith("image/")),
    "Please upload a valid image file"
  ).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AdminEditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      featured: false,
    },
  });
  
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      
      try {
        const productDoc = await getDoc(doc(db, "foodItems", id));
        
        if (productDoc.exists()) {
          const productData = productDoc.data() as FoodItem;
          form.reset({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category: productData.category,
            featured: productData.featured,
          });
          
          if (productData.image) {
            setExistingImageUrl(productData.image);
            setImagePreview(productData.image);
          }
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Product not found.",
          });
          navigate("/admin/products");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product details. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id, navigate, toast, form]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (existingImageUrl) {
      // If no new file is selected, keep showing the existing image
      setImagePreview(existingImageUrl);
    } else {
      setImagePreview(null);
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!id) return;
    
    setUploading(true);
    
    try {
      let imageUrl = existingImageUrl;
      
      // Upload new image if provided
      if (data.image && data.image.length > 0) {
        const file = data.image[0];
        const imageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, file);
        imageUrl = await getDownloadURL(imageRef);
      }
      
      // Update document in Firestore
      await updateDoc(doc(db, "foodItems", id), {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        featured: data.featured,
        image: imageUrl,
      });
      
      toast({
        title: "Product Updated",
        description: "The product has been successfully updated.",
      });
      
      navigate("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </AdminLayout>
    );
  }
  
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
          <h1 className="text-2xl font-bold">Edit Product</h1>
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
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Product Image</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                onChange(e.target.files);
                                handleImageChange(e);
                              }}
                              {...fieldProps}
                            />
                          </div>
                          
                          <div className="flex justify-center">
                            {imagePreview ? (
                              <div className="relative h-40 w-40 border rounded-md overflow-hidden">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-40 w-40 border rounded-md text-gray-400">
                                <ImagePlus className="h-10 w-10 mb-2" />
                                <span className="text-xs text-center">
                                  Upload an image
                                </span>
                              </div>
                            )}
                          </div>
                          {existingImageUrl && (
                            <p className="text-xs text-gray-500 text-center">
                              Leave empty to keep the existing image
                            </p>
                          )}
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
                  Update Product
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminEditProduct;
