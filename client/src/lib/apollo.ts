// Konum: client/src/lib/apollo.ts
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Token'ı localStorage'dan al
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  // Mevcut header'lara authorization header'ını ekle
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

let apolloClient: ApolloClient<any>;

export const getClient = () => {
  if (!apolloClient) {
    apolloClient = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    });
  }
  return apolloClient;
};