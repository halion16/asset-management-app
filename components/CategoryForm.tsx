'use client';

import { useState } from "react";
import { Category } from "@/data/mockData";
import { 
  X,
  ArrowLeft,
  AlertTriangle,
  Zap,
  Search,
  Settings,
  Shield,
  Briefcase,
  Thermometer,
  FileText,
  Wrench,
  Package,
  Calendar,
  Clock,
  MapPin,
  Users,
  Mail,
  Phone,
  Globe,
  Home,
  Building,
  Car,
  Plane,
  Truck,
  Activity,
  BarChart,
  PieChart,
  TrendingUp,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Star,
  Heart,
  ThumbsUp,
  Award,
  Target,
  Flag,
  Bell,
  Camera,
  Image,
  Video,
  Music,
  Monitor,
  Smartphone,
  Laptop,
  HardDrive,
  Database,
  Server,
  Wifi,
  Battery,
  Power,
  Lightbulb,
  Sun,
  Cloud,
  Droplets,
  Eye,
  Lock,
  Key,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Share,
  Bookmark,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Expanded icon set per le categorie
const availableIcons = [
  { name: 'AlertTriangle', component: AlertTriangle, category: 'Status' },
  { name: 'Zap', component: Zap, category: 'Energy' },
  { name: 'Search', component: Search, category: 'Actions' },
  { name: 'Settings', component: Settings, category: 'Tools' },
  { name: 'Shield', component: Shield, category: 'Security' },
  { name: 'Briefcase', component: Briefcase, category: 'Business' },
  { name: 'Thermometer', component: Thermometer, category: 'Tools' },
  { name: 'FileText', component: FileText, category: 'Documents' },
  { name: 'Wrench', component: Wrench, category: 'Tools' },
  { name: 'Package', component: Package, category: 'Items' },
  { name: 'Calendar', component: Calendar, category: 'Time' },
  { name: 'Clock', component: Clock, category: 'Time' },
  { name: 'MapPin', component: MapPin, category: 'Location' },
  { name: 'Users', component: Users, category: 'People' },
  { name: 'Mail', component: Mail, category: 'Communication' },
  { name: 'Phone', component: Phone, category: 'Communication' },
  { name: 'Globe', component: Globe, category: 'Network' },
  { name: 'Home', component: Home, category: 'Location' },
  { name: 'Building', component: Building, category: 'Location' },
  { name: 'Car', component: Car, category: 'Transport' },
  { name: 'Plane', component: Plane, category: 'Transport' },
  { name: 'Truck', component: Truck, category: 'Transport' },
  { name: 'Activity', component: Activity, category: 'Status' },
  { name: 'BarChart', component: BarChart, category: 'Analytics' },
  { name: 'PieChart', component: PieChart, category: 'Analytics' },
  { name: 'TrendingUp', component: TrendingUp, category: 'Analytics' },
  { name: 'DollarSign', component: DollarSign, category: 'Finance' },
  { name: 'CreditCard', component: CreditCard, category: 'Finance' },
  { name: 'ShoppingCart', component: ShoppingCart, category: 'Commerce' },
  { name: 'Star', component: Star, category: 'Rating' },
  { name: 'Heart', component: Heart, category: 'Rating' },
  { name: 'ThumbsUp', component: ThumbsUp, category: 'Rating' },
  { name: 'Award', component: Award, category: 'Achievement' },
  { name: 'Target', component: Target, category: 'Goals' },
  { name: 'Flag', component: Flag, category: 'Status' },
  { name: 'Bell', component: Bell, category: 'Notifications' },
  { name: 'Camera', component: Camera, category: 'Media' },
  { name: 'Image', component: Image, category: 'Media' },
  { name: 'Video', component: Video, category: 'Media' },
  { name: 'Music', component: Music, category: 'Media' },
  { name: 'Monitor', component: Monitor, category: 'Technology' },
  { name: 'Smartphone', component: Smartphone, category: 'Technology' },
  { name: 'Laptop', component: Laptop, category: 'Technology' },
  { name: 'HardDrive', component: HardDrive, category: 'Technology' },
  { name: 'Database', component: Database, category: 'Technology' },
  { name: 'Server', component: Server, category: 'Technology' },
  { name: 'Wifi', component: Wifi, category: 'Network' },
  { name: 'Battery', component: Battery, category: 'Energy' },
  { name: 'Power', component: Power, category: 'Energy' },
  { name: 'Lightbulb', component: Lightbulb, category: 'Energy' },
  { name: 'Sun', component: Sun, category: 'Weather' },
  { name: 'Cloud', component: Cloud, category: 'Weather' },
  { name: 'Droplets', component: Droplets, category: 'Weather' },
  { name: 'Eye', component: Eye, category: 'Visibility' },
  { name: 'Lock', component: Lock, category: 'Security' },
  { name: 'Key', component: Key, category: 'Security' },
  { name: 'CheckCircle', component: CheckCircle, category: 'Status' },
  { name: 'XCircle', component: XCircle, category: 'Status' },
  { name: 'AlertCircle', component: AlertCircle, category: 'Status' },
  { name: 'Info', component: Info, category: 'Status' },
  { name: 'Plus', component: Plus, category: 'Actions' },
  { name: 'Edit', component: Edit, category: 'Actions' },
  { name: 'Trash2', component: Trash2, category: 'Actions' },
  { name: 'Download', component: Download, category: 'Actions' },
  { name: 'Upload', component: Upload, category: 'Actions' },
  { name: 'Share', component: Share, category: 'Actions' },
  { name: 'Tag', component: Tag, category: 'Organization' },
  { name: 'Bookmark', component: Bookmark, category: 'Organization' }
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

export default function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
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

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconFilter, setIconFilter] = useState('');
  const [selectedIconCategory, setSelectedIconCategory] = useState('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData: Category = {
      ...formData,
      id: formData.id || Date.now().toString()
    };

    onSave(categoryData);
  };

  const handleIconSelect = (iconName: string) => {
    setFormData(prev => ({ ...prev, icon: iconName }));
    setShowIconPicker(false);
  };

  const handleColorSelect = (color: string, bgColor: string) => {
    setFormData(prev => ({ ...prev, color, bgColor }));
  };

  // Filtra icone per categoria e ricerca
  const filteredIcons = availableIcons.filter(icon => {
    const matchesFilter = iconFilter === '' || icon.name.toLowerCase().includes(iconFilter.toLowerCase());
    const matchesCategory = selectedIconCategory === 'All' || icon.category === selectedIconCategory;
    return matchesFilter && matchesCategory;
  });

  // Ottieni categorie uniche per il filtro
  const iconCategories = ['All', ...Array.from(new Set(availableIcons.map(icon => icon.category)))];

  // Trova l'icona corrente
  const currentIcon = availableIcons.find(icon => icon.name === formData.icon);
  const CurrentIconComponent = currentIcon?.component || AlertTriangle;

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
              {availableIcons.slice(0, 9).map((icon) => {
                const IconComponent = icon.component;
                const isSelected = formData.icon === icon.name;
                
                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => handleIconSelect(icon.name)}
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
                    <IconComponent className="h-5 w-5" />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowIconPicker(true)}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
            >
              Carica un'icona personalizzata →
            </button>
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

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden m-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Seleziona Icona</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIconPicker(false)}
                className="p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Filtri */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Cerca icone..."
                  value={iconFilter}
                  onChange={(e) => setIconFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={selectedIconCategory}
                  onChange={(e) => setSelectedIconCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {iconCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid delle icone */}
            <div className="p-4 overflow-y-auto max-h-96">
              <div className="grid grid-cols-8 gap-2">
                {filteredIcons.map((icon) => {
                  const IconComponent = icon.component;
                  const isSelected = formData.icon === icon.name;
                  
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => handleIconSelect(icon.name)}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100 ${
                        isSelected ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                      }`}
                      title={icon.name}
                    >
                      <IconComponent className="h-5 w-5 text-gray-600" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}