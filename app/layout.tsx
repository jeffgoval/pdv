import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DialogProvider } from '@/contexts/DialogContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PDV',
  description: 'PDV simples e rápido',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}
      >
        <DialogProvider>{children}</DialogProvider>
      </body>
    </html>
  );
}
