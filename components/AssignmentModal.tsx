'use client';

import { useState, useEffect } from 'react';
import { X, User, Users, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User as UserType } from '@/data/mockData';
import { getUsers } from '@/lib/storage';

interface Team {
  id: string;
  name: string;
  description: string;
  members: number;
  color: string;
}

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAssignee?: string;
  onAssign: (type: 'user' | 'team', id: string, name: string) => void;
  title?: string;
}

// Mock teams data - in a real app this would come from API/storage
const mockTeams: Team[] = [
  {
    id: 'team_1',
    name: 'gruppo lavoro',
    description: 'Team di manutenzione generale',
    members: 5,
    color: 'bg-blue-100'
  },
  {
    id: 'team_2',
    name: 'Facilities Management',
    description: 'Team gestione impianti',
    members: 3,
    color: 'bg-green-100'
  },
  {
    id: 'team_3',
    name: 'IT Support',
    description: 'Team supporto tecnico IT',
    members: 4,
    color: 'bg-purple-100'
  },
  {
    id: 'team_4',
    name: 'Safety & Compliance',
    description: 'Team sicurezza e conformità',
    members: 2,
    color: 'bg-orange-100'
  }
];

export default function AssignmentModal({ 
  isOpen, 
  onClose, 
  currentAssignee,
  onAssign, 
  title = "Modifica assegnatari" 
}: AssignmentModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedType, setSelectedType] = useState<'user' | 'team' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Load users when modal opens
  useEffect(() => {
    if (isOpen) {
      const allUsers = getUsers();
      setUsers(allUsers);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeams = mockTeams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = () => {
    if (!selectedType || !selectedId) return;
    
    let name = '';
    if (selectedType === 'user') {
      const user = users.find(u => u.id === selectedId);
      name = user?.name || '';
    } else {
      const team = mockTeams.find(t => t.id === selectedId);
      name = team?.name || '';
    }
    
    onAssign(selectedType, selectedId, name);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Ricerca"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Team Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">TEAM</h3>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {filteredTeams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => {
                    setSelectedType('team');
                    setSelectedId(team.id);
                  }}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedType === 'team' && selectedId === team.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full ${team.color} flex items-center justify-center mr-3`}>
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{team.name}</div>
                    <div className="text-sm text-gray-500">{team.members} membri</div>
                  </div>
                  {selectedType === 'team' && selectedId === team.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Users Section */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">UTENTI</h3>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedType('user');
                    setSelectedId(user.id);
                  }}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedType === 'user' && selectedId === user.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-gray-600">
                      {user.avatar || user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.department}</div>
                  </div>
                  {user.status === 'active' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  )}
                  {selectedType === 'user' && selectedId === user.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Annulla
          </Button>
          <Button
            onClick={handleAssign}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={!selectedType || !selectedId}
          >
            Applica modifiche
          </Button>
        </div>
      </div>
    </div>
  );
}