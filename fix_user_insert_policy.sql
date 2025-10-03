CREATE POLICY "Users can insert their own user." ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
