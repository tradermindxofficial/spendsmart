import { createClient } from '@supabase/supabase-js';

// Types definition
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string; // YYYY-MM-DD
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  subscription_status: string;
}

// Check for Supabase Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url');

// Helper to check if window is available (client-side)
const isClient = typeof window !== 'undefined';

export let dbMode: 'supabase' | 'demo' = isSupabaseConfigured ? 'supabase' : 'demo';
if (isClient && localStorage.getItem('demo_mode') === 'true') {
  dbMode = 'demo';
}

// Initialize Supabase Client if configured
export const supabaseClient = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Initial Default Categories Data
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Food', type: 'expense', icon: 'Utensils', color: '#EF4444' },
  { id: 'c2', name: 'Transport', type: 'expense', icon: 'Car', color: '#F59E0B' },
  { id: 'c3', name: 'Rent', type: 'expense', icon: 'Home', color: '#3B82F6' },
  { id: 'c4', name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#EC4899' },
  { id: 'c5', name: 'Entertainment', type: 'expense', icon: 'Film', color: '#8B5CF6' },
  { id: 'c6', name: 'Health', type: 'expense', icon: 'HeartPulse', color: '#10B981' },
  { id: 'c7', name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#6366F1' },
  { id: 'c8', name: 'Other', type: 'expense', icon: 'HelpCircle', color: '#6B7280' },
  { id: 'c9', name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10B981' },
  { id: 'c10', name: 'Freelance', type: 'income', icon: 'Laptop', color: '#3B82F6' },
  { id: 'c11', name: 'Business', type: 'income', icon: 'TrendingUp', color: '#F59E0B' },
  { id: 'c12', name: 'Investment', type: 'income', icon: 'Percent', color: '#8B5CF6' },
  { id: 'c13', name: 'Other', type: 'income', icon: 'Coins', color: '#6B7280' },
];

// LocalStorage helpers for Demo Mode
const demoStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (!isClient) return defaultValue;
    const data = localStorage.getItem(`spendsmart_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: <T>(key: string, value: T): void => {
    if (isClient) {
      localStorage.setItem(`spendsmart_${key}`, JSON.stringify(value));
    }
  }
};

// Seed initial Demo Data if empty
if (isClient && dbMode === 'demo') {
  if (!localStorage.getItem('spendsmart_categories')) {
    demoStorage.set('categories', DEFAULT_CATEGORIES);
  }
  // Optional: Seed a few sample transactions and goals to make the dashboard look beautiful immediately
  if (!localStorage.getItem('spendsmart_transactions')) {
    const today = new Date();
    const subDays = (days: number) => {
      const d = new Date();
      d.setDate(today.getDate() - days);
      return d.toISOString().split('T')[0];
    };
    
    demoStorage.set('transactions', [
      {
        id: 't1',
        user_id: 'demo-user',
        type: 'income',
        amount: 85000,
        category: 'Salary',
        description: 'Monthly paycheck',
        date: subDays(15),
        created_at: new Date().toISOString()
      },
      {
        id: 't2',
        user_id: 'demo-user',
        type: 'expense',
        amount: 15000,
        category: 'Rent',
        description: 'Apartment rent',
        date: subDays(14),
        created_at: new Date().toISOString()
      },
      {
        id: 't3',
        user_id: 'demo-user',
        type: 'expense',
        amount: 2500,
        category: 'Food',
        description: 'Grocery shopping',
        date: subDays(5),
        created_at: new Date().toISOString()
      },
      {
        id: 't4',
        user_id: 'demo-user',
        type: 'expense',
        amount: 1200,
        category: 'Transport',
        description: 'Fuel refill',
        date: subDays(2),
        created_at: new Date().toISOString()
      },
      {
        id: 't5',
        user_id: 'demo-user',
        type: 'income',
        amount: 12000,
        category: 'Freelance',
        description: 'Logo design project',
        date: subDays(1),
        created_at: new Date().toISOString()
      },
      {
        id: 't6',
        user_id: 'demo-user',
        type: 'expense',
        amount: 4500,
        category: 'Shopping',
        description: 'New running shoes',
        date: subDays(0),
        created_at: new Date().toISOString()
      }
    ]);
  }
  
  if (!localStorage.getItem('spendsmart_goals')) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 3);
    const deadline = nextMonth.toISOString().split('T')[0];
    
    demoStorage.set('goals', [
      {
        id: 'g1',
        user_id: 'demo-user',
        name: 'Emergency Fund',
        target_amount: 50000,
        current_amount: 25000,
        deadline: deadline,
        created_at: new Date().toISOString()
      },
      {
        id: 'g2',
        user_id: 'demo-user',
        name: 'New Laptop',
        target_amount: 80000,
        current_amount: 48000,
        deadline: deadline,
        created_at: new Date().toISOString()
      }
    ]);
  }
  
  if (!localStorage.getItem('spendsmart_user')) {
    demoStorage.set('user', {
      id: 'demo-user',
      email: 'demo@spendsmart.com',
      subscription_status: 'pro'
    });
  }
}

// Unified Database API
export const db = {
  // Categories API
  async getCategories(): Promise<Category[]> {
    if (dbMode === 'supabase' && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('categories')
        .select('*');
      if (error) throw error;
      return data || [];
    } else {
      return demoStorage.get<Category[]>('categories', DEFAULT_CATEGORIES);
    }
  },

  // Transactions API
  async getTransactions(): Promise<Transaction[]> {
    if (dbMode === 'supabase' && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const list = demoStorage.get<Transaction[]>('transactions', []);
      return list.sort((a, b) => b.date.localeCompare(a.date));
    }
  },

  async addTransaction(transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> {
    const user = await auth.getCurrentUser();
    if (!user) throw new Error('Authentication required');

    if (dbMode === 'supabase' && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          date: transaction.date,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = demoStorage.get<Transaction[]>('transactions', []);
      const newTx: Transaction = {
        ...transaction,
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      demoStorage.set('transactions', [newTx, ...list]);
      return newTx;
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    if (dbMode === 'supabase' && supabaseClient) {
      const { error } = await supabaseClient
        .from('transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const list = demoStorage.get<Transaction[]>('transactions', []);
      demoStorage.set('transactions', list.filter(t => t.id !== id));
    }
  },

  // Goals API
  async getGoals(): Promise<Goal[]> {
    if (dbMode === 'supabase' && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return demoStorage.get<Goal[]>('goals', []);
    }
  },

  async addGoal(goal: Omit<Goal, 'id' | 'user_id' | 'created_at'>): Promise<Goal> {
    const user = await auth.getCurrentUser();
    if (!user) throw new Error('Authentication required');

    if (dbMode === 'supabase' && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('goals')
        .insert([{
          user_id: user.id,
          name: goal.name,
          target_amount: goal.target_amount,
          current_amount: goal.current_amount,
          deadline: goal.deadline
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = demoStorage.get<Goal[]>('goals', []);
      const newGoal: Goal = {
        ...goal,
        id: 'goal_' + Math.random().toString(36).substr(2, 9),
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      demoStorage.set('goals', [newGoal, ...list]);
      return newGoal;
    }
  },

  async updateGoalAmount(id: string, current_amount: number): Promise<void> {
    if (dbMode === 'supabase' && supabaseClient) {
      const { error } = await supabaseClient
        .from('goals')
        .update({ current_amount })
        .eq('id', id);
      if (error) throw error;
    } else {
      const list = demoStorage.get<Goal[]>('goals', []);
      const updated = list.map(g => g.id === id ? { ...g, current_amount } : g);
      demoStorage.set('goals', updated);
    }
  },

  async deleteGoal(id: string): Promise<void> {
    if (dbMode === 'supabase' && supabaseClient) {
      const { error } = await supabaseClient
        .from('goals')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const list = demoStorage.get<Goal[]>('goals', []);
      demoStorage.set('goals', list.filter(g => g.id !== id));
    }
  }
};

// Unified Auth API
export const auth = {
  async signUp(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    if (dbMode === 'supabase' && supabaseClient) {
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) return { user: null, error };
      if (!data.user) return { user: null, error: new Error('User not created') };
      return { 
        user: { id: data.user.id, email: data.user.email || '', subscription_status: 'free' },
        error: null 
      };
    } else {
      const mockUser: User = { id: 'demo-user', email, subscription_status: 'free' };
      demoStorage.set('user', mockUser);
      return { user: mockUser, error: null };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    if (dbMode === 'supabase' && supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) return { user: null, error };
      if (!data.user) return { user: null, error: new Error('No user returned') };
      
      // Fetch public profile to get subscription status
      const { data: profile } = await supabaseClient
        .from('users')
        .select('subscription_status')
        .eq('id', data.user.id)
        .single();

      return {
        user: { 
          id: data.user.id, 
          email: data.user.email || '', 
          subscription_status: profile?.subscription_status || 'free' 
        },
        error: null
      };
    } else {
      const mockUser: User = { id: 'demo-user', email, subscription_status: 'pro' };
      demoStorage.set('user', mockUser);
      return { user: mockUser, error: null };
    }
  },

  async signOut(): Promise<void> {
    if (isClient) {
      localStorage.removeItem('demo_mode');
    }
    
    if (dbMode === 'supabase' && supabaseClient) {
      await supabaseClient.auth.signOut();
    } else {
      if (isClient) {
        localStorage.removeItem('spendsmart_user');
      }
    }
  },

  async getCurrentUser(): Promise<User | null> {
    if (dbMode === 'supabase' && supabaseClient) {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return null;
      
      const { data: profile } = await supabaseClient
        .from('users')
        .select('subscription_status')
        .eq('id', user.id)
        .single();
        
      return {
        id: user.id,
        email: user.email || '',
        subscription_status: profile?.subscription_status || 'free'
      };
    } else {
      return demoStorage.get<User | null>('user', null);
    }
  },

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    if (dbMode === 'supabase' && supabaseClient) {
      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabaseClient
            .from('users')
            .select('subscription_status')
            .eq('id', session.user.id)
            .single();
          callback({
            id: session.user.id,
            email: session.user.email || '',
            subscription_status: profile?.subscription_status || 'free'
          });
        } else {
          callback(null);
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Mock listener using storage polling/checks or a simple callback invocation
      if (isClient) {
        const checkUser = () => {
          const user = demoStorage.get<User | null>('user', null);
          callback(user);
        };
        // Run immediately
        checkUser();
        // Set an interval to mimic real-time login status changes across windows
        const interval = setInterval(checkUser, 2000);
        return () => clearInterval(interval);
      }
      return () => {};
    }
  }
};
