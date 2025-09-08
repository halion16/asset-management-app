'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getWorkOrders, saveWorkOrder, initializeStorage } from "@/lib/storage";
import { WorkOrder } from "@/data/mockData";
import { 
  Filter,
  ChevronDown,
  User,
  Calendar,
  Target,
  Plus,
  Search,
  MoreHorizontal,
  MessageCircle,
  Edit,
  Clock,
  DollarSign,
  CheckCircle,
  Play,
  Pause,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Settings,
  Activity,
  FileText,
  MapPin,
  Wrench,
  AlertTriangle,
  CheckSquare,
  Send,
  X
} from "lucide-react";

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [selectedTab, setSelectedTab] = useState<'to_execute' | 'completed'>('to_execute');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editWorkOrder, setEditWorkOrder] = useState<WorkOrder | null>(null);
  const [newWorkOrder, setNewWorkOrder] = useState({
    title: '',
    description: '',
    assetName: '',
    priority: 'medium' as const,
    dueDate: '',
    location: '',
    estimatedTime: ''
  });

  useEffect(() => {
    initializeStorage();
    loadWorkOrders();
  }, []);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('DEBUG: Global mousedown detected, menu open:', showActionsMenu, 'target:', (event.target as Element)?.tagName);
      
      if (showActionsMenu) {
        // Check if the click is inside the dropdown menu
        const target = event.target as Element;
        const dropdown = document.querySelector('.dropdown-menu');
        
        if (dropdown && dropdown.contains(target)) {
          console.log('DEBUG: Click inside dropdown - not closing');
          return; // Don't close if clicking inside dropdown
        }
        
        console.log('DEBUG: Click outside dropdown - closing menu');
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      // Use a small delay to allow the dropdown to render
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 10);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  const loadWorkOrders = () => {
    const orders = getWorkOrders();
    setWorkOrders(orders);
    if (orders.length > 0 && !selectedWorkOrder) {
      setSelectedWorkOrder(orders[0]);
    }
  };

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesTab = selectedTab === 'to_execute' ? wo.status !== 'completed' : wo.status === 'completed';
    const matchesSearch = searchTerm ? wo.title.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return matchesTab && matchesSearch;
  });

  const pendingCount = workOrders.filter(wo => wo.status !== 'completed').length;
  const completedCount = workOrders.filter(wo => wo.status === 'completed').length;

  const handleStatusUpdate = (status: WorkOrder['status']) => {
    if (!selectedWorkOrder) return;
    
    const updatedWorkOrder = { ...selectedWorkOrder, status };
    saveWorkOrder(updatedWorkOrder);
    setSelectedWorkOrder(updatedWorkOrder);
    loadWorkOrders();
  };

  const addComment = () => {
    if (!newComment.trim() || !selectedWorkOrder) return;
    
    // Simulate adding a comment - in real implementation this would be saved
    alert(`Commento aggiunto: "${newComment}"`);
    setNewComment('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const getStatusIcon = (status: WorkOrder['status']) => {
    switch (status) {
      case 'open': return <Lock className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'on_hold': return <Pause className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: WorkOrder['status']) => {
    switch (status) {
      case 'open': return 'Aperto';
      case 'in_progress': return 'In attesa';
      case 'completed': return 'Fatto';
      case 'on_hold': return 'In sospeso';
      default: return status;
    }
  };

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'open': return 'text-gray-600 bg-gray-100';
      case 'in_progress': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'on_hold': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleCreateWorkOrder = () => {
    if (!newWorkOrder.title.trim()) {
      alert('Il titolo è obbligatorio');
      return;
    }

    const workOrder: WorkOrder = {
      id: Date.now().toString(),
      title: newWorkOrder.title,
      description: newWorkOrder.description,
      assetId: Date.now().toString(),
      assetName: newWorkOrder.assetName || 'Asset Generico',
      type: 'corrective',
      status: 'open',
      priority: newWorkOrder.priority,
      assignedTo: 'David Luchetta',
      requestedBy: 'Sistema',
      createdDate: new Date().toISOString().split('T')[0],
      dueDate: newWorkOrder.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedTime: newWorkOrder.estimatedTime || '1h',
      location: newWorkOrder.location || 'Da definire'
    };

    saveWorkOrder(workOrder);
    loadWorkOrders();
    setShowCreateModal(false);
    setNewWorkOrder({
      title: '',
      description: '',
      assetName: '',
      priority: 'medium',
      dueDate: '',
      location: '',
      estimatedTime: ''
    });
    alert('Ordine di lavoro creato con successo!');
  };

  // Placeholder functions for actions menu
  const handleMarkAsUnread = () => {
    alert('Segna come non letto - Funzionalità in sviluppo');
    setShowActionsMenu(false);
  };

  const handleMoveToRecent = () => {
    alert('Vai al più recente nella catena - Funzionalità in sviluppo');
    setShowActionsMenu(false);
  };

  const handleStopRepeat = () => {
    alert('Interrompi la ripetizione - Funzionalità in sviluppo');
    setShowActionsMenu(false);
  };

  const handleCopyToNewWorkOrder = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log('DEBUG: handleCopyToNewWorkOrder called', selectedWorkOrder);
    if (!selectedWorkOrder) {
      console.log('DEBUG: No selected work order');
      return;
    }
    
    // Create new work order based on selected one
    const copiedWorkOrder: WorkOrder = {
      id: Date.now().toString(),
      title: `Copia di: ${selectedWorkOrder.title}`,
      description: selectedWorkOrder.description,
      assetId: Date.now().toString(),
      assetName: selectedWorkOrder.assetName,
      type: selectedWorkOrder.type || 'corrective',
      status: 'open',
      priority: selectedWorkOrder.priority,
      assignedTo: selectedWorkOrder.assignedTo,
      requestedBy: 'David Luchetta', // Current user creating the copy
      createdDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      estimatedTime: selectedWorkOrder.estimatedTime,
      location: selectedWorkOrder.location
    };
    
    // Save the new work order
    saveWorkOrder(copiedWorkOrder);
    loadWorkOrders();
    
    // Select the new work order and close menu
    setSelectedWorkOrder(copiedWorkOrder);
    setShowActionsMenu(false);
    
    alert(`Nuovo ordine di lavoro creato: "${copiedWorkOrder.title}"`);
  };

  const handleExportToPDF = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log('DEBUG: handleExportToPDF called', selectedWorkOrder);
    if (!selectedWorkOrder) {
      console.log('DEBUG: No selected work order for PDF');
      return;
    }
    
    // Create PDF content as string
    const pdfContent = `
ORDINE DI LAVORO - ${selectedWorkOrder.orderNumber || selectedWorkOrder.id}
================================================================

Titolo: ${selectedWorkOrder.title}
Descrizione: ${selectedWorkOrder.description || 'Nessuna descrizione'}
Asset: ${selectedWorkOrder.assetName}
Priorità: ${selectedWorkOrder.priority === 'high' ? 'Alta' : selectedWorkOrder.priority === 'medium' ? 'Media' : 'Bassa'}
Stato: ${getStatusLabel(selectedWorkOrder.status)}
Assegnato a: ${selectedWorkOrder.assignedTo}
Richiesto da: ${selectedWorkOrder.requestedBy}
Data di creazione: ${formatDate(selectedWorkOrder.createdDate)}
Data di scadenza: ${formatDate(selectedWorkOrder.dueDate)}
Tempo stimato: ${selectedWorkOrder.estimatedTime || 'Non specificato'}
Posizione: ${selectedWorkOrder.location || 'Non specificata'}

================================================================
Esportato il: ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}
    `.trim();

    // Create and download file
    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ordine_Lavoro_${selectedWorkOrder.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    setShowActionsMenu(false);
    alert('Ordine di lavoro esportato con successo!');
  };

  const handleSendEmailToSupplier = () => {
    alert("Invia un'e-mail ai Fornitori - Funzionalità in sviluppo");
    setShowActionsMenu(false);
  };

  const handleCancel = () => {
    if (confirm('Sei sicuro di voler cancellare questo ordine di lavoro?')) {
      alert('Cancella - Funzionalità in sviluppo');
      setShowActionsMenu(false);
    }
  };

  // Comments and Edit handlers
  const handleOpenComments = () => {
    setShowCommentsModal(true);
  };

  const handleOpenEdit = () => {
    if (selectedWorkOrder) {
      setEditWorkOrder({...selectedWorkOrder});
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editWorkOrder) return;
    
    if (!editWorkOrder.title.trim()) {
      alert('Il titolo è obbligatorio');
      return;
    }

    saveWorkOrder(editWorkOrder);
    loadWorkOrders();
    setSelectedWorkOrder(editWorkOrder);
    setShowEditModal(false);
    setEditWorkOrder(null);
    alert('Ordine di lavoro aggiornato con successo!');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      alert('Il commento non può essere vuoto');
      return;
    }
    
    // In a real app, this would save to the database
    alert(`Commento aggiunto: "${newComment}"`);
    setNewComment('');
    setShowCommentsModal(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Column - Work Orders List */}
      <div className="w-[480px] bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Ordini di lavoro</h1>
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
                Nuovo Ordine di lavoro
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setSelectedTab('to_execute')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'to_execute'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Da eseguire
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {pendingCount}
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
              Fatto
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {completedCount}
              </span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" className="text-blue-600">
              <User className="h-4 w-4 mr-2" />
              Assegnato a
            </Button>
            <Button variant="ghost" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Data di scadenza
            </Button>
            <Button variant="ghost" size="sm" className="text-blue-600 bg-blue-50">
              <MapPin className="h-4 w-4 mr-2" />
              Franciocorta
            </Button>
            <Button variant="ghost" size="sm">
              <Target className="h-4 w-4 mr-2" />
              Priorità
            </Button>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
              Aggiungi filtro
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Button variant="ghost" size="sm" className="text-blue-600 bg-blue-50">
              Reimposta filtri
            </Button>
            <Button variant="ghost" size="sm">
              Salva filtri
            </Button>
            <span className="text-gray-500 ml-auto">
              Risultati assegnati a me (2)
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Ricerca Ordini di lavoro"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Work Orders List */}
        <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-300px)]" 
             style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e0 #f7fafc' }}>
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2">
              Ordina per: Priorità: I più alti prima
            </div>
            {filteredWorkOrders.map((workOrder) => (
              <div
                key={workOrder.id}
                onClick={() => setSelectedWorkOrder(workOrder)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  selectedWorkOrder?.id === workOrder.id
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workOrder.status)}`}>
                        {getStatusLabel(workOrder.status)}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(workOrder.priority)}`}>
                        {workOrder.priority === 'high' ? 'Alta' : workOrder.priority === 'medium' ? 'Media' : 'Bassa'}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                      {workOrder.title}
                    </h3>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Richiesto da: {workOrder.requestedBy}</div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {workOrder.status === 'completed' ? 'In ritardo' : 'In ritardo'}
                        <span className="text-red-600">• Media</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Work Order Details */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedWorkOrder ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedWorkOrder.title}
                    </h2>
                    <Edit className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>Manutenzione • In ritardo da {formatDate(selectedWorkOrder.dueDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={handleOpenComments}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Commenti
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={handleOpenEdit}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica
                  </Button>
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('DEBUG: Three dots menu clicked, current state:', showActionsMenu);
                        setShowActionsMenu(!showActionsMenu);
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    
                    {/* Dropdown Menu */}
                    {showActionsMenu && (
                      <div 
                        className="dropdown-menu absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                      >
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('DEBUG: Mark as unread clicked');
                              handleMarkAsUnread();
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Segna come non letto
                          </button>
                          <button
                            onClick={handleMoveToRecent}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Vai al più recente nella catena
                          </button>
                          <button
                            onClick={handleStopRepeat}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Interrompi la ripetizione
                          </button>
                          <button
                            onClick={(e) => {
                              console.log('DEBUG: Copy button clicked');
                              handleCopyToNewWorkOrder(e);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Copia in nuovo Ordine di lavoro
                          </button>
                          <button
                            onClick={(e) => {
                              console.log('DEBUG: PDF button clicked');
                              handleExportToPDF(e);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Esporta in PDF
                          </button>
                          <button
                            onClick={handleSendEmailToSupplier}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Invia un'e-mail ai Fornitori
                          </button>
                          <hr className="border-gray-200 my-1" />
                          <button
                            onClick={handleCancel}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Cancella
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-6 mb-4">
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    selectedWorkOrder.status === 'open' ? 'bg-blue-100 border-blue-500 text-blue-600' : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    <Unlock className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-medium mt-1">Aperto</div>
                </div>
                
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    selectedWorkOrder.status === 'in_progress' ? 'bg-orange-100 border-orange-500 text-orange-600' : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-medium mt-1">In attesa</div>
                </div>

                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    selectedWorkOrder.status === 'in_progress' ? 'bg-blue-100 border-blue-500 text-blue-600' : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    <Activity className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-medium mt-1">In corso</div>
                </div>

                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    selectedWorkOrder.status === 'completed' ? 'bg-green-100 border-green-500 text-green-600' : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-medium mt-1">Fatto</div>
                </div>
              </div>

              {/* Action Button */}
              {selectedWorkOrder.status !== 'completed' && (
                <div className="flex items-center gap-2">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleStatusUpdate('completed')}
                  >
                    Contrassegna come "Completato"
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Lock className="h-4 w-4 mr-2" />
                    Condividi esternamente
                  </Button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Work Order Details Grid */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Data di scadenza</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-red-600">In ritardo</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatDate(selectedWorkOrder.dueDate)}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Priorità</h3>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        selectedWorkOrder.priority === 'high' ? 'bg-red-500' :
                        selectedWorkOrder.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                      }`}></span>
                      <span className="text-sm capitalize">{selectedWorkOrder.priority === 'high' ? 'Media' : 'Media'}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">ID dell'Ordine di lavoro</h3>
                    <div className="text-sm text-gray-600">#{selectedWorkOrder.id}</div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Assegnato a</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                        DL
                      </div>
                      <span className="text-sm">{selectedWorkOrder.assignedTo}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Attrezzatura</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center">
                        <Wrench className="h-3 w-3 text-gray-600" />
                      </div>
                      <span className="text-sm">{selectedWorkOrder.assetName || 'Condizionatore Franciocorta'}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Produttore</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-medium">A</span>
                      </div>
                      <span className="text-sm">Ariel spa</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Ubicazione</h3>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Franciocorta</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Tempo stimato</h3>
                    <div className="text-sm text-gray-600">1h</div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Tipo di lavoro</h3>
                    <div className="text-sm text-gray-600">Altro</div>
                  </div>
                </div>

                {/* Programming Conditions */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Condizioni di programmazione</h3>
                  <p className="text-sm text-gray-600">
                    Questo Ordine di lavoro si ripeterà in base al tempo.
                  </p>
                </div>

                {/* Comments Section */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Commenti</h3>
                  
                  {/* Comment Input */}
                  <div className="mb-4">
                    <div className="flex gap-3">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Scrivi un commento..."
                        className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                      />
                      <div className="flex flex-col gap-2">
                        <Button variant="ghost" size="sm" title="Allega file">
                          📎
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={addComment}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Invia
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {[
                      { user: 'David Luchetta', date: '21/08/2025, 23:15', message: 'Ha messo l\'ordine di lavoro in attesa.' },
                      { user: 'David Luchetta', date: '21/08/2025, 23:15', message: 'Ha riaperto l\'ordine di lavoro e ha iniziato l\'avanzamento.' },
                      { user: 'David Luchetta', date: '21/08/2025, 23:15', message: 'Ha completato l\'ordine di lavoro .' , completed: true },
                      { user: 'David Luchetta', date: '21/08/2025, 23:15', message: 'Ha riaperto l\'ordine di lavoro e l\'ha messo in sospeso.' },
                      { user: 'David Luchetta', date: '21/08/2025, 23:14', message: 'Ha completato l\'ordine di lavoro .', completed: true },
                      { user: 'David Luchetta', date: '21/08/2025, 23:14', message: 'Ha messo l\'ordine di lavoro in attesa.' }
                    ].map((comment, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                          DL
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.user}</span>
                            <span className="text-xs text-gray-500">{comment.date}</span>
                          </div>
                          <div className={`text-sm p-2 rounded ${comment.completed ? 'bg-green-50 text-green-800' : 'text-gray-700'}`}>
                            {comment.message}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Seleziona un ordine di lavoro per visualizzare i dettagli
          </div>
        )}
      </div>

      {/* Create Work Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Nuovo Ordine di Lavoro</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewWorkOrder({
                    title: '',
                    description: '',
                    assetName: '',
                    priority: 'medium',
                    dueDate: '',
                    location: '',
                    estimatedTime: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titolo *
                </label>
                <input
                  type="text"
                  value={newWorkOrder.title}
                  onChange={(e) => setNewWorkOrder(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Inserisci il titolo dell'ordine"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={newWorkOrder.description}
                  onChange={(e) => setNewWorkOrder(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descrizione dettagliata del lavoro"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asset/Attrezzatura
                  </label>
                  <input
                    type="text"
                    value={newWorkOrder.assetName}
                    onChange={(e) => setNewWorkOrder(prev => ({ ...prev, assetName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome dell'asset"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorità
                  </label>
                  <select
                    value={newWorkOrder.priority}
                    onChange={(e) => setNewWorkOrder(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Bassa</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Critica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data di scadenza
                  </label>
                  <input
                    type="date"
                    value={newWorkOrder.dueDate}
                    onChange={(e) => setNewWorkOrder(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tempo stimato
                  </label>
                  <input
                    type="text"
                    value={newWorkOrder.estimatedTime}
                    onChange={(e) => setNewWorkOrder(prev => ({ ...prev, estimatedTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="es. 2h 30m"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicazione
                </label>
                <input
                  type="text"
                  value={newWorkOrder.location}
                  onChange={(e) => setNewWorkOrder(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ubicazione dell'asset"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewWorkOrder({
                      title: '',
                      description: '',
                      assetName: '',
                      priority: 'medium',
                      dueDate: '',
                      location: '',
                      estimatedTime: ''
                    });
                  }}
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleCreateWorkOrder}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Crea Ordine
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showCommentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Aggiungi Commento</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCommentsModal(false);
                  setNewComment('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commento per: {selectedWorkOrder?.title}
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Scrivi il tuo commento..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCommentsModal(false);
                    setNewComment('');
                  }}
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleAddComment}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Aggiungi Commento
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Work Order Modal */}
      {showEditModal && editWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Modifica Ordine di Lavoro</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEditModal(false);
                  setEditWorkOrder(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titolo *
                </label>
                <input
                  type="text"
                  value={editWorkOrder.title}
                  onChange={(e) => setEditWorkOrder(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Titolo dell'ordine di lavoro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrizione
                </label>
                <textarea
                  value={editWorkOrder.description || ''}
                  onChange={(e) => setEditWorkOrder(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descrizione dettagliata del lavoro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset
                  </label>
                  <input
                    type="text"
                    value={editWorkOrder.assetName}
                    onChange={(e) => setEditWorkOrder(prev => prev ? ({ ...prev, assetName: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome asset"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorità
                  </label>
                  <select
                    value={editWorkOrder.priority}
                    onChange={(e) => setEditWorkOrder(prev => prev ? ({ ...prev, priority: e.target.value as any }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Bassa</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data di scadenza
                  </label>
                  <input
                    type="date"
                    value={editWorkOrder.dueDate}
                    onChange={(e) => setEditWorkOrder(prev => prev ? ({ ...prev, dueDate: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo stimato
                  </label>
                  <input
                    type="text"
                    value={editWorkOrder.estimatedTime || ''}
                    onChange={(e) => setEditWorkOrder(prev => prev ? ({ ...prev, estimatedTime: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Es: 2h"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posizione
                </label>
                <input
                  type="text"
                  value={editWorkOrder.location || ''}
                  onChange={(e) => setEditWorkOrder(prev => prev ? ({ ...prev, location: e.target.value }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Posizione dell'asset"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditWorkOrder(null);
                  }}
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Salva Modifiche
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}