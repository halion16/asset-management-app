/**
 * Advanced Workflow Engine per Asset Management
 * Permette automazione intelligente dei processi aziendali
 */

export type WorkflowTrigger = 
  | 'time_based'           // Trigger temporale (ogni X giorni/ore)
  | 'event_based'          // Trigger su eventi (work order creato, asset modificato)
  | 'condition_based'      // Trigger su condizioni (priorità alta, scadenza vicina)
  | 'manual';              // Trigger manuale

export type WorkflowAction = 
  | 'create_work_order'    // Crea nuovo work order
  | 'assign_technician'    // Assegna tecnico automaticamente
  | 'send_notification'    // Invia notifica
  | 'escalate'             // Escalation gerarchica
  | 'change_priority'      // Modifica priorità
  | 'change_status'        // Modifica stato
  | 'create_request'       // Crea richiesta
  | 'schedule_maintenance' // Pianifica manutenzione
  | 'update_asset';        // Aggiorna asset

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: {
    type: WorkflowTrigger;
    conditions: WorkflowCondition[];
    schedule?: {
      frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
      interval: number;
      time?: string; // HH:MM format
      days?: number[]; // 0-6 for weekly
      date?: number; // 1-31 for monthly
    };
  };
  actions: WorkflowActionConfig[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  executionCount: number;
  lastExecuted?: string;
}

export interface WorkflowCondition {
  field: string;           // Campo da verificare (es: 'priority', 'dueDate', 'status')
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'is_empty' | 'is_not_empty' | 'in' | 'between';
  value: any;              // Valore di confronto
  valueType: 'static' | 'dynamic' | 'user_input'; // Tipo di valore
}

export interface WorkflowActionConfig {
  type: WorkflowAction;
  parameters: Record<string, any>;
  delay?: number;          // Ritardo in minuti prima dell'esecuzione
  condition?: WorkflowCondition; // Condizione per eseguire l'azione
}

export interface WorkflowExecution {
  id: string;
  ruleId: string;
  entityId: string;        // ID dell'entità che ha scatenato il workflow
  entityType: 'work_order' | 'asset' | 'request' | 'user';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  error?: string;
  actions: WorkflowActionExecution[];
}

export interface WorkflowActionExecution {
  actionType: WorkflowAction;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: any;
}

/**
 * Workflow Engine - Core Class
 */
export class WorkflowEngine {
  private rules: WorkflowRule[] = [];
  private executions: WorkflowExecution[] = [];
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.loadRules();
    this.initializeScheduledJobs();
  }

  /**
   * Aggiunge una nuova regola di workflow
   */
  addRule(rule: Omit<WorkflowRule, 'id' | 'createdAt' | 'updatedAt' | 'executionCount'>): WorkflowRule {
    const newRule: WorkflowRule = {
      ...rule,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executionCount: 0
    };

    this.rules.push(newRule);
    this.saveRules();
    
    // Se è un trigger temporale, programma l'esecuzione
    if (newRule.trigger.type === 'time_based' && newRule.enabled) {
      this.scheduleRule(newRule);
    }

    return newRule;
  }

  /**
   * Esegue workflow basati su eventi
   */
  async executeEventBasedWorkflows(
    eventType: string, 
    entityType: string, 
    entityId: string, 
    entityData: any
  ): Promise<WorkflowExecution[]> {
    const applicableRules = this.rules.filter(rule => 
      rule.enabled && 
      rule.trigger.type === 'event_based' &&
      this.evaluateConditions(rule.trigger.conditions, entityData)
    );

    const executions: WorkflowExecution[] = [];

    for (const rule of applicableRules) {
      const execution = await this.executeRule(rule, entityId, entityType as any, entityData);
      executions.push(execution);
    }

    return executions;
  }

  /**
   * Esegue workflow basati su condizioni
   */
  async executeConditionBasedWorkflows(): Promise<WorkflowExecution[]> {
    const conditionRules = this.rules.filter(rule => 
      rule.enabled && rule.trigger.type === 'condition_based'
    );

    const executions: WorkflowExecution[] = [];

    for (const rule of conditionRules) {
      // Qui dovresti recuperare tutte le entità che potrebbero soddisfare le condizioni
      // Per ora simuliamo con i work orders
      const entities = await this.getEntitiesForConditionCheck(rule);
      
      for (const entity of entities) {
        if (this.evaluateConditions(rule.trigger.conditions, entity.data)) {
          const execution = await this.executeRule(rule, entity.id, entity.type, entity.data);
          executions.push(execution);
        }
      }
    }

    return executions;
  }

  /**
   * Esegue una singola regola di workflow
   */
  private async executeRule(
    rule: WorkflowRule, 
    entityId: string, 
    entityType: WorkflowExecution['entityType'], 
    entityData: any
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: this.generateId(),
      ruleId: rule.id,
      entityId,
      entityType,
      status: 'running',
      startedAt: new Date().toISOString(),
      actions: rule.actions.map(action => ({
        actionType: action.type,
        status: 'pending'
      }))
    };

    this.executions.push(execution);

    try {
      // Esegui ogni azione
      for (let i = 0; i < rule.actions.length; i++) {
        const actionConfig = rule.actions[i];
        const actionExecution = execution.actions[i];

        // Verifica condizione dell'azione (se presente)
        if (actionConfig.condition && !this.evaluateCondition(actionConfig.condition, entityData)) {
          actionExecution.status = 'skipped';
          continue;
        }

        // Applica ritardo se specificato
        if (actionConfig.delay && actionConfig.delay > 0) {
          await this.delay(actionConfig.delay * 60 * 1000); // Converti minuti in millisecondi
        }

        actionExecution.status = 'running';
        actionExecution.startedAt = new Date().toISOString();

        try {
          const result = await this.executeAction(actionConfig, entityId, entityType, entityData);
          actionExecution.result = result;
          actionExecution.status = 'completed';
          actionExecution.completedAt = new Date().toISOString();
        } catch (error) {
          actionExecution.error = error instanceof Error ? error.message : String(error);
          actionExecution.status = 'failed';
          actionExecution.completedAt = new Date().toISOString();
        }
      }

      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();

      // Aggiorna contatore esecuzioni
      rule.executionCount++;
      rule.lastExecuted = new Date().toISOString();
      this.saveRules();

    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.completedAt = new Date().toISOString();
    }

    return execution;
  }

  /**
   * Esegue una singola azione del workflow
   */
  private async executeAction(
    actionConfig: WorkflowActionConfig, 
    entityId: string, 
    entityType: WorkflowExecution['entityType'], 
    entityData: any
  ): Promise<any> {
    switch (actionConfig.type) {
      case 'create_work_order':
        return this.createWorkOrder(actionConfig.parameters);
      
      case 'assign_technician':
        return this.assignTechnician(entityId, actionConfig.parameters);
      
      case 'send_notification':
        return this.sendNotification(actionConfig.parameters);
      
      case 'escalate':
        return this.escalateWorkOrder(entityId, actionConfig.parameters);
      
      case 'change_priority':
        return this.changePriority(entityId, actionConfig.parameters.priority);
      
      case 'change_status':
        return this.changeStatus(entityId, actionConfig.parameters.status);
      
      case 'create_request':
        return this.createRequest(actionConfig.parameters);
      
      case 'schedule_maintenance':
        return this.scheduleMaintenance(actionConfig.parameters);
      
      case 'update_asset':
        return this.updateAsset(entityId, actionConfig.parameters);
      
      default:
        throw new Error(`Azione non supportata: ${actionConfig.type}`);
    }
  }

  /**
   * Valuta se tutte le condizioni sono soddisfatte
   */
  private evaluateConditions(conditions: WorkflowCondition[], data: any): boolean {
    return conditions.every(condition => this.evaluateCondition(condition, data));
  }

  /**
   * Valuta una singola condizione
   */
  private evaluateCondition(condition: WorkflowCondition, data: any): boolean {
    const fieldValue = this.getFieldValue(data, condition.field);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      
      case 'not_equals':
        return fieldValue !== conditionValue;
      
      case 'greater_than':
        return fieldValue > conditionValue;
      
      case 'less_than':
        return fieldValue < conditionValue;
      
      case 'contains':
        return String(fieldValue).includes(String(conditionValue));
      
      case 'is_empty':
        return !fieldValue || fieldValue === '' || fieldValue === null || fieldValue === undefined;
      
      case 'is_not_empty':
        return fieldValue && fieldValue !== '' && fieldValue !== null && fieldValue !== undefined;
      
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
      
      case 'between':
        return Array.isArray(conditionValue) && 
               conditionValue.length === 2 && 
               fieldValue >= conditionValue[0] && 
               fieldValue <= conditionValue[1];
      
      default:
        return false;
    }
  }

  /**
   * Ottiene il valore di un campo dall'oggetto dati
   */
  private getFieldValue(data: any, fieldPath: string): any {
    return fieldPath.split('.').reduce((obj, key) => obj?.[key], data);
  }

  /**
   * Programma l'esecuzione di regole basate su tempo
   */
  private scheduleRule(rule: WorkflowRule): void {
    if (rule.trigger.type !== 'time_based' || !rule.trigger.schedule) return;

    const { frequency, interval, time, days, date } = rule.trigger.schedule;
    let nextExecution = this.calculateNextExecution(frequency, interval, time, days, date);
    
    const scheduleExecution = () => {
      this.executeTimeBasedRule(rule);
      nextExecution = this.calculateNextExecution(frequency, interval, time, days, date);
      const timeout = setTimeout(scheduleExecution, nextExecution.getTime() - Date.now());
      this.scheduledJobs.set(rule.id, timeout);
    };

    const timeout = setTimeout(scheduleExecution, nextExecution.getTime() - Date.now());
    this.scheduledJobs.set(rule.id, timeout);
  }

  /**
   * Calcola la prossima esecuzione basata sulla frequenza
   */
  private calculateNextExecution(
    frequency: string, 
    interval: number, 
    time?: string, 
    days?: number[], 
    date?: number
  ): Date {
    const now = new Date();
    const next = new Date();

    switch (frequency) {
      case 'hourly':
        next.setHours(now.getHours() + interval, 0, 0, 0);
        break;
      
      case 'daily':
        if (time) {
          const [hours, minutes] = time.split(':').map(Number);
          next.setHours(hours, minutes, 0, 0);
          next.setDate(now.getDate() + interval);
          if (next <= now) {
            next.setDate(next.getDate() + interval);
          }
        } else {
          next.setDate(now.getDate() + interval);
        }
        break;
      
      case 'weekly':
        if (days && days.length > 0) {
          // Trova il prossimo giorno della settimana
          let nextDay = days.find(day => day > now.getDay()) || days[0];
          let daysToAdd = nextDay - now.getDay();
          if (daysToAdd <= 0) daysToAdd += 7;
          next.setDate(now.getDate() + daysToAdd);
        }
        if (time) {
          const [hours, minutes] = time.split(':').map(Number);
          next.setHours(hours, minutes, 0, 0);
        }
        break;
      
      case 'monthly':
        if (date) {
          next.setDate(date);
          next.setMonth(now.getMonth() + interval);
          if (next <= now) {
            next.setMonth(next.getMonth() + interval);
          }
        }
        if (time) {
          const [hours, minutes] = time.split(':').map(Number);
          next.setHours(hours, minutes, 0, 0);
        }
        break;
    }

    return next;
  }

  /**
   * Esegue regole basate su tempo
   */
  private async executeTimeBasedRule(rule: WorkflowRule): Promise<void> {
    // Per regole basate su tempo, eseguiamo su tutte le entità che soddisfano le condizioni
    const entities = await this.getEntitiesForConditionCheck(rule);
    
    for (const entity of entities) {
      if (this.evaluateConditions(rule.trigger.conditions, entity.data)) {
        await this.executeRule(rule, entity.id, entity.type, entity.data);
      }
    }
  }

  /**
   * Ottiene le entità per il controllo delle condizioni
   * In un'implementazione reale, questo dovrebbe interrogare il database
   */
  private async getEntitiesForConditionCheck(rule: WorkflowRule): Promise<Array<{id: string, type: WorkflowExecution['entityType'], data: any}>> {
    // Placeholder - in implementazione reale dovrebbe interrogare il database
    // Per ora restituiamo array vuoto
    return [];
  }

  // Metodi di utilità per azioni specifiche
  private async createWorkOrder(parameters: any): Promise<any> {
    // Implementazione creazione work order
    console.log('Creating work order with parameters:', parameters);
    return { id: this.generateId(), action: 'work_order_created' };
  }

  private async assignTechnician(workOrderId: string, parameters: any): Promise<any> {
    // Implementazione assegnazione tecnico
    console.log('Assigning technician to work order:', workOrderId, parameters);
    return { action: 'technician_assigned' };
  }

  private async sendNotification(parameters: any): Promise<any> {
    // Implementazione invio notifica
    console.log('Sending notification:', parameters);
    return { action: 'notification_sent' };
  }

  private async escalateWorkOrder(workOrderId: string, parameters: any): Promise<any> {
    // Implementazione escalation
    console.log('Escalating work order:', workOrderId, parameters);
    return { action: 'work_order_escalated' };
  }

  private async changePriority(workOrderId: string, priority: string): Promise<any> {
    // Implementazione cambio priorità
    console.log('Changing priority for work order:', workOrderId, 'to:', priority);
    return { action: 'priority_changed', newPriority: priority };
  }

  private async changeStatus(workOrderId: string, status: string): Promise<any> {
    // Implementazione cambio stato
    console.log('Changing status for work order:', workOrderId, 'to:', status);
    return { action: 'status_changed', newStatus: status };
  }

  private async createRequest(parameters: any): Promise<any> {
    // Implementazione creazione richiesta
    console.log('Creating request with parameters:', parameters);
    return { id: this.generateId(), action: 'request_created' };
  }

  private async scheduleMaintenance(parameters: any): Promise<any> {
    // Implementazione pianificazione manutenzione
    console.log('Scheduling maintenance:', parameters);
    return { action: 'maintenance_scheduled' };
  }

  private async updateAsset(assetId: string, parameters: any): Promise<any> {
    // Implementazione aggiornamento asset
    console.log('Updating asset:', assetId, parameters);
    return { action: 'asset_updated' };
  }

  // Metodi di utilità
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private loadRules(): void {
    // In implementazione reale, caricare dal database
    if (typeof window !== 'undefined' && localStorage) {
      const stored = localStorage.getItem('workflow_rules');
      if (stored) {
        this.rules = JSON.parse(stored);
      }
    }
  }

  private saveRules(): void {
    // In implementazione reale, salvare nel database
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('workflow_rules', JSON.stringify(this.rules));
    }
  }

  private initializeScheduledJobs(): void {
    // Inizializza i job programmati per le regole esistenti
    this.rules
      .filter(rule => rule.enabled && rule.trigger.type === 'time_based')
      .forEach(rule => this.scheduleRule(rule));
  }

  // API Pubbliche
  public getRules(): WorkflowRule[] {
    return this.rules;
  }

  public getRule(id: string): WorkflowRule | undefined {
    return this.rules.find(rule => rule.id === id);
  }

  public updateRule(id: string, updates: Partial<WorkflowRule>): WorkflowRule | null {
    const ruleIndex = this.rules.findIndex(rule => rule.id === id);
    if (ruleIndex === -1) return null;

    this.rules[ruleIndex] = {
      ...this.rules[ruleIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveRules();
    
    // Riprogramma se necessario
    if (this.scheduledJobs.has(id)) {
      clearTimeout(this.scheduledJobs.get(id)!);
      this.scheduledJobs.delete(id);
    }
    
    if (this.rules[ruleIndex].enabled && this.rules[ruleIndex].trigger.type === 'time_based') {
      this.scheduleRule(this.rules[ruleIndex]);
    }

    return this.rules[ruleIndex];
  }

  public deleteRule(id: string): boolean {
    const ruleIndex = this.rules.findIndex(rule => rule.id === id);
    if (ruleIndex === -1) return false;

    // Cancella job programmato se esiste
    if (this.scheduledJobs.has(id)) {
      clearTimeout(this.scheduledJobs.get(id)!);
      this.scheduledJobs.delete(id);
    }

    this.rules.splice(ruleIndex, 1);
    this.saveRules();
    return true;
  }

  public getExecutions(ruleId?: string): WorkflowExecution[] {
    if (ruleId) {
      return this.executions.filter(execution => execution.ruleId === ruleId);
    }
    return this.executions;
  }

  public getExecutionStats(): {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    mostTriggeredRules: Array<{ruleId: string, ruleName: string, count: number}>;
  } {
    const totalExecutions = this.executions.length;
    const successfulExecutions = this.executions.filter(e => e.status === 'completed').length;
    const failedExecutions = this.executions.filter(e => e.status === 'failed').length;
    
    const completedExecutions = this.executions.filter(e => e.completedAt && e.startedAt);
    const totalTime = completedExecutions.reduce((sum, e) => {
      return sum + (new Date(e.completedAt!).getTime() - new Date(e.startedAt).getTime());
    }, 0);
    
    const averageExecutionTime = completedExecutions.length > 0 ? totalTime / completedExecutions.length : 0;

    // Conta esecuzioni per regola
    const ruleExecutionCounts = new Map<string, number>();
    this.executions.forEach(e => {
      const count = ruleExecutionCounts.get(e.ruleId) || 0;
      ruleExecutionCounts.set(e.ruleId, count + 1);
    });

    const mostTriggeredRules = Array.from(ruleExecutionCounts.entries())
      .map(([ruleId, count]) => {
        const rule = this.getRule(ruleId);
        return {
          ruleId,
          ruleName: rule?.name || 'Unknown Rule',
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
      mostTriggeredRules
    };
  }
}

// Istanza singleton del workflow engine - inizializzata lazy per compatibilità SSR
let workflowEngineInstance: WorkflowEngine | null = null;

export function getWorkflowEngine(): WorkflowEngine {
  if (!workflowEngineInstance && typeof window !== 'undefined') {
    workflowEngineInstance = new WorkflowEngine();
  }
  return workflowEngineInstance!;
}