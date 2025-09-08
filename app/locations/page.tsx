'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getLocations, getAssets, saveLocation, initializeStorage } from "@/lib/storage";
import LocationForm from "@/components/LocationForm";
import { Location, Asset, Comment } from "@/data/mockData";
import { 
  Plus,
  Search,
  MapPin,
  Building,
  Package,
  User,
  MoreHorizontal,
  Calendar,
  Target,
  Edit,
  Copy,
  Trash2,
  Settings,
  Activity,
  History,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Filter,
  CheckSquare,
  X,
  Zap,
  AlertCircle
} from "lucide-react";

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [activeFilters, setActiveFilters] = useState({
    location: null as string | null,
    assetCategory: null as string | null,
    type: null as string | null,
    assetStatus: null as string | null,
    lastMaintenance: null as string | null,
    priority: null as string | null
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  useEffect(() => {
    initializeStorage();
    loadData();
  }, []);

  const loadData = () => {
    const locationsData = getLocations();
    const assetsData = getAssets();
    setLocations(locationsData);
    setAssets(assetsData);
    if (locationsData.length > 0 && !selectedLocation) {
      setSelectedLocation(locationsData[0]);
    }
  };

  const handleSaveLocation = (location: Location) => {
    saveLocation(location);
    loadData();
    setShowLocationModal(false);
    setEditingLocation(null);
    // Select the new location if it's a new one
    if (!editingLocation) {
      setSelectedLocation(location);
    }
  };

  const handleNewLocation = () => {
    setEditingLocation(null);
    setShowLocationModal(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setShowLocationModal(true);
  };

  const getMaintenanceRanges = () => {
    return [
      { label: 'Mai effettuata', value: 'never', days: null },
      { label: 'Oltre 90 giorni', value: 'over-90', days: 90 },
      { label: 'Oltre 30 giorni', value: 'over-30', days: 30 },
      { label: 'Ultimo mese', value: 'recent', days: 0 }
    ];
  };

  const getAssetsByLocation = (locationName: string) => {
    return assets.filter(asset => asset.location === locationName);
  };

  const getLocationStats = (locationName: string) => {
    const locationAssets = getAssetsByLocation(locationName);
    return {
      total: locationAssets.length,
      operational: locationAssets.filter(a => a.status === 'operational').length,
      maintenance: locationAssets.filter(a => a.status === 'maintenance').length,
      down: locationAssets.filter(a => a.status === 'down').length,
      totalValue: locationAssets.reduce((sum, asset) => sum + asset.value, 0)
    };
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = searchTerm ? 
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.manager.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    // For now all locations are "active", could add status field later
    const matchesFilter = selectedFilter === 'all' || selectedFilter === 'active';
    
    // Apply active filters
    const matchesLocation = activeFilters.location ? location.name === activeFilters.location : true;
    const locationAssets = getAssetsByLocation(location.name);
    
    const matchesAssetCategory = activeFilters.assetCategory ? 
      locationAssets.some(asset => asset.category === activeFilters.assetCategory) : true;
    
    const matchesType = activeFilters.type ? 
      (activeFilters.type === 'Sede Principale' && location.name.toLowerCase().includes('sede')) ||
      (activeFilters.type === 'Filiale' && !location.name.toLowerCase().includes('sede')) ||
      (activeFilters.type === 'Magazzino' && location.name.toLowerCase().includes('magazzino'))
      : true;
    
    const matchesAssetStatus = activeFilters.assetStatus ? 
      locationAssets.some(asset => asset.status === activeFilters.assetStatus) : true;
    
    const matchesLastMaintenance = activeFilters.lastMaintenance ? (() => {
      const range = getMaintenanceRanges().find(r => r.value === activeFilters.lastMaintenance);
      if (!range) return true;
      
      return locationAssets.some(asset => {
        if (!asset.lastMaintenance && range.value === 'never') return true;
        if (!asset.lastMaintenance) return false;
        
        const lastMaintenanceDate = new Date(asset.lastMaintenance);
        const daysSinceMaintenance = Math.floor((Date.now() - lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (range.value) {
          case 'over-90': return daysSinceMaintenance > 90;
          case 'over-30': return daysSinceMaintenance > 30;
          case 'recent': return daysSinceMaintenance <= 30;
          default: return false;
        }
      });
    })() : true;
    
    const matchesPriority = activeFilters.priority ? 
      locationAssets.some(asset => asset.priority === activeFilters.priority) : true;
    
    return matchesSearch && matchesFilter && matchesLocation && matchesAssetCategory && 
           matchesType && matchesAssetStatus && matchesLastMaintenance && matchesPriority;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get unique values for filter options
  const getUniqueLocations = () => {
    return [...new Set(locations.map(location => location.name))];
  };

  const getAssetCategories = () => {
    return [...new Set(assets.map(asset => asset.category))].sort();
  };

  const getLocationTypes = () => {
    return ['Sede Principale', 'Filiale', 'Magazzino', 'Ufficio'];
  };

  const getAssetStatuses = () => {
    return ['operational', 'maintenance', 'down', 'retired'];
  };

  const getAssetPriorities = () => {
    return ['low', 'medium', 'high', 'critical'];
  };

  // Filter handlers
  const handleFilterChange = (filterType: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setShowFilterDropdown(null);
  };

  const resetFilters = () => {
    setActiveFilters({
      location: null,
      assetCategory: null,
      type: null,
      assetStatus: null,
      lastMaintenance: null,
      priority: null
    });
    setSearchTerm('');
  };

  const saveFilters = () => {
    // In a real app, you'd save to localStorage or backend
    alert('Filtri salvati con successo!');
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(value => value !== null).length;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilterDropdown) {
        const target = event.target as Element;
        const dropdown = target.closest('.filter-dropdown');
        const button = target.closest('.filter-button');
        
        if (!dropdown && !button) {
          setShowFilterDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterDropdown]);

  // Mock timeline data for selected location
  const getLocationTimeline = (location: Location) => {
    const stats = getLocationStats(location.name);
    const locationAssets = getAssetsByLocation(location.name);
    
    // Generate some timeline events
    const timelineEvents = [
      {
        id: 'evt-1',
        type: 'location_update',
        title: 'Informazioni ubicazione aggiornate',
        description: `Manager aggiornato: ${location.manager}`,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'David Luchetta',
        avatar: 'DL'
      },
      {
        id: 'evt-2', 
        type: 'asset_added',
        title: 'Nuovo asset aggiunto',
        description: locationAssets.length > 0 ? `${locationAssets[0].name} aggiunto alla location` : 'Asset aggiunto',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'Admin Sistema',
        avatar: 'AS'
      },
      {
        id: 'evt-3',
        type: 'maintenance_scheduled',
        title: 'Manutenzione programmata',
        description: `${stats.maintenance} asset in manutenzione programmata`,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        user: location.manager,
        avatar: location.manager.split(' ').map(n => n[0]).join('')
      }
    ];

    return timelineEvents;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Column - Locations List */}
      <div className="w-[480px] bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Ubicazioni</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleNewLocation}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuova Ubicazione
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                selectedFilter === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tutte le ubicazioni
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {locations.length}
              </span>
            </button>
            <button
              onClick={() => setSelectedFilter('active')}
              className={`pb-2 px-1 ml-6 text-sm font-medium border-b-2 transition-colors ${
                selectedFilter === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Attive
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {locations.length}
              </span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4">
            {/* Location Filter */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`filter-button ${activeFilters.location ? 'text-blue-600 bg-blue-50' : ''}`}
                onClick={() => setShowFilterDropdown(showFilterDropdown === 'location' ? null : 'location')}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {activeFilters.location || 'Ubicazione'}
                {activeFilters.location && <X className="h-3 w-3 ml-2" onClick={(e) => { e.stopPropagation(); handleFilterChange('location', null); }} />}
              </Button>
              {showFilterDropdown === 'location' && (
                <div className="filter-dropdown absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 mb-2">Filtra per Ubicazione</div>
                    {getUniqueLocations().map(locationName => (
                      <button
                        key={locationName}
                        onClick={() => handleFilterChange('location', locationName)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                      >
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                          {locationName.substring(0, 2).toUpperCase()}
                        </div>
                        {locationName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Asset Category Filter */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`filter-button ${activeFilters.assetCategory ? 'text-blue-600 bg-blue-50' : ''}`}
                onClick={() => setShowFilterDropdown(showFilterDropdown === 'asset' ? null : 'asset')}
              >
                <Package className="h-4 w-4 mr-2" />
                {activeFilters.assetCategory || 'Categoria'}
                {activeFilters.assetCategory && <X className="h-3 w-3 ml-2" onClick={(e) => { e.stopPropagation(); handleFilterChange('assetCategory', null); }} />}
              </Button>
              {showFilterDropdown === 'asset' && (
                <div className="filter-dropdown absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 mb-2">Filtra per categoria Asset</div>
                    {getAssetCategories().map(category => (
                      <button
                        key={category}
                        onClick={() => handleFilterChange('assetCategory', category)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                      >
                        <Package className="h-4 w-4 text-blue-600" />
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`filter-button ${activeFilters.type ? 'text-blue-600 bg-blue-50' : ''}`}
                onClick={() => setShowFilterDropdown(showFilterDropdown === 'type' ? null : 'type')}
              >
                <Building className="h-4 w-4 mr-2" />
                {activeFilters.type || 'Tipo'}
                {activeFilters.type && <X className="h-3 w-3 ml-2" onClick={(e) => { e.stopPropagation(); handleFilterChange('type', null); }} />}
              </Button>
              {showFilterDropdown === 'type' && (
                <div className="filter-dropdown absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 mb-2">Filtra per tipo ubicazione</div>
                    {getLocationTypes().map(type => (
                      <button
                        key={type}
                        onClick={() => handleFilterChange('type', type)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                      >
                        <Building className="h-4 w-4 text-blue-600" />
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add Filter Button */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="filter-button"
                onClick={() => setShowFilterDropdown(showFilterDropdown === 'add' ? null : 'add')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi filtro
              </Button>
              {showFilterDropdown === 'add' && (
                <div className="filter-dropdown absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 mb-2">Filtri aggiuntivi disponibili</div>
                    
                    {/* Asset Status Filter */}
                    {!activeFilters.assetStatus && (
                      <div className="mb-2">
                        <div className="text-xs font-medium text-gray-700 mb-1">Stato Asset</div>
                        {getAssetStatuses().map(status => (
                          <button
                            key={status}
                            onClick={() => {
                              handleFilterChange('assetStatus', status);
                              setShowFilterDropdown(null);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2 mb-1"
                          >
                            <Zap className={`h-4 w-4 ${
                              status === 'operational' ? 'text-green-600' :
                              status === 'maintenance' ? 'text-orange-600' :
                              status === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`} />
                            {status === 'operational' ? 'Operativo' :
                             status === 'maintenance' ? 'In Manutenzione' :
                             status === 'down' ? 'Fermo' : 'Dismesso'}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Last Maintenance Filter */}
                    {!activeFilters.lastMaintenance && (
                      <div className="mb-2">
                        <div className="text-xs font-medium text-gray-700 mb-1">Data Ultima Manutenzione</div>
                        {getMaintenanceRanges().map(range => (
                          <button
                            key={range.value}
                            onClick={() => {
                              handleFilterChange('lastMaintenance', range.value);
                              setShowFilterDropdown(null);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2 mb-1"
                          >
                            <Calendar className={`h-4 w-4 ${
                              range.value === 'never' ? 'text-red-600' :
                              range.value === 'over-90' ? 'text-orange-600' :
                              range.value === 'over-30' ? 'text-yellow-600' : 'text-green-600'
                            }`} />
                            {range.label}
                          </button>
                        ))}
                      </div>
                    )}


                    {/* Priority Filter */}
                    {!activeFilters.priority && (
                      <div className="mb-2">
                        <div className="text-xs font-medium text-gray-700 mb-1">Priorità Asset</div>
                        {getAssetPriorities().map(priority => (
                          <button
                            key={priority}
                            onClick={() => {
                              handleFilterChange('priority', priority);
                              setShowFilterDropdown(null);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2 mb-1"
                          >
                            <AlertCircle className={`h-4 w-4 ${
                              priority === 'critical' ? 'text-red-600' :
                              priority === 'high' ? 'text-orange-600' :
                              priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                            }`} />
                            {priority === 'critical' ? 'Critica' :
                             priority === 'high' ? 'Alta' :
                             priority === 'medium' ? 'Media' : 'Bassa'}
                          </button>
                        ))}
                      </div>
                    )}

                    {Object.values(activeFilters).every(v => v === null) && (
                      <div className="text-center py-4 text-sm text-gray-500">
                        Tutti i filtri sono disponibili sopra
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Additional Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {activeFilters.assetStatus && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 bg-blue-50"
                onClick={() => handleFilterChange('assetStatus', null)}
              >
                <Zap className="h-3 w-3 mr-1" />
                Stato: {activeFilters.assetStatus === 'operational' ? 'Operativo' :
                        activeFilters.assetStatus === 'maintenance' ? 'Manutenzione' :
                        activeFilters.assetStatus === 'down' ? 'Fermo' : 'Dismesso'}
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
            
            {activeFilters.lastMaintenance && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 bg-blue-50"
                onClick={() => handleFilterChange('lastMaintenance', null)}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Manutenzione: {getMaintenanceRanges().find(r => r.value === activeFilters.lastMaintenance)?.label}
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
            
            
            {activeFilters.priority && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 bg-blue-50"
                onClick={() => handleFilterChange('priority', null)}
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                Priorità: {activeFilters.priority === 'critical' ? 'Critica' :
                          activeFilters.priority === 'high' ? 'Alta' :
                          activeFilters.priority === 'medium' ? 'Media' : 'Bassa'}
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 bg-blue-50"
              onClick={resetFilters}
              disabled={getActiveFilterCount() === 0 && !searchTerm}
            >
              Reimposta filtri
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={saveFilters}
              disabled={getActiveFilterCount() === 0}
            >
              Salva filtri
            </Button>
            <span className="text-gray-500 ml-auto">
              {filteredLocations.length} risultati
              {getActiveFilterCount() > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {getActiveFilterCount()} filtri attivi
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Ricerca ubicazioni"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Locations List */}
        <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-300px)]" 
             style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e0 #f7fafc' }}>
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2">
              Ordina per: Nome
            </div>
            {filteredLocations.map((location) => {
              const stats = getLocationStats(location.name);
              return (
                <div
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors relative group ${
                    selectedLocation?.id === location.id
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {location.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Attiva
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                        {location.name}
                      </h3>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{location.address}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{location.manager}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{stats.total} asset</span>
                          <span className="text-green-600">• {stats.operational} operativi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Section - Location Details and Timeline */}
      <div className="flex-1 flex bg-white">
        {selectedLocation ? (
          <>
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedLocation.name}
                      </h2>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Ubicazione attiva
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {selectedLocation.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Manager: {selectedLocation.manager}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifica
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Impostazioni
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Location Details Grid */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Generali</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Nome Ubicazione</label>
                          <p className="text-gray-900">{selectedLocation.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Indirizzo</label>
                          <p className="text-gray-900">{selectedLocation.address}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Manager Responsabile</label>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {selectedLocation.manager.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-gray-900">{selectedLocation.manager}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">ID Ubicazione</label>
                          <p className="text-gray-900 font-mono text-sm">{selectedLocation.id}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiche Asset</h3>
                      <div className="space-y-4">
                        {(() => {
                          const stats = getLocationStats(selectedLocation.name);
                          return (
                            <>
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-blue-900">Asset Totali</span>
                                  <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-green-50 p-3 rounded text-center">
                                  <div className="text-lg font-bold text-green-800">{stats.operational}</div>
                                  <div className="text-xs text-green-600">Operativi</div>
                                </div>
                                <div className="bg-orange-50 p-3 rounded text-center">
                                  <div className="text-lg font-bold text-orange-800">{stats.maintenance}</div>
                                  <div className="text-xs text-orange-600">Manutenzione</div>
                                </div>
                                <div className="bg-red-50 p-3 rounded text-center">
                                  <div className="text-lg font-bold text-red-800">{stats.down}</div>
                                  <div className="text-xs text-red-600">Fermi</div>
                                </div>
                              </div>

                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Valore Totale Asset</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                  €{stats.totalValue.toLocaleString()}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Assets in this Location */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset in questa ubicazione</h3>
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {getAssetsByLocation(selectedLocation.name).length} asset presenti
                          </span>
                          <Button variant="outline" size="sm">
                            Visualizza tutti
                          </Button>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {getAssetsByLocation(selectedLocation.name).slice(0, 5).map(asset => (
                          <div key={asset.id} className="px-4 py-3 flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                              <Package className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 text-sm">{asset.name}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  asset.status === 'operational' ? 'bg-green-100 text-green-800' :
                                  asset.status === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {asset.status === 'operational' ? 'Operativo' : 
                                   asset.status === 'maintenance' ? 'Manutenzione' : 'Fermo'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {asset.category} • {asset.brand} • €{asset.value.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                        {getAssetsByLocation(selectedLocation.name).length > 5 && (
                          <div className="px-4 py-3 text-center">
                            <span className="text-sm text-gray-500">
                              +{getAssetsByLocation(selectedLocation.name).length - 5} altri asset
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Sidebar */}
            <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <History className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Cronologia</h3>
                </div>
                <p className="text-xs text-gray-500">Attività e modifiche ubicazione</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {getLocationTimeline(selectedLocation).map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                        {event.avatar}
                      </div>
                      <div className="w-px h-6 bg-gray-200 mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {event.user}
                          </span>
                          {event.type === 'location_update' && (
                            <Edit className="h-3 w-3 text-blue-600" />
                          )}
                          {event.type === 'asset_added' && (
                            <Plus className="h-3 w-3 text-green-600" />
                          )}
                          {event.type === 'maintenance_scheduled' && (
                            <Calendar className="h-3 w-3 text-orange-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-900 mb-1">{event.title}</p>
                        <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatDate(event.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* End of timeline */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <CheckSquare className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Ubicazione creata</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3" />
                        Inizio cronologia
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Seleziona un'ubicazione per visualizzare i dettagli
          </div>
        )}
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <LocationForm
          location={editingLocation || undefined}
          onSave={handleSaveLocation}
          onCancel={() => {
            setShowLocationModal(false);
            setEditingLocation(null);
          }}
        />
      )}
    </div>
  );
}