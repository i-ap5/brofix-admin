import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brofix Admin',
  description: 'Manage Brofix service requests',
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