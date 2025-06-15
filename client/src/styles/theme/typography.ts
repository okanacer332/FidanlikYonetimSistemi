// client/src/styles/theme/typography.ts
import type { TypographyVariantsOptions } from "@mui/material/styles";

export const typography = {
  fontFamily:
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  body1: { fontSize: '0.9rem', fontWeight: 400, lineHeight: 1.5 }, // Boyutu küçülttük
  body2: { fontSize: '0.8rem', fontWeight: 400, lineHeight: 1.57 }, // Boyutu küçülttük
  button: { fontWeight: 500 },
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.66 },
  subtitle1: { fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.57 }, // Boyutu küçülttük
  subtitle2: { fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.57 }, // Boyutu küçülttük
  overline: {
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.5px',
    lineHeight: 2.5,
    textTransform: 'uppercase',
  },
  h1: { fontSize: '3.5rem', fontWeight: 500, lineHeight: 1.2 },
  h2: { fontSize: '3rem', fontWeight: 500, lineHeight: 1.2 },
  h3: { fontSize: '2.25rem', fontWeight: 500, lineHeight: 1.2 },
  h4: { fontSize: '2rem', fontWeight: 500, lineHeight: 1.2 },
  h5: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.2 },
  h6: { fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.2 }, // Biraz küçültüldü
} satisfies TypographyVariantsOptions;