'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CrmAuthGate } from '@/components/crm/CrmAuthGate';

function CrmLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || searchParams.get('mode');
  const initialMode = tab === 'signup' || tab === 'register' ? 'signup' : 'login';

  const handleAuthenticated = () => {
    router.push('/crm');
  };

  return <CrmAuthGate onAuthenticated={handleAuthenticated} initialMode={initialMode} />;
}

export default function CrmLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-400 text-xs font-semibold">
          Loading Sales Executive Portal...
        </div>
      }
    >
      <CrmLoginContent />
    </Suspense>
  );
}
