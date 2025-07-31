// src/components/common/PageHeader.tsx
import * as React from 'react';
import { Grid, Stack, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, action }: PageHeaderProps): React.JSX.Element {
  return (
    // The main container Grid remains the same.
    <Grid container alignItems="center" justifyContent="space-between" spacing={3}>
      
      {/* For the title, we use size="grow" to make it expand and fill available space.
          This corresponds to the "Auto-layout" example in the documentation. */}
      <Grid size="grow"> 
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
      </Grid>

      {/* For the action buttons, we use size="auto" so it only takes up the space
          its content needs. This corresponds to the "Variable width content" example. */}
      {action && (
        <Grid size="auto">
          <Stack direction="row" spacing={2}>
            {action}
          </Stack>
        </Grid>
      )}
    </Grid>
  );
}