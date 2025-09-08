'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  WorkflowRule, 
  WorkflowExecution, 
  WorkflowTrigger, 
  WorkflowAction,
  WorkflowCondition,
  getWorkflowEngine 
} from '@/lib/workflow-engine';
import {
  Plus,
  Play,
  Pause,
  Settings,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Save,
  BarChart3,
  Zap,
  Calendar,
  Bot
} from 'lucide-react';

interface WorkflowManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkflowManager({ isOpen, onClose }: WorkflowManagerProps) {
  const [activeTab, setActiveTab] = useState<'rules' | 'executions' | 'stats'>('rules');
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<WorkflowRule | null>(null);
  const [stats, setStats] = useState<any>(null);

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    enabled: true,
    triggerType: 'event_based' as WorkflowTrigger,
    conditions: [] as WorkflowCondition[],
    actions: [] as any[],
    schedule: {
      frequency: 'daily' as const,
      interval: 1,
      time: '09:00'
    }
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    setRules(getWorkflowEngine().getRules());
    setExecutions(getWorkflowEngine().getExecutions());
    setStats(getWorkflowEngine().getExecutionStats());
  };

  const handleCreateRule = () => {
    try {
      const rule = getWorkflowEngine().addRule({
        name: newRule.name,
        description: newRule.description,
        enabled: newRule.enabled,
        trigger: {
          type: newRule.triggerType,
          conditions: newRule.conditions,
          ...(newRule.triggerType === 'time_based' && { schedule: newRule.schedule })
        },
        actions: newRule.actions.map(action => ({
          type: action.type,
          parameters: action.parameters || {},
          delay: action.delay || 0
        })),
        createdBy: 'Admin'
      });

      setRules([...rules, rule]);
      setShowCreateModal(false);
      resetNewRule();
    } catch (error) {
      alert('Errore nella creazione della regola: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    }
  };

  const resetNewRule = () => {
    setNewRule({
      name: '',
      description: '',
      enabled: true,
      triggerType: 'event_based',
      conditions: [],
      actions: [],
      schedule: {
        frequency: 'daily',
        interval: 1,
        time: '09:00'
      }
    });
  };

  const toggleRuleStatus = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    const updatedRule = getWorkflowEngine().updateRule(ruleId, { enabled: !rule.enabled });
    if (updatedRule) {
      setRules(rules.map(r => r.id === ruleId ? updatedRule : r));
    }
  };

  const deleteRule = (ruleId: string) => {
    if (confirm('Sei sicuro di voler eliminare questa regola?')) {
      const success = getWorkflowEngine().deleteRule(ruleId);
      if (success) {
        setRules(rules.filter(r => r.id !== ruleId));
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'running': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getTriggerIcon = (type: WorkflowTrigger) => {
    switch (type) {
      case 'time_based': return <Clock className="h-4 w-4" />;
      case 'event_based': return <Zap className="h-4 w-4" />;
      case 'condition_based': return <Settings className="h-4 w-4" />;
      case 'manual': return <Play className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const addCondition = () => {
    setNewRule({
      ...newRule,
      conditions: [
        ...newRule.conditions,
        {
          field: 'priority',
          operator: 'equals',
          value: 'high',
          valueType: 'static'
        }
      ]
    });
  };

  const removeCondition = (index: number) => {
    setNewRule({
      ...newRule,
      conditions: newRule.conditions.filter((_, i) => i !== index)
    });
  };

  const updateCondition = (index: number, updates: Partial<WorkflowCondition>) => {
    setNewRule({
      ...newRule,
      conditions: newRule.conditions.map((condition, i) => 
        i === index ? { ...condition, ...updates } : condition
      )
    });
  };

  const addAction = () => {
    setNewRule({
      ...newRule,
      actions: [
        ...newRule.actions,
        {
          type: 'send_notification',
          parameters: {},
          delay: 0
        }
      ]
    });
  };

  const removeAction = (index: number) => {
    setNewRule({
      ...newRule,
      actions: newRule.actions.filter((_, i) => i !== index)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Workflow Automation</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Regole ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('executions')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'executions'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Esecuzioni ({executions.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-2 inline" />
            Statistiche
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {activeTab === 'rules' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Regole di Workflow</h3>
                  <p className="text-sm text-gray-500">Automatizza i processi aziendali con regole intelligenti</p>
                </div>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuova Regola
                </Button>
              </div>

              <div className="space-y-4">
                {rules.map((rule) => (
                  <Card key={rule.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${rule.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {getTriggerIcon(rule.trigger.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{rule.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {rule.enabled ? 'Attiva' : 'Disattivata'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span>Trigger: {rule.trigger.type}</span>
                            <span>Azioni: {rule.actions.length}</span>
                            <span>Esecuzioni: {rule.executionCount}</span>
                            {rule.lastExecuted && (
                              <span>Ultima: {new Date(rule.lastExecuted).toLocaleDateString('it-IT')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRuleStatus(rule.id)}
                        >
                          {rule.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRule(rule)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRule(rule.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {rules.length === 0 && (
                  <div className="text-center py-12">
                    <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna regola configurata</h3>
                    <p className="text-gray-500 mb-4">Crea la tua prima regola per automatizzare i processi</p>
                    <Button onClick={() => setShowCreateModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crea Prima Regola
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'executions' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cronologia Esecuzioni</h3>
              <div className="space-y-4">
                {executions.slice(0, 50).map((execution) => {
                  const rule = rules.find(r => r.id === execution.ruleId);
                  return (
                    <Card key={execution.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              execution.status === 'completed' ? 'bg-green-500' :
                              execution.status === 'failed' ? 'bg-red-500' :
                              execution.status === 'running' ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}></span>
                            <span className="font-medium text-gray-900">{rule?.name || 'Regola eliminata'}</span>
                            <span className={`text-sm ${getStatusColor(execution.status)}`}>
                              {execution.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Entità: {execution.entityType} - ID: {execution.entityId}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Iniziato: {new Date(execution.startedAt).toLocaleString('it-IT')}
                            {execution.completedAt && (
                              <> • Completato: {new Date(execution.completedAt).toLocaleString('it-IT')}</>
                            )}
                          </div>
                          {execution.error && (
                            <div className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded">
                              Errore: {execution.error}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {execution.actions.map((action, index) => (
                            <div
                              key={index}
                              className={`w-3 h-3 rounded-full ${
                                action.status === 'completed' ? 'bg-green-500' :
                                action.status === 'failed' ? 'bg-red-500' :
                                action.status === 'running' ? 'bg-blue-500' :
                                action.status === 'skipped' ? 'bg-gray-400' :
                                'bg-yellow-500'
                              }`}
                              title={`${action.actionType}: ${action.status}`}
                            />
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {executions.length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna esecuzione</h3>
                    <p className="text-gray-500">Le esecuzioni dei workflow appariranno qui</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && stats && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Statistiche Workflow</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Esecuzioni Totali</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalExecutions}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Successi</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.successfulExecutions}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Fallimenti</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.failedExecutions}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8 text-purple-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Tempo Medio</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(stats.averageExecutionTime / 1000)}s
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {stats.mostTriggeredRules.length > 0 && (
                <Card className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Regole Più Attive</h4>
                  <div className="space-y-3">
                    {stats.mostTriggeredRules.map((rule: any, index: number) => (
                      <div key={rule.ruleId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                          <span className="font-medium text-gray-900">{rule.ruleName}</span>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {rule.count} esecuzioni
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Create Rule Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Nuova Regola Workflow</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Regola</label>
                    <input
                      type="text"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Es: Auto-assegnazione urgenti"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
                    <textarea
                      value={newRule.description}
                      onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Descrivi cosa fa questa regola..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Trigger</label>
                    <select
                      value={newRule.triggerType}
                      onChange={(e) => setNewRule({ ...newRule, triggerType: e.target.value as WorkflowTrigger })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="event_based">Basato su Eventi</option>
                      <option value="time_based">Basato su Tempo</option>
                      <option value="condition_based">Basato su Condizioni</option>
                      <option value="manual">Manuale</option>
                    </select>
                  </div>
                </div>

                {/* Time-based Schedule */}
                {newRule.triggerType === 'time_based' && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Pianificazione</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequenza</label>
                        <select
                          value={newRule.schedule.frequency}
                          onChange={(e) => setNewRule({
                            ...newRule,
                            schedule: { ...newRule.schedule, frequency: e.target.value as any }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="hourly">Ogni ora</option>
                          <option value="daily">Giornaliera</option>
                          <option value="weekly">Settimanale</option>
                          <option value="monthly">Mensile</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Intervallo</label>
                        <input
                          type="number"
                          min="1"
                          value={newRule.schedule.interval}
                          onChange={(e) => setNewRule({
                            ...newRule,
                            schedule: { ...newRule.schedule, interval: parseInt(e.target.value) }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Orario</label>
                      <input
                        type="time"
                        value={newRule.schedule.time}
                        onChange={(e) => setNewRule({
                          ...newRule,
                          schedule: { ...newRule.schedule, time: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Conditions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Condizioni</h4>
                    <Button size="sm" onClick={addCondition}>
                      <Plus className="h-4 w-4 mr-1" />
                      Aggiungi
                    </Button>
                  </div>
                  
                  {newRule.conditions.map((condition, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Condizione {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <select
                          value={condition.field}
                          onChange={(e) => updateCondition(index, { field: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="priority">Priorità</option>
                          <option value="status">Stato</option>
                          <option value="dueDate">Data Scadenza</option>
                          <option value="assignedTo">Assegnato a</option>
                        </select>
                        <select
                          value={condition.operator}
                          onChange={(e) => updateCondition(index, { operator: e.target.value as any })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="equals">Uguale a</option>
                          <option value="not_equals">Diverso da</option>
                          <option value="greater_than">Maggiore di</option>
                          <option value="less_than">Minore di</option>
                          <option value="contains">Contiene</option>
                        </select>
                        <input
                          type="text"
                          value={condition.value}
                          onChange={(e) => updateCondition(index, { value: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Valore"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Azioni</h4>
                    <Button size="sm" onClick={addAction}>
                      <Plus className="h-4 w-4 mr-1" />
                      Aggiungi
                    </Button>
                  </div>
                  
                  {newRule.actions.map((action, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Azione {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAction(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <select
                          value={action.type}
                          onChange={(e) => {
                            const updatedActions = [...newRule.actions];
                            updatedActions[index] = { ...action, type: e.target.value };
                            setNewRule({ ...newRule, actions: updatedActions });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="send_notification">Invia Notifica</option>
                          <option value="assign_technician">Assegna Tecnico</option>
                          <option value="change_priority">Cambia Priorità</option>
                          <option value="change_status">Cambia Stato</option>
                          <option value="create_work_order">Crea Work Order</option>
                          <option value="escalate">Escalation</option>
                        </select>
                        
                        <input
                          type="number"
                          min="0"
                          value={action.delay || 0}
                          onChange={(e) => {
                            const updatedActions = [...newRule.actions];
                            updatedActions[index] = { ...action, delay: parseInt(e.target.value) };
                            setNewRule({ ...newRule, actions: updatedActions });
                          }}
                          placeholder="Ritardo in minuti"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Annulla
                </Button>
                <Button
                  onClick={handleCreateRule}
                  disabled={!newRule.name.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Crea Regola
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}