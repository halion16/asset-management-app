'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SupplierForm from "@/components/SupplierForm";
import { getSuppliers, saveSupplier, initializeStorage } from "@/lib/storage";
import { Supplier } from "@/data/mockData";
import { 
  Plus,
  Search,
  Users,
  Star,
  CheckCircle,
  Clock,
  TrendingUp,
  MoreHorizontal,
  Filter,
  ChevronDown,
  MapPin,
  Mail,
  Phone,
  Building,
  Award,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  FileText,
  Send,
  MessageCircle,
  Activity
} from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedTab, setSelectedTab] = useState<'active' | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();
  const [activeCardMenu, setActiveCardMenu] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Array<{
    id: string;
    supplierId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    message: string;
    timestamp: string;
    type: 'comment' | 'system';
    eventType: string;
  }>>([]);

  useEffect(() => {
    initializeStorage();
    loadSuppliers();
  }, []);


  const loadSuppliers = () => {
    const suppliersData = getSuppliers();
    setSuppliers(suppliersData);
    if (suppliersData.length > 0 && !selectedSupplier) {
      setSelectedSupplier(suppliersData[0]);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesTab = selectedTab === 'active' ? supplier.status === 'active' : true;
    const matchesSearch = searchTerm ? 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.specialties.some(spec => 
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      ) : true;
    return matchesTab && matchesSearch;
  });

  const handleSaveSupplier = (supplier: Supplier) => {
    saveSupplier(supplier);
    loadSuppliers();
    setShowForm(false);
    setEditingSupplier(undefined);
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo fornitore?')) {
      const updatedSuppliers = suppliers.filter(s => s.id !== id);
      // Since we don't have a deleteSupplier function yet, we manually save the updated array
      if (typeof window !== 'undefined') {
        localStorage.setItem('asset_management_suppliers', JSON.stringify(updatedSuppliers));
      }
      loadSuppliers();
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedSupplier) return;
    
    const comment = {
      id: `comment-${Date.now()}`,
      supplierId: selectedSupplier.id,
      userId: '1',
      userName: 'David Luchetta',
      userAvatar: 'DL',
      message: newComment.trim(),
      timestamp: new Date().toISOString(),
      type: 'comment' as const,
      eventType: 'comment'
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  // Get timeline events for the selected supplier
  const getTimelineEvents = () => {
    if (!selectedSupplier) return [];
    
    const supplierComments = comments.filter(c => c.supplierId === selectedSupplier.id);
    
    // Static events for demo purposes
    const staticEvents = [
      {
        id: 'status-1',
        supplierId: selectedSupplier.id,
        userId: '1',
        userName: 'David Luchetta',
        userAvatar: 'DL',
        message: 'Cambio di stato: da "Attivo" a "In valutazione"',
        timestamp: '2025-09-07T20:11:00.000Z',
        type: 'system' as const,
        eventType: 'status_change',
        statusChange: { from: 'Attivo', to: 'In valutazione' }
      },
      {
        id: 'rating-1',
        supplierId: selectedSupplier.id,
        userId: '1',
        userName: 'David Luchetta',
        userAvatar: 'DL',
        message: `Completata la valutazione delle performance del fornitore. Rating confermato a ${selectedSupplier.rating} stelle.`,
        timestamp: '2025-09-07T19:45:00.000Z',
        type: 'comment' as const,
        eventType: 'comment'
      },
      {
        id: 'contract-1',
        supplierId: selectedSupplier.id,
        userId: 'system',
        userName: 'Sistema',
        userAvatar: 'S',
        message: 'Contratto completato: Manutenzione impianto elettrico',
        timestamp: '2025-09-07T18:30:00.000Z',
        type: 'system' as const,
        eventType: 'contract_completed'
      }
    ];
    
    // Combine static events with dynamic comments
    const allEvents = [...supplierComments, ...staticEvents];
    
    // Sort by timestamp (newest first)
    return allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('it-IT', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'status_change':
        return <Activity className="h-3 w-3 text-gray-600" />;
      case 'comment':
        return <MessageCircle className="h-3 w-3 text-blue-600" />;
      case 'contract_completed':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  const getEventBgColor = (eventType: string) => {
    switch (eventType) {
      case 'status_change':
        return 'bg-orange-50 border-l-orange-400';
      case 'comment':
        return 'bg-blue-50 border-l-blue-400';
      case 'contract_completed':
        return 'bg-gray-50 border-l-gray-400';
      default:
        return 'bg-gray-50 border-l-gray-400';
    }
  };

  // Stats
  const stats = {
    total: suppliers.length,
    excellent: suppliers.filter(s => s.rating >= 4.5).length,
    reliable: suppliers.filter(s => s.rating >= 4.0 && s.rating < 4.5).length,
    activeContracts: suppliers.reduce((sum, supplier) => sum + supplier.activeContracts, 0),
    totalCompleted: suppliers.reduce((sum, supplier) => sum + supplier.completedJobs, 0),
    averageRating: suppliers.length > 0 ? suppliers.reduce((sum, supplier) => sum + supplier.rating, 0) / suppliers.length : 0
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Column - Suppliers List */}
      <div className="w-[480px] bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fornitori</h1>
              <p className="text-gray-600">Gestisci la rete di fornitori e partner</p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuovo
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-700">{stats.total}</div>
              <div className="text-xs text-blue-600">Totali</div>
            </div>
            <div className="flex-1 text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-700">{stats.excellent}</div>
              <div className="text-xs text-green-600">Eccellenti</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setSelectedTab('active')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'active'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Attivi ({suppliers.filter(s => s.status === 'active').length})
            </button>
            <button
              onClick={() => setSelectedTab('all')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tutti ({suppliers.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca fornitori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Suppliers List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                onClick={() => setSelectedSupplier(supplier)}
                className={`p-3 mb-2 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                  selectedSupplier?.id === supplier.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                    <p className="text-sm text-gray-600">{supplier.company}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-gray-700">{supplier.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{supplier.location}</span>
                  </div>
                  <span>{supplier.activeContracts} contratti</span>
                </div>
              </div>
            ))}
            
            {filteredSuppliers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {searchTerm ? 'Nessun fornitore trovato' : 'Nessun fornitore presente'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Column - Supplier Details */}
      <div className="flex-1 bg-white border-r border-gray-200 flex flex-col">
        {selectedSupplier ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedSupplier.name}</h2>
                  <p className="text-gray-600">{selectedSupplier.company}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Chiama
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditSupplier(selectedSupplier)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Supplier Details Grid */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Rating</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${
                              star <= selectedSupplier.rating 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{selectedSupplier.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Contratti attivi</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-blue-600 font-medium">{selectedSupplier.activeContracts} contratti</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Ubicazione</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{selectedSupplier.location}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Anni di servizio</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-green-600 font-medium">{selectedSupplier.yearsOfService} anni</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Contatti</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedSupplier.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedSupplier.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Specializzazioni</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSupplier.specialties.map((spec, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Performance Stats */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Performance</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{selectedSupplier.completedJobs}</div>
                      <div className="text-xs text-gray-600">Lavori completati</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{selectedSupplier.activeContracts}</div>
                      <div className="text-xs text-gray-600">Contratti attivi</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{selectedSupplier.yearsOfService}</div>
                      <div className="text-xs text-gray-600">Anni esperienza</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Seleziona un fornitore</h3>
              <p className="text-gray-500">Scegli un fornitore dalla lista per visualizzarne i dettagli</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Timeline */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
        {selectedSupplier ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Cronologia</h3>
              </div>
              <p className="text-xs text-gray-600 truncate">{selectedSupplier.name}</p>
            </div>

            {/* Timeline Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {/* Add Comment Section */}
                <div className="mb-4">
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3">
                    <div className="flex gap-2">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          DL
                        </div>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Aggiungi commento..."
                          className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                        />
                        <div className="flex justify-end mt-2">
                          <Button 
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            size="sm"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Invia
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Events */}
                {(() => {
                  const timelineEvents = getTimelineEvents();
                  return timelineEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm font-medium">Nessun evento</p>
                      <p className="text-gray-400 text-xs">I commenti appariranno qui</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
                      
                      {timelineEvents.map((event) => (
                        <div key={event.id} className="relative flex gap-3 pb-4">
                          {/* Timeline icon */}
                          <div className="flex-shrink-0 relative z-10">
                            <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                              {event.userAvatar === 'S' ? (
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                  {event.userAvatar}
                                </div>
                              )}
                            </div>
                            {/* Event type indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                              {getEventIcon(event.eventType)}
                            </div>
                          </div>

                          {/* Event content */}
                          <div className="flex-1 min-w-0">
                            <div className={`p-2 rounded border-l-2 ${getEventBgColor(event.eventType)}`}>
                              {/* Event header */}
                              <div className="mb-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-gray-900 text-xs">{event.userName}</h4>
                                  <p className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</p>
                                </div>
                                {event.eventType === 'status_change' && (
                                  <div className="flex items-center gap-1 text-xs mt-1">
                                    <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                      Attivo
                                    </span>
                                    <span className="text-gray-400 text-xs">→</span>
                                    <span className="px-1 py-0.5 bg-blue-100 text-blue-600 rounded font-medium text-xs">
                                      In valutazione
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Event content */}
                              <div className="text-xs text-gray-700">
                                <p>{event.message}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <div className="text-xs text-gray-500 text-center">
                {(() => {
                  const timelineEvents = getTimelineEvents();
                  return `${timelineEvents.length} ${timelineEvents.length === 1 ? 'evento' : 'eventi'}`;
                })()}
              </div>
            </div>
          </>
        ) : (
          <div className="w-80 bg-gray-50 border-l border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Seleziona un fornitore per visualizzare la cronologia</p>
            </div>
          </div>
        )}
      </div>

      {/* Supplier Form Modal */}
      {showForm && (
        <SupplierForm
          supplier={editingSupplier}
          onSave={handleSaveSupplier}
          onCancel={() => {
            setShowForm(false);
            setEditingSupplier(undefined);
          }}
        />
      )}
    </div>
  );
}