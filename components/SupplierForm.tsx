'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Supplier } from "@/data/mockData";
import { X, Plus, Trash2 } from "lucide-react";

interface SupplierFormProps {
  supplier?: Supplier;
  onSave: (supplier: Supplier) => void;
  onCancel: () => void;
}

const commonSpecialties = [
  'HVAC', 'Refrigeration', 'Air Conditioning', 'IT Equipment', 'Servers', 'Network',
  'Vehicles', 'Forklifts', 'Industrial Equipment', 'Electrical', 'Plumbing',
  'Carpentry', 'Painting', 'Cleaning Services', 'Security Systems', 'Fire Safety',
  'Medical Equipment', 'Laboratory Equipment', 'Office Equipment', 'Furniture'
];

export default function SupplierForm({ supplier, onSave, onCancel }: SupplierFormProps) {
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    email: '',
    phone: '',
    specialties: [],
    rating: 4.0,
    activeContracts: 0,
    completedJobs: 0,
    averageResponseTime: '2h',
    ...supplier
  });

  const [newSpecialty, setNewSpecialty] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSupplier: Supplier = {
      id: supplier?.id || Date.now().toString(),
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      specialties: formData.specialties || [],
      rating: Number(formData.rating) || 4.0,
      activeContracts: Number(formData.activeContracts) || 0,
      completedJobs: Number(formData.completedJobs) || 0,
      averageResponseTime: formData.averageResponseTime || '2h'
    };

    onSave(newSupplier);
  };

  const handleChange = (field: keyof Supplier, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties?.includes(newSpecialty.trim())) {
      const updatedSpecialties = [...(formData.specialties || []), newSpecialty.trim()];
      handleChange('specialties', updatedSpecialties);
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    const updatedSpecialties = formData.specialties?.filter((_, i) => i !== index) || [];
    handleChange('specialties', updatedSpecialties);
  };

  const addCommonSpecialty = (specialty: string) => {
    if (!formData.specialties?.includes(specialty)) {
      const updatedSpecialties = [...(formData.specialties || []), specialty];
      handleChange('specialties', updatedSpecialties);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{supplier ? 'Modifica Fornitore' : 'Nuovo Fornitore'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Nome Azienda *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="es. TechnoIT Solutions"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  placeholder="info@azienda.com"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Telefono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  placeholder="+39 02 123456"
                />
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">Valutazione (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => handleChange('rating', Number(e.target.value))}
                  placeholder="4.0"
                />
              </div>
              
              <div>
                <Label htmlFor="averageResponseTime">Tempo Risposta Medio</Label>
                <Input
                  id="averageResponseTime"
                  value={formData.averageResponseTime}
                  onChange={(e) => handleChange('averageResponseTime', e.target.value)}
                  placeholder="es. 2h, 1 giorno"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="activeContracts">Contratti Attivi</Label>
                <Input
                  id="activeContracts"
                  type="number"
                  min="0"
                  value={formData.activeContracts}
                  onChange={(e) => handleChange('activeContracts', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="completedJobs">Lavori Completati</Label>
                <Input
                  id="completedJobs"
                  type="number"
                  min="0"
                  value={formData.completedJobs}
                  onChange={(e) => handleChange('completedJobs', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Specialties */}
            <div>
              <Label>Specializzazioni</Label>
              
              {/* Current specialties */}
              {formData.specialties && formData.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {formData.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                    >
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(index)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add new specialty */}
              <div className="flex gap-2">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Aggiungi specializzazione..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSpecialty();
                    }
                  }}
                />
                <Button type="button" onClick={addSpecialty} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick add common specialties */}
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Aggiungi rapidamente:</p>
                <div className="flex flex-wrap gap-1">
                  {commonSpecialties
                    .filter(spec => !formData.specialties?.includes(spec))
                    .slice(0, 8)
                    .map(specialty => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => addCommonSpecialty(specialty)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      + {specialty}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 border-t">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {supplier ? 'Aggiorna Fornitore' : 'Crea Fornitore'}
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