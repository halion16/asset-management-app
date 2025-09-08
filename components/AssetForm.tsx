'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Asset, mockLocations, mockUsers, mockSuppliers, Location } from "@/data/mockData";
import { getLocations } from "@/lib/storage";
import { X, Upload, FileText } from "lucide-react";

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
  const [locations, setLocations] = useState<Location[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<Partial<Asset>>({
    name: '',
    category: 'IT',
    serialNumber: '',
    model: '',
    brand: '',
    status: 'operational',
    priority: 'medium',
    location: locations[0]?.name || '',
    assignedTo: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    value: 0,
    lastMaintenance: '',
    nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +90 days
    workOrders: 0,
    ...asset
  });

  useEffect(() => {
    const currentLocations = getLocations();
    setLocations(currentLocations);
    
    // Set default location if none selected and locations exist
    if (!formData.location && currentLocations.length > 0) {
      setFormData(prev => ({
        ...prev,
        location: currentLocations[0].name
      }));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedLocation = locations.find(loc => loc.name === formData.location);
    
    const newAsset: Asset = {
      id: asset?.id || Date.now().toString(),
      name: formData.name || '',
      category: formData.category || 'IT',
      serialNumber: formData.serialNumber || '',
      model: formData.model || '',
      brand: formData.brand || '',
      status: formData.status || 'operational',
      priority: formData.priority || 'medium',
      location: selectedLocation?.name || formData.location || '',
      assignedTo: formData.assignedTo || '',
      purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
      value: Number(formData.value) || 0,
      lastMaintenance: formData.lastMaintenance,
      nextMaintenance: formData.nextMaintenance,
      workOrders: formData.workOrders || 0
    };

    onSave(newAsset);
  };

  const handleChange = (field: keyof Asset, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Update location info when location changes (simile a asset-location in WorkOrderForm)
      if (field === 'location') {
        const selectedLocation = locations.find(loc => loc.name === value);
        if (selectedLocation) {
          // Potresti aggiungere logica aggiuntiva qui se necessario
        }
      }
      
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{asset ? 'Modifica Attrezzatura' : 'Nuova Attrezzatura'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="es. Condizionatore Franciacorta"
                />
              </div>
              
              <div>
                <Label htmlFor="model">Modello/Descrizione</Label>
                <textarea
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Descrivi il modello e le caratteristiche tecniche..."
                />
              </div>
            </div>

            {/* Category and Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Seleziona categoria...</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="location">Ubicazione</Label>
                <select
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Seleziona ubicazione...</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.name}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status, Priority, Brand */}
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
                  placeholder="es. Ariel spa"
                />
              </div>
            </div>

            {/* Assignment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignedTo">Assegnato a (opzionale)</Label>
                <select
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => handleChange('assignedTo', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Nessun assegnatario - Attrezzatura fissa</option>
                  {mockUsers.map(user => (
                    <option key={user.id} value={user.name}>{user.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="serialNumber">Numero di serie</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange('serialNumber', e.target.value)}
                  placeholder="es. 2ASWYNDYSS3"
                />
              </div>
            </div>

            {/* Value (Optional) */}
            <div>
              <Label htmlFor="value">Valore di acquisto (opzionale)</Label>
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

            {/* Documentation Upload */}
            <div>
              <Label>Documentazione</Label>
              <div 
                className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50/30 hover:bg-blue-50/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  setUploadedFiles(prev => [...prev, ...files]);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-blue-600 font-medium mb-1">Aggiungi o trascina immagini/documenti</p>
                <p className="text-gray-500 text-sm mb-3">PDF, DOC, JPG, PNG fino a 10MB</p>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white border-blue-300 text-blue-600 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('file-upload')?.click();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Allega file
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setUploadedFiles(prev => [...prev, ...files]);
                  }}
                />
              </div>
              
              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">File caricati:</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm flex-1">{file.name}</span>
                      <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dates and Maintenance */}
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
                <Label htmlFor="nextMaintenance">Prossima manutenzione *</Label>
                <Input
                  id="nextMaintenance"
                  type="date"
                  value={formData.nextMaintenance}
                  onChange={(e) => handleChange('nextMaintenance', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Operational fields (only if editing and operational) */}
            {asset && formData.status === 'operational' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                <div>
                  <Label htmlFor="workOrders">Ordini di lavoro completati</Label>
                  <Input
                    id="workOrders"
                    type="number"
                    value={formData.workOrders || ''}
                    onChange={(e) => handleChange('workOrders', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="efficiency">Efficienza operativa</Label>
                  <Input
                    id="efficiency"
                    value="Ottimale"
                    disabled
                    className="bg-white"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 border-t">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {asset ? 'Aggiorna Attrezzatura' : 'Crea Attrezzatura'}
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