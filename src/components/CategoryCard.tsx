
import { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}

const CategoryCard = ({ category, isActive, onClick }: CategoryCardProps) => {
  return (
    <div 
      className={`
        rounded-lg overflow-hidden shadow-md cursor-pointer 
        transition-all duration-200 
        ${isActive 
          ? 'ring-2 ring-primary scale-105' 
          : 'hover:shadow-lg hover:scale-105'
        }
      `} 
      onClick={onClick}
    >
      <div className="relative h-20 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center p-4">
        <h3 className="font-medium text-center text-gray-800">{category.name}</h3>
      </div>
    </div>
  );
};

export default CategoryCard;
