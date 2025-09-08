'use client';

import { useState } from 'react';
import { X, Building2, Users, Zap, Download, Upload, Clock, Globe, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'generale' | 'funzionalita' | 'team';
}

export default function SettingsModal({ isOpen, onClose, initialTab = 'generale' }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [organizationData, setOrganizationData] = useState({
    name: 'Bottega del Sarto',
    description: 'Azienda | 2 membri',
    plan: 'Piano Base',
    currency: 'EUR (Euro)',
    dateFormat: 'GG/MM/AAAA - 23:59',
    timezone: 'Europe/Rome - +01:00'
  });

  // Mock features data
  const [features, setFeatures] = useState([
    { id: 'work_orders', name: 'Ordini di lavoro', description: 'Personalizza le impostazioni relative alle richieste di lavoro come il Monitoraggio di tempo e costi, Azion azioni centralizzate delle Procedure e altro ancora.', enabled: true, canToggle: false },
    { id: 'requests', name: 'Richieste', description: 'Personalizza le impostazioni relative alle richieste come il routing e i campi obbligatori.', enabled: true, canToggle: false },
    { id: 'assets', name: 'Attrezzature', description: 'Personalizza le impostazioni relative alle Attrezzature, come le Generazione di codici a barre e i Modelli per le richieste delle Attrezzature.', enabled: true, canToggle: false },
    { id: 'locations', name: 'Ubicazioni', description: 'Personalizza le impostazioni e crea una gerarchia di interno delle le tue Organizzazione.', enabled: true, canToggle: false },
    { id: 'reports', name: 'Reportistica', description: 'Personalizza gli aspetti delle funzione Reportistica.', enabled: true, canToggle: false },
    { id: 'request_portal', name: 'Portali Richieste', description: 'Personalizza Portali Richieste, definisci oggetti predetti e gestisci utenti richiedenti.', enabled: true, canToggle: true },
    { id: 'purchase_orders', name: 'Ordini di acquisto', description: 'Approva e crea Ordini di acquisto in gestisci dal Maintainx.', enabled: true, canToggle: true },
    { id: 'parts', name: 'Parti', description: 'Tieni traccia delle Parti e dei dettagli come l\'Uso.', enabled: false, canToggle: true },
    { id: 'vendors', name: 'Contatori', description: 'Importa ed esporta Contatori e tieni traccia delle loro Utilizze.', enabled: true, canToggle: true },
    { id: 'suppliers', name: 'Fornitori', description: 'Crea, gestisci e modifica i Contatori della tua Organizzazione.', enabled: true, canToggle: true },
    { id: 'workstation', name: 'Workstation Mode', description: 'Consenti ai tuoi compagni di lavori di accedere a più stazioni in un vero dispositivo.', enabled: false, canToggle: true },
    { id: 'work_order_model', name: 'Modello Ordine di lavoro', description: 'Crea Modelli di Ordine di lavoro per personalizzazioni i tuoi Ordini di lavoro.', enabled: true, canToggle: true },
    { id: 'automations', name: 'Automazioni', description: 'Utilizza le interfacce per attivare le azioni e ottimizzare le operazioni di manutenzione.', enabled: true, canToggle: true }
  ]);

  // Mock team data
  const [teamData, setTeamData] = useState({
    workOrderVisibility: 'full',
    hourlyRate: '',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    workingHoursPerDay: '8',
    plannableUsers: 'full'
  });

  const [users] = useState([
    { 
      id: '1', 
      name: 'David Luchetta', 
      role: 'Amministratore', 
      visibility: 'full', 
      hourlyRate: '', 
      canViewRate: true, 
      plannable: true, 
      workingDays: 'Lun, Mar, Mer, Gio, Ven' 
    },
    { 
      id: '2', 
      name: 'Pinco Pallino', 
      role: 'Solo per il richiedente', 
      visibility: 'restricted', 
      hourlyRate: '', 
      canViewRate: false, 
      plannable: false, 
      workingDays: '' 
    }
  ]);

  if (!isOpen) return null;

  const handleFeatureToggle = (featureId: string) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId && feature.canToggle
        ? { ...feature, enabled: !feature.enabled }
        : feature
    ));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] max-w-[1400px] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Impostazioni dell'Organizzazione</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <nav className="p-4 space-y-1">
              <button
                onClick={() => setActiveTab('generale')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'generale'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Building2 className="h-4 w-4" />
                Generale
              </button>
              
              <button
                onClick={() => setActiveTab('funzionalita')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'funzionalita'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Zap className="h-4 w-4" />
                Funzionalità
              </button>
              
              <button
                onClick={() => setActiveTab('team')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'team'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Users className="h-4 w-4" />
                Gestisci colleghi del team
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Generale Tab */}
            {activeTab === 'generale' && (
              <div className="p-6 space-y-8">
                {/* Organization Profile */}
                <div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">X</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{organizationData.name}</h3>
                          <p className="text-sm text-gray-600">{organizationData.description}</p>
                          <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                            {organizationData.plan}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                        Modifica profilo
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferenze</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Valuta</label>
                        <div className="relative">
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>{organizationData.currency}</option>
                            <option>USD (Dollar)</option>
                            <option>GBP (Pound)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Formato della data</label>
                        <div className="relative">
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>{organizationData.dateFormat}</option>
                            <option>MM/DD/YYYY - 11:59 PM</option>
                            <option>DD-MM-YYYY - 23:59</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-span-1 lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fuso orario</label>
                        <div className="relative">
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>{organizationData.timezone}</option>
                            <option>America/New_York - -05:00</option>
                            <option>Asia/Tokyo - +09:00</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Data */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Esporta i dati</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Building2, label: 'Ordini di lavoro' },
                      { icon: Users, label: 'Attrezzature' },
                      { icon: Globe, label: 'Ubicazioni' },
                      { icon: Download, label: 'Ordini di acquisto' },
                      { icon: Upload, label: 'Fornitori' },
                      { icon: Users, label: 'Richieste' },
                      { icon: Clock, label: 'Monitoraggio di tempo e costi' }
                    ].map((item, index) => (
                      <Button key={index} variant="outline" className="h-20 flex flex-col items-center gap-2">
                        <item.icon className="h-6 w-6 text-blue-600" />
                        <span className="text-xs text-center">{item.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Import Data */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Importazione di dati <span className="text-sm font-normal bg-blue-100 text-blue-700 px-2 py-1 rounded">Beta</span></h3>
                  <Button variant="outline" className="h-20 w-40 flex flex-col items-center gap-2">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <span className="text-xs">Attrezzature</span>
                    <span className="text-xs text-gray-500">Più articoli a breve</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Funzionalità Tab */}
            {activeTab === 'funzionalita' && (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Caratteristiche</h3>
                  <p className="text-sm text-gray-600">
                    Alcune funzionalità o caratteristiche devono essere disponibili solo con piani MaintainX Premium. Puoi disabilitarne una per riassegnare per l'interfacce organizzazione. Puoi abilitare queste funzionalità quando hai bisogno.
                  </p>
                </div>

                <div className="space-y-4">
                  {features.map((feature) => (
                    <div key={feature.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{feature.name}</h4>
                            {feature.canToggle && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Modulo Commutabile {feature.enabled ? 'Attivo' : 'Spento'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                          {feature.canToggle && (
                            <button className="text-sm text-blue-600 hover:text-blue-700 mt-1">
                              Imposta le preferenze →
                            </button>
                          )}
                        </div>
                        
                        {feature.canToggle && (
                          <div className="ml-4">
                            <button
                              onClick={() => handleFeatureToggle(feature.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                feature.enabled ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  feature.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="p-6 space-y-8">
                {/* Header with search and invite */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">Gestisci i colleghi del team</h3>
                    <div className="flex items-center gap-6 mt-4">
                      <span className="text-sm text-blue-600 border-b-2 border-blue-600 pb-2">Utenti</span>
                      <span className="text-sm text-gray-600">Team</span>
                      <span className="text-sm text-gray-600">Ruoli e permessi</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ricerca Utenti"
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                      />
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      + Invita gli utenti
                    </Button>
                  </div>
                </div>

                {/* Pending invites */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">📧 1 invito in sospeso</span>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Invia nuovamente l'invito
                    </button>
                  </div>
                </div>

                {/* Organization defaults */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Impostazioni predefinite dell'organizzazione</h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Work order visibility */}
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">VISIBILITÀ DEGLI ORDINI DI LAVORO *</h5>
                      <p className="text-sm text-gray-600 mb-3">Gli amministratori saranno comunque in grado di vedere tutto.</p>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="full">Piena visibilità</option>
                        <option value="limited">Visibilità limitata</option>
                      </select>
                    </div>

                    {/* Hourly rate */}
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">TARIFFA ORARIA</h5>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">€</span>
                        <input
                          type="text"
                          placeholder="Imposta tariffa"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Rate visibility */}
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">VISIBILITÀ DELLA TARIFFA ORARIA</h5>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Visualizza e modifica
                      </button>
                    </div>
                  </div>

                  {/* Planning settings */}
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Working days */}
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">GIORNI LAVORATIVI</h5>
                      <p className="text-sm text-gray-600 mb-3">Le impostazioni saranno visibili nella visualizzazione carico di lavoro.</p>
                      <div className="text-sm text-gray-900">Lun, Mar, Mer, Gio, Ven</div>
                    </div>

                    {/* Hours per day */}
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">ORE PER GIORNO LAVORATIVO</h5>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value="8"
                          className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">h</span>
                        <span className="ml-4 text-sm text-gray-600">0</span>
                        <span className="ml-2 text-sm text-gray-600">min.</span>
                      </div>
                    </div>

                    {/* Plannable users */}
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">UTENTI PIANIFICABILI</h5>
                      <div className="text-sm text-gray-900">Full users</div>
                    </div>
                  </div>
                </div>

                {/* Users table */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Impostazioni utente</h4>
                  <p className="text-sm text-gray-600 mb-4">Utilizza la tabella seguente per personalizzare le impostazioni per utenti specifici.</p>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NOME</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUOLO</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">VISIBILITÀ UTENTE FULL</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TARIFFA ORARIA</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">VISIBILITÀ DELLA TARIFFA ORARIA</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UTENTI PIANIFICABILI</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GIORNI LA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-700">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900">{user.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">{user.role}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {user.visibility === 'full' ? 'Piena visibilità' : '–'}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {user.hourlyRate ? `€ ${user.hourlyRate}` : '€ Imposta tarif'}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {user.canViewRate ? 'Gestisci' : '–'}
                            </td>
                            <td className="px-4 py-4">
                              <button
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  user.plannable ? 'bg-green-600' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    user.plannable ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              {user.plannable ? (
                                <span className="text-xs text-gray-500 block mt-1">Non programmato</span>
                              ) : null}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {user.workingDays || '–'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Salva modifiche
          </Button>
        </div>
      </div>
    </div>
  );
}