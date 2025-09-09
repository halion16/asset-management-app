'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Asset, mockUsers } from "@/data/mockData";
import { X, ChevronRight } from "lucide-react";

interface SubAssetFormProps {
  parentAsset: Asset;
  onSave: (subAsset: Asset) => void;
  onCancel: () => void;
}

const categories = [
  'IT', 'HVAC', 'Vehicle', 'Machinery', 'Furniture', 'Tools', 'Safety Equipment', 'Medical Equipment'
];

const subCategories: Record<string, string[]> = {
  'IT': ['CPU', 'RAM', 'Hard Disk', 'Scheda Video', 'Alimentatore', 'Scheda Madre'],
  'HVAC': ['Compressore', 'Evaporatore', 'Condensatore', 'Ventola', 'Filtri', 'Termostato'],
  'Vehicle': ['Motore', 'Trasmissione', 'Freni', 'Pneumatici', 'Batteria', 'Sistema Elettrico'],
  'Machinery': ['Motore', 'Cuscinetti', 'Cinghie', 'Sensori', 'Valvole', 'Pompe'],
  'Furniture': ['Piano', 'Gambe', 'Cassetti', 'Maniglie', 'Serrature', 'Cerniere'],
  'Tools': ['Lame', 'Punte', 'Mandrini', 'Motore', 'Interruttori', 'Cavi'],
  'Safety Equipment': ['Sensori', 'Allarmi', 'Luci', 'Batterie', 'Circuiti', 'Antenne'],
  'Medical Equipment': ['Sonde', 'Display', 'Pompe', 'Valvole', 'Sensori', 'Calibratori']
};

const statuses: Array<Asset['status']> = ['operational', 'maintenance', 'down', 'retired'];
const priorities: Array<Asset['priority']> = ['low', 'medium', 'high', 'critical'];

const statusLabels = {
  operational: "Operativo",
  maintenance: "In manutenzione", 
  down: "Fermo",
  retired: "Dismesso"
};

const priorityLabels = {
  low: "Bassa",
  medium: "Media",
  high: "Alta",
  critical: "Critica"
};

export default function SubAssetForm({ parentAsset, onSave, onCancel }: SubAssetFormProps) {
  const [formData, setFormData] = useState<Partial<Asset>>({
    name: '',
    category: parentAsset.category,
    serialNumber: '',
    model: '',
    brand: parentAsset.brand,
    status: 'operational',
    priority: parentAsset.priority,
    location: parentAsset.location, // Ereditata dal padre
    assignedTo: parentAsset.assignedTo, // Ereditata dal padre
    purchaseDate: parentAsset.purchaseDate, // Ereditata dal padre
    value: 0,
    lastMaintenance: '',
    nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    workOrders: 0,
    // Hierarchical properties
    parentId: parentAsset.id,
    level: parentAsset.level + 1,
    hasChildren: false,
    childrenIds: [],
    hierarchyPath: [...parentAsset.hierarchyPath, parentAsset.name]
  });

  const maxLevel = 2; // Massimo 3 livelli (0, 1, 2)
  const isMaxLevel = parentAsset.level >= maxLevel;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSubAsset: Asset = {
      id: Date.now().toString(),
      name: formData.name || '',
      category: formData.category || parentAsset.category,
      serialNumber: formData.serialNumber || '',
      model: formData.model || '',
      brand: formData.brand || parentAsset.brand,
      status: formData.status || 'operational',
      priority: formData.priority || parentAsset.priority,
      location: formData.location || parentAsset.location,
      assignedTo: formData.assignedTo || parentAsset.assignedTo,
      purchaseDate: formData.purchaseDate || parentAsset.purchaseDate,
      value: Number(formData.value) || 0,
      lastMaintenance: formData.lastMaintenance,
      nextMaintenance: formData.nextMaintenance,
      workOrders: 0,
      // Hierarchical properties
      parentId: parentAsset.id,
      level: parentAsset.level + 1,
      hasChildren: false,
      childrenIds: [],
      hierarchyPath: [...parentAsset.hierarchyPath, parentAsset.name]
    };

    onSave(newSubAsset);
  };

  const handleChange = (field: keyof Asset, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isMaxLevel) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Limite Raggiunto</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Hai raggiunto il livello massimo di profondità per le sotto-attrezzature (3 livelli).
              </p>
              <Button onClick={onCancel}>
                OK
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Crea Sotto-Attrezzatura</CardTitle>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              {parentAsset.hierarchyPath.map((path, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span>{path}</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              ))}
              <span className="font-medium">{parentAsset.name}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-blue-600 font-medium">Nuova sotto-attrezzatura</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Sotto-Attrezzatura *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="es. CPU Principale, Ventola di Raffreddamento"
                />
              </div>
              
              <div>
                <Label htmlFor="model">Modello/Descrizione</Label>
                <textarea
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Descrivi il componente e le sue caratteristiche..."
                />
              </div>
            </div>

            {/* Category and Inherited Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria (ereditata)</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-gray-50 text-sm"
                  disabled
                >
                  <option value={parentAsset.category}>{parentAsset.category}</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="subCategory">Tipo Componente</Label>
                <select
                  id="subCategory"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Seleziona tipo...</option>
                  {subCategories[parentAsset.category]?.map(subCat => (
                    <option key={subCat} value={subCat}>{subCat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Stato</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as Asset['status'])}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{statusLabels[status]}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priorità</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value as Asset['priority'])}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priorityLabels[priority]}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="brand">Produttore</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  placeholder="es. Intel, AMD"
                />
              </div>
            </div>

            {/* Inherited Fields (Read-only) */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>Ubicazione (ereditata)</Label>
                <div className="text-sm text-gray-700 py-2">{parentAsset.location}</div>
              </div>
              
              <div>
                <Label>Assegnato a (ereditato)</Label>
                <div className="text-sm text-gray-700 py-2">{parentAsset.assignedTo || 'Non assegnato'}</div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serialNumber">Numero di serie</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange('serialNumber', e.target.value)}
                  placeholder="es. CPU001234"
                />
              </div>
              
              <div>
                <Label htmlFor="value">Valore stimato</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Maintenance */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lastMaintenance">Ultima manutenzione</Label>
                <Input
                  id="lastMaintenance"
                  type="date"
                  value={formData.lastMaintenance || ''}
                  onChange={(e) => handleChange('lastMaintenance', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="nextMaintenance">Prossima manutenzione</Label>
                <Input
                  id="nextMaintenance"
                  type="date"
                  value={formData.nextMaintenance}
                  onChange={(e) => handleChange('nextMaintenance', e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 border-t">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Crea Sotto-Attrezzatura
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Annulla
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}