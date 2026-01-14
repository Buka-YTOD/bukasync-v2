-- Drop the restrictive INSERT policy that's blocking new members from joining
DROP POLICY IF EXISTS "Anyone can join a session" ON public.session_members;

-- Recreate as a PERMISSIVE policy (default) so users can join sessions
CREATE POLICY "Anyone can join a session" 
ON public.session_members 
FOR INSERT 
WITH CHECK (
  -- Allow insert if the session exists and is active
  EXISTS (
    SELECT 1 FROM public.dining_sessions 
    WHERE id = session_id AND status = 'active'
  )
  -- And the device_token being inserted matches what's in the request header
  AND device_token = (current_setting('request.headers', true)::json->>'x-device-token')
);

-- Also need to add a DELETE policy for orders (dashboard needs to delete orders)
CREATE POLICY "Anyone can delete orders" 
ON public.orders 
FOR DELETE 
USING (true);