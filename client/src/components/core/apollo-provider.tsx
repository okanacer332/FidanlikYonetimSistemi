// Konum: client/src/components/core/apollo-provider.tsx
'use client';

import * as React from 'react';
import { ApolloProvider } from '@apollo/client';
import { getClient } from '@/lib/apollo';

export function CustomApolloProvider({ children }: { children: React.ReactNode }) {
  const client = getClient();
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}