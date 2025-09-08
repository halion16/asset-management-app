'use client';

import { useState, useEffect } from "react";
import { Search, Bell, Plus, Menu, X, Settings, Users, Zap, CreditCard, UserPlus, Shield, Database, Lock, Download, Smartphone, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationCenter from "@/components/NotificationCenter";
import Sidebar from "@/components/Sidebar";
import SettingsModal from "@/components/SettingsModal";
import { getAssets, getWorkOrders, initializeStorage } from "@/lib/storage";

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsModalTab, setSettingsModalTab] = useState<'generale' | 'funzionalita' | 'team'>('generale');

  useEffect(() => {
    const calculateNotifications = () => {
      initializeStorage();
      const assets = getAssets();
      const workOrders = getWorkOrders();
      let count = 0;
      const now = new Date();

      // Count maintenance due
      assets.forEach(asset => {
        if (asset.nextMaintenance) {
          const maintenanceDate = new Date(asset.nextMaintenance);
          const daysDiff = Math.ceil((maintenanceDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
          if (daysDiff <= 7) count++;
        }
      });

      // Count overdue work orders
      workOrders.forEach(workOrder => {
        if (workOrder.status !== 'completed') {
          const dueDate = new Date(workOrder.dueDate);
          if (dueDate < now) count++;
        }
      });

      // Count assets down
      count += assets.filter(asset => asset.status === 'down').length;

      setNotificationCount(count);
    };

    calculateNotifications();
    // Recalculate every minute
    const interval = setInterval(calculateNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSettingsMenu) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSettingsMenu]);

  return (
    <>
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile menu button */}
      <button
        onClick={() => setShowMobileMenu(true)}
        className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Left side - Search */}
      <div className="flex items-center gap-4 flex-1 lg:max-w-md">
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Ricerca Ordini di lavoro"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button 
          className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          onClick={() => setShowNotifications(true)}
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* Settings Menu */}
        <div className="relative">
          <button 
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              setShowSettingsMenu(!showSettingsMenu);
            }}
          >
            <Settings className="h-5 w-5" />
          </button>

          {showSettingsMenu && (
            <div 
              className="absolute right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-2">
                {/* Organization Settings Section */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Impostazioni dell'Organizzazione</h3>
                </div>
                
                <button 
                  onClick={() => {
                    setSettingsModalTab('generale');
                    setShowSettingsModal(true);
                    setShowSettingsMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4 text-gray-400" />
                  <span>Generale</span>
                </button>
                
                <button 
                  onClick={() => {
                    setSettingsModalTab('funzionalita');
                    setShowSettingsModal(true);
                    setShowSettingsMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Zap className="h-4 w-4 text-gray-400" />
                  <span>Funzionalità</span>
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span>Abbonamento</span>
                </button>
                
                <button 
                  onClick={() => {
                    setSettingsModalTab('team');
                    setShowSettingsModal(true);
                    setShowSettingsMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>Gestisci i colleghi del team</span>
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <UserPlus className="h-4 w-4 text-gray-400" />
                  <span>Personalizzazioni</span>
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span>Integrazioni</span>
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Lock className="h-4 w-4 text-gray-400" />
                  <span>Dati e privacy</span>
                </button>

                {/* My Account Section */}
                <div className="px-4 py-2 border-b border-gray-100 mt-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Il Mio Account</h3>
                </div>
                
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <UserCheck className="h-4 w-4 text-gray-400" />
                  <span>Preferenze del profilo</span>
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Bell className="h-4 w-4 text-gray-400" />
                  <span>Impostazioni di notifica</span>
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Download className="h-4 w-4 text-gray-400" />
                  <span>Apri il Centro di download</span>
                </button>

                {/* Bottom Actions */}
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">
                    <Smartphone className="h-4 w-4" />
                    <span>Scarica l'app per dispositivi mobili</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">
                    <UserPlus className="h-4 w-4" />
                    <span>Invita gli utenti</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>

    {/* Mobile Sidebar Overlay */}
    {showMobileMenu && (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-white">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">X</span>
              </div>
              <span className="font-semibold text-gray-900">Asset Manager</span>
            </div>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-hidden">
            <Sidebar />
          </div>
        </div>
      </div>
    )}

    {/* Notification Center */}
    <NotificationCenter 
      isOpen={showNotifications}
      onClose={() => setShowNotifications(false)}
    />

    {/* Settings Modal */}
    <SettingsModal 
      isOpen={showSettingsModal}
      onClose={() => setShowSettingsModal(false)}
      initialTab={settingsModalTab}
    />
    </>
  );
}