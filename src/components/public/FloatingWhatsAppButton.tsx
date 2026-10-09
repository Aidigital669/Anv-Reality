'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function FloatingWhatsAppButton() {
  const pathname = usePathname();

  // Hide on CRM and Admin back-office panels so it doesn't obstruct dashboard data
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/crm')) {
    return null;
  }

  const whatsappNumber = '919373020701';
  const defaultMessage = encodeURIComponent(
    'Hello Anv Reeality, I am interested in exploring verified luxury residences and Grade-A commercial spaces in Pune.'
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <aside
      aria-label="Direct WhatsApp Support Desk"
      className="fixed bottom-6 right-5 sm:right-6 z-40 flex items-center gap-3 group select-none"
    >
      {/* WhatsApp Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Anv Reeality luxury property advisor on WhatsApp (93730 20701)"
        className="relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-2xl hover:shadow-[0_10px_30px_rgba(37,211,102,0.45)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-emerald-500/20 group-hover:ring-emerald-500/40"
      >
        {/* Subtle Pulse Aura */}
        <span
          className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none duration-1000"
          aria-hidden="true"
        />

        {/* Authentic WhatsApp SVG Icon */}
        <svg
          viewBox="0 0 32 32"
          className="w-8 h-8 fill-white drop-shadow-sm transition-transform duration-300 group-hover:rotate-6"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 2C8.28 2 2 8.28 2 16c0 2.66.75 5.15 2.05 7.29L2.3 29.7l6.63-1.74A13.9 13.9 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm8.17 19.83c-.34.96-1.7 1.76-2.76 1.99-.73.16-1.68.29-4.88-1.04-4.09-1.69-6.72-5.83-6.93-6.1-.2-.28-1.67-2.22-1.67-4.23s1.05-3.01 1.43-3.42c.38-.41.82-.51 1.1-.51.27 0 .55 0 .79.02.25.01.59-.1.92.7.34.82 1.16 2.83 1.26 3.04.1.2.17.44.03.71-.13.27-.2.44-.4.68-.2.24-.43.53-.61.71-.21.21-.43.44-.19.86.25.41 1.09 1.8 2.34 2.91 1.61 1.43 2.97 1.88 3.39 2.09.42.2.67.18.92-.1.25-.28 1.07-1.24 1.35-1.67.28-.43.56-.36.94-.22.38.14 2.42 1.14 2.83 1.35.41.2.69.31.79.48.1.18.1 1.02-.24 1.98z" />
        </svg>

        {/* Live Online Indicator Dot */}
        <span
          className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-300 border-2 border-white rounded-full shadow-xs"
          title="Advisors Online Now"
        />
      </a>

    </aside>
  );
}
