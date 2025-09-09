'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getParts, savePart, deletePart, getStockMovements, saveStockMovement, initializeStorage } from "@/lib/storage";
import { Part, StockMovement } from "@/data/mockData";
import { 
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Warehouse,
  TrendingDown,
  TrendingUp,
  Edit,
  Trash2,
  History,
  MapPin,
  Tag,
  Calendar,
  User,
  Building,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings,
  BarChart3,
  DollarSign,
  Clock,
  Shield,
  X,
  Eye
} from "lucide-react";

const categoryColors = {
  mechanical: "bg-blue-500 text-white",
  electrical: "bg-yellow-500 text-white",
  hydraulic: "bg-purple-500 text-white",
  pneumatic: "bg-green-500 text-white",
  consumable: "bg-orange-500 text-white",
  tool: "bg-gray-500 text-white",
  safety: "bg-red-500 text-white",
  other: "bg-indigo-500 text-white"
};

const categoryLabels = {
  mechanical: "Meccanici",
  electrical: "Elettrici",
  hydraulic: "Idraulici",
  pneumatic: "Pneumatici",
  consumable: "Consumabili",
  tool: "Utensili",
  safety: "Sicurezza",
  other: "Altro"
};

const movementTypeColors = {
  in: "text-green-600 bg-green-50 border-green-200",
  out: "text-red-600 bg-red-50 border-red-200",
  adjustment: "text-blue-600 bg-blue-50 border-blue-200",
  transfer: "text-purple-600 bg-purple-50 border-purple-200"
};

const movementTypeLabels = {
  in: "Entrata",
  out: "Uscita",
  adjustment: "Rettifica",
  transfer: "Trasferimento"
};

const reasonLabels = {
  purchase: "Acquisto",
  consumption: "Consumo",
  maintenance: "Manutenzione", 
  return: "Reso",
  damage: "Danneggiamento",
  expired: "Scaduto",
  audit: "Inventario",
  transfer: "Trasferimento"
};

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [viewMode, setViewMode] = useState<'inventory' | 'movements'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, low_stock, out_stock, critical
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  useEffect(() => {
    initializeStorage();
    loadData();
  }, []);

  useEffect(() => {
    filterParts();
  }, [parts, searchTerm, categoryFilter, statusFilter]);

  const loadData = () => {
    const partsData = getParts();
    const movementsData = getStockMovements();
    setParts(partsData);
    setStockMovements(movementsData);
  };

  const filterParts = () => {
    let filtered = parts.filter(part => part.isActive);

    if (searchTerm) {
      filtered = filtered.filter(part => 
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(part => part.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'low_stock') {
        filtered = filtered.filter(part => part.currentStock <= part.reorderPoint && part.currentStock > 0);
      } else if (statusFilter === 'out_stock') {
        filtered = filtered.filter(part => part.currentStock === 0);
      } else if (statusFilter === 'critical') {
        filtered = filtered.filter(part => part.isCritical);
      }
    }

    // Sort by current stock (lowest first for better visibility of issues)
    filtered.sort((a, b) => a.currentStock - b.currentStock);

    setFilteredParts(filtered);
  };

  const handleStockAdjustment = (partId: string, quantity: number, reason: string, notes?: string) => {
    const part = parts.find(p => p.id === partId);
    if (!part) return;

    const newStock = Math.max(0, part.currentStock + quantity);
    const updatedPart = { ...part, currentStock: newStock, updatedDate: new Date().toISOString().split('T')[0] };
    
    const movement: StockMovement = {
      id: Date.now().toString(),
      partId: part.id,
      partName: part.name,
      partNumber: part.partNumber,
      type: quantity > 0 ? 'in' : quantity < 0 ? 'out' : 'adjustment',
      reason: reason as any,
      quantity: Math.abs(quantity),
      fromLocation: quantity < 0 ? part.location : undefined,
      toLocation: quantity > 0 ? part.location : undefined,
      referenceType: 'manual',
      performedBy: 'David Luchetta', // Mock current user
      date: new Date().toISOString().split('T')[0],
      notes: notes || `Rettifica manuale magazzino`
    };

    savePart(updatedPart);
    saveStockMovement(movement);
    loadData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStockStatus = (part: Part) => {
    if (part.currentStock === 0) return 'out';
    if (part.currentStock <= part.reorderPoint) return 'low';
    if (part.currentStock >= part.maxStock * 0.9) return 'high';
    return 'normal';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out': return 'text-red-600 bg-red-50';
      case 'low': return 'text-orange-600 bg-orange-50';
      case 'high': return 'text-blue-600 bg-blue-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getStockStatusLabel = (status: string) => {
    switch (status) {
      case 'out': return 'Esaurito';
      case 'low': return 'Scorta bassa';
      case 'high': return 'Scorta alta';
      default: return 'Normale';
    }
  };

  const PartCard = ({ part }: { part: Part }) => {
    const stockStatus = getStockStatus(part);
    const stockPercentage = part.maxStock > 0 ? (part.currentStock / part.maxStock) * 100 : 0;
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 border-l-4" 
            style={{ borderLeftColor: categoryColors[part.category].split(' ')[0].replace('bg-', '') }}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${categoryColors[part.category]} text-xs font-bold`}>
                  {categoryLabels[part.category].substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{part.name}</h3>
                  <p className="text-xs text-gray-600">{part.partNumber}</p>
                </div>
                {part.isCritical && (
                  <Shield className="h-4 w-4 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStockStatusColor(stockStatus)}`}>
                  {getStockStatusLabel(stockStatus)}
                </span>
                {part.batchTracked && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Lotti</span>
                )}
                {part.serialTracked && (
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">SN</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setSelectedPart(part)}
                title="Visualizza dettagli"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600"
                onClick={() => {
                  if (confirm('Sei sicuro di voler eliminare questa parte?')) {
                    deletePart(part.id);
                    loadData();
                  }
                }}
                title="Elimina"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stock Level */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Scorta attuale</span>
              <span className="font-bold text-lg">
                {part.currentStock} {part.unitOfMeasure}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div 
                className={`h-2 rounded-full transition-all ${
                  stockStatus === 'out' ? 'bg-red-500' :
                  stockStatus === 'low' ? 'bg-orange-500' :
                  stockStatus === 'high' ? 'bg-blue-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Min: {part.minStock}</span>
              <span>Riordino: {part.reorderPoint}</span>
              <span>Max: {part.maxStock}</span>
            </div>
          </div>

          {/* Part Details */}
          <div className="space-y-2 text-xs text-gray-600 mb-3">
            {part.description && (
              <p className="line-clamp-2">{part.description}</p>
            )}
            
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>{part.location}</span>
              {part.binLocation && <span className="text-gray-500">({part.binLocation})</span>}
            </div>
            
            {part.manufacturer && (
              <div className="flex items-center gap-2">
                <Building className="h-3 w-3" />
                <span>Produttore: {part.manufacturer}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-3 w-3" />
              <span>Costo unitario: {formatCurrency(part.unitCost)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Lead time: {part.leadTime} giorni</span>
            </div>

            {part.lastPurchaseDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Ultimo acquisto: {formatDate(part.lastPurchaseDate)}</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-7"
              onClick={() => {
                const qty = prompt(`Aggiungi scorta per ${part.name}:`);
                if (qty && !isNaN(Number(qty))) {
                  handleStockAdjustment(part.id, Number(qty), 'purchase', `Aggiunta scorta manuale: +${qty} ${part.unitOfMeasure}`);
                }
              }}
            >
              <ArrowUp className="h-3 w-3 mr-1" />
              Aggiungi
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-7"
              onClick={() => {
                const qty = prompt(`Rimuovi scorta per ${part.name} (max ${part.currentStock}):`);
                if (qty && !isNaN(Number(qty)) && Number(qty) <= part.currentStock) {
                  handleStockAdjustment(part.id, -Number(qty), 'consumption', `Rimozione scorta manuale: -${qty} ${part.unitOfMeasure}`);
                }
              }}
            >
              <ArrowDown className="h-3 w-3 mr-1" />
              Rimuovi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const MovementCard = ({ movement }: { movement: StockMovement }) => (
    <Card className="border-l-4" style={{ borderLeftColor: movementTypeColors[movement.type].split(' ')[1].replace('bg-', '').replace('50', '500') }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded border ${movementTypeColors[movement.type]}`}>
                {movementTypeLabels[movement.type]}
              </span>
              <span className="text-xs text-gray-500">
                {reasonLabels[movement.reason as keyof typeof reasonLabels] || movement.reason}
              </span>
            </div>
            
            <h4 className="font-semibold text-sm text-gray-900 mb-1">
              {movement.partName}
            </h4>
            <p className="text-xs text-gray-600 mb-2">{movement.partNumber}</p>
          </div>
          
          <div className="text-right">
            <div className={`text-lg font-bold ${movement.type === 'in' ? 'text-green-600' : 
                            movement.type === 'out' ? 'text-red-600' : 'text-blue-600'}`}>
              {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}{movement.quantity}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(movement.date)}
            </div>
          </div>
        </div>

        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3" />
            <span>Eseguito da: {movement.performedBy}</span>
          </div>
          
          {movement.fromLocation && (
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3 w-3" />
              <span>Da: {movement.fromLocation}</span>
            </div>
          )}
          
          {movement.toLocation && (
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3 w-3" />
              <span>A: {movement.toLocation}</span>
            </div>
          )}
          
          {movement.totalCost && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-3 w-3" />
              <span>Costo: {formatCurrency(movement.totalCost)}</span>
            </div>
          )}

          {movement.referenceType && movement.referenceId && (
            <div className="flex items-center gap-2">
              <Tag className="h-3 w-3" />
              <span>
                Rif: {movement.referenceType === 'purchase_order' ? 'PO' : 
                      movement.referenceType === 'work_order' ? 'WO' : 'ME'}-{movement.referenceId}
              </span>
            </div>
          )}

          {movement.batchNumber && (
            <div className="flex items-center gap-2">
              <Package className="h-3 w-3" />
              <span>Lotto: {movement.batchNumber}</span>
            </div>
          )}

          {movement.notes && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
              <strong>Note:</strong> {movement.notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Stats
  const stats = {
    totalParts: parts.filter(p => p.isActive).length,
    totalValue: parts.filter(p => p.isActive).reduce((sum, part) => sum + (part.currentStock * part.averageCost), 0),
    lowStock: parts.filter(p => p.isActive && p.currentStock <= p.reorderPoint && p.currentStock > 0).length,
    outOfStock: parts.filter(p => p.isActive && p.currentStock === 0).length,
    critical: parts.filter(p => p.isActive && p.isCritical).length,
    recentMovements: stockMovements.filter(m => {
      const movementDate = new Date(m.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return movementDate >= weekAgo;
    }).length
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Inventario Parti</h1>
            <p className="text-gray-600">Gestisci scorte e movimenti magazzino</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-md p-1">
              <Button
                variant={viewMode === 'inventory' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('inventory')}
                className="px-3 py-1"
              >
                <Warehouse className="h-4 w-4 mr-2" />
                Inventario
              </Button>
              <Button
                variant={viewMode === 'movements' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('movements')}
                className="px-3 py-1"
              >
                <History className="h-4 w-4 mr-2" />
                Movimenti
              </Button>
            </div>
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              disabled
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuova Parte
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalParts}</p>
                  <p className="text-sm text-gray-600">Parti Totali</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalValue).replace('€', '').trim()}€</p>
                  <p className="text-sm text-gray-600">Valore Tot.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
                  <p className="text-sm text-gray-600">Scorta Bassa</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
                  <p className="text-sm text-gray-600">Esaurite</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.critical}</p>
                  <p className="text-sm text-gray-600">Critiche</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.recentMovements}</p>
                  <p className="text-sm text-gray-600">Mov. 7gg</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per nome, codice, produttore, ubicazione..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {viewMode === 'inventory' && (
              <div className="flex gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tutte le categorie</option>
                  <option value="mechanical">Meccanici</option>
                  <option value="electrical">Elettrici</option>
                  <option value="hydraulic">Idraulici</option>
                  <option value="pneumatic">Pneumatici</option>
                  <option value="consumable">Consumabili</option>
                  <option value="tool">Utensili</option>
                  <option value="safety">Sicurezza</option>
                  <option value="other">Altro</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="low_stock">Scorta bassa</option>
                  <option value="out_stock">Esaurite</option>
                  <option value="critical">Parti critiche</option>
                </select>
              </div>
            )}
          </div>

          {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && viewMode === 'inventory' && (
            <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
              Mostrando {filteredParts.length} di {parts.filter(p => p.isActive).length} parti
              {searchTerm && ` • Ricerca: "${searchTerm}"`}
              {categoryFilter !== 'all' && ` • Categoria: ${categoryLabels[categoryFilter as keyof typeof categoryLabels]}`}
              {statusFilter !== 'all' && ` • Stato: ${statusFilter.replace('_', ' ')}`}
            </div>
          )}
        </div>

        {/* Content based on view mode */}
        {viewMode === 'inventory' ? (
          <>
            {/* Parts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredParts.map((part) => (
                <PartCard key={part.id} part={part} />
              ))}
            </div>

            {/* Empty State */}
            {filteredParts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Nessuna parte trovata' 
                    : 'Nessuna parte presente'
                  }
                </h3>
                <p className="text-gray-500">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Prova a modificare i filtri di ricerca'
                    : 'Inizia aggiungendo le prime parti di ricambio'
                  }
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Stock Movements */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stockMovements
                .filter(movement => 
                  searchTerm ? movement.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               movement.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               movement.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) : true
                )
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((movement) => (
                <MovementCard key={movement.id} movement={movement} />
              ))}
            </div>
          </>
        )}

        {/* Part Detail Modal */}
        {selectedPart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedPart.name}</CardTitle>
                  <p className="text-gray-600">{selectedPart.partNumber}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedPart(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Informazioni Generali</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Categoria:</span> {categoryLabels[selectedPart.category]}</div>
                      <div><span className="text-gray-600">Produttore:</span> {selectedPart.manufacturer || 'N/A'}</div>
                      <div><span className="text-gray-600">Unità misura:</span> {selectedPart.unitOfMeasure}</div>
                      <div><span className="text-gray-600">Critica:</span> {selectedPart.isCritical ? 'Sì' : 'No'}</div>
                      {selectedPart.description && (
                        <div><span className="text-gray-600">Descrizione:</span> {selectedPart.description}</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Ubicazione</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Magazzino:</span> {selectedPart.location}</div>
                      {selectedPart.binLocation && (
                        <div><span className="text-gray-600">Posizione:</span> {selectedPart.binLocation}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock Info */}
                <div>
                  <h4 className="font-medium mb-2">Informazioni Scorte</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-gray-900">{selectedPart.currentStock}</div>
                      <div className="text-gray-600">Scorta attuale</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <div className="text-2xl font-bold text-orange-600">{selectedPart.reorderPoint}</div>
                      <div className="text-gray-600">Punto riordino</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">{selectedPart.maxStock}</div>
                      <div className="text-gray-600">Stock massimo</div>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div>
                  <h4 className="font-medium mb-2">Informazioni Finanziarie</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-600">Costo unitario:</span> {formatCurrency(selectedPart.unitCost)}</div>
                    <div><span className="text-gray-600">Costo medio:</span> {formatCurrency(selectedPart.averageCost)}</div>
                    <div><span className="text-gray-600">Valore totale:</span> {formatCurrency(selectedPart.currentStock * selectedPart.averageCost)}</div>
                    {selectedPart.lastPurchasePrice && (
                      <div><span className="text-gray-600">Ultimo prezzo:</span> {formatCurrency(selectedPart.lastPurchasePrice)}</div>
                    )}
                  </div>
                </div>

                {/* Compatible Assets */}
                {selectedPart.compatibleAssets.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Asset Compatibili</h4>
                    <div className="text-sm text-gray-600">
                      {selectedPart.compatibleAssets.join(', ')}
                    </div>
                  </div>
                )}

                {/* Recent Movements */}
                <div>
                  <h4 className="font-medium mb-2">Movimenti Recenti</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {stockMovements
                      .filter(m => m.partId === selectedPart.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((movement) => (
                        <div key={movement.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                          <div>
                            <span className={`px-2 py-1 text-xs rounded ${movementTypeColors[movement.type]}`}>
                              {movementTypeLabels[movement.type]}
                            </span>
                            <span className="ml-2 text-gray-600">{reasonLabels[movement.reason as keyof typeof reasonLabels]}</span>
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${movement.type === 'in' ? 'text-green-600' : movement.type === 'out' ? 'text-red-600' : 'text-blue-600'}`}>
                              {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}{movement.quantity}
                            </div>
                            <div className="text-xs text-gray-500">{formatDate(movement.date)}</div>
                          </div>
                        </div>
                      ))}
                    {stockMovements.filter(m => m.partId === selectedPart.id).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">Nessun movimento registrato</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}