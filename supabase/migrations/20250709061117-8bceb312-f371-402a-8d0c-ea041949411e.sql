-- Fix trigger using WHERE NOT EXISTS to avoid all conflicts
CREATE OR REPLACE FUNCTION public.handle_new_company_with_accounts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the user as admin in company_users table (only if not exists)
  INSERT INTO public.company_users (company_id, user_id, role)
  SELECT NEW.id, NEW.user_id, 'admin'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.company_users 
    WHERE company_id = NEW.id AND user_id = NEW.user_id
  );
  
  -- Initialize basic chart of accounts for the new company
  -- Activos Circulantes
  INSERT INTO public.chart_of_accounts (code, name, account_type, level, user_id)
  VALUES 
    ('100', 'ACTIVOS CIRCULANTES', 'asset', 1, NEW.user_id),
    ('101', 'Caja', 'asset', 2, NEW.user_id),
    ('102', 'Bancos', 'asset', 2, NEW.user_id),
    ('103', 'Clientes', 'asset', 2, NEW.user_id),
    ('104', 'Inventarios', 'asset', 2, NEW.user_id),
    ('105', 'IVA Acreditable', 'asset', 2, NEW.user_id);
  
  -- Activos Fijos
  INSERT INTO public.chart_of_accounts (code, name, account_type, level, user_id)
  VALUES 
    ('200', 'ACTIVOS FIJOS', 'asset', 1, NEW.user_id),
    ('201', 'Mobiliario y Equipo', 'asset', 2, NEW.user_id),
    ('202', 'Equipo de Transporte', 'asset', 2, NEW.user_id),
    ('203', 'Depreciación Acumulada', 'asset', 2, NEW.user_id);
  
  -- Pasivos Circulantes
  INSERT INTO public.chart_of_accounts (code, name, account_type, level, user_id)
  VALUES 
    ('300', 'PASIVOS CIRCULANTES', 'liability', 1, NEW.user_id),
    ('301', 'Proveedores', 'liability', 2, NEW.user_id),
    ('302', 'Acreedores Diversos', 'liability', 2, NEW.user_id),
    ('303', 'IVA Trasladado', 'liability', 2, NEW.user_id),
    ('304', 'ISR por Pagar', 'liability', 2, NEW.user_id);
  
  -- Capital
  INSERT INTO public.chart_of_accounts (code, name, account_type, level, user_id)
  VALUES 
    ('400', 'CAPITAL', 'equity', 1, NEW.user_id),
    ('401', 'Capital Social', 'equity', 2, NEW.user_id),
    ('402', 'Resultado del Ejercicio', 'equity', 2, NEW.user_id),
    ('403', 'Utilidades Retenidas', 'equity', 2, NEW.user_id);
  
  -- Ingresos
  INSERT INTO public.chart_of_accounts (code, name, account_type, level, user_id)
  VALUES 
    ('500', 'INGRESOS', 'income', 1, NEW.user_id),
    ('501', 'Ventas', 'income', 2, NEW.user_id),
    ('502', 'Otros Ingresos', 'income', 2, NEW.user_id);
  
  -- Gastos
  INSERT INTO public.chart_of_accounts (code, name, account_type, level, user_id)
  VALUES 
    ('600', 'GASTOS', 'expense', 1, NEW.user_id),
    ('601', 'Gastos de Administración', 'expense', 2, NEW.user_id),
    ('602', 'Gastos de Venta', 'expense', 2, NEW.user_id),
    ('603', 'Gastos Financieros', 'expense', 2, NEW.user_id),
    ('604', 'Otros Gastos', 'expense', 2, NEW.user_id);
  
  -- Initialize user permissions for the new company owner
  PERFORM public.initialize_user_permissions(NEW.user_id, 'admin');
  
  RETURN NEW;
END;
$$;