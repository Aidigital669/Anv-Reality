import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anv Reeality | Website Admin Panel & CMS',
  description: 'Manage Anv Reeality luxury public website, inventory, and digital editorial content.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#fafafb]">{children}</div>;
}
