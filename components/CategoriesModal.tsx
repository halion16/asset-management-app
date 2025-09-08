'use client';

import { useState, useEffect } from 'react';
import { X, Tag, Search, AlertTriangle, Zap, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Category } from '@/data/mockData';
import { getCategories } from '@/lib/storage';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCategories?: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
  title?: string;
}

// Icon mapping for categories
const IconMap: { [key: string]: any } = {
  'AlertTriangle': AlertTriangle,
  'Zap': Zap,
  'Search': Search,
  'Settings': Settings,
  'Shield': Shield,
};

export default function CategoriesModal({ 
  isOpen, 
  onClose, 
  currentCategories = [],
  onCategoriesChange, 
  title = "Modifica categoria:" 
}: CategoriesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentCategories);

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      const allCategories = getCategories();
      setCategories(allCategories);
      setSelectedCategories(currentCategories);
    }
  }, [isOpen, currentCategories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCategoryToggle = (categoryId: string) => {
    console.log('Toggling category:', categoryId);
    setSelectedCategories(prev => {
      const newSelection = prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      console.log('New selection:', newSelection);
      return newSelection;
    });
  };

  const handleApply = () => {
    onCategoriesChange(selectedCategories);
    onClose();
  };

  const getCategoryIcon = (iconName: string) => {
    const Icon = IconMap[iconName] || Tag;
    return Icon;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Ricerca"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto max-h-64 space-y-2">
          {filteredCategories.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            const isSelected = selectedCategories.includes(category.id);
            
            return (
              <div
                key={category.id}
                onClick={(e) => {
                  // Only handle click if it's not on the checkbox
                  if (e.target !== e.currentTarget.querySelector('input')) {
                    handleCategoryToggle(category.id);
                  }
                }}
                className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 border border-gray-200"
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                  style={{ backgroundColor: category.bgColor }}
                >
                  <Icon 
                    className="h-4 w-4" 
                    style={{ color: category.color }}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{category.name}</div>
                  {category.description && (
                    <div className="text-sm text-gray-500">{category.description}</div>
                  )}
                </div>
                <div className="ml-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCategoryToggle(category.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Annulla
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Applica modifiche
          </Button>
        </div>
      </div>
    </div>
  );
}