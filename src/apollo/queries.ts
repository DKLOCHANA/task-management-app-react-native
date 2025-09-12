import { gql } from '@apollo/client';

// Simple queries matching the original implementation
export const GET_USER = gql`
  query GetUser {
    user {
      id
      email
    }
  }
`;

export const GET_TASKS = gql`
  query GetTasks {
    tasks {
      id
      title
      description
      status
      priority
      dueDate
      createdAt
      updatedAt
      categoryIds
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      color
      createdAt
    }
  }
`;

export const GET_TASK_STATS = gql`
  query GetTaskStats {
    taskStats {
      total
      completed
      pending
      inProgress
      completedToday
      overdue
      todayTasks
    }
  }
`;