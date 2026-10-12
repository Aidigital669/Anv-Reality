'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CrmAuthGate } from '@/components/crm/CrmAuthGate';

export default function CrmSignUpPage() {
  const router = useRouter();

  const handleAuthenticated = () => {
    router.push('/crm');
  };

  return <CrmAuthGate onAuthenticated={handleAuthenticated} initialMode="signup" />;
}
