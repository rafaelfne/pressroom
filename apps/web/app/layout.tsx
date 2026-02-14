import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pressroom',
  description: 'Report generation platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
