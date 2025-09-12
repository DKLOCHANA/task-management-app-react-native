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
  taskCount?: number;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface TaskFilters {
  status: TaskStatus | 'all';
  priority: Priority | 'all';
  categoryId: string | 'all';
  search: string;
  sortBy: 'dueDate' | 'priority' | 'createdAt';
}

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

export interface User {
  id: string;
  email: string;
  name?: string;
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

// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  TaskDetail: { taskId: string };
  EditTask: { taskId: string };
};

export type TabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Add: undefined;
  Categories: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// Component prop types
export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  className?: string;
}