'use client';

import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { gql, useQuery } from '@apollo/client';

import { config } from '@/config';
import { AdminGuard } from '@/components/auth/admin-guard';

export const metadata = { title: `Roles | Dashboard | ${config.site.name}` } satisfies Metadata;

const GET_ROLES = gql`
  query GetRoles {
    roller {
      id
      rolAdi
      izinler {
        id
        izinAdi
      }
    }
  }
`;

export default function Page(): React.JSX.Element {
  const { data, loading, error } = useQuery(GET_ROLES);

  const renderContent = (): React.ReactNode => {
    if (loading) {
      return <Typography>Loading...</Typography>;
    }

    if (error) {
      return <Typography color="error">{error.message}</Typography>;
    }

    if (!data?.roller?.length) {
      return <Typography>No roles found.</Typography>;
    }

    return (
      <Stack spacing={2}>
        {data.roller.map((role: any) => (
          <Stack key={role.id} spacing={0.5}>
            <Typography variant="h6">{role.rolAdi}</Typography>
            <Typography variant="body2">
              {role.izinler && role.izinler.length > 0
                ? role.izinler.map((p: any) => p.izinAdi).join(', ')
                : 'No permissions'}
            </Typography>
          </Stack>
        ))}
      </Stack>
    );
  };

  return (
    <AdminGuard>
      <Stack spacing={3}>
        <Typography variant="h4">Roles</Typography>
        {renderContent()}
      </Stack>
    </AdminGuard>
  );
}
