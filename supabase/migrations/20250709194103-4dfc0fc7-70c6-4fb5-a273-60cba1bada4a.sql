-- Update dashboard RPC functions to include user/company filtering

-- 1. Update get_dashboard_metrics function
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(
    start_date date DEFAULT NULL,
    end_date date DEFAULT NULL,
    p_user_id uuid DEFAULT auth.uid()
)
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
    prev_period_start date;
    prev_period_end date;
    period_days integer;
    
    current_revenue numeric := 0;
    current_ad_spend numeric := 0;
    current_orders bigint := 0;
    current_contribution_margin numeric := 0;
    
    prev_revenue numeric := 0;
    prev_ad_spend numeric := 0;
    prev_orders bigint := 0;
    prev_contribution_margin numeric := 0;
BEGIN
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
    
    -- If no company found, return zeros
    IF user_company_id IS NULL THEN
        RETURN QUERY SELECT 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::bigint, 
                           0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 
                           0::numeric, 0::numeric, 0::numeric, 0::numeric;
        RETURN;
    END IF;
    
    -- Set default dates if not provided
    IF start_date IS NULL THEN start_date := CURRENT_DATE - INTERVAL '30 days'; END IF;
    IF end_date IS NULL THEN end_date := CURRENT_DATE; END IF;
    
    -- Calculate previous period
    period_days := end_date - start_date;
    prev_period_start := start_date - period_days;
    prev_period_end := start_date - 1;
    
    -- Get current period metrics
    SELECT 
        COALESCE(SUM(s.price), 0),
        COALESCE(SUM(s.comission + s.retention + s.shipping), 0),
        COALESCE(COUNT(*), 0),
        COALESCE(SUM(s.price - s.cost - s.comission - s.retention - s.shipping), 0)
    INTO current_revenue, current_ad_spend, current_orders, current_contribution_margin
    FROM "Sales" s
    WHERE s.company_id = user_company_id
      AND s.date BETWEEN start_date AND end_date;
    
    -- Get previous period metrics
    SELECT 
        COALESCE(SUM(s.price), 0),
        COALESCE(SUM(s.comission + s.retention + s.shipping), 0),
        COALESCE(COUNT(*), 0),
        COALESCE(SUM(s.price - s.cost - s.comission - s.retention - s.shipping), 0)
    INTO prev_revenue, prev_ad_spend, prev_orders, prev_contribution_margin
    FROM "Sales" s
    WHERE s.company_id = user_company_id
      AND s.date BETWEEN prev_period_start AND prev_period_end;
    
    -- Return calculated metrics
    RETURN QUERY SELECT 
        current_revenue,
        current_ad_spend,
        CASE WHEN current_ad_spend > 0 THEN current_revenue / current_ad_spend ELSE 0 END,
        CASE WHEN current_orders > 0 THEN current_revenue / current_orders ELSE 0 END,
        current_orders,
        current_contribution_margin,
        CASE WHEN current_revenue > 0 THEN (current_contribution_margin / current_revenue) * 100 ELSE 0 END,
        CASE WHEN prev_revenue > 0 THEN ((current_revenue - prev_revenue) / prev_revenue) * 100 ELSE 0 END,
        CASE WHEN prev_ad_spend > 0 THEN ((current_ad_spend - prev_ad_spend) / prev_ad_spend) * 100 ELSE 0 END,
        CASE WHEN prev_ad_spend > 0 AND current_ad_spend > 0 THEN 
            (((current_revenue / current_ad_spend) - (prev_revenue / prev_ad_spend)) / (prev_revenue / prev_ad_spend)) * 100 
        ELSE 0 END,
        CASE WHEN prev_orders > 0 THEN 
            (((current_revenue / current_orders) - (prev_revenue / prev_orders)) / (prev_revenue / prev_orders)) * 100 
        ELSE 0 END,
        CASE WHEN prev_orders > 0 THEN ((current_orders - prev_orders)::numeric / prev_orders) * 100 ELSE 0 END,
        CASE WHEN prev_contribution_margin > 0 THEN ((current_contribution_margin - prev_contribution_margin) / prev_contribution_margin) * 100 ELSE 0 END,
        CASE WHEN prev_revenue > 0 THEN 
            (((current_contribution_margin / current_revenue) - (prev_contribution_margin / prev_revenue)) / (prev_contribution_margin / prev_revenue)) * 100 
        ELSE 0 END;
END;
$$;

-- 2. Update get_channel_metrics function
CREATE OR REPLACE FUNCTION public.get_channel_metrics(
    start_date date DEFAULT NULL,
    end_date date DEFAULT NULL,
    p_user_id uuid DEFAULT auth.uid()
)
RETURNS TABLE(
    name text,
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
    prev_period_start date;
    prev_period_end date;
    period_days integer;
BEGIN
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
    
    -- If no company found, return empty result
    IF user_company_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Set default dates if not provided
    IF start_date IS NULL THEN start_date := CURRENT_DATE - INTERVAL '30 days'; END IF;
    IF end_date IS NULL THEN end_date := CURRENT_DATE; END IF;
    
    -- Calculate previous period
    period_days := end_date - start_date;
    prev_period_start := start_date - period_days;
    prev_period_end := start_date - 1;
    
    -- Return channel metrics with comparison
    RETURN QUERY
    WITH current_metrics AS (
        SELECT 
            s."Channel" as channel_name,
            COALESCE(SUM(s.price), 0) as current_revenue,
            COALESCE(COUNT(*), 0) as current_orders,
            COALESCE(SUM(s.price - s.cost - s.comission - s.retention - s.shipping), 0) as current_margin
        FROM "Sales" s
        WHERE s.company_id = user_company_id
          AND s.date BETWEEN start_date AND end_date
          AND s."Channel" IS NOT NULL
        GROUP BY s."Channel"
    ),
    previous_metrics AS (
        SELECT 
            s."Channel" as channel_name,
            COALESCE(SUM(s.price), 0) as prev_revenue,
            COALESCE(COUNT(*), 0) as prev_orders,
            COALESCE(SUM(s.price - s.cost - s.comission - s.retention - s.shipping), 0) as prev_margin
        FROM "Sales" s
        WHERE s.company_id = user_company_id
          AND s.date BETWEEN prev_period_start AND prev_period_end
          AND s."Channel" IS NOT NULL
        GROUP BY s."Channel"
    )
    SELECT 
        cm.channel_name,
        cm.current_revenue,
        cm.current_orders,
        CASE WHEN cm.current_orders > 0 THEN cm.current_revenue / cm.current_orders ELSE 0 END,
        cm.current_margin,
        CASE WHEN cm.current_revenue > 0 THEN (cm.current_margin / cm.current_revenue) * 100 ELSE 0 END,
        CASE WHEN COALESCE(pm.prev_revenue, 0) > 0 THEN ((cm.current_revenue - COALESCE(pm.prev_revenue, 0)) / pm.prev_revenue) * 100 ELSE 0 END,
        CASE WHEN COALESCE(pm.prev_orders, 0) > 0 THEN ((cm.current_orders - COALESCE(pm.prev_orders, 0))::numeric / pm.prev_orders) * 100 ELSE 0 END,
        CASE WHEN COALESCE(pm.prev_orders, 0) > 0 AND cm.current_orders > 0 THEN 
            (((cm.current_revenue / cm.current_orders) - (pm.prev_revenue / pm.prev_orders)) / (pm.prev_revenue / pm.prev_orders)) * 100 
        ELSE 0 END,
        CASE WHEN COALESCE(pm.prev_margin, 0) > 0 THEN ((cm.current_margin - COALESCE(pm.prev_margin, 0)) / pm.prev_margin) * 100 ELSE 0 END,
        CASE WHEN COALESCE(pm.prev_revenue, 0) > 0 AND cm.current_revenue > 0 THEN 
            (((cm.current_margin / cm.current_revenue) - (pm.prev_margin / pm.prev_revenue)) / (pm.prev_margin / pm.prev_revenue)) * 100 
        ELSE 0 END
    FROM current_metrics cm
    LEFT JOIN previous_metrics pm ON cm.channel_name = pm.channel_name
    ORDER BY cm.current_revenue DESC;
END;
$$;

-- 3. Update get_sales_chart_data function
CREATE OR REPLACE FUNCTION public.get_sales_chart_data(
    start_date date DEFAULT NULL,
    end_date date DEFAULT NULL,
    p_user_id uuid DEFAULT auth.uid()
)
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
    
    -- If no company found, return empty result
    IF user_company_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Set default dates if not provided
    IF start_date IS NULL THEN start_date := CURRENT_DATE - INTERVAL '30 days'; END IF;
    IF end_date IS NULL THEN end_date := CURRENT_DATE; END IF;
    
    -- Return daily sales data
    RETURN QUERY
    SELECT 
        s.date,
        COALESCE(SUM(s.price), 0) as sales
    FROM "Sales" s
    WHERE s.company_id = user_company_id
      AND s.date BETWEEN start_date AND end_date
    GROUP BY s.date
    ORDER BY s.date;
END;
$$;

-- 4. Update get_channel_distribution function
CREATE OR REPLACE FUNCTION public.get_channel_distribution(
    start_date date DEFAULT NULL,
    end_date date DEFAULT NULL,
    p_user_id uuid DEFAULT auth.uid()
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
    user_company_id uuid;
    total_sales numeric;
BEGIN
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
    
    -- If no company found, return empty result
    IF user_company_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Set default dates if not provided
    IF start_date IS NULL THEN start_date := CURRENT_DATE - INTERVAL '30 days'; END IF;
    IF end_date IS NULL THEN end_date := CURRENT_DATE; END IF;
    
    -- Calculate total sales for percentage calculation
    SELECT COALESCE(SUM(s.price), 0) INTO total_sales
    FROM "Sales" s
    WHERE s.company_id = user_company_id
      AND s.date BETWEEN start_date AND end_date;
    
    -- Return channel distribution
    RETURN QUERY
    SELECT 
        COALESCE(s."Channel", 'Sin Canal') as channel,
        COALESCE(SUM(s.price), 0) as value,
        CASE WHEN total_sales > 0 THEN (COALESCE(SUM(s.price), 0) / total_sales) * 100 ELSE 0 END as percentage
    FROM "Sales" s
    WHERE s.company_id = user_company_id
      AND s.date BETWEEN start_date AND end_date
    GROUP BY s."Channel"
    ORDER BY value DESC;
END;
$$;