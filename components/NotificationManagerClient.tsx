'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const NotificationManagerDynamic = dynamic(() => import('./NotificationManager'), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  ),
  ssr: false
});

export default function NotificationManagerClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <NotificationManagerDynamic />;
}