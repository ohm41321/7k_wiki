-- Add author_id column to comments table for user reference
ALTER TABLE public.comments
ADD COLUMN author_id uuid REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX idx_comments_author_id ON public.comments(author_id);

-- Update existing comments to have author_id (this is optional and may not work for existing anonymous comments)
-- UPDATE public.comments SET author_id = NULL WHERE author_id IS NULL;