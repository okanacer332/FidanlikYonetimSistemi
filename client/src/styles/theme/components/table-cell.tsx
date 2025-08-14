import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

export const MuiTableCell = {
  styleOverrides: {
    // Tüm tablo hücreleri için varsayılan stiller
    root: {
      borderBottom: 'var(--TableCell-borderWidth, 1px) solid var(--mui-palette-TableCell-border)',
      // Dikey ve yatay boşlukları azaltarak daha kompakt bir görünüm sağlıyoruz
      padding: '8px 16px', 
    },
    // Tablo başlığı hücreleri için ek stil
    head: {
      color: 'var(--mui-palette-text-secondary)',
      backgroundColor: 'var(--mui-palette-background-level1)',
      fontWeight: 600,
    },
    // Checkbox olan hücrelerin soldaki boşluğunu ayarlıyoruz
    paddingCheckbox: { 
      padding: '0 0 0 24px' 
    },
  },
} satisfies Components<Theme>['MuiTableCell'];