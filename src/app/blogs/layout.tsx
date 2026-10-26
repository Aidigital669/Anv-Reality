import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://anvreeality.com';

export const metadata: Metadata = {
  title: 'Real Estate Research & Pune Market Insights | ANV REEALTY',
  description: 'In-depth market intelligence, infrastructure reports, and luxury real estate investment insights across Pune micro-markets.',
  alternates: {
    canonical: `${baseUrl}/blogs`,
  },
};

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
