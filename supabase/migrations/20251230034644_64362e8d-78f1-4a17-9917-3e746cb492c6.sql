-- Create contacts table (people you share expenses with)
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for contacts
CREATE POLICY "Users can view their own contacts"
ON public.contacts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts"
ON public.contacts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
ON public.contacts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
ON public.contacts FOR DELETE
USING (auth.uid() = user_id);

-- Create debts table (debt transactions)
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL DEFAULT 'lend', -- 'lend' = họ nợ mình, 'borrow' = mình nợ họ
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- RLS policies for debts
CREATE POLICY "Users can view their own debts"
ON public.debts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts"
ON public.debts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts"
ON public.debts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts"
ON public.debts FOR DELETE
USING (auth.uid() = user_id);