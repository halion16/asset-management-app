'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUsers, saveUser, deleteUser, initializeStorage } from "@/lib/storage";
import { User } from "@/data/mockData";
import { 
  Plus,
  Search,
  Users,
  MoreHorizontal,
  ChevronDown,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Edit,
  Trash2
} from "lucide-react";

const roleLabels = {
  admin: 'Amministratore',
  manager: 'Manager', 
  technician: 'Tecnico',
  operator: 'Operatore',
  supplier: 'Fornitore'
};

const statusLabels = {
  active: 'Attivo',
  inactive: 'Inattivo', 
  suspended: 'Sospeso'
};

const statusColors = {
  active: 'text-green-600 bg-green-50 border-green-200',
  inactive: 'text-gray-600 bg-gray-50 border-gray-200',
  suspended: 'text-red-600 bg-red-50 border-red-200'
};

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'users' | 'teams'>('users');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'technician' as const,
    department: '',
    phone: '',
    location: 'Franciocorta'
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    initializeStorage();
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadUsers = () => {
    const usersData = getUsers();
    setUsers(usersData);
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!newUser.name.trim()) {
      newErrors.name = 'Il nome è obbligatorio';
    } else if (newUser.name.trim().length < 2) {
      newErrors.name = 'Il nome deve essere di almeno 2 caratteri';
    }
    
    if (!newUser.email.trim()) {
      newErrors.email = 'L\'email è obbligatoria';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      newErrors.email = 'Formato email non valido';
    } else if (users.some(u => u.email === newUser.email)) {
      newErrors.email = 'Questa email è già utilizzata';
    }
    
    if (!newUser.department?.trim()) {
      newErrors.department = 'Il reparto è obbligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: string, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInviteUser = () => {
    if (!validateForm()) {
      return;
    }

    if (editingUser) {
      // Update existing user
      const updatedUser: User = {
        ...editingUser,
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
        department: newUser.department?.trim(),
        phone: newUser.phone?.trim() || undefined,
        location: newUser.location,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=3b82f6&color=fff`,
      };
      saveUser(updatedUser);
      setShowEditModal(false);
      setEditingUser(null);
    } else {
      // Create new user
      const user: User = {
        id: Date.now().toString(),
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
        department: newUser.department?.trim(),
        phone: newUser.phone?.trim() || undefined,
        location: newUser.location,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=3b82f6&color=fff`,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        permissions: []
      };
      saveUser(user);
      setShowInviteModal(false);
    }
    
    loadUsers();
    setNewUser({
      name: '',
      email: '',
      role: 'technician',
      department: '',
      phone: '',
      location: 'Franciocorta'
    });
    setErrors({});
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo utente?')) {
      deleteUser(id);
      loadUsers();
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || '',
      phone: user.phone || '',
      location: user.location || 'Franciocorta'
    });
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const getLastVisit = (user: User) => {
    if (user.status === 'active') return 'Oggi';
    if (user.status === 'inactive') return 'Non ancora iscritto';
    return formatDate(user.lastLogin);
  };

  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalUsers = users.length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Team / Utenti</h1>
            <p className="text-gray-600">Gestisci utenti e permessi del team</p>
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowInviteModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Invita gli utenti
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mt-6">
          <button
            onClick={() => setSelectedTab('users')}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              selectedTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Utenti
          </button>
          <button
            onClick={() => setSelectedTab('teams')}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              selectedTab === 'teams'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Team
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Ricerca Utenti"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Nome e cognome
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Ruolo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Ultima visita
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-gray-300"
                        />
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{roleLabels[user.role]}</div>
                      {user.status !== 'active' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Solo per il richiedente
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.department && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.department}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{getLastVisit(user)}</div>
                      {user.status === 'inactive' && (
                        <div className="text-xs text-blue-600">
                          <button className="hover:underline">Invia nuovamente</button>
                          <span className="mx-1">|</span>
                          <button className="hover:underline">Invito</button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                      
                      {activeDropdown === user.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="h-3 w-3" />
                            Modifica
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteUser(user.id);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                            Elimina
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              1 – {filteredUsers.length} di {totalUsers}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Invita Nuovo Utente</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Mario Rossi"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="mario.rossi@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ruolo
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="technician">Tecnico</option>
                  <option value="operator">Operatore</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Amministratore</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reparto *
                </label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => handleFieldChange('department', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.department ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Manutenzione"
                />
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+39 123 456 7890"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicazione
                </label>
                <select
                  value={newUser.location}
                  onChange={(e) => setNewUser(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Franciocorta">Franciocorta</option>
                  <option value="Milano">Milano</option>
                  <option value="Roma">Roma</option>
                  <option value="Torino">Torino</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleInviteUser}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Invia Invito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Modifica Utente</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  setNewUser({
                    name: '',
                    email: '',
                    role: 'technician',
                    department: '',
                    phone: '',
                    location: 'Franciocorta'
                  });
                  setErrors({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Mario Rossi"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="mario.rossi@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ruolo
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="technician">Tecnico</option>
                  <option value="operator">Operatore</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Amministratore</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reparto *
                </label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => handleFieldChange('department', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.department ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Manutenzione"
                />
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+39 123 456 7890"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicazione
                </label>
                <select
                  value={newUser.location}
                  onChange={(e) => setNewUser(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Franciocorta">Franciocorta</option>
                  <option value="Milano">Milano</option>
                  <option value="Roma">Roma</option>
                  <option value="Torino">Torino</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  setNewUser({
                    name: '',
                    email: '',
                    role: 'technician',
                    department: '',
                    phone: '',
                    location: 'Franciocorta'
                  });
                  setErrors({});
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleInviteUser}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Aggiorna Utente
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
}