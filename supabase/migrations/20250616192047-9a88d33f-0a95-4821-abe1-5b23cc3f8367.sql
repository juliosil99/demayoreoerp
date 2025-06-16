
-- Crear función optimizada para obtener Top 50 SKUs por unidades con filtrado por usuario
CREATE OR REPLACE FUNCTION public.get_top_skus_by_units(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
) RETURNS TABLE(
  sku text,
  product_name text,
  quantity bigint,
  revenue numeric,
  change_percentage numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  period_duration_days integer;
  previous_start_date date;
  previous_end_date date;
BEGIN
  -- Calcular la duración del período para el período de comparación
  period_duration_days := p_end_date - p_start_date + 1;
  
  -- Calcular fechas del período anterior
  previous_start_date := p_start_date - period_duration_days;
  previous_end_date := p_start_date - 1;
  
  RETURN QUERY
  WITH current_period AS (
    SELECT 
      COALESCE(s.sku, 'unknown') as sku,
      COALESCE(s."productName", 'Unknown Product') as product_name,
      SUM(COALESCE(s."Quantity", 0)) as total_quantity,
      SUM(COALESCE(s.price, 0)) as total_revenue
    FROM "Sales" s
    WHERE s.date >= p_start_date 
      AND s.date <= p_end_date
      AND s.sku IS NOT NULL
      AND s.user_id = p_user_id
    GROUP BY s.sku, s."productName"
  ),
  previous_period AS (
    SELECT 
      COALESCE(s.sku, 'unknown') as sku,
      SUM(COALESCE(s."Quantity", 0)) as prev_quantity
    FROM "Sales" s
    WHERE s.date >= previous_start_date 
      AND s.date <= previous_end_date
      AND s.sku IS NOT NULL
      AND s.user_id = p_user_id
    GROUP BY s.sku
  ),
  combined_data AS (
    SELECT 
      cp.sku,
      cp.product_name,
      cp.total_quantity,
      cp.total_revenue,
      COALESCE(pp.prev_quantity, 0) as prev_quantity
    FROM current_period cp
    LEFT JOIN previous_period pp ON cp.sku = pp.sku
    WHERE cp.total_quantity > 0
  )
  SELECT 
    cd.sku,
    cd.product_name,
    cd.total_quantity,
    cd.total_revenue,
    CASE 
      WHEN cd.prev_quantity > 0 THEN 
        ROUND(((cd.total_quantity - cd.prev_quantity)::numeric / cd.prev_quantity::numeric) * 100, 0)
      WHEN cd.total_quantity > 0 AND cd.prev_quantity = 0 THEN 
        100 -- Nuevo producto, 100% de incremento
      ELSE 
        0
    END as change_percentage
  FROM combined_data cd
  ORDER BY cd.total_quantity DESC
  LIMIT 50;
END;
$$;
