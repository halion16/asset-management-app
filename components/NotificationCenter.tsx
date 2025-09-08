'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAssets, getWorkOrders, initializeStorage } from "@/lib/storage";
import { Asset, WorkOrder } from "@/data/mockData";
import { 
  Bell,
  X,
  AlertTriangle,
  Clock,
  Wrench,
  CheckCircle2
} from "lucide-react";

interface Notification {
  id: string;
  type: 'maintenance_due' | 'work_order_overdue' | 'asset_down' | 'info';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  relatedId?: string;
  read: boolean;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isOpen) {
      initializeStorage();
      generateNotifications();
    }
  }, [isOpen]);

  const generateNotifications = () => {
    const assets = getAssets();
    const workOrders = getWorkOrders();
    const generatedNotifications: Notification[] = [];
    const now = new Date();

    // Check for maintenance due
    assets.forEach(asset => {
      if (asset.nextMaintenance) {
        const maintenanceDate = new Date(asset.nextMaintenance);
        const daysDiff = Math.ceil((maintenanceDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        if (daysDiff <= 7 && daysDiff >= 0) {
          generatedNotifications.push({
            id: `maintenance_${asset.id}`,
            type: 'maintenance_due',
            title: 'Manutenzione programmata',
            message: `${asset.name} richiede manutenzione ${daysDiff === 0 ? 'oggi' : `tra ${daysDiff} giorni`}`,
            priority: daysDiff <= 2 ? 'high' : 'medium',
            createdAt: new Date(),
            relatedId: asset.id,
            read: false
          });
        } else if (daysDiff < 0) {
          generatedNotifications.push({
            id: `maintenance_overdue_${asset.id}`,
            type: 'maintenance_due',
            title: 'Manutenzione in ritardo',
            message: `${asset.name} ha la manutenzione in ritardo di ${Math.abs(daysDiff)} giorni`,
            priority: 'critical',
            createdAt: new Date(),
            relatedId: asset.id,
            read: false
          });
        }
      }
    });

    // Check for overdue work orders
    workOrders.forEach(workOrder => {
      if (workOrder.status !== 'completed') {
        const dueDate = new Date(workOrder.dueDate);
        const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        if (daysDiff < 0) {
          generatedNotifications.push({
            id: `workorder_overdue_${workOrder.id}`,
            type: 'work_order_overdue',
            title: 'Work Order in ritardo',
            message: `"${workOrder.title}" è in ritardo di ${Math.abs(daysDiff)} giorni`,
            priority: workOrder.priority === 'critical' ? 'critical' : 'high',
            createdAt: new Date(),
            relatedId: workOrder.id,
            read: false
          });
        }
      }
    });

    // Check for assets down
    assets.forEach(asset => {
      if (asset.status === 'down') {
        generatedNotifications.push({
          id: `asset_down_${asset.id}`,
          type: 'asset_down',
          title: 'Asset non operativo',
          message: `${asset.name} è attualmente fermo`,
          priority: asset.priority === 'critical' ? 'critical' : 'high',
          createdAt: new Date(),
          relatedId: asset.id,
          read: false
        });
      }
    });

    // Sort by priority and date
    generatedNotifications.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    setNotifications(generatedNotifications);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const getNotificationIcon = (type: Notification['type'], priority: Notification['priority']) => {
    switch (type) {
      case 'maintenance_due':
        return <Wrench className={`h-4 w-4 ${priority === 'critical' ? 'text-red-600' : 'text-orange-600'}`} />;
      case 'work_order_overdue':
        return <Clock className="h-4 w-4 text-red-600" />;
      case 'asset_down':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-16">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold">Notifiche</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[60vh]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Tutto a posto!</h3>
              <p className="text-sm text-gray-600">Nessuna notifica al momento</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 mb-2 border-l-4 rounded-md cursor-pointer transition-colors ${
                    getPriorityColor(notification.priority)
                  } ${notification.read ? 'opacity-60' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type, notification.priority)}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {notification.createdAt.toLocaleString('it-IT')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Le notifiche vengono aggiornate automaticamente
          </p>
        </div>
      </Card>
    </div>
  );
}