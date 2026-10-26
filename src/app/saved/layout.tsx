import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://anvreeality.com';

export const metadata: Metadata = {
  title: 'Saved Properties | ANV REEALTY Pune',
  description: 'Your shortlisted luxury residential and commercial properties in Pune.',
  alternates: {
    canonical: `${baseUrl}/saved`,
  },
};

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
