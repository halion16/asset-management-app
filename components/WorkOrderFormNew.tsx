'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkOrder, mockAssets, mockUsers, mockSuppliers } from "@/data/mockData";
import { getCategories } from "@/lib/storage";
import { calculateNextDueDate, getRecurrenceLabel, RecurrenceType } from "@/lib/recurrence";
import { X, Upload, Plus, AlertTriangle, Zap, Wrench, Settings, Droplets, Calculator } from "lucide-react";

interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  onSave: (workOrder: WorkOrder) => void;
  onCancel: () => void;
}

const types: Array<WorkOrder['type']> = ['preventive', 'corrective', 'emergency', 'compliance', 'safety'];
const statuses: Array<WorkOrder['status']> = ['open', 'in_progress', 'completed', 'on_hold'];
const priorities = ['low', 'medium', 'high', 'critical'] as const;

const typeLabels = {
  preventive: "Preventiva",
  corrective: "Correttiva", 
  emergency: "Emergenza",
  compliance: "Compliance",
  safety: "Sicurezza"
};

const priorityLabels = {
  low: "Bassa",
  medium: "Media",
  high: "Alta",
  critical: "Critica"
};

export default function WorkOrderFormNew({ workOrder, onSave, onCancel }: WorkOrderFormProps) {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkOrder> & { 
    categoryId?: string;
    supplierId?: string;
    providerId?: string;
    estimatedHours?: string;
    estimatedMinutes?: string;
    tags?: string;
    recurrenceType?: RecurrenceType;
    procedure?: string;
    recurrenceInterval?: number;
    weeklyDays?: number[];
    monthlyDay?: number;
  }>({
    title: '',
    description: '',
    assetId: '',
    assetName: '',
    type: 'corrective',
    status: 'open',
    priority: 'medium',
    assignedTo: '',
    requestedBy: mockUsers[0]?.name || '',
    createdDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    estimatedTime: '',
    estimatedHours: '0',
    estimatedMinutes: '0',
    location: '',
    supplier: '',
    categoryId: '',
    supplierId: '',
    providerId: '',
    tags: '',
    recurrenceType: 'none',
    procedure: '',
    recurrenceInterval: 1,
    weeklyDays: [],
    monthlyDay: 5,
    ...workOrder
  });

  const categories = getCategories();

  // Icon mapping function
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      AlertTriangle,
      Zap,
      Wrench,
      Settings,
      Droplets,
      Calculator
    };
    return iconMap[iconName] || Settings; // Default to Settings if icon not found
  };

  // Days of week data (0=Sunday in JS Date but we'll use 1=Monday for UI)
  const daysOfWeek = [
    { id: 1, short: 'LUN', full: 'Lunedì' },
    { id: 2, short: 'MAR', full: 'Martedì' },
    { id: 3, short: 'MER', full: 'Mercoledì' },
    { id: 4, short: 'GIO', full: 'Giovedì' },
    { id: 5, short: 'VEN', full: 'Venerdì' },
    { id: 6, short: 'SAB', full: 'Sabato' },
    { id: 0, short: 'DOM', full: 'Domenica' }
  ];

  const toggleWeeklyDay = (dayId: number) => {
    setFormData(prev => {
      const currentDays = prev.weeklyDays || [];
      const newDays = currentDays.includes(dayId)
        ? currentDays.filter(id => id !== dayId)
        : [...currentDays, dayId].sort();
      
      return { ...prev, weeklyDays: newDays };
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Documentation file handlers
  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setDocumentFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeDocumentFile = (index: number) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Drag & Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setDocumentFiles(prev => [...prev, ...files]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedAsset = mockAssets.find(asset => asset.id === formData.assetId);
    const estimatedTime = `${formData.estimatedHours}h ${formData.estimatedMinutes}m`;
    
    // Calculate next due date for recurrence
    const nextDueDate = formData.recurrenceType !== 'none' && formData.dueDate 
      ? calculateNextDueDate(formData.dueDate, {
          type: formData.recurrenceType,
          interval: formData.recurrenceInterval || 1,
          weeklyDays: formData.recurrenceType === 'weekly' ? formData.weeklyDays : undefined,
          monthlyDay: formData.recurrenceType === 'monthly' ? formData.monthlyDay : undefined
        })
      : null;
    
    const newWorkOrder: WorkOrder = {
      id: workOrder?.id || Date.now().toString(),
      orderNumber: workOrder?.orderNumber || `WO-${Date.now()}`,
      title: formData.title || '',
      description: formData.description || '',
      assetId: formData.assetId || '',
      assetName: selectedAsset?.name || formData.assetName || '',
      type: formData.type || 'corrective',
      status: formData.status || 'open',
      priority: formData.priority || 'medium',
      assignedTo: formData.assignedTo || '',
      requestedBy: formData.requestedBy || '',
      createdDate: formData.createdDate || new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate || '',
      completedDate: formData.completedDate,
      estimatedTime: estimatedTime,
      actualTime: formData.actualTime,
      location: selectedAsset?.location || formData.location || '',
      supplier: formData.supplier,
      recurrence: formData.recurrenceType !== 'none' ? {
        type: formData.recurrenceType,
        interval: formData.recurrenceInterval || 1,
        nextDueDate: nextDueDate,
        isRecurring: true,
        weeklyDays: formData.recurrenceType === 'weekly' ? formData.weeklyDays : undefined,
        monthlyDay: formData.recurrenceType === 'monthly' ? formData.monthlyDay : undefined
      } : undefined,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
      categoryId: formData.categoryId || undefined,
      procedure: formData.procedure || undefined
    };

    onSave(newWorkOrder);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Update asset name and location when asset changes
      if (field === 'assetId') {
        const selectedAsset = mockAssets.find(asset => asset.id === value);
        if (selectedAsset) {
          updated.assetName = selectedAsset.name;
          updated.location = selectedAsset.location;
        }
      }
      
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {workOrder ? 'Modifica Ordine di Lavoro' : 'Nuovo Ordine di lavoro'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Main Title */}
            <div>
              <Input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Cosa bisogna fare?"
                className="text-lg font-medium border-none shadow-none px-0 focus-visible:ring-0"
                required
              />
            </div>

            {/* Documentation Upload Area */}
            <div>
              <input
                type="file"
                multiple
                onChange={handleDocumentUpload}
                className="hidden"
                id="document-upload"
                accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
              />
              <label
                htmlFor="document-upload"
                className={`block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragging 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-sm text-gray-600 mb-1">Aggiungi a documentazione</p>
                <p className="text-xs text-gray-500">Trascina i file qui o clicca per selezionarli</p>
              </label>

              {/* Document Files List */}
              {documentFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Documenti allegati:</label>
                  <div className="space-y-1">
                    {documentFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocumentFile(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Descrizione</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Descrivi i dettagli del lavoro..."
              />
            </div>

            {/* Location and Asset */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Ubicazione</label>
                <select
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleziona ubicazione</option>
                  <option value="Milano">Milano</option>
                  <option value="Franciocorta">Franciocorta</option>
                  <option value="Bergamo">Bergamo</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Attrezzatura</label>
                <select
                  value={formData.assetId}
                  onChange={(e) => handleChange('assetId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleziona attrezzatura</option>
                  {mockAssets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Procedure and Team */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Procedura</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.procedure || ''}
                  onChange={(e) => handleChange('procedure', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome della procedura"
                />
                <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Crea o scegli una nuova Procedura</span>
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Assegnato a</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => handleChange('assignedTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleziona o cerca un utente o team</option>
                  {mockUsers.map(user => (
                    <option key={user.id} value={user.name}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Tempo stimato</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => handleChange('estimatedHours', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    max="999"
                  />
                  <span className="text-sm text-gray-500 py-2">h</span>
                  <input
                    type="number"
                    value={formData.estimatedMinutes}
                    onChange={(e) => handleChange('estimatedMinutes', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    max="59"
                  />
                  <span className="text-sm text-gray-500 py-2">m</span>
                </div>
              </div>
            </div>

            {/* Due Date and Supplier */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Data di inizio</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Ricorrenza</label>
                <select
                  value={formData.recurrenceType}
                  onChange={(e) => handleChange('recurrenceType', e.target.value as RecurrenceType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">Non si ripete</option>
                  <option value="daily">Giornaliera</option>
                  <option value="weekly">Settimanale</option>
                  <option value="monthly">Mensile</option>
                  <option value="yearly">Annuale</option>
                </select>

                {/* Weekly Options */}
                {formData.recurrenceType === 'weekly' && (
                  <div className="mt-3 space-y-3">
                    {/* Interval Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Ogni</span>
                      <select
                        value={formData.recurrenceInterval}
                        onChange={(e) => handleChange('recurrenceInterval', parseInt(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-16"
                      >
                        {Array.from({length: 52}, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                      <span className="text-sm text-gray-600">settimana{(formData.recurrenceInterval || 1) > 1 ? 'e' : ''} il</span>
                    </div>

                    {/* Days of Week Selector */}
                    <div className="flex gap-1">
                      {daysOfWeek.map(day => {
                        const isSelected = (formData.weeklyDays || []).includes(day.id);
                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleWeeklyDay(day.id)}
                            className={`w-10 h-10 rounded-full text-xs font-medium transition-all ${
                              isSelected 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={day.full}
                          >
                            {day.short}
                          </button>
                        );
                      })}
                    </div>

                    {/* Summary Text */}
                    {(formData.weeklyDays || []).length > 0 && (
                      <p className="text-xs text-blue-600">
                        Si ripete ogni {formData.recurrenceInterval || 1} settimana{(formData.recurrenceInterval || 1) > 1 ? 'e' : ''} il{' '}
                        {(formData.weeklyDays || [])
                          .sort()
                          .map(dayId => daysOfWeek.find(d => d.id === dayId)?.full.slice(0, 3))
                          .filter(Boolean)
                          .join(', ')} dopo il completamento di questo Ordine di lavoro.
                      </p>
                    )}
                  </div>
                )}

                {/* Monthly Options */}
                {formData.recurrenceType === 'monthly' && (
                  <div className="mt-3 space-y-3">
                    {/* Interval and Day Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Ogni</span>
                      <select
                        value={formData.recurrenceInterval}
                        onChange={(e) => handleChange('recurrenceInterval', parseInt(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-16"
                      >
                        {Array.from({length: 24}, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                      <span className="text-sm text-gray-600">mese{(formData.recurrenceInterval || 1) > 1 ? ' il' : ' il'}</span>
                      <select
                        value={formData.monthlyDay}
                        onChange={(e) => handleChange('monthlyDay', parseInt(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-16"
                      >
                        {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>{day}°</option>
                        ))}
                      </select>
                      <span className="text-sm text-gray-600">giorno del mese</span>
                    </div>

                    {/* Summary Text */}
                    <p className="text-xs text-blue-600">
                      Si ripete ogni {formData.recurrenceInterval || 1} mese{(formData.recurrenceInterval || 1) > 1 ? 'i' : ''} il {formData.monthlyDay}° giorno del mese dopo il completamento di questo Ordine di lavoro.
                    </p>
                  </div>
                )}

                {/* Yearly Options */}
                {formData.recurrenceType === 'yearly' && (
                  <div className="mt-3 space-y-3">
                    {/* Interval Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Ogni</span>
                      <select
                        value={formData.recurrenceInterval}
                        onChange={(e) => handleChange('recurrenceInterval', parseInt(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-16"
                      >
                        {Array.from({length: 20}, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                      <span className="text-sm text-gray-600">anno{(formData.recurrenceInterval || 1) > 1 ? 'i' : ''}</span>
                    </div>

                    {/* Summary Text */}
                    <p className="text-xs text-blue-600">
                      Si ripete ogni {formData.recurrenceInterval || 1} anno{(formData.recurrenceInterval || 1) > 1 ? 'i' : ''} dopo il completamento di questo Ordine di lavoro.
                    </p>
                  </div>
                )}

                {/* Other recurrence types feedback */}
                {formData.recurrenceType !== 'none' && formData.recurrenceType !== 'weekly' && formData.recurrenceType !== 'monthly' && formData.recurrenceType !== 'yearly' && (
                  <p className="text-xs text-blue-600 mt-1">
                    Questo ordine di lavoro si ripeterà ogni {getRecurrenceLabel(formData.recurrenceType).toLowerCase()}
                  </p>
                )}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-3">Priorità</label>
              <div className="flex gap-2">
                {priorities.map(priority => {
                  const isSelected = formData.priority === priority;
                  const colors = {
                    low: 'bg-green-500/80 text-white border-green-500/80',
                    medium: 'bg-yellow-500/80 text-white border-yellow-500/80',
                    high: 'bg-orange-500/80 text-white border-orange-500/80',
                    critical: 'bg-red-600/80 text-white border-red-600/80'
                  };
                  
                  return (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => handleChange('priority', priority)}
                      className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-all ${
                        isSelected 
                          ? colors[priority]
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {priorityLabels[priority]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Files and Tags */}
            <div className="space-y-4">
              <div className="space-y-3">
                {/* File Upload Button */}
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-blue-500 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Fascicolo Allega
                  </label>
                </div>

                {/* Attached Files List */}
                {attachedFiles.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">File allegati:</label>
                    <div className="space-y-1">
                      {attachedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Aggiungi tag separati da virgola"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Categoria</label>
                <div className="relative">
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleChange('categoryId', e.target.value)}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleziona categoria</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {/* Category Icon */}
                  {formData.categoryId && (() => {
                    const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
                    if (selectedCategory) {
                      const IconComponent = getIconComponent(selectedCategory.icon);
                      return (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <IconComponent 
                            size={16} 
                            style={{ color: selectedCategory.color }}
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Provider */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Fornitori</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => handleChange('supplierId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleziona fornitore</option>
                  {mockSuppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Crea
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}