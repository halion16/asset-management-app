'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Star, Clock, CheckCircle, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Supplier } from "@/data/mockData";
import { useState } from "react";

interface SupplierCardProps {
  supplier: Supplier;
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (id: string) => void;
}

export default function SupplierCard({ supplier, onEdit, onDelete }: SupplierCardProps) {
  const [showActions, setShowActions] = useState(false);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-3 w-3 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">{supplier.name}</h3>
          <div className="flex items-center gap-1 mb-2">
            {renderStars(supplier.rating)}
            <span className="text-xs text-gray-600 ml-1">({supplier.rating})</span>
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
                  onEdit?.(supplier);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="h-3 w-3" />
                Modifica
              </button>
              <button
                onClick={() => {
                  onDelete?.(supplier.id);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
              >
                <Trash2 className="h-3 w-3" />
                Elimina
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Mail className="h-3 w-3" />
          <span>{supplier.email}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Phone className="h-3 w-3" />
          <span>{supplier.phone}</span>
        </div>
      </div>

      {/* Specialties */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Specializzazioni</p>
        <div className="flex flex-wrap gap-1">
          {supplier.specialties.slice(0, 3).map((specialty, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
            >
              {specialty}
            </span>
          ))}
          {supplier.specialties.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              +{supplier.specialties.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-gray-50 rounded">
          <div className="font-semibold text-gray-900">{supplier.activeContracts}</div>
          <div className="text-gray-600">Contratti Attivi</div>
        </div>
        
        <div className="p-2 bg-gray-50 rounded">
          <div className="font-semibold text-gray-900">{supplier.completedJobs}</div>
          <div className="text-gray-600">Lavori Completati</div>
        </div>
        
        <div className="p-2 bg-gray-50 rounded flex flex-col items-center">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-600" />
            <span className="font-semibold text-gray-900 text-xs">{supplier.averageResponseTime}</span>
          </div>
          <div className="text-gray-600">Tempo Risposta</div>
        </div>
      </div>

      {/* Performance Badge */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-center">
          {supplier.rating >= 4.5 ? (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>Fornitore Eccellente</span>
            </div>
          ) : supplier.rating >= 4.0 ? (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <CheckCircle className="h-3 w-3" />
              <span>Fornitore Affidabile</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-yellow-600">
              <Clock className="h-3 w-3" />
              <span>In Valutazione</span>
            </div>
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