import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './graphql/schema/typeDefs';
import { resolvers } from './graphql/resolvers';

// Load environment variables
require('dotenv').config();

interface Context {
  // Add user context here if needed for authentication
  // user?: User;
}

async function startServer() {
  // Create Apollo Server
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    // Enable GraphQL Playground in development
    introspection: process.env.NODE_ENV !== 'production',
    // Disable CSRF protection for development and mobile apps
    csrfPrevention: false,
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        // Include error details in development
        ...(process.env.NODE_ENV !== 'production' && {
          locations: error.locations,
          path: error.path,
          extensions: error.extensions,
        }),
      };
    },
  });

  const PORT = process.env.PORT || 4000;

  // Start the server
  const { url } = await startStandaloneServer(server, {
    listen: { 
      port: PORT as number,
      host: '0.0.0.0' // Listen on all network interfaces
    },
    context: async ({ req }) => {
      // Here you can add authentication logic
      // const token = req.headers.authorization;
      // const user = await getUserFromToken(token);
      
      return {
        // user,
      };
    },
  });

  console.log(`🚀 Apollo Server ready at ${url}`);
  console.log(`📊 GraphQL Playground available in development mode`);
}

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});