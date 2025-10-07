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
      {/* --- THIS IS THE FIX --- */}
      {/* We need to add a <head> section to the root HTML document. */}
      <head>
        {/* This link tag tells the browser to download the Material Icons font stylesheet from Google Fonts. */}
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      {/* --- END OF FIX --- */}
      
      <body>{children}</body>
    </html>
  );
}