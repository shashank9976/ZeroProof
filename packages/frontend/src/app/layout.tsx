import type { Metadata } from 'next';
import { PrivacyProvider } from '@/context/PrivacyContext';
import { WorkplaceProvider } from '@/context/WorkplaceContext';
import { AuthProvider } from '@/context/AuthProvider';
import { ThemeProvider } from '@/context/ThemeProvider';
import { Navbar } from '@/components/ui/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZeroProof — Privacy-First Compliance & Credentials',
  description: 'Zero-Knowledge Proofs for financial compliance and employee-controlled credential attestations on Midnight Network',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <PrivacyProvider>
              <WorkplaceProvider>
                <div style={{ display: 'flex', minHeight: '100vh' }}>
                  <Navbar />
                  <main className="main-content" style={{ flex: 1 }}>
                    {children}
                  </main>
                </div>
              </WorkplaceProvider>
            </PrivacyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
