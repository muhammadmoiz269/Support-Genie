
-- Create a support_tickets table to store WhatsApp messages that need manual review
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  customer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (for future authentication)
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read tickets (for now, you can restrict this later)
CREATE POLICY "Anyone can view support tickets" 
  ON public.support_tickets 
  FOR SELECT 
  USING (true);

-- Create a policy that allows anyone to insert tickets (for now, you can restrict this later)
CREATE POLICY "Anyone can create support tickets" 
  ON public.support_tickets 
  FOR INSERT 
  WITH CHECK (true);

-- Create a policy that allows anyone to update tickets (for now, you can restrict this later)
CREATE POLICY "Anyone can update support tickets" 
  ON public.support_tickets 
  FOR UPDATE 
  USING (true);

-- Function to detect if a message is task-related
CREATE OR REPLACE FUNCTION public.is_task_message(message_text TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Simple task detection logic - looks for task-related keywords
  RETURN (
    message_text ILIKE '%task%' OR
    message_text ILIKE '%todo%' OR
    message_text ILIKE '%need to%' OR
    message_text ILIKE '%schedule%' OR
    message_text ILIKE '%reminder%' OR
    message_text ILIKE '%meeting%' OR
    message_text ILIKE '%deadline%' OR
    message_text ILIKE '%complete%' OR
    message_text ILIKE '%finish%'
  );
END;
$$;
