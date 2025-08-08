import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import ClientPicker from '@/src/components/ClientPicker';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'Onbrd Dashboard',
  description: 'AI Customer Ops KPIs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-gradient-to-b from-neutral-50 to-white text-black dark:from-neutral-950 dark:to-neutral-950 dark:text-neutral-100">
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-brand text-white px-3 py-2 rounded">Skip to content</a>
          <header className="bg-brand text-white">
            <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/20" aria-hidden="true" />
                <h1 className="text-xl font-semibold">{process.env.NEXT_PUBLIC_APP_NAME || 'Onbrd Dashboard'}</h1>
              </div>
              <nav aria-label="Primary" className="flex items-center gap-4">
                <Link className="hover:underline focus-visible:underline" href="/">Home</Link>
                <Link className="hover:underline focus-visible:underline" href="/dashboard">Dashboard</Link>
                <Link className="hover:underline focus-visible:underline" href="/clients">Clients</Link>
                <Link className="hover:underline focus-visible:underline" href="/billing">Billing</Link>
                <SignedIn>
                  <ClientPicker />
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <SignInButton />
                  <SignUpButton />
                </SignedOut>
              </nav>
            </div>
          </header>
          <main id="main" className="mx-auto max-w-7xl px-4 py-8">{children}</main>
          <footer className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-500"><p>© {new Date().getFullYear()} Onbrd Solutions</p></footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
