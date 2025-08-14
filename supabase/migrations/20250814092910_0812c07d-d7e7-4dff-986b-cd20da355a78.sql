-- Fix security issue: Restrict profile access to authenticated users only
-- This prevents anonymous users from harvesting user data while maintaining
-- functionality for legitimate authenticated users

-- Drop the overly permissive policy
DROP POLICY "Profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Add a policy for anonymous users to only see their own profile during signup/auth flows
-- This ensures auth flows still work if needed
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO anon
USING (auth.uid() = id);