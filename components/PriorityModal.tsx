'use client';

import { useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPriority: 'low' | 'medium' | 'high' | 'critical';
  onPriorityChange: (priority: 'low' | 'medium' | 'high' | 'critical') => void;
  title?: string;
}

const priorityLevels = [
  {
    id: 'low' as const,
    label: 'Bassa',
    description: 'Non urgente, può essere completato quando possibile',
    color: '#10b981', // green-500
    bgColor: '#f0fdf4', // green-50
    icon: CheckCircle
  },
  {
    id: 'medium' as const,
    label: 'Media',
    description: 'Priorità normale, da completare nei tempi previsti',
    color: '#f59e0b', // yellow-500
    bgColor: '#fefce8', // yellow-50
    icon: AlertTriangle
  },
  {
    id: 'high' as const,
    label: 'Alta',
    description: 'Urgente, richiede attenzione prioritaria',
    color: '#f97316', // orange-500
    bgColor: '#fff7ed', // orange-50
    icon: AlertTriangle
  },
  {
    id: 'critical' as const,
    label: 'Critica',
    description: 'Massima urgenza, intervento immediato',
    color: '#dc2626', // red-600
    bgColor: '#fef2f2', // red-50
    icon: AlertTriangle
  }
];

export default function PriorityModal({ 
  isOpen, 
  onClose, 
  currentPriority,
  onPriorityChange, 
  title = "Modifica priorità" 
}: PriorityModalProps) {
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'critical'>(currentPriority);

  if (!isOpen) return null;

  const handleApply = () => {
    onPriorityChange(selectedPriority);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600">
            <strong>Priorità attuale:</strong> <span className="capitalize">{priorityLevels.find(p => p.id === currentPriority)?.label}</span>
          </div>
        </div>

        {/* Priority Levels */}
        <div className="space-y-3 mb-6">
          {priorityLevels.map((priority) => {
            const Icon = priority.icon;
            const isSelected = selectedPriority === priority.id;
            const isCurrent = currentPriority === priority.id;
            
            return (
              <div
                key={priority.id}
                onClick={() => setSelectedPriority(priority.id)}
                className={`flex items-center p-4 rounded-lg cursor-pointer border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                  style={{ backgroundColor: priority.bgColor }}
                >
                  <Icon 
                    className="h-5 w-5" 
                    style={{ color: priority.color }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{priority.label}</span>
                    {isCurrent && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        Attuale
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {priority.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="ml-2">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Annulla
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={selectedPriority === currentPriority}
          >
            Applica modifiche
          </Button>
        </div>
      </div>
    </div>
  );
}