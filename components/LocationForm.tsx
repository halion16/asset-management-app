'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Location, mockUsers, mockAssets } from "@/data/mockData";
import { X } from "lucide-react";

interface LocationFormProps {
  location?: Location;
  onSave: (location: Location) => void;
  onCancel: () => void;
}

const types = ['headquarters', 'warehouse', 'branch', 'remote'];
const statuses = ['active', 'inactive', 'maintenance', 'planned'];
const priorities = ['low', 'medium', 'high', 'critical'];

const typeLabels = {
  headquarters: "Sede Principale",
  warehouse: "Magazzino",
  branch: "Filiale",
  remote: "Remoto"
};

const statusLabels = {
  active: "Attiva",
  inactive: "Inattiva", 
  maintenance: "Manutenzione",
  planned: "Pianificata"
};

const priorityLabels = {
  low: "Bassa",
  medium: "Media",
  high: "Alta",
  critical: "Critica"
};

export default function LocationForm({ location, onSave, onCancel }: LocationFormProps) {
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    address: '',
    city: '',
    type: 'branch',
    status: 'active',
    priority: 'medium',
    manager: mockUsers.find(u => u.role === 'manager')?.name || '',
    contactPerson: mockUsers[0]?.name || '',
    createdDate: new Date().toISOString().split('T')[0],
    activationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    capacity: '100',
    assets: location?.assets || 0,
    ...location
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLocation: Location = {
      id: location?.id || Date.now().toString(),
      name: formData.name || '',
      address: `${formData.address || ''}, ${formData.city || ''}`.trim(),
      manager: formData.manager || '',
      assets: parseInt(formData.assets) || 0
    };

    onSave(newLocation);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{location ? 'Modifica Ubicazione' : 'Nuova Ubicazione'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Ubicazione *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="es. Ufficio Milano Centro, Magazzino Roma Sud"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrizione</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Descrivi le caratteristiche e la funzione dell'ubicazione..."
                />
              </div>
            </div>

            {/* Address and Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Indirizzo *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  required
                  placeholder="Via/Piazza, numero civico"
                />
              </div>
              
              <div>
                <Label htmlFor="city">Città</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Città, Provincia"
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
                  onChange={(e) => handleChange('type', e.target.value)}
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
                  onChange={(e) => handleChange('priority', e.target.value)}
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
                  onChange={(e) => handleChange('status', e.target.value)}
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
                <Label htmlFor="manager">Responsabile</Label>
                <select
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => handleChange('manager', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {mockUsers.filter(user => ['manager', 'admin'].includes(user.role)).map(user => (
                    <option key={user.id} value={user.name}>{user.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="contactPerson">Referente</Label>
                <select
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleChange('contactPerson', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {mockUsers.map(user => (
                    <option key={user.id} value={user.name}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Capacity (Optional) */}
            <div>
              <Label htmlFor="capacity">Capacità massima (opzionale)</Label>
              <Input
                id="capacity"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', e.target.value)}
                placeholder="es. 100 persone, 500 mq, 1000 pallet"
              />
            </div>

            {/* Dates and Assets */}
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
                <Label htmlFor="activationDate">Data attivazione *</Label>
                <Input
                  id="activationDate"
                  type="date"
                  value={formData.activationDate}
                  onChange={(e) => handleChange('activationDate', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="assets">Asset presenti</Label>
                <Input
                  id="assets"
                  type="number"
                  value={formData.assets}
                  onChange={(e) => handleChange('assets', e.target.value)}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Additional fields (only if editing and active) */}
            {location && formData.status === 'active' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                <div>
                  <Label htmlFor="lastInspection">Ultima ispezione</Label>
                  <Input
                    id="lastInspection"
                    type="date"
                    value={formData.lastInspection || ''}
                    onChange={(e) => handleChange('lastInspection', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="certification">Certificazioni</Label>
                  <Input
                    id="certification"
                    value={formData.certification || ''}
                    onChange={(e) => handleChange('certification', e.target.value)}
                    placeholder="es. ISO 9001, HACCP"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 border-t">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {location ? 'Aggiorna Ubicazione' : 'Crea Ubicazione'}
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