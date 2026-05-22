/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { AuthProvider } from '@/components/auth/AuthProvider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'TimeBank — Exchange Skills, Earn Community Hours',
  description:
    'TimeBank helps neighbors exchange services using time credits. Offer your skills, earn hours, and spend them on help you need — all within your local community.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
