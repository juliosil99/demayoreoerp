-- Crear la tabla user_permissions que falta
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  permission_name TEXT NOT NULL,
  can_access BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, permission_name)
);

-- Habilitar RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios vean sus propios permisos
CREATE POLICY "Users can view their own permissions" ON public.user_permissions
  FOR SELECT USING (auth.uid() = user_id);

-- Política para que se puedan insertar permisos (necesario para initialize_user_permissions)
CREATE POLICY "Allow insert for permission initialization" ON public.user_permissions
  FOR INSERT WITH CHECK (true);

-- Política para que se puedan actualizar permisos
CREATE POLICY "Allow update for permission management" ON public.user_permissions
  FOR UPDATE USING (auth.uid() = user_id);