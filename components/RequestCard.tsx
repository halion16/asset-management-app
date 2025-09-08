'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, DollarSign, MoreVertical, Edit, Trash2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Request } from "@/data/mockData";
import { useState } from "react";

interface RequestCardProps {
  request: Request;
  onEdit?: (request: Request) => void;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onConvert?: (id: string) => void;
  canManage?: boolean;
}

const typeColors = {
  maintenance: "text-blue-600 bg-blue-50 border-blue-200",
  repair: "text-red-600 bg-red-50 border-red-200",
  inspection: "text-yellow-600 bg-yellow-50 border-yellow-200", 
  installation: "text-green-600 bg-green-50 border-green-200",
  other: "text-gray-600 bg-gray-50 border-gray-200"
};

const priorityColors = {
  low: "text-green-600 bg-green-50",
  medium: "text-yellow-600 bg-yellow-50", 
  high: "text-orange-600 bg-orange-50",
  critical: "text-red-600 bg-red-50"
};

const statusColors = {
  pending: "text-orange-600 bg-orange-50 border-orange-200",
  approved: "text-green-600 bg-green-50 border-green-200",
  rejected: "text-red-600 bg-red-50 border-red-200",
  converted: "text-blue-600 bg-blue-50 border-blue-200",
  cancelled: "text-gray-600 bg-gray-50 border-gray-200"
};

const typeLabels = {
  maintenance: "Manutenzione",
  repair: "Riparazione",
  inspection: "Ispezione",
  installation: "Installazione",
  other: "Altro"
};

const priorityLabels = {
  low: "Bassa",
  medium: "Media",
  high: "Alta", 
  critical: "Critica"
};

const statusLabels = {
  pending: "In attesa",
  approved: "Approvata",
  rejected: "Rifiutata",
  converted: "Convertita",
  cancelled: "Annullata"
};

export default function RequestCard({ 
  request, 
  onEdit, 
  onDelete, 
  onApprove, 
  onReject, 
  onConvert,
  canManage = false 
}: RequestCardProps) {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const isOverdue = request.requiredDate && 
    new Date(request.requiredDate) < new Date() && 
    request.status === 'pending';

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded border ${typeColors[request.type]}`}>
              {typeLabels[request.type]}
            </span>
            {isOverdue && (
              <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700 border border-red-200">
                Scaduta
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1">{request.title}</h3>
          <p className="text-xs text-gray-600 line-clamp-2">{request.description}</p>
        </div>
        
        {/* Actions Menu */}
        {canManage && (
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
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[140px]">
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        onApprove?.(request.id);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Approva
                    </button>
                    <button
                      onClick={() => {
                        onReject?.(request.id);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                    >
                      <XCircle className="h-3 w-3" />
                      Rifiuta
                    </button>
                  </>
                )}
                
                {request.status === 'approved' && (
                  <button
                    onClick={() => {
                      onConvert?.(request.id);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-blue-600"
                  >
                    <ArrowRight className="h-3 w-3" />
                    Converti in WO
                  </button>
                )}

                <button
                  onClick={() => {
                    onEdit?.(request);
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="h-3 w-3" />
                  Modifica
                </button>
                
                <button
                  onClick={() => {
                    onDelete?.(request.id);
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
        )}
      </div>

      {/* Status and Priority */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded border ${statusColors[request.status]}`}>
          {statusLabels[request.status]}
        </span>
        <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[request.priority]}`}>
          Priorità {priorityLabels[request.priority]}
        </span>
      </div>

      {/* Request Details */}
      <div className="space-y-2 text-xs text-gray-600 mb-3">
        <div className="flex items-center gap-2">
          <User className="h-3 w-3" />
          <span>Richiesto da: {request.requestedBy}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          <span>Data richiesta: {formatDate(request.requestedDate)}</span>
        </div>

        {request.requiredDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              Data richiesta: {formatDate(request.requiredDate)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          <span>{request.location} - {request.department}</span>
        </div>

        {request.estimatedCost && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-3 w-3" />
            <span>Costo stimato: €{request.estimatedCost.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Asset Info */}
      {request.assetName && (
        <div className="mb-3 p-2 bg-gray-50 rounded">
          <p className="text-xs text-gray-500 mb-1">Asset correlato:</p>
          <p className="text-xs text-gray-700 font-medium">{request.assetName}</p>
        </div>
      )}

      {/* Review Info */}
      {request.reviewedBy && (
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-600">
              Revisionato da: {request.reviewedBy}
            </span>
          </div>
          
          {request.reviewedDate && (
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-600">
                Data revisione: {formatDate(request.reviewedDate)}
              </span>
            </div>
          )}

          {request.reviewNotes && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Note:</p>
              <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                {request.reviewNotes}
              </p>
            </div>
          )}

          {request.convertedToWorkOrderId && (
            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-700 font-medium">
                Convertita in Work Order #{request.convertedToWorkOrderId}
              </p>
            </div>
          )}
        </div>
      )}

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