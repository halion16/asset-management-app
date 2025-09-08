// Mock Data per Asset Management System
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'technician' | 'supplier' | 'operator';
  avatar?: string;
  location?: string;
  department?: string;
  phone?: string;
  hireDate?: string;
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  lastLogin?: string;
  workOrdersAssigned?: number;
  workOrdersCompleted?: number;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  manager: string;
  assets: number;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  model: string;
  brand: string;
  status: 'operational' | 'maintenance' | 'down' | 'retired';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  assignedTo: string;
  purchaseDate: string;
  value: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  workOrders: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  bgColor: string;
  workOrdersCount: number;
  createdBy: string;
  createdDate: string;
}

export interface Comment {
  id: string;
  workOrderId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: string;
  type: 'comment' | 'status_change' | 'system';
  statusChange?: {
    from: string;
    to: string;
  };
}

export interface WorkOrder {
  id: string;
  orderNumber?: string;
  title: string;
  description: string;
  assetId: string;
  assetName: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'compliance' | 'safety';
  status: 'open' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  requestedBy: string;
  createdDate: string;
  dueDate: string;
  completedDate?: string;
  estimatedTime: string;
  actualTime?: string;
  location: string;
  supplier?: string;
  comments?: Comment[];
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number; // every X days/weeks/months/years
    nextDueDate?: string; // when next occurrence should be scheduled
    isRecurring: boolean;
    weeklyDays?: number[]; // for weekly: 0=Sunday, 1=Monday, ..., 6=Saturday
    monthlyDay?: number; // for monthly: day of month (1-31)
  };
  parentWorkOrderId?: string; // if this is generated from a recurring work order
  tags?: string[];
  categoryId?: string;
  procedure?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  rating: number;
  activeContracts: number;
  completedJobs: number;
  averageResponseTime: string;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  type: 'maintenance' | 'repair' | 'inspection' | 'installation' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'converted' | 'cancelled';
  requestedBy: string;
  requestedDate: string;
  requiredDate?: string;
  assetId?: string;
  assetName?: string;
  location: string;
  department: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNotes?: string;
  convertedToWorkOrderId?: string;
  estimatedCost?: number;
  attachments?: string[];
}

export interface MaintenanceEvent {
  id: string;
  title: string;
  description?: string;
  assetId: string;
  assetName: string;
  type: 'preventive' | 'inspection' | 'calibration' | 'cleaning';
  scheduledDate: string;
  scheduledTime?: string;
  duration: number; // in hours
  assignedTo: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    interval: number;
    endDate?: string;
  };
  completedDate?: string;
  notes?: string;
  workOrderId?: string;
  requiredResources?: string[]; // Array of resource IDs required for this event
}

export interface Document {
  id: string;
  name: string;
  type: 'manual' | 'certificate' | 'warranty' | 'report' | 'photo' | 'video' | 'other';
  category: 'asset' | 'workorder' | 'supplier' | 'safety' | 'compliance' | 'general';
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number; // in bytes
  mimeType: string;
  uploadedBy: string;
  uploadedDate: string;
  lastModified?: string;
  assetId?: string;
  assetName?: string;
  workOrderId?: string;
  supplierId?: string;
  tags: string[];
  version: string;
  isActive: boolean;
  expirationDate?: string;
  accessLevel: 'public' | 'restricted' | 'confidential';
  downloadCount: number;
}

export interface PurchaseOrderItem {
  id: string;
  partId: string;
  partName: string;
  partNumber: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  title: string;
  description?: string;
  status: 'draft' | 'sent' | 'approved' | 'partial' | 'received' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  supplierId: string;
  supplierName: string;
  supplierEmail?: string;
  supplierPhone?: string;
  requestedBy: string;
  approvedBy?: string;
  createdDate: string;
  approvedDate?: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  taxRate: number; // percentage
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  paymentTerms?: string;
  deliveryAddress?: string;
  notes?: string;
  attachments?: string[];
  workOrderId?: string;
  assetId?: string;
  departmentBudget?: string;
}

export interface Part {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  category: 'mechanical' | 'electrical' | 'hydraulic' | 'pneumatic' | 'consumable' | 'tool' | 'safety' | 'other';
  manufacturer?: string;
  supplierIds: string[];
  compatibleAssets: string[];
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitOfMeasure: string;
  unitCost: number;
  averageCost: number;
  location: string;
  binLocation?: string;
  isActive: boolean;
  isCritical: boolean;
  lastPurchaseDate?: string;
  lastPurchasePrice?: number;
  leadTime: number; // days
  shelfLife?: number; // days
  batchTracked: boolean;
  serialTracked: boolean;
  images?: string[];
  datasheetUrl?: string;
  createdDate: string;
  updatedDate: string;
}

export interface StockMovement {
  id: string;
  partId: string;
  partName: string;
  partNumber: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  reason: 'purchase' | 'consumption' | 'maintenance' | 'return' | 'damage' | 'expired' | 'audit' | 'transfer';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  fromLocation?: string;
  toLocation?: string;
  referenceType?: 'purchase_order' | 'work_order' | 'maintenance_event' | 'manual';
  referenceId?: string;
  performedBy: string;
  date: string;
  notes?: string;
  batchNumber?: string;
  serialNumber?: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'David Luchetta',
    email: 'david.luchetta@company.com',
    role: 'admin',
    avatar: 'DL',
    location: 'Franciocorta',
    department: 'IT & Operations',
    phone: '+39 030 123456',
    hireDate: '2020-01-15',
    status: 'active',
    permissions: ['all'],
    lastLogin: '2024-10-08T09:30:00Z',
    workOrdersAssigned: 15,
    workOrdersCompleted: 142
  },
  {
    id: '2',
    name: 'Marco Rossi',
    email: 'marco.rossi@company.com',
    role: 'manager',
    avatar: 'MR',
    location: 'Milano',
    department: 'Facilities Management',
    phone: '+39 02 987654',
    hireDate: '2021-03-20',
    status: 'active',
    permissions: ['view_all', 'edit_workorders', 'manage_assets', 'view_reports'],
    lastLogin: '2024-10-08T08:15:00Z',
    workOrdersAssigned: 8,
    workOrdersCompleted: 67
  },
  {
    id: '3',
    name: 'Giulia Bianchi',
    email: 'giulia.bianchi@company.com',
    role: 'technician',
    avatar: 'GB',
    location: 'Franciocorta',
    department: 'Maintenance',
    phone: '+39 030 555777',
    hireDate: '2022-06-10',
    status: 'active',
    permissions: ['view_workorders', 'edit_assigned_workorders', 'view_assets'],
    lastLogin: '2024-10-08T07:45:00Z',
    workOrdersAssigned: 12,
    workOrdersCompleted: 89
  },
  {
    id: '4',
    name: 'Luca Ferrari',
    email: 'luca.ferrari@company.com',
    role: 'technician',
    avatar: 'LF',
    location: 'Bergamo',
    department: 'Maintenance',
    phone: '+39 035 444888',
    hireDate: '2023-02-14',
    status: 'active',
    permissions: ['view_workorders', 'edit_assigned_workorders', 'view_assets'],
    lastLogin: '2024-10-07T16:22:00Z',
    workOrdersAssigned: 6,
    workOrdersCompleted: 34
  },
  {
    id: '5',
    name: 'Anna Verdi',
    email: 'anna.verdi@company.com',
    role: 'operator',
    avatar: 'AV',
    location: 'Milano',
    department: 'Operations',
    phone: '+39 02 333222',
    hireDate: '2023-09-01',
    status: 'active',
    permissions: ['view_workorders', 'create_requests'],
    lastLogin: '2024-10-08T10:10:00Z',
    workOrdersAssigned: 2,
    workOrdersCompleted: 8
  },
  {
    id: '6',
    name: 'Roberto Blu',
    email: 'roberto.blu@company.com',
    role: 'manager',
    avatar: 'RB',
    location: 'Bergamo',
    department: 'Operations',
    phone: '+39 035 666999',
    hireDate: '2019-11-30',
    status: 'inactive',
    permissions: ['view_all', 'edit_workorders', 'manage_assets'],
    lastLogin: '2024-09-25T14:30:00Z',
    workOrdersAssigned: 0,
    workOrdersCompleted: 156
  }
];

// Permission system
export const PERMISSIONS = {
  ALL: 'all',
  VIEW_ALL: 'view_all',
  VIEW_WORKORDERS: 'view_workorders', 
  EDIT_WORKORDERS: 'edit_workorders',
  EDIT_ASSIGNED_WORKORDERS: 'edit_assigned_workorders',
  MANAGE_ASSETS: 'manage_assets',
  VIEW_ASSETS: 'view_assets',
  MANAGE_USERS: 'manage_users',
  VIEW_REPORTS: 'view_reports',
  CREATE_REQUESTS: 'create_requests',
  MANAGE_SUPPLIERS: 'manage_suppliers'
};

export const ROLE_PERMISSIONS = {
  admin: [PERMISSIONS.ALL],
  manager: [
    PERMISSIONS.VIEW_ALL, 
    PERMISSIONS.EDIT_WORKORDERS, 
    PERMISSIONS.MANAGE_ASSETS, 
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_SUPPLIERS
  ],
  technician: [
    PERMISSIONS.VIEW_WORKORDERS, 
    PERMISSIONS.EDIT_ASSIGNED_WORKORDERS, 
    PERMISSIONS.VIEW_ASSETS
  ],
  operator: [
    PERMISSIONS.VIEW_WORKORDERS, 
    PERMISSIONS.CREATE_REQUESTS
  ],
  supplier: [
    PERMISSIONS.VIEW_WORKORDERS
  ]
};

// Mock Locations
export const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Franciocorta',
    address: 'Via Principale 123, 25040 Corte Franca BS',
    manager: 'David Luchetta',
    assets: 45
  },
  {
    id: '2',
    name: 'Milano Centro',
    address: 'Via Brera 15, 20121 Milano MI',
    manager: 'Marco Rossi',
    assets: 32
  },
  {
    id: '3',
    name: 'Bergamo',
    address: 'Via Garibaldi 88, 24122 Bergamo BG',
    manager: 'Giulia Bianchi',
    assets: 28
  }
];

// Mock Assets
export const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Condizionatore Franciocorta',
    category: 'HVAC',
    serialNumber: 'AC-2023-001',
    model: 'Pro Climate 5000',
    brand: 'Daikin',
    status: 'maintenance',
    priority: 'medium',
    location: 'Franciocorta',
    assignedTo: 'Giulia Bianchi',
    purchaseDate: '2023-03-15',
    value: 2500,
    lastMaintenance: '2024-06-15',
    nextMaintenance: '2024-12-15',
    workOrders: 3
  },
  {
    id: '2',
    name: 'Server Rack Principal',
    category: 'IT',
    serialNumber: 'IT-2022-045',
    model: 'PowerEdge R750',
    brand: 'Dell',
    status: 'operational',
    priority: 'high',
    location: 'Milano Centro',
    assignedTo: 'Marco Rossi',
    purchaseDate: '2022-11-20',
    value: 15000,
    lastMaintenance: '2024-08-01',
    nextMaintenance: '2024-11-01',
    workOrders: 1
  },
  {
    id: '3',
    name: 'Muletto Magazzino',
    category: 'Vehicle',
    serialNumber: 'VH-2021-032',
    model: 'FG25N',
    brand: 'Toyota',
    status: 'down',
    priority: 'critical',
    location: 'Bergamo',
    assignedTo: 'Giulia Bianchi',
    purchaseDate: '2021-08-10',
    value: 35000,
    lastMaintenance: '2024-09-01',
    nextMaintenance: '2024-10-15',
    workOrders: 5
  },
  {
    id: '4',
    name: 'Sistema Ventilazione Uffici',
    category: 'HVAC',
    serialNumber: 'HVAC-2022-003',
    model: 'AirFlow Pro 3000',
    brand: 'Carrier',
    status: 'operational',
    priority: 'medium',
    location: 'Milano',
    assignedTo: 'David Luchetta',
    purchaseDate: '2022-05-20',
    value: 8500,
    lastMaintenance: '2024-08-15',
    nextMaintenance: '2024-11-15',
    workOrders: 2
  },
  {
    id: '5',
    name: 'Bilancia Industriale 500kg',
    category: 'Machinery',
    serialNumber: 'SC-2023-007',
    model: 'PrecisionScale 500',
    brand: 'Mettler Toledo',
    status: 'operational',
    priority: 'high',
    location: 'Produzione',
    assignedTo: 'Marco Rossi',
    purchaseDate: '2023-01-10',
    value: 12000,
    lastMaintenance: '2024-07-01',
    nextMaintenance: '2024-10-01',
    workOrders: 1
  },
  {
    id: '6',
    name: 'Nastro Trasportatore Linea A',
    category: 'Machinery',
    serialNumber: 'CNV-2021-015',
    model: 'ConveyorMax 2000',
    brand: 'FlexLink',
    status: 'down',
    priority: 'critical',
    location: 'Linea Produzione A',
    assignedTo: 'Giulia Bianchi',
    purchaseDate: '2021-03-15',
    value: 25000,
    lastMaintenance: '2024-09-15',
    nextMaintenance: '2024-10-10',
    workOrders: 3
  },
  {
    id: '7',
    name: 'Sistema Antincendio Principale',
    category: 'Safety',
    serialNumber: 'FIRE-2020-001',
    model: 'SafeGuard Pro',
    brand: 'Ansul',
    status: 'operational',
    priority: 'critical',
    location: 'Tutto lo stabilimento',
    assignedTo: 'David Luchetta',
    purchaseDate: '2020-12-01',
    value: 45000,
    lastMaintenance: '2024-06-01',
    nextMaintenance: '2024-12-01',
    workOrders: 2
  },
  {
    id: '8',
    name: 'Gruppo Elettrogeno 150kW',
    category: 'Electrical',
    serialNumber: 'GEN-2022-002',
    model: 'PowerGen 150',
    brand: 'Caterpillar',
    status: 'operational',
    priority: 'high',
    location: 'Sala Macchine',
    assignedTo: 'Marco Rossi',
    purchaseDate: '2022-08-01',
    value: 55000,
    lastMaintenance: '2024-07-15',
    nextMaintenance: '2024-10-15',
    workOrders: 1
  },
  {
    id: '9',
    name: 'Impianto Illuminazione',
    category: 'Electrical',
    serialNumber: 'LED-2023-004',
    model: 'EcoLight LED System',
    brand: 'Philips',
    status: 'operational',
    priority: 'low',
    location: 'Vari Reparti',
    assignedTo: 'Giulia Bianchi',
    purchaseDate: '2023-04-01',
    value: 18000,
    lastMaintenance: '2024-08-01',
    nextMaintenance: '2025-02-01',
    workOrders: 1
  },
  {
    id: '10',
    name: 'Chiller Raffreddamento',
    category: 'HVAC',
    serialNumber: 'CHL-2021-001',
    model: 'CoolMax 100kW',
    brand: 'York',
    status: 'operational',
    priority: 'medium',
    location: 'Centrale Termica',
    assignedTo: 'David Luchetta',
    purchaseDate: '2021-06-15',
    value: 32000,
    lastMaintenance: '2024-06-30',
    nextMaintenance: '2024-10-30',
    workOrders: 1
  }
];

// Mock Work Orders
export const mockWorkOrders: WorkOrder[] = [
  {
    id: '1',
    orderNumber: 'WO-2024-001',
    title: 'Manutenzione Ordinaria Condizionatori',
    description: 'Questo Ordine di lavoro si ripeterà in base al tempo.',
    assetId: '1',
    assetName: 'Condizionatore Franciocorta',
    type: 'preventive',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'David Luchetta',
    requestedBy: 'Mendimente',
    createdDate: '2024-10-08',
    dueDate: '2024-10-08',
    estimatedTime: '1h',
    location: 'Franciocorta',
    supplier: 'Ariel spa',
    comments: [
      {
        id: 'c1',
        workOrderId: '1',
        userId: '1',
        userName: 'David Luchetta',
        userAvatar: 'DL',
        message: 'Ha iniziato l\'avanzamento sull\'ordine di lavoro.',
        timestamp: '2024-10-08T20:48:00Z',
        type: 'status_change',
        statusChange: { from: 'open', to: 'in_progress' }
      },
      {
        id: 'c2', 
        workOrderId: '1',
        userId: '1',
        userName: 'David Luchetta',
        userAvatar: 'DL',
        message: 'Ha riaperto l\'ordine di lavoro.',
        timestamp: '2024-10-08T20:48:00Z',
        type: 'status_change',
        statusChange: { from: 'in_progress', to: 'open' }
      },
      {
        id: 'c3',
        workOrderId: '1', 
        userId: '1',
        userName: 'David Luchetta',
        userAvatar: 'DL',
        message: 'Ha messo l\'ordine di lavoro in attesa.',
        timestamp: '2024-10-08T21:18:00Z',
        type: 'status_change',
        statusChange: { from: 'open', to: 'on_hold' }
      },
      {
        id: 'c4',
        workOrderId: '1',
        userId: '1', 
        userName: 'David Luchetta',
        userAvatar: 'DL',
        message: 'test commento test',
        timestamp: '2024-10-08T22:05:00Z',
        type: 'comment'
      }
    ]
  },
  {
    id: '2',
    title: 'Riparazione Server',
    description: 'Problema di connettività alla rete principale',
    assetId: '2',
    assetName: 'Server Rack Principal',
    type: 'corrective',
    status: 'open',
    priority: 'high',
    assignedTo: 'Marco Rossi',
    requestedBy: 'IT Support',
    createdDate: '2024-10-07',
    dueDate: '2024-10-09',
    estimatedTime: '3h',
    location: 'Milano Centro'
  },
  {
    id: '3',
    title: 'Revisione Muletto',
    description: 'Revisione annuale obbligatoria per sicurezza',
    assetId: '3',
    assetName: 'Muletto Magazzino',
    type: 'preventive',
    status: 'completed',
    priority: 'critical',
    assignedTo: 'Giulia Bianchi',
    requestedBy: 'Responsabile Sicurezza',
    createdDate: '2024-09-15',
    dueDate: '2024-09-30',
    completedDate: '2024-09-28',
    estimatedTime: '4h',
    actualTime: '3h 45m',
    location: 'Bergamo',
    supplier: 'Toyota Service'
  },
  {
    id: '4',
    title: 'Sostituzione Filtri Aria',
    description: 'Sostituzione filtri dell\'impianto di ventilazione',
    assetId: '4',
    assetName: 'Sistema Ventilazione Uffici',
    type: 'preventive',
    status: 'open',
    priority: 'medium',
    assignedTo: 'David Luchetta',
    requestedBy: 'Facility Manager',
    createdDate: '2024-10-09',
    dueDate: '2024-10-15',
    estimatedTime: '2h',
    location: 'Milano'
  },
  {
    id: '5',
    title: 'Calibrazione Bilancia Industriale',
    description: 'Calibrazione annuale obbligatoria',
    assetId: '5',
    assetName: 'Bilancia Industriale 500kg',
    type: 'compliance',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'Marco Rossi',
    requestedBy: 'Quality Control',
    createdDate: '2024-10-08',
    dueDate: '2024-10-12',
    estimatedTime: '1h 30m',
    location: 'Produzione'
  },
  {
    id: '6',
    title: 'Riparazione Nastro Trasportatore',
    description: 'Sostituzione rullo danneggiato',
    assetId: '6',
    assetName: 'Nastro Trasportatore Linea A',
    type: 'corrective',
    status: 'open',
    priority: 'critical',
    assignedTo: 'Giulia Bianchi',
    requestedBy: 'Responsabile Produzione',
    createdDate: '2024-10-09',
    dueDate: '2024-10-10',
    estimatedTime: '4h',
    location: 'Linea Produzione A'
  },
  {
    id: '7',
    title: 'Verifica Impianto Antincendio',
    description: 'Controllo semestrale sistema antincendio',
    assetId: '7',
    assetName: 'Sistema Antincendio Principale',
    type: 'safety',
    status: 'scheduled',
    priority: 'high',
    assignedTo: 'David Luchetta',
    requestedBy: 'Responsabile Sicurezza',
    createdDate: '2024-10-09',
    dueDate: '2024-10-20',
    estimatedTime: '3h',
    location: 'Tutto lo stabilimento'
  },
  {
    id: '8',
    title: 'Manutenzione Gruppo Elettrogeno',
    description: 'Cambio olio e controllo batterie',
    assetId: '8',
    assetName: 'Gruppo Elettrogeno 150kW',
    type: 'preventive',
    status: 'open',
    priority: 'medium',
    assignedTo: 'Marco Rossi',
    requestedBy: 'Facility Manager',
    createdDate: '2024-10-09',
    dueDate: '2024-10-25',
    estimatedTime: '2h 30m',
    location: 'Sala Macchine'
  },
  {
    id: '9',
    title: 'Sostituzione Lampade LED',
    description: 'Sostituzione lampade guaste nei reparti',
    assetId: '9',
    assetName: 'Impianto Illuminazione',
    type: 'corrective',
    status: 'in_progress',
    priority: 'low',
    assignedTo: 'Giulia Bianchi',
    requestedBy: 'Operatori',
    createdDate: '2024-10-08',
    dueDate: '2024-10-18',
    estimatedTime: '1h',
    location: 'Vari Reparti'
  },
  {
    id: '10',
    title: 'Pulizia Condensatori Chiller',
    description: 'Pulizia e controllo efficienza condensatori',
    assetId: '10',
    assetName: 'Chiller Raffreddamento',
    type: 'preventive',
    status: 'scheduled',
    priority: 'medium',
    assignedTo: 'David Luchetta',
    requestedBy: 'Energy Manager',
    createdDate: '2024-10-09',
    dueDate: '2024-10-30',
    estimatedTime: '3h',
    location: 'Centrale Termica'
  }
];

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Ariel spa',
    email: 'info@arielspa.it',
    phone: '+39 030 123456',
    specialties: ['HVAC', 'Refrigeration', 'Air Conditioning'],
    rating: 4.5,
    activeContracts: 3,
    completedJobs: 47,
    averageResponseTime: '2h'
  },
  {
    id: '2',
    name: 'Toyota Service',
    email: 'service@toyota.it',
    phone: '+39 02 987654',
    specialties: ['Vehicles', 'Forklifts', 'Industrial Equipment'],
    rating: 4.8,
    activeContracts: 2,
    completedJobs: 156,
    averageResponseTime: '4h'
  },
  {
    id: '3',
    name: 'TechnoIT Solutions',
    email: 'support@technoit.com',
    phone: '+39 011 555777',
    specialties: ['IT Equipment', 'Servers', 'Network'],
    rating: 4.2,
    activeContracts: 1,
    completedJobs: 89,
    averageResponseTime: '1h 30m'
  }
];

// Mock Requests
export const mockRequests: Request[] = [
  {
    id: '1',
    title: 'Riparazione perdita acqua ufficio 3',
    description: 'Segnalata perdita d\'acqua dal soffitto dell\'ufficio 3. Possibile problema con tubature al piano superiore. Urge intervento per evitare danni agli equipaggiamenti informatici.',
    type: 'repair',
    priority: 'high',
    status: 'pending',
    requestedBy: 'Anna Verdi',
    requestedDate: '2024-10-07',
    requiredDate: '2024-10-09',
    location: 'Milano',
    department: 'Operations',
    estimatedCost: 500
  },
  {
    id: '2',
    title: 'Manutenzione preventiva generatore',
    description: 'Richiesta manutenzione preventiva trimestrale per il generatore di emergenza. Include controllo livelli, test automatismi e pulizia filtri.',
    type: 'maintenance',
    priority: 'medium',
    status: 'approved',
    requestedBy: 'Marco Rossi',
    requestedDate: '2024-10-05',
    requiredDate: '2024-10-15',
    assetId: '2',
    assetName: 'Generatore Emergenza',
    location: 'Milano',
    department: 'Facilities Management',
    reviewedBy: 'David Luchetta',
    reviewedDate: '2024-10-06',
    reviewNotes: 'Approvata. Programmare insieme alla manutenzione del sistema di ventilazione.',
    estimatedCost: 800
  },
  {
    id: '3',
    title: 'Installazione nuova stampante',
    description: 'Necessaria installazione di stampante multifunzione nel reparto HR. Include configurazione di rete e formazione personale.',
    type: 'installation',
    priority: 'low',
    status: 'converted',
    requestedBy: 'Anna Verdi',
    requestedDate: '2024-10-01',
    requiredDate: '2024-10-10',
    location: 'Franciocorta',
    department: 'Human Resources',
    reviewedBy: 'David Luchetta',
    reviewedDate: '2024-10-02',
    reviewNotes: 'Convertita in Work Order. Assegnata al team IT.',
    convertedToWorkOrderId: '4',
    estimatedCost: 1200
  },
  {
    id: '4',
    title: 'Ispezione sistema antincendio',
    description: 'Ispezione annuale obbligatoria del sistema antincendio. Controllo estintori, sirene e vie di fuga.',
    type: 'inspection',
    priority: 'high',
    status: 'pending',
    requestedBy: 'Roberto Blu',
    requestedDate: '2024-10-08',
    requiredDate: '2024-10-20',
    location: 'Bergamo',
    department: 'Operations',
    estimatedCost: 600
  },
  {
    id: '5',
    title: 'Riparazione porta automatica ingresso',
    description: 'La porta automatica dell\'ingresso principale si blocca frequentemente. I sensori sembrano non funzionare correttamente.',
    type: 'repair',
    priority: 'medium',
    status: 'rejected',
    requestedBy: 'Luca Ferrari',
    requestedDate: '2024-09-28',
    requiredDate: '2024-10-05',
    location: 'Franciocorta',
    department: 'Maintenance',
    reviewedBy: 'Marco Rossi',
    reviewedDate: '2024-09-30',
    reviewNotes: 'Richiesta respinta. La porta è ancora in garanzia. Contattare il fornitore direttamente.',
    estimatedCost: 300
  },
  {
    id: '6',
    title: 'Controllo sistema climatizzazione',
    description: 'Temperature irregolari in diversi uffici. Necessario controllo generale del sistema di climatizzazione.',
    type: 'maintenance',
    priority: 'medium',
    status: 'pending',
    requestedBy: 'Giulia Bianchi',
    requestedDate: '2024-10-08',
    requiredDate: '2024-10-12',
    assetId: '1',
    assetName: 'Condizionatore Franciocorta',
    location: 'Franciocorta',
    department: 'Maintenance',
    estimatedCost: 400
  }
];

// Mock Maintenance Events
export const mockMaintenanceEvents: MaintenanceEvent[] = [
  {
    id: '1',
    title: 'Manutenzione preventiva compressore',
    description: 'Controllo routine mensile del compressore aria principale',
    assetId: '1',
    assetName: 'Condizionatore Franciocorta',
    type: 'preventive',
    scheduledDate: '2024-02-20',
    scheduledTime: '09:00',
    duration: 2,
    assignedTo: 'Giulia Bianchi',
    status: 'scheduled',
    location: 'Franciocorta',
    priority: 'medium',
    recurrence: {
      type: 'monthly',
      interval: 1
    }
  },
  {
    id: '2',
    title: 'Ispezione nastro trasportatore',
    description: 'Verifica settimanale del nastro trasportatore B2',
    assetId: '2',
    assetName: 'Generatore Emergenza',
    type: 'inspection',
    scheduledDate: '2024-02-18',
    scheduledTime: '14:30',
    duration: 1,
    assignedTo: 'Luca Ferrari',
    status: 'in_progress',
    location: 'Milano',
    priority: 'high',
    recurrence: {
      type: 'weekly',
      interval: 1
    },
    notes: 'In corso: controllare tensione cinghia'
  },
  {
    id: '3',
    title: 'Pulizia filtri climatizzazione',
    description: 'Pulizia e sostituzione filtri impianto climatizzazione',
    assetId: '1',
    assetName: 'Condizionatore Franciocorta',
    type: 'cleaning',
    scheduledDate: '2024-02-15',
    scheduledTime: '08:00',
    duration: 3,
    assignedTo: 'Marco Rossi',
    status: 'completed',
    location: 'Franciocorta',
    priority: 'low',
    completedDate: '2024-02-15',
    notes: 'Completato. Filtri sostituiti e registrate letture.'
  },
  {
    id: '4',
    title: 'Calibrazione bilancia industriale',
    description: 'Calibrazione trimestrale della bilancia di precisione',
    assetId: '3',
    assetName: 'Server Dell R740',
    type: 'calibration',
    scheduledDate: '2024-02-25',
    scheduledTime: '10:00',
    duration: 4,
    assignedTo: 'Anna Verdi',
    status: 'scheduled',
    location: 'Milano',
    priority: 'high',
    recurrence: {
      type: 'quarterly',
      interval: 1
    }
  },
  {
    id: '5',
    title: 'Controllo gruppo elettrogeno',
    description: 'Test di funzionamento gruppo elettrogeno di emergenza',
    assetId: '2',
    assetName: 'Generatore Emergenza',
    type: 'inspection',
    scheduledDate: '2024-02-12',
    scheduledTime: '16:00',
    duration: 2,
    assignedTo: 'Giulia Bianchi',
    status: 'overdue',
    location: 'Milano',
    priority: 'critical',
    recurrence: {
      type: 'monthly',
      interval: 1
    }
  },
  {
    id: '6',
    title: 'Manutenzione carrello elevatore',
    description: 'Controllo oli e fluidi carrello elevatore E01',
    assetId: '4',
    assetName: 'Saldatrice TIG 200',
    type: 'preventive',
    scheduledDate: '2024-02-22',
    scheduledTime: '11:00',
    duration: 1.5,
    assignedTo: 'Luca Ferrari',
    status: 'scheduled',
    location: 'Bergamo',
    priority: 'medium',
    recurrence: {
      type: 'monthly',
      interval: 2
    }
  },
  {
    id: '7',
    title: 'Pulizia serbatoi acqua',
    description: 'Pulizia e sanificazione serbatoi acqua industriale',
    assetId: '5',
    assetName: 'Compressore Atlas Copco',
    type: 'cleaning',
    scheduledDate: '2024-03-01',
    scheduledTime: '07:00',
    duration: 6,
    assignedTo: 'Marco Rossi',
    status: 'scheduled',
    location: 'Franciocorta',
    priority: 'high',
    recurrence: {
      type: 'quarterly',
      interval: 1
    }
  },
  {
    id: '8',
    title: 'Ispezione impianto antincendio',
    description: 'Verifica semestrale impianto antincendio e sprinkler',
    assetId: '6',
    assetName: 'Ponte Sollevatore',
    type: 'inspection',
    scheduledDate: '2024-02-28',
    scheduledTime: '13:00',
    duration: 4,
    assignedTo: 'Giulia Bianchi',
    status: 'scheduled',
    location: 'Bergamo',
    priority: 'critical',
    recurrence: {
      type: 'quarterly',
      interval: 2
    }
  }
];

// Mock Documents
export const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Manuale Condizionatore Daikin Pro Climate 5000',
    type: 'manual',
    category: 'asset',
    description: 'Manuale utente e di installazione per condizionatore Daikin Pro Climate 5000',
    fileUrl: '/docs/daikin-pro-climate-5000-manual.pdf',
    fileName: 'daikin-pro-climate-5000-manual.pdf',
    fileSize: 2500000,
    mimeType: 'application/pdf',
    uploadedBy: 'David Luchetta',
    uploadedDate: '2024-01-15',
    assetId: '1',
    assetName: 'Condizionatore Franciocorta',
    tags: ['manuale', 'daikin', 'hvac', 'installazione'],
    version: '1.0',
    isActive: true,
    accessLevel: 'public',
    downloadCount: 15
  },
  {
    id: '2',
    name: 'Certificato Conformità Generatore Emergenza',
    type: 'certificate',
    category: 'asset',
    description: 'Certificato di conformità CE per generatore di emergenza',
    fileUrl: '/docs/generator-ce-certificate.pdf',
    fileName: 'generator-ce-certificate.pdf',
    fileSize: 850000,
    mimeType: 'application/pdf',
    uploadedBy: 'Marco Rossi',
    uploadedDate: '2024-01-20',
    assetId: '2',
    assetName: 'Generatore Emergenza',
    tags: ['certificato', 'ce', 'conformità', 'generatore'],
    version: '1.0',
    isActive: true,
    expirationDate: '2027-01-20',
    accessLevel: 'restricted',
    downloadCount: 8
  },
  {
    id: '3',
    name: 'Garanzia Server Dell R740',
    type: 'warranty',
    category: 'asset',
    description: 'Certificato di garanzia estesa per server Dell PowerEdge R740',
    fileUrl: '/docs/dell-r740-warranty.pdf',
    fileName: 'dell-r740-warranty.pdf',
    fileSize: 1200000,
    mimeType: 'application/pdf',
    uploadedBy: 'Anna Verdi',
    uploadedDate: '2024-02-01',
    assetId: '3',
    assetName: 'Server Dell R740',
    tags: ['garanzia', 'dell', 'server', 'estesa'],
    version: '1.0',
    isActive: true,
    expirationDate: '2027-02-01',
    accessLevel: 'restricted',
    downloadCount: 3
  },
  {
    id: '4',
    name: 'Report Manutenzione Saldatrice TIG',
    type: 'report',
    category: 'workorder',
    description: 'Report di manutenzione preventiva saldatrice TIG 200',
    fileUrl: '/docs/welding-maintenance-report-jan2024.pdf',
    fileName: 'welding-maintenance-report-jan2024.pdf',
    fileSize: 650000,
    mimeType: 'application/pdf',
    uploadedBy: 'Giulia Bianchi',
    uploadedDate: '2024-01-28',
    workOrderId: '3',
    tags: ['report', 'manutenzione', 'saldatrice', 'tig'],
    version: '1.0',
    isActive: true,
    accessLevel: 'public',
    downloadCount: 12
  },
  {
    id: '5',
    name: 'Foto Danneggiamento Ponte Sollevatore',
    type: 'photo',
    category: 'workorder',
    description: 'Documentazione fotografica del danneggiamento rilevato al ponte sollevatore',
    fileUrl: '/docs/lift-damage-photos.zip',
    fileName: 'lift-damage-photos.zip',
    fileSize: 3500000,
    mimeType: 'application/zip',
    uploadedBy: 'Luca Ferrari',
    uploadedDate: '2024-02-05',
    assetId: '6',
    assetName: 'Ponte Sollevatore',
    tags: ['foto', 'danneggiamento', 'ponte', 'ispezione'],
    version: '1.0',
    isActive: true,
    accessLevel: 'public',
    downloadCount: 7
  },
  {
    id: '6',
    name: 'Contratto Manutenzione Ariel SPA',
    type: 'other',
    category: 'supplier',
    description: 'Contratto annuale per servizi di manutenzione HVAC con Ariel SPA',
    fileUrl: '/docs/ariel-spa-contract-2024.pdf',
    fileName: 'ariel-spa-contract-2024.pdf',
    fileSize: 1800000,
    mimeType: 'application/pdf',
    uploadedBy: 'David Luchetta',
    uploadedDate: '2024-01-10',
    supplierId: '1',
    tags: ['contratto', 'ariel', 'manutenzione', 'hvac'],
    version: '1.0',
    isActive: true,
    expirationDate: '2024-12-31',
    accessLevel: 'confidential',
    downloadCount: 5
  },
  {
    id: '7',
    name: 'Procedura Sicurezza Impianto Antincendio',
    type: 'manual',
    category: 'safety',
    description: 'Procedura operativa per la gestione dell\'impianto antincendio in emergenza',
    fileUrl: '/docs/fire-safety-procedure.pdf',
    fileName: 'fire-safety-procedure.pdf',
    fileSize: 950000,
    mimeType: 'application/pdf',
    uploadedBy: 'Marco Rossi',
    uploadedDate: '2024-01-25',
    tags: ['sicurezza', 'antincendio', 'emergenza', 'procedura'],
    version: '2.1',
    isActive: true,
    lastModified: '2024-02-10',
    accessLevel: 'public',
    downloadCount: 45
  },
  {
    id: '8',
    name: 'Certificato Calibrazione Bilancia Industriale',
    type: 'certificate',
    category: 'compliance',
    description: 'Certificato di calibrazione annuale per bilancia industriale BI-100',
    fileUrl: '/docs/scale-calibration-cert-2024.pdf',
    fileName: 'scale-calibration-cert-2024.pdf',
    fileSize: 750000,
    mimeType: 'application/pdf',
    uploadedBy: 'Anna Verdi',
    uploadedDate: '2024-02-12',
    tags: ['calibrazione', 'bilancia', 'certificato', 'metrologia'],
    version: '1.0',
    isActive: true,
    expirationDate: '2025-02-12',
    accessLevel: 'restricted',
    downloadCount: 2
  },
  {
    id: '9',
    name: 'Video Procedura Manutenzione Compressore',
    type: 'video',
    category: 'general',
    description: 'Video tutorial per la manutenzione ordinaria del compressore Atlas Copco',
    fileUrl: '/docs/compressor-maintenance-tutorial.mp4',
    fileName: 'compressor-maintenance-tutorial.mp4',
    fileSize: 15500000,
    mimeType: 'video/mp4',
    uploadedBy: 'Giulia Bianchi',
    uploadedDate: '2024-02-08',
    assetId: '5',
    assetName: 'Compressore Atlas Copco',
    tags: ['video', 'tutorial', 'compressore', 'manutenzione'],
    version: '1.0',
    isActive: true,
    accessLevel: 'public',
    downloadCount: 23
  },
  {
    id: '10',
    name: 'Scheda Tecnica Carrello Elevatore Toyota',
    type: 'manual',
    category: 'asset',
    description: 'Specifiche tecniche e scheda prodotto del carrello elevatore Toyota 7FBMF25',
    fileUrl: '/docs/toyota-forklift-datasheet.pdf',
    fileName: 'toyota-forklift-datasheet.pdf',
    fileSize: 1100000,
    mimeType: 'application/pdf',
    uploadedBy: 'Roberto Blu',
    uploadedDate: '2024-01-30',
    tags: ['scheda', 'tecnica', 'toyota', 'carrello'],
    version: '1.0',
    isActive: true,
    accessLevel: 'public',
    downloadCount: 9
  }
];

// Mock Purchase Orders
export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    orderNumber: 'PO-2024-001',
    title: 'Parti di ricambio HVAC - Manutenzione trimestrale',
    description: 'Ordine per filtri aria e componenti sistema climatizzazione',
    status: 'approved',
    priority: 'medium',
    supplierId: '1',
    supplierName: 'Ariel spa',
    supplierEmail: 'orders@arielspa.it',
    supplierPhone: '+39 030 123456',
    requestedBy: 'Marco Rossi',
    approvedBy: 'David Luchetta',
    createdDate: '2024-02-10',
    approvedDate: '2024-02-12',
    expectedDelivery: '2024-02-20',
    items: [
      {
        id: '1',
        partId: '1',
        partName: 'Filtro aria HEPA H13',
        partNumber: 'FLT-HEPA-H13-001',
        description: 'Filtro aria ad alta efficienza per climatizzatori',
        quantity: 6,
        unitPrice: 45.50,
        totalPrice: 273.00,
        notes: 'Compatibile con modello Daikin Pro Climate'
      },
      {
        id: '2',
        partId: '2',
        partName: 'Valvola termostatica',
        partNumber: 'VLV-TERM-001',
        description: 'Valvola di regolazione temperatura',
        quantity: 2,
        unitPrice: 89.90,
        totalPrice: 179.80
      }
    ],
    subtotal: 452.80,
    tax: 99.62,
    taxRate: 22,
    shipping: 15.00,
    discount: 0,
    total: 567.42,
    currency: 'EUR',
    paymentTerms: '30 giorni fine mese',
    deliveryAddress: 'Via Principale 123, 25040 Corte Franca BS',
    departmentBudget: 'Facilities Management'
  },
  {
    id: '2',
    orderNumber: 'PO-2024-002',
    title: 'Ricambi generatore emergenza',
    description: 'Parti per manutenzione straordinaria generatore',
    status: 'sent',
    priority: 'high',
    supplierId: '2',
    supplierName: 'TechPower Systems',
    supplierEmail: 'sales@techpower.it',
    requestedBy: 'Giulia Bianchi',
    createdDate: '2024-02-15',
    expectedDelivery: '2024-02-25',
    items: [
      {
        id: '3',
        partId: '3',
        partName: 'Kit cinghie distribuzione',
        partNumber: 'KIT-BELT-GEN-001',
        description: 'Set completo cinghie per generatore 50kW',
        quantity: 1,
        unitPrice: 245.00,
        totalPrice: 245.00
      },
      {
        id: '4',
        partId: '4',
        partName: 'Olio motore SAE 15W-40',
        partNumber: 'OIL-15W40-20L',
        description: 'Olio motore per generatori diesel',
        quantity: 2,
        unitPrice: 78.50,
        totalPrice: 157.00
      }
    ],
    subtotal: 402.00,
    tax: 88.44,
    taxRate: 22,
    shipping: 25.00,
    discount: 20.00,
    total: 495.44,
    currency: 'EUR',
    paymentTerms: '60 giorni data fattura',
    deliveryAddress: 'Via Brera 15, 20121 Milano MI',
    departmentBudget: 'Maintenance',
    workOrderId: '2'
  },
  {
    id: '3',
    orderNumber: 'PO-2024-003',
    title: 'Componenti elettrici server room',
    description: 'UPS e componenti elettrici per server room',
    status: 'draft',
    priority: 'low',
    supplierId: '3',
    supplierName: 'TechnoIT Solutions',
    supplierEmail: 'procurement@technoit.com',
    requestedBy: 'Anna Verdi',
    createdDate: '2024-02-18',
    expectedDelivery: '2024-03-05',
    items: [
      {
        id: '5',
        partId: '5',
        partName: 'UPS 1500VA',
        partNumber: 'UPS-1500VA-001',
        description: 'Gruppo di continuità per server',
        quantity: 3,
        unitPrice: 189.00,
        totalPrice: 567.00
      }
    ],
    subtotal: 567.00,
    tax: 124.74,
    taxRate: 22,
    shipping: 0,
    discount: 0,
    total: 691.74,
    currency: 'EUR',
    departmentBudget: 'IT'
  },
  {
    id: '4',
    orderNumber: 'PO-2024-004',
    title: 'Materiali di consumo officina',
    description: 'Elettrodi, dischi da taglio e materiali consumo',
    status: 'partial',
    priority: 'medium',
    supplierId: '1',
    supplierName: 'Ariel spa',
    requestedBy: 'Luca Ferrari',
    approvedBy: 'David Luchetta',
    createdDate: '2024-02-05',
    approvedDate: '2024-02-06',
    expectedDelivery: '2024-02-15',
    actualDelivery: '2024-02-14',
    items: [
      {
        id: '6',
        partId: '6',
        partName: 'Elettrodi saldatura 3.2mm',
        partNumber: 'ELE-WELD-3.2-001',
        description: 'Elettrodi rutilici per saldatura generale',
        quantity: 50,
        unitPrice: 0.85,
        totalPrice: 42.50,
        receivedQuantity: 50
      },
      {
        id: '7',
        partId: '7',
        partName: 'Dischi da taglio 115mm',
        partNumber: 'DSC-CUT-115-001',
        description: 'Dischi abrasivi per smerigliatrice',
        quantity: 20,
        unitPrice: 2.15,
        totalPrice: 43.00,
        receivedQuantity: 15
      }
    ],
    subtotal: 85.50,
    tax: 18.81,
    taxRate: 22,
    shipping: 8.00,
    discount: 5.00,
    total: 107.31,
    currency: 'EUR',
    paymentTerms: '30 giorni fine mese',
    deliveryAddress: 'Via Garibaldi 88, 24122 Bergamo BG',
    departmentBudget: 'Maintenance'
  }
];

// Mock Parts
export const mockParts: Part[] = [
  {
    id: '1',
    partNumber: 'FLT-HEPA-H13-001',
    name: 'Filtro aria HEPA H13',
    description: 'Filtro aria ad alta efficienza per sistemi HVAC, efficienza 99.95%',
    category: 'mechanical',
    manufacturer: 'Daikin',
    supplierIds: ['1'],
    compatibleAssets: ['1'],
    currentStock: 12,
    minStock: 4,
    maxStock: 20,
    reorderPoint: 6,
    reorderQuantity: 10,
    unitOfMeasure: 'pz',
    unitCost: 45.50,
    averageCost: 44.80,
    location: 'Magazzino A - Scaffale 12',
    binLocation: 'A12-B3',
    isActive: true,
    isCritical: true,
    lastPurchaseDate: '2024-02-10',
    lastPurchasePrice: 45.50,
    leadTime: 7,
    shelfLife: 1095, // 3 years
    batchTracked: false,
    serialTracked: false,
    createdDate: '2024-01-15',
    updatedDate: '2024-02-10'
  },
  {
    id: '2',
    partNumber: 'VLV-TERM-001',
    name: 'Valvola termostatica',
    description: 'Valvola di regolazione temperatura per impianti HVAC',
    category: 'mechanical',
    manufacturer: 'Honeywell',
    supplierIds: ['1', '2'],
    compatibleAssets: ['1'],
    currentStock: 5,
    minStock: 2,
    maxStock: 10,
    reorderPoint: 3,
    reorderQuantity: 6,
    unitOfMeasure: 'pz',
    unitCost: 89.90,
    averageCost: 87.45,
    location: 'Magazzino A - Scaffale 8',
    binLocation: 'A8-C2',
    isActive: true,
    isCritical: false,
    lastPurchaseDate: '2024-02-10',
    lastPurchasePrice: 89.90,
    leadTime: 14,
    batchTracked: false,
    serialTracked: true,
    createdDate: '2024-01-18',
    updatedDate: '2024-02-10'
  },
  {
    id: '3',
    partNumber: 'KIT-BELT-GEN-001',
    name: 'Kit cinghie distribuzione',
    description: 'Set completo cinghie per generatore 50kW',
    category: 'mechanical',
    manufacturer: 'Gates',
    supplierIds: ['2'],
    compatibleAssets: ['2'],
    currentStock: 0,
    minStock: 1,
    maxStock: 3,
    reorderPoint: 1,
    reorderQuantity: 2,
    unitOfMeasure: 'kit',
    unitCost: 245.00,
    averageCost: 240.00,
    location: 'Magazzino B - Scaffale 5',
    binLocation: 'B5-A1',
    isActive: true,
    isCritical: true,
    leadTime: 10,
    batchTracked: false,
    serialTracked: false,
    createdDate: '2024-01-20',
    updatedDate: '2024-02-15'
  },
  {
    id: '4',
    partNumber: 'OIL-15W40-20L',
    name: 'Olio motore SAE 15W-40',
    description: 'Olio motore per generatori diesel, latta 20L',
    category: 'consumable',
    manufacturer: 'Shell',
    supplierIds: ['1', '2'],
    compatibleAssets: ['2'],
    currentStock: 8,
    minStock: 3,
    maxStock: 15,
    reorderPoint: 5,
    reorderQuantity: 8,
    unitOfMeasure: 'L',
    unitCost: 3.93, // per litro
    averageCost: 3.85,
    location: 'Magazzino C - Liquidi',
    binLocation: 'C1-OILS',
    isActive: true,
    isCritical: false,
    lastPurchaseDate: '2024-02-15',
    lastPurchasePrice: 78.50, // per latta 20L
    leadTime: 5,
    shelfLife: 1460, // 4 years
    batchTracked: true,
    serialTracked: false,
    createdDate: '2024-01-12',
    updatedDate: '2024-02-15'
  },
  {
    id: '5',
    partNumber: 'UPS-1500VA-001',
    name: 'UPS 1500VA',
    description: 'Gruppo di continuità per server e apparecchiature IT',
    category: 'electrical',
    manufacturer: 'APC',
    supplierIds: ['3'],
    compatibleAssets: ['3'],
    currentStock: 2,
    minStock: 1,
    maxStock: 5,
    reorderPoint: 2,
    reorderQuantity: 3,
    unitOfMeasure: 'pz',
    unitCost: 189.00,
    averageCost: 185.50,
    location: 'Magazzino D - Elettronica',
    binLocation: 'D3-UPS',
    isActive: true,
    isCritical: true,
    leadTime: 3,
    batchTracked: false,
    serialTracked: true,
    createdDate: '2024-01-25',
    updatedDate: '2024-02-18'
  },
  {
    id: '6',
    partNumber: 'ELE-WELD-3.2-001',
    name: 'Elettrodi saldatura 3.2mm',
    description: 'Elettrodi rutilici per saldatura generale, diametro 3.2mm',
    category: 'consumable',
    manufacturer: 'ESAB',
    supplierIds: ['1'],
    compatibleAssets: ['4'],
    currentStock: 150,
    minStock: 50,
    maxStock: 200,
    reorderPoint: 75,
    reorderQuantity: 100,
    unitOfMeasure: 'pz',
    unitCost: 0.85,
    averageCost: 0.82,
    location: 'Officina - Armadio saldatura',
    binLocation: 'OFF-WELD-001',
    isActive: true,
    isCritical: false,
    lastPurchaseDate: '2024-02-05',
    lastPurchasePrice: 0.85,
    leadTime: 2,
    shelfLife: 1825, // 5 years
    batchTracked: true,
    serialTracked: false,
    createdDate: '2024-01-08',
    updatedDate: '2024-02-14'
  }
];

// Mock Stock Movements
export const mockStockMovements: StockMovement[] = [
  {
    id: '1',
    partId: '1',
    partName: 'Filtro aria HEPA H13',
    partNumber: 'FLT-HEPA-H13-001',
    type: 'in',
    reason: 'purchase',
    quantity: 6,
    unitCost: 45.50,
    totalCost: 273.00,
    toLocation: 'Magazzino A - Scaffale 12',
    referenceType: 'purchase_order',
    referenceId: '1',
    performedBy: 'Marco Rossi',
    date: '2024-02-20',
    notes: 'Ricevimento ordine PO-2024-001'
  },
  {
    id: '2',
    partId: '1',
    partName: 'Filtro aria HEPA H13',
    partNumber: 'FLT-HEPA-H13-001',
    type: 'out',
    reason: 'maintenance',
    quantity: 2,
    fromLocation: 'Magazzino A - Scaffale 12',
    referenceType: 'maintenance_event',
    referenceId: '1',
    performedBy: 'Giulia Bianchi',
    date: '2024-02-22',
    notes: 'Sostituzione filtri condizionatore'
  },
  {
    id: '3',
    partId: '6',
    partName: 'Elettrodi saldatura 3.2mm',
    partNumber: 'ELE-WELD-3.2-001',
    type: 'in',
    reason: 'purchase',
    quantity: 50,
    unitCost: 0.85,
    totalCost: 42.50,
    toLocation: 'Officina - Armadio saldatura',
    referenceType: 'purchase_order',
    referenceId: '4',
    performedBy: 'Luca Ferrari',
    date: '2024-02-14',
    batchNumber: 'BATCH-2024-001',
    notes: 'Ricevimento parziale ordine PO-2024-004'
  },
  {
    id: '4',
    partId: '6',
    partName: 'Elettrodi saldatura 3.2mm',
    partNumber: 'ELE-WELD-3.2-001',
    type: 'out',
    reason: 'consumption',
    quantity: 15,
    fromLocation: 'Officina - Armadio saldatura',
    referenceType: 'work_order',
    referenceId: '3',
    performedBy: 'Luca Ferrari',
    date: '2024-02-16',
    batchNumber: 'BATCH-2024-001',
    notes: 'Consumo per riparazioni varie'
  },
  {
    id: '5',
    partId: '4',
    partName: 'Olio motore SAE 15W-40',
    partNumber: 'OIL-15W40-20L',
    type: 'adjustment',
    reason: 'audit',
    quantity: -2,
    fromLocation: 'Magazzino C - Liquidi',
    performedBy: 'Anna Verdi',
    date: '2024-02-18',
    notes: 'Correzione inventario dopo audit mensile'
  }
];

// Mock Categories
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Danni',
    description: 'Riparazioni e danni strutturali',
    icon: 'AlertTriangle',
    color: '#dc2626', // red-600
    bgColor: '#fef2f2', // red-50
    workOrdersCount: 8,
    createdBy: 'David Luchetta',
    createdDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Elettrico',
    description: 'Manutenzione sistemi elettrici',
    icon: 'Zap',
    color: '#eab308', // yellow-500
    bgColor: '#fefce8', // yellow-50
    workOrdersCount: 15,
    createdBy: 'David Luchetta',
    createdDate: '2024-01-15'
  },
  {
    id: '3',
    name: 'Ispezione',
    description: 'Controlli e verifiche periodiche',
    icon: 'Search',
    color: '#7c3aed', // violet-600
    bgColor: '#f5f3ff', // violet-50
    workOrdersCount: 12,
    createdBy: 'David Luchetta',
    createdDate: '2024-01-15'
  },
  {
    id: '4',
    name: 'Meccanico',
    description: 'Riparazioni meccaniche e macchinari',
    icon: 'Settings',
    color: '#dc2626', // red-600
    bgColor: '#fef2f2', // red-50
    workOrdersCount: 22,
    createdBy: 'David Luchetta',
    createdDate: '2024-01-15'
  },
  {
    id: '5',
    name: 'Preventivo',
    description: 'Manutenzione preventiva programmata',
    icon: 'Shield',
    color: '#16a34a', // green-600
    bgColor: '#f0fdf4', // green-50
    workOrdersCount: 35,
    createdBy: 'David Luchetta',
    createdDate: '2024-01-15'
  },
  {
    id: '6',
    name: 'Progetto',
    description: 'Progetti e implementazioni',
    icon: 'Briefcase',
    color: '#ea580c', // orange-600
    bgColor: '#fff7ed', // orange-50
    workOrdersCount: 6,
    createdBy: 'David Luchetta',
    createdDate: '2024-01-15'
  },
  {
    id: '7',
    name: 'Refrigerazione',
    description: 'Sistemi di raffreddamento e HVAC',
    icon: 'Thermometer',
    color: '#0ea5e9', // sky-500
    bgColor: '#f0f9ff', // sky-50
    workOrdersCount: 18,
    createdBy: 'David Luchetta',
    createdDate: '2024-01-15'
  },
  {
    id: '8',
    name: 'Sicurezza',
    description: 'Sistemi di sicurezza e antincendio',
    icon: 'Shield',
    color: '#059669', // emerald-600
    bgColor: '#ecfdf5', // emerald-50
    workOrdersCount: 9,
    createdBy: 'David Luchetta',
    createdDate: '2024-01-15'
  },
  {
    id: '9',
    name: 'Procedura operativa standard',
    description: 'Procedure operative standardizzate',
    icon: 'FileText',
    color: '#db2777', // pink-600
    bgColor: '#fdf2f8', // pink-50
    workOrdersCount: 4,
    createdBy: 'David Luchetta',
    createdDate: '2024-01-15'
  }
];

// Dashboard Stats
export const mockStats = {
  totalAssets: 105,
  activeWorkOrders: 12,
  overdueWorkOrders: 3,
  completedThisMonth: 28,
  totalValue: 1250000,
  maintenanceCosts: 45000,
  uptime: 96.5
};