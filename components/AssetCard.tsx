'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, DollarSign, Wrench, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Asset } from "@/data/mockData";
import { useState } from "react";

interface AssetCardProps {
  asset: Asset;
  onEdit?: (asset: Asset) => void;
  onDelete?: (id: string) => void;
  onViewWorkOrders?: (assetId: string) => void;
}

const statusColors = {
  operational: "text-green-600 bg-green-50 border-green-200",
  maintenance: "text-orange-600 bg-orange-50 border-orange-200", 
  down: "text-red-600 bg-red-50 border-red-200",
  retired: "text-gray-600 bg-gray-50 border-gray-200"
};

const priorityColors = {
  low: "text-green-600",
  medium: "text-yellow-600", 
  high: "text-orange-600",
  critical: "text-red-600"
};

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

export default function AssetCard({ asset, onEdit, onDelete, onViewWorkOrders }: AssetCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">{asset.name}</h3>
          <p className="text-xs text-gray-500">{asset.brand} - {asset.model}</p>
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
                  onEdit?.(asset);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="h-3 w-3" />
                Modifica
              </button>
              {onViewWorkOrders && (
                <button
                  onClick={() => {
                    onViewWorkOrders(asset.id);
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Wrench className="h-3 w-3" />
                  Work Orders
                </button>
              )}
              <button
                onClick={() => {
                  onDelete?.(asset.id);
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

      {/* Status and Priority */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded border ${statusColors[asset.status]}`}>
          {statusLabels[asset.status]}
        </span>
        <span className={`text-xs font-medium ${priorityColors[asset.priority]}`}>
          Priorità {priorityLabels[asset.priority]}
        </span>
      </div>

      {/* Asset Details */}
      <div className="space-y-2 text-xs text-gray-600 mb-3">
        <div className="flex items-center justify-between">
          <span>Serial Number</span>
          <span className="font-mono">{asset.serialNumber}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Categoria</span>
          <span>{asset.category}</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          <span>{asset.location}</span>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="h-3 w-3" />
          <span>€{asset.value.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          <span>Acquistato: {new Date(asset.purchaseDate).toLocaleDateString('it-IT')}</span>
        </div>
      </div>

      {/* Maintenance Info */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Ultima manutenzione</span>
          {asset.lastMaintenance && (
            <span>{new Date(asset.lastMaintenance).toLocaleDateString('it-IT')}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Prossima manutenzione</span>
          {asset.nextMaintenance && (
            <span className={new Date(asset.nextMaintenance) < new Date() ? 'text-red-600 font-medium' : ''}>
              {new Date(asset.nextMaintenance).toLocaleDateString('it-IT')}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Work Orders attivi</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded-full">{asset.workOrders}</span>
        </div>
      </div>

      {/* Assigned To */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {asset.assignedTo.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="text-xs text-gray-600">Responsabile: {asset.assignedTo}</span>
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