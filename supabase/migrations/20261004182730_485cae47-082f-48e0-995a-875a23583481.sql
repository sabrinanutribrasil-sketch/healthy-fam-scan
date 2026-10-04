ALTER FUNCTION public.has_active_subscription(uuid, text) SECURITY INVOKER;
REVOKE ALL ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_active_subscription(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO service_role;