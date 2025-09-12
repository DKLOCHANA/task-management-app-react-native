// GraphQL Types matching original implementation
export interface User {
  id: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  categoryIds: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  completedToday: number;
  overdue: number;
  todayTasks: number;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// Input Types
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  categoryIds: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
}

export interface CreateCategoryInput {
  name: string;
  color: string;
}

export interface UpdateCategoryInput {
  name?: string;
  color?: string;
}

// Query Variables
export interface GetTasksByStatusVariables {
  status: TaskStatus;
}

export interface GetTasksByCategoryVariables {
  categoryId: string;
}

export interface GetTaskVariables {
  id: string;
}

// Mutation Variables
export interface CreateTaskVariables {
  input: CreateTaskInput;
}

export interface UpdateTaskVariables {
  id: string;
  input: UpdateTaskInput;
}

export interface DeleteTaskVariables {
  id: string;
}

export interface CreateCategoryVariables {
  input: CreateCategoryInput;
}

export interface UpdateCategoryVariables {
  id: string;
  input: UpdateCategoryInput;
}

export interface DeleteCategoryVariables {
  id: string;
}

export interface AddTaskToCategoryVariables {
  taskId: string;
  categoryId: string;
}

export interface RemoveTaskFromCategoryVariables {
  taskId: string;
  categoryId: string;
}