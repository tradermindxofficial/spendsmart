-- Create users table matching auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  subscription_status TEXT DEFAULT 'free' NOT NULL
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT NOT NULL, -- Lucide icon component name
  color TEXT NOT NULL, -- Hex code or CSS variable
  UNIQUE(name, type)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL, -- References categories(name)
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(12, 2) DEFAULT 0.00 NOT NULL CHECK (current_amount >= 0),
  deadline DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Set up RLS Policies

-- Users policy
CREATE POLICY "Users can view their own profile" ON public.users 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

-- Categories policy (visible to all logged-in users)
CREATE POLICY "Categories are readable by everyone" ON public.categories 
  FOR SELECT USING (true);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions 
  FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view their own goals" ON public.goals 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goals" ON public.goals 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.goals 
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for Automatic Profile Creation on Signup
-- Note: Make sure to execute this script in your Supabase SQL Editor
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, subscription_status)
  VALUES (new.id, new.email, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed Default Categories
INSERT INTO public.categories (name, type, icon, color) VALUES
  -- Expenses
  ('Food', 'expense', 'Utensils', '#EF4444'),
  ('Transport', 'expense', 'Car', '#F59E0B'),
  ('Rent', 'expense', 'Home', '#3B82F6'),
  ('Shopping', 'expense', 'ShoppingBag', '#EC4899'),
  ('Entertainment', 'expense', 'Film', '#8B5CF6'),
  ('Health', 'expense', 'HeartPulse', '#10B981'),
  ('Education', 'expense', 'GraduationCap', '#6366F1'),
  ('Other', 'expense', 'HelpCircle', '#6B7280'),
  -- Incomes
  ('Salary', 'income', 'Briefcase', '#10B981'),
  ('Freelance', 'income', 'Laptop', '#3B82F6'),
  ('Business', 'income', 'TrendingUp', '#F59E0B'),
  ('Investment', 'income', 'Percent', '#8B5CF6'),
  ('Other', 'income', 'Coins', '#6B7280')
ON CONFLICT (name, type) DO NOTHING;
