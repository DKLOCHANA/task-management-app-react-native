import { supabase } from '../../lib/supabase';

// Use same dummy user ID as original implementation
const DUMMY_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

export const userResolvers = {
  Query: {
    // Get current user
    user: async () => {
      return {
        id: DUMMY_USER_ID,
        email: 'demo@taskmaster.com'
      };
    },

    // Get all tasks for current user
    tasks: async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            task_categories(category_id)
          `)
          .eq('user_id', DUMMY_USER_ID)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          return [];
        }

        return data?.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || null,
          status: task.status,
          priority: task.priority,
          dueDate: task.due_date || null,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          categoryIds: task.task_categories?.map((tc: any) => tc.category_id) || []
        })) || [];
      } catch (err) {
        console.error('Error fetching tasks:', err);
        return [];
      }
    },

    // Get user's categories
    categories: async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', DUMMY_USER_ID)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Supabase error:', error);
          return [];
        }

        return data?.map(cat => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          createdAt: cat.created_at
        })) || [];
      } catch (err) {
        console.error('Error fetching categories:', err);
        return [];
      }
    },

    // Get task statistics (matching original implementation)
    taskStats: async () => {
      try {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('status, due_date, updated_at')
          .eq('user_id', DUMMY_USER_ID);

        if (error) {
          console.error('Supabase error:', error);
          return {
            total: 0,
            completed: 0,
            pending: 0,
            inProgress: 0,
            completedToday: 0,
            overdue: 0,
            todayTasks: 0,
          };
        }

        const total = tasks?.length || 0;
        const completed = tasks?.filter(task => task.status === 'completed').length || 0;
        const pending = tasks?.filter(task => task.status === 'todo').length || 0;
        const inProgress = tasks?.filter(task => task.status === 'in_progress').length || 0;
        
        const today = new Date().toISOString().split('T')[0];
        const completedToday = tasks?.filter(task => 
          task.status === 'completed' && 
          task.updated_at?.split('T')[0] === today
        ).length || 0;
        
        const overdue = tasks?.filter(task => 
          task.due_date && 
          new Date(task.due_date) < new Date() && 
          task.status !== 'completed'
        ).length || 0;

        const todayTasks = tasks?.filter(task => 
          task.due_date && 
          task.due_date === today &&
          task.status !== 'completed'
        ).length || 0;

        return { total, completed, pending, inProgress, completedToday, overdue, todayTasks };
      } catch (err) {
        console.error('Error fetching task stats:', err);
        return {
          total: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
          completedToday: 0,
          overdue: 0,
          todayTasks: 0,
        };
      }
    },
  },

  Mutation: {
    // Create task (matching original implementation)
    createTask: async (_: any, { input }: { input: any }) => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            title: input.title,
            description: input.description || null,
            priority: input.priority,
            due_date: input.dueDate || null,
            user_id: DUMMY_USER_ID
          })
          .select()
          .single();

        if (error) throw error;

        // Handle category associations
        if (input.categoryIds && input.categoryIds.length > 0) {
          const categoryInserts = input.categoryIds.map((categoryId: string) => ({
            task_id: data.id,
            category_id: categoryId
          }));

          const { error: categoryError } = await supabase
            .from('task_categories')
            .insert(categoryInserts);

          if (categoryError) throw categoryError;
        }

        return {
          id: data.id,
          title: data.title,
          description: data.description || null,
          status: data.status,
          priority: data.priority,
          dueDate: data.due_date || null,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          categoryIds: input.categoryIds || []
        };
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      }
    },

    // Update task
    updateTask: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .update({
            title: input.title,
            description: input.description,
            status: input.status,
            priority: input.priority,
            due_date: input.dueDate
          })
          .eq('id', id)
          .eq('user_id', DUMMY_USER_ID)
          .select()
          .single();

        if (error) throw error;

        // Get current categoryIds
        const { data: taskCategories } = await supabase
          .from('task_categories')
          .select('category_id')
          .eq('task_id', id);

        return {
          id: data.id,
          title: data.title,
          description: data.description || null,
          status: data.status,
          priority: data.priority,
          dueDate: data.due_date || null,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          categoryIds: taskCategories?.map(tc => tc.category_id) || []
        };
      } catch (error) {
        console.error('Error updating task:', error);
        throw error;
      }
    },

    // Delete task
    deleteTask: async (_: any, { id }: { id: string }) => {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id)
          .eq('user_id', DUMMY_USER_ID);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error deleting task:', error);
        return false;
      }
    },

    // Create category
    createCategory: async (_: any, { input }: { input: any }) => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: input.name,
            color: input.color,
            user_id: DUMMY_USER_ID
          })
          .select()
          .single();

        if (error) throw error;

        return {
          id: data.id,
          name: data.name,
          color: data.color,
          createdAt: data.created_at
        };
      } catch (error) {
        console.error('Error creating category:', error);
        throw error;
      }
    },

    // Update category
    updateCategory: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .update({
            name: input.name,
            color: input.color
          })
          .eq('id', id)
          .eq('user_id', DUMMY_USER_ID)
          .select()
          .single();

        if (error) throw error;

        return {
          id: data.id,
          name: data.name,
          color: data.color,
          createdAt: data.created_at
        };
      } catch (error) {
        console.error('Error updating category:', error);
        throw error;
      }
    },

    // Delete category
    deleteCategory: async (_: any, { id }: { id: string }) => {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id)
          .eq('user_id', DUMMY_USER_ID);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error deleting category:', error);
        return false;
      }
    },
  },
};