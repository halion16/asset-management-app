'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RequestCard from "@/components/RequestCard";
import { getRequests, saveRequest, deleteRequest, saveWorkOrder, initializeStorage } from "@/lib/storage";
import { Request, WorkOrder } from "@/data/mockData";
import { 
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Filter,
  X
} from "lucide-react";

const typeFilters = [
  { value: 'all', label: 'Tutti i tipi' },
  { value: 'maintenance', label: 'Manutenzione' },
  { value: 'repair', label: 'Riparazione' },
  { value: 'inspection', label: 'Ispezione' },
  { value: 'installation', label: 'Installazione' },
  { value: 'other', label: 'Altro' }
];

const statusFilters = [
  { value: 'all', label: 'Tutti gli stati' },
  { value: 'pending', label: 'In attesa' },
  { value: 'approved', label: 'Approvate' },
  { value: 'rejected', label: 'Rifiutate' },
  { value: 'converted', label: 'Convertite' },
  { value: 'cancelled', label: 'Annullate' }
];

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    type: 'maintenance' as const,
    priority: 'medium' as const,
    location: 'Franciocorta',
    department: 'Maintenance',
    requiredDate: '',
    assetId: '',
    assetName: '',
    estimatedCost: ''
  });

  useEffect(() => {
    initializeStorage();
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, typeFilter, statusFilter]);

  const loadRequests = () => {
    const requestsData = getRequests();
    setRequests(requestsData);
  };

  const filterRequests = () => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(request => request.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime());

    setFilteredRequests(filtered);
  };

  const handleApprove = (id: string) => {
    const request = requests.find(r => r.id === id);
    if (request) {
      const updatedRequest: Request = {
        ...request,
        status: 'approved',
        reviewedBy: 'David Luchetta', // Mock current user
        reviewedDate: new Date().toISOString().split('T')[0],
        reviewNotes: 'Richiesta approvata. Procedere con la lavorazione.'
      };
      saveRequest(updatedRequest);
      loadRequests();
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt('Motivo del rifiuto:');
    if (reason) {
      const request = requests.find(r => r.id === id);
      if (request) {
        const updatedRequest: Request = {
          ...request,
          status: 'rejected',
          reviewedBy: 'David Luchetta',
          reviewedDate: new Date().toISOString().split('T')[0],
          reviewNotes: reason
        };
        saveRequest(updatedRequest);
        loadRequests();
      }
    }
  };

  const handleConvertToWorkOrder = (id: string) => {
    const request = requests.find(r => r.id === id);
    if (request) {
      // Create new work order from request
      const newWorkOrder: WorkOrder = {
        id: Date.now().toString(),
        title: request.title,
        description: request.description,
        assetId: request.assetId || '',
        assetName: request.assetName || '',
        type: request.type === 'maintenance' ? 'preventive' : 'corrective',
        status: 'open',
        priority: request.priority,
        assignedTo: 'Giulia Bianchi', // Mock assignment
        requestedBy: request.requestedBy,
        createdDate: new Date().toISOString().split('T')[0],
        dueDate: request.requiredDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimatedTime: '2h',
        location: request.location
      };

      // Save work order
      saveWorkOrder(newWorkOrder);

      // Update request status
      const updatedRequest: Request = {
        ...request,
        status: 'converted',
        reviewedBy: 'David Luchetta',
        reviewedDate: new Date().toISOString().split('T')[0],
        reviewNotes: `Convertita in Work Order #${newWorkOrder.id}`,
        convertedToWorkOrderId: newWorkOrder.id
      };
      
      saveRequest(updatedRequest);
      loadRequests();
      
      alert(`Richiesta convertita in Work Order #${newWorkOrder.id}`);
    }
  };

  const handleDeleteRequest = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa richiesta?')) {
      deleteRequest(id);
      loadRequests();
    }
  };

  const handleEditRequest = (request: Request) => {
    setEditingRequest(request);
    setNewRequest({
      title: request.title,
      description: request.description,
      type: request.type,
      priority: request.priority,
      location: request.location,
      department: request.department,
      requiredDate: request.requiredDate || '',
      assetId: request.assetId || '',
      assetName: request.assetName || '',
      estimatedCost: request.estimatedCost ? request.estimatedCost.toString() : ''
    });
    setShowEditRequestModal(true);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!newRequest.title.trim()) {
      newErrors.title = 'Il titolo è obbligatorio';
    } else if (newRequest.title.trim().length < 3) {
      newErrors.title = 'Il titolo deve essere di almeno 3 caratteri';
    }
    
    if (!newRequest.description.trim()) {
      newErrors.description = 'La descrizione è obbligatoria';
    } else if (newRequest.description.trim().length < 10) {
      newErrors.description = 'La descrizione deve essere di almeno 10 caratteri';
    }
    
    if (newRequest.estimatedCost && Number(newRequest.estimatedCost) < 0) {
      newErrors.estimatedCost = 'Il costo stimato non può essere negativo';
    }
    
    if (newRequest.requiredDate) {
      const today = new Date();
      const required = new Date(newRequest.requiredDate);
      today.setHours(0, 0, 0, 0);
      if (required < today) {
        newErrors.requiredDate = 'La data richiesta non può essere nel passato';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: string, value: string) => {
    setNewRequest(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCreateRequest = () => {
    if (!validateForm()) {
      return;
    }

    if (editingRequest) {
      // Update existing request
      const updatedRequest: Request = {
        ...editingRequest,
        title: newRequest.title.trim(),
        description: newRequest.description.trim(),
        type: newRequest.type,
        priority: newRequest.priority,
        location: newRequest.location,
        department: newRequest.department,
        requiredDate: newRequest.requiredDate || undefined,
        assetId: newRequest.assetId || undefined,
        assetName: newRequest.assetName || undefined,
        estimatedCost: newRequest.estimatedCost ? Number(newRequest.estimatedCost) : undefined,
      };
      saveRequest(updatedRequest);
      setShowEditRequestModal(false);
      setEditingRequest(null);
    } else {
      // Create new request
      const request: Request = {
        id: Date.now().toString(),
        title: newRequest.title.trim(),
        description: newRequest.description.trim(),
        type: newRequest.type,
        priority: newRequest.priority,
        status: 'pending',
        requestedBy: 'David Luchetta', // Mock current user
        requestedDate: new Date().toISOString().split('T')[0],
        requiredDate: newRequest.requiredDate || undefined,
        location: newRequest.location,
        department: newRequest.department,
        assetId: newRequest.assetId || undefined,
        assetName: newRequest.assetName || undefined,
        estimatedCost: newRequest.estimatedCost ? Number(newRequest.estimatedCost) : undefined,
        attachments: []
      };
      saveRequest(request);
      setShowNewRequestModal(false);
    }
    
    loadRequests();
    setNewRequest({
      title: '',
      description: '',
      type: 'maintenance',
      priority: 'medium',
      location: 'Franciocorta',
      department: 'Maintenance',
      requiredDate: '',
      assetId: '',
      assetName: '',
      estimatedCost: ''
    });
    setErrors({});
  };

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    converted: requests.filter(r => r.status === 'converted').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    overdue: requests.filter(r => 
      r.requiredDate && 
      new Date(r.requiredDate) < new Date() && 
      r.status === 'pending'
    ).length
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Richieste</h1>
            <p className="text-gray-600">Gestisci le richieste di manutenzione e intervento</p>
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowNewRequestModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuova Richiesta
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Totale</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-600">In attesa</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                <p className="text-sm text-gray-600">Approvate</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <ArrowRight className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.converted}</p>
                <p className="text-sm text-gray-600">Convertite</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                <p className="text-sm text-gray-600">Rifiutate</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                <p className="text-sm text-gray-600">In ritardo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per titolo, descrizione, richiedente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {typeFilters.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusFilters.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
            <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
              Mostrando {filteredRequests.length} di {requests.length} richieste
              {searchTerm && ` • Ricerca: "${searchTerm}"`}
              {typeFilter !== 'all' && ` • Tipo: ${typeFilters.find(f => f.value === typeFilter)?.label}`}
              {statusFilter !== 'all' && ` • Stato: ${statusFilters.find(f => f.value === statusFilter)?.label}`}
            </div>
          )}
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onEdit={handleEditRequest}
              onApprove={handleApprove}
              onReject={handleReject}
              onConvert={handleConvertToWorkOrder}
              onDelete={handleDeleteRequest}
              canManage={true} // Mock permission
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                ? 'Nessuna richiesta trovata' 
                : 'Nessuna richiesta presente'
              }
            </h3>
            <p className="text-gray-500">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Prova a modificare i filtri di ricerca'
                : 'Le richieste di manutenzione appariranno qui'
              }
            </p>
          </div>
        )}

        {/* New Request Modal */}
        {showNewRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Nuova Richiesta</CardTitle>
                <Button variant="ghost" onClick={() => setShowNewRequestModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titolo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newRequest.title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Breve descrizione della richiesta"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrizione <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newRequest.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Descrizione dettagliata del problema o richiesta"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo Richiesta
                    </label>
                    <select
                      value={newRequest.type}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="maintenance">Manutenzione</option>
                      <option value="repair">Riparazione</option>
                      <option value="inspection">Ispezione</option>
                      <option value="installation">Installazione</option>
                      <option value="other">Altro</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priorità
                    </label>
                    <select
                      value={newRequest.priority}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Bassa</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Critica</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicazione
                    </label>
                    <select
                      value={newRequest.location}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Franciocorta">Franciocorta</option>
                      <option value="Milano">Milano</option>
                      <option value="Bergamo">Bergamo</option>
                    </select>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dipartimento
                    </label>
                    <select
                      value={newRequest.department}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Maintenance">Maintenance</option>
                      <option value="Operations">Operations</option>
                      <option value="Facilities Management">Facilities Management</option>
                      <option value="IT">IT</option>
                      <option value="Safety">Safety</option>
                      <option value="Quality">Quality</option>
                    </select>
                  </div>

                  {/* Required Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Richiesta
                    </label>
                    <input
                      type="date"
                      value={newRequest.requiredDate}
                      onChange={(e) => handleFieldChange('requiredDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.requiredDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.requiredDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.requiredDate}</p>
                    )}
                  </div>

                  {/* Estimated Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo Stimato (€)
                    </label>
                    <input
                      type="number"
                      value={newRequest.estimatedCost}
                      onChange={(e) => handleFieldChange('estimatedCost', e.target.value)}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.estimatedCost ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.estimatedCost && (
                      <p className="mt-1 text-sm text-red-600">{errors.estimatedCost}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset Correlato (opzionale)
                    </label>
                    <input
                      type="text"
                      value={newRequest.assetName}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, assetName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome dell'asset interessato"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewRequestModal(false)}
                  >
                    Annulla
                  </Button>
                  <Button 
                    onClick={handleCreateRequest}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Crea Richiesta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Request Modal */}
        {showEditRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Modifica Richiesta</CardTitle>
                <Button variant="ghost" onClick={() => {
                  setShowEditRequestModal(false);
                  setEditingRequest(null);
                  setNewRequest({
                    title: '',
                    description: '',
                    type: 'maintenance',
                    priority: 'medium',
                    location: 'Franciocorta',
                    department: 'Maintenance',
                    requiredDate: '',
                    assetId: '',
                    assetName: '',
                    estimatedCost: ''
                  });
                  setErrors({});
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titolo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newRequest.title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Inserisci il titolo della richiesta"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrizione <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newRequest.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      rows={3}
                      placeholder="Descrivi dettagliatamente la richiesta"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={newRequest.type}
                      onChange={(e) => handleFieldChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="maintenance">Manutenzione</option>
                      <option value="repair">Riparazione</option>
                      <option value="inspection">Ispezione</option>
                      <option value="installation">Installazione</option>
                      <option value="other">Altro</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priorità
                    </label>
                    <select
                      value={newRequest.priority}
                      onChange={(e) => handleFieldChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Bassa</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Critica</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicazione
                    </label>
                    <select
                      value={newRequest.location}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Franciocorta">Franciocorta</option>
                      <option value="Milano">Milano</option>
                      <option value="Bergamo">Bergamo</option>
                      <option value="Brescia">Brescia</option>
                    </select>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reparto
                    </label>
                    <select
                      value={newRequest.department}
                      onChange={(e) => handleFieldChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Maintenance">Maintenance</option>
                      <option value="IT">IT</option>
                      <option value="Operations">Operations</option>
                      <option value="Facilities">Facilities</option>
                      <option value="Production">Production</option>
                      <option value="Safety">Safety</option>
                      <option value="Quality">Quality</option>
                    </select>
                  </div>

                  {/* Required Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Richiesta
                    </label>
                    <input
                      type="date"
                      value={newRequest.requiredDate}
                      onChange={(e) => handleFieldChange('requiredDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.requiredDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.requiredDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.requiredDate}</p>
                    )}
                  </div>

                  {/* Estimated Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo Stimato (€)
                    </label>
                    <input
                      type="number"
                      value={newRequest.estimatedCost}
                      onChange={(e) => handleFieldChange('estimatedCost', e.target.value)}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.estimatedCost ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.estimatedCost && (
                      <p className="mt-1 text-sm text-red-600">{errors.estimatedCost}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset Correlato (opzionale)
                    </label>
                    <input
                      type="text"
                      value={newRequest.assetName}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, assetName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome dell'asset interessato"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowEditRequestModal(false);
                      setEditingRequest(null);
                      setNewRequest({
                        title: '',
                        description: '',
                        type: 'maintenance',
                        priority: 'medium',
                        location: 'Franciocorta',
                        department: 'Maintenance',
                        requiredDate: '',
                        assetId: '',
                        assetName: '',
                        estimatedCost: ''
                      });
                      setErrors({});
                    }}
                  >
                    Annulla
                  </Button>
                  <Button 
                    onClick={handleCreateRequest}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Aggiorna Richiesta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}