'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AssetForm from "@/components/AssetForm";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { getAssets, saveAsset, deleteAsset, initializeStorage } from "@/lib/storage";
import { Asset } from "@/data/mockData";
import { 
  Plus,
  Search,
  Filter,
  ChevronDown,
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
  Send
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
  const [assetComments, setAssetComments] = useState<Record<string, Array<{
    id: string;
    user: string;
    date: string;
    message: string;
    type: string;
  }>>>({});

  useEffect(() => {
    initializeStorage();
    loadAssets();
  }, []);

  const loadAssets = () => {
    const assetsData = getAssets();
    setAssets(assetsData);
    // Select first asset by default
    if (assetsData.length > 0 && !selectedAsset) {
      setSelectedAsset(assetsData[0]);
    }
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non disponibile';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const addComment = () => {
    if (!newComment.trim() || !selectedAsset) return;
    
    const comment = {
      id: Date.now().toString(),
      user: 'David Luchetta',
      date: new Date().toLocaleDateString('it-IT') + ', ' + new Date().toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'}),
      message: newComment.trim(),
      type: 'user-comment'
    };

    setAssetComments(prev => ({
      ...prev,
      [selectedAsset.id]: [comment, ...(prev[selectedAsset.id] || [])]
    }));
    
    setNewComment('');
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
              <div className="flex bg-gray-100 rounded-md p-1">
                <Button
                  variant={currentView === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('list')}
                  className="px-3 py-1"
                >
                  <List className="h-4 w-4 mr-1" />
                  Lista
                </Button>
                <Button
                  variant={currentView === 'analytics' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('analytics')}
                  className="px-3 py-1"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Analytics
                </Button>
              </div>
              
              {currentView === 'list' && (
                <Button 
                  onClick={() => setShowForm(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nuovo
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
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-800">Vista Analytics</h3>
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
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  selectedAsset?.id === asset.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {asset.name.substring(0, 2).toUpperCase()}
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
                      <div className="flex items-center gap-2">
                        <span>€{asset.value.toLocaleString()}</span>
                        <span className="text-blue-600">• {asset.brand}</span>
                      </div>
                    </div>
                  </div>
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
      
      {/* Middle Column - Asset Details */}
      <div className="flex-1 bg-white border-r border-gray-200">
        {/* Asset Details or Analytics */}
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
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => setShowQRCode(true)}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
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
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Asset Details Grid */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Data di acquisto</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{selectedAsset.purchaseDate ? formatDate(selectedAsset.purchaseDate) : 'Non specificato'}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Priorità</h3>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        selectedAsset.priority === 'critical' ? 'bg-red-500' :
                        selectedAsset.priority === 'high' ? 'bg-orange-500' :
                        selectedAsset.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></span>
                      <span className="text-sm capitalize">
                        {selectedAsset.priority === 'critical' ? 'Critica' :
                         selectedAsset.priority === 'high' ? 'Alta' :
                         selectedAsset.priority === 'medium' ? 'Media' : 'Bassa'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">ID dell'Asset</h3>
                    <div className="text-sm text-gray-600">#{selectedAsset.id}</div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Assegnato a</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                        {selectedAsset.assignedTo ? selectedAsset.assignedTo.substring(0, 2).toUpperCase() : 'N/A'}
                      </div>
                      <span className="text-sm">{selectedAsset.assignedTo || 'Non assegnato'}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Categoria</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center">
                        <Package className="h-3 w-3 text-gray-600" />
                      </div>
                      <span className="text-sm">{selectedAsset.category}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Produttore</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-medium">
                          {selectedAsset.brand ? selectedAsset.brand.substring(0, 1).toUpperCase() : 'N/A'}
                        </span>
                      </div>
                      <span className="text-sm">{selectedAsset.brand || 'Non specificato'}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Ubicazione</h3>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedAsset.location}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Valore</h3>
                    <div className="text-sm text-gray-600">€{selectedAsset.value.toLocaleString()}</div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Modello</h3>
                    <div className="text-sm text-gray-600">{selectedAsset.model || 'Non specificato'}</div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Numero di Serie</h3>
                    <div className="text-sm text-gray-600">{selectedAsset.serialNumber || 'Non specificato'}</div>
                  </div>
                </div>

                {/* Maintenance Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Informazioni Manutenzione</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Ultima manutenzione</label>
                      <div className="text-sm text-gray-900">
                        {selectedAsset.lastMaintenance ? formatDate(selectedAsset.lastMaintenance) : 'Mai eseguita'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Prossima manutenzione</label>
                      <div className="text-sm text-gray-900">
                        {selectedAsset.nextMaintenance ? formatDate(selectedAsset.nextMaintenance) : 'Non programmata'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operational Status */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Stato Operativo</h3>
                  <p className="text-sm text-gray-600">
                    Questo asset è attualmente {getStatusLabel(selectedAsset.status).toLowerCase()}.
                    {selectedAsset.workOrders && selectedAsset.workOrders > 0 ? 
                      ` Ha completato ${selectedAsset.workOrders} ordini di lavoro.` : 
                      ' Nessun ordine di lavoro completato.'
                    }
                  </p>
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

      {/* Right Column - Timeline/Chronology */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {selectedAsset && (
          <>
            {/* Timeline Header */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Cronologia Asset</h3>
              <p className="text-sm text-gray-600">{selectedAsset.name}</p>
            </div>

            {/* Timeline Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {/* Comments Section */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Cronologia
                  </h4>
                  
                  {/* Comment Input */}
                  <div className="mb-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        DL
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Aggiungi commento..."
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                          rows={3}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <Button variant="ghost" size="sm" title="Allega file" className="text-gray-500">
                            📎
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={addComment}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Invia
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3 mb-6">
                    {[
                      // User comments (newest first)
                      ...(assetComments[selectedAsset.id] || []),
                      // System comments (mock data)
                      { 
                        id: 'system-1',
                        user: 'David Luchetta', 
                        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('it-IT') + ', 15:30', 
                        message: 'Cambio di stato: da "In corso" a "Completato"',
                        type: 'status-change'
                      },
                      { 
                        id: 'system-2',
                        user: 'Sistema', 
                        date: new Date(Date.now() - 48 * 60 * 60 * 1000).toLocaleDateString('it-IT') + ', 09:15', 
                        message: 'Manutenzione programmata completata con successo.',
                        type: 'maintenance'
                      }
                    ].map((comment) => (
                      <div key={comment.id || comment.message} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                          {comment.user === 'Sistema' ? 'S' : 'DL'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900">{comment.user}</span>
                            <span className="text-xs text-gray-500">{comment.date}</span>
                          </div>
                          <div className={`text-sm p-2 rounded ${
                            comment.type === 'status-change' ? 'bg-green-50 text-green-800' : 
                            comment.type === 'maintenance' ? 'bg-blue-50 text-blue-800' :
                            comment.type === 'user-comment' ? 'bg-white border border-gray-200 text-gray-900' :
                            'bg-gray-50 text-gray-700'
                          }`}>
                            {comment.message}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Events */}
                {[
                  {
                    date: selectedAsset.nextMaintenance,
                    type: 'maintenance-scheduled',
                    title: 'Manutenzione programmata',
                    description: 'Prossima manutenzione prevista',
                    icon: Clock,
                    color: 'blue',
                    future: true
                  },
                  {
                    date: selectedAsset.lastMaintenance || selectedAsset.purchaseDate,
                    type: selectedAsset.lastMaintenance ? 'maintenance-completed' : 'asset-created',
                    title: selectedAsset.lastMaintenance ? 'Manutenzione completata' : 'Asset creato',
                    description: selectedAsset.lastMaintenance ? 'Ultima manutenzione eseguita' : 'Asset aggiunto al sistema',
                    icon: selectedAsset.lastMaintenance ? CheckCircle : Plus,
                    color: 'green'
                  },
                  {
                    date: selectedAsset.purchaseDate,
                    type: 'asset-purchased',
                    title: 'Asset acquistato',
                    description: `Valore: €${selectedAsset.value.toLocaleString()}`,
                    icon: DollarSign,
                    color: 'purple'
                  }
                ]
                .filter(event => event.date) // Filter out events without dates
                .sort((a, b) => {
                  // Sort by date, with future events first
                  const dateA = new Date(a.date!);
                  const dateB = new Date(b.date!);
                  if (a.future && !b.future) return -1;
                  if (!a.future && b.future) return 1;
                  return dateB.getTime() - dateA.getTime();
                })
                .map((event, index) => {
                  const Icon = event.icon;
                  const isUpcoming = event.future;
                  return (
                    <div key={index} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        event.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        event.color === 'green' ? 'bg-green-100 text-green-600' :
                        event.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      } ${isUpcoming ? 'ring-2 ring-blue-200' : ''}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">{event.title}</span>
                          {isUpcoming && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Programmato
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {event.date ? formatDate(event.date) : 'Data non disponibile'}
                        </div>
                        <div className="text-xs text-gray-600">{event.description}</div>
                      </div>
                    </div>
                  );
                })}

                {/* Status Changes Timeline */}
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedAsset.status === 'operational' ? 'bg-green-100 text-green-600' :
                    selectedAsset.status === 'maintenance' ? 'bg-orange-100 text-orange-600' :
                    selectedAsset.status === 'down' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">Stato aggiornato</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {new Date().toLocaleDateString('it-IT')}
                    </div>
                    <div className="text-xs text-gray-600">
                      Asset impostato come {getStatusLabel(selectedAsset.status).toLowerCase()}
                    </div>
                  </div>
                </div>

                {/* Work Orders Activity */}
                {selectedAsset.workOrders && selectedAsset.workOrders > 0 && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">Ordini di lavoro</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        Varie date
                      </div>
                      <div className="text-xs text-gray-600">
                        {selectedAsset.workOrders} ordini di lavoro completati
                      </div>
                    </div>
                  </div>
                )}

                {/* Assignment Changes */}
                {selectedAsset.assignedTo && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-teal-100 text-teal-600">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">Assegnazione</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        Data assegnazione
                      </div>
                      <div className="text-xs text-gray-600">
                        Assegnato a {selectedAsset.assignedTo}
                      </div>
                    </div>
                  </div>
                )}

                {/* Location Changes */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-100 text-amber-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">Ubicazione</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      Posizionamento iniziale
                    </div>
                    <div className="text-xs text-gray-600">
                      Collocato in {selectedAsset.location}
                    </div>
                  </div>
                </div>

                {/* End of timeline marker */}
                <div className="flex gap-3 opacity-50">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-1">
                      Inizio cronologia asset
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty state when no asset selected */}
        {!selectedAsset && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-gray-400">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Seleziona un asset per visualizzare la cronologia</p>
            </div>
          </div>
        )}
      </div>

      {/* Asset Form Modal */}
      {showForm && (
        <AssetForm
          key={`asset-form-${Date.now()}`}
          asset={editingAsset}
          onSave={handleSaveAsset}
          onCancel={() => {
            setShowForm(false);
            setEditingAsset(undefined);
          }}
        />
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