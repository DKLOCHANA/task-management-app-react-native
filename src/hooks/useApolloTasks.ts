import { useQuery, useMutation } from '@apollo/client/react';
import { useMemo } from 'react';
import {
  GET_TASKS,
  GET_CATEGORIES,
  GET_TASK_STATS,
  GET_USER,
} from '../apollo/queries';
import {
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
} from '../apollo/mutations';
import {
  Task,
  Category,
  TaskStats,
  User,
  CreateTaskInput,
  UpdateTaskInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  TaskStatus,
  Priority,
} from '../apollo/types';

// Task filters for local filtering
export interface TaskFilters {
  status: string;
  priority: string;
  categoryId: string;
  search: string;
  sortBy: string;
}

export const useApolloTasks = () => {
  // Queries with error handling
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER);
  const { data: tasksData, loading: tasksLoading, refetch: refetchTasks, error: tasksError } = useQuery(GET_TASKS);
  const { data: categoriesData, loading: categoriesLoading, refetch: refetchCategories, error: categoriesError } = useQuery(GET_CATEGORIES);
  const { data: statsData, loading: statsLoading, refetch: refetchStats, error: statsError } = useQuery(GET_TASK_STATS);

  // Log errors for debugging
  if (userError) console.error('User query error:', userError);
  if (tasksError) console.error('Tasks query error:', tasksError);
  if (categoriesError) console.error('Categories query error:', categoriesError);
  if (statsError) console.error('Stats query error:', statsError);

  // Mutations
  const [createTaskMutation, { loading: createTaskLoading }] = useMutation(CREATE_TASK, {
    refetchQueries: [GET_TASKS, GET_TASK_STATS],
  });

  const [updateTaskMutation, { loading: updateTaskLoading }] = useMutation(UPDATE_TASK, {
    refetchQueries: [GET_TASKS, GET_TASK_STATS],
  });

  const [deleteTaskMutation, { loading: deleteTaskLoading }] = useMutation(DELETE_TASK, {
    refetchQueries: [GET_TASKS, GET_TASK_STATS],
  });

  const [createCategoryMutation, { loading: createCategoryLoading }] = useMutation(CREATE_CATEGORY, {
    refetchQueries: [GET_CATEGORIES],
  });

  const [updateCategoryMutation, { loading: updateCategoryLoading }] = useMutation(UPDATE_CATEGORY, {
    refetchQueries: [GET_CATEGORIES],
  });

  const [deleteCategoryMutation, { loading: deleteCategoryLoading }] = useMutation(DELETE_CATEGORY, {
    refetchQueries: [GET_CATEGORIES, GET_TASKS],
  });

  // Extract data from queries
  const user: User | null = (userData as any)?.user || null;
  const tasks: Task[] = (tasksData as any)?.tasks || [];
  const categories: Category[] = (categoriesData as any)?.categories || [];
  const taskStats: TaskStats = (statsData as any)?.taskStats || {
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    completedToday: 0,
    overdue: 0,
    todayTasks: 0,
  };

  // Debug logging
  console.log('Apollo Hook Debug:', {
    userLoading,
    tasksLoading,
    categoriesLoading,
    statsLoading,
    userError: userError?.message,
    tasksError: tasksError?.message,
    categoriesError: categoriesError?.message,
    statsError: statsError?.message,
    userData,
    tasksData,
    categoriesData,
    statsData,
    tasksCount: tasks.length,
    categoriesCount: categories.length,
  });

  // Loading states
  const loading = tasksLoading || categoriesLoading || userLoading || statsLoading ||
                  createTaskLoading || updateTaskLoading || deleteTaskLoading ||
                  createCategoryLoading || updateCategoryLoading || deleteCategoryLoading;

  // Mutation functions
  const createTask = async (input: CreateTaskInput): Promise<Task> => {
    const result = await createTaskMutation({
      variables: { input },
    });
    return (result.data as any).createTask;
  };

  const updateTask = async (id: string, input: UpdateTaskInput): Promise<Task> => {
    const result = await updateTaskMutation({
      variables: { id, input },
    });
    return (result.data as any).updateTask;
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    const result = await deleteTaskMutation({
      variables: { id },
    });
    return (result.data as any).deleteTask;
  };

  const createCategory = async (input: CreateCategoryInput): Promise<Category> => {
    const result = await createCategoryMutation({
      variables: { input },
    });
    return (result.data as any).createCategory;
  };

  const updateCategory = async (id: string, input: UpdateCategoryInput): Promise<Category> => {
    const result = await updateCategoryMutation({
      variables: { id, input },
    });
    return (result.data as any).updateCategory;
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    const result = await deleteCategoryMutation({
      variables: { id },
    });
    return (result.data as any).deleteCategory;
  };

  // Utility functions
  const getFilteredTasks = useMemo(() => {
    return (filters: TaskFilters): Task[] => {
      return tasks.filter(task => {
        const matchesStatus = filters.status === 'all' || task.status === filters.status;
        const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
        const matchesCategory = filters.categoryId === 'all' || 
          task.categoryIds.includes(filters.categoryId);
        const matchesSearch = !filters.search || 
          task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(filters.search.toLowerCase()));
        
        return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
      }).sort((a, b) => {
        switch (filters.sortBy) {
          case 'dueDate':
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          case 'createdAt':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
    };
  }, [tasks]);

  const getTaskStats = useMemo(() => {
    return () => {
      const total = tasks.length;
      const completed = tasks.filter(task => task.status === 'completed').length;
      const pending = tasks.filter(task => task.status === 'todo').length;
      const inProgress = tasks.filter(task => task.status === 'in_progress').length;
      
      const today = new Date().toISOString().split('T')[0];
      const completedToday = tasks.filter(task => 
        task.status === 'completed' && 
        task.updatedAt.split('T')[0] === today
      ).length;
      
      const overdue = tasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) < new Date() && 
        task.status !== 'completed'
      ).length;

      const todayTasks = tasks.filter(task => 
        task.dueDate && 
        task.dueDate === today &&
        task.status !== 'completed'
      ).length;

      return { total, completed, pending, inProgress, completedToday, overdue, todayTasks };
    };
  }, [tasks]);

  const isTaskOverdue = (task: Task): boolean => {
    return Boolean(
      task.dueDate && 
      new Date(task.dueDate) < new Date() && 
      task.status !== 'completed'
    );
  };

  const isTaskDueToday = (task: Task): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return Boolean(task.dueDate && task.dueDate === today);
  };

  const getCategoriesWithTaskCount = useMemo(() => {
    return (): (Category & { taskCount: number })[] => {
      return categories.map(category => ({
        ...category,
        taskCount: tasks.filter(task => 
          task.categoryIds.includes(category.id)
        ).length
      }));
    };
  }, [categories, tasks]);

  const refreshData = async () => {
    await Promise.all([
      refetchTasks(),
      refetchCategories(),
      refetchStats(),
    ]);
  };

  return {
    // Data
    tasks,
    categories,
    user,
    taskStats,
    loading,
    
    // Mutations
    createTask,
    updateTask,
    deleteTask,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Utilities
    getFilteredTasks,
    getTaskStats,
    getCategoriesWithTaskCount,
    isTaskOverdue,
    isTaskDueToday,
    refreshData,
  };
};