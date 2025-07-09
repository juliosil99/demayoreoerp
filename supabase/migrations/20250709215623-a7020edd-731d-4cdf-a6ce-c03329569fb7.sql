-- Drop existing RPC functions and recreate them with mandatory p_user_id parameter

-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_dashboard_metrics(date, date, uuid);
DROP FUNCTION IF EXISTS public.get_channel_metrics(date, date, uuid);
DROP FUNCTION IF EXISTS public.get_sales_chart_data(date, date, uuid);
DROP FUNCTION IF EXISTS public.get_channel_distribution(date, date, uuid);

-- Recreate get_dashboard_metrics function with mandatory p_user_id
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(start_date date, end_date date, p_user_id uuid)
RETURNS TABLE(
  order_revenue numeric,
  ad_spend numeric,
  mer numeric,
  aov numeric,
  orders bigint,
  contribution_margin numeric,
  margin_percentage numeric,
  revenue_change numeric,
  ad_spend_change numeric,
  mer_change numeric,
  aov_change numeric,
  orders_change numeric,
  contribution_margin_change numeric,
  margin_percentage_change numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_company_id uuid;
  period_duration_days integer;
  previous_start_date date;
  previous_end_date date;
  current_metrics RECORD;
  previous_metrics RECORD;
BEGIN
  -- Validate required parameter
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  -- Get user's company ID
  SELECT company_id INTO user_company_id
  FROM company_users
  WHERE user_id = p_user_id
  LIMIT 1;

  -- If not found in company_users, check if user owns a company
  IF user_company_id IS NULL THEN
    SELECT id INTO user_company_id
    FROM companies
    WHERE user_id = p_user_id
    LIMIT 1;
  END IF;

  -- Validate company access
  IF user_company_id IS NULL THEN
    RAISE EXCEPTION 'No company found for user ID: %', p_user_id;
  END IF;

  -- Calculate period duration for comparison
  period_duration_days := end_date - start_date + 1;
  previous_start_date := start_date - period_duration_days;
  previous_end_date := start_date - 1;

  -- Get current period metrics
  SELECT 
    COALESCE(SUM(s.price), 0) as total_revenue,
    COALESCE(SUM(s.comission + s.retention + s.shipping), 0) as total_ad_spend,
    COALESCE(COUNT(*), 0) as total_orders,
    COALESCE(AVG(s.price), 0) as avg_order_value,
    COALESCE(SUM(s."Profit"), 0) as total_profit
  INTO current_metrics
  FROM "Sales" s
  WHERE s.date >= start_date 
    AND s.date <= end_date
    AND s.company_id = user_company_id;

  -- Get previous period metrics
  SELECT 
    COALESCE(SUM(s.price), 0) as total_revenue,
    COALESCE(SUM(s.comission + s.retention + s.shipping), 0) as total_ad_spend,
    COALESCE(COUNT(*), 0) as total_orders,
    COALESCE(AVG(s.price), 0) as avg_order_value,
    COALESCE(SUM(s."Profit"), 0) as total_profit
  INTO previous_metrics
  FROM "Sales" s
  WHERE s.date >= previous_start_date 
    AND s.date <= previous_end_date
    AND s.company_id = user_company_id;

  -- Return calculated metrics with change percentages
  RETURN QUERY
  SELECT 
    current_metrics.total_revenue,
    current_metrics.total_ad_spend,
    CASE 
      WHEN current_metrics.total_ad_spend > 0 THEN 
        ROUND((current_metrics.total_revenue / current_metrics.total_ad_spend), 2)
      ELSE 0 
    END as mer,
    current_metrics.avg_order_value,
    current_metrics.total_orders,
    current_metrics.total_profit,
    CASE 
      WHEN current_metrics.total_revenue > 0 THEN 
        ROUND((current_metrics.total_profit / current_metrics.total_revenue) * 100, 2)
      ELSE 0 
    END as margin_percentage,
    -- Change calculations
    CASE 
      WHEN previous_metrics.total_revenue > 0 THEN 
        ROUND(((current_metrics.total_revenue - previous_metrics.total_revenue) / previous_metrics.total_revenue) * 100, 1)
      WHEN current_metrics.total_revenue > 0 THEN 100
      ELSE 0 
    END as revenue_change,
    CASE 
      WHEN previous_metrics.total_ad_spend > 0 THEN 
        ROUND(((current_metrics.total_ad_spend - previous_metrics.total_ad_spend) / previous_metrics.total_ad_spend) * 100, 1)
      WHEN current_metrics.total_ad_spend > 0 THEN 100
      ELSE 0 
    END as ad_spend_change,
    0 as mer_change, -- Simplified for now
    CASE 
      WHEN previous_metrics.avg_order_value > 0 THEN 
        ROUND(((current_metrics.avg_order_value - previous_metrics.avg_order_value) / previous_metrics.avg_order_value) * 100, 1)
      WHEN current_metrics.avg_order_value > 0 THEN 100
      ELSE 0 
    END as aov_change,
    CASE 
      WHEN previous_metrics.total_orders > 0 THEN 
        ROUND(((current_metrics.total_orders - previous_metrics.total_orders)::numeric / previous_metrics.total_orders::numeric) * 100, 1)
      WHEN current_metrics.total_orders > 0 THEN 100
      ELSE 0 
    END as orders_change,
    CASE 
      WHEN previous_metrics.total_profit > 0 THEN 
        ROUND(((current_metrics.total_profit - previous_metrics.total_profit) / previous_metrics.total_profit) * 100, 1)
      WHEN current_metrics.total_profit > 0 THEN 100
      ELSE 0 
    END as contribution_margin_change,
    0 as margin_percentage_change; -- Simplified for now
END;
$$;

-- Recreate get_channel_metrics function with mandatory p_user_id
CREATE OR REPLACE FUNCTION public.get_channel_metrics(start_date date, end_date date, p_user_id uuid)
RETURNS TABLE(
  channel text,
  revenue numeric,
  orders bigint,
  aov numeric,
  contribution_margin numeric,
  margin_percentage numeric,
  revenue_change numeric,
  orders_change numeric,
  aov_change numeric,
  contribution_margin_change numeric,
  margin_percentage_change numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_company_id uuid;
  period_duration_days integer;
  previous_start_date date;
  previous_end_date date;
BEGIN
  -- Validate required parameter
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  -- Get user's company ID
  SELECT company_id INTO user_company_id
  FROM company_users
  WHERE user_id = p_user_id
  LIMIT 1;

  IF user_company_id IS NULL THEN
    SELECT id INTO user_company_id
    FROM companies
    WHERE user_id = p_user_id
    LIMIT 1;
  END IF;

  IF user_company_id IS NULL THEN
    RAISE EXCEPTION 'No company found for user ID: %', p_user_id;
  END IF;

  -- Calculate previous period dates
  period_duration_days := end_date - start_date + 1;
  previous_start_date := start_date - period_duration_days;
  previous_end_date := start_date - 1;

  RETURN QUERY
  WITH current_period AS (
    SELECT 
      COALESCE(s."Channel", 'Unknown') as channel_name,
      COALESCE(SUM(s.price), 0) as total_revenue,
      COALESCE(COUNT(*), 0) as total_orders,
      COALESCE(AVG(s.price), 0) as avg_order_value,
      COALESCE(SUM(s."Profit"), 0) as total_profit
    FROM "Sales" s
    WHERE s.date >= start_date 
      AND s.date <= end_date
      AND s.company_id = user_company_id
    GROUP BY s."Channel"
  ),
  previous_period AS (
    SELECT 
      COALESCE(s."Channel", 'Unknown') as channel_name,
      COALESCE(SUM(s.price), 0) as prev_revenue,
      COALESCE(COUNT(*), 0) as prev_orders,
      COALESCE(AVG(s.price), 0) as prev_aov,
      COALESCE(SUM(s."Profit"), 0) as prev_profit
    FROM "Sales" s
    WHERE s.date >= previous_start_date 
      AND s.date <= previous_end_date
      AND s.company_id = user_company_id
    GROUP BY s."Channel"
  )
  SELECT 
    cp.channel_name,
    cp.total_revenue,
    cp.total_orders,
    cp.avg_order_value,
    cp.total_profit,
    CASE 
      WHEN cp.total_revenue > 0 THEN 
        ROUND((cp.total_profit / cp.total_revenue) * 100, 2)
      ELSE 0 
    END as margin_percentage,
    -- Change calculations
    CASE 
      WHEN COALESCE(pp.prev_revenue, 0) > 0 THEN 
        ROUND(((cp.total_revenue - pp.prev_revenue) / pp.prev_revenue) * 100, 1)
      WHEN cp.total_revenue > 0 THEN 100
      ELSE 0 
    END as revenue_change,
    CASE 
      WHEN COALESCE(pp.prev_orders, 0) > 0 THEN 
        ROUND(((cp.total_orders - pp.prev_orders)::numeric / pp.prev_orders::numeric) * 100, 1)
      WHEN cp.total_orders > 0 THEN 100
      ELSE 0 
    END as orders_change,
    CASE 
      WHEN COALESCE(pp.prev_aov, 0) > 0 THEN 
        ROUND(((cp.avg_order_value - pp.prev_aov) / pp.prev_aov) * 100, 1)
      WHEN cp.avg_order_value > 0 THEN 100
      ELSE 0 
    END as aov_change,
    CASE 
      WHEN COALESCE(pp.prev_profit, 0) > 0 THEN 
        ROUND(((cp.total_profit - pp.prev_profit) / pp.prev_profit) * 100, 1)
      WHEN cp.total_profit > 0 THEN 100
      ELSE 0 
    END as contribution_margin_change,
    0 as margin_percentage_change -- Simplified for now
  FROM current_period cp
  LEFT JOIN previous_period pp ON cp.channel_name = pp.channel_name
  ORDER BY cp.total_revenue DESC;
END;
$$;

-- Recreate get_sales_chart_data function with mandatory p_user_id
CREATE OR REPLACE FUNCTION public.get_sales_chart_data(start_date date, end_date date, p_user_id uuid)
RETURNS TABLE(
  date date,
  sales numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_company_id uuid;
BEGIN
  -- Validate required parameter
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  -- Get user's company ID
  SELECT company_id INTO user_company_id
  FROM company_users
  WHERE user_id = p_user_id
  LIMIT 1;

  IF user_company_id IS NULL THEN
    SELECT id INTO user_company_id
    FROM companies
    WHERE user_id = p_user_id
    LIMIT 1;
  END IF;

  IF user_company_id IS NULL THEN
    RAISE EXCEPTION 'No company found for user ID: %', p_user_id;
  END IF;

  RETURN QUERY
  SELECT 
    s.date,
    COALESCE(SUM(s.price), 0) as daily_sales
  FROM "Sales" s
  WHERE s.date >= start_date 
    AND s.date <= end_date
    AND s.company_id = user_company_id
  GROUP BY s.date
  ORDER BY s.date;
END;
$$;

-- Recreate get_channel_distribution function with mandatory p_user_id
CREATE OR REPLACE FUNCTION public.get_channel_distribution(start_date date, end_date date, p_user_id uuid)
RETURNS TABLE(
  channel text,
  value numeric,
  percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_company_id uuid;
  total_sales numeric;
BEGIN
  -- Validate required parameter
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  -- Get user's company ID
  SELECT company_id INTO user_company_id
  FROM company_users
  WHERE user_id = p_user_id
  LIMIT 1;

  IF user_company_id IS NULL THEN
    SELECT id INTO user_company_id
    FROM companies
    WHERE user_id = p_user_id
    LIMIT 1;
  END IF;

  IF user_company_id IS NULL THEN
    RAISE EXCEPTION 'No company found for user ID: %', p_user_id;
  END IF;

  -- Calculate total sales for percentage calculation
  SELECT COALESCE(SUM(s.price), 0) INTO total_sales
  FROM "Sales" s
  WHERE s.date >= start_date 
    AND s.date <= end_date
    AND s.company_id = user_company_id;

  RETURN QUERY
  SELECT 
    COALESCE(s."Channel", 'Unknown') as channel_name,
    COALESCE(SUM(s.price), 0) as channel_value,
    CASE 
      WHEN total_sales > 0 THEN 
        ROUND((SUM(s.price) / total_sales) * 100, 1)
      ELSE 0 
    END as channel_percentage
  FROM "Sales" s
  WHERE s.date >= start_date 
    AND s.date <= end_date
    AND s.company_id = user_company_id
  GROUP BY s."Channel"
  ORDER BY channel_value DESC;
END;
$$;