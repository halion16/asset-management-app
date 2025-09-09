'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDocuments, saveDocument, deleteDocument, initializeStorage } from "@/lib/storage";
import { Document } from "@/data/mockData";
import { 
  FileText,
  Plus,
  Search,
  Download,
  Eye,
  Trash2,
  Filter,
  Upload,
  Calendar,
  User,
  Tag,
  Shield,
  File,
  FileImage,
  FileVideo,
  Award,
  BookOpen,
  AlertTriangle,
  Grid3X3,
  List,
  MoreVertical,
  ExternalLink,
  X
} from "lucide-react";

const typeColors = {
  manual: "bg-blue-500 text-white",
  certificate: "bg-green-500 text-white",
  warranty: "bg-purple-500 text-white",
  report: "bg-orange-500 text-white",
  photo: "bg-pink-500 text-white",
  video: "bg-red-500 text-white",
  other: "bg-gray-500 text-white"
};

const typeIcons = {
  manual: BookOpen,
  certificate: Award,
  warranty: Shield,
  report: FileText,
  photo: FileImage,
  video: FileVideo,
  other: File
};

const typeLabels = {
  manual: "Manuale",
  certificate: "Certificato",
  warranty: "Garanzia",
  report: "Report",
  photo: "Foto",
  video: "Video",
  other: "Altro"
};

const categoryLabels = {
  asset: "Asset",
  workorder: "Work Order",
  supplier: "Fornitore",
  safety: "Sicurezza",
  compliance: "Conformità",
  general: "Generale"
};

const accessLevelColors = {
  public: "text-green-600 bg-green-50",
  restricted: "text-orange-600 bg-orange-50",
  confidential: "text-red-600 bg-red-50"
};

const accessLevelLabels = {
  public: "Pubblico",
  restricted: "Limitato",
  confidential: "Riservato"
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAccess, setFilterAccess] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: '',
    description: '',
    type: 'other' as const,
    category: 'general' as const,
    accessLevel: 'public' as const,
    tags: '',
    fileName: '',
    fileSize: 0,
    file: null as File | null
  });

  useEffect(() => {
    initializeStorage();
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, filterType, filterCategory, filterAccess]);

  const loadDocuments = () => {
    const documentsData = getDocuments();
    setDocuments(documentsData);
  };

  const filterDocuments = () => {
    let filtered = documents.filter(doc => doc.isActive);

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === filterCategory);
    }

    if (filterAccess !== 'all') {
      filtered = filtered.filter(doc => doc.accessLevel === filterAccess);
    }

    // Sort by upload date (most recent first)
    filtered.sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime());

    setFilteredDocuments(filtered);
  };

  const handleDownload = (document: Document) => {
    // Simulate download
    const updatedDoc = { ...document, downloadCount: document.downloadCount + 1 };
    saveDocument(updatedDoc);
    loadDocuments();
    
    // In a real app, this would trigger actual file download
    alert(`Download simulato per: ${document.fileName}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo documento?')) {
      deleteDocument(id);
      loadDocuments();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewDocument(prev => ({
        ...prev,
        file,
        fileName: file.name,
        fileSize: file.size
      }));
    }
  };

  const handleUploadDocument = () => {
    if (!newDocument.name.trim()) {
      alert('Il nome del documento è obbligatorio');
      return;
    }

    if (!newDocument.file) {
      alert('Seleziona un file da caricare');
      return;
    }

    const newDoc: Document = {
      id: Date.now().toString(),
      name: newDocument.name,
      description: newDocument.description,
      type: newDocument.type,
      category: newDocument.category,
      fileName: newDocument.fileName,
      fileSize: newDocument.fileSize,
      fileUrl: `/uploads/${newDocument.fileName}`, // Simulated path
      mimeType: 'application/octet-stream', // Default MIME type
      uploadedDate: new Date().toISOString(),
      uploadedBy: 'David Luchetta',
      tags: newDocument.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      version: '1.0',
      downloadCount: 0,
      accessLevel: newDocument.accessLevel,
      isActive: true
    };

    saveDocument(newDoc);
    loadDocuments();

    // Reset form
    setNewDocument({
      name: '',
      description: '',
      type: 'other',
      category: 'general',
      accessLevel: 'public',
      tags: '',
      fileName: '',
      fileSize: 0,
      file: null
    });
    setShowUploadModal(false);

    alert('Documento caricato con successo!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const isExpiringSoon = (expirationDate?: string) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  const isExpired = (expirationDate?: string) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  const DocumentCard = ({ document }: { document: Document }) => {
    const TypeIcon = typeIcons[document.type];
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 border-l-4" 
            style={{ borderLeftColor: typeColors[document.type].split(' ')[0].replace('bg-', '') }}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[document.type]}`}>
                <TypeIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                  {document.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${accessLevelColors[document.accessLevel]}`}>
                    {accessLevelLabels[document.accessLevel]}
                  </span>
                  <span className="text-xs text-gray-500">
                    v{document.version}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDownload(document)}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600"
                onClick={() => handleDelete(document.id)}
                title="Elimina"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Description */}
          {document.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {document.description}
            </p>
          )}

          {/* Metadata */}
          <div className="space-y-2 text-xs text-gray-600 mb-3">
            <div className="flex items-center gap-2">
              <File className="h-3 w-3" />
              <span>{document.fileName} ({formatFileSize(document.fileSize)})</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span>Caricato da: {document.uploadedBy}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Data: {formatDate(document.uploadedDate)}</span>
            </div>

            {document.expirationDate && (
              <div className={`flex items-center gap-2 ${
                isExpired(document.expirationDate) ? 'text-red-600 font-medium' :
                isExpiringSoon(document.expirationDate) ? 'text-orange-600 font-medium' : ''
              }`}>
                <AlertTriangle className="h-3 w-3" />
                <span>
                  Scade: {formatDate(document.expirationDate)}
                  {isExpired(document.expirationDate) && ' (Scaduto)'}
                  {isExpiringSoon(document.expirationDate) && ' (Scade presto)'}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Download className="h-3 w-3" />
              <span>{document.downloadCount} download</span>
            </div>
          </div>

          {/* Asset/WorkOrder Link */}
          {document.assetName && (
            <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
              <span className="text-blue-600 font-medium">Asset: {document.assetName}</span>
            </div>
          )}

          {document.workOrderId && (
            <div className="mb-3 p-2 bg-orange-50 rounded text-xs">
              <span className="text-orange-600 font-medium">Work Order: #{document.workOrderId}</span>
            </div>
          )}

          {/* Tags */}
          {document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {document.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  #{tag}
                </span>
              ))}
              {document.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{document.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const DocumentListItem = ({ document }: { document: Document }) => {
    const TypeIcon = typeIcons[document.type];
    
    return (
      <Card className="group hover:bg-gray-50 transition-colors border-l-4" 
            style={{ borderLeftColor: typeColors[document.type].split(' ')[0].replace('bg-', '') }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Icon & Type */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[document.type]}`}>
              <TypeIcon className="h-5 w-5" />
            </div>

            {/* Name & Description */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 truncate mb-1">
                {document.name}
              </h3>
              <p className="text-xs text-gray-600 truncate">
                {document.description || document.fileName}
              </p>
              
              {/* Tags */}
              <div className="flex gap-1 mt-1">
                {document.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="hidden md:flex flex-col items-end text-xs text-gray-600 min-w-[120px]">
              <span className="font-medium">{document.uploadedBy}</span>
              <span>{formatDate(document.uploadedDate)}</span>
              <span>{formatFileSize(document.fileSize)}</span>
            </div>

            {/* Access Level */}
            <div className="hidden sm:block">
              <span className={`px-2 py-1 text-xs font-medium rounded ${accessLevelColors[document.accessLevel]}`}>
                {accessLevelLabels[document.accessLevel]}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleDownload(document)}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600"
                onClick={() => handleDelete(document.id)}
                title="Elimina"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Stats
  const stats = {
    total: documents.filter(d => d.isActive).length,
    manuals: documents.filter(d => d.isActive && d.type === 'manual').length,
    certificates: documents.filter(d => d.isActive && d.type === 'certificate').length,
    reports: documents.filter(d => d.isActive && d.type === 'report').length,
    expiring: documents.filter(d => d.isActive && isExpiringSoon(d.expirationDate)).length,
    expired: documents.filter(d => d.isActive && isExpired(d.expirationDate)).length
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestione Documenti</h1>
            <p className="text-gray-600">Archivia e gestisci manuali, certificati e documentazione tecnica</p>
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Carica Documento
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Totale</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.manuals}</p>
                  <p className="text-sm text-gray-600">Manuali</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.certificates}</p>
                  <p className="text-sm text-gray-600">Certificati</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.reports}</p>
                  <p className="text-sm text-gray-600">Report</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.expiring}</p>
                  <p className="text-sm text-gray-600">In scadenza</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
                  <p className="text-sm text-gray-600">Scaduti</p>
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
                placeholder="Cerca per nome, descrizione, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutti i tipi</option>
                <option value="manual">Manuali</option>
                <option value="certificate">Certificati</option>
                <option value="warranty">Garanzie</option>
                <option value="report">Report</option>
                <option value="photo">Foto</option>
                <option value="video">Video</option>
                <option value="other">Altro</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutte le categorie</option>
                <option value="asset">Asset</option>
                <option value="workorder">Work Order</option>
                <option value="supplier">Fornitore</option>
                <option value="safety">Sicurezza</option>
                <option value="compliance">Conformità</option>
                <option value="general">Generale</option>
              </select>

              <select
                value={filterAccess}
                onChange={(e) => setFilterAccess(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutti i livelli</option>
                <option value="public">Pubblico</option>
                <option value="restricted">Limitato</option>
                <option value="confidential">Riservato</option>
              </select>

              <div className="flex bg-gray-100 rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-2 py-1"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-2 py-1"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {(searchTerm || filterType !== 'all' || filterCategory !== 'all' || filterAccess !== 'all') && (
            <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
              Mostrando {filteredDocuments.length} di {documents.filter(d => d.isActive).length} documenti
              {searchTerm && ` • Ricerca: "${searchTerm}"`}
              {filterType !== 'all' && ` • Tipo: ${typeLabels[filterType as keyof typeof typeLabels]}`}
              {filterCategory !== 'all' && ` • Categoria: ${categoryLabels[filterCategory as keyof typeof categoryLabels]}`}
              {filterAccess !== 'all' && ` • Accesso: ${accessLevelLabels[filterAccess as keyof typeof accessLevelLabels]}`}
            </div>
          )}
        </div>

        {/* Documents Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocuments.map((document) => (
              <DocumentListItem key={document.id} document={document} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all' || filterAccess !== 'all' 
                ? 'Nessun documento trovato' 
                : 'Nessun documento presente'
              }
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all' || filterAccess !== 'all'
                ? 'Prova a modificare i filtri di ricerca'
                : 'Inizia caricando il primo documento'
              }
            </p>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Carica Nuovo Documento</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleziona File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-3" />
                    <span className="text-sm text-gray-600">
                      {newDocument.fileName || 'Clicca per selezionare un file o trascina qui'}
                    </span>
                    {newDocument.fileSize > 0 && (
                      <span className="text-xs text-gray-500 mt-1">
                        {formatFileSize(newDocument.fileSize)}
                      </span>
                    )}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome Documento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Documento *
                  </label>
                  <input
                    type="text"
                    value={newDocument.name}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome del documento"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={newDocument.type}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="manual">Manuale</option>
                    <option value="certificate">Certificato</option>
                    <option value="warranty">Garanzia</option>
                    <option value="report">Report</option>
                    <option value="photo">Foto</option>
                    <option value="video">Video</option>
                    <option value="other">Altro</option>
                  </select>
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={newDocument.category}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="asset">Asset</option>
                    <option value="workorder">Work Order</option>
                    <option value="supplier">Fornitore</option>
                    <option value="safety">Sicurezza</option>
                    <option value="compliance">Conformità</option>
                    <option value="general">Generale</option>
                  </select>
                </div>

                {/* Livello di Accesso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Livello di Accesso
                  </label>
                  <select
                    value={newDocument.accessLevel}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, accessLevel: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Pubblico</option>
                    <option value="restricted">Limitato</option>
                    <option value="confidential">Riservato</option>
                  </select>
                </div>
              </div>

              {/* Descrizione */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={newDocument.description}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrizione del documento"
                  rows={3}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={newDocument.tags}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tags separati da virgola (es: manutenzione, sicurezza)"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleUploadDocument}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Carica Documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}