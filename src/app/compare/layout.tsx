import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://anvreeality.com';

export const metadata: Metadata = {
  title: 'Compare Properties | ANV REEALTY Pune',
  description: 'Side-by-side comparative specification and valuation analysis of luxury residential and commercial properties in Pune.',
  alternates: {
    canonical: `${baseUrl}/compare`,
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
