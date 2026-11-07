-- Migration: 20261107000002_custom_access_token_hook.sql
-- Description: Custom Access Token Hook to inject user_role into JWT claims

-- Helper function to fetch the role of a user
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.user_roles WHERE user_id = p_user_id LIMIT 1;
$$;

-- Supabase Custom Access Token Hook
-- Supabase Auth executes this function before minting the JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    claims JSONB;
    user_role TEXT;
    target_user_id UUID;
BEGIN
    target_user_id := (event->>'user_id')::UUID;
    
    -- Lookup the assigned role from user_roles table
    SELECT role INTO user_role 
    FROM public.user_roles 
    WHERE user_id = target_user_id 
    LIMIT 1;

    -- Default to 'employee' if no explicit role has been assigned
    IF user_role IS NULL THEN
        user_role := 'employee';
    END IF;

    claims := event->'claims';
    -- Inject user_role into claims
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    
    -- Reassign claims to event payload
    event := jsonb_set(event, '{claims}', claims);
    
    RETURN event;
END;
$$;

-- Permissions for the auth hook
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(JSONB) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(JSONB) FROM authenticated, anon, public;

