'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getPurchaseOrders, savePurchaseOrder, deletePurchaseOrder, initializeStorage } from "@/lib/storage";
import { PurchaseOrder } from "@/data/mockData";
import { 
  ShoppingCart,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  User,
  Calendar,
  DollarSign,
  Package,
  Building,
  Truck,
  AlertTriangle,
  CheckCircle,
  Send,
  FileText,
  Clock,
  Edit,
  Trash2,
  Check,
  X,
  Eye
} from "lucide-react";

const statusLabels = {
  draft: "Bozza",
  sent: "Inviato",
  approved: "Approvato", 
  partial: "Parziale",
  received: "Ricevuto",
  completed: "Completato",
  cancelled: "Annullato"
};

const statusColors = {
  draft: "text-gray-600 bg-gray-100",
  sent: "text-blue-600 bg-blue-100",
  approved: "text-green-600 bg-green-100",
  partial: "text-orange-600 bg-orange-100", 
  received: "text-purple-600 bg-purple-100",
  completed: "text-green-600 bg-green-100",
  cancelled: "text-red-600 bg-red-100"
};

const priorityLabels = {
  low: "Bassa",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente"
};

const priorityColors = {
  low: "text-green-600",
  medium: "text-orange-600", 
  high: "text-red-600",
  urgent: "text-red-700"
};

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    title: '',
    description: '',
    supplierName: '',
    priority: 'medium' as const,
    expectedDelivery: '',
    items: [{ partName: '', quantity: 1, unitPrice: 0, notes: '' }]
  });

  useEffect(() => {
    initializeStorage();
    loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = () => {
    const ordersData = getPurchaseOrders();
    setPurchaseOrders(ordersData);
    if (!selectedOrder && ordersData.length > 0) {
      setSelectedOrder(ordersData[0]);
    }
  };

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesTab = selectedTab === 'active' 
      ? order.status !== 'completed' && order.status !== 'cancelled'
      : order.status === 'completed' || order.status === 'cancelled';
      
    const matchesSearch = !searchTerm || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesTab && matchesSearch;
  });

  const activeCount = purchaseOrders.filter(order => 
    order.status !== 'completed' && order.status !== 'cancelled'
  ).length;
  
  const completedCount = purchaseOrders.filter(order => 
    order.status === 'completed' || order.status === 'cancelled'
  ).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusIcon = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'approved': return <Check className="h-4 w-4" />;
      case 'partial': return <AlertTriangle className="h-4 w-4" />;
      case 'received': return <Package className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = (id: string, newStatus: PurchaseOrder['status']) => {
    const order = purchaseOrders.find(po => po.id === id);
    if (order) {
      const updatedOrder: PurchaseOrder = {
        ...order,
        status: newStatus,
        ...(newStatus === 'approved' && !order.approvedBy && { 
          approvedBy: 'David Luchetta',
          approvedDate: new Date().toISOString().split('T')[0]
        }),
        ...(newStatus === 'received' && !order.actualDelivery && { 
          actualDelivery: new Date().toISOString().split('T')[0]
        })
      };
      savePurchaseOrder(updatedOrder);
      loadPurchaseOrders();
    }
  };

  const handleCreateOrder = () => {
    if (!newOrder.title.trim() || !newOrder.supplierName.trim()) {
      alert('Titolo e fornitore sono obbligatori');
      return;
    }

    if (newOrder.items.some(item => !item.partName.trim() || item.quantity <= 0 || item.unitPrice < 0)) {
      alert('Tutti gli articoli devono avere nome, quantità valida e prezzo');
      return;
    }

    const items = newOrder.items.map((item, index) => ({
      id: (Date.now() + index).toString(),
      partId: `part-${index + 1}`,
      partName: item.partName,
      partNumber: `PN-${index + 1000}`,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
      notes: item.notes
    }));

    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const taxRate = 22; // 22% IVA
    const subtotal = total;
    const tax = (subtotal * taxRate) / 100;
    const shipping = 0;
    const discount = 0;
    const finalTotal = subtotal + tax + shipping - discount;

    const purchaseOrder: PurchaseOrder = {
      id: Date.now().toString(),
      orderNumber: `PO-${Date.now().toString().slice(-6)}`,
      title: newOrder.title,
      description: newOrder.description,
      status: 'draft',
      priority: newOrder.priority,
      supplierId: `supplier-${Date.now()}`,
      supplierName: newOrder.supplierName,
      requestedBy: 'David Luchetta',
      createdDate: new Date().toISOString().split('T')[0],
      expectedDelivery: newOrder.expectedDelivery || undefined,
      items,
      subtotal,
      tax,
      taxRate,
      shipping,
      discount,
      total: finalTotal,
      currency: 'EUR'
    };

    savePurchaseOrder(purchaseOrder);
    loadPurchaseOrders();
    setShowCreateModal(false);
    setNewOrder({
      title: '',
      description: '',
      supplierName: '',
      priority: 'medium',
      expectedDelivery: '',
      items: [{ partName: '', quantity: 1, unitPrice: 0, notes: '' }]
    });
    alert('Ordine di acquisto creato con successo!');
  };

  const addItem = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { partName: '', quantity: 1, unitPrice: 0, notes: '' }]
    }));
  };

  const removeItem = (index: number) => {
    if (newOrder.items.length > 1) {
      setNewOrder(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Column - Purchase Orders List */}
      <div className="w-[480px] bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Ordini di acquisto</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Ordine di acquisto
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setSelectedTab('active')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Attivi
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {activeCount}
              </span>
            </button>
            <button
              onClick={() => setSelectedTab('completed')}
              className={`pb-2 px-1 ml-6 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Completati
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {completedCount}
              </span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-blue-600"
              >
                <User className="h-4 w-4 mr-1" />
                Assegnato a
              </Button>
              <Button
                variant="ghost"
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="text-blue-600"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Data di scadenza
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-blue-600"
              >
                <Package className="h-4 w-4 mr-1" />
                Fornitore
              </Button>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              Reimposta filtri
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              Salva filtri
            </Button>
            <div className="text-sm text-gray-500">
              Risultati assegnati a me (2)
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Ricerca Ordini di acquisto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Purchase Orders List */}
        <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-300px)]" 
             style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e0 #f7fafc' }}>
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2">
              Ordina per: Priorità: I più alti prima
            </div>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  selectedOrder?.id === order.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    DL
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                      <span className={`text-xs font-medium ${priorityColors[order.priority]}`}>
                        {priorityLabels[order.priority]}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                      {order.title}
                    </h3>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span className="truncate">Fornitore: {order.supplierName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>In ritardo da {formatDate(order.expectedDelivery || order.createdDate)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatCurrency(order.total, order.currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Purchase Order Details */}
      {selectedOrder && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{selectedOrder.title}</h1>
                  <span className="text-gray-400">#{selectedOrder.orderNumber}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Ordine di Acquisto</span>
                  <span>•</span>
                  <span>In ritardo da {formatDate(selectedOrder.expectedDelivery || selectedOrder.createdDate)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedOrder.status]}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{statusLabels[selectedOrder.status]}</span>
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Commenti
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifica
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Order Actions */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full bg-gray-400`}></span>
                <span className="text-sm text-gray-600">Aperto</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full bg-blue-400`}></span>
                <span className="text-sm text-gray-600">In attesa</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full bg-orange-400`}></span>
                <span className="text-sm text-gray-600">In corso</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full bg-green-400`}></span>
                <span className="text-sm text-gray-600">Fatto</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                onClick={() => handleStatusUpdate(selectedOrder.id, 'completed')}
              >
                Contrassegna come "Completato"
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleStatusUpdate(selectedOrder.id, 'approved')}
              >
                <Check className="h-4 w-4 mr-2" />
                Condividi esternamente
              </Button>
            </div>
          </div>

          {/* Details Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Purchase Order Details Grid */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Data di scadenza</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-red-600">In ritardo</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatDate(selectedOrder.expectedDelivery || selectedOrder.createdDate)}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Priorità</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      selectedOrder.priority === 'urgent' ? 'bg-red-500' :
                      selectedOrder.priority === 'high' ? 'bg-orange-500' :
                      selectedOrder.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                    }`}></span>
                    <span className="text-sm capitalize">{priorityLabels[selectedOrder.priority]}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">ID dell'Ordine di acquisto</h3>
                  <div className="text-sm text-gray-600">#{selectedOrder.orderNumber}</div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Assegnato a</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                      DL
                    </div>
                    <span className="text-sm text-gray-600">David Luchetta</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Fornitore</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center">
                      <Building className="h-3 w-3 text-gray-600" />
                    </div>
                    <span className="text-sm">{selectedOrder.supplierName}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Tempo stimato</h3>
                  <div className="text-sm text-gray-600">2h</div>
                </div>
              </div>

              {/* Items Section */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Articoli ordinati</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.partName}</div>
                          <div className="text-xs text-gray-500">Quantità: {item.quantity}</div>
                          {item.notes && <div className="text-xs text-gray-500">{item.notes}</div>}
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-sm">{formatCurrency(item.totalPrice, selectedOrder.currency)}</div>
                          <div className="text-xs text-gray-500">{formatCurrency(item.unitPrice, selectedOrder.currency)}/pz</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-300 mt-4 pt-4">
                    <div className="flex justify-between items-center font-medium">
                      <span>Totale:</span>
                      <span className="text-green-600">{formatCurrency(selectedOrder.total, selectedOrder.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedOrder.description && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Descrizione</h3>
                  <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {selectedOrder.description}
                  </div>
                </div>
              )}

              {/* Delivery Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Condizioni di programmazione</h3>
                <div className="text-sm text-gray-600">
                  Questo Ordine di acquisto si ripeterà in base al tempo.
                </div>
              </div>

              {/* Comments Section */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Commenti</h3>
                <div className="space-y-3">
                  {/* Add Comment */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      DL
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Aggiungi un commento..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Commenta
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - when no order selected */}
      {!selectedOrder && (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Seleziona un ordine</h3>
            <p className="text-gray-500">Scegli un ordine di acquisto dalla lista per visualizzarne i dettagli</p>
          </div>
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Nuovo Ordine di Acquisto</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titolo *
                  </label>
                  <input
                    type="text"
                    value={newOrder.title}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Inserisci il titolo dell'ordine"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fornitore *
                  </label>
                  <input
                    type="text"
                    value={newOrder.supplierName}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, supplierName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Inserisci il nome del fornitore"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorità
                  </label>
                  <select
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Bassa</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data di consegna prevista
                  </label>
                  <input
                    type="date"
                    value={newOrder.expectedDelivery}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, expectedDelivery: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrizione
                </label>
                <textarea
                  value={newOrder.description}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Inserisci una descrizione dell'ordine"
                />
              </div>

              {/* Items Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Articoli</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Articolo
                  </Button>
                </div>

                <div className="space-y-4">
                  {newOrder.items.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome Articolo *
                          </label>
                          <input
                            type="text"
                            value={item.partName}
                            onChange={(e) => updateItem(index, 'partName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nome dell'articolo"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantità *
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prezzo Unitario (€) *
                          </label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Note
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => updateItem(index, 'notes', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Note aggiuntive"
                          />
                          {newOrder.items.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="text-sm font-medium text-gray-700">
                          Totale: {formatCurrency((item.quantity || 0) * (item.unitPrice || 0), 'EUR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">Totale Ordine:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(
                        newOrder.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0),
                        'EUR'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Annulla
              </Button>
              <Button
                onClick={handleCreateOrder}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Crea Ordine di Acquisto
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}