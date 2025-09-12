import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Platform } from 'react-native';

// HTTP connection to the API
const getGraphQLUri = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access localhost
      return 'http://10.0.2.2:4000/graphql';
    } else {
      // iOS simulator - use your computer's actual IP address
      return 'http://192.168.1.168:4000/graphql';
    }
  }
  return 'http://localhost:4000/graphql';
};

const graphqlUri = getGraphQLUri();
console.log('GraphQL URI:', graphqlUri);

const httpLink = createHttpLink({
  uri: graphqlUri,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache implementation
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        tasks: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        categories: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

// Create Apollo Client
export const client = new ApolloClient({
  link: httpLink,
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// Also export as apolloClient for backward compatibility
export const apolloClient = client;