'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CategoryFormSimple from "@/components/CategoryFormSimple";
import { getCategories, saveCategory, deleteCategory, initializeStorage } from "@/lib/storage";
import { Category } from "@/data/mockData";
import { 
  Plus,
  Search,
  AlertTriangle,
  Zap,
  Settings,
  Shield,
  Briefcase,
  Thermometer,
  FileText,
  Edit,
  MoreHorizontal,
  Trash2,
  Calendar
} from "lucide-react";

// Icon mapping per le categorie
const iconMap: Record<string, any> = {
  'AlertTriangle': AlertTriangle,
  'Zap': Zap,
  'Search': Search,
  'Settings': Settings,
  'Shield': Shield,
  'Briefcase': Briefcase,
  'Thermometer': Thermometer,
  'FileText': FileText
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  useEffect(() => {
    initializeStorage();
    loadCategories();
  }, []);

  const loadCategories = () => {
    const categoriesData = getCategories();
    setCategories(categoriesData);
    // Seleziona la prima categoria di default
    if (categoriesData.length > 0 && !selectedCategory) {
      setSelectedCategory(categoriesData[0]);
    }
  };

  const filteredCategories = categories.filter(category => 
    searchTerm ? category.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const handleSaveCategory = (category: Category) => {
    saveCategory(category);
    loadCategories();
    setShowForm(false);
    setEditingCategory(undefined);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa categoria?')) {
      deleteCategory(id);
      loadCategories();
      if (selectedCategory?.id === id) {
        setSelectedCategory(categories.length > 1 ? categories[0] : null);
      }
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  // Stats
  const totalWorkOrders = categories.reduce((sum, category) => sum + category.workOrdersCount, 0);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Column - Categories List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Categorie</h1>
              <p className="text-sm text-gray-600">{filteredCategories.length} categorie trovate</p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nuova Categoria
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca categorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{totalWorkOrders}</div>
            <div className="text-xs text-gray-600">Ordini di lavoro totali</div>
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2">
              Ordina per: Nome
            </div>
            {filteredCategories.map((category) => {
              const IconComponent = iconMap[category.icon];
              return (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                    selectedCategory?.id === category.id
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center text-sm"
                      style={{ 
                        backgroundColor: category.bgColor,
                        color: category.color
                      }}
                    >
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                        {category.name}
                      </h3>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>{category.workOrdersCount} ordini di lavoro</div>
                        {category.description && (
                          <div className="truncate">{category.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredCategories.length === 0 && (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Nessuna categoria trovata</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Category Details */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedCategory ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: selectedCategory.bgColor,
                        color: selectedCategory.color
                      }}
                    >
{(() => {
                        const IconComponent = iconMap[selectedCategory.icon];
                        return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
                      })()}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedCategory.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Creato: {selectedCategory.createdDate}
                    </span>
                    <span>
                      {selectedCategory.workOrdersCount} ordini di lavoro
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => handleEditCategory(selectedCategory)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleDeleteCategory(selectedCategory.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Details Section */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Dettagli</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Nome</label>
                      <div className="text-sm text-gray-900">{selectedCategory.name}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Icona</label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ 
                            backgroundColor: selectedCategory.bgColor,
                            color: selectedCategory.color
                          }}
                        >
{(() => {
                            const IconComponent = iconMap[selectedCategory.icon];
                            return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
                          })()}
                        </div>
                        <span className="text-sm text-gray-900">{selectedCategory.icon}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Colore</label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: selectedCategory.color }}
                        />
                        <span className="text-sm text-gray-900 font-mono">{selectedCategory.color}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Ordini di Lavoro</label>
                      <div className="text-sm text-gray-900">{selectedCategory.workOrdersCount}</div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">Descrizione</label>
                      <div className="text-sm text-gray-900">
                        {selectedCategory.description || 'Nessuna descrizione fornita'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Creato da</label>
                      <div className="text-sm text-gray-900">{selectedCategory.createdBy}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Data creazione</label>
                      <div className="text-sm text-gray-900">{selectedCategory.createdDate}</div>
                    </div>
                  </div>
                </div>

                {/* Usage Statistics */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Statistiche d'uso</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ordini di lavoro totali</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {selectedCategory.workOrdersCount}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${totalWorkOrders > 0 ? (selectedCategory.workOrdersCount / totalWorkOrders) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {totalWorkOrders > 0 
                        ? `${Math.round((selectedCategory.workOrdersCount / totalWorkOrders) * 100)}% del totale`
                        : '0% del totale'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Settings className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Seleziona una Categoria</h3>
              <p className="text-gray-500">Scegli una categoria dalla lista per vedere i dettagli</p>
            </div>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryFormSimple
          category={editingCategory}
          onSave={handleSaveCategory}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(undefined);
          }}
        />
      )}
    </div>
  );
}