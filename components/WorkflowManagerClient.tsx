'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const WorkflowManagerDynamic = dynamic(() => import('./WorkflowManager'), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  ),
  ssr: false
});

interface WorkflowManagerClientProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkflowManagerClient({ isOpen, onClose }: WorkflowManagerClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) {
    return null;
  }

  return <WorkflowManagerDynamic isOpen={isOpen} onClose={onClose} />;
}