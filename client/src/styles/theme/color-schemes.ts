import type { ColorSystemOptions } from '@mui/material/styles';

import { amber, forestGreen, nevada, redOrange, shakespeare } from './colors';
import type { ColorScheme } from './types';

export const colorSchemes = {
  dark: {
    palette: {
      action: { disabledBackground: 'rgba(0, 0, 0, 0.12)' },
      background: {
        default: 'var(--mui-palette-neutral-950)',
        defaultChannel: '9 10 11',
        paper: 'var(--mui-palette-neutral-900)',
        paperChannel: '19 78 72',
        level1: 'var(--mui-palette-neutral-800)',
        level2: 'var(--mui-palette-neutral-700)',
        level3: 'var(--mui-palette-neutral-600)',
      },
      common: { black: '#000000', white: '#ffffff' },
      divider: 'var(--mui-palette-neutral-700)',
      dividerChannel: '50 56 62',
      error: {
        ...redOrange,
        light: redOrange[300],
        main: redOrange[400],
        dark: redOrange[500],
        contrastText: 'var(--mui-palette-common-black)',
      },
      info: {
        ...shakespeare,
        light: shakespeare[300],
        main: shakespeare[400],
        dark: shakespeare[500],
        contrastText: 'var(--mui-palette-common-black)',
      },
      neutral: { ...nevada },
      primary: { // Koyu mod için ana rengi Forest Green yaptık
        ...forestGreen,
        light: forestGreen[300],
        main: forestGreen[400],
        dark: forestGreen[500],
        contrastText: 'var(--mui-palette-common-black)',
      },
      secondary: {
        ...nevada,
        light: nevada[100],
        main: nevada[200],
        dark: nevada[300],
        contrastText: 'var(--mui-palette-common-black)',
      },
      success: { // Başarı rengini de yeşil tonu yaptık
        ...forestGreen,
        light: forestGreen[300],
        main: forestGreen[400],
        dark: forestGreen[500],
        contrastText: 'var(--mui-palette-common-black)',
      },
      text: {
        primary: 'var(--mui-palette-neutral-100)',
        primaryChannel: '240 244 248',
        secondary: 'var(--mui-palette-neutral-400)',
        secondaryChannel: '159 166 173',
        disabled: 'var(--mui-palette-neutral-600)',
      },
      warning: { // Uyarı rengini amber yaptık
        ...amber,
        light: amber[300],
        main: amber[400],
        dark: amber[500],
        contrastText: 'var(--mui-palette-common-black)',
      },
    },
  },
  light: {
    palette: {
      action: { disabledBackground: 'rgba(0, 0, 0, 0.06)' },
      background: {
        default: 'var(--mui-palette-common-white)',
        defaultChannel: '255 255 255',
        paper: 'var(--mui-palette-common-white)',
        paperChannel: '255 255 255',
        level1: '#f8f9fa', // Hafif gri bir ton
        level2: '#f1f3f5', // Biraz daha koyu gri
        level3: '#e9ecef',
      },
      common: { black: '#000000', white: '#ffffff' },
      divider: '#dee2e6', // Daha belirgin bir ayırıcı rengi
      dividerChannel: '222 226 230',
      error: {
        ...redOrange,
        light: redOrange[400],
        main: redOrange[500],
        dark: redOrange[600],
        contrastText: 'var(--mui-palette-common-white)',
      },
      info: {
        ...shakespeare,
        light: shakespeare[400],
        main: shakespeare[500],
        dark: shakespeare[600],
        contrastText: 'var(--mui-palette-common-white)',
      },
      neutral: { ...nevada },
      primary: { // Açık mod için ana rengi Forest Green yaptık
        ...forestGreen,
        light: forestGreen[400],
        main: forestGreen[500],
        dark: forestGreen[600],
        contrastText: 'var(--mui-palette-common-white)',
      },
      secondary: {
        ...nevada,
        light: nevada[600],
        main: nevada[700],
        dark: nevada[800],
        contrastText: 'var(--mui-palette-common-white)',
      },
      success: { // Başarı rengini de ana yeşil tonuna yakın yaptık
        ...forestGreen,
        light: forestGreen[400],
        main: forestGreen[500],
        dark: forestGreen[600],
        contrastText: 'var(--mui-palette-common-white)',
      },
      text: {
        primary: '#212529',
        primaryChannel: '33 37 41',
        secondary: '#6c757d',
        secondaryChannel: '108 117 125',
        disabled: '#adb5bd',
      },
      warning: { // Uyarı rengini amber yaptık
        ...amber,
        light: amber[400],
        main: amber[500],
        dark: amber[600],
        contrastText: 'var(--mui-palette-common-white)',
      },
    },
  },
} satisfies Partial<Record<ColorScheme, ColorSystemOptions>>;