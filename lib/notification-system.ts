/**
 * Sistema Notifiche Multi-Canale Avanzato
 * Supporta Email, SMS, Push Notifications, Slack, Teams
 */

export type NotificationChannel = 
  | 'email'
  | 'sms' 
  | 'push'
  | 'slack'
  | 'teams'
  | 'webhook'
  | 'browser';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  variables: string[]; // Es: ['workOrder.title', 'user.name', 'asset.location']
  isHtml: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecipient {
  id: string;
  type: 'user' | 'group' | 'role';
  name: string;
  email?: string;
  phone?: string;
  slackUserId?: string;
  teamsUserId?: string;
  pushTokens?: string[];
  preferences: {
    channels: NotificationChannel[];
    quietHours?: {
      start: string; // HH:MM
      end: string;   // HH:MM
      timezone: string;
    };
    frequency: {
      maxPerHour: number;
      maxPerDay: number;
    };
  };
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggers: {
    events: string[]; // Es: ['work_order_created', 'asset_failure', 'maintenance_due']
    conditions?: {
      field: string;
      operator: string;
      value: any;
    }[];
  };
  channels: NotificationChannel[];
  recipients: {
    users?: string[];
    groups?: string[];
    roles?: string[];
  };
  templateId?: string;
  customMessage?: {
    subject?: string;
    body: string;
  };
  priority: NotificationPriority;
  scheduling?: {
    delay?: number; // minuti
    batch?: boolean;
    batchSize?: number;
    quietHours?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationMessage {
  id: string;
  ruleId?: string;
  templateId?: string;
  channel: NotificationChannel;
  recipients: string[];
  subject?: string;
  body: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  metadata: {
    entityType?: string;
    entityId?: string;
    triggeredBy?: string;
    variables?: Record<string, any>;
  };
  scheduledFor?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  error?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
}

export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  channelStats: Record<NotificationChannel, {
    sent: number;
    delivered: number;
    failed: number;
    averageDeliveryTime: number;
  }>;
  recentMessages: NotificationMessage[];
  failureReasons: Record<string, number>;
}

/**
 * Provider Interfaces per integrazioni esterne
 */
export interface EmailProvider {
  name: 'sendgrid' | 'aws-ses' | 'mailgun' | 'smtp';
  config: {
    apiKey?: string;
    endpoint?: string;
    fromEmail: string;
    fromName: string;
  };
  send(to: string[], subject: string, body: string, isHtml?: boolean): Promise<{success: boolean, messageId?: string, error?: string}>;
}

export interface SMSProvider {
  name: 'twilio' | 'aws-sns' | 'vonage' | 'messagebird';
  config: {
    apiKey: string;
    apiSecret?: string;
    fromNumber: string;
  };
  send(to: string[], message: string): Promise<{success: boolean, messageId?: string, error?: string}>;
}

export interface PushProvider {
  name: 'firebase' | 'apns' | 'web-push';
  config: {
    serverKey?: string;
    vapidKeys?: {
      publicKey: string;
      privateKey: string;
    };
  };
  send(tokens: string[], title: string, body: string, data?: any): Promise<{success: boolean, results: any[], error?: string}>;
}

export interface SlackProvider {
  config: {
    botToken: string;
    webhookUrl?: string;
  };
  send(channel: string, message: string, attachments?: any[]): Promise<{success: boolean, messageId?: string, error?: string}>;
}

export interface TeamsProvider {
  config: {
    webhookUrl: string;
  };
  send(message: string, attachments?: any[]): Promise<{success: boolean, error?: string}>;
}

/**
 * Notification System Core Class
 */
export class NotificationSystem {
  private templates: NotificationTemplate[] = [];
  private recipients: NotificationRecipient[] = [];
  private rules: NotificationRule[] = [];
  private messages: NotificationMessage[] = [];
  private providers: {
    email?: EmailProvider;
    sms?: SMSProvider;
    push?: PushProvider;
    slack?: SlackProvider;
    teams?: TeamsProvider;
  } = {};

  constructor() {
    this.loadData();
    this.initializeDefaults();
    this.startProcessingQueue();
  }

  /**
   * Configurazione Providers
   */
  setEmailProvider(provider: EmailProvider): void {
    this.providers.email = provider;
    this.saveProviders();
  }

  setSMSProvider(provider: SMSProvider): void {
    this.providers.sms = provider;
    this.saveProviders();
  }

  setPushProvider(provider: PushProvider): void {
    this.providers.push = provider;
    this.saveProviders();
  }

  setSlackProvider(provider: SlackProvider): void {
    this.providers.slack = provider;
    this.saveProviders();
  }

  setTeamsProvider(provider: TeamsProvider): void {
    this.providers.teams = provider;
    this.saveProviders();
  }

  /**
   * Gestione Template
   */
  createTemplate(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): NotificationTemplate {
    const newTemplate: NotificationTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.templates.push(newTemplate);
    this.saveTemplates();
    return newTemplate;
  }

  getTemplates(): NotificationTemplate[] {
    return this.templates;
  }

  updateTemplate(id: string, updates: Partial<NotificationTemplate>): NotificationTemplate | null {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.templates[index] = {
      ...this.templates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveTemplates();
    return this.templates[index];
  }

  deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return false;

    this.templates.splice(index, 1);
    this.saveTemplates();
    return true;
  }

  /**
   * Gestione Recipients
   */
  createRecipient(recipient: Omit<NotificationRecipient, 'id'>): NotificationRecipient {
    const newRecipient: NotificationRecipient = {
      ...recipient,
      id: this.generateId()
    };

    this.recipients.push(newRecipient);
    this.saveRecipients();
    return newRecipient;
  }

  getRecipients(): NotificationRecipient[] {
    return this.recipients;
  }

  updateRecipient(id: string, updates: Partial<NotificationRecipient>): NotificationRecipient | null {
    const index = this.recipients.findIndex(r => r.id === id);
    if (index === -1) return null;

    this.recipients[index] = {
      ...this.recipients[index],
      ...updates
    };

    this.saveRecipients();
    return this.recipients[index];
  }

  /**
   * Gestione Rules
   */
  createRule(rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>): NotificationRule {
    const newRule: NotificationRule = {
      ...rule,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.rules.push(newRule);
    this.saveRules();
    return newRule;
  }

  getRules(): NotificationRule[] {
    return this.rules;
  }

  updateRule(id: string, updates: Partial<NotificationRule>): NotificationRule | null {
    const index = this.rules.findIndex(r => r.id === id);
    if (index === -1) return null;

    this.rules[index] = {
      ...this.rules[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveRules();
    return this.rules[index];
  }

  deleteRule(id: string): boolean {
    const index = this.rules.findIndex(r => r.id === id);
    if (index === -1) return false;

    this.rules.splice(index, 1);
    this.saveRules();
    return true;
  }

  /**
   * Invio Notifiche
   */
  async sendNotification(params: {
    channels: NotificationChannel[];
    recipients: string[];
    subject?: string;
    message: string;
    priority?: NotificationPriority;
    templateId?: string;
    variables?: Record<string, any>;
    entityType?: string;
    entityId?: string;
    schedule?: Date;
  }): Promise<NotificationMessage[]> {
    const messages: NotificationMessage[] = [];

    for (const channel of params.channels) {
      const message: NotificationMessage = {
        id: this.generateId(),
        templateId: params.templateId,
        channel,
        recipients: params.recipients,
        subject: params.subject,
        body: params.message,
        priority: params.priority || 'normal',
        status: 'pending',
        metadata: {
          entityType: params.entityType,
          entityId: params.entityId,
          variables: params.variables
        },
        scheduledFor: params.schedule?.toISOString(),
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date().toISOString()
      };

      // Se è un template, processa le variabili
      if (params.templateId) {
        const template = this.templates.find(t => t.id === params.templateId);
        if (template) {
          message.subject = this.processTemplate(template.subject || '', params.variables || {});
          message.body = this.processTemplate(template.body, params.variables || {});
        }
      }

      this.messages.push(message);
      messages.push(message);

      // Se non è schedulato, prova a inviare subito
      if (!params.schedule) {
        await this.processMessage(message);
      }
    }

    this.saveMessages();
    return messages;
  }

  /**
   * Trigger automatico da eventi
   */
  async triggerNotifications(eventType: string, entityData: any): Promise<NotificationMessage[]> {
    const applicableRules = this.rules.filter(rule => 
      rule.enabled && 
      rule.triggers.events.includes(eventType) &&
      this.evaluateConditions(rule.triggers.conditions || [], entityData)
    );

    const allMessages: NotificationMessage[] = [];

    for (const rule of applicableRules) {
      const recipientIds = await this.resolveRecipients(rule.recipients);
      
      const messages = await this.sendNotification({
        channels: rule.channels,
        recipients: recipientIds,
        subject: rule.customMessage?.subject,
        message: rule.customMessage?.body || '',
        priority: rule.priority,
        templateId: rule.templateId,
        variables: entityData,
        entityType: entityData.type,
        entityId: entityData.id,
        schedule: rule.scheduling?.delay ? new Date(Date.now() + rule.scheduling.delay * 60000) : undefined
      });

      allMessages.push(...messages);
    }

    return allMessages;
  }

  /**
   * Processamento della coda messaggi
   */
  private async processMessage(message: NotificationMessage): Promise<void> {
    try {
      message.status = 'pending';

      // Verifica se è il momento giusto per inviare
      if (message.scheduledFor && new Date(message.scheduledFor) > new Date()) {
        return; // Non ancora il momento
      }

      let result: {success: boolean, messageId?: string, error?: string} = {success: false};

      switch (message.channel) {
        case 'email':
          result = await this.sendEmail(message);
          break;
        
        case 'sms':
          result = await this.sendSMS(message);
          break;
        
        case 'push':
          result = await this.sendPush(message);
          break;
        
        case 'slack':
          result = await this.sendSlack(message);
          break;
        
        case 'teams':
          result = await this.sendTeams(message);
          break;
        
        case 'browser':
          result = await this.sendBrowser(message);
          break;
        
        case 'webhook':
          result = await this.sendWebhook(message);
          break;
      }

      if (result.success) {
        message.status = 'sent';
        message.sentAt = new Date().toISOString();
        
        // Per alcuni canali, assumiamo consegna immediata
        if (['browser', 'webhook'].includes(message.channel)) {
          message.status = 'delivered';
          message.deliveredAt = message.sentAt;
        }
      } else {
        message.status = 'failed';
        message.error = result.error;
        
        // Retry logic
        if (message.retryCount < message.maxRetries) {
          message.retryCount++;
          message.status = 'pending';
          // Riprova tra 5 minuti * numero di tentativi
          setTimeout(() => this.processMessage(message), 5 * 60 * 1000 * message.retryCount);
        }
      }

    } catch (error) {
      message.status = 'failed';
      message.error = error instanceof Error ? error.message : String(error);
    }

    this.saveMessages();
  }

  /**
   * Implementazioni specifiche per canale
   */
  private async sendEmail(message: NotificationMessage): Promise<{success: boolean, messageId?: string, error?: string}> {
    if (!this.providers.email) {
      return {success: false, error: 'Email provider not configured'};
    }

    const recipients = await this.getRecipientEmails(message.recipients);
    if (recipients.length === 0) {
      return {success: false, error: 'No valid email recipients'};
    }

    return this.providers.email.send(recipients, message.subject || '', message.body, true);
  }

  private async sendSMS(message: NotificationMessage): Promise<{success: boolean, messageId?: string, error?: string}> {
    if (!this.providers.sms) {
      return {success: false, error: 'SMS provider not configured'};
    }

    const recipients = await this.getRecipientPhones(message.recipients);
    if (recipients.length === 0) {
      return {success: false, error: 'No valid phone recipients'};
    }

    return this.providers.sms.send(recipients, message.body);
  }

  private async sendPush(message: NotificationMessage): Promise<{success: boolean, messageId?: string, error?: string}> {
    if (!this.providers.push) {
      return {success: false, error: 'Push provider not configured'};
    }

    const tokens = await this.getRecipientPushTokens(message.recipients);
    if (tokens.length === 0) {
      return {success: false, error: 'No valid push tokens'};
    }

    return this.providers.push.send(tokens, message.subject || 'Notifica', message.body);
  }

  private async sendSlack(message: NotificationMessage): Promise<{success: boolean, messageId?: string, error?: string}> {
    if (!this.providers.slack) {
      return {success: false, error: 'Slack provider not configured'};
    }

    // Per ora inviamo al canale generale, in futuro si può personalizzare
    return this.providers.slack.send('#general', message.body);
  }

  private async sendTeams(message: NotificationMessage): Promise<{success: boolean, messageId?: string, error?: string}> {
    if (!this.providers.teams) {
      return {success: false, error: 'Teams provider not configured'};
    }

    return this.providers.teams.send(message.body);
  }

  private async sendBrowser(message: NotificationMessage): Promise<{success: boolean, messageId?: string, error?: string}> {
    // Browser notifications via Notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(message.subject || 'Notifica', {
        body: message.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
      return {success: true};
    }

    return {success: false, error: 'Browser notifications not supported or not permitted'};
  }

  private async sendWebhook(message: NotificationMessage): Promise<{success: boolean, messageId?: string, error?: string}> {
    // Implementazione webhook generica
    try {
      const webhook = message.metadata.variables?.webhookUrl;
      if (!webhook) {
        return {success: false, error: 'Webhook URL not provided'};
      }

      const response = await fetch(webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: message.subject,
          message: message.body,
          priority: message.priority,
          metadata: message.metadata
        })
      });

      return {success: response.ok, messageId: response.headers.get('x-message-id') || undefined};
    } catch (error) {
      return {success: false, error: error instanceof Error ? error.message : 'Webhook request failed'};
    }
  }

  /**
   * Utility methods
   */
  private async resolveRecipients(recipientSpec: NotificationRule['recipients']): Promise<string[]> {
    const ids: string[] = [];
    
    if (recipientSpec.users) {
      ids.push(...recipientSpec.users);
    }
    
    if (recipientSpec.groups) {
      // Risolvi i gruppi in utenti individuali
      for (const groupId of recipientSpec.groups) {
        const groupMembers = await this.getGroupMembers(groupId);
        ids.push(...groupMembers);
      }
    }
    
    if (recipientSpec.roles) {
      // Risolvi i ruoli in utenti individuali
      for (const role of recipientSpec.roles) {
        const roleMembers = await this.getRoleMembers(role);
        ids.push(...roleMembers);
      }
    }
    
    return [...new Set(ids)]; // Rimuovi duplicati
  }

  private async getRecipientEmails(recipientIds: string[]): Promise<string[]> {
    const emails: string[] = [];
    for (const id of recipientIds) {
      const recipient = this.recipients.find(r => r.id === id);
      if (recipient?.email && recipient.preferences.channels.includes('email')) {
        emails.push(recipient.email);
      }
    }
    return emails;
  }

  private async getRecipientPhones(recipientIds: string[]): Promise<string[]> {
    const phones: string[] = [];
    for (const id of recipientIds) {
      const recipient = this.recipients.find(r => r.id === id);
      if (recipient?.phone && recipient.preferences.channels.includes('sms')) {
        phones.push(recipient.phone);
      }
    }
    return phones;
  }

  private async getRecipientPushTokens(recipientIds: string[]): Promise<string[]> {
    const tokens: string[] = [];
    for (const id of recipientIds) {
      const recipient = this.recipients.find(r => r.id === id);
      if (recipient?.pushTokens && recipient.preferences.channels.includes('push')) {
        tokens.push(...recipient.pushTokens);
      }
    }
    return tokens;
  }

  private async getGroupMembers(groupId: string): Promise<string[]> {
    // Placeholder - implementazione dipende dal sistema di gestione gruppi
    return [];
  }

  private async getRoleMembers(role: string): Promise<string[]> {
    // Placeholder - implementazione dipende dal sistema di gestione ruoli
    return [];
  }

  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    
    // Sostituisci variabili nel formato {{variable.path}}
    const variableRegex = /\{\{([^}]+)\}\}/g;
    processed = processed.replace(variableRegex, (match, path) => {
      const value = this.getNestedValue(variables, path.trim());
      return value !== undefined ? String(value) : match;
    });
    
    return processed;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private evaluateConditions(conditions: any[], data: any): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getNestedValue(data, condition.field);
      const conditionValue = condition.value;

      switch (condition.operator) {
        case 'equals': return fieldValue === conditionValue;
        case 'not_equals': return fieldValue !== conditionValue;
        case 'greater_than': return fieldValue > conditionValue;
        case 'less_than': return fieldValue < conditionValue;
        case 'contains': return String(fieldValue).includes(String(conditionValue));
        default: return false;
      }
    });
  }

  private startProcessingQueue(): void {
    // Processa la coda ogni 30 secondi
    setInterval(() => {
      const pendingMessages = this.messages.filter(m => 
        m.status === 'pending' && 
        (!m.scheduledFor || new Date(m.scheduledFor) <= new Date())
      );

      pendingMessages.forEach(message => {
        this.processMessage(message);
      });
    }, 30000);
  }

  /**
   * Statistiche
   */
  getStats(): NotificationStats {
    const totalSent = this.messages.filter(m => m.status === 'sent' || m.status === 'delivered').length;
    const totalDelivered = this.messages.filter(m => m.status === 'delivered').length;
    const totalFailed = this.messages.filter(m => m.status === 'failed').length;

    const channelStats: Record<NotificationChannel, any> = {} as any;
    
    ['email', 'sms', 'push', 'slack', 'teams', 'webhook', 'browser'].forEach(channel => {
      const channelMessages = this.messages.filter(m => m.channel === channel);
      const sent = channelMessages.filter(m => m.status === 'sent' || m.status === 'delivered').length;
      const delivered = channelMessages.filter(m => m.status === 'delivered').length;
      const failed = channelMessages.filter(m => m.status === 'failed').length;

      const deliveryTimes = channelMessages
        .filter(m => m.sentAt && m.deliveredAt)
        .map(m => new Date(m.deliveredAt!).getTime() - new Date(m.sentAt!).getTime());
      
      channelStats[channel as NotificationChannel] = {
        sent,
        delivered,
        failed,
        averageDeliveryTime: deliveryTimes.length > 0 ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length : 0
      };
    });

    const failureReasons: Record<string, number> = {};
    this.messages.filter(m => m.status === 'failed').forEach(m => {
      const reason = m.error || 'Unknown error';
      failureReasons[reason] = (failureReasons[reason] || 0) + 1;
    });

    return {
      totalSent,
      totalDelivered,
      totalFailed,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      channelStats,
      recentMessages: this.messages.slice(-50).reverse(),
      failureReasons
    };
  }

  /**
   * API Pubbliche
   */
  getMessages(limit: number = 100): NotificationMessage[] {
    return this.messages.slice(-limit).reverse();
  }

  getMessage(id: string): NotificationMessage | undefined {
    return this.messages.find(m => m.id === id);
  }

  markAsRead(messageId: string): boolean {
    const message = this.messages.find(m => m.id === messageId);
    if (message && message.status === 'delivered') {
      message.status = 'read';
      message.readAt = new Date().toISOString();
      this.saveMessages();
      return true;
    }
    return false;
  }

  /**
   * Data Persistence
   */
  private loadData(): void {
    if (typeof window !== 'undefined' && localStorage) {
      this.templates = JSON.parse(localStorage.getItem('notification_templates') || '[]');
      this.recipients = JSON.parse(localStorage.getItem('notification_recipients') || '[]');
      this.rules = JSON.parse(localStorage.getItem('notification_rules') || '[]');
      this.messages = JSON.parse(localStorage.getItem('notification_messages') || '[]');
      
      const savedProviders = localStorage.getItem('notification_providers');
      if (savedProviders) {
        this.providers = JSON.parse(savedProviders);
      }
    }
  }

  private saveTemplates(): void {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('notification_templates', JSON.stringify(this.templates));
    }
  }

  private saveRecipients(): void {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('notification_recipients', JSON.stringify(this.recipients));
    }
  }

  private saveRules(): void {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('notification_rules', JSON.stringify(this.rules));
    }
  }

  private saveMessages(): void {
    if (typeof window !== 'undefined' && localStorage) {
      // Salva solo gli ultimi 1000 messaggi per evitare localStorage overflow
      const messagesToSave = this.messages.slice(-1000);
      localStorage.setItem('notification_messages', JSON.stringify(messagesToSave));
    }
  }

  private saveProviders(): void {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('notification_providers', JSON.stringify(this.providers));
    }
  }

  private initializeDefaults(): void {
    // Crea template di default se non esistono
    if (this.templates.length === 0) {
      this.createTemplate({
        name: 'Work Order Creato',
        description: 'Notifica quando viene creato un nuovo work order',
        channel: 'email',
        subject: 'Nuovo Work Order: {{workOrder.title}}',
        body: `
          <h2>Nuovo Work Order Creato</h2>
          <p><strong>Titolo:</strong> {{workOrder.title}}</p>
          <p><strong>Priorità:</strong> {{workOrder.priority}}</p>
          <p><strong>Assegnato a:</strong> {{workOrder.assignedTo}}</p>
          <p><strong>Data scadenza:</strong> {{workOrder.dueDate}}</p>
          <p><strong>Descrizione:</strong> {{workOrder.description}}</p>
        `,
        variables: ['workOrder.title', 'workOrder.priority', 'workOrder.assignedTo', 'workOrder.dueDate', 'workOrder.description'],
        isHtml: true
      });

      this.createTemplate({
        name: 'Urgente SMS',
        description: 'SMS per notifiche urgenti',
        channel: 'sms',
        body: 'URGENTE: {{workOrder.title}} - Priorità {{workOrder.priority}}. Assegnato a {{workOrder.assignedTo}}',
        variables: ['workOrder.title', 'workOrder.priority', 'workOrder.assignedTo'],
        isHtml: false
      });
    }

    // Crea recipient di default
    if (this.recipients.length === 0) {
      this.createRecipient({
        type: 'user',
        name: 'Admin',
        email: 'admin@company.com',
        phone: '+39 123 456 7890',
        preferences: {
          channels: ['email', 'sms', 'push', 'browser'],
          frequency: {
            maxPerHour: 10,
            maxPerDay: 50
          }
        }
      });
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

// Istanza singleton del sistema notifiche - inizializzata lazy per compatibilità SSR
let notificationSystemInstance: NotificationSystem | null = null;

export function getNotificationSystem(): NotificationSystem {
  if (!notificationSystemInstance && typeof window !== 'undefined') {
    notificationSystemInstance = new NotificationSystem();
  }
  return notificationSystemInstance!;
}