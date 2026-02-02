-- Add termination_comment column to dining_sessions
ALTER TABLE public.dining_sessions 
ADD COLUMN termination_comment text DEFAULT NULL;

-- Add terminated_at column to track when session was terminated by admin
ALTER TABLE public.dining_sessions 
ADD COLUMN terminated_at timestamp with time zone DEFAULT NULL;

-- Add terminated_by column to track who terminated the session
ALTER TABLE public.dining_sessions 
ADD COLUMN terminated_by text DEFAULT NULL;