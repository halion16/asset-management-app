'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getWorkOrders, saveWorkOrder, initializeStorage } from "@/lib/storage";
import { WorkOrder, Comment } from "@/data/mockData";
import WorkOrderFormNew from "@/components/WorkOrderFormNew";
import DatePickerModal from "@/components/DatePickerModal";
import AssignmentModal from "@/components/AssignmentModal";
import CategoriesModal from "@/components/CategoriesModal";
import PriorityModal from "@/components/PriorityModal";
import WorkflowManagerClient from "@/components/WorkflowManagerClient";
import NotificationManagerClient from "@/components/NotificationManagerClient";
import TimelineModal from "@/components/TimelineModal";
import TimelineSidebar from "@/components/TimelineSidebar";
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
  Copy,
  Heart,
  FileCheck,
  Trash2,
  Tag,
  MapPin,
  Wrench,
  AlertTriangle,
  CheckSquare,
  Send,
  X,
  Bot,
  Bell,
  History
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
  const [activeCardMenu, setActiveCardMenu] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerWorkOrder, setDatePickerWorkOrder] = useState<WorkOrder | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentWorkOrder, setAssignmentWorkOrder] = useState<WorkOrder | null>(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [categoriesWorkOrder, setCategoriesWorkOrder] = useState<WorkOrder | null>(null);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showNotificationManager, setShowNotificationManager] = useState(false);
  const [priorityWorkOrder, setPriorityWorkOrder] = useState<WorkOrder | null>(null);
  const [showWorkflowManager, setShowWorkflowManager] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

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

  // Close card menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeCardMenu) {
        const target = event.target as Element;
        // Check if click is outside all card menus
        const isInsideCardMenu = target.closest('.card-quick-menu');
        const isMenuButton = target.closest('.card-menu-button');
        
        if (!isInsideCardMenu && !isMenuButton) {
          setActiveCardMenu(null);
        }
      }
    };

    if (activeCardMenu) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 10);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeCardMenu]);

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
    
    const now = new Date().toISOString();
    const nowDate = now.split('T')[0];
    
    // Aggiungi commento automatico per il cambio di stato
    const statusMessages = {
      'open': 'Ha riaperto l\'ordine di lavoro.',
      'on_hold': 'Ha messo l\'ordine di lavoro in attesa.',
      'in_progress': 'Ha iniziato l\'avanzamento sull\'ordine di lavoro.',
      'completed': 'Ha completato l\'ordine di lavoro.'
    };
    
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      workOrderId: selectedWorkOrder.id,
      userId: '1',
      userName: 'David Luchetta',
      userAvatar: 'DL',
      message: statusMessages[status],
      timestamp: now,
      type: 'status_change',
      statusChange: { from: selectedWorkOrder.status, to: status }
    };
    
    const existingComments = selectedWorkOrder.comments || [];
    
    const updatedWorkOrder = { 
      ...selectedWorkOrder, 
      status,
      comments: [...existingComments, newComment],
      ...(status === 'completed' && { completedDate: nowDate })
    };
    
    saveWorkOrder(updatedWorkOrder);
    setSelectedWorkOrder(updatedWorkOrder);
    
    // Update the workOrders state directly for immediate UI update
    const updatedWorkOrders = workOrders.map(wo => 
      wo.id === selectedWorkOrder.id ? updatedWorkOrder : wo
    );
    setWorkOrders(updatedWorkOrders);
    
    // Feedback per l'utente
    const statusLabels = {
      'open': 'Aperto',
      'on_hold': 'In attesa',
      'in_progress': 'In corso',
      'completed': 'Completato'
    };
    
    console.log(`✅ Stato ordine di lavoro aggiornato: ${statusLabels[status]}`);
  };

  const addComment = () => {
    if (!newComment.trim() || !selectedWorkOrder) return;
    
    const now = new Date().toISOString();
    
    const newCommentObj: Comment = {
      id: `c-${Date.now()}`,
      workOrderId: selectedWorkOrder.id,
      userId: '1',
      userName: 'David Luchetta',
      userAvatar: 'DL',
      message: newComment,
      timestamp: now,
      type: 'comment'
    };
    
    const existingComments = selectedWorkOrder.comments || [];
    
    const updatedWorkOrder = {
      ...selectedWorkOrder,
      comments: [...existingComments, newCommentObj]
    };
    
    saveWorkOrder(updatedWorkOrder);
    setSelectedWorkOrder(updatedWorkOrder);
    loadWorkOrders();
    setNewComment('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const isWorkOrderOverdue = (workOrder: WorkOrder) => {
    if (workOrder.status === 'completed') return false;
    const today = new Date();
    const dueDate = new Date(workOrder.dueDate);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const getWorkOrderStatus = (workOrder: WorkOrder) => {
    if (workOrder.status === 'completed') return 'Completato';
    if (isWorkOrderOverdue(workOrder)) return 'In ritardo';
    return 'Nei tempi';
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
      case 'open': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'on_hold': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'in_progress': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'completed': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
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

  const handleCreateWorkOrder = (workOrder: WorkOrder) => {
    saveWorkOrder(workOrder);
    loadWorkOrders();
    setShowCreateModal(false);
    setSelectedWorkOrder(workOrder);
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

  const handleAddCommentFromModal = (commentText: string) => {
    if (!selectedWorkOrder) return;
    
    const now = new Date().toISOString();
    
    const newCommentObj: Comment = {
      id: `c-${Date.now()}`,
      workOrderId: selectedWorkOrder.id,
      userId: '1',
      userName: 'David Luchetta',
      userAvatar: 'DL',
      message: commentText,
      timestamp: now,
      type: 'comment'
    };
    
    const existingComments = selectedWorkOrder.comments || [];
    
    const updatedWorkOrder = {
      ...selectedWorkOrder,
      comments: [...existingComments, newCommentObj]
    };
    
    saveWorkOrder(updatedWorkOrder);
    setSelectedWorkOrder(updatedWorkOrder);
    
    // Update the workOrders state
    const updatedWorkOrders = workOrders.map(wo => 
      wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo
    );
    setWorkOrders(updatedWorkOrders);
  };

  const handleDateChange = (newDate: string) => {
    if (!datePickerWorkOrder) return;
    
    // Add timeline comment
    const now = new Date().toISOString();
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      workOrderId: datePickerWorkOrder.id,
      userId: '1',
      userName: 'David Luchetta',
      userAvatar: 'DL',
      message: `Ha modificato la data di scadenza: ${new Date(newDate).toLocaleDateString('it-IT')}`,
      timestamp: now,
      type: 'system'
    };
    
    const existingComments = datePickerWorkOrder.comments || [];
    const updatedWorkOrder = {
      ...datePickerWorkOrder,
      dueDate: newDate,
      comments: [...existingComments, newComment]
    };
    
    saveWorkOrder(updatedWorkOrder);
    
    // Update workOrders state
    const updatedWorkOrders = workOrders.map(wo => 
      wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo
    );
    setWorkOrders(updatedWorkOrders);
    
    // Update selected work order if it's the same one
    if (selectedWorkOrder && selectedWorkOrder.id === datePickerWorkOrder.id) {
      setSelectedWorkOrder(updatedWorkOrder);
    }
    
    alert(`Data di scadenza aggiornata al ${new Date(newDate).toLocaleDateString('it-IT')}`);
  };

  const handleAssignment = (type: 'user' | 'team', id: string, name: string) => {
    if (!assignmentWorkOrder) return;
    
    // Add timeline comment
    const now = new Date().toISOString();
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      workOrderId: assignmentWorkOrder.id,
      userId: '1',
      userName: 'David Luchetta',
      userAvatar: 'DL',
      message: `Ha assegnato l'ordine di lavoro a: ${name}`,
      timestamp: now,
      type: 'system'
    };
    
    const existingComments = assignmentWorkOrder.comments || [];
    const updatedWorkOrder = {
      ...assignmentWorkOrder,
      assignedTo: name,
      assignedToId: id,
      assignedToType: type,
      comments: [...existingComments, newComment]
    };
    
    saveWorkOrder(updatedWorkOrder);
    
    // Update workOrders state
    const updatedWorkOrders = workOrders.map(wo => 
      wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo
    );
    setWorkOrders(updatedWorkOrders);
    
    // Update selected work order if it's the same one
    if (selectedWorkOrder && selectedWorkOrder.id === assignmentWorkOrder.id) {
      setSelectedWorkOrder(updatedWorkOrder);
    }
    
    alert(`Ordine di lavoro assegnato a: ${name}`);
  };

  const handleCategoriesChange = (categoryIds: string[]) => {
    if (!categoriesWorkOrder) return;
    
    // Add timeline comment
    const now = new Date().toISOString();
    const categoryNames = categoryIds.length > 0 ? 
      `${categoryIds.length} categorie selezionate` : 'Nessuna categoria selezionata';
    
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      workOrderId: categoriesWorkOrder.id,
      userId: '1',
      userName: 'David Luchetta',
      userAvatar: 'DL',
      message: `Ha modificato le categorie: ${categoryNames}`,
      timestamp: now,
      type: 'system'
    };
    
    const existingComments = categoriesWorkOrder.comments || [];
    const updatedWorkOrder = {
      ...categoriesWorkOrder,
      categories: categoryIds,
      comments: [...existingComments, newComment]
    };
    
    saveWorkOrder(updatedWorkOrder);
    
    // Update workOrders state
    const updatedWorkOrders = workOrders.map(wo => 
      wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo
    );
    setWorkOrders(updatedWorkOrders);
    
    // Update selected work order if it's the same one
    if (selectedWorkOrder && selectedWorkOrder.id === categoriesWorkOrder.id) {
      setSelectedWorkOrder(updatedWorkOrder);
    }
    
    alert(`Categorie aggiornate: ${categoryNames}`);
  };

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high' | 'critical') => {
    if (!priorityWorkOrder) return;
    
    const priorityLabels = {
      'low': 'Bassa',
      'medium': 'Media',
      'high': 'Alta', 
      'critical': 'Critica'
    };
    
    // Add timeline comment
    const now = new Date().toISOString();
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      workOrderId: priorityWorkOrder.id,
      userId: '1',
      userName: 'David Luchetta',
      userAvatar: 'DL',
      message: `Ha modificato la priorità: ${priorityLabels[priority]}`,
      timestamp: now,
      type: 'system'
    };
    
    const existingComments = priorityWorkOrder.comments || [];
    const updatedWorkOrder = {
      ...priorityWorkOrder,
      priority: priority,
      comments: [...existingComments, newComment]
    };
    
    saveWorkOrder(updatedWorkOrder);
    
    // Update workOrders state immediately for UI refresh
    const updatedWorkOrders = workOrders.map(wo => 
      wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo
    );
    setWorkOrders(updatedWorkOrders);
    
    // Update selectedWorkOrder if it's the same work order
    if (selectedWorkOrder?.id === updatedWorkOrder.id) {
      setSelectedWorkOrder(updatedWorkOrder);
    }
    
    alert(`Priorità aggiornata: ${priorityLabels[priority]}`);
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

  // Card Quick Actions
  const handleCardQuickAction = (action: string, workOrder: WorkOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCardMenu(null);
    
    switch(action) {
      case 'schedule':
        setDatePickerWorkOrder(workOrder);
        setShowDatePicker(true);
        break;
      case 'duplicate':
        const duplicatedWO = {
          ...workOrder,
          id: Date.now().toString(),
          title: `Copia di: ${workOrder.title}`,
          status: 'open' as WorkOrder['status'],
          createdDate: new Date().toISOString().split('T')[0],
          comments: [] // Reset comments for new work order
        };
        
        // Add timeline comment to original work order
        const now = new Date().toISOString();
        const newComment: Comment = {
          id: `c-${Date.now()}`,
          workOrderId: workOrder.id,
          userId: '1',
          userName: 'David Luchetta',
          userAvatar: 'DL',
          message: `Ha duplicato questo ordine di lavoro (Nuovo ID: #${duplicatedWO.id})`,
          timestamp: now,
          type: 'system'
        };
        
        const duplicateComments = workOrder.comments || [];
        const updatedOriginalWO = {
          ...workOrder,
          comments: [...duplicateComments, newComment]
        };
        
        // Save both work orders
        saveWorkOrder(duplicatedWO);
        saveWorkOrder(updatedOriginalWO);
        
        // Update workOrders state
        const duplicateUpdatedWorkOrders = workOrders.map(wo => 
          wo.id === workOrder.id ? updatedOriginalWO : wo
        );
        duplicateUpdatedWorkOrders.push(duplicatedWO);
        setWorkOrders(duplicateUpdatedWorkOrders);
        
        // Update selected work order if it was the original one
        if (selectedWorkOrder?.id === workOrder.id) {
          setSelectedWorkOrder(updatedOriginalWO);
        }
        
        setSelectedWorkOrder(duplicatedWO);
        alert('Ordine di lavoro duplicato con successo!');
        break;
      case 'assign':
        setAssignmentWorkOrder(workOrder);
        setShowAssignmentModal(true);
        break;
      case 'categories':
        setCategoriesWorkOrder(workOrder);
        setShowCategoriesModal(true);
        break;
      case 'priority':
        setPriorityWorkOrder(workOrder);
        setShowPriorityModal(true);
        break;
      case 'complete':
        // Create a specific status update for this workOrder
        const completeNow = new Date().toISOString();
        const nowDate = completeNow.split('T')[0];
        
        const statusMessage = 'Ha completato l\'ordine di lavoro.';
        
        const completeComment: Comment = {
          id: `c-${Date.now()}`,
          workOrderId: workOrder.id,
          userId: '1',
          userName: 'David Luchetta',
          userAvatar: 'DL',
          message: statusMessage,
          timestamp: completeNow,
          type: 'status_change',
          statusChange: { from: workOrder.status, to: 'completed' }
        };
        
        const existingComments = workOrder.comments || [];
        
        const updatedWorkOrder = { 
          ...workOrder, 
          status: 'completed' as WorkOrder['status'],
          comments: [...existingComments, completeComment],
          completedDate: nowDate
        };
        
        saveWorkOrder(updatedWorkOrder);
        
        // Update the workOrders state
        const completeUpdatedWorkOrders = workOrders.map(wo => 
          wo.id === workOrder.id ? updatedWorkOrder : wo
        );
        setWorkOrders(completeUpdatedWorkOrders);
        
        // Update selected work order if it's the same one
        if (selectedWorkOrder?.id === workOrder.id) {
          setSelectedWorkOrder(updatedWorkOrder);
        }
        break;
      case 'delete':
        if (confirm('Sei sicuro di voler eliminare questo ordine di lavoro?')) {
          // In a real app, you'd have a deleteWorkOrder function
          const updatedWOs = workOrders.filter(wo => wo.id !== workOrder.id);
          setWorkOrders(updatedWOs);
          if (selectedWorkOrder?.id === workOrder.id) {
            setSelectedWorkOrder(updatedWOs.length > 0 ? updatedWOs[0] : null);
          }
          alert('Ordine di lavoro eliminato');
        }
        break;
    }
  };

  const updateWorkOrderPriority = (workOrder: WorkOrder, priority: 'high' | 'medium' | 'low') => {
    const updatedWO = { ...workOrder, priority };
    saveWorkOrder(updatedWO);
    
    const updatedWOs = workOrders.map(wo => wo.id === workOrder.id ? updatedWO : wo);
    setWorkOrders(updatedWOs);
    
    if (selectedWorkOrder?.id === workOrder.id) {
      setSelectedWorkOrder(updatedWO);
    }
    
    const priorityLabel = priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Bassa';
    alert(`Priorità aggiornata a: ${priorityLabel}`);
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
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors relative group ${
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
                      <select
                        value={workOrder.status}
                        onChange={(e) => {
                          e.stopPropagation(); // Prevent card selection
                          const newStatus = e.target.value as WorkOrder['status'];
                          const updatedWorkOrder = { ...workOrder, status: newStatus };
                          
                          // Add status change comment
                          const now = new Date().toISOString();
                          const statusMessages = {
                            'open': 'Ha riaperto l\'ordine di lavoro.',
                            'on_hold': 'Ha messo l\'ordine di lavoro in attesa.',
                            'in_progress': 'Ha iniziato l\'avanzamento sull\'ordine di lavoro.',
                            'completed': 'Ha completato l\'ordine di lavoro.'
                          };
                          
                          const newComment: Comment = {
                            id: `c-${Date.now()}`,
                            workOrderId: workOrder.id,
                            userId: '1',
                            userName: 'David Luchetta',
                            userAvatar: 'DL',
                            message: statusMessages[newStatus],
                            timestamp: now,
                            type: 'status_change',
                            statusChange: { from: workOrder.status, to: newStatus }
                          };
                          
                          const existingComments = workOrder.comments || [];
                          updatedWorkOrder.comments = [...existingComments, newComment];
                          
                          saveWorkOrder(updatedWorkOrder);
                          
                          // Update state
                          const updatedWorkOrders = workOrders.map(wo => 
                            wo.id === workOrder.id ? updatedWorkOrder : wo
                          );
                          setWorkOrders(updatedWorkOrders);
                          
                          // Update selected work order if it's the current one
                          if (selectedWorkOrder?.id === workOrder.id) {
                            setSelectedWorkOrder(updatedWorkOrder);
                          }
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none ${getStatusColor(workOrder.status)}`}
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 4px center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '12px',
                          paddingRight: '20px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="open">Aperto</option>
                        <option value="on_hold">In attesa</option>
                        <option value="in_progress">In corso</option>
                        <option value="completed">Fatto</option>
                      </select>
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
                        <span className={isWorkOrderOverdue(workOrder) ? 'text-red-600' : 'text-green-600'}>
                          {getWorkOrderStatus(workOrder)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCardMenu(activeCardMenu === workOrder.id ? null : workOrder.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all card-menu-button"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </button>
                    
                    {activeCardMenu === workOrder.id && (
                      <div className="card-quick-menu absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <div className="py-1">
                          <button
                            onClick={(e) => handleCardQuickAction('schedule', workOrder, e)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Calendar className="h-4 w-4" />
                            Programma
                          </button>
                          <button
                            onClick={(e) => handleCardQuickAction('duplicate', workOrder, e)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Duplica
                          </button>
                          <button
                            onClick={(e) => handleCardQuickAction('assign', workOrder, e)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            Assegna
                          </button>
                          <button
                            onClick={(e) => handleCardQuickAction('categories', workOrder, e)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Tag className="h-4 w-4" />
                            Categorie
                          </button>
                          <button
                            onClick={(e) => handleCardQuickAction('priority', workOrder, e)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <AlertTriangle className="h-4 w-4" />
                            Priorità
                          </button>
                          <button
                            onClick={(e) => handleCardQuickAction('complete', workOrder, e)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FileCheck className="h-4 w-4" />
                            Completa
                          </button>
                          <hr className="border-gray-200 my-1" />
                          <button
                            onClick={(e) => handleCardQuickAction('delete', workOrder, e)}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Elimina
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Work Order Details and Timeline */}
      <div className="flex-1 flex bg-white">
        {selectedWorkOrder ? (
          <>
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedWorkOrder.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>
                        Manutenzione • 
                        <span className={isWorkOrderOverdue(selectedWorkOrder) ? 'text-red-600 ml-1' : 'text-green-600 ml-1'}>
                          {isWorkOrderOverdue(selectedWorkOrder) ? `In ritardo da ${formatDate(selectedWorkOrder.dueDate)}` : `Scadenza: ${formatDate(selectedWorkOrder.dueDate)}`}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowWorkflowManager(true)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Workflow
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowNotificationManager(true)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Notifiche
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

                {/* Interactive Status Workflow */}
                <div className="flex items-center gap-3 mb-4">
                  {/* Aperto */}
                  <div className="text-center">
                    <button
                      onClick={() => handleStatusUpdate('open')}
                      disabled={selectedWorkOrder.status === 'completed'}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all hover:scale-105 disabled:cursor-not-allowed ${
                        selectedWorkOrder.status === 'open' 
                          ? 'bg-blue-200 border-blue-500 text-blue-700 shadow-md' 
                          : 'bg-gray-100 border-gray-300 text-gray-400 hover:bg-gray-200 hover:border-gray-400'
                      }`}
                      title="Imposta come Aperto"
                    >
                      <Unlock className="h-6 w-6" />
                    </button>
                    <div className="text-xs font-medium mt-1">Aperto</div>
                  </div>
                  
                  {/* Connettore */}
                  <div className={`w-8 h-0.5 ${selectedWorkOrder.status !== 'open' ? 'bg-orange-300' : 'bg-gray-300'}`}></div>
                  
                  {/* In attesa */}
                  <div className="text-center">
                    <button
                      onClick={() => handleStatusUpdate('on_hold')}
                      disabled={selectedWorkOrder.status === 'completed'}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all hover:scale-105 disabled:cursor-not-allowed ${
                        selectedWorkOrder.status === 'on_hold' 
                          ? 'bg-orange-200 border-orange-500 text-orange-700 shadow-md' 
                          : 'bg-gray-100 border-gray-300 text-gray-400 hover:bg-gray-200 hover:border-gray-400'
                      }`}
                      title="Imposta come In attesa"
                    >
                      <AlertTriangle className="h-6 w-6" />
                    </button>
                    <div className="text-xs font-medium mt-1">In attesa</div>
                  </div>

                  {/* Connettore */}
                  <div className={`w-8 h-0.5 ${selectedWorkOrder.status === 'in_progress' || selectedWorkOrder.status === 'completed' ? 'bg-purple-300' : 'bg-gray-300'}`}></div>

                  {/* In corso */}
                  <div className="text-center">
                    <button
                      onClick={() => handleStatusUpdate('in_progress')}
                      disabled={selectedWorkOrder.status === 'completed'}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all hover:scale-105 disabled:cursor-not-allowed ${
                        selectedWorkOrder.status === 'in_progress' 
                          ? 'bg-purple-200 border-purple-500 text-purple-700 shadow-md' 
                          : 'bg-gray-100 border-gray-300 text-gray-400 hover:bg-gray-200 hover:border-gray-400'
                      }`}
                      title="Imposta come In corso"
                    >
                      <Activity className="h-6 w-6" />
                    </button>
                    <div className="text-xs font-medium mt-1">In corso</div>
                  </div>

                  {/* Connettore */}
                  <div className={`w-8 h-0.5 ${selectedWorkOrder.status === 'completed' ? 'bg-green-300' : 'bg-gray-300'}`}></div>

                  {/* Fatto */}
                  <div className="text-center">
                    <button
                      onClick={() => handleStatusUpdate('completed')}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all hover:scale-105 ${
                        selectedWorkOrder.status === 'completed' 
                          ? 'bg-green-200 border-green-500 text-green-700 shadow-md' 
                          : 'bg-gray-100 border-gray-300 text-gray-400 hover:bg-gray-200 hover:border-gray-400'
                      }`}
                      title="Contrassegna come Completato"
                    >
                      <CheckCircle className="h-6 w-6" />
                    </button>
                    <div className="text-xs font-medium mt-1">Fatto</div>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Clicca sui passaggi sopra per cambiare lo stato dell'ordine di lavoro
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedWorkOrder.status === 'completed' && selectedWorkOrder.completedDate && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        Completato il {formatDate(selectedWorkOrder.completedDate)}
                      </span>
                    )}
                    <Button variant="ghost" size="sm">
                      <Lock className="h-4 w-4 mr-2" />
                      Condividi esternamente
                    </Button>
                  </div>
                </div>
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
                        <span className={isWorkOrderOverdue(selectedWorkOrder) ? 'text-red-600' : 'text-green-600'}>
                          {getWorkOrderStatus(selectedWorkOrder)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatDate(selectedWorkOrder.dueDate)}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Priorità</h3>
                      <div className="flex items-center gap-3">
                        {selectedWorkOrder.priority === 'critical' && (
                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          </div>
                        )}
                        {selectedWorkOrder.priority === 'high' && (
                          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          </div>
                        )}
                        {selectedWorkOrder.priority === 'medium' && (
                          <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          </div>
                        )}
                        {selectedWorkOrder.priority === 'low' && (
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        )}
                        <span className="text-sm capitalize">{selectedWorkOrder.priority === 'high' ? 'Alta' : selectedWorkOrder.priority === 'medium' ? 'Media' : selectedWorkOrder.priority === 'critical' ? 'Critica' : 'Bassa'}</span>
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
                </div>
              </div>
            </div>

            {/* Timeline Sidebar */}
            <TimelineSidebar 
              workOrder={selectedWorkOrder} 
              onAddComment={handleAddCommentFromModal}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Seleziona un ordine di lavoro per visualizzare i dettagli
          </div>
        )}
      </div>

      {/* Create Work Order Modal */}
      {showCreateModal && (
        <WorkOrderFormNew
          onSave={handleCreateWorkOrder}
          onCancel={() => setShowCreateModal(false)}
        />
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
                    <option value="critical">Critica</option>
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

      {/* Comments Modal */}
      {showCommentsModal && selectedWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Commenti</h2>
                  <p className="text-sm text-gray-600">{selectedWorkOrder.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCommentsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedWorkOrder.comments && selectedWorkOrder.comments.length > 0 ? (
                selectedWorkOrder.comments
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          comment.type === 'status_change' ? 'bg-orange-500' : 'bg-blue-600'
                        }`}>
                          {comment.userAvatar}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900">
                              {comment.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.timestamp).toLocaleString('it-IT')}
                            </span>
                          </div>
                          {comment.type === 'status_change' && comment.statusChange ? (
                            <div className="text-sm text-gray-700">
                              Ha cambiato lo stato da <strong>{comment.statusChange.from}</strong> a <strong>{comment.statusChange.to}</strong>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700">{comment.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nessun commento ancora</p>
                  <p className="text-gray-400 text-xs">Scrivi il primo commento qui sotto</p>
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    DL
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Scrivi un commento..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <Button 
                      onClick={() => {
                        handleAddCommentFromModal(newComment);
                        setNewComment('');
                      }}
                      disabled={!newComment.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Invia
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && datePickerWorkOrder && (
        <DatePickerModal
          isOpen={showDatePicker}
          onClose={() => {
            setShowDatePicker(false);
            setDatePickerWorkOrder(null);
          }}
          currentDate={datePickerWorkOrder.dueDate}
          onDateChange={handleDateChange}
          title={`Modifica Data - ${datePickerWorkOrder.title}`}
        />
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && assignmentWorkOrder && (
        <AssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
            setAssignmentWorkOrder(null);
          }}
          currentAssignee={assignmentWorkOrder.assignedTo}
          onAssign={handleAssignment}
          title={`Assegna - ${assignmentWorkOrder.title}`}
        />
      )}

      {/* Categories Modal */}
      {showCategoriesModal && categoriesWorkOrder && (
        <CategoriesModal
          isOpen={showCategoriesModal}
          onClose={() => {
            setShowCategoriesModal(false);
            setCategoriesWorkOrder(null);
          }}
          currentCategories={categoriesWorkOrder?.categoryId ? [categoriesWorkOrder.categoryId] : []}
          onCategoriesChange={handleCategoriesChange}
          title="Modifica categoria:"
        />
      )}

      {/* Priority Modal */}
      {showPriorityModal && priorityWorkOrder && (
        <PriorityModal
          isOpen={showPriorityModal}
          onClose={() => {
            setShowPriorityModal(false);
            setPriorityWorkOrder(null);
          }}
          currentPriority={priorityWorkOrder.priority}
          onPriorityChange={handlePriorityChange}
          title="Modifica priorità"
        />
      )}

      {/* Workflow Manager */}
      <WorkflowManagerClient
        isOpen={showWorkflowManager}
        onClose={() => setShowWorkflowManager(false)}
      />
      
      {/* Notification Manager */}
      {showNotificationManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[85vh] max-w-6xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Gestione Notifiche</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotificationManager(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 overflow-auto h-[calc(85vh-80px)]">
              <NotificationManagerClient />
            </div>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      <TimelineModal
        isOpen={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
        workOrder={selectedWorkOrder}
        onAddComment={handleAddCommentFromModal}
      />

      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[85vh] max-w-6xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-red-50">
              <h2 className="text-xl font-semibold text-red-800">🔍 Debug Panel</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebugPanel(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 overflow-auto h-[calc(85vh-80px)] space-y-4">
              
              {/* Storage Status */}
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">📦 Storage Status</h3>
                <div className="text-sm font-mono">
                  <div>Total WorkOrders: {workOrders.length}</div>
                  <div>Selected WorkOrder: {selectedWorkOrder?.id || 'None'}</div>
                  <div>LocalStorage Keys: {typeof window !== 'undefined' ? Object.keys(localStorage).filter(k => k.startsWith('asset_management_')).length : 0}</div>
                </div>
              </div>

              {/* Current WorkOrder */}
              {selectedWorkOrder && (
                <div className="bg-blue-50 p-4 rounded">
                  <h3 className="font-bold text-lg mb-2">📋 Selected WorkOrder</h3>
                  <div className="text-sm font-mono space-y-1">
                    <div><strong>ID:</strong> {selectedWorkOrder.id}</div>
                    <div><strong>Title:</strong> {selectedWorkOrder.title}</div>
                    <div><strong>Status:</strong> {selectedWorkOrder.status}</div>
                    <div><strong>Comments:</strong> {selectedWorkOrder.comments?.length || 0}</div>
                  </div>
                </div>
              )}

              {/* Comments Detail */}
              {selectedWorkOrder?.comments && selectedWorkOrder.comments.length > 0 && (
                <div className="bg-green-50 p-4 rounded">
                  <h3 className="font-bold text-lg mb-2">💬 Comments ({selectedWorkOrder.comments.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedWorkOrder.comments.map((comment, index) => (
                      <div key={comment.id} className="bg-white p-2 rounded border text-xs">
                        <div><strong>{comment.userName}</strong> ({comment.type})</div>
                        <div>{comment.message}</div>
                        {comment.statusChange && (
                          <div className="text-purple-600">
                            Status: {comment.statusChange.from} → {comment.statusChange.to}
                          </div>
                        )}
                        <div className="text-gray-500">{comment.timestamp}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Sidebar Status */}
              <div className="bg-yellow-50 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">🕐 Timeline Status</h3>
                <div className="text-sm font-mono">
                  <div>TimelineSidebar workOrder prop: {selectedWorkOrder?.id || 'null'}</div>
                  <div>Comments in TimelineSidebar: {selectedWorkOrder?.comments?.length || 0}</div>
                  <div>React State Updated: {Date.now()}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-purple-50 p-4 rounded">
                <h3 className="font-bold text-lg mb-2">🔧 Debug Actions</h3>
                <div className="space-x-2">
                  <Button 
                    size="sm"
                    onClick={() => {
                      const allWO = getWorkOrders();
                      console.log('All WorkOrders:', allWO);
                      alert(`Found ${allWO.length} work orders in storage`);
                    }}
                  >
                    Check Storage
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      if (selectedWorkOrder) {
                        console.log('Selected WorkOrder:', selectedWorkOrder);
                        console.log('Comments:', selectedWorkOrder.comments);
                        alert(`Selected WO has ${selectedWorkOrder.comments?.length || 0} comments`);
                      }
                    }}
                  >
                    Check Selected WO
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      loadWorkOrders();
                      alert('Data reloaded from storage');
                    }}
                  >
                    Reload Data
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}