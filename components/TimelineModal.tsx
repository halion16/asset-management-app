'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WorkOrder, Comment } from '@/data/mockData';
import { 
  X, 
  Clock, 
  MessageCircle, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Play, 
  Pause,
  User,
  Calendar,
  FileText
} from 'lucide-react';

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  onAddComment: (commentText: string) => void;
}

export default function TimelineModal({ isOpen, onClose, workOrder, onAddComment }: TimelineModalProps) {
  const [newComment, setNewComment] = useState('');

  if (!isOpen || !workOrder) return null;

  // Combine comments and status changes into a single timeline
  const timelineEvents = [
    ...(workOrder.comments || []).map(comment => ({
      ...comment,
      eventType: comment.type || 'comment' as const
    })),
    // Add other system events if needed
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getEventIcon = (eventType: string, statusChange?: { from: string; to: string }) => {
    switch (eventType) {
      case 'status_change':
        if (statusChange) {
          switch (statusChange.to) {
            case 'open': return <Unlock className="h-4 w-4 text-blue-600" />;
            case 'on_hold': return <Pause className="h-4 w-4 text-orange-600" />;
            case 'in_progress': return <Play className="h-4 w-4 text-purple-600" />;
            case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
            default: return <Activity className="h-4 w-4 text-gray-600" />;
          }
        }
        return <Activity className="h-4 w-4 text-gray-600" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-600" />;
      case 'created':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'assigned':
        return <User className="h-4 w-4 text-indigo-600" />;
      case 'due_date_changed':
        return <Calendar className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventBgColor = (eventType: string, statusChange?: { from: string; to: string }) => {
    switch (eventType) {
      case 'status_change':
        if (statusChange) {
          switch (statusChange.to) {
            case 'completed': return 'bg-green-50 border-l-green-400';
            case 'in_progress': return 'bg-purple-50 border-l-purple-400';
            case 'on_hold': return 'bg-orange-50 border-l-orange-400';
            case 'open': return 'bg-blue-50 border-l-blue-400';
            default: return 'bg-gray-50 border-l-gray-400';
          }
        }
        return 'bg-gray-50 border-l-gray-400';
      case 'comment':
        return 'bg-blue-50 border-l-blue-400';
      default:
        return 'bg-gray-50 border-l-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'open': 'Aperto',
      'on_hold': 'In attesa',
      'in_progress': 'In corso',
      'completed': 'Completato'
    };
    return labels[status] || status;
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('it-IT', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Cronologia & Commenti</h2>
              <p className="text-sm text-gray-600">{workOrder.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Add Comment Section */}
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    DL
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Aggiungi un nuovo commento alla cronologia..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      size="sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Aggiungi Commento
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Events */}
            {timelineEvents.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg font-medium">Nessun evento nella cronologia</p>
                <p className="text-gray-400 text-sm">I commenti e le modifiche di stato appariranno qui</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="relative flex gap-6 pb-6">
                    {/* Timeline icon */}
                    <div className="flex-shrink-0 relative z-10">
                      <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {event.userAvatar || 'DL'}
                        </div>
                      </div>
                      {/* Event type indicator */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                        {getEventIcon(event.eventType, event.statusChange)}
                      </div>
                    </div>

                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <div className={`p-4 rounded-lg border-l-4 ${getEventBgColor(event.eventType, event.statusChange)}`}>
                        {/* Event header */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{event.userName}</h4>
                            <p className="text-sm text-gray-500">{formatTimestamp(event.timestamp)}</p>
                          </div>
                          {event.eventType === 'status_change' && event.statusChange && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {getStatusLabel(event.statusChange.from)}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded font-medium">
                                {getStatusLabel(event.statusChange.to)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Event content */}
                        <div className="text-sm text-gray-700">
                          {event.eventType === 'status_change' && event.statusChange ? (
                            <p>
                              <strong>Cambio di stato:</strong> da "{getStatusLabel(event.statusChange.from)}" a "{getStatusLabel(event.statusChange.to)}"
                            </p>
                          ) : (
                            <p>{event.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {timelineEvents.length} {timelineEvents.length === 1 ? 'evento' : 'eventi'} nella cronologia
            </div>
            <Button variant="outline" onClick={onClose}>
              Chiudi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}