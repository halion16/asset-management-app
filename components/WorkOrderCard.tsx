'use client';

import { Card } from "@/components/ui/card";
import { Clock, MapPin, User, AlertTriangle } from "lucide-react";
import { WorkOrder } from "@/data/mockData";

interface WorkOrderCardProps {
  workOrder: WorkOrder;
}

const priorityColors = {
  low: "text-green-600 bg-green-50",
  medium: "text-yellow-600 bg-yellow-50", 
  high: "text-orange-600 bg-orange-50",
  critical: "text-red-600 bg-red-50"
};

const statusColors = {
  open: "text-blue-600 bg-blue-50",
  in_progress: "text-orange-600 bg-orange-50",
  completed: "text-green-600 bg-green-50",
  on_hold: "text-gray-600 bg-gray-50"
};

const statusLabels = {
  open: "Aperto",
  in_progress: "In attesa", 
  completed: "Fatto",
  on_hold: "In sospeso"
};

const priorityLabels = {
  low: "Bassa",
  medium: "Media",
  high: "Alta", 
  critical: "Critica"
};

export default function WorkOrderCard({ workOrder }: WorkOrderCardProps) {
  const isOverdue = new Date(workOrder.dueDate) < new Date() && workOrder.status !== 'completed';

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <h3 className="font-medium text-gray-900 text-sm">{workOrder.title}</h3>
          {workOrder.type === 'preventive' && (
            <div className="w-4 h-4 rounded bg-orange-100 flex items-center justify-center">
              <Clock className="h-2.5 w-2.5 text-orange-600" />
            </div>
          )}
        </div>
        <span className="text-xs text-gray-500">#{workOrder.id}</span>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{workOrder.description}</p>

      {/* Status and Priority */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[workOrder.status]}`}>
          {statusLabels[workOrder.status]}
        </span>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[workOrder.priority]}`}>
          {priorityLabels[workOrder.priority]}
        </span>
        {isOverdue && (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-red-600 bg-red-50">
            <AlertTriangle className="h-3 w-3" />
            In ritardo
          </span>
        )}
      </div>

      {/* Meta information */}
      <div className="space-y-2 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>Data di scadenza</span>
          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
            {new Date(workOrder.dueDate).toLocaleDateString('it-IT')}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Priorità</span>
          <span className={`font-medium ${workOrder.priority === 'medium' ? 'text-orange-600' : ''}`}>
            {priorityLabels[workOrder.priority]}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>ID dell'Ordine di lavoro</span>
          <span>#{workOrder.id}</span>
        </div>
      </div>

      {/* Assigned user */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs text-gray-600">{workOrder.assignedTo}</span>
        </div>
      </div>

      {/* Equipment and Location */}
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Attrezzatura</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <span>{workOrder.assetName}</span>
        </div>
        
        {workOrder.supplier && (
          <>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              <span>Produttore</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-[8px] font-bold">
                  {workOrder.supplier.charAt(0)}
                </span>
              </div>
              <span>{workOrder.supplier}</span>
            </div>
          </>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
          <span>Ubicazione</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <MapPin className="h-3 w-3" />
          <span>{workOrder.location}</span>
        </div>
      </div>

      {/* Conditions */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-1">Condizioni di programmazione</p>
        <p className="text-xs text-gray-600">
          {workOrder.type === 'preventive' ? 'Questo Ordine di lavoro si ripeterà in base al tempo.' : 'Manutenzione correttiva su richiesta'}
        </p>
      </div>
    </Card>
  );
}