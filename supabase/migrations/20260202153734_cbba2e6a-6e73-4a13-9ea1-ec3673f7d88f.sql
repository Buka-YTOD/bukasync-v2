-- Drop the existing check constraint and add a new one that includes 'terminated'
ALTER TABLE public.dining_sessions DROP CONSTRAINT IF EXISTS dining_sessions_status_check;

ALTER TABLE public.dining_sessions ADD CONSTRAINT dining_sessions_status_check 
CHECK (status IN ('active', 'completed', 'terminated'));