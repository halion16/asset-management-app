'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  getAssets, 
  getWorkOrders, 
  getRequests, 
  getSuppliers, 
  getUsers,
  initializeStorage 
} from "@/lib/storage";
import { Asset, WorkOrder, Request } from "@/data/mockData";
import { 
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package,
  Wrench,
  Users,
  Plus,
  Search,
  Filter,
  FileText,
  Activity,
  Settings
} from "lucide-react";

interface ReportItem {
  id: string;
  name: string;
  type: 'assets' | 'workorders' | 'requests' | 'performance' | 'maintenance';
  description: string;
  icon: string;
  lastGenerated?: string;
  status: 'ready' | 'generating' | 'error';
}

const mockReports: ReportItem[] = [
  {
    id: '1',
    name: 'Asset Performance Report',
    type: 'assets',
    description: 'Analisi completa delle performance degli asset',
    icon: 'Package',
    lastGenerated: '2024-01-15',
    status: 'ready'
  },
  {
    id: '2',
    name: 'Work Orders Analytics',
    type: 'workorders',
    description: 'Metriche e KPI degli ordini di lavoro',
    icon: 'Wrench',
    lastGenerated: '2024-01-14',
    status: 'ready'
  },
  {
    id: '3',
    name: 'Maintenance Costs',
    type: 'maintenance',
    description: 'Report sui costi di manutenzione',
    icon: 'DollarSign',
    lastGenerated: '2024-01-13',
    status: 'ready'
  },
  {
    id: '4',
    name: 'Request Tracking',
    type: 'requests',
    description: 'Analisi delle richieste e approvazioni',
    icon: 'AlertTriangle',
    lastGenerated: '2024-01-12',
    status: 'ready'
  },
  {
    id: '5',
    name: 'Performance Metrics',
    type: 'performance',
    description: 'KPI di sistema e tempi di risposta',
    icon: 'TrendingUp',
    lastGenerated: '2024-01-11',
    status: 'ready'
  }
];

export default function ReportsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    initializeStorage();
    loadData();
  }, []);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportMenu]);

  const loadData = () => {
    setAssets(getAssets());
    setWorkOrders(getWorkOrders());
    setRequests(getRequests());
    // Select first report by default
    if (mockReports.length > 0 && !selectedReport) {
      setSelectedReport(mockReports[0]);
    }
  };

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = searchTerm ? report.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const matchesType = typeFilter === 'all' ? true : report.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assets': return 'text-blue-700 bg-blue-100';
      case 'workorders': return 'text-orange-700 bg-orange-100';
      case 'maintenance': return 'text-green-700 bg-green-100';
      case 'requests': return 'text-purple-700 bg-purple-100';
      case 'performance': return 'text-pink-700 bg-pink-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-700 bg-green-100 border-green-200';
      case 'generating': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'error': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      Package, Wrench, DollarSign, AlertTriangle, TrendingUp, FileText, Activity
    };
    return iconMap[iconName] || FileText;
  };

  const exportToExcel = () => {
    // Prepare data for export
    const reportData = {
      assets: assets.map(asset => ({
        Nome: asset.name,
        Categoria: asset.category,
        Stato: asset.status,
        Ubicazione: asset.location,
        Valore: asset.purchasePrice,
        'Data Acquisto': asset.purchaseDate
      })),
      workOrders: workOrders.map(wo => ({
        Titolo: wo.title,
        Tipo: wo.type,
        Priorità: wo.priority,
        Stato: wo.status,
        'Data Creazione': wo.createdDate,
        'Data Scadenza': wo.dueDate,
        Asset: wo.assetId
      })),
      requests: requests.map(req => ({
        Titolo: req.title,
        Tipo: req.type,
        Priorità: req.priority,
        Stato: req.status,
        'Data Creazione': req.createdDate,
        Richiedente: req.requestedBy
      }))
    };

    // Create CSV content
    const createCSV = (data: any[], title: string) => {
      if (data.length === 0) return '';
      
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(item => 
        Object.values(item).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      ).join('\n');
      
      return `\n\n=== ${title.toUpperCase()} ===\n${headers}\n${rows}`;
    };

    const csvContent = 
      '=== REPORT ASSET MANAGEMENT ===' +
      createCSV(reportData.assets, 'Asset') +
      createCSV(reportData.workOrders, 'Work Orders') +
      createCSV(reportData.requests, 'Richieste');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report_asset_management_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Simulate PDF generation
    const reportContent = `
REPORT ASSET MANAGEMENT
${new Date().toLocaleDateString('it-IT')}

=== RIEPILOGO KPI ===
• Asset Totali: ${assetStats.total}
• Asset Operativi: ${assetStats.operational} (${assetStats.operationalPercentage}%)
• Asset in Manutenzione: ${assetStats.maintenance}
• Asset Fermi: ${assetStats.down}

• Work Orders Totali: ${workOrderStats.total}
• Work Orders Aperti: ${workOrderStats.open}
• Work Orders In Corso: ${workOrderStats.inProgress}
• Work Orders Completati: ${workOrderStats.completed}

• Richieste Totali: ${requestStats.total}
• Richieste Approvate: ${requestStats.approved}
• Richieste In Attesa: ${requestStats.pending}

=== DETTAGLIO ASSET ===
${assets.map(asset => `• ${asset.name} - ${asset.category} - ${asset.status}`).join('\n')}

Questo è un report simulato. In una implementazione reale,
verrebbe generato un PDF strutturato con grafici e tabelle.
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report_asset_management_${new Date().toISOString().split('T')[0]}.pdf`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Asset Analytics
  const assetStats = {
    total: assets.length,
    operational: assets.filter(a => a.status === 'operational').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length,
    down: assets.filter(a => a.status === 'down').length,
    totalValue: assets.reduce((sum, asset) => sum + asset.value, 0),
    byCategory: assets.reduce((acc, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byLocation: assets.reduce((acc, asset) => {
      acc[asset.location] = (acc[asset.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  // Work Order Analytics
  const workOrderStats = {
    total: workOrders.length,
    open: workOrders.filter(wo => wo.status === 'open').length,
    inProgress: workOrders.filter(wo => wo.status === 'in_progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
    overdue: workOrders.filter(wo => {
      return wo.status !== 'completed' && new Date(wo.dueDate) < new Date();
    }).length,
    byPriority: workOrders.reduce((acc, wo) => {
      acc[wo.priority] = (acc[wo.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byType: workOrders.reduce((acc, wo) => {
      acc[wo.type] = (acc[wo.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  // Request Analytics
  const requestStats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    converted: requests.filter(r => r.status === 'converted').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    estimatedCosts: requests.reduce((sum, request) => sum + (request.estimatedCost || 0), 0)
  };

  // Performance Metrics
  const performanceMetrics = {
    assetUptime: Math.round((assetStats.operational / assetStats.total) * 100),
    completionRate: Math.round((workOrderStats.completed / workOrderStats.total) * 100),
    approvalRate: Math.round((requestStats.approved / requestStats.total) * 100),
    averageResponseTime: '2.5h' // Mock data
  };

  const renderSimpleChart = (data: Record<string, number>, title: string, colors: string[]) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(data).map(([key, value], index) => (
            <div key={key} className="flex items-center gap-3">
              <div 
                className={`w-4 h-4 rounded ${colors[index % colors.length]}`}
              ></div>
              <div className="flex-1 flex justify-between items-center">
                <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                <span className="font-semibold">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderProgressBar = (label: string, current: number, total: number, color: string) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span>{current}/{total} ({percentage}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${color}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Column - Reports List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Reportistica</h1>
              <p className="text-sm text-gray-600">{filteredReports.length} report disponibili</p>
            </div>
            <Button 
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
              placeholder="Cerca report..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-gray-50 p-2 rounded text-center">
              <div className="text-lg font-semibold text-gray-900">{assets.length}</div>
              <div className="text-xs text-gray-600">Asset</div>
            </div>
            <div className="bg-gray-50 p-2 rounded text-center">
              <div className="text-lg font-semibold text-gray-900">{workOrders.length}</div>
              <div className="text-xs text-gray-600">Work Orders</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white"
            >
              <option value="all">Tutti i tipi</option>
              <option value="assets">Asset</option>
              <option value="workorders">Work Orders</option>
              <option value="maintenance">Manutenzione</option>
              <option value="requests">Richieste</option>
              <option value="performance">Performance</option>
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white"
            >
              <option value="week">Settimana</option>
              <option value="month">Mese</option>
              <option value="quarter">Trimestre</option>
              <option value="year">Anno</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2">
              Ordina per: Nome
            </div>
            {filteredReports.map((report) => {
              const IconComponent = getIconComponent(report.icon);
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                    selectedReport?.id === report.id
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium ${getTypeColor(report.type)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{report.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                          {report.status === 'ready' ? 'Pronto' : report.status === 'generating' ? 'Generazione' : 'Errore'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{report.description}</p>
                      {report.lastGenerated && (
                        <p className="text-xs text-gray-500">
                          Ultimo aggiornamento: {new Date(report.lastGenerated).toLocaleDateString('it-IT')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column - Report Details */}
      <div className="flex-1 flex flex-col">{selectedReport ? (
        <>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(selectedReport.type)}`}>
                  {(() => {
                    const IconComponent = getIconComponent(selectedReport.icon);
                    return <IconComponent className="h-6 w-6" />;
                  })()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{selectedReport.name}</h1>
                  <p className="text-sm text-gray-600">{selectedReport.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedReport.status)}`}>
                  {selectedReport.status === 'ready' ? 'Pronto' : selectedReport.status === 'generating' ? 'Generazione' : 'Errore'}
                </span>
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Esporta
                  </Button>
                  
                  {showExportMenu && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            exportToExcel();
                            setShowExportMenu(false);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Download className="h-4 w-4" />
                          Esporta CSV/Excel
                        </button>
                        <button
                          onClick={() => {
                            exportToPDF();
                            setShowExportMenu(false);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Download className="h-4 w-4" />
                          Esporta PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
              {/* KPI Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{assetStats.total}</p>
                        <p className="text-sm text-gray-600">Asset Totali</p>
                        <p className="text-xs text-green-600">
                          {performanceMetrics.assetUptime}% operativi
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{workOrderStats.total}</p>
                        <p className="text-sm text-gray-600">Work Orders</p>
                        <p className="text-xs text-green-600">
                          {performanceMetrics.completionRate}% completati
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          €{Math.round(assetStats.totalValue / 1000)}K
                        </p>
                        <p className="text-sm text-gray-600">Valore Asset</p>
                        <p className="text-xs text-blue-600">
                          €{Math.round(requestStats.estimatedCosts / 1000)}K pending
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{performanceMetrics.averageResponseTime}</p>
                        <p className="text-sm text-gray-600">Tempo Risposta Medio</p>
                        <p className="text-xs text-green-600">
                          {workOrderStats.overdue} in ritardo
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                {/* Asset Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Stato Asset
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {renderProgressBar('Operativi', assetStats.operational, assetStats.total, 'bg-green-500')}
                      {renderProgressBar('In manutenzione', assetStats.maintenance, assetStats.total, 'bg-orange-500')}
                      {renderProgressBar('Fermi', assetStats.down, assetStats.total, 'bg-red-500')}
                    </div>
                  </CardContent>
                </Card>

                {/* Work Order Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Work Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {renderProgressBar('Aperti', workOrderStats.open, workOrderStats.total, 'bg-blue-500')}
                      {renderProgressBar('In corso', workOrderStats.inProgress, workOrderStats.total, 'bg-orange-500')}
                      {renderProgressBar('Completati', workOrderStats.completed, workOrderStats.total, 'bg-green-500')}
                    </div>
                  </CardContent>
                </Card>

                {/* Request Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Richieste
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {renderProgressBar('In attesa', requestStats.pending, requestStats.total, 'bg-orange-500')}
                      {renderProgressBar('Approvate', requestStats.approved, requestStats.total, 'bg-green-500')}
                      {renderProgressBar('Convertite', requestStats.converted, requestStats.total, 'bg-blue-500')}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                {/* Asset by Category */}
                {renderSimpleChart(
                  assetStats.byCategory,
                  'Asset per Categoria',
                  ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500']
                )}

                {/* Asset by Location */}
                {renderSimpleChart(
                  assetStats.byLocation,
                  'Asset per Ubicazione',
                  ['bg-indigo-500', 'bg-cyan-500', 'bg-teal-500']
                )}

                {/* Work Orders by Priority */}
                {renderSimpleChart(
                  workOrderStats.byPriority,
                  'Work Orders per Priorità',
                  ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500']
                )}
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Metriche di Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-sm">Uptime Asset</span>
                        </div>
                        <span className="font-semibold text-green-600">
                          {performanceMetrics.assetUptime}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-5 w-5 text-blue-600" />
                          <span className="text-sm">Tasso Completamento WO</span>
                        </div>
                        <span className="font-semibold text-blue-600">
                          {performanceMetrics.completionRate}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                          <span className="text-sm">Tasso Approvazione Richieste</span>
                        </div>
                        <span className="font-semibold text-purple-600">
                          {performanceMetrics.approvalRate}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-orange-600" />
                          <span className="text-sm">Tempo Risposta Medio</span>
                        </div>
                        <span className="font-semibold text-orange-600">
                          {performanceMetrics.averageResponseTime}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Alert e Attenzioni
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {workOrderStats.overdue > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="text-sm font-medium text-red-800">
                              {workOrderStats.overdue} Work Orders in ritardo
                            </p>
                            <p className="text-xs text-red-600">Richiedono attenzione immediata</p>
                          </div>
                        </div>
                      )}

                      {assetStats.down > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                          <Package className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="text-sm font-medium text-red-800">
                              {assetStats.down} Asset non operativi
                            </p>
                            <p className="text-xs text-red-600">Impatto sulla produzione</p>
                          </div>
                        </div>
                      )}

                      {requestStats.pending > 5 && (
                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <Clock className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="text-sm font-medium text-orange-800">
                              {requestStats.pending} Richieste in attesa
                            </p>
                            <p className="text-xs text-orange-600">Necessario review</p>
                          </div>
                        </div>
                      )}

                      {workOrderStats.overdue === 0 && assetStats.down === 0 && requestStats.pending <= 5 && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Tutto sotto controllo
                            </p>
                            <p className="text-xs text-green-600">Nessun alert critico</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Seleziona un Report</h3>
            <p className="text-gray-600">Scegli un report dalla lista per visualizzare i dettagli</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}