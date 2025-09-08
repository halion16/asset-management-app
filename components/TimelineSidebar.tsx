'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WorkOrder, Comment } from '@/data/mockData';
import { 
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
  FileText,
  Send
} from 'lucide-react';

interface TimelineSidebarProps {
  workOrder: WorkOrder | null;
  onAddComment: (commentText: string) => void;
}

export default function TimelineSidebar({ workOrder, onAddComment }: TimelineSidebarProps) {
  const [newComment, setNewComment] = useState('');

  if (!workOrder) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Seleziona un ordine di lavoro per visualizzare la cronologia</p>
        </div>
      </div>
    );
  }

  // Debug log
  console.log('🕐 TimelineSidebar render:', {
    workOrderId: workOrder?.id,
    commentsCount: workOrder?.comments?.length || 0,
    comments: workOrder?.comments
  });

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
            case 'open': return <Unlock className="h-3 w-3 text-blue-600" />;
            case 'on_hold': return <Pause className="h-3 w-3 text-orange-600" />;
            case 'in_progress': return <Play className="h-3 w-3 text-purple-600" />;
            case 'completed': return <CheckCircle className="h-3 w-3 text-green-600" />;
            default: return <Activity className="h-3 w-3 text-gray-600" />;
          }
        }
        return <Activity className="h-3 w-3 text-gray-600" />;
      case 'comment':
        return <MessageCircle className="h-3 w-3 text-blue-600" />;
      case 'created':
        return <FileText className="h-3 w-3 text-green-600" />;
      case 'assigned':
        return <User className="h-3 w-3 text-indigo-600" />;
      case 'due_date_changed':
        return <Calendar className="h-3 w-3 text-orange-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
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
      return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Cronologia</h3>
        </div>
        <p className="text-xs text-gray-600 truncate">{workOrder.title}</p>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Add Comment Section */}
          <div className="mb-4">
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3">
              <div className="flex gap-2">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    DL
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Aggiungi commento..."
                    className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      size="sm"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Invia
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Events */}
          {timelineEvents.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium">Nessun evento</p>
              <p className="text-gray-400 text-xs">I commenti appariranno qui</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
              
              {timelineEvents.map((event, index) => (
                <div key={event.id} className="relative flex gap-3 pb-4">
                  {/* Timeline icon */}
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {event.userAvatar || 'DL'}
                      </div>
                    </div>
                    {/* Event type indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                      {getEventIcon(event.eventType, event.statusChange)}
                    </div>
                  </div>

                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div className={`p-2 rounded border-l-2 ${getEventBgColor(event.eventType, event.statusChange)}`}>
                      {/* Event header */}
                      <div className="mb-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 text-xs">{event.userName}</h4>
                          <p className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</p>
                        </div>
                        {event.eventType === 'status_change' && event.statusChange && (
                          <div className="flex items-center gap-1 text-xs mt-1">
                            <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              {getStatusLabel(event.statusChange.from)}
                            </span>
                            <span className="text-gray-400 text-xs">→</span>
                            <span className="px-1 py-0.5 bg-blue-100 text-blue-600 rounded font-medium text-xs">
                              {getStatusLabel(event.statusChange.to)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Event content */}
                      <div className="text-xs text-gray-700">
                        {event.eventType === 'status_change' && event.statusChange ? (
                          <p>
                            Cambio di stato: da "{getStatusLabel(event.statusChange.from)}" a "{getStatusLabel(event.statusChange.to)}"
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
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          {timelineEvents.length} {timelineEvents.length === 1 ? 'evento' : 'eventi'}
        </div>
      </div>
    </div>
  );
}