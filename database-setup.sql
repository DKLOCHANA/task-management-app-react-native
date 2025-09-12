-- Task Management App - Database Schema
-- Supabase PostgreSQL Setup Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo' NOT NULL,
  priority task_priority DEFAULT 'medium' NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6' NOT NULL, -- Default blue color
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Ensure unique category names per user
  UNIQUE(name, user_id)
);

-- Task categories junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS task_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Ensure unique task-category pairs
  UNIQUE(task_id, category_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_task_categories_task_id ON task_categories(task_id);
CREATE INDEX IF NOT EXISTS idx_task_categories_category_id ON task_categories(category_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for tasks
CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Users can only see their own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Users can only see their own categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Task categories policies
CREATE POLICY "Users can only see task_categories for their tasks" ON task_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_categories.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert task_categories for their tasks" ON task_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_categories.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update task_categories for their tasks" ON task_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_categories.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete task_categories for their tasks" ON task_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_categories.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

-- Views for common queries
CREATE OR REPLACE VIEW task_stats AS
SELECT 
  user_id,
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
  COUNT(*) FILTER (WHERE status = 'todo') as todo_tasks,
  COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'completed') as overdue_tasks,
  COUNT(*) FILTER (WHERE DATE(due_date) = CURRENT_DATE AND status != 'completed') as due_today_tasks,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)) * 100, 1)
    ELSE 0 
  END as completion_rate
FROM tasks
GROUP BY user_id;

-- Function to get tasks with categories
CREATE OR REPLACE FUNCTION get_tasks_with_categories(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  description TEXT,
  status task_status,
  priority task_priority,
  due_date TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  categories JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date,
    t.user_id,
    t.created_at,
    t.updated_at,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'color', c.color
        )
      ) FILTER (WHERE c.id IS NOT NULL),
      '[]'::jsonb
    ) as categories
  FROM tasks t
  LEFT JOIN task_categories tc ON t.id = tc.task_id
  LEFT JOIN categories c ON tc.category_id = c.id
  WHERE t.user_id = user_uuid
  GROUP BY t.id, t.title, t.description, t.status, t.priority, t.due_date, t.user_id, t.created_at, t.updated_at
  ORDER BY t.created_at DESC;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert sample data (optional - for development)
-- Note: This requires actual user IDs from auth.users table
-- Uncomment and modify with real user IDs for demo purposes

/*
-- Sample categories
INSERT INTO categories (name, color, user_id) VALUES
  ('Work', '#EF4444', 'user-id-here'),
  ('Personal', '#3B82F6', 'user-id-here'),
  ('Shopping', '#10B981', 'user-id-here'),
  ('Health', '#F59E0B', 'user-id-here'),
  ('Learning', '#8B5CF6', 'user-id-here');

-- Sample tasks
INSERT INTO tasks (title, description, status, priority, due_date, user_id) VALUES
  ('Complete project documentation', 'Write comprehensive README and API documentation', 'in_progress', 'high', NOW() + INTERVAL '2 days', 'user-id-here'),
  ('Weekly grocery shopping', 'Buy vegetables, fruits, and essentials', 'todo', 'medium', NOW() + INTERVAL '1 day', 'user-id-here'),
  ('Morning workout', 'Complete 30-minute cardio session', 'completed', 'low', NOW() - INTERVAL '1 day', 'user-id-here'),
  ('Review code changes', 'Review pull requests from team members', 'todo', 'high', NOW() + INTERVAL '3 hours', 'user-id-here'),
  ('Learn GraphQL subscriptions', 'Study real-time GraphQL implementation', 'in_progress', 'medium', NOW() + INTERVAL '1 week', 'user-id-here');
*/