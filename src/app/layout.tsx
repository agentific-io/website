import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agentific — Everything your agent needs to go live.',
  description:
    'Secure, multi-tenant hosting for AI agents. Encrypted credentials, deterministic workflows, and full observability — ready in minutes.',
  keywords: [
    'AI agents',
    'agent hosting',
    'multi-tenant',
    'AI infrastructure',
    'agent deployment',
    'production AI',
    'secure AI agents',
    'workflow engine',
    'KMS encryption',
  ],
  openGraph: {
    title: 'Agentific — Everything your agent needs to go live.',
    description:
      'Secure, multi-tenant hosting for AI agents. Encrypted credentials, deterministic workflows, and full observability — ready in minutes.',
    url: 'https://agentific.io',
    siteName: 'Agentific',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agentific — Everything your agent needs to go live.',
    description:
      'Secure, multi-tenant hosting for AI agents. Encrypted credentials, deterministic workflows, and full observability — ready in minutes.',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL('https://agentific.io'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
