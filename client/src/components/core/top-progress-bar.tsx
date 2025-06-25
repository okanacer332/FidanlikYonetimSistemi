'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import * as React from 'react';
import { GlobalStyles } from '@mui/material';

export function TopProgressBar(): React.JSX.Element {
  // useEffect ile sayfa değişimlerini dinle ve yüklemeyi bitir.
  React.useEffect(() => {
    NProgress.done();
  }, [usePathname(), useSearchParams()]);

  return (
    <GlobalStyles
      styles={(theme) => ({
        '#nprogress': {
          pointerEvents: 'none',
        },
        '#nprogress .bar': {
          background: theme.palette.primary.main, // Temamızın ana rengini (yeşil) kullanıyoruz!
          position: 'fixed',
          zIndex: 2000, // En üstte görünmesi için yüksek bir z-index
          top: 0,
          left: 0,
          width: '100%',
          // --- DEĞİŞİKLİK BURADA: Çizgiyi daha belirgin yaptık ---
          height: '5px',
        },
        '#nprogress .peg': {
          display: 'block',
          position: 'absolute',
          right: '0px',
          width: '100px',
          height: '100%',
          boxShadow: `0 0 10px ${theme.palette.primary.main}, 0 0 5px ${theme.palette.primary.main}`,
          opacity: 1,
          transform: 'rotate(3deg) translate(0px, -4px)',
        },
      })}
    />
  );
}