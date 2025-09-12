import { supabase } from '../../lib/supabase';

// Hardcoded user for simplicity
const HARDCODED_USER = {
  id: '12345678-1234-1234-1234-123456789012',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: null,
  createdAt: new Date().toISOString(),
};

interface CreateCategoryInput {
  name: string;
  color?: string;
}

interface UpdateCategoryInput {
  name?: string;
  color?: string;
}

export const categoryResolvers = {
  Mutation: {
    // Create new category
    createCategory: async (_: any, { input }: { input: CreateCategoryInput }) => {
      const { data: category, error } = await supabase
        .from('categories')
        .insert([
          {
            name: input.name,
            color: input.color || '#3B82F6',
            user_id: HARDCODED_USER.id,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create category: ${error.message}`);
      }

      return {
        ...category,
        user: HARDCODED_USER,
        tasks: [],
        createdAt: category.created_at,
      };
    },

    // Update existing category
    updateCategory: async (_: any, { id, input }: { id: string; input: UpdateCategoryInput }) => {
      const updateData: any = {};
      
      if (input.name !== undefined) updateData.name = input.name;
      if (input.color !== undefined) updateData.color = input.color;

      const { data: category, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', HARDCODED_USER.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update category: ${error.message}`);
      }

      return {
        ...category,
        user: HARDCODED_USER,
        tasks: [],
        createdAt: category.created_at,
      };
    },

    // Delete category
    deleteCategory: async (_: any, { id }: { id: string }) => {
      // First, remove category associations
      await supabase
        .from('task_categories')
        .delete()
        .eq('category_id', id);

      // Then delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', HARDCODED_USER.id);

      if (error) {
        throw new Error(`Failed to delete category: ${error.message}`);
      }

      return true;
    },
  },

  // Category field resolvers
  Category: {
    user: () => HARDCODED_USER,
    tasks: async (category: any) => {
      const { data: tasks, error } = await supabase
        .from('task_categories')
        .select(`
          tasks (*)
        `)
        .eq('category_id', category.id);

      if (error) {
        console.error('Failed to fetch category tasks:', error);
        return [];
      }

      return tasks?.map((tc: any) => ({
        ...tc.tasks,
        user: HARDCODED_USER,
        categories: [],
        createdAt: tc.tasks.created_at,
        updatedAt: tc.tasks.updated_at,
        dueDate: tc.tasks.due_date,
      })) || [];
    },
  },
};