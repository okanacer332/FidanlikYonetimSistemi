// Konum: client/src/app/layout.tsx
import * as React from 'react';
import type { Viewport } from 'next';
import { TopProgressBar } from '@/components/core/top-progress-bar';
import '@/styles/global.css';

import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';
// CustomApolloProvider import'u kaldırıldı

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        {/* CustomApolloProvider kullanımı kaldırıldı */}
        <LocalizationProvider>
          <UserProvider>
            <ThemeProvider>
              {/* TopProgressBar'ı bir Suspense boundary içine sarın */}
              <React.Suspense fallback={null}>
                <TopProgressBar />
              </React.Suspense>
              {children}
            </ThemeProvider>
          </UserProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}