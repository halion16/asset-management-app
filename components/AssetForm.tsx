'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Asset, mockLocations, mockUsers } from "@/data/mockData";
import { X } from "lucide-react";

interface AssetFormProps {
  asset?: Asset;
  onSave: (asset: Asset) => void;
  onCancel: () => void;
}

const categories = [
  'IT', 'HVAC', 'Vehicle', 'Machinery', 'Furniture', 'Tools', 'Safety Equipment', 'Medical Equipment'
];

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

export default function AssetForm({ asset, onSave, onCancel }: AssetFormProps) {
  const [formData, setFormData] = useState<Partial<Asset>>({
    name: '',
    category: 'IT',
    serialNumber: '',
    model: '',
    brand: '',
    status: 'operational',
    priority: 'medium',
    location: mockLocations[0].name,
    assignedTo: mockUsers[0].name,
    purchaseDate: new Date().toISOString().split('T')[0],
    value: 0,
    workOrders: 0,
    ...asset
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAsset: Asset = {
      id: asset?.id || Date.now().toString(),
      name: formData.name || '',
      category: formData.category || 'IT',
      serialNumber: formData.serialNumber || '',
      model: formData.model || '',
      brand: formData.brand || '',
      status: formData.status || 'operational',
      priority: formData.priority || 'medium',
      location: formData.location || mockLocations[0].name,
      assignedTo: formData.assignedTo || mockUsers[0].name,
      purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
      value: Number(formData.value) || 0,
      lastMaintenance: formData.lastMaintenance,
      nextMaintenance: formData.nextMaintenance,
      workOrders: Number(formData.workOrders) || 0
    };

    onSave(newAsset);
  };

  const handleChange = (field: keyof Asset, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{asset ? 'Modifica Asset' : 'Nuovo Asset'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Asset *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="es. Server principale"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  placeholder="es. Dell, Daikin, Toyota"
                />
              </div>
              
              <div>
                <Label htmlFor="model">Modello</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  placeholder="es. PowerEdge R750"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serialNumber">Serial Number *</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange('serialNumber', e.target.value)}
                  required
                  placeholder="es. IT-2024-001"
                />
              </div>
              
              <div>
                <Label htmlFor="value">Valore (€)</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleChange('value', Number(e.target.value))}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Status and Assignment */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Ubicazione</Label>
                <select
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {mockLocations.map(location => (
                    <option key={location.id} value={location.name}>{location.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="assignedTo">Assegnato a</Label>
                <select
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => handleChange('assignedTo', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {mockUsers.map(user => (
                    <option key={user.id} value={user.name}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="purchaseDate">Data acquisto</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleChange('purchaseDate', e.target.value)}
                />
              </div>
              
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
                  value={formData.nextMaintenance || ''}
                  onChange={(e) => handleChange('nextMaintenance', e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 border-t">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {asset ? 'Aggiorna Asset' : 'Crea Asset'}
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