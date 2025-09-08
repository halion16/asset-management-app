'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMaintenanceEvents, saveMaintenanceEvent, deleteMaintenanceEvent, initializeStorage, getWorkOrders, updateWorkOrderDueDate } from "@/lib/storage";
import { MaintenanceEvent } from "@/data/mockData";
import { 
  Calendar as CalendarIcon,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  Settings,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  CheckCircle2,
  X,
  Bell,
  BellRing,
  EyeOff,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar as CalendarTemplate,
  Users,
  Eye,
  Save,
  Copy,
  Wrench,
  Truck,
  Package,
  Download,
  FileText,
  Palette,
  Zap,
  Target,
  Gauge
} from "lucide-react";

const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const DAYS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

const typeColors = {
  preventive: "bg-blue-500 border-blue-600",
  inspection: "bg-orange-500 border-orange-600", 
  calibration: "bg-purple-500 border-purple-600",
  cleaning: "bg-green-500 border-green-600"
};

const typeLabels = {
  preventive: "Preventiva",
  inspection: "Ispezione",
  calibration: "Calibrazione",
  cleaning: "Pulizia"
};

const statusColors = {
  scheduled: "text-blue-600 bg-blue-50 border-blue-200",
  in_progress: "text-orange-600 bg-orange-50 border-orange-200",
  completed: "text-green-600 bg-green-50 border-green-200",
  cancelled: "text-gray-600 bg-gray-50 border-gray-200",
  overdue: "text-red-600 bg-red-50 border-red-200"
};

const statusLabels = {
  scheduled: "Programmato",
  in_progress: "In corso",
  completed: "Completato",
  cancelled: "Annullato",
  overdue: "Scaduto"
};

const priorityColors = {
  low: "text-green-600 bg-green-50",
  medium: "text-yellow-600 bg-yellow-50",
  high: "text-orange-600 bg-orange-50",
  critical: "text-red-600 bg-red-50"
};

const technicianColors = [
  'bg-blue-500 border-blue-600',
  'bg-green-500 border-green-600', 
  'bg-purple-500 border-purple-600',
  'bg-red-500 border-red-600',
  'bg-yellow-500 border-yellow-600',
  'bg-pink-500 border-pink-600',
  'bg-indigo-500 border-indigo-600',
  'bg-teal-500 border-teal-600'
];

// Resource management interfaces
interface Resource {
  id: string;
  name: string;
  type: 'tool' | 'vehicle' | 'equipment' | 'material';
  available: boolean;
  location: string;
  assignedTo?: string;
  maintenanceSchedule?: string;
}

interface TechnicianCapacity {
  technicianName: string;
  maxHoursPerDay: number;
  currentHours: { [date: string]: number };
  skills: string[];
  availability: { [date: string]: 'available' | 'busy' | 'off' };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<MaintenanceEvent[]>([]);
  const [selectedView, setSelectedView] = useState<'month' | 'week' | 'day' | 'list' | 'analytics' | 'resources'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>(['all']);
  const [draggedEvent, setDraggedEvent] = useState<MaintenanceEvent | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);
  const [eventTemplates, setEventTemplates] = useState<MaintenanceEvent[]>([]);
  const [selectedEventForPopover, setSelectedEventForPopover] = useState<MaintenanceEvent | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
  
  // Resource Management State
  const [resources, setResources] = useState<Resource[]>([
    { id: 'r1', name: 'Trapano Professionale', type: 'tool', available: true, location: 'Magazzino A', assignedTo: undefined, maintenanceSchedule: '2025-01-15' },
    { id: 'r2', name: 'Furgone Iveco', type: 'vehicle', available: false, location: 'Parcheggio', assignedTo: 'Marco Rossi', maintenanceSchedule: '2025-02-01' },
    { id: 'r3', name: 'Compressore Aria', type: 'equipment', available: true, location: 'Officina', assignedTo: undefined, maintenanceSchedule: '2025-01-20' },
    { id: 'r4', name: 'Kit Bulloni M8', type: 'material', available: true, location: 'Magazzino B', assignedTo: undefined }
  ]);
  
  const [technicianCapacities, setTechnicianCapacities] = useState<TechnicianCapacity[]>([
    {
      technicianName: 'Giulia Bianchi',
      maxHoursPerDay: 8,
      currentHours: {},
      skills: ['elettrico', 'idraulico', 'meccanico'],
      availability: {}
    },
    {
      technicianName: 'Marco Rossi', 
      maxHoursPerDay: 8,
      currentHours: {},
      skills: ['meccanico', 'saldatura'],
      availability: {}
    },
    {
      technicianName: 'Luca Verdi',
      maxHoursPerDay: 8,
      currentHours: {},
      skills: ['elettrico', 'automazione'],
      availability: {}
    }
  ]);
  
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    assetId: '',
    assetName: '',
    type: 'preventive' as const,
    scheduledDate: '',
    scheduledTime: '09:00',
    duration: 2,
    assignedTo: 'Giulia Bianchi',
    location: 'Franciocorta',
    priority: 'medium' as const,
    recurrence: {
      enabled: false,
      type: 'monthly' as const,
      interval: 1
    }
  });

  useEffect(() => {
    initializeStorage();
    loadEvents();
    syncWorkOrdersToCalendar();
  }, []);

  const syncWorkOrdersToCalendar = () => {
    try {
      const workOrders = getWorkOrders();
      const existingEvents = getMaintenanceEvents();
      
      // Filter work orders that have due dates but no corresponding calendar events
      const workOrdersToSync = workOrders.filter(wo => {
        const hasValidDueDate = wo.dueDate && wo.dueDate !== '';
        const notCompleted = wo.status !== 'completed';
        const noExistingEvent = !existingEvents.some(event => 
          event.assetId === wo.assetId && 
          event.scheduledDate === wo.dueDate &&
          event.title.includes(wo.title)
        );
        
        return hasValidDueDate && notCompleted && noExistingEvent;
      });

      // Create calendar events for work orders
      workOrdersToSync.forEach(workOrder => {
        const maintenanceEvent: MaintenanceEvent = {
          id: `wo-${workOrder.id}`,
          title: `${workOrder.title}`,
          description: `${workOrder.description} (Auto-generato da ordine di lavoro #${workOrder.orderNumber || workOrder.id})`,
          assetId: workOrder.assetId,
          assetName: workOrder.assetName,
          type: mapWorkOrderTypeToMaintenanceType(workOrder.type),
          scheduledDate: workOrder.dueDate,
          scheduledTime: '09:00', // Default time
          duration: parseEstimatedTime(workOrder.estimatedTime),
          assignedTo: workOrder.assignedTo,
          status: 'scheduled',
          location: workOrder.location,
          priority: workOrder.priority,
          workOrderId: workOrder.id, // Link back to work order
          notes: `Evento auto-generato dall'ordine di lavoro. Modifica l'ordine di lavoro per sincronizzare le modifiche.`
        };

        saveMaintenanceEvent(maintenanceEvent);
      });

      if (workOrdersToSync.length > 0) {
        console.log(`🔄 Sincronizzati ${workOrdersToSync.length} ordini di lavoro nel calendario`);
        loadEvents(); // Reload to show new events
      }
    } catch (error) {
      console.error('Errore durante la sincronizzazione degli ordini di lavoro:', error);
    }
  };

  const mapWorkOrderTypeToMaintenanceType = (workOrderType: string): MaintenanceEvent['type'] => {
    switch (workOrderType) {
      case 'preventive': return 'preventive';
      case 'corrective': return 'inspection';
      case 'emergency': return 'inspection';
      case 'compliance': return 'calibration';
      case 'safety': return 'cleaning';
      default: return 'preventive';
    }
  };

  const parseEstimatedTime = (estimatedTime: string): number => {
    // Parse "2h", "30m", "1h 30m" etc.
    const match = estimatedTime.match(/(\d+)h?/);
    return match ? parseInt(match[1]) : 2; // Default 2 hours
  };

  const getTechnicianColor = (technicianName: string) => {
    const allTechnicians = Array.from(new Set(events.map(e => e.assignedTo))).sort();
    const index = allTechnicians.indexOf(technicianName);
    return technicianColors[index % technicianColors.length] || technicianColors[0];
  };

  // Template management
  const saveAsTemplate = (event: MaintenanceEvent) => {
    const template: MaintenanceEvent = {
      ...event,
      id: `template-${Date.now()}`,
      title: `[Template] ${event.title}`,
      scheduledDate: '',
      status: 'scheduled'
    };
    
    const updatedTemplates = [...eventTemplates, template];
    setEventTemplates(updatedTemplates);
    localStorage.setItem('maintenance_event_templates', JSON.stringify(updatedTemplates));
    alert('Template salvato con successo!');
  };

  const createEventFromTemplate = (template: MaintenanceEvent, scheduledDate: string, scheduledTime: string) => {
    const newEvent: MaintenanceEvent = {
      ...template,
      id: Date.now().toString(),
      title: template.title.replace('[Template] ', ''),
      scheduledDate,
      scheduledTime,
      status: 'scheduled'
    };
    
    saveMaintenanceEvent(newEvent);
    loadEvents();
    setShowTemplateModal(false);
    alert('Evento creato da template!');
  };

  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = eventTemplates.filter(t => t.id !== templateId);
    setEventTemplates(updatedTemplates);
    localStorage.setItem('maintenance_event_templates', JSON.stringify(updatedTemplates));
  };

  // Resource Management Functions
  const checkResourceAvailability = (eventDate: string, eventDuration: number, requiredResources: string[] = []) => {
    const conflicts: string[] = [];
    const eventsOnDate = events.filter(e => e.scheduledDate === eventDate);
    
    requiredResources.forEach(resourceId => {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) {
        conflicts.push(`Risorsa ${resourceId} non trovata`);
        return;
      }
      
      if (!resource.available) {
        conflicts.push(`${resource.name} non disponibile`);
        return;
      }
      
      // Check if resource is already assigned to another event on the same date
      const conflictingEvent = eventsOnDate.find(e => 
        e.requiredResources?.includes(resourceId)
      );
      
      if (conflictingEvent) {
        conflicts.push(`${resource.name} già assegnata a: ${conflictingEvent.title}`);
      }
    });
    
    return { available: conflicts.length === 0, conflicts };
  };

  const checkTechnicianCapacity = (technicianName: string, eventDate: string, eventDuration: number) => {
    const capacity = technicianCapacities.find(c => c.technicianName === technicianName);
    if (!capacity) {
      return { withinCapacity: false, currentHours: 0, maxHours: 8, reason: 'Tecnico non trovato' };
    }
    
    const currentHours = capacity.currentHours[eventDate] || 0;
    const newTotalHours = currentHours + eventDuration;
    const withinCapacity = newTotalHours <= capacity.maxHoursPerDay;
    
    return { 
      withinCapacity, 
      currentHours, 
      maxHours: capacity.maxHoursPerDay,
      newTotal: newTotalHours,
      reason: withinCapacity ? '' : `Supererebbe la capacità giornaliera (${newTotalHours}/${capacity.maxHoursPerDay} ore)`
    };
  };

  const updateTechnicianCapacity = (technicianName: string, eventDate: string, duration: number, isRemove: boolean = false) => {
    setTechnicianCapacities(prev => 
      prev.map(capacity => {
        if (capacity.technicianName === technicianName) {
          const currentHours = capacity.currentHours[eventDate] || 0;
          const newHours = isRemove ? 
            Math.max(0, currentHours - duration) : 
            currentHours + duration;
            
          return {
            ...capacity,
            currentHours: {
              ...capacity.currentHours,
              [eventDate]: newHours
            }
          };
        }
        return capacity;
      })
    );
  };

  const assignResourceToEvent = (resourceId: string, eventId: string) => {
    setResources(prev => 
      prev.map(resource => 
        resource.id === resourceId 
          ? { ...resource, assignedTo: eventId, available: false }
          : resource
      )
    );
  };

  const releaseResourceFromEvent = (resourceId: string) => {
    setResources(prev => 
      prev.map(resource => 
        resource.id === resourceId 
          ? { ...resource, assignedTo: undefined, available: true }
          : resource
      )
    );
  };

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'tool': return <Wrench className="h-4 w-4" />;
      case 'vehicle': return <Truck className="h-4 w-4" />;
      case 'equipment': return <Zap className="h-4 w-4" />;
      case 'material': return <Package className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const calculateTechnicianWorkload = (technicianName: string, dateRange: { start: Date, end: Date }) => {
    const capacity = technicianCapacities.find(c => c.technicianName === technicianName);
    if (!capacity) return { utilizationRate: 0, totalHours: 0, avgDaily: 0, maxDaily: 8 };
    
    const eventsInRange = events.filter(e => {
      const eventDate = new Date(e.scheduledDate);
      return eventDate >= dateRange.start && eventDate <= dateRange.end && e.assignedTo === technicianName;
    });
    
    const totalHours = eventsInRange.reduce((sum, event) => sum + (event.duration || 0), 0);
    const daysInRange = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const maxPossibleHours = daysInRange * capacity.maxHoursPerDay;
    const utilizationRate = maxPossibleHours > 0 ? (totalHours / maxPossibleHours) * 100 : 0;
    const avgDaily = daysInRange > 0 ? Math.round(totalHours / daysInRange * 10) / 10 : 0;
    
    return {
      utilizationRate: Math.round(utilizationRate),
      totalHours: totalHours,
      avgDaily: avgDaily,
      maxDaily: capacity.maxHoursPerDay
    };
  };

  // Load templates on component mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('maintenance_event_templates');
    if (savedTemplates) {
      setEventTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  useEffect(() => {
    checkUpcomingEvents();
    const interval = setInterval(checkUpcomingEvents, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [events]);

  const checkUpcomingEvents = () => {
    const now = new Date();
    const upcomingEvents = events.filter(event => {
      if (event.status === 'completed' || event.status === 'cancelled') return false;
      if (dismissedNotifications.includes(event.id)) return false;
      
      const eventDate = new Date(`${event.scheduledDate}T${event.scheduledTime || '09:00'}`);
      const timeDiff = eventDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // Notify for events within 24 hours or 2 hours
      return (hoursDiff > 0 && hoursDiff <= 24) || (hoursDiff > 0 && hoursDiff <= 2);
    });

    const newNotifications = upcomingEvents.map(event => {
      const eventDate = new Date(`${event.scheduledDate}T${event.scheduledTime || '09:00'}`);
      const timeDiff = eventDate.getTime() - now.getTime();
      const hoursDiff = Math.round(timeDiff / (1000 * 60 * 60));
      
      if (hoursDiff <= 2) {
        return `🚨 URGENTE: "${event.title}" inizia tra ${hoursDiff <= 1 ? 'meno di 1 ora' : `${hoursDiff} ore`}!`;
      } else {
        return `⏰ Promemoria: "${event.title}" programmato per domani alle ${event.scheduledTime || '09:00'}`;
      }
    });

    setNotifications(newNotifications);
  };

  const dismissNotification = (notification: string) => {
    const event = events.find(e => notification.includes(e.title));
    if (event) {
      setDismissedNotifications(prev => [...prev, event.id]);
    }
    setNotifications(prev => prev.filter(n => n !== notification));
  };

  const loadEvents = () => {
    const eventsData = getMaintenanceEvents();
    setEvents(eventsData);
  };

  const handleEventStatusUpdate = (id: string, newStatus: MaintenanceEvent['status']) => {
    const event = events.find(e => e.id === id);
    if (event) {
      const updatedEvent: MaintenanceEvent = {
        ...event,
        status: newStatus,
        ...(newStatus === 'completed' && { completedDate: new Date().toISOString().split('T')[0] })
      };
      saveMaintenanceEvent(updatedEvent);
      loadEvents();
    }
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo evento?')) {
      deleteMaintenanceEvent(id);
      loadEvents();
    }
  };

  const handleCreateEvent = () => {
    if (!newEvent.title.trim() || !newEvent.scheduledDate) {
      alert('Titolo e data sono obbligatori');
      return;
    }

    const event: MaintenanceEvent = {
      id: Date.now().toString(),
      title: newEvent.title.trim(),
      description: newEvent.description.trim() || undefined,
      assetId: newEvent.assetId || Date.now().toString(),
      assetName: newEvent.assetName.trim() || 'Asset Generico',
      type: newEvent.type,
      scheduledDate: newEvent.scheduledDate,
      scheduledTime: newEvent.scheduledTime,
      duration: newEvent.duration,
      assignedTo: newEvent.assignedTo,
      status: 'scheduled',
      location: newEvent.location,
      priority: newEvent.priority,
      recurrence: newEvent.recurrence.enabled ? {
        type: newEvent.recurrence.type,
        interval: newEvent.recurrence.interval
      } : undefined
    };

    saveMaintenanceEvent(event);
    loadEvents();
    setShowNewEventModal(false);
    setNewEvent({
      title: '',
      description: '',
      assetId: '',
      assetName: '',
      type: 'preventive',
      scheduledDate: '',
      scheduledTime: '09:00',
      duration: 2,
      assignedTo: 'Giulia Bianchi',
      location: 'Franciocorta',
      priority: 'medium',
      recurrence: {
        enabled: false,
        type: 'monthly',
        interval: 1
      }
    });
    alert('Evento creato con successo!');
  };

  const handleDragStart = (event: MaintenanceEvent, e: React.DragEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1';
    setDraggedEvent(null);
  };

  const handleEventClick = (event: MaintenanceEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setSelectedEventForPopover(event);
  };

  const closePopover = () => {
    setSelectedEventForPopover(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetDate: Date, e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedEvent) {
      const newDateStr = targetDate.toISOString().split('T')[0];
      const updatedEvent: MaintenanceEvent = {
        ...draggedEvent,
        scheduledDate: newDateStr
      };
      
      // Update the calendar event
      saveMaintenanceEvent(updatedEvent);
      
      // 🔄 SYNC: Update the linked work order if it exists
      if (draggedEvent.workOrderId) {
        const updatedWorkOrder = updateWorkOrderDueDate(draggedEvent.workOrderId, newDateStr);
        if (updatedWorkOrder) {
          console.log(`✅ Synchronized work order "${updatedWorkOrder.title}" with calendar event`);
        }
      }
      
      loadEvents();
      setDraggedEvent(null);
      
      // Enhanced success message
      const eventDate = targetDate.toLocaleDateString('it-IT');
      const syncMessage = draggedEvent.workOrderId 
        ? ` e sincronizzato con l'ordine di lavoro collegato`
        : '';
      alert(`✅ Evento "${draggedEvent.title}" spostato al ${eventDate}${syncMessage}`);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getDaysInWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      days.push(currentDay);
    }
    
    return days;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getEventPosition = (event: MaintenanceEvent, dayStart: Date) => {
    if (!event.scheduledTime) return { top: 0, height: 60 };
    
    const [hours, minutes] = event.scheduledTime.split(':').map(Number);
    const eventMinutes = hours * 60 + minutes;
    const dayMinutes = 6 * 60; // Start at 6:00
    const slotHeight = 60; // 60px per hour
    
    const top = ((eventMinutes - dayMinutes) / 60) * slotHeight;
    const height = (event.duration || 1) * slotHeight;
    
    return { top: Math.max(0, top), height };
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      if (filterStatus !== 'all' && event.status !== filterStatus) return false;
      if (filterType !== 'all' && event.type !== filterType) return false;
      if (!selectedTechnicians.includes('all') && !selectedTechnicians.includes(event.assignedTo)) return false;
      return event.scheduledDate === dateStr;
    });
  };

  const filteredEvents = events.filter(event => {
    if (filterStatus !== 'all' && event.status !== filterStatus) return false;
    if (filterType !== 'all' && event.type !== filterType) return false;
    if (!selectedTechnicians.includes('all') && !selectedTechnicians.includes(event.assignedTo)) return false;
    return true;
  });

  const nextMonth = () => {
    if (selectedView === 'week') {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextWeek);
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const prevMonth = () => {
    if (selectedView === 'week') {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(currentDate.getDate() - 7);
      setCurrentDate(prevWeek);
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const getViewTitle = () => {
    if (selectedView === 'week') {
      const weekDays = getDaysInWeek(currentDate);
      const startDate = weekDays[0];
      const endDate = weekDays[6];
      
      if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDate.getDate()}-${endDate.getDate()} ${MONTHS[startDate.getMonth()]} ${startDate.getFullYear()}`;
      } else {
        return `${startDate.getDate()} ${MONTHS[startDate.getMonth()]} - ${endDate.getDate()} ${MONTHS[endDate.getMonth()]} ${endDate.getFullYear()}`;
      }
    } else {
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const EventCard = ({ event, showDate = false }: { event: MaintenanceEvent, showDate?: boolean }) => (
    <Card className="p-3 mb-2 hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: typeColors[event.type].split(' ')[0].replace('bg-', '') }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-1 text-xs font-medium rounded ${typeColors[event.type]}`}>
              {typeLabels[event.type]}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded border ${statusColors[event.status]}`}>
              {statusLabels[event.status]}
            </span>
            {event.workOrderId && (
              <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800 border border-green-200">
                <Settings className="h-3 w-3 inline mr-1" />
                Auto-sync
              </span>
            )}
          </div>
          <h4 className="font-semibold text-sm text-gray-900 mb-1">{event.title}</h4>
          <p className="text-xs text-gray-600 mb-2">{event.description}</p>
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          {event.status === 'scheduled' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-green-600 hover:bg-green-50"
              onClick={() => handleEventStatusUpdate(event.id, 'in_progress')}
              title="Inizia"
            >
              <Play className="h-3 w-3" />
            </Button>
          )}
          {event.status === 'in_progress' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50"
              onClick={() => handleEventStatusUpdate(event.id, 'completed')}
              title="Completa"
            >
              <CheckCircle2 className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-purple-600 hover:bg-purple-50"
            onClick={() => saveAsTemplate(event)}
            title="Salva come template"
          >
            <Save className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
            onClick={() => handleDeleteEvent(event.id)}
            title="Elimina"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-1 text-xs text-gray-600">
        {showDate && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-3 w-3" />
            <span>{new Date(event.scheduledDate).toLocaleDateString('it-IT')}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>
            {formatTime(event.scheduledTime)} ({event.duration}h)
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <User className="h-3 w-3" />
          <span>{event.assignedTo}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          <span>{event.location}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Asset:</span>
          <span>{event.assetName}</span>
        </div>

        {event.recurrence && (
          <div className="flex items-center gap-2">
            <Settings className="h-3 w-3" />
            <span>Ricorrente: {event.recurrence.type === 'monthly' ? 'Mensile' : 
                              event.recurrence.type === 'weekly' ? 'Settimanale' :
                              event.recurrence.type === 'quarterly' ? 'Trimestrale' : 'Annuale'}</span>
          </div>
        )}

        {event.notes && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <strong>Note:</strong> {event.notes}
          </div>
        )}
      </div>
    </Card>
  );

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAYS.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDay = isToday(day);
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-200 
                  ${!isCurrentMonthDay ? 'bg-gray-50' : 'bg-white'}
                  ${isTodayDay ? 'bg-blue-50' : ''}
                  hover:bg-gray-50 cursor-pointer transition-colors
                  ${draggedEvent ? 'hover:bg-green-100 hover:border-green-300' : ''}`}
                onClick={() => setSelectedDate(day)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(day, e)}
              >
                <div className={`text-sm font-medium mb-1 
                  ${!isCurrentMonthDay ? 'text-gray-400' : 'text-gray-900'}
                  ${isTodayDay ? 'text-blue-600' : ''}`}>
                  {day.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      draggable={event.status !== 'completed'}
                      onDragStart={(e) => handleDragStart(event, e)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => handleEventClick(event, e)}
                      className={`text-xs p-1 rounded truncate ${typeColors[event.type]} text-white cursor-pointer hover:opacity-80 transition-opacity`}
                      title={`Click per dettagli • Trascina per spostare: ${event.title}${event.workOrderId ? ' (sincronizzerà anche l\'ordine di lavoro)' : ''}`}
                    >
                      {formatTime(event.scheduledTime)} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div 
                      className="text-xs text-gray-500 font-medium cursor-pointer hover:text-gray-700 transition-colors"
                      onClick={() => setSelectedDate(day)}
                    >
                      +{dayEvents.length - 2} altri
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getDaysInWeek(currentDate);
    const timeSlots = getTimeSlots();
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Week Header */}
        <div className="grid grid-cols-8 border-b border-gray-200">
          {/* Time column header */}
          <div className="p-3 bg-gray-50 border-r border-gray-200 text-center">
            <span className="text-sm font-medium text-gray-600">Ora</span>
          </div>
          
          {/* Day headers */}
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isTodayDay = isToday(day);
            
            return (
              <div key={index} className={`p-3 text-center border-r border-gray-200 bg-gray-50 ${isTodayDay ? 'bg-blue-50' : ''}`}>
                <div className={`text-sm font-medium ${isTodayDay ? 'text-blue-600' : 'text-gray-900'}`}>
                  {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'][index]}
                </div>
                <div className={`text-xs ${isTodayDay ? 'text-blue-600' : 'text-gray-600'}`}>
                  {day.getDate()}/{day.getMonth() + 1}
                </div>
                <div className="text-xs text-blue-600 font-medium mt-1">
                  {dayEvents.length} eventi
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Grid */}
        <div className="relative overflow-y-auto max-h-[600px]">
          <div className="grid grid-cols-8 relative">
            {/* Time slots column */}
            <div className="border-r border-gray-200">
              {timeSlots.map((time, index) => (
                <div key={time} className="h-16 flex items-center justify-center border-b border-gray-100 text-xs text-gray-600 bg-gray-50">
                  {time}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => {
              const dayEvents = getEventsForDate(day);
              
              return (
                <div key={dayIndex} className="relative border-r border-gray-200">
                  {/* Time slots background */}
                  {timeSlots.map((time, timeIndex) => (
                    <div
                      key={`${dayIndex}-${timeIndex}`}
                      className="h-16 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={(e) => {
                        const dropTime = time;
                        const newDate = new Date(day);
                        const [hours] = dropTime.split(':').map(Number);
                        newDate.setHours(hours, 0, 0, 0);
                        handleDrop(newDate, e);
                      }}
                    />
                  ))}
                  
                  {/* Events positioned absolutely */}
                  {dayEvents.map((event, eventIndex) => {
                    const position = getEventPosition(event, day);
                    const isOverlapping = dayEvents.some((otherEvent, otherIndex) => 
                      otherIndex < eventIndex && 
                      Math.abs(getEventPosition(otherEvent, day).top - position.top) < 30
                    );
                    
                    return (
                      <div
                        key={event.id}
                        draggable={event.status !== 'completed'}
                        onDragStart={(e) => handleDragStart(event, e)}
                        onDragEnd={handleDragEnd}
                        className={`absolute z-10 left-1 right-1 rounded-md border-l-4 p-2 shadow-sm cursor-move hover:shadow-md transition-all text-white text-xs
                          ${selectedTechnicians.length > 1 && !selectedTechnicians.includes('all') 
                            ? getTechnicianColor(event.assignedTo) 
                            : typeColors[event.type]
                          } bg-opacity-90
                          ${isOverlapping ? 'left-6 right-2' : ''}`}
                        style={{
                          top: `${position.top}px`,
                          height: `${Math.max(position.height - 4, 40)}px`
                        }}
                        title={`${event.title} - ${event.description || ''}${event.workOrderId ? ' 🔗 Sincronizzato con ordine di lavoro' : ''}`}
                      >
                        <div className="font-semibold truncate">
                          {formatTime(event.scheduledTime)} {event.title}
                        </div>
                        <div className="truncate opacity-90">
                          {event.assetName}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <User className="h-3 w-3 opacity-75" />
                          <span className="truncate text-xs opacity-90">
                            {event.assignedTo}
                          </span>
                        </div>
                        
                        {/* Quick actions */}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {event.status === 'scheduled' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventStatusUpdate(event.id, 'in_progress');
                              }}
                              className="w-4 h-4 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center"
                              title="Inizia"
                            >
                              <Play className="h-2 w-2 text-white" />
                            </button>
                          )}
                          {event.status === 'in_progress' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventStatusUpdate(event.id, 'completed');
                              }}
                              className="w-4 h-4 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center"
                              title="Completa"
                            >
                              <CheckCircle2 className="h-2 w-2 text-white" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs">
            {selectedTechnicians.length > 1 && !selectedTechnicians.includes('all') ? (
              // Technician legend
              <>
                {Array.from(new Set(events.map(e => e.assignedTo))).sort().map((tech, index) => (
                  <div key={tech} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${technicianColors[index % technicianColors.length]?.split(' ')[0]}`}></div>
                    <span>{tech}</span>
                  </div>
                ))}
                <div className="text-gray-600 ml-4">
                  👥 Vista Multi-Tecnico • Colori per tecnico
                </div>
              </>
            ) : (
              // Type legend
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Preventiva</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span>Ispezione</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>Calibrazione</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Pulizia</span>
                </div>
                <div className="text-gray-600 ml-4">
                  💡 Trascina eventi per spostarli (sincronizza automaticamente con ordini di lavoro) • Click per azioni rapide
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalyticsView = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasso Completamento</p>
                <p className="text-2xl font-bold text-green-600">{analytics.completionRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Medio</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.averageTime}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Eventi Recenti</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.recentEvents}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Ritardo</p>
                <p className="text-2xl font-bold text-red-600">{analytics.overdueEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technician Workload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Carico di Lavoro per Tecnico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.technicianWorkload).map(([tech, count]) => (
                <div key={tech} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{tech}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((count / Math.max(...Object.values(analytics.technicianWorkload))) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold min-w-[2rem]">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuzione per Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.typeDistribution).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${typeColors[type as keyof typeof typeColors]?.replace('text-white', '')}`}></div>
                    <span className="font-medium">{typeLabels[type as keyof typeof typeLabels]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${typeColors[type as keyof typeof typeColors]?.split(' ')[0]}`}
                        style={{ width: `${(count / analytics.totalEvents) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold min-w-[2rem]">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Trend Mensile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-40 border-b border-gray-200">
            {analytics.monthlyTrend.map((month, index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div className="flex flex-col items-center gap-1 h-32 justify-end">
                  <div 
                    className="bg-blue-500 rounded-t min-w-[20px] w-6 transition-all hover:bg-blue-600"
                    style={{ height: `${Math.max((month.events / Math.max(...analytics.monthlyTrend.map(m => m.events))) * 120, 4)}px` }}
                    title={`${month.events} eventi totali`}
                  ></div>
                  <div 
                    className="bg-green-500 rounded-t min-w-[20px] w-6 -mt-1 transition-all hover:bg-green-600"
                    style={{ height: `${Math.max((month.completed / Math.max(...analytics.monthlyTrend.map(m => m.completed))) * 60, 2)}px` }}
                    title={`${month.completed} completati`}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{month.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Eventi Totali</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Completati</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResourcesView = () => (
    <div className="space-y-6">
      {/* Resource Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risorse Totali</p>
                <p className="text-2xl font-bold text-blue-600">{resources.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disponibili</p>
                <p className="text-2xl font-bold text-green-600">{resources.filter(r => r.available).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Uso</p>
                <p className="text-2xl font-bold text-orange-600">{resources.filter(r => !r.available).length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Manutenzioni Prossime</p>
                <p className="text-2xl font-bold text-red-600">{resources.filter(r => r.maintenanceSchedule && new Date(r.maintenanceSchedule) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}</p>
              </div>
              <Wrench className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resources List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Gestione Risorse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resources.map(resource => (
                <div key={resource.id} className={`p-3 border rounded-lg ${resource.available ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getResourceIcon(resource.type)}
                      <div>
                        <h4 className="font-medium text-gray-900">{resource.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {resource.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${resource.available ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {resource.available ? 'Disponibile' : 'In Uso'}
                      </div>
                      {resource.assignedTo && (
                        <p className="text-xs text-gray-500 mt-1">
                          Assegnata a: {resource.assignedTo}
                        </p>
                      )}
                    </div>
                  </div>
                  {resource.maintenanceSchedule && (
                    <div className="mt-2 text-xs text-gray-500">
                      Prossima manutenzione: {new Date(resource.maintenanceSchedule).toLocaleDateString('it-IT')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technician Capacity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Capacità Tecnici
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {technicianCapacities.map(capacity => {
                const thisWeekStart = new Date();
                thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
                const thisWeekEnd = new Date(thisWeekStart);
                thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);
                
                const workload = calculateTechnicianWorkload(capacity.technicianName, { 
                  start: thisWeekStart, 
                  end: thisWeekEnd 
                });
                
                return (
                  <div key={capacity.technicianName} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{capacity.technicianName}</h4>
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-gray-500" />
                        <span className={`text-sm font-medium ${
                          workload.utilizationRate > 80 ? 'text-red-600' :
                          workload.utilizationRate > 60 ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {workload.utilizationRate}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Utilization bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${
                          workload.utilizationRate > 80 ? 'bg-red-500' :
                          workload.utilizationRate > 60 ? 'bg-orange-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(workload.utilizationRate, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Ore settimana:</span>
                        <span>{workload.totalHours}h / {workload.maxDaily * 7}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Media giornaliera:</span>
                        <span>{workload.avgDaily}h</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {capacity.skills.map(skill => (
                          <span key={skill} className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessun evento trovato
          </h3>
          <p className="text-gray-500">
            Non ci sono eventi di manutenzione con i filtri selezionati
          </p>
        </div>
      ) : (
        filteredEvents.map(event => (
          <EventCard key={event.id} event={event} showDate={true} />
        ))
      )}
    </div>
  );

  // Analytics calculations
  const getAnalytics = () => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const recentEvents = events.filter(event => 
      new Date(event.scheduledDate) >= last30Days
    );

    const completionRate = events.length > 0 
      ? (events.filter(e => e.status === 'completed').length / events.length) * 100 
      : 0;

    const averageCompletionTime = events
      .filter(e => e.status === 'completed' && e.actualTime)
      .reduce((acc, e) => acc + parseFloat(e.actualTime || '0'), 0) / 
      Math.max(1, events.filter(e => e.status === 'completed' && e.actualTime).length);

    const technicianWorkload = events.reduce((acc, event) => {
      acc[event.assignedTo] = (acc[event.assignedTo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeDistribution = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const month = i;
      const monthEvents = events.filter(event => 
        new Date(event.scheduledDate).getMonth() === month
      );
      return {
        month: MONTHS[i].substring(0, 3),
        events: monthEvents.length,
        completed: monthEvents.filter(e => e.status === 'completed').length
      };
    });

    return {
      completionRate: Math.round(completionRate),
      averageTime: Math.round(averageCompletionTime * 10) / 10,
      totalEvents: events.length,
      recentEvents: recentEvents.length,
      technicianWorkload,
      typeDistribution,
      monthlyTrend,
      overdueEvents: events.filter(e => e.status === 'overdue').length
    };
  };

  const analytics = getAnalytics();

  // Stats
  const stats = {
    total: events.length,
    scheduled: events.filter(e => e.status === 'scheduled').length,
    inProgress: events.filter(e => e.status === 'in_progress').length,
    completed: events.filter(e => e.status === 'completed').length,
    overdue: events.filter(e => e.status === 'overdue').length
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-6">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.map((notification, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 flex items-start justify-between ${
                notification.includes('URGENTE') 
                  ? 'bg-red-50 border-red-400' 
                  : 'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-start gap-3">
                  {notification.includes('URGENTE') ? (
                    <BellRing className="h-5 w-5 text-red-600 mt-0.5 animate-pulse" />
                  ) : (
                    <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      notification.includes('URGENTE') ? 'text-red-800' : 'text-blue-800'
                    }`}>
                      {notification}
                    </p>
                    <p className={`text-sm ${
                      notification.includes('URGENTE') ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      Clicca sull'evento nel calendario per maggiori dettagli
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissNotification(notification)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Calendario Manutenzioni</h1>
            <p className="text-gray-600">Pianifica e gestisci le attività di manutenzione</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={syncWorkOrdersToCalendar}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Sincronizza Ordini
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowTemplateModal(true)}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <CalendarTemplate className="h-4 w-4 mr-2" />
              Template
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowNewEventModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Evento
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Totale Eventi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
                  <p className="text-sm text-gray-600">Programmati</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                  <p className="text-sm text-gray-600">In Corso</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                  <p className="text-sm text-gray-600">Completati</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                  <p className="text-sm text-gray-600">In Ritardo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* View Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold min-w-[200px] text-center">
                  {getViewTitle()}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex bg-gray-100 rounded-md p-1">
                {(['month', 'week', 'analytics', 'resources', 'list'] as const).map((view) => (
                  <Button
                    key={view}
                    variant={selectedView === view ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedView(view)}
                    className="px-3 py-1"
                  >
                    {view === 'month' ? 'Mese' : 
                     view === 'week' ? 'Settimana' : 
                     view === 'analytics' ? 'Analytics' : 
                     view === 'resources' ? 'Risorse' : 'Lista'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={selectedTechnicians.includes('all') ? 'all' : selectedTechnicians[0] || 'all'}
                onChange={(e) => {
                  if (e.target.value === 'all') {
                    setSelectedTechnicians(['all']);
                  } else {
                    setSelectedTechnicians([e.target.value]);
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutti i tecnici</option>
                {Array.from(new Set(events.map(e => e.assignedTo))).map(tech => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutti gli stati</option>
                <option value="scheduled">Programmati</option>
                <option value="in_progress">In corso</option>
                <option value="completed">Completati</option>
                <option value="overdue">In ritardo</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutti i tipi</option>
                <option value="preventive">Preventiva</option>
                <option value="inspection">Ispezione</option>
                <option value="calibration">Calibrazione</option>
                <option value="cleaning">Pulizia</option>
              </select>

              {/* Multi-select toggle */}
              <Button
                variant={selectedTechnicians.length > 1 || !selectedTechnicians.includes('all') ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  if (selectedTechnicians.length > 1) {
                    setSelectedTechnicians(['all']);
                  } else {
                    const allTechs = Array.from(new Set(events.map(e => e.assignedTo)));
                    setSelectedTechnicians(allTechs);
                  }
                }}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                {selectedTechnicians.length > 1 ? `${selectedTechnicians.length} tecnici` : 'Multi-view'}
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Views */}
        {selectedView === 'month' && renderMonthView()}
        {selectedView === 'week' && renderWeekView()}
        {selectedView === 'analytics' && renderAnalyticsView()}
        {selectedView === 'resources' && renderResourcesView()}
        {selectedView === 'list' && renderListView()}

        {/* Selected Date Events */}
        {selectedDate && selectedView === 'month' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Eventi del {selectedDate.toLocaleDateString('it-IT')}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(null)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getEventsForDate(selectedDate).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nessun evento programmato per questa data
                  </p>
                ) : (
                  getEventsForDate(selectedDate).map(event => (
                    <EventCard key={event.id} event={event} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Template Eventi</h2>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {eventTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarTemplate className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun template disponibile</h3>
                  <p className="text-gray-500">Salva i tuoi eventi preferiti come template per riutilizzarli facilmente</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {eventTemplates.map((template) => (
                    <Card key={template.id} className="p-4 hover:shadow-md transition-shadow border-l-4" 
                          style={{ borderLeftColor: typeColors[template.type].split(' ')[0].replace('bg-', '') }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${typeColors[template.type]}`}>
                              {typeLabels[template.type]}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                              Template
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm text-gray-900 mb-1">
                            {template.title.replace('[Template] ', '')}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{template.scheduledTime} ({template.duration}h)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{template.assignedTo}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{template.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">Asset:</span>
                              <span>{template.assetName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <div className="flex flex-col gap-2">
                            <input
                              type="date"
                              className="px-2 py-1 border border-gray-300 rounded text-xs"
                              onChange={(e) => {
                                if (e.target.value) {
                                  const timeInput = e.target.parentElement?.querySelector('input[type="time"]') as HTMLInputElement;
                                  const time = timeInput?.value || template.scheduledTime;
                                  createEventFromTemplate(template, e.target.value, time);
                                }
                              }}
                            />
                            <input
                              type="time"
                              defaultValue={template.scheduledTime}
                              className="px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                            className="text-red-600 hover:bg-red-50 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Event Details Popover */}
      {selectedEventForPopover && (
        <>
          {/* Backdrop to close popover */}
          <div 
            className="fixed inset-0 bg-transparent z-40"
            onClick={closePopover}
          />
          
          {/* Popover */}
          <div 
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm w-80"
            style={{
              left: `${Math.min(popoverPosition.x - 160, window.innerWidth - 340)}px`,
              top: `${Math.max(popoverPosition.y - 20, 20)}px`,
              transform: popoverPosition.y < 200 ? 'translateY(20px)' : 'translateY(-100%)'
            }}
          >
            {/* Arrow */}
            <div 
              className="absolute w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45"
              style={{
                left: '50%',
                transform: `translateX(-50%) ${popoverPosition.y < 200 ? 'translateY(-50%)' : 'translateY(50%)'}`,
                [popoverPosition.y < 200 ? 'top' : 'bottom']: '-6px'
              }}
            />
            
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${typeColors[selectedEventForPopover.type]}`}>
                  {typeLabels[selectedEventForPopover.type]}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded border ${statusColors[selectedEventForPopover.status]}`}>
                  {statusLabels[selectedEventForPopover.status]}
                </span>
              </div>
              <button
                onClick={closePopover}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Title and Description */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">{selectedEventForPopover.title}</h3>
              {selectedEventForPopover.description && (
                <p className="text-sm text-gray-600 mb-2">{selectedEventForPopover.description}</p>
              )}
            </div>
            
            {/* Details Grid */}
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Data</p>
                    <p className="font-medium">{new Date(selectedEventForPopover.scheduledDate).toLocaleDateString('it-IT')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Orario</p>
                    <p className="font-medium">{formatTime(selectedEventForPopover.scheduledTime)} ({selectedEventForPopover.duration}h)</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Assegnato a</p>
                    <p className="font-medium">{selectedEventForPopover.assignedTo}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">Ubicazione</p>
                    <p className="font-medium">{selectedEventForPopover.location}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-500">Asset</p>
                  <p className="font-medium">{selectedEventForPopover.assetName}</p>
                </div>
              </div>
              
              {selectedEventForPopover.priority && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500">Priorità</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[selectedEventForPopover.priority]}`}>
                      {selectedEventForPopover.priority === 'low' ? 'Bassa' :
                       selectedEventForPopover.priority === 'medium' ? 'Media' :
                       selectedEventForPopover.priority === 'high' ? 'Alta' : 'Critica'}
                    </span>
                  </div>
                </div>
              )}
              
              {selectedEventForPopover.workOrderId && (
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Ordine di lavoro</p>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                      Sincronizzato #{selectedEventForPopover.workOrderId}
                    </span>
                  </div>
                </div>
              )}
              
              {selectedEventForPopover.recurrence && (
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Ricorrenza</p>
                    <p className="font-medium text-xs">
                      {selectedEventForPopover.recurrence.type === 'monthly' ? 'Mensile' : 
                       selectedEventForPopover.recurrence.type === 'weekly' ? 'Settimanale' :
                       selectedEventForPopover.recurrence.type === 'quarterly' ? 'Trimestrale' : 'Annuale'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
              {selectedEventForPopover.status === 'scheduled' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleEventStatusUpdate(selectedEventForPopover.id, 'in_progress');
                    closePopover();
                  }}
                  className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Inizia
                </Button>
              )}
              
              {selectedEventForPopover.status === 'in_progress' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleEventStatusUpdate(selectedEventForPopover.id, 'completed');
                    closePopover();
                  }}
                  className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completa
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  saveAsTemplate(selectedEventForPopover);
                  closePopover();
                }}
                className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Save className="h-3 w-3 mr-1" />
                Template
              </Button>
            </div>
            
            {selectedEventForPopover.notes && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                <strong>Note:</strong> {selectedEventForPopover.notes}
              </div>
            )}
          </div>
        </>
      )}

      {/* Nuovo Evento Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Nuovo Evento</h2>
              <button
                onClick={() => setShowNewEventModal(false)}
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
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Inserisci il titolo dell'evento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrizione dell'evento"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data programmata *
                </label>
                <input
                  type="date"
                  value={newEvent.scheduledDate}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as 'maintenance' | 'inspection' | 'calibration' | 'repair' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="maintenance">Manutenzione</option>
                  <option value="inspection">Ispezione</option>
                  <option value="calibration">Calibrazione</option>
                  <option value="repair">Riparazione</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorità
                </label>
                <select
                  value={newEvent.priority}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Bassa</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Critica</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewEventModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleCreateEvent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Crea Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}