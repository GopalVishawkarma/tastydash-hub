
import { useState } from "react";
import { FoodItem } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FoodCardProps {
  food: FoodItem;
}

const FoodCard = ({ food }: FoodCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddToCart = () => {
    setIsLoading(true);
    setTimeout(() => {
      addToCart({
        id: food.id,
        name: food.name,
        price: food.price,
        image: food.image,
      });
      setIsLoading(false);
    }, 300);
  };
  
  return (
    <div className="food-card group">
      {food.featured && (
        <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-semibold z-10">
          Featured
        </div>
      )}
      
      <div className="relative h-48 overflow-hidden">
        <img 
          src={food.image} 
          alt={food.name} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg">{food.name}</h3>
        <p className="text-gray-600 text-sm mt-1 h-10 overflow-hidden">
          {food.description}
        </p>
        
        <div className="mt-3 flex items-center justify-between">
          <p className="font-bold text-lg text-primary">
            {formatCurrency(food.price)}
          </p>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddToCart}
            disabled={isLoading}
            className="hover:bg-primary hover:text-white"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
            ) : (
              <Plus className="h-4 w-4 mr-1" />
            )}
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
