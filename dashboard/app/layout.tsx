import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'King Hermes Supreme Dashboard',
  description: 'Master orchestrator dashboard for multi-agent system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0f] text-white overflow-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}
