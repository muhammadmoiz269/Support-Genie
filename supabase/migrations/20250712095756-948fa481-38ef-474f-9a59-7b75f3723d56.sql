
-- Create a table to store category-responsible users
CREATE TABLE public.category_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table to link users with categories they're responsible for
CREATE TABLE public.user_category_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.category_users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.category_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_category_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for category_users table
CREATE POLICY "Anyone can view category users" 
  ON public.category_users 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create category users" 
  ON public.category_users 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update category users" 
  ON public.category_users 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete category users" 
  ON public.category_users 
  FOR DELETE 
  USING (true);

-- Create policies for user_category_assignments table
CREATE POLICY "Anyone can view user category assignments" 
  ON public.user_category_assignments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create user category assignments" 
  ON public.user_category_assignments 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update user category assignments" 
  ON public.user_category_assignments 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete user category assignments" 
  ON public.user_category_assignments 
  FOR DELETE 
  USING (true);
