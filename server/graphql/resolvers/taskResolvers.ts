import { supabase } from '../../lib/supabase';

// Hardcoded user for simplicity
const HARDCODED_USER = {
  id: '12345678-1234-1234-1234-123456789012',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: null,
  createdAt: new Date().toISOString(),
};

interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  categoryIds?: string[];
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}

export const taskResolvers = {
  Query: {
    // Get single task by ID
    task: async (_: any, { id }: { id: string }) => {
      const { data: task, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_categories (
            categories (*)
          )
        `)
        .eq('id', id)
        .eq('user_id', HARDCODED_USER.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch task: ${error.message}`);
      }

      if (!task) return null;

      return {
        ...task,
        user: HARDCODED_USER,
        categories: task.task_categories?.map((tc: any) => tc.categories) || [],
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        dueDate: task.due_date,
      };
    },
  },

  Mutation: {
    // Create new task
    createTask: async (_: any, { input }: { input: CreateTaskInput }) => {
      const { data: task, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: input.title,
            description: input.description,
            status: 'TODO',
            priority: input.priority || 'MEDIUM',
            due_date: input.dueDate,
            user_id: HARDCODED_USER.id,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create task: ${error.message}`);
      }

      // Handle category associations
      if (input.categoryIds && input.categoryIds.length > 0) {
        const categoryAssociations = input.categoryIds.map(categoryId => ({
          task_id: task.id,
          category_id: categoryId,
        }));

        const { error: categoryError } = await supabase
          .from('task_categories')
          .insert(categoryAssociations);

        if (categoryError) {
          console.error('Failed to associate categories:', categoryError);
        }
      }

      // Fetch the created task with categories
      const { data: createdTask, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          task_categories (
            categories (*)
          )
        `)
        .eq('id', task.id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch created task: ${fetchError.message}`);
      }

      return {
        ...createdTask,
        user: HARDCODED_USER,
        categories: createdTask.task_categories?.map((tc: any) => tc.categories) || [],
        createdAt: createdTask.created_at,
        updatedAt: createdTask.updated_at,
        dueDate: createdTask.due_date,
      };
    },

    // Update existing task
    updateTask: async (_: any, { id, input }: { id: string; input: UpdateTaskInput }) => {
      const updateData: any = {};
      
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.dueDate !== undefined) updateData.due_date = input.dueDate;
      
      updateData.updated_at = new Date().toISOString();

      const { data: task, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', HARDCODED_USER.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update task: ${error.message}`);
      }

      // Fetch the updated task with categories
      const { data: updatedTask, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          task_categories (
            categories (*)
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch updated task: ${fetchError.message}`);
      }

      return {
        ...updatedTask,
        user: HARDCODED_USER,
        categories: updatedTask.task_categories?.map((tc: any) => tc.categories) || [],
        createdAt: updatedTask.created_at,
        updatedAt: updatedTask.updated_at,
        dueDate: updatedTask.due_date,
      };
    },

    // Delete task
    deleteTask: async (_: any, { id }: { id: string }) => {
      // First, remove category associations
      await supabase
        .from('task_categories')
        .delete()
        .eq('task_id', id);

      // Then delete the task
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', HARDCODED_USER.id);

      if (error) {
        throw new Error(`Failed to delete task: ${error.message}`);
      }

      return true;
    },

    // Add task to category
    addTaskToCategory: async (_: any, { taskId, categoryId }: { taskId: string; categoryId: string }) => {
      // Insert the relationship
      const { error } = await supabase
        .from('task_categories')
        .insert([{ task_id: taskId, category_id: categoryId }]);

      if (error) {
        throw new Error(`Failed to add task to category: ${error.message}`);
      }

      // Fetch and return the updated task
      const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          task_categories (
            categories (*)
          )
        `)
        .eq('id', taskId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch updated task: ${fetchError.message}`);
      }

      return {
        ...task,
        user: HARDCODED_USER,
        categories: task.task_categories?.map((tc: any) => tc.categories) || [],
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        dueDate: task.due_date,
      };
    },

    // Remove task from category
    removeTaskFromCategory: async (_: any, { taskId, categoryId }: { taskId: string; categoryId: string }) => {
      // Delete the relationship
      const { error } = await supabase
        .from('task_categories')
        .delete()
        .eq('task_id', taskId)
        .eq('category_id', categoryId);

      if (error) {
        throw new Error(`Failed to remove task from category: ${error.message}`);
      }

      // Fetch and return the updated task
      const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          task_categories (
            categories (*)
          )
        `)
        .eq('id', taskId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch updated task: ${fetchError.message}`);
      }

      return {
        ...task,
        user: HARDCODED_USER,
        categories: task.task_categories?.map((tc: any) => tc.categories) || [],
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        dueDate: task.due_date,
      };
    },
  },

  // Task field resolvers
  Task: {
    user: () => HARDCODED_USER,
    categories: async (task: any) => {
      const { data: categories, error } = await supabase
        .from('task_categories')
        .select(`
          categories (*)
        `)
        .eq('task_id', task.id);

      if (error) {
        console.error('Failed to fetch task categories:', error);
        return [];
      }

      return categories?.map((tc: any) => ({
        ...tc.categories,
        user: HARDCODED_USER,
        tasks: [],
        createdAt: tc.categories.created_at,
      })) || [];
    },
  },
};