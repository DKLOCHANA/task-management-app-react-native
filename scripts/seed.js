const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- EXPO_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Demo user data
const demoUsers = [
  {
    email: 'demo@taskapp.com',
    password: 'demo123456',
    name: 'Demo User'
  },
  {
    email: 'john@taskapp.com',
    password: 'demo123456',
    name: 'John Doe'
  },
  {
    email: 'jane@taskapp.com',
    password: 'demo123456',
    name: 'Jane Smith'
  }
];

// Sample categories with colors
const categories = [
  { name: 'Work', color: '#EF4444' },      // Red
  { name: 'Personal', color: '#3B82F6' },  // Blue
  { name: 'Shopping', color: '#10B981' },  // Green
  { name: 'Health', color: '#F59E0B' },    // Amber
  { name: 'Learning', color: '#8B5CF6' },  // Purple
  { name: 'Travel', color: '#06B6D4' },    // Cyan
  { name: 'Finance', color: '#84CC16' },   // Lime
  { name: 'Hobbies', color: '#F97316' }    // Orange
];

// Sample tasks with various scenarios
const tasks = [
  // High priority, overdue
  {
    title: 'Submit quarterly report',
    description: 'Compile and submit Q3 financial report to management',
    status: 'in_progress',
    priority: 'high',
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    categories: ['Work']
  },
  
  // Due today
  {
    title: 'Doctor appointment',
    description: 'Annual health checkup with Dr. Smith',
    status: 'todo',
    priority: 'high',
    due_date: new Date(), // Today
    categories: ['Health']
  },
  
  // High priority, upcoming
  {
    title: 'Client presentation',
    description: 'Present new product features to key client',
    status: 'todo',
    priority: 'high',
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    categories: ['Work']
  },
  
  // Completed tasks
  {
    title: 'Weekly grocery shopping',
    description: 'Buy vegetables, fruits, dairy, and household essentials',
    status: 'completed',
    priority: 'medium',
    due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    categories: ['Shopping', 'Personal']
  },
  
  {
    title: 'Morning workout',
    description: 'Complete 45-minute cardio and strength training session',
    status: 'completed',
    priority: 'medium',
    due_date: new Date(),
    categories: ['Health', 'Personal']
  },
  
  // In progress tasks
  {
    title: 'Learn GraphQL subscriptions',
    description: 'Study real-time GraphQL implementation and best practices',
    status: 'in_progress',
    priority: 'medium',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    categories: ['Learning', 'Work']
  },
  
  {
    title: 'Plan weekend getaway',
    description: 'Research destinations, book accommodation, and create itinerary',
    status: 'in_progress',
    priority: 'low',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    categories: ['Travel', 'Personal']
  },
  
  // Todo tasks with various priorities
  {
    title: 'Review investment portfolio',
    description: 'Analyze current investments and rebalance if necessary',
    status: 'todo',
    priority: 'medium',
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    categories: ['Finance', 'Personal']
  },
  
  {
    title: 'Update personal website',
    description: 'Add recent projects and update portfolio section',
    status: 'todo',
    priority: 'low',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    categories: ['Personal', 'Learning']
  },
  
  {
    title: 'Organize photo collection',
    description: 'Sort and organize digital photos from last year',
    status: 'todo',
    priority: 'low',
    due_date: null, // No due date
    categories: ['Personal', 'Hobbies']
  },
  
  // More varied scenarios
  {
    title: 'Code review for new feature',
    description: 'Review pull request for user authentication feature',
    status: 'todo',
    priority: 'high',
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    categories: ['Work']
  },
  
  {
    title: 'Buy birthday gift',
    description: 'Find and purchase birthday gift for mom',
    status: 'todo',
    priority: 'medium',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    categories: ['Shopping', 'Personal']
  },
  
  {
    title: 'Practice guitar',
    description: 'Practice new song for 30 minutes',
    status: 'in_progress',
    priority: 'low',
    due_date: null,
    categories: ['Hobbies', 'Personal']
  },
  
  {
    title: 'Meal prep for week',
    description: 'Prepare healthy meals for the upcoming week',
    status: 'todo',
    priority: 'medium',
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    categories: ['Health', 'Personal']
  },
  
  {
    title: 'Complete online course',
    description: 'Finish React Native advanced concepts course',
    status: 'in_progress',
    priority: 'medium',
    due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
    categories: ['Learning', 'Work']
  }
];

async function createDemoUsers() {
  console.log('Creating demo users...');
  const createdUsers = [];
  
  for (const userData of demoUsers) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          name: userData.name
        }
      });
      
      if (error) {
        console.error(`Error creating user ${userData.email}:`, error.message);
        continue;
      }
      
      if (data.user) {
        createdUsers.push({
          id: data.user.id,
          email: userData.email,
          name: userData.name
        });
        console.log(`✓ Created user: ${userData.email}`);
      }
    } catch (error) {
      console.error(`Exception creating user ${userData.email}:`, error.message);
    }
  }
  
  return createdUsers;
}

async function createCategories(userId) {
  console.log(`Creating categories for user ${userId}...`);
  const createdCategories = [];
  
  for (const categoryData of categories) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            name: categoryData.name,
            color: categoryData.color,
            user_id: userId
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error(`Error creating category ${categoryData.name}:`, error.message);
        continue;
      }
      
      createdCategories.push(data);
      console.log(`✓ Created category: ${categoryData.name}`);
    } catch (error) {
      console.error(`Exception creating category ${categoryData.name}:`, error.message);
    }
  }
  
  return createdCategories;
}

async function createTasks(userId, userCategories) {
  console.log(`Creating tasks for user ${userId}...`);
  
  // Create a map of category names to IDs
  const categoryMap = userCategories.reduce((map, cat) => {
    map[cat.name] = cat.id;
    return map;
  }, {});
  
  for (const taskData of tasks) {
    try {
      // Create the task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert([
          {
            title: taskData.title,
            description: taskData.description,
            status: taskData.status,
            priority: taskData.priority,
            due_date: taskData.due_date,
            user_id: userId
          }
        ])
        .select()
        .single();
      
      if (taskError) {
        console.error(`Error creating task ${taskData.title}:`, taskError.message);
        continue;
      }
      
      // Associate task with categories
      if (taskData.categories && taskData.categories.length > 0) {
        const taskCategoryInserts = taskData.categories
          .filter(catName => categoryMap[catName])
          .map(catName => ({
            task_id: task.id,
            category_id: categoryMap[catName]
          }));
        
        if (taskCategoryInserts.length > 0) {
          const { error: tcError } = await supabase
            .from('task_categories')
            .insert(taskCategoryInserts);
          
          if (tcError) {
            console.error(`Error associating categories for task ${taskData.title}:`, tcError.message);
          }
        }
      }
      
      console.log(`✓ Created task: ${taskData.title}`);
    } catch (error) {
      console.error(`Exception creating task ${taskData.title}:`, error.message);
    }
  }
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    // Create demo users
    const users = await createDemoUsers();
    
    if (users.length === 0) {
      console.error('❌ No users were created. Exiting...');
      return;
    }
    
    console.log(`\n✓ Created ${users.length} demo users\n`);
    
    // For each user, create categories and tasks
    for (const user of users) {
      console.log(`\n--- Setting up data for ${user.email} ---`);
      
      // Create categories
      const userCategories = await createCategories(user.id);
      console.log(`✓ Created ${userCategories.length} categories`);
      
      // Create tasks
      await createTasks(user.id, userCategories);
      console.log(`✓ Created tasks with various scenarios`);
    }
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Data Summary:');
    console.log(`- ${users.length} demo users created`);
    console.log(`- ${categories.length} categories per user`);
    console.log(`- ${tasks.length} tasks per user with various scenarios:`);
    console.log('  • Overdue tasks');
    console.log('  • Tasks due today');
    console.log('  • Upcoming tasks');
    console.log('  • Completed tasks');
    console.log('  • In-progress tasks');
    console.log('  • Tasks with multiple categories');
    console.log('  • Tasks with different priorities');
    
    console.log('\n🔐 Demo Login Credentials:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}, Password: demo123456`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };