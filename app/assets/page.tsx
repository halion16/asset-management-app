'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  QrCode
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
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Attrezzature</h1>
              <p className="text-sm text-gray-600">{filteredAssets.length} asset trovati</p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nuovo
            </Button>
          </div>

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
        </div>

        {/* Assets List */}
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
      </div>

      {/* Right Column - Asset Details */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedAsset ? (
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
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Details Section */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Dettagli</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Anno</label>
                      <div className="text-sm text-gray-900">{selectedAsset.purchaseDate.split('-')[0] || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Tipo di Attrezzatura</label>
                      <div className="text-sm text-gray-900">{selectedAsset.category}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Ubicazione</label>
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedAsset.location}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Criticità</label>
                      <div className="text-sm text-gray-900">Media</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Produttore</label>
                      <div className="text-sm text-gray-900">{selectedAsset.brand}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Modello</label>
                      <div className="text-sm text-gray-900">{selectedAsset.model}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Numero di Serie</label>
                      <div className="text-sm text-gray-900">{selectedAsset.serialNumber}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Valore</label>
                      <div className="text-sm text-gray-900">€{selectedAsset.value.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Azioni</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Activity className="h-4 w-4 mr-2" />
                      Crea Ordine di Lavoro
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Aggiungi Documento
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Programma Manutenzione
                    </Button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Attività Recente</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">Manutenzione programmata</div>
                        <div className="text-xs text-gray-500">Prossima manutenzione prevista per il 15 Gen 2024</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">Asset aggiornato</div>
                        <div className="text-xs text-gray-500">Informazioni modificate il 28 Dic 2023</div>
                      </div>
                    </div>
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