-- Add personal data columns to votes table
ALTER TABLE public.votes 
ADD COLUMN full_name TEXT,
ADD COLUMN email TEXT,
ADD COLUMN phone TEXT,
ADD COLUMN address TEXT;