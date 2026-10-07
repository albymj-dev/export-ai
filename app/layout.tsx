import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EXPORTAI — Export Document Verification System',
  description: 'Verify every document. Ship with confidence. AI-powered cross-document discrepancy detection for international export logistics.',
  openGraph: {
    title: 'EXPORTAI — Export Document Verification System',
    description: 'Verify every document. Ship with confidence. Enterprise pre-shipment cross-document discrepancy detection.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EXPORTAI — Export Document Verification System',
    description: 'Verify every document. Ship with confidence.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#05070A] text-slate-100 min-h-screen antialiased selection:bg-blue-600 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
