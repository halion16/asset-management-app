// Data validation utilities for cross-module consistency
import { 
  Asset, 
  WorkOrder, 
  Request, 
  MaintenanceEvent, 
  Document, 
  PurchaseOrder,
  Part,
  StockMovement
} from "@/data/mockData";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateDataConsistency(
  assets: Asset[],
  workOrders: WorkOrder[],
  requests: Request[],
  maintenanceEvents: MaintenanceEvent[],
  documents: Document[],
  purchaseOrders: PurchaseOrder[],
  parts: Part[],
  stockMovements: StockMovement[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Create lookup maps for quick reference
  const assetIds = new Set(assets.map(a => a.id));
  const workOrderIds = new Set(workOrders.map(wo => wo.id));
  const partIds = new Set(parts.map(p => p.id));

  // Validate WorkOrder -> Asset references
  workOrders.forEach(wo => {
    if (!assetIds.has(wo.assetId)) {
      errors.push(`WorkOrder ${wo.id} (${wo.title}) references non-existent asset ID: ${wo.assetId}`);
    }
  });

  // Validate Request -> Asset references  
  requests.forEach(req => {
    if (req.assetId && !assetIds.has(req.assetId)) {
      errors.push(`Request ${req.id} (${req.title}) references non-existent asset ID: ${req.assetId}`);
    }
    if (req.convertedToWorkOrderId && !workOrderIds.has(req.convertedToWorkOrderId)) {
      warnings.push(`Request ${req.id} references non-existent work order ID: ${req.convertedToWorkOrderId}`);
    }
  });

  // Validate MaintenanceEvent -> Asset references
  maintenanceEvents.forEach(event => {
    if (!assetIds.has(event.assetId)) {
      errors.push(`MaintenanceEvent ${event.id} (${event.title}) references non-existent asset ID: ${event.assetId}`);
    }
    if (event.workOrderId && !workOrderIds.has(event.workOrderId)) {
      warnings.push(`MaintenanceEvent ${event.id} references non-existent work order ID: ${event.workOrderId}`);
    }
  });

  // Validate Document -> Asset/WorkOrder references
  documents.forEach(doc => {
    if (doc.assetId && !assetIds.has(doc.assetId)) {
      errors.push(`Document ${doc.id} (${doc.name}) references non-existent asset ID: ${doc.assetId}`);
    }
    if (doc.workOrderId && !workOrderIds.has(doc.workOrderId)) {
      warnings.push(`Document ${doc.id} references non-existent work order ID: ${doc.workOrderId}`);
    }
  });

  // Validate PurchaseOrder -> WorkOrder references
  purchaseOrders.forEach(po => {
    if (po.workOrderId && !workOrderIds.has(po.workOrderId)) {
      warnings.push(`PurchaseOrder ${po.id} (${po.orderNumber}) references non-existent work order ID: ${po.workOrderId}`);
    }
  });

  // Validate StockMovement -> Part references
  stockMovements.forEach(movement => {
    if (!partIds.has(movement.partId)) {
      errors.push(`StockMovement ${movement.id} references non-existent part ID: ${movement.partId}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateAssetWorkOrderConsistency(assets: Asset[], workOrders: WorkOrder[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Count work orders per asset
  const workOrderCounts = new Map<string, number>();
  workOrders.forEach(wo => {
    const count = workOrderCounts.get(wo.assetId) || 0;
    workOrderCounts.set(wo.assetId, count + 1);
  });

  // Check if asset.workOrders matches actual count
  assets.forEach(asset => {
    const actualCount = workOrderCounts.get(asset.id) || 0;
    if (asset.workOrders !== actualCount) {
      warnings.push(`Asset ${asset.id} (${asset.name}) shows ${asset.workOrders} work orders but has ${actualCount} actual work orders`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Utility to fix asset work order counts
export function updateAssetWorkOrderCounts(assets: Asset[], workOrders: WorkOrder[]): Asset[] {
  const workOrderCounts = new Map<string, number>();
  workOrders.forEach(wo => {
    const count = workOrderCounts.get(wo.assetId) || 0;
    workOrderCounts.set(wo.assetId, count + 1);
  });

  return assets.map(asset => ({
    ...asset,
    workOrders: workOrderCounts.get(asset.id) || 0
  }));
}