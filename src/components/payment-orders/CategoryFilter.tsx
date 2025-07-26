
import { Button } from "@/components/ui/button";
import { Phone, Zap, Fuel } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon?: typeof Phone | typeof Zap | typeof Fuel;
}

interface CategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const categories: Category[] = [
  { id: 'all', name: '全部' },
  { id: 'phone', name: '话费订单', icon: Phone },
  { id: 'utility', name: '电费订单', icon: Zap },
  { id: 'oil', name: '油卡订单', icon: Fuel }
];

const CategoryFilter = ({ selectedCategory, setSelectedCategory }: CategoryFilterProps) => {
  return (
    <div className="px-4 pb-2">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className="whitespace-nowrap"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.icon && <category.icon className="w-4 h-4 mr-1" />}
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
