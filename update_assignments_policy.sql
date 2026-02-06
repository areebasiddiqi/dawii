-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view their assignments" ON script_assignments;

-- Create a permissive policy so users can see if a script is assigned to SOMEONE else
-- This is necessary to distinguish "Unassigned" (visible to all) vs "Assigned to Other" (hidden)
CREATE POLICY "Users can view all assignments" ON script_assignments FOR SELECT TO authenticated USING (true);
