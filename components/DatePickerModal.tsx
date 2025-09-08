'use client';

import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  onDateChange: (newDate: string) => void;
  title?: string;
}

export default function DatePickerModal({ 
  isOpen, 
  onClose, 
  currentDate, 
  onDateChange, 
  title = "Modifica Data di Scadenza" 
}: DatePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate);

  if (!isOpen) return null;

  const handleSave = () => {
    onDateChange(selectedDate);
    onClose();
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data attuale
            </label>
            <div className="p-3 bg-gray-50 rounded-md text-gray-600">
              {formatDateForDisplay(currentDate)}
            </div>
          </div>

          <div>
            <label htmlFor="new-date" className="block text-sm font-medium text-gray-700 mb-2">
              Nuova data di scadenza
            </label>
            <input
              type="date"
              id="new-date"
              value={formatDateForInput(selectedDate)}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {selectedDate !== currentDate && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Nuova data:</strong> {formatDateForDisplay(selectedDate)}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={selectedDate === currentDate}
          >
            Salva Data
          </Button>
        </div>
      </div>
    </div>
  );
}