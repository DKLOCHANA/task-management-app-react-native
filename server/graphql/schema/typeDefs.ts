import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # Enums
  enum TaskStatus {
    todo
    in_progress
    completed
  }

  enum Priority {
    low
    medium
    high
  }

  # Types
  type User {
    id: ID!
    email: String!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    priority: Priority!
    dueDate: String
    createdAt: String!
    updatedAt: String!
    categoryIds: [ID!]!
  }

  type Category {
    id: ID!
    name: String!
    color: String!
    createdAt: String!
  }

  type TaskStats {
    total: Int!
    completed: Int!
    pending: Int!
    inProgress: Int!
    completedToday: Int!
    overdue: Int!
    todayTasks: Int!
  }

  # Input Types
  input CreateTaskInput {
    title: String!
    description: String
    priority: Priority!
    dueDate: String
    categoryIds: [ID!]!
  }

  input UpdateTaskInput {
    title: String
    description: String
    status: TaskStatus
    priority: Priority
    dueDate: String
  }

  input CreateCategoryInput {
    name: String!
    color: String!
  }

  input UpdateCategoryInput {
    name: String
    color: String
  }

  # Queries
  type Query {
    user: User!
    tasks: [Task!]!
    categories: [Category!]!
    taskStats: TaskStats!
  }

  # Mutations
  type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
  }
`;