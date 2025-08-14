// client/src/components/core/breadcrumbs.tsx
import * as React from 'react';
import Link from 'next/link';
import { Breadcrumbs as MuiBreadcrumbs, Link as MuiLink, Typography } from '@mui/material';
// Phosphor ikon importunu kaldırıyoruz, artık ihtiyacımız yok.

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps): React.JSX.Element {
  return (
    <MuiBreadcrumbs
      separator=">" // ChevronRight ikonu yerine doğrudan '>' karakterini kullanıyoruz
      sx={{ '& ol': { display: 'flex', alignItems: 'center', p: 0 } }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast || !item.href) {
          return (
            <Typography color="text.primary" key={item.label} variant="body2">
              {item.label}
            </Typography>
          );
        }

        return (
          <MuiLink
            component={Link}
            href={item.href}
            key={item.label}
            color="inherit"
            underline="hover"
            variant="body2"
          >
            {item.label}
          </MuiLink>
        );
      })}
    </MuiBreadcrumbs>
  );
}