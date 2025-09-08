'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Download, QrCode, X } from 'lucide-react';

interface QRCodeGeneratorProps {
  data: string;
  size?: number;
  onClose?: () => void;
  title?: string;
}

export default function QRCodeGenerator({ 
  data, 
  size = 200, 
  onClose,
  title = "Codice QR"
}: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [data, size]);

  const generateQRCode = async () => {
    try {
      setIsLoading(true);
      const url = await QRCode.toDataURL(data, {
        width: size,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qrcode_${title.replace(/\s+/g, '_').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center mb-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="mx-auto border border-gray-200 rounded"
                style={{ width: size, height: size }}
              />
            )}
          </div>

          <div className="text-xs text-gray-500 mb-4 break-all text-center">
            {data}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={downloadQRCode}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Scarica
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Chiudi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <img
            src={qrCodeUrl}
            alt="QR Code"
            className="mx-auto border border-gray-200 rounded mb-2"
            style={{ width: size, height: size }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={downloadQRCode}
          >
            <Download className="h-4 w-4 mr-1" />
            Scarica
          </Button>
        </>
      )}
    </div>
  );
}