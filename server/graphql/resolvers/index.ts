import { userResolvers } from './userResolvers';

// Simple resolver structure matching our simplified schema
export const resolvers = {
  Query: {
    ...userResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
  },
};