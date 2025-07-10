-- Create function to get aggregated sales summary
CREATE OR REPLACE FUNCTION public.get_sales_summary(
    p_user_id uuid,
    p_start_date date,
    p_end_date date
) RETURNS TABLE(
    total_revenue numeric,
    total_cost numeric,
    total_commission numeric,
    total_shipping numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    user_company_id uuid;
BEGIN
    -- Get user's company_id
    SELECT id INTO user_company_id
    FROM companies
    WHERE user_id = p_user_id
    LIMIT 1;
    
    -- Return aggregated sales data
    RETURN QUERY
    SELECT 
        COALESCE(SUM(COALESCE(s.price, 0)), 0) as total_revenue,
        COALESCE(SUM(COALESCE(s.cost, 0)), 0) as total_cost,
        COALESCE(SUM(COALESCE(s.comission, 0)), 0) as total_commission,
        COALESCE(SUM(COALESCE(s.shipping, 0)), 0) as total_shipping
    FROM "Sales" s
    WHERE s.date >= p_start_date 
      AND s.date <= p_end_date
      AND s.company_id = user_company_id;
END;
$$;

-- Create function to get aggregated expenses summary by account
CREATE OR REPLACE FUNCTION public.get_expenses_summary(
    p_user_id uuid,
    p_start_date date,
    p_end_date date
) RETURNS TABLE(
    account_code text,
    account_name text,
    account_type text,
    total_amount numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.code as account_code,
        c.name as account_name,
        c.account_type,
        COALESCE(SUM(e.amount), 0) as total_amount
    FROM expenses e
    JOIN chart_of_accounts c ON e.chart_account_id = c.id
    WHERE e.date >= p_start_date 
      AND e.date <= p_end_date
      AND e.user_id = p_user_id
    GROUP BY c.code, c.name, c.account_type
    ORDER BY c.code;
END;
$$;

-- Create function to get payment adjustments summary
CREATE OR REPLACE FUNCTION public.get_payment_adjustments_summary(
    p_user_id uuid,
    p_start_date date,
    p_end_date date
) RETURNS TABLE(
    adjustment_type text,
    total_amount numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pa.adjustment_type,
        COALESCE(SUM(pa.amount), 0) as total_amount
    FROM payment_adjustments pa
    JOIN payments p ON pa.payment_id = p.id
    WHERE p.date >= p_start_date 
      AND p.date <= p_end_date
      AND pa.user_id = p_user_id
    GROUP BY pa.adjustment_type;
END;
$$;