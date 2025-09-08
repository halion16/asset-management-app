'use client'

import { useState, useEffect } from 'react'
import { Bell, Settings, Users, MessageSquare, Calendar, BarChart3, Plus, Edit, Trash2, CheckCircle, AlertTriangle, Clock, User, Mail, Smartphone, Slack, MessageCircle, Webhook, Monitor } from 'lucide-react'
import { getNotificationSystem, NotificationChannel, NotificationTemplate, NotificationRecipient, NotificationRule, NotificationMessage } from '@/lib/notification-system'

export default function NotificationManager() {
  const [activeTab, setActiveTab] = useState<'templates' | 'recipients' | 'rules' | 'queue' | 'stats'>('templates')
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([])
  const [rules, setRules] = useState<NotificationRule[]>([])
  const [queue, setQueue] = useState<NotificationMessage[]>([])
  const [stats, setStats] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showRecipientModal, setShowRecipientModal] = useState(false)
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [editingRecipient, setEditingRecipient] = useState<NotificationRecipient | null>(null)
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      setTemplates(getNotificationSystem().getTemplates())
      setRecipients(getNotificationSystem().getRecipients())
      setRules(getNotificationSystem().getRules())
      setQueue(getNotificationSystem().getQueuedMessages())
      setStats(getNotificationSystem().getStatistics())
    } catch (error) {
      console.error('Errore nel caricamento dati notifiche:', error)
    }
    setIsLoading(false)
  }

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'sms': return <Smartphone className="h-4 w-4" />
      case 'push': return <Bell className="h-4 w-4" />
      case 'slack': return <Slack className="h-4 w-4" />
      case 'teams': return <MessageCircle className="h-4 w-4" />
      case 'webhook': return <Webhook className="h-4 w-4" />
      case 'browser': return <Monitor className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getChannelColor = (channel: NotificationChannel) => {
    switch (channel) {
      case 'email': return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'sms': return 'bg-green-50 text-green-600 border-green-200'
      case 'push': return 'bg-purple-50 text-purple-600 border-purple-200'
      case 'slack': return 'bg-orange-50 text-orange-600 border-orange-200'
      case 'teams': return 'bg-indigo-50 text-indigo-600 border-indigo-200'
      case 'webhook': return 'bg-gray-50 text-gray-600 border-gray-200'
      case 'browser': return 'bg-yellow-50 text-yellow-600 border-yellow-200'
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('Confermi l\'eliminazione del template?')) {
      await getNotificationSystem().deleteTemplate(id)
      loadData()
    }
  }

  const handleDeleteRecipient = async (id: string) => {
    if (confirm('Confermi l\'eliminazione del destinatario?')) {
      await getNotificationSystem().deleteRecipient(id)
      loadData()
    }
  }

  const handleDeleteRule = async (id: string) => {
    if (confirm('Confermi l\'eliminazione della regola?')) {
      await getNotificationSystem().deleteRule(id)
      loadData()
    }
  }

  const tabs = [
    { key: 'templates', label: 'Templates', icon: MessageSquare },
    { key: 'recipients', label: 'Destinatari', icon: Users },
    { key: 'rules', label: 'Regole', icon: Settings },
    { key: 'queue', label: 'Coda', icon: Clock },
    { key: 'stats', label: 'Statistiche', icon: BarChart3 }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bell className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Gestione Notifiche</h2>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'templates' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Template Notifiche</h3>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nuovo Template</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {templates.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nessun template configurato</p>
                ) : (
                  templates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded-full text-xs border flex items-center space-x-1 ${getChannelColor(template.channel)}`}>
                            {getChannelIcon(template.channel)}
                            <span>{template.channel.toUpperCase()}</span>
                          </div>
                          <button
                            onClick={() => {
                              setEditingTemplate(template)
                              setShowTemplateModal(true)
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        <p><strong>Oggetto:</strong> {template.subject}</p>
                        <p><strong>Corpo:</strong> {template.body.substring(0, 100)}...</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'recipients' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Destinatari</h3>
                <button
                  onClick={() => setShowRecipientModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nuovo Destinatario</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {recipients.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nessun destinatario configurato</p>
                ) : (
                  recipients.map((recipient) => (
                    <div key={recipient.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <User className="h-8 w-8 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">{recipient.name}</h4>
                            <p className="text-sm text-gray-600">{recipient.email}</p>
                            {recipient.phone && <p className="text-sm text-gray-600">{recipient.phone}</p>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            {recipient.preferences.channels.map((channel) => (
                              <div key={channel} className={`px-2 py-1 rounded text-xs border flex items-center space-x-1 ${getChannelColor(channel)}`}>
                                {getChannelIcon(channel)}
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              setEditingRecipient(recipient)
                              setShowRecipientModal(true)
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecipient(recipient.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Regole Notifiche</h3>
                <button
                  onClick={() => setShowRuleModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nuova Regola</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {rules.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nessuna regola configurata</p>
                ) : (
                  rules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{rule.name}</h4>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${rule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {rule.active ? 'Attiva' : 'Inattiva'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingRule(rule)
                              setShowRuleModal(true)
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        <p><strong>Evento:</strong> {rule.trigger.event}</p>
                        <p><strong>Template:</strong> {templates.find(t => t.id === rule.templateId)?.name || 'N/A'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'queue' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Coda Messaggi</h3>
              
              <div className="space-y-4">
                {queue.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nessun messaggio in coda</p>
                ) : (
                  queue.map((message) => (
                    <div key={message.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{message.subject}</h4>
                          <p className="text-sm text-gray-600">{message.recipient}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded-full text-xs border flex items-center space-x-1 ${getChannelColor(message.channel)}`}>
                            {getChannelIcon(message.channel)}
                            <span>{message.channel.toUpperCase()}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            message.status === 'sent' ? 'bg-green-100 text-green-800' :
                            message.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {message.status === 'sent' ? 'Inviato' : 
                             message.status === 'failed' ? 'Fallito' : 'In Attesa'}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Programmato: {new Date(message.scheduledAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Statistiche</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Messaggi Inviati</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.sent || 0}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600">Messaggi Falliti</p>
                      <p className="text-2xl font-bold text-red-900">{stats.failed || 0}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600">In Attesa</p>
                      <p className="text-2xl font-bold text-yellow-900">{stats.pending || 0}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Statistiche per Canale</h4>
                <div className="space-y-2">
                  {Object.entries(stats.byChannel || {}).map(([channel, count]) => (
                    <div key={channel} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {getChannelIcon(channel as NotificationChannel)}
                        <span className="capitalize">{channel}</span>
                      </div>
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}