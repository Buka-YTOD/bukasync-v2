-- Enable REPLICA IDENTITY FULL to get complete old row data in realtime updates
ALTER TABLE public.session_members REPLICA IDENTITY FULL;