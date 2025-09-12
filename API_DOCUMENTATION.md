# GraphQL API Documentation

## Overview

The Task Management App uses GraphQL for efficient data fetching and real-time updates. The API provides full CRUD operations for tasks, categories, and user management with type-safe operations.

## GraphQL Endpoint

**Development**: `http://localhost:4000/graphql`
**Production**: `https://your-domain.com/graphql`

## Authentication

All operations require user authentication through Supabase Auth. Include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Schema Overview

### Types

```graphql
scalar DateTime

enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

type User {
  id: ID!
  email: String!
  name: String
  createdAt: DateTime!
}

type Category {
  id: ID!
  name: String!
  color: String!
  userId: ID!
  createdAt: DateTime!
}

type Task {
  id: ID!
  title: String!
  description: String
  status: TaskStatus!
  priority: Priority!
  dueDate: DateTime
  userId: ID!
  categories: [Category!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type TaskStats {
  total: Int!
  completed: Int!
  inProgress: Int!
  todo: Int!
  overdue: Int!
  dueToday: Int!
  completionRate: Float!
}
```

### Input Types

```graphql
input CreateTaskInput {
  title: String!
  description: String
  priority: Priority = MEDIUM
  dueDate: DateTime
  categoryIds: [ID!]
}

input UpdateTaskInput {
  title: String
  description: String
  status: TaskStatus
  priority: Priority
  dueDate: DateTime
  categoryIds: [ID!]
}

input CreateCategoryInput {
  name: String!
  color: String = "#3B82F6"
}

input UpdateCategoryInput {
  name: String
  color: String
}
```

## Queries

### Get All Tasks

Fetch all tasks for the authenticated user with optional filtering.

```graphql
query GetTasks($status: TaskStatus, $priority: Priority) {
  tasks(status: $status, priority: $priority) {
    id
    title
    description
    status
    priority
    dueDate
    categories {
      id
      name
      color
    }
    createdAt
    updatedAt
  }
}
```

**Variables:**

```json
{
  "status": "TODO",
  "priority": "HIGH"
}
```

**Response:**

```json
{
  "data": {
    "tasks": [
      {
        "id": "task-123",
        "title": "Complete project documentation",
        "description": "Write comprehensive README and API docs",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "dueDate": "2025-09-15T10:00:00Z",
        "categories": [
          {
            "id": "cat-1",
            "name": "Work",
            "color": "#EF4444"
          }
        ],
        "createdAt": "2025-09-12T08:30:00Z",
        "updatedAt": "2025-09-12T14:20:00Z"
      }
    ]
  }
}
```

### Get Single Task

Fetch a specific task by ID.

```graphql
query GetTask($id: ID!) {
  task(id: $id) {
    id
    title
    description
    status
    priority
    dueDate
    categories {
      id
      name
      color
    }
    createdAt
    updatedAt
  }
}
```

### Get Categories

Fetch all categories for the authenticated user.

```graphql
query GetCategories {
  categories {
    id
    name
    color
    createdAt
  }
}
```

### Get Task Statistics

Fetch dashboard statistics for the authenticated user.

```graphql
query GetTaskStats {
  taskStats {
    total
    completed
    inProgress
    todo
    overdue
    dueToday
    completionRate
  }
}
```

**Response:**

```json
{
  "data": {
    "taskStats": {
      "total": 25,
      "completed": 12,
      "inProgress": 5,
      "todo": 8,
      "overdue": 3,
      "dueToday": 2,
      "completionRate": 48.0
    }
  }
}
```

### Get User Profile

Fetch the authenticated user's profile.

```graphql
query GetUser {
  user {
    id
    email
    name
    createdAt
  }
}
```

## Mutations

### Create Task

Create a new task with optional categories.

```graphql
mutation CreateTask($input: CreateTaskInput!) {
  createTask(input: $input) {
    id
    title
    description
    status
    priority
    dueDate
    categories {
      id
      name
      color
    }
    createdAt
  }
}
```

**Variables:**

```json
{
  "input": {
    "title": "Review code changes",
    "description": "Review pull requests from team members",
    "priority": "HIGH",
    "dueDate": "2025-09-13T15:00:00Z",
    "categoryIds": ["cat-1", "cat-2"]
  }
}
```

### Update Task

Update an existing task, including status changes.

```graphql
mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
  updateTask(id: $id, input: $input) {
    id
    title
    description
    status
    priority
    dueDate
    categories {
      id
      name
      color
    }
    updatedAt
  }
}
```

**Variables:**

```json
{
  "id": "task-123",
  "input": {
    "status": "COMPLETED",
    "description": "Updated description with completion notes"
  }
}
```

### Delete Task

Delete a task permanently.

```graphql
mutation DeleteTask($id: ID!) {
  deleteTask(id: $id)
}
```

**Variables:**

```json
{
  "id": "task-123"
}
```

**Response:**

```json
{
  "data": {
    "deleteTask": true
  }
}
```

### Create Category

Create a new category with a custom color.

```graphql
mutation CreateCategory($input: CreateCategoryInput!) {
  createCategory(input: $input) {
    id
    name
    color
    createdAt
  }
}
```

**Variables:**

```json
{
  "input": {
    "name": "Urgent",
    "color": "#DC2626"
  }
}
```

### Update Category

Update category name or color.

```graphql
mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
  updateCategory(id: $id, input: $input) {
    id
    name
    color
  }
}
```

### Delete Category

Delete a category (removes associations with tasks).

```graphql
mutation DeleteCategory($id: ID!) {
  deleteCategory(id: $id)
}
```

## Common Usage Patterns

### Complete Task Workflow

1. **Create Task**:

```graphql
mutation {
  createTask(
    input: {
      title: "New feature implementation"
      description: "Implement user authentication feature"
      priority: HIGH
      dueDate: "2025-09-20T17:00:00Z"
      categoryIds: ["work-cat-id"]
    }
  ) {
    id
    title
    status
  }
}
```

2. **Start Working** (Update to IN_PROGRESS):

```graphql
mutation {
  updateTask(id: "task-id", input: { status: IN_PROGRESS }) {
    id
    status
    updatedAt
  }
}
```

3. **Complete Task**:

```graphql
mutation {
  updateTask(id: "task-id", input: { status: COMPLETED }) {
    id
    status
    updatedAt
  }
}
```

### Dashboard Data Loading

Load all necessary dashboard data in a single request:

```graphql
query DashboardData {
  taskStats {
    total
    completed
    inProgress
    overdue
    dueToday
    completionRate
  }

  tasks(status: IN_PROGRESS) {
    id
    title
    priority
    dueDate
    categories {
      name
      color
    }
  }

  categories {
    id
    name
    color
  }
}
```

### Filter Tasks by Category

Get all tasks in specific categories:

```graphql
query TasksByCategory {
  tasks {
    id
    title
    status
    priority
    categories {
      id
      name
      color
    }
  }
}
```

Then filter client-side or use a custom resolver for server-side filtering.

## Error Handling

### Common Error Responses

**Authentication Error:**

```json
{
  "errors": [
    {
      "message": "Authentication required",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**Validation Error:**

```json
{
  "errors": [
    {
      "message": "Task title is required",
      "extensions": {
        "code": "BAD_USER_INPUT",
        "field": "title"
      }
    }
  ]
}
```

**Not Found Error:**

```json
{
  "errors": [
    {
      "message": "Task not found",
      "extensions": {
        "code": "NOT_FOUND",
        "resource": "task",
        "id": "invalid-task-id"
      }
    }
  ]
}
```

**Permission Error:**

```json
{
  "errors": [
    {
      "message": "You don't have permission to access this resource",
      "extensions": {
        "code": "FORBIDDEN"
      }
    }
  ]
}
```

## Rate Limiting

- **Rate Limit**: 1000 requests per hour per user
- **Burst Limit**: 100 requests per minute
- **Headers**: Rate limit information is returned in response headers:
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Real-time Subscriptions

_Note: Subscriptions are planned for future implementation_

```graphql
subscription TaskUpdates {
  taskUpdated {
    id
    title
    status
    updatedAt
  }
}

subscription CategoryUpdates {
  categoryUpdated {
    id
    name
    color
  }
}
```

## GraphQL Playground

Access the interactive GraphQL Playground at:

- **Development**: `http://localhost:4000/graphql`

The playground provides:

- Schema documentation
- Query/mutation testing
- Real-time error feedback
- Auto-completion

## Best Practices

### Query Optimization

1. **Request only needed fields**:

```graphql
# Good
query {
  tasks {
    id
    title
    status
  }
}

# Avoid over-fetching
query {
  tasks {
    id
    title
    description
    status
    priority
    dueDate
    categories { ... }
    createdAt
    updatedAt
  }
}
```

2. **Use fragments for reusable field sets**:

```graphql
fragment TaskSummary on Task {
  id
  title
  status
  priority
  dueDate
}

query {
  tasks {
    ...TaskSummary
  }
}
```

3. **Batch operations when possible**:

```graphql
# Create multiple categories in sequence
mutation CreateCategories {
  work: createCategory(input: { name: "Work", color: "#EF4444" }) {
    id
  }
  personal: createCategory(input: { name: "Personal", color: "#3B82F6" }) {
    id
  }
}
```

### Error Handling

Always handle both network errors and GraphQL errors:

```typescript
try {
  const { data, error } = await apolloClient.query({
    query: GET_TASKS,
    variables: { status: "TODO" },
  });

  if (error) {
    // Handle GraphQL errors
    console.error("GraphQL errors:", error.graphQLErrors);
    console.error("Network error:", error.networkError);
  }

  return data;
} catch (error) {
  // Handle network or other errors
  console.error("Request failed:", error);
}
```

---

_Last updated: September 12, 2025_
