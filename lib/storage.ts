// LocalStorage utility functions for data persistence

import { 
  Asset, 
  WorkOrder, 
  User, 
  Location, 
  Supplier,
  Request,
  MaintenanceEvent,
  Document,
  PurchaseOrder,
  Part,
  StockMovement,
  Category,
  mockAssets,
  mockWorkOrders,
  mockUsers,
  mockLocations,
  mockSuppliers,
  mockRequests,
  mockMaintenanceEvents,
  mockDocuments,
  mockPurchaseOrders,
  mockParts,
  mockStockMovements,
  mockCategories
} from "@/data/mockData";

import { shouldCreateNextRecurrence, createRecurringWorkOrder } from "./recurrence";

const STORAGE_KEYS = {
  ASSETS: 'asset_management_assets',
  WORK_ORDERS: 'asset_management_work_orders',
  USERS: 'asset_management_users',
  LOCATIONS: 'asset_management_locations',
  SUPPLIERS: 'asset_management_suppliers',
  REQUESTS: 'asset_management_requests',
  MAINTENANCE_EVENTS: 'asset_management_maintenance_events',
  DOCUMENTS: 'asset_management_documents',
  PURCHASE_ORDERS: 'asset_management_purchase_orders',
  PARTS: 'asset_management_parts',
  STOCK_MOVEMENTS: 'asset_management_stock_movements',
  CATEGORIES: 'asset_management_categories',
  CURRENT_USER: 'asset_management_current_user',
  INITIALIZED: 'asset_management_initialized'
};

// Initialize storage with mock data if first time
export function initializeStorage(): void {
  if (typeof window === 'undefined') return;
  
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  
  if (!isInitialized) {
    // First time - populate with mock data
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(mockAssets));
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(mockWorkOrders));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(mockLocations));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(mockSuppliers));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(mockRequests));
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_EVENTS, JSON.stringify(mockMaintenanceEvents));
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(mockDocuments));
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(mockPurchaseOrders));
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(mockParts));
    localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(mockStockMovements));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(mockCategories));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(mockUsers[0])); // David Luchetta as default
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

// Generic storage functions
function getFromStorage<T>(key: string, fallback: T[] = []): T[] {
  if (typeof window === 'undefined') return fallback;
  
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.error('Error parsing storage data:', error);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
}

// Asset functions
export function getAssets(): Asset[] {
  return getFromStorage<Asset>(STORAGE_KEYS.ASSETS, mockAssets);
}

export function saveAsset(asset: Asset): Asset[] {
  const assets = getAssets();
  const existingIndex = assets.findIndex(a => a.id === asset.id);
  
  if (existingIndex >= 0) {
    assets[existingIndex] = asset;
  } else {
    assets.push(asset);
  }
  
  saveToStorage(STORAGE_KEYS.ASSETS, assets);
  return assets;
}

export function deleteAsset(id: string): Asset[] {
  const assets = getAssets().filter(a => a.id !== id);
  saveToStorage(STORAGE_KEYS.ASSETS, assets);
  return assets;
}

// Work Order functions
export function getWorkOrders(): WorkOrder[] {
  return getFromStorage<WorkOrder>(STORAGE_KEYS.WORK_ORDERS, mockWorkOrders);
}

export function saveWorkOrder(workOrder: WorkOrder): WorkOrder[] {
  const workOrders = getWorkOrders();
  const existingIndex = workOrders.findIndex(wo => wo.id === workOrder.id);
  const previousWorkOrder = existingIndex >= 0 ? workOrders[existingIndex] : null;
  
  if (existingIndex >= 0) {
    workOrders[existingIndex] = workOrder;
  } else {
    workOrders.push(workOrder);
  }
  
  // Check if this work order was just completed and needs to create a recurring instance
  if (previousWorkOrder && 
      previousWorkOrder.status !== 'completed' && 
      workOrder.status === 'completed' && 
      shouldCreateNextRecurrence(workOrder)) {
    
    // Create the next recurring work order
    const nextDueDate = workOrder.recurrence?.nextDueDate;
    if (nextDueDate) {
      const nextWorkOrder = createRecurringWorkOrder(workOrder, nextDueDate);
      workOrders.push(nextWorkOrder);
      
      console.log(`✅ Created recurring work order: ${nextWorkOrder.title} (Due: ${nextDueDate})`);
    }
  }
  
  saveToStorage(STORAGE_KEYS.WORK_ORDERS, workOrders);
  return workOrders;
}

export function deleteWorkOrder(id: string): WorkOrder[] {
  const workOrders = getWorkOrders().filter(wo => wo.id !== id);
  saveToStorage(STORAGE_KEYS.WORK_ORDERS, workOrders);
  return workOrders;
}

export function updateWorkOrderDueDate(workOrderId: string, newDueDate: string): WorkOrder | null {
  const workOrders = getWorkOrders();
  const workOrderIndex = workOrders.findIndex(wo => wo.id === workOrderId);
  
  if (workOrderIndex >= 0) {
    const updatedWorkOrder = {
      ...workOrders[workOrderIndex],
      dueDate: newDueDate
    };
    workOrders[workOrderIndex] = updatedWorkOrder;
    saveToStorage(STORAGE_KEYS.WORK_ORDERS, workOrders);
    
    console.log(`🔄 Updated work order "${updatedWorkOrder.title}" due date to: ${newDueDate}`);
    return updatedWorkOrder;
  }
  
  console.warn(`⚠️ Work order with ID ${workOrderId} not found`);
  return null;
}

// User functions
export function getUsers(): User[] {
  return getFromStorage<User>(STORAGE_KEYS.USERS, mockUsers);
}

export function getCurrentUser(): User {
  if (typeof window === 'undefined') return mockUsers[0];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : mockUsers[0];
  } catch (error) {
    console.error('Error getting current user:', error);
    return mockUsers[0];
  }
}

export function setCurrentUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export function saveUser(user: User): User[] {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  saveToStorage(STORAGE_KEYS.USERS, users);
  return users;
}

export function deleteUser(id: string): User[] {
  const users = getUsers().filter(u => u.id !== id);
  saveToStorage(STORAGE_KEYS.USERS, users);
  return users;
}

// Location functions
export function getLocations(): Location[] {
  return getFromStorage<Location>(STORAGE_KEYS.LOCATIONS, mockLocations);
}

export function saveLocation(location: Location): Location[] {
  const locations = getLocations();
  const existingIndex = locations.findIndex(l => l.id === location.id);
  
  if (existingIndex >= 0) {
    locations[existingIndex] = location;
  } else {
    locations.push(location);
  }
  
  saveToStorage(STORAGE_KEYS.LOCATIONS, locations);
  return locations;
}

// Supplier functions
export function getSuppliers(): Supplier[] {
  return getFromStorage<Supplier>(STORAGE_KEYS.SUPPLIERS, mockSuppliers);
}

export function saveSupplier(supplier: Supplier): Supplier[] {
  const suppliers = getSuppliers();
  const existingIndex = suppliers.findIndex(s => s.id === supplier.id);
  
  if (existingIndex >= 0) {
    suppliers[existingIndex] = supplier;
  } else {
    suppliers.push(supplier);
  }
  
  saveToStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
  return suppliers;
}

// Utility function to clear all data (for reset)
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// Request functions
export function getRequests(): Request[] {
  return getFromStorage<Request>(STORAGE_KEYS.REQUESTS, mockRequests);
}

export function saveRequest(request: Request): Request[] {
  const requests = getRequests();
  const existingIndex = requests.findIndex(r => r.id === request.id);
  
  if (existingIndex >= 0) {
    requests[existingIndex] = request;
  } else {
    requests.push(request);
  }
  
  saveToStorage(STORAGE_KEYS.REQUESTS, requests);
  return requests;
}

export function deleteRequest(id: string): Request[] {
  const requests = getRequests().filter(r => r.id !== id);
  saveToStorage(STORAGE_KEYS.REQUESTS, requests);
  return requests;
}

// Maintenance Event functions
export function getMaintenanceEvents(): MaintenanceEvent[] {
  return getFromStorage<MaintenanceEvent>(STORAGE_KEYS.MAINTENANCE_EVENTS, mockMaintenanceEvents);
}

export function saveMaintenanceEvent(event: MaintenanceEvent): MaintenanceEvent[] {
  const events = getMaintenanceEvents();
  const existingIndex = events.findIndex(e => e.id === event.id);
  
  if (existingIndex >= 0) {
    events[existingIndex] = event;
  } else {
    events.push(event);
  }
  
  saveToStorage(STORAGE_KEYS.MAINTENANCE_EVENTS, events);
  return events;
}

export function deleteMaintenanceEvent(id: string): MaintenanceEvent[] {
  const events = getMaintenanceEvents().filter(e => e.id !== id);
  saveToStorage(STORAGE_KEYS.MAINTENANCE_EVENTS, events);
  return events;
}

// Document functions
export function getDocuments(): Document[] {
  return getFromStorage<Document>(STORAGE_KEYS.DOCUMENTS, mockDocuments);
}

export function saveDocument(document: Document): Document[] {
  const documents = getDocuments();
  const existingIndex = documents.findIndex(d => d.id === document.id);
  
  if (existingIndex >= 0) {
    documents[existingIndex] = document;
  } else {
    documents.push(document);
  }
  
  saveToStorage(STORAGE_KEYS.DOCUMENTS, documents);
  return documents;
}

export function deleteDocument(id: string): Document[] {
  const documents = getDocuments().filter(d => d.id !== id);
  saveToStorage(STORAGE_KEYS.DOCUMENTS, documents);
  return documents;
}

// Purchase Order functions
export function getPurchaseOrders(): PurchaseOrder[] {
  return getFromStorage<PurchaseOrder>(STORAGE_KEYS.PURCHASE_ORDERS, mockPurchaseOrders);
}

export function savePurchaseOrder(purchaseOrder: PurchaseOrder): PurchaseOrder[] {
  const purchaseOrders = getPurchaseOrders();
  const existingIndex = purchaseOrders.findIndex(po => po.id === purchaseOrder.id);
  
  if (existingIndex >= 0) {
    purchaseOrders[existingIndex] = purchaseOrder;
  } else {
    purchaseOrders.push(purchaseOrder);
  }
  
  saveToStorage(STORAGE_KEYS.PURCHASE_ORDERS, purchaseOrders);
  return purchaseOrders;
}

export function deletePurchaseOrder(id: string): PurchaseOrder[] {
  const purchaseOrders = getPurchaseOrders().filter(po => po.id !== id);
  saveToStorage(STORAGE_KEYS.PURCHASE_ORDERS, purchaseOrders);
  return purchaseOrders;
}

// Part functions
export function getParts(): Part[] {
  return getFromStorage<Part>(STORAGE_KEYS.PARTS, mockParts);
}

export function savePart(part: Part): Part[] {
  const parts = getParts();
  const existingIndex = parts.findIndex(p => p.id === part.id);
  
  if (existingIndex >= 0) {
    parts[existingIndex] = part;
  } else {
    parts.push(part);
  }
  
  saveToStorage(STORAGE_KEYS.PARTS, parts);
  return parts;
}

export function deletePart(id: string): Part[] {
  const parts = getParts().filter(p => p.id !== id);
  saveToStorage(STORAGE_KEYS.PARTS, parts);
  return parts;
}

// Stock Movement functions
export function getStockMovements(): StockMovement[] {
  return getFromStorage<StockMovement>(STORAGE_KEYS.STOCK_MOVEMENTS, mockStockMovements);
}

export function saveStockMovement(movement: StockMovement): StockMovement[] {
  const movements = getStockMovements();
  const existingIndex = movements.findIndex(m => m.id === movement.id);
  
  if (existingIndex >= 0) {
    movements[existingIndex] = movement;
  } else {
    movements.push(movement);
  }
  
  saveToStorage(STORAGE_KEYS.STOCK_MOVEMENTS, movements);
  return movements;
}

export function deleteStockMovement(id: string): StockMovement[] {
  const movements = getStockMovements().filter(m => m.id !== id);
  saveToStorage(STORAGE_KEYS.STOCK_MOVEMENTS, movements);
  return movements;
}

// Category functions
export function getCategories(): Category[] {
  return getFromStorage<Category>(STORAGE_KEYS.CATEGORIES, mockCategories);
}

export function saveCategory(category: Category): Category[] {
  const categories = getCategories();
  const existingIndex = categories.findIndex(c => c.id === category.id);
  
  if (existingIndex >= 0) {
    categories[existingIndex] = category;
  } else {
    categories.push(category);
  }
  
  saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
  return categories;
}

export function deleteCategory(id: string): Category[] {
  const categories = getCategories().filter(c => c.id !== id);
  saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
  return categories;
}

// Utility function to export all data
export function exportAllData() {
  return {
    assets: getAssets(),
    workOrders: getWorkOrders(),
    users: getUsers(),
    locations: getLocations(),
    suppliers: getSuppliers(),
    requests: getRequests(),
    maintenanceEvents: getMaintenanceEvents(),
    documents: getDocuments(),
    purchaseOrders: getPurchaseOrders(),
    parts: getParts(),
    stockMovements: getStockMovements(),
    categories: getCategories(),
    currentUser: getCurrentUser()
  };
}

// Utility function to validate data integrity
export function validateDataIntegrity() {
  const { validateDataConsistency } = require('./dataValidation');
  
  const data = exportAllData();
  return validateDataConsistency(
    data.assets,
    data.workOrders,
    data.requests,
    data.maintenanceEvents,
    data.documents,
    data.purchaseOrders,
    data.parts,
    data.stockMovements
  );
}

// Development helper to log data validation results
export function logDataValidation() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const validation = validateDataIntegrity();
    if (!validation.isValid || validation.warnings.length > 0) {
      console.group('🔍 Data Validation Results');
      if (validation.errors.length > 0) {
        console.error('❌ Errors:', validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.warn('⚠️  Warnings:', validation.warnings);
      }
      console.groupEnd();
    } else {
      console.log('✅ All data validation checks passed');
    }
  }
}