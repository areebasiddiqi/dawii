-- Create script_assignments table for Many-to-Many relationship
CREATE TABLE IF NOT EXISTS script_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    script_id BIGINT REFERENCES scripts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(script_id, user_id) -- Prevent duplicate assignments
);

-- Optional: Migrate existing data from assigned_user_id if you used it
-- INSERT INTO script_assignments (script_id, user_id)
-- SELECT id, assigned_user_id FROM scripts WHERE assigned_user_id IS NOT NULL;

-- Remove old column (clean up later)
-- ALTER TABLE scripts DROP COLUMN assigned_user_id;

-- Enable RLS
ALTER TABLE script_assignments ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Admins can do everything (assuming you have admin check, otherwise standard allow all for now or check role)
-- CREATE POLICY "Admins can manage assignments" ON script_assignments FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- 2. Users can view their own assignments
CREATE POLICY "Users can view their assignments" ON script_assignments FOR SELECT USING (auth.uid() = user_id);
