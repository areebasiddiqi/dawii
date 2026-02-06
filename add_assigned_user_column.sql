-- 1. If you haven't added the column yet:
ALTER TABLE scripts 
ADD COLUMN assigned_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. If you ALREADY added the column referencing auth.users, drop the constraint and add a new one to profiles:
-- ALTER TABLE scripts DROP CONSTRAINT scripts_assigned_user_id_fkey; -- Name might vary
-- ALTER TABLE scripts 
-- ADD CONSTRAINT fk_scripts_profiles 
-- FOREIGN KEY (assigned_user_id) 
-- REFERENCES public.profiles(id);

-- NOTE: Reference public.profiles(id) so that Supabase can detect the relationship for:
-- .select('*, profiles(full_name, email)')
