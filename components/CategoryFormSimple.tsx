'use client';

import { useState } from "react";
import { Category } from "@/data/mockData";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Icone disponibili per le categorie
const availableIcons = [
  'AlertTriangle', 'Zap', 'Search', 'Settings', 'Shield', 'Briefcase', 
  'Thermometer', 'FileText', 'Wrench', 'Package', 'Calendar', 'Clock',
  'MapPin', 'Users', 'Mail', 'Phone', 'Globe', 'Home', 'Building',
  'Car', 'Plane', 'Truck', 'Activity', 'BarChart', 'PieChart',
  'TrendingUp', 'DollarSign', 'CreditCard', 'ShoppingCart', 'Star',
  'Heart', 'ThumbsUp', 'Award', 'Target', 'Flag', 'Bell', 'Camera',
  'Image', 'Video', 'Music', 'Monitor', 'Smartphone', 'Laptop',
  'HardDrive', 'Database', 'Server', 'Wifi', 'Battery', 'Power',
  'Lightbulb', 'Sun', 'Cloud', 'Droplets', 'Eye', 'Lock', 'Key',
  'CheckCircle', 'XCircle', 'AlertCircle', 'Info', 'Plus', 'Edit',
  'Trash2', 'Download', 'Upload', 'Share', 'Tag', 'Bookmark'
];

// Colori predefiniti
const availableColors = [
  { name: 'Rosso', color: '#dc2626', bgColor: '#fef2f2' },
  { name: 'Arancione', color: '#ea580c', bgColor: '#fff7ed' },
  { name: 'Giallo', color: '#eab308', bgColor: '#fefce8' },
  { name: 'Verde', color: '#16a34a', bgColor: '#f0fdf4' },
  { name: 'Verde Smeraldo', color: '#059669', bgColor: '#ecfdf5' },
  { name: 'Azzurro', color: '#0ea5e9', bgColor: '#f0f9ff' },
  { name: 'Blu', color: '#2563eb', bgColor: '#eff6ff' },
  { name: 'Viola', color: '#7c3aed', bgColor: '#f5f3ff' },
  { name: 'Rosa', color: '#db2777', bgColor: '#fdf2f8' },
  { name: 'Grigio', color: '#6b7280', bgColor: '#f9fafb' }
];

interface CategoryFormProps {
  category?: Category;
  onSave: (category: Category) => void;
  onCancel: () => void;
}

export default function CategoryFormSimple({ category, onSave, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    id: category?.id || '',
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || 'AlertTriangle',
    color: category?.color || '#dc2626',
    bgColor: category?.bgColor || '#fef2f2',
    workOrdersCount: category?.workOrdersCount || 0,
    createdBy: category?.createdBy || 'David Luchetta',
    createdDate: category?.createdDate || new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData: Category = {
      ...formData,
      id: formData.id || Date.now().toString()
    };

    onSave(categoryData);
  };

  const handleColorSelect = (color: string, bgColor: string) => {
    setFormData(prev => ({ ...prev, color, bgColor }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">
              {category ? 'Modifica Categoria' : 'Nuova Categoria'}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome Categoria */}
          <div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full text-xl font-semibold border-none outline-none bg-transparent placeholder-gray-400"
              placeholder="Nome categoria"
              required
            />
          </div>

          {/* Selezione Icona */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Icone delle categorie
            </label>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {availableIcons.slice(0, 9).map((iconName) => {
                const isSelected = formData.icon === iconName;
                
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: iconName }))}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'ring-2 ring-blue-500 ring-offset-2' 
                        : 'hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: isSelected ? formData.bgColor : '#f9fafb',
                      color: isSelected ? formData.color : '#6b7280'
                    }}
                  >
                    <span className="text-sm font-bold">{iconName.charAt(0)}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-sm text-gray-500">
              Icona selezionata: {formData.icon}
            </div>
          </div>

          {/* Selezione Colori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Colori
            </label>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((colorOption) => (
                <button
                  key={colorOption.name}
                  type="button"
                  onClick={() => handleColorSelect(colorOption.color, colorOption.bgColor)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === colorOption.color
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: colorOption.color }}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          {/* Descrizione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Aggiungi una descrizione"
            />
          </div>

          {/* Bottoni */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              className="bg-gray-800 hover:bg-gray-900 text-white"
            >
              Aggiorna
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}