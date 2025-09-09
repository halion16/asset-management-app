'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AssetForm from "@/components/AssetForm";
import SubAssetForm from "@/components/SubAssetForm";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import WorkOrderFormNew from "@/components/WorkOrderFormNew";
import { getAssets, saveAsset, deleteAsset, initializeStorage, saveWorkOrder, saveDocument, addSubAsset, getAssetHierarchy, updateExistingAssetsForHierarchy, getAssetPath, deleteAssetWithChildren } from "@/lib/storage";
import { Asset, WorkOrder, Document } from "@/data/mockData";
import { 
  Plus,
  PlusCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Package,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Edit,
  MoreHorizontal,
  MapPin,
  Calendar,
  Settings,
  FileText,
  Activity,
  X,
  QrCode,
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  Target,
  Gauge,
  PieChart,
  List,
  User,
  Thermometer,
  Zap,
  Bell,
  BarChart2,
  TrendingDown,
  Calculator,
  Sliders,
  Mail,
  Smartphone,
  Save,
  Trash2,
  Shield,
  Power,
  Layers
} from "lucide-react";

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>();
  const [showQRCode, setShowQRCode] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'analytics'>('list');
  const [newComment, setNewComment] = useState('');
  const [assetHistory, setAssetHistory] = useState<{[key: string]: any[]}>({});
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showSubAssetForm, setShowSubAssetForm] = useState(false);
  const [showSubAssetsList, setShowSubAssetsList] = useState(false);
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());
  const [programActiveTab, setProgramActiveTab] = useState<'settings' | 'forecast'>('settings');
  const [newDocument, setNewDocument] = useState({
    name: '',
    description: '',
    type: 'other' as const,
    category: 'asset' as const,
    tags: '',
    fileName: '',
    fileSize: 0,
    accessLevel: 'public'
  });
  const [assetSettings, setAssetSettings] = useState({
    maxOperatingHours: 2000,
    temperatureThreshold: 80,
    vibrationLimit: 5.0,
    maintenanceInterval: 90,
    notifyBeforeMaintenance: 7,
    autoCreateWorkOrders: true,
    criticalAlertsEnabled: true,
    emailNotifications: true,
    smsAlerts: false
  });
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  useEffect(() => {
    initializeStorage();
    loadAssets();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activePopover && !(event.target as Element).closest('[data-popover]')) {
        setActivePopover(null);
        setActiveSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePopover]);

  const loadAssets = () => {
    // Update existing assets for hierarchy support
    updateExistingAssetsForHierarchy();
    const assetsData = getAssetHierarchy();
    setAssets(assetsData);
    
    // Initialize asset history
    const history: {[key: string]: any[]} = {};
    assetsData.forEach(asset => {
      history[asset.id] = [
        {
          id: '1',
          type: 'created',
          title: 'Asset creato',
          description: 'Asset aggiunto al sistema',
          date: asset.purchaseDate,
          time: '10:00',
          user: 'Sistema',
          status: 'completed'
        },
        {
          id: '2',
          type: 'maintenance',
          title: 'Manutenzione preventiva',
          description: 'Controllo routine programmato',
          date: asset.lastMaintenance || '2024-01-15',
          time: '14:30',
          user: 'Mario Rossi',
          status: 'completed'
        },
        {
          id: '3',
          type: 'inspection',
          title: 'Ispezione sicurezza',
          description: 'Controllo conformità normative',
          date: '2024-01-20',
          time: '09:15',
          user: 'Anna Verdi',
          status: 'pending'
        }
      ];
    });
    setAssetHistory(history);
    
    // Select first asset by default
    if (assetsData.length > 0 && !selectedAsset) {
      setSelectedAsset(assetsData[0]);
    }
  };

  const addComment = (assetId: string) => {
    if (!newComment.trim()) return;
    
    const newHistoryItem = {
      id: Date.now().toString(),
      type: 'comment',
      title: 'Commento aggiunto',
      description: newComment,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      user: 'David Luchetta',
      status: 'completed'
    };
    
    setAssetHistory(prev => ({
      ...prev,
      [assetId]: [newHistoryItem, ...(prev[assetId] || [])]
    }));
    
    setNewComment('');
  };

  const addToHistory = (assetId: string, type: string, title: string, description: string) => {
    const newHistoryItem = {
      id: Date.now().toString(),
      type,
      title,
      description,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      user: 'David Luchetta',
      status: 'completed'
    };
    
    setAssetHistory(prev => ({
      ...prev,
      [assetId]: [newHistoryItem, ...(prev[assetId] || [])]
    }));
  };

  const handleCreateWorkOrder = (workOrder: WorkOrder) => {
    const newWorkOrder: WorkOrder = {
      ...workOrder,
      id: Date.now().toString(),
      assetId: selectedAsset?.id || '',
      assetName: selectedAsset?.name || '',
      location: selectedAsset?.location || '',
      createdDate: new Date().toISOString().split('T')[0],
      requestedBy: 'David Luchetta'
    };
    
    saveWorkOrder(newWorkOrder);
    setShowWorkOrderForm(false);
    
    // Add to asset history
    if (selectedAsset) {
      const historyItem = {
        id: Date.now().toString(),
        type: 'workorder',
        title: 'Ordine di Lavoro creato',
        description: `Creato: ${workOrder.title}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        user: 'David Luchetta',
        status: 'pending'
      };
      
      setAssetHistory(prev => ({
        ...prev,
        [selectedAsset.id]: [historyItem, ...(prev[selectedAsset.id] || [])]
      }));
    }
  };

  const handleCreateDocument = () => {
    if (!selectedAsset || !newDocument.name.trim()) return;
    
    const newDoc: Document = {
      id: Date.now().toString(),
      name: newDocument.name,
      description: newDocument.description,
      type: newDocument.type,
      category: newDocument.category,
      fileName: newDocument.fileName || `${newDocument.name}.pdf`,
      fileSize: newDocument.fileSize || 1024,
      fileUrl: `/uploads/${newDocument.fileName || newDocument.name}.pdf`,
      mimeType: 'application/pdf',
      uploadedDate: new Date().toISOString(),
      uploadedBy: 'David Luchetta',
      tags: newDocument.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      version: '1.0',
      downloadCount: 0,
      accessLevel: newDocument.accessLevel,
      isActive: true,
      assetId: selectedAsset.id,
      assetName: selectedAsset.name
    };
    
    saveDocument(newDoc);
    setShowDocumentForm(false);
    setNewDocument({
      name: '',
      description: '',
      type: 'other' as const,
      category: 'asset' as const,
      tags: '',
      fileName: '',
      fileSize: 0,
      accessLevel: 'public'
    });
    
    // Add to asset history
    const historyItem = {
      id: Date.now().toString(),
      type: 'document',
      title: 'Documento aggiunto',
      description: `Aggiunto: ${newDocument.name}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      user: 'David Luchetta',
      status: 'completed'
    };
    
    setAssetHistory(prev => ({
      ...prev,
      [selectedAsset.id]: [historyItem, ...(prev[selectedAsset.id] || [])]
    }));
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = searchTerm ? asset.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const matchesStatus = statusFilter === 'all' ? true : asset.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' ? true : asset.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSaveAsset = (asset: Asset) => {
    saveAsset(asset);
    loadAssets();
    setShowForm(false);
    setEditingAsset(undefined);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo asset?')) {
      deleteAsset(id);
      loadAssets();
      if (selectedAsset?.id === id) {
        setSelectedAsset(assets.length > 1 ? assets[0] : null);
      }
    }
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleCreateSubAsset = (subAsset: Asset) => {
    if (!selectedAsset) return;
    
    addSubAsset(selectedAsset.id, subAsset);
    loadAssets();
    setShowSubAssetForm(false);
    
    // Add to asset history
    const historyItem = {
      id: Date.now().toString(),
      type: 'subasset',
      title: 'Sotto-attrezzatura creata',
      description: `Creata: ${subAsset.name}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      user: 'David Luchetta',
      status: 'completed'
    };
    
    setAssetHistory(prev => ({
      ...prev,
      [selectedAsset.id]: [historyItem, ...(prev[selectedAsset.id] || [])]
    }));
  };

  const toggleAssetExpansion = (assetId: string) => {
    setExpandedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  const getVisibleAssets = () => {
    return filteredAssets.filter(asset => {
      // Show top-level assets always
      if (asset.level === 0) return true;
      
      // Show sub-assets only if their parents are expanded
      if (asset.parentId) {
        const parentPath = getAssetPath(asset.parentId);
        return parentPath.every(parent => expandedAssets.has(parent.id));
      }
      
      return true;
    });
  };

  const getSubAssets = (parentAssetId: string) => {
    return assets.filter(asset => asset.parentId === parentAssetId);
  };

  const handleShowSubAssets = (asset: Asset) => {
    if (asset.hasChildren) {
      setSelectedAsset(asset);
      setShowSubAssetsList(true);
    }
  };

  const handleQuickUpdateAsset = (assetId: string, updates: Partial<Asset>) => {
    const updatedAssets = assets.map(asset => 
      asset.id === assetId ? { ...asset, ...updates } : asset
    );
    setAssets(updatedAssets);
    
    // Update selected asset if it's the one being modified
    if (selectedAsset?.id === assetId) {
      setSelectedAsset({ ...selectedAsset, ...updates });
    }
    
    // Save to storage
    const updatedAsset = updatedAssets.find(a => a.id === assetId);
    if (updatedAsset) {
      saveAsset(updatedAsset);
    }
    
    setActivePopover(null);
    setActiveSubmenu(null);
  };

  const handleQuickAction = (action: string, asset: Asset, value?: any) => {
    const currentTime = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    
    switch (action) {
      case 'location':
        const oldLocation = asset.location;
        handleQuickUpdateAsset(asset.id, { location: value });
        addToHistory(
          asset.id, 
          'location', 
          'Ubicazione modificata', 
          `Ubicazione cambiata da "${oldLocation}" a "${value}"`
        );
        break;
      case 'priority':
        const oldPriority = asset.priority;
        const priorityLabels = { low: 'Bassa', medium: 'Media', high: 'Alta', critical: 'Critica' };
        handleQuickUpdateAsset(asset.id, { priority: value });
        addToHistory(
          asset.id, 
          'priority', 
          'Criticità modificata', 
          `Criticità cambiata da "${priorityLabels[oldPriority]}" a "${priorityLabels[value]}"`
        );
        break;
      case 'status':
        const oldStatus = asset.status;
        const statusLabels = { operational: 'Operativo', maintenance: 'Manutenzione', down: 'Fermo', retired: 'Dismesso' };
        handleQuickUpdateAsset(asset.id, { status: value });
        addToHistory(
          asset.id, 
          'status', 
          'Stato modificato', 
          `Stato cambiato da "${statusLabels[oldStatus]}" a "${statusLabels[value]}"`
        );
        break;
      case 'delete':
        if (confirm(`Sei sicuro di voler eliminare "${asset.name}"?`)) {
          addToHistory(
            asset.id, 
            'deleted', 
            'Asset eliminato', 
            `Asset "${asset.name}" eliminato dal sistema`
          );
          // Give a small delay to ensure history is updated before deletion
          setTimeout(() => {
            handleDeleteAsset(asset.id);
          }, 100);
        }
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-700 bg-green-100 border-green-200';
      case 'maintenance': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'down': return 'text-red-700 bg-red-100 border-red-200';
      case 'retired': return 'text-gray-700 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'operational': return 'Operativo';
      case 'maintenance': return 'Manutenzione';
      case 'down': return 'Fermo';
      case 'retired': return 'Dismesso';
      default: return status;
    }
  };

  // Asset Analytics Functions
  const getAssetAnalytics = () => {
    const totalAssets = assets.length;
    const operationalAssets = assets.filter(a => a.status === 'operational').length;
    const criticalAssets = assets.filter(a => a.status === 'down' || a.status === 'maintenance').length;
    const retiredAssets = assets.filter(a => a.status === 'retired').length;
    
    // Calculate total value and average uptime
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    const avgUptime = totalAssets > 0 ? Math.round((operationalAssets / totalAssets) * 100) : 0;
    
    // Estimate maintenance costs (mock calculation for demo)
    const maintenanceCostEstimate = assets
      .filter(a => a.status === 'maintenance')
      .reduce((sum, asset) => sum + (asset.value * 0.05), 0); // 5% of asset value
    
    // Category distribution
    const categoryStats = assets.reduce((acc, asset) => {
      acc[asset.category] = {
        count: (acc[asset.category]?.count || 0) + 1,
        value: (acc[asset.category]?.value || 0) + asset.value,
        operational: acc[asset.category]?.operational || 0,
        critical: acc[asset.category]?.critical || 0
      };
      
      if (asset.status === 'operational') {
        acc[asset.category].operational += 1;
      } else if (asset.status === 'down' || asset.status === 'maintenance') {
        acc[asset.category].critical += 1;
      }
      
      return acc;
    }, {} as Record<string, {count: number, value: number, operational: number, critical: number}>);
    
    // Business critical assets (high value or specific categories)
    const businessCriticalAssets = assets.filter(asset => 
      asset.value > 10000 || 
      ['IT', 'POS', 'Payment'].includes(asset.category) ||
      asset.name.toLowerCase().includes('pos') ||
      asset.name.toLowerCase().includes('payment') ||
      asset.name.toLowerCase().includes('server')
    );
    
    const criticalAssetsDown = businessCriticalAssets.filter(a => a.status === 'down').length;
    
    return {
      totalAssets,
      operationalAssets,
      criticalAssets,
      retiredAssets,
      totalValue,
      avgUptime,
      maintenanceCostEstimate,
      categoryStats,
      businessCriticalAssets: businessCriticalAssets.length,
      criticalAssetsDown
    };
  };

  const renderAnalyticsView = () => {
    const analytics = getAssetAnalytics();

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Asset Operativi</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.operationalAssets}</p>
                  <p className="text-xs text-gray-500">su {analytics.totalAssets} totali</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Asset Critici</p>
                  <p className="text-2xl font-bold text-orange-600">{analytics.criticalAssetsDown}</p>
                  <p className="text-xs text-gray-500">Business critical down</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Uptime Medio</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.avgUptime}%</p>
                  <p className="text-xs text-gray-500">Performance operativa</p>
                </div>
                <Gauge className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Costo Manutenzioni</p>
                  <p className="text-2xl font-bold text-purple-600">€{Math.round(analytics.maintenanceCostEstimate).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Stima corrente</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Distribution by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Asset per Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.categoryStats).map(([category, stats]) => {
                  const percentage = analytics.totalAssets > 0 ? Math.round((stats.count / analytics.totalAssets) * 100) : 0;
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <span className="font-medium text-sm">{category}</span>
                          <p className="text-xs text-gray-500">
                            Valore: €{stats.value.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold">{stats.count}</span>
                          {stats.critical > 0 && (
                            <p className="text-xs text-orange-600">{stats.critical} critici</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Business Critical Assets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Asset Business Critical
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">Asset Critici Fermi</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{analytics.criticalAssetsDown}</p>
                  <p className="text-xs text-red-600">Impatto elevato su business</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Totale Business Critical</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{analytics.businessCriticalAssets}</p>
                  <p className="text-xs text-blue-600">Asset ad alta priorità</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Valore Totale Asset</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">€{analytics.totalValue.toLocaleString()}</p>
                  <p className="text-xs text-green-600">Investimento complessivo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Impact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Impatto Business & Raccomandazioni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">🎯 Asset POS/Payment</h4>
                <p className="text-sm text-yellow-700 mb-2">
                  Asset critici per operazioni quotidiane
                </p>
                <div className="text-xs text-yellow-600">
                  • Priorità massima per manutenzione
                  <br />
                  • Impatto diretto su fatturato
                  <br />
                  • Backup necessario
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-2">💰 Asset Alto Valore</h4>
                <p className="text-sm text-purple-700 mb-2">
                  Macchinari e sistemi costosi
                </p>
                <div className="text-xs text-purple-600">
                  • Manutenzione preventiva essenziale
                  <br />
                  • Contratti assistenza consigliati
                  <br />
                  • Monitoraggio costante ROI
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">🛠️ Asset Supporto</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Arredi e attrezzature secondarie
                </p>
                <div className="text-xs text-gray-600">
                  • Manutenzione programmata
                  <br />
                  • Sostituzione su necessità
                  <br />
                  • Costo-beneficio ottimizzato
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Stats
  const stats = {
    total: assets.length,
    operational: assets.filter(a => a.status === 'operational').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length,
    down: assets.filter(a => a.status === 'down').length,
    totalValue: assets.reduce((sum, asset) => sum + asset.value, 0)
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Column - Assets List */}
      <div className="w-[480px] bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Attrezzature</h1>
              <p className="text-sm text-gray-600">
                {currentView === 'list' ? `${filteredAssets.length} asset trovati` : 'Panoramica Analytics'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              
              {currentView === 'list' && (
                <Button 
                  onClick={() => setShowForm(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nuova Attrezzatura
                </Button>
              )}
            </div>
          </div>

          {currentView === 'list' && (
            <>
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca asset..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 p-2 rounded text-center">
                  <div className="text-lg font-semibold text-gray-900">{stats.operational}</div>
                  <div className="text-xs text-gray-600">Operativi</div>
                </div>
                <div className="bg-gray-50 p-2 rounded text-center">
                  <div className="text-lg font-semibold text-gray-900">{stats.maintenance}</div>
                  <div className="text-xs text-gray-600">In Manutenzione</div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                >
                  <option value="all">Tutti</option>
                  <option value="operational">Operativo</option>
                  <option value="maintenance">Manutenzione</option>
                  <option value="down">Fermo</option>
                  <option value="retired">Dismesso</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                >
                  <option value="all">Categorie</option>
                  <option value="IT">IT</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Vehicle">Veicoli</option>
                  <option value="Machinery">Macchinari</option>
                </select>
              </div>
            </>
          )}
          
          {currentView === 'analytics' && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-blue-800">Vista Analytics</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 hover:bg-blue-100"
                  onClick={() => setCurrentView('list')}
                >
                  <List className="h-4 w-4 mr-1" />
                  Torna alla Lista
                </Button>
              </div>
              <p className="text-xs text-blue-600">
                Panoramica completa degli asset con metriche business e impatto operativo.
              </p>
            </div>
          )}
        </div>

        {/* Assets List */}
        {currentView === 'list' && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2">
              Ordina per: Nome
            </div>
            {getVisibleAssets().map((asset) => (
              <div
                key={asset.id}
                className={`relative mb-2 rounded-lg cursor-pointer transition-colors ${
                  selectedAsset?.id === asset.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
                style={{ marginLeft: `${asset.level * 16}px` }}
              >
                <div 
                  className="flex items-start gap-2 p-3"
                  onClick={() => setSelectedAsset(asset)}
                >
                  {/* Expansion Toggle */}
                  {asset.hasChildren ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAssetExpansion(asset.id);
                      }}
                      className="mt-0.5 p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {expandedAssets.has(asset.id) ? (
                        <ChevronDown className="h-3 w-3 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-gray-600" />
                      )}
                    </button>
                  ) : (
                    <div className="w-5 h-5">{/* Spacer for alignment */}</div>
                  )}
                  
                  {/* Asset Icon */}
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-sm font-medium ${
                    asset.level === 0 ? 'bg-blue-600' : 
                    asset.level === 1 ? 'bg-green-600' : 
                    'bg-purple-600'
                  }`}>
                    {asset.level === 0 ? asset.name.substring(0, 2).toUpperCase() : 
                     asset.level === 1 ? '•' : 
                     '◦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(asset.status)}`}>
                        {getStatusLabel(asset.status)}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                      {asset.name}
                    </h3>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>{asset.category} • {asset.location}</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>€{asset.value.toLocaleString()}</span>
                          <span className="text-blue-600">• {asset.brand}</span>
                        </div>
                        {asset.hasChildren && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowSubAssets(asset);
                            }}
                            className="p-1 rounded-full hover:bg-blue-100 transition-colors group"
                            title={`Visualizza sotto-attrezzature (${asset.childrenIds.length})`}
                          >
                            <Layers className="h-3.5 w-3.5 text-blue-600 group-hover:text-blue-700" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Menu */}
                <div className="absolute top-2 right-2" data-popover>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePopover(activePopover === asset.id ? null : asset.id);
                    }}
                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {/* Popover Menu */}
                  {activePopover === asset.id && (
                    <div className="absolute top-8 right-0 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px]" data-popover>
                      {/* Modifica Ubicazione */}
                      <div className="relative">
                        <button 
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 justify-between"
                          onClick={() => setActiveSubmenu(activeSubmenu === `${asset.id}-location` ? null : `${asset.id}-location`)}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Modifica Ubicazione
                          </div>
                          <ChevronDown className={`h-3 w-3 transition-transform ${activeSubmenu === `${asset.id}-location` ? 'rotate-180' : ''}`} />
                        </button>
                        {/* Submenu Ubicazione */}
                        {activeSubmenu === `${asset.id}-location` && (
                          <div className="ml-4 border-l border-gray-100 pl-2 py-1 relative">
                            <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 pr-2">
                              {[
                                'Milano - Sede Centrale',
                                'Milano - Deposito Nord',
                                'Milano - Filiale Centro', 
                                'Franciocorta - Stabilimento',
                                'Franciocorta - Magazzino A',
                                'Franciocorta - Magazzino B',
                                'Bergamo - Uffici',
                                'Bergamo - Laboratorio',
                                'Produzione - Linea 1',
                                'Produzione - Linea 2', 
                                'Produzione - Linea 3',
                                'Produzione - Area Controllo',
                                'Manutenzione - Officina',
                                'Manutenzione - Deposito Ricambi',
                                'Logistica - Carico/Scarico',
                                'Logistica - Spedizioni',
                                'Amministrazione - Piano Terra',
                                'Amministrazione - Primo Piano',
                                'IT - Server Room',
                                'IT - Ufficio Tecnico'
                              ].map(location => (
                                <button
                                  key={location}
                                  onClick={() => handleQuickAction('location', asset, location)}
                                  className="w-full px-3 py-1.5 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded transition-colors mb-0.5"
                                >
                                  {location}
                                </button>
                              ))}
                            </div>
                            {/* Scroll indicator */}
                            <div className="absolute bottom-0 right-2 text-xs text-gray-400 bg-white px-1 pointer-events-none">
                              ↕ scroll
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Modifica Criticità */}
                      <div className="relative">
                        <button 
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 justify-between"
                          onClick={() => setActiveSubmenu(activeSubmenu === `${asset.id}-priority` ? null : `${asset.id}-priority`)}
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Modifica Criticità
                          </div>
                          <ChevronDown className={`h-3 w-3 transition-transform ${activeSubmenu === `${asset.id}-priority` ? 'rotate-180' : ''}`} />
                        </button>
                        {/* Submenu Criticità */}
                        {activeSubmenu === `${asset.id}-priority` && (
                          <div className="ml-4 border-l border-gray-100 pl-2 py-1">
                            {[
                              { value: 'low', label: 'Bassa', color: 'text-green-600' },
                              { value: 'medium', label: 'Media', color: 'text-yellow-600' },
                              { value: 'high', label: 'Alta', color: 'text-orange-600' },
                              { value: 'critical', label: 'Critica', color: 'text-red-600' }
                            ].map(priority => (
                              <button
                                key={priority.value}
                                onClick={() => handleQuickAction('priority', asset, priority.value)}
                                className={`w-full px-3 py-1 text-left text-sm hover:bg-gray-50 ${priority.color}`}
                              >
                                {priority.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Modifica Stato */}
                      <div className="relative">
                        <button 
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 justify-between"
                          onClick={() => setActiveSubmenu(activeSubmenu === `${asset.id}-status` ? null : `${asset.id}-status`)}
                        >
                          <div className="flex items-center gap-2">
                            <Power className="h-4 w-4" />
                            Modifica Stato
                          </div>
                          <ChevronDown className={`h-3 w-3 transition-transform ${activeSubmenu === `${asset.id}-status` ? 'rotate-180' : ''}`} />
                        </button>
                        {/* Submenu Stato */}
                        {activeSubmenu === `${asset.id}-status` && (
                          <div className="ml-4 border-l border-gray-100 pl-2 py-1">
                            {[
                              { value: 'operational', label: 'Operativo', color: 'text-green-600' },
                              { value: 'maintenance', label: 'Manutenzione', color: 'text-orange-600' },
                              { value: 'down', label: 'Fermo', color: 'text-red-600' },
                              { value: 'retired', label: 'Dismesso', color: 'text-gray-600' }
                            ].map(status => (
                              <button
                                key={status.value}
                                onClick={() => handleQuickAction('status', asset, status.value)}
                                className={`w-full px-3 py-1 text-left text-sm hover:bg-gray-50 ${status.color}`}
                              >
                                {status.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-100 my-1"></div>

                      {/* Elimina */}
                      <button
                        onClick={() => handleQuickAction('delete', asset)}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Elimina
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredAssets.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Nessun asset trovato</p>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
      
      {/* Center Column - Asset Details */}
      <div className="flex-1 flex flex-col bg-white border-r border-gray-200">
        {currentView === 'analytics' ? (
          <div className="flex-1 overflow-y-auto p-6">
            {renderAnalyticsView()}
          </div>
        ) : selectedAsset ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {/* Breadcrumb Navigation */}
                  {selectedAsset.hierarchyPath && selectedAsset.hierarchyPath.length > 1 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      {getAssetPath(selectedAsset.id).map((pathAsset, index) => (
                        <div key={pathAsset.id} className="flex items-center gap-2">
                          {index > 0 && <ChevronRight className="h-3 w-3" />}
                          <button
                            onClick={() => setSelectedAsset(pathAsset)}
                            className={`hover:text-blue-600 transition-colors ${
                              pathAsset.id === selectedAsset.id ? 'text-blue-600 font-medium' : ''
                            }`}
                          >
                            {pathAsset.name}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedAsset.name}
                    </h2>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedAsset.status)}`}>
                      {getStatusLabel(selectedAsset.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedAsset.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Acquistato: {selectedAsset.purchaseDate}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    onClick={() => setCurrentView('analytics')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => handleEditAsset(selectedAsset)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              <div className="p-4 pb-6 space-y-4">
                {/* Details Section */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4 text-lg">Dettagli</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Nome Asset</label>
                      <div className="text-sm text-gray-900 font-medium">{selectedAsset.name}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1 flex items-center justify-between">
                        Stato
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowSubAssetForm(true)}
                            className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors group"
                            title="Crea sotto-Attrezzature"
                          >
                            <PlusCircle className="h-4.5 w-4.5 text-blue-600 group-hover:text-blue-700" />
                            <span className="text-sm text-blue-600 group-hover:text-blue-700 font-medium">Crea sotto-Attrezzature</span>
                          </button>
                          {selectedAsset.hasChildren && (
                            <button
                              onClick={() => handleShowSubAssets(selectedAsset)}
                              className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-green-100 transition-colors group"
                              title={`Visualizza sotto-attrezzature (${selectedAsset.childrenIds.length})`}
                            >
                              <Layers className="h-4.5 w-4.5 text-green-600 group-hover:text-green-700" />
                              <span className="text-sm text-green-600 group-hover:text-green-700 font-medium">Visualizza ({selectedAsset.childrenIds.length})</span>
                            </button>
                          )}
                        </div>
                      </label>
                      <div className={`inline-flex px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedAsset.status)}`}>
                        {getStatusLabel(selectedAsset.status)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Categoria</label>
                      <div className="text-sm text-gray-900">{selectedAsset.category}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Priorità</label>
                      <div className={`inline-flex px-2 py-1 rounded text-sm font-medium ${
                        selectedAsset.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        selectedAsset.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        selectedAsset.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedAsset.priority === 'critical' ? 'Critica' :
                         selectedAsset.priority === 'high' ? 'Alta' :
                         selectedAsset.priority === 'medium' ? 'Media' :
                         'Bassa'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Numero di Serie</label>
                      <div className="text-sm text-gray-900 font-mono">{selectedAsset.serialNumber}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Produttore/Modello</label>
                      <div className="text-sm text-gray-900">{selectedAsset.brand} {selectedAsset.model}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Valore</label>
                      <div className="text-sm text-gray-900 font-medium">€{selectedAsset.value.toLocaleString()}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Ubicazione</label>
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {selectedAsset.location}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Assegnato a</label>
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedAsset.assignedTo || 'Non assegnato'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Data Acquisto</label>
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedAsset.purchaseDate).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                    {selectedAsset.lastMaintenance && (
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Ultima Manutenzione</label>
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {new Date(selectedAsset.lastMaintenance).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                    )}
                    {selectedAsset.nextMaintenance && (
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Prossima Manutenzione</label>
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          {new Date(selectedAsset.nextMaintenance).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 text-lg">Statistiche</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded p-3">
                      <div className="text-sm text-blue-600 font-medium">Ordini Completati</div>
                      <div className="text-lg font-bold text-blue-900 mt-1">{selectedAsset.workOrders || 0}</div>
                    </div>
                    <div className="bg-green-50 rounded p-3">
                      <div className="text-sm text-green-600 font-medium">Stato Operativo</div>
                      <div className="text-lg font-bold text-green-900 mt-1">
                        {selectedAsset.status === 'operational' ? '✓ Attivo' : '⚠ Non operativo'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions & QR Code Combined */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4 text-lg">Azioni Rapide</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Button 
                      variant="outline" 
                      size="default" 
                      className="text-sm h-10"
                      onClick={() => setShowWorkOrderForm(true)}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Crea Ordine da Asset
                    </Button>
                    <Button 
                      variant="outline" 
                      size="default" 
                      className="text-sm h-10"
                      onClick={() => setShowProgramModal(true)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Programma
                    </Button>
                    <Button 
                      variant="outline" 
                      size="default" 
                      className="text-sm h-10"
                      onClick={() => setShowDocumentForm(true)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Documento
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => setShowQRCode(true)}
                      className="text-green-600 border-green-200 hover:bg-green-50 text-sm h-10"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Seleziona un Asset</h3>
              <p className="text-gray-500">Scegli un asset dalla lista per vedere i dettagli</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Timeline & Comments */}
      <div className="w-80 flex flex-col bg-gray-50">
        {selectedAsset ? (
          <>
            {/* Timeline Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <h3 className="font-medium text-gray-900">Cronologia Eventi</h3>
              <p className="text-sm text-gray-500 mt-1">Attività e commenti per {selectedAsset.name}</p>
            </div>

            {/* Add Comment */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Aggiungi un commento..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  rows={3}
                />
                <button
                  onClick={() => addComment(selectedAsset.id)}
                  disabled={!newComment.trim()}
                  className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Aggiungi Commento
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {(assetHistory[selectedAsset.id] || []).map((item, index) => (
                  <div key={item.id} className="relative">
                    {/* Timeline line */}
                    {index < (assetHistory[selectedAsset.id] || []).length - 1 && (
                      <div className="absolute left-4 top-10 w-px h-16 bg-gray-200" />
                    )}
                    
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                        item.type === 'created' ? 'bg-green-500' :
                        item.type === 'maintenance' ? 'bg-blue-500' :
                        item.type === 'inspection' ? 'bg-orange-500' :
                        item.type === 'comment' ? 'bg-purple-500' :
                        item.type === 'workorder' ? 'bg-indigo-500' :
                        item.type === 'document' ? 'bg-cyan-500' :
                        item.type === 'location' ? 'bg-teal-500' :
                        item.type === 'priority' ? 'bg-yellow-500' :
                        item.type === 'status' ? 'bg-blue-600' :
                        item.type === 'deleted' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}>
                        {item.type === 'created' ? '✓' :
                         item.type === 'maintenance' ? '⚙' :
                         item.type === 'inspection' ? '👁' :
                         item.type === 'comment' ? '💬' :
                         item.type === 'workorder' ? '📋' :
                         item.type === 'document' ? '📄' :
                         item.type === 'location' ? '📍' :
                         item.type === 'priority' ? '🛡' :
                         item.type === 'status' ? '⚡' :
                         item.type === 'deleted' ? '🗑' : '•'}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                          <div className="text-xs text-gray-500">
                            {item.date} {item.time}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{item.user}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.status === 'completed' ? 'bg-green-100 text-green-700' :
                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.status === 'completed' ? 'Completato' :
                             item.status === 'pending' ? 'In attesa' : item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cronologia Eventi</h3>
              <p className="text-gray-500">Seleziona un asset per visualizzare la cronologia</p>
            </div>
          </div>
        )}
      </div>

      {/* Asset Form Modal */}
      {showForm && (
        <AssetForm
          asset={editingAsset}
          onSave={handleSaveAsset}
          onCancel={() => {
            setShowForm(false);
            setEditingAsset(undefined);
          }}
        />
      )}

      {/* Work Order Form Modal */}
      {showWorkOrderForm && selectedAsset && (
        <WorkOrderFormNew
          asset={selectedAsset}
          onSave={handleCreateWorkOrder}
          onCancel={() => setShowWorkOrderForm(false)}
        />
      )}

      {/* Sub Asset Form Modal */}
      {showSubAssetForm && selectedAsset && (
        <SubAssetForm
          parentAsset={selectedAsset}
          onSave={handleCreateSubAsset}
          onCancel={() => setShowSubAssetForm(false)}
        />
      )}

      {/* Sub Assets List Modal */}
      {showSubAssetsList && selectedAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-green-600" />
                  Sotto-attrezzature di {selectedAsset.name}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {getSubAssets(selectedAsset.id).length} elementi trovati
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowSubAssetsList(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="p-0">
              {getSubAssets(selectedAsset.id).length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nessuna sotto-attrezzatura trovata</p>
                  <Button
                    onClick={() => {
                      setShowSubAssetsList(false);
                      setShowSubAssetForm(true);
                    }}
                    className="mt-4"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Crea prima sotto-attrezzatura
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {getSubAssets(selectedAsset.id).map((subAsset) => (
                    <div
                      key={subAsset.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedAsset(subAsset);
                        setShowSubAssetsList(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Sub Asset Icon */}
                        <div className={`w-10 h-10 rounded flex items-center justify-center text-white text-sm font-medium ${
                          subAsset.level === 1 ? 'bg-green-600' : 'bg-purple-600'
                        }`}>
                          {subAsset.level === 1 ? '•' : '◦'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-base">
                              {subAsset.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(subAsset.status)}`}>
                                {getStatusLabel(subAsset.status)}
                              </span>
                              {subAsset.hasChildren && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShowSubAssets(subAsset);
                                  }}
                                  className="p-1 rounded-full hover:bg-blue-100 transition-colors"
                                  title={`${subAsset.childrenIds.length} sotto-componenti`}
                                >
                                  <Layers className="h-3.5 w-3.5 text-blue-600" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            {subAsset.model && (
                              <p className="mb-1">{subAsset.model}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{subAsset.brand || 'N/A'}</span>
                              <span>€{subAsset.value.toLocaleString()}</span>
                              {subAsset.serialNumber && (
                                <span className="font-mono">{subAsset.serialNumber}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Livello {subAsset.level + 1} • {subAsset.category}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAsset(subAsset);
                                  setShowSubAssetsList(false);
                                }}
                                className="text-xs"
                              >
                                Visualizza dettagli
                              </Button>
                              {subAsset.level < 2 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAsset(subAsset);
                                    setShowSubAssetsList(false);
                                    setShowSubAssetForm(true);
                                  }}
                                  className="text-xs text-blue-600"
                                >
                                  <PlusCircle className="h-3 w-3 mr-1" />
                                  Aggiungi sotto-componente
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {getSubAssets(selectedAsset.id).length} sotto-attrezzature di {selectedAsset.name}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowSubAssetsList(false)}
                    >
                      Chiudi
                    </Button>
                    <Button
                      onClick={() => {
                        setShowSubAssetsList(false);
                        setShowSubAssetForm(true);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Aggiungi sotto-attrezzatura
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Document Form Modal */}
      {showDocumentForm && selectedAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Aggiungi Documento - {selectedAsset.name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowDocumentForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateDocument(); }} className="space-y-4">
                <div>
                  <label htmlFor="docName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Documento *
                  </label>
                  <input
                    id="docName"
                    type="text"
                    value={newDocument.name}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="es. Manuale Utente Condizionatore"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="docDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    id="docDescription"
                    value={newDocument.description}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrivi il contenuto del documento..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="docType" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      id="docType"
                      value={newDocument.type}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="manual">Manuale</option>
                      <option value="warranty">Garanzia</option>
                      <option value="specification">Specifica Tecnica</option>
                      <option value="certificate">Certificato</option>
                      <option value="invoice">Fattura</option>
                      <option value="other">Altro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700 mb-1">
                      Livello Accesso
                    </label>
                    <select
                      id="accessLevel"
                      value={newDocument.accessLevel}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, accessLevel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Pubblico</option>
                      <option value="private">Privato</option>
                      <option value="restricted">Limitato</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="docTags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tag (separati da virgola)
                  </label>
                  <input
                    id="docTags"
                    type="text"
                    value={newDocument.tags}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="es. manutenzione, sicurezza, installazione"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Aggiungi Documento
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowDocumentForm(false)}>
                    Annulla
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Program Settings Modal */}
      {showProgramModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Programma Asset - {selectedAsset.name}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowProgramModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent>
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setProgramActiveTab('settings')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    programActiveTab === 'settings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    Impostazioni Asset
                  </div>
                </button>
                <button
                  onClick={() => setProgramActiveTab('forecast')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    programActiveTab === 'forecast'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" />
                    Planning & Forecast
                  </div>
                </button>
              </div>

              {/* Settings Tab */}
              {programActiveTab === 'settings' && (
                <div className="space-y-6">
                  {/* Parametri Operativi */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Gauge className="h-5 w-5" />
                      Parametri Operativi
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Ore Operative (annuali)
                        </label>
                        <input
                          type="number"
                          value={assetSettings.maxOperatingHours}
                          onChange={(e) => setAssetSettings(prev => ({ 
                            ...prev, maxOperatingHours: parseInt(e.target.value) 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="2000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Intervallo Manutenzione (giorni)
                        </label>
                        <input
                          type="number"
                          value={assetSettings.maintenanceInterval}
                          onChange={(e) => setAssetSettings(prev => ({ 
                            ...prev, maintenanceInterval: parseInt(e.target.value) 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="90"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Soglie di Allarme */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Soglie di Allarme
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Thermometer className="h-4 w-4" />
                          Temperatura Massima (°C)
                        </label>
                        <input
                          type="number"
                          value={assetSettings.temperatureThreshold}
                          onChange={(e) => setAssetSettings(prev => ({ 
                            ...prev, temperatureThreshold: parseInt(e.target.value) 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="80"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Limite Vibrazioni (mm/s)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={assetSettings.vibrationLimit}
                          onChange={(e) => setAssetSettings(prev => ({ 
                            ...prev, vibrationLimit: parseFloat(e.target.value) 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="5.0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Automazioni */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Automazioni
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={assetSettings.autoCreateWorkOrders}
                          onChange={(e) => setAssetSettings(prev => ({ 
                            ...prev, autoCreateWorkOrders: e.target.checked 
                          }))}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Crea automaticamente ordini di lavoro alla scadenza manutenzione</span>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={assetSettings.criticalAlertsEnabled}
                          onChange={(e) => setAssetSettings(prev => ({ 
                            ...prev, criticalAlertsEnabled: e.target.checked 
                          }))}
                          className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Attiva allarmi critici per superamento soglie</span>
                      </label>

                      <div className="ml-7 pl-4 border-l border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notifica prima della manutenzione (giorni)
                        </label>
                        <input
                          type="number"
                          value={assetSettings.notifyBeforeMaintenance}
                          onChange={(e) => setAssetSettings(prev => ({ 
                            ...prev, notifyBeforeMaintenance: parseInt(e.target.value) 
                          }))}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="7"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preferenze Notifiche */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Preferenze Notifiche
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={assetSettings.emailNotifications}
                          onChange={(e) => setAssetSettings(prev => ({ 
                            ...prev, emailNotifications: e.target.checked 
                          }))}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Notifiche email per manutenzioni e allarmi</span>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={assetSettings.smsAlerts}
                          onChange={(e) => setAssetSettings(prev => ({ 
                            ...prev, smsAlerts: e.target.checked 
                          }))}
                          className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <Smartphone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">SMS per allarmi critici</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Forecast Tab */}
              {programActiveTab === 'forecast' && (
                <div className="space-y-6">
                  {/* Analisi Predittiva */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Analisi Predittiva Guasti
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-blue-800">Stato Predittivo: Buono</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-blue-600 font-medium">Probabilità Guasto (30gg)</span>
                          <div className="text-2xl font-bold text-blue-900">12%</div>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Vita Utile Residua</span>
                          <div className="text-2xl font-bold text-blue-900">3.2 anni</div>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Efficienza Attuale</span>
                          <div className="text-2xl font-bold text-blue-900">87%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Attenzione</span>
                        </div>
                        <p className="text-sm text-yellow-700">Trend di usura sopra la media nelle ultime 4 settimane</p>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">Raccomandazione</span>
                        </div>
                        <p className="text-sm text-green-700">Pianificare controllo preventivo entro 15 giorni</p>
                      </div>
                    </div>
                  </div>

                  {/* Pianificazione Sostituzioni */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Pianificazione Sostituzioni
                    </h3>
                    <div className="space-y-3">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">Sostituzione Programmata</span>
                          <span className="text-sm text-gray-500">Q2 2025</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Basato su ciclo di vita e utilizzo corrente. Costo stimato: €15.000
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline">Modifica Timeline</Button>
                          <Button size="sm" variant="outline">Richiedi Preventivo</Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Budget Planning */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Budget Planning Manutenzioni
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600">Budget 2024 (Rimanente)</div>
                        <div className="text-xl font-bold text-gray-900">€3.200</div>
                        <div className="text-xs text-green-600">-15% vs piano</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600">Stima Budget 2025</div>
                        <div className="text-xl font-bold text-gray-900">€8.500</div>
                        <div className="text-xs text-orange-600">+12% vs 2024</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600">ROI Asset</div>
                        <div className="text-xl font-bold text-gray-900">342%</div>
                        <div className="text-xs text-green-600">Ottimale</div>
                      </div>
                    </div>
                  </div>

                  {/* Trend Utilizzo */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart2 className="h-5 w-5" />
                      Analisi Trend Utilizzo
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-sm text-gray-600">Utilizzo Medio</div>
                          <div className="text-lg font-bold text-gray-900">73%</div>
                          <div className="text-xs text-green-600">↑ +5%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Ore/Settimana</div>
                          <div className="text-lg font-bold text-gray-900">42h</div>
                          <div className="text-xs text-gray-500">Stabile</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Picco Utilizzo</div>
                          <div className="text-lg font-bold text-gray-900">Martedì</div>
                          <div className="text-xs text-blue-600">10-15h</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Downtime</div>
                          <div className="text-lg font-bold text-gray-900">2.3%</div>
                          <div className="text-xs text-red-600">↑ +0.8%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-6 border-t mt-6">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  onClick={() => {
                    // Save settings logic here
                    setShowProgramModal(false);
                  }}
                >
                  <Save className="h-4 w-4" />
                  Salva Impostazioni
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowProgramModal(false)}
                >
                  Annulla
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && selectedAsset && (
        <QRCodeGenerator
          data={JSON.stringify({
            id: selectedAsset.id,
            name: selectedAsset.name,
            serialNumber: selectedAsset.serialNumber,
            location: selectedAsset.location,
            category: selectedAsset.category,
            brand: selectedAsset.brand,
            model: selectedAsset.model
          })}
          title={`QR Code - ${selectedAsset.name}`}
          onClose={() => setShowQRCode(false)}
          size={250}
        />
      )}
    </div>
  );
}