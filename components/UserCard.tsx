'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, MapPin, MoreVertical, Edit, Trash2, Shield, User2 } from "lucide-react";
import { User } from "@/data/mockData";
import { useState } from "react";

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (id: string) => void;
}

const roleColors = {
  admin: "text-red-600 bg-red-50 border-red-200",
  manager: "text-purple-600 bg-purple-50 border-purple-200", 
  technician: "text-blue-600 bg-blue-50 border-blue-200",
  operator: "text-green-600 bg-green-50 border-green-200",
  supplier: "text-gray-600 bg-gray-50 border-gray-200"
};

const statusColors = {
  active: "text-green-600 bg-green-50",
  inactive: "text-gray-600 bg-gray-50",
  suspended: "text-red-600 bg-red-50"
};

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

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Mai';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Oggi';
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `${diffDays} giorni fa`;
    return date.toLocaleDateString('it-IT');
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
            user.status === 'active' ? 'bg-blue-600' : 'bg-gray-400'
          }`}>
            {user.avatar || user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{user.name}</h3>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        
        {/* Actions Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
              <button
                onClick={() => {
                  onEdit?.(user);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="h-3 w-3" />
                Modifica
              </button>
              <button
                onClick={() => {
                  onDelete?.(user.id);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                disabled={user.role === 'admin'}
              >
                <Trash2 className="h-3 w-3" />
                {user.role === 'admin' ? 'Non eliminabile' : 'Elimina'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Role and Status */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded border ${roleColors[user.role]}`}>
          {user.role === 'admin' && <Shield className="h-3 w-3 inline mr-1" />}
          {roleLabels[user.role]}
        </span>
        <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[user.status]}`}>
          {statusLabels[user.status]}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 text-xs text-gray-600 mb-3">
        {user.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" />
            <span>{user.phone}</span>
          </div>
        )}
        
        {user.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span>{user.location}</span>
          </div>
        )}

        {user.department && (
          <div className="flex items-center gap-2">
            <User2 className="h-3 w-3" />
            <span>{user.department}</span>
          </div>
        )}

        {user.hireDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>Assunto: {formatDate(user.hireDate)}</span>
          </div>
        )}
      </div>

      {/* Work Orders Stats */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs mb-3">
        <div className="p-2 bg-blue-50 rounded">
          <div className="font-semibold text-blue-700">{user.workOrdersAssigned || 0}</div>
          <div className="text-blue-600">Assegnati</div>
        </div>
        
        <div className="p-2 bg-green-50 rounded">
          <div className="font-semibold text-green-700">{user.workOrdersCompleted || 0}</div>
          <div className="text-green-600">Completati</div>
        </div>
      </div>

      {/* Performance Rate */}
      {(user.workOrdersAssigned || 0) > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Tasso completamento</span>
            <span>{Math.round(((user.workOrdersCompleted || 0) / (user.workOrdersAssigned || 1)) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ 
                width: `${Math.round(((user.workOrdersCompleted || 0) / (user.workOrdersAssigned || 1)) * 100)}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Last Login */}
      <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
        <span>Ultimo accesso: {formatLastLogin(user.lastLogin)}</span>
      </div>

      {/* Permissions Preview */}
      <div className="mt-2">
        <p className="text-xs text-gray-500 mb-1">Permessi:</p>
        <div className="flex flex-wrap gap-1">
          {user.permissions.slice(0, 2).map((permission, index) => (
            <span
              key={index}
              className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
            >
              {permission === 'all' ? 'Tutti' : permission.replace('_', ' ')}
            </span>
          ))}
          {user.permissions.length > 2 && (
            <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
              +{user.permissions.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Click overlay to close actions */}
      {showActions && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowActions(false)}
        />
      )}
    </Card>
  );
}