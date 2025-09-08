'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, mockLocations, ROLE_PERMISSIONS } from "@/data/mockData";
import { X } from "lucide-react";

interface UserFormProps {
  user?: User;
  onSave: (user: User) => void;
  onCancel: () => void;
}

const roles: Array<User['role']> = ['admin', 'manager', 'technician', 'operator', 'supplier'];
const statuses: Array<User['status']> = ['active', 'inactive', 'suspended'];

const roleLabels = {
  admin: "Amministratore",
  manager: "Manager", 
  technician: "Tecnico",
  operator: "Operatore",
  supplier: "Fornitore"
};

const statusLabels = {
  active: "Attivo",
  inactive: "Inattivo",
  suspended: "Sospeso"
};

const departments = [
  'IT & Operations',
  'Facilities Management',
  'Maintenance',
  'Operations',
  'Quality Assurance',
  'Safety & Security',
  'Human Resources',
  'Finance',
  'Procurement'
];

export default function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'operator',
    location: mockLocations[0]?.name || '',
    department: 'Operations',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'active',
    permissions: [],
    workOrdersAssigned: 0,
    workOrdersCompleted: 0,
    ...user
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get default permissions for role
    const rolePermissions = ROLE_PERMISSIONS[formData.role as keyof typeof ROLE_PERMISSIONS] || [];
    
    const newUser: User = {
      id: user?.id || Date.now().toString(),
      name: formData.name || '',
      email: formData.email || '',
      role: formData.role || 'operator',
      avatar: formData.avatar || formData.name?.split(' ').map(n => n[0]).join(''),
      location: formData.location,
      department: formData.department,
      phone: formData.phone,
      hireDate: formData.hireDate,
      status: formData.status || 'active',
      permissions: formData.permissions?.length ? formData.permissions : rolePermissions,
      lastLogin: user?.lastLogin || new Date().toISOString(),
      workOrdersAssigned: Number(formData.workOrdersAssigned) || 0,
      workOrdersCompleted: Number(formData.workOrdersCompleted) || 0
    };

    onSave(newUser);
  };

  const handleChange = (field: keyof User, value: string | number | string[]) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-update permissions when role changes
      if (field === 'role') {
        const rolePermissions = ROLE_PERMISSIONS[value as keyof typeof ROLE_PERMISSIONS] || [];
        updated.permissions = rolePermissions;
      }
      
      return updated;
    });
  };

  const togglePermission = (permission: string) => {
    const currentPermissions = formData.permissions || [];
    const hasPermission = currentPermissions.includes(permission);
    
    let newPermissions;
    if (hasPermission) {
      newPermissions = currentPermissions.filter(p => p !== permission);
    } else {
      newPermissions = [...currentPermissions, permission];
    }
    
    handleChange('permissions', newPermissions);
  };

  const availablePermissions = [
    { key: 'all', label: 'Tutti i permessi' },
    { key: 'view_all', label: 'Visualizza tutto' },
    { key: 'view_workorders', label: 'Visualizza Work Orders' },
    { key: 'edit_workorders', label: 'Modifica Work Orders' },
    { key: 'edit_assigned_workorders', label: 'Modifica WO assegnati' },
    { key: 'manage_assets', label: 'Gestisci Asset' },
    { key: 'view_assets', label: 'Visualizza Asset' },
    { key: 'manage_users', label: 'Gestisci Utenti' },
    { key: 'view_reports', label: 'Visualizza Report' },
    { key: 'create_requests', label: 'Crea Richieste' },
    { key: 'manage_suppliers', label: 'Gestisci Fornitori' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{user ? 'Modifica Utente' : 'Nuovo Utente'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="es. Mario Rossi"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  placeholder="mario.rossi@azienda.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+39 123 456789"
                />
              </div>
              
              <div>
                <Label htmlFor="hireDate">Data assunzione</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleChange('hireDate', e.target.value)}
                />
              </div>
            </div>

            {/* Role and Status */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="role">Ruolo *</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value as User['role'])}
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{roleLabels[role]}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="status">Stato</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as User['status'])}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{statusLabels[status]}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="department">Dipartimento</Label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
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

            {/* Work Orders Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workOrdersAssigned">Work Orders Assegnati</Label>
                <Input
                  id="workOrdersAssigned"
                  type="number"
                  min="0"
                  value={formData.workOrdersAssigned}
                  onChange={(e) => handleChange('workOrdersAssigned', Number(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="workOrdersCompleted">Work Orders Completati</Label>
                <Input
                  id="workOrdersCompleted"
                  type="number"
                  min="0"
                  value={formData.workOrdersCompleted}
                  onChange={(e) => handleChange('workOrdersCompleted', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Permissions */}
            <div>
              <Label>Permessi</Label>
              <div className="mt-2 p-4 border border-gray-200 rounded-md bg-gray-50">
                <p className="text-sm text-gray-600 mb-3">
                  Ruolo selezionato: <strong>{roleLabels[formData.role || 'operator']}</strong>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map(permission => {
                    const isSelected = formData.permissions?.includes(permission.key) || false;
                    const isDisabled = formData.permissions?.includes('all') && permission.key !== 'all';
                    
                    return (
                      <label
                        key={permission.key}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                          isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => !isDisabled && togglePermission(permission.key)}
                          disabled={isDisabled}
                          className="rounded"
                        />
                        <span className="text-sm">{permission.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 border-t">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {user ? 'Aggiorna Utente' : 'Crea Utente'}
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