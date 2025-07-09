-- Fix ROUND function type issues in dashboard RPC functions
-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_dashboard_metrics(uuid, date, date);
DROP FUNCTION IF EXISTS public.get_channel_metrics(uuid, date, date);
DROP FUNCTION IF EXISTS public.get_sales_chart_data(uuid, date, date);
DROP FUNCTION IF EXISTS public.get_channel_distribution(uuid, date, date);

-- Recreate get_dashboard_metrics with proper numeric casting
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(
    p_user_id uuid,
    p_start_date date,
    p_end_date date
)
RETURNS TABLE(
    order_revenue numeric,
    ad_spend numeric,
    mer numeric,
    aov numeric,
    orders bigint,
    contribution_margin numeric,
    margin_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_company_ids uuid[];
BEGIN
    -- Get user's company IDs
    SELECT ARRAY(
        SELECT DISTINCT company_id 
        FROM company_users 
        WHERE user_id = p_user_id
        UNION
        SELECT DISTINCT id 
        FROM companies 
        WHERE user_id = p_user_id
    ) INTO user_company_ids;

    RETURN QUERY
    SELECT 
        COALESCE(SUM(s.price), 0)::numeric as order_revenue,
        COALESCE(SUM(s.comission + s.retention + s.shipping), 0)::numeric as ad_spend,
        CASE 
            WHEN COALESCE(SUM(s.comission + s.retention + s.shipping), 0) > 0 
            THEN (COALESCE(SUM(s.price), 0) / COALESCE(SUM(s.comission + s.retention + s.shipping), 1))::numeric
            ELSE 0::numeric
        END as mer,
        CASE 
            WHEN COUNT(DISTINCT s.id) > 0 
            THEN (COALESCE(SUM(s.price), 0) / COUNT(DISTINCT s.id))::numeric
            ELSE 0::numeric
        END as aov,
        COUNT(DISTINCT s.id) as orders,
        COALESCE(SUM(s."Profit"), 0)::numeric as contribution_margin,
        CASE 
            WHEN COALESCE(SUM(s.price), 0) > 0 
            THEN ROUND((COALESCE(SUM(s."Profit"), 0) / COALESCE(SUM(s.price), 1) * 100)::numeric, 2)
            ELSE 0::numeric
        END as margin_percentage
    FROM "Sales" s
    WHERE s.company_id = ANY(user_company_ids)
      AND s.date >= p_start_date 
      AND s.date <= p_end_date;
END;
$$;

-- Recreate get_channel_metrics with proper numeric casting
CREATE OR REPLACE FUNCTION public.get_channel_metrics(
    p_user_id uuid,
    p_start_date date,
    p_end_date date
)
RETURNS TABLE(
    channel_name text,
    revenue numeric,
    orders bigint,
    aov numeric,
    contribution_margin numeric,
    margin_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_company_ids uuid[];
BEGIN
    -- Get user's company IDs
    SELECT ARRAY(
        SELECT DISTINCT company_id 
        FROM company_users 
        WHERE user_id = p_user_id
        UNION
        SELECT DISTINCT id 
        FROM companies 
        WHERE user_id = p_user_id
    ) INTO user_company_ids;

    RETURN QUERY
    SELECT 
        COALESCE(s."Channel", 'Unknown') as channel_name,
        COALESCE(SUM(s.price), 0)::numeric as revenue,
        COUNT(DISTINCT s.id) as orders,
        CASE 
            WHEN COUNT(DISTINCT s.id) > 0 
            THEN ROUND((COALESCE(SUM(s.price), 0) / COUNT(DISTINCT s.id))::numeric, 2)
            ELSE 0::numeric
        END as aov,
        COALESCE(SUM(s."Profit"), 0)::numeric as contribution_margin,
        CASE 
            WHEN COALESCE(SUM(s.price), 0) > 0 
            THEN ROUND((COALESCE(SUM(s."Profit"), 0) / COALESCE(SUM(s.price), 1) * 100)::numeric, 2)
            ELSE 0::numeric
        END as margin_percentage
    FROM "Sales" s
    WHERE s.company_id = ANY(user_company_ids)
      AND s.date >= p_start_date 
      AND s.date <= p_end_date
    GROUP BY s."Channel"
    ORDER BY revenue DESC;
END;
$$;

-- Recreate get_sales_chart_data with proper numeric casting
CREATE OR REPLACE FUNCTION public.get_sales_chart_data(
    p_user_id uuid,
    p_start_date date,
    p_end_date date
)
RETURNS TABLE(
    date date,
    sales numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_company_ids uuid[];
BEGIN
    -- Get user's company IDs
    SELECT ARRAY(
        SELECT DISTINCT company_id 
        FROM company_users 
        WHERE user_id = p_user_id
        UNION
        SELECT DISTINCT id 
        FROM companies 
        WHERE user_id = p_user_id
    ) INTO user_company_ids;

    RETURN QUERY
    SELECT 
        s.date,
        COALESCE(SUM(s.price), 0)::numeric as sales
    FROM "Sales" s
    WHERE s.company_id = ANY(user_company_ids)
      AND s.date >= p_start_date 
      AND s.date <= p_end_date
    GROUP BY s.date
    ORDER BY s.date;
END;
$$;

-- Recreate get_channel_distribution with proper numeric casting
CREATE OR REPLACE FUNCTION public.get_channel_distribution(
    p_user_id uuid,
    p_start_date date,
    p_end_date date
)
RETURNS TABLE(
    channel text,
    value numeric,
    percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_company_ids uuid[];
    total_sales numeric;
BEGIN
    -- Get user's company IDs
    SELECT ARRAY(
        SELECT DISTINCT company_id 
        FROM company_users 
        WHERE user_id = p_user_id
        UNION
        SELECT DISTINCT id 
        FROM companies 
        WHERE user_id = p_user_id
    ) INTO user_company_ids;

    -- Get total sales for percentage calculation
    SELECT COALESCE(SUM(s.price), 0)::numeric INTO total_sales
    FROM "Sales" s
    WHERE s.company_id = ANY(user_company_ids)
      AND s.date >= p_start_date 
      AND s.date <= p_end_date;

    RETURN QUERY
    SELECT 
        COALESCE(s."Channel", 'Unknown') as channel,
        COALESCE(SUM(s.price), 0)::numeric as value,
        CASE 
            WHEN total_sales > 0 
            THEN ROUND((COALESCE(SUM(s.price), 0) / total_sales * 100)::numeric, 1)
            ELSE 0::numeric
        END as percentage
    FROM "Sales" s
    WHERE s.company_id = ANY(user_company_ids)
      AND s.date >= p_start_date 
      AND s.date <= p_end_date
    GROUP BY s."Channel"
    HAVING COALESCE(SUM(s.price), 0) > 0
    ORDER BY value DESC;
END;
$$;