'use client';

import { useState } from "react";
import { Lock, Settings, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AutomationsPage() {
  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Automazioni</h1>
            <p className="text-gray-600 mt-2">Configura automazioni e flussi di lavoro</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" disabled>
            <Lock className="h-4 w-4 mr-2" />
            Funzione Bloccata
          </Button>
        </div>

        {/* Locked Feature Message */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Funzionalità in Sviluppo
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Le automazioni e i flussi di lavoro automatizzati saranno disponibili 
            in una versione futura del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}