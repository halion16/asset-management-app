'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WorkOrder, mockAssets, mockUsers, mockSuppliers } from "@/data/mockData";
import { X } from "lucide-react";

interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  onSave: (workOrder: WorkOrder) => void;
  onCancel: () => void;
}

const types: Array<WorkOrder['type']> = ['preventive', 'corrective', 'emergency'];
const statuses: Array<WorkOrder['status']> = ['open', 'in_progress', 'completed', 'on_hold'];
const priorities: Array<WorkOrder['priority']> = ['low', 'medium', 'high', 'critical'];

const typeLabels = {
  preventive: "Preventiva",
  corrective: "Correttiva",
  emergency: "Emergenza"
};

const statusLabels = {
  open: "Aperto",
  in_progress: "In corso",
  completed: "Completato",
  on_hold: "In sospeso"
};

const priorityLabels = {
  low: "Bassa",
  medium: "Media",
  high: "Alta",
  critical: "Critica"
};

export default function WorkOrderForm({ workOrder, onSave, onCancel }: WorkOrderFormProps) {
  const [formData, setFormData] = useState<Partial<WorkOrder>>({
    title: '',
    description: '',
    assetId: mockAssets[0]?.id || '',
    assetName: mockAssets[0]?.name || '',
    type: 'corrective',
    status: 'open',
    priority: 'medium',
    assignedTo: mockUsers[0]?.name || '',
    requestedBy: mockUsers[0]?.name || '',
    createdDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 days
    estimatedTime: '2h',
    location: mockAssets[0]?.location || '',
    supplier: '',
    ...workOrder
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedAsset = mockAssets.find(asset => asset.id === formData.assetId);
    
    const newWorkOrder: WorkOrder = {
      id: workOrder?.id || Date.now().toString(),
      title: formData.title || '',
      description: formData.description || '',
      assetId: formData.assetId || '',
      assetName: selectedAsset?.name || formData.assetName || '',
      type: formData.type || 'corrective',
      status: formData.status || 'open',
      priority: formData.priority || 'medium',
      assignedTo: formData.assignedTo || '',
      requestedBy: formData.requestedBy || '',
      createdDate: formData.createdDate || new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate || '',
      completedDate: formData.completedDate,
      estimatedTime: formData.estimatedTime || '2h',
      actualTime: formData.actualTime,
      location: selectedAsset?.location || formData.location || '',
      supplier: formData.supplier
    };

    onSave(newWorkOrder);
  };

  const handleChange = (field: keyof WorkOrder, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Update asset name and location when asset changes
      if (field === 'assetId') {
        const selectedAsset = mockAssets.find(asset => asset.id === value);
        if (selectedAsset) {
          updated.assetName = selectedAsset.name;
          updated.location = selectedAsset.location;
        }
      }
      
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{workOrder ? 'Modifica Ordine di Lavoro' : 'Nuovo Ordine di Lavoro'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titolo *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  placeholder="es. Manutenzione ordinaria server"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrizione</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Descrivi i dettagli del lavoro da eseguire..."
                />
              </div>
            </div>

            {/* Asset and Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assetId">Asset *</Label>
                <select
                  id="assetId"
                  value={formData.assetId}
                  onChange={(e) => handleChange('assetId', e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Seleziona asset...</option>
                  {mockAssets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.location})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="location">Ubicazione</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Type, Priority, Status */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value as WorkOrder['type'])}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {types.map(type => (
                    <option key={type} value={type}>{typeLabels[type]}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priorità</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value as WorkOrder['priority'])}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priorityLabels[priority]}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="status">Stato</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as WorkOrder['status'])}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{statusLabels[status]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignment */}
            <div className="grid grid-cols-2 gap-4">
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
              
              <div>
                <Label htmlFor="requestedBy">Richiesto da</Label>
                <select
                  id="requestedBy"
                  value={formData.requestedBy}
                  onChange={(e) => handleChange('requestedBy', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {mockUsers.map(user => (
                    <option key={user.id} value={user.name}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Supplier (Optional) */}
            <div>
              <Label htmlFor="supplier">Fornitore (opzionale)</Label>
              <select
                id="supplier"
                value={formData.supplier || ''}
                onChange={(e) => handleChange('supplier', e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Nessun fornitore</option>
                {mockSuppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                ))}
              </select>
            </div>

            {/* Dates and Time */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="createdDate">Data creazione</Label>
                <Input
                  id="createdDate"
                  type="date"
                  value={formData.createdDate}
                  onChange={(e) => handleChange('createdDate', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="dueDate">Data scadenza *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="estimatedTime">Tempo stimato</Label>
                <Input
                  id="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={(e) => handleChange('estimatedTime', e.target.value)}
                  placeholder="es. 2h, 1 giorno"
                />
              </div>
            </div>

            {/* Completion fields (only if editing and completed) */}
            {workOrder && formData.status === 'completed' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                <div>
                  <Label htmlFor="completedDate">Data completamento</Label>
                  <Input
                    id="completedDate"
                    type="date"
                    value={formData.completedDate || ''}
                    onChange={(e) => handleChange('completedDate', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="actualTime">Tempo effettivo</Label>
                  <Input
                    id="actualTime"
                    value={formData.actualTime || ''}
                    onChange={(e) => handleChange('actualTime', e.target.value)}
                    placeholder="es. 1h 30m"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 border-t">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {workOrder ? 'Aggiorna Ordine' : 'Crea Ordine di Lavoro'}
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