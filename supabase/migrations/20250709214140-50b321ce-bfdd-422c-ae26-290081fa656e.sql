-- Drop old RPC functions that don't filter by company_id
-- These are being replaced by the new versions that include p_user_id parameter

DROP FUNCTION IF EXISTS public.get_dashboard_metrics(date, date);
DROP FUNCTION IF EXISTS public.get_channel_metrics(date, date);
DROP FUNCTION IF EXISTS public.get_sales_chart_data(date, date);
DROP FUNCTION IF EXISTS public.get_channel_distribution(date, date);