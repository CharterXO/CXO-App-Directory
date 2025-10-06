import './globals.css';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import { getAppConfig } from '@/lib/config';
import { generateCsrfToken, getCsrfTokenFromCookies, getSessionFromCookies } from '@/lib/auth/session';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: getAppConfig().appName,
  description: 'Secure launchpad for company applications'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const session = await getSessionFromCookies(cookieStore);
  const csrf = getCsrfTokenFromCookies(cookieStore) ?? generateCsrfToken();

  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="csrf-token" content={csrf} />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-50`}
        data-role={session?.user.role ?? 'anonymous'}>
        {children}
      </body>
    </html>
  );
}
