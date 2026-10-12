import { redirect } from 'next/navigation';

export default async function SignUpPage({
  searchParams
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  if (params?.role === 'sales' || params?.role === 'sales_executive' || params?.role === 'executive') {
    redirect('/crm/signup');
  }
  redirect('/login?tab=register');
}
