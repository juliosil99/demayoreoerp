
-- Primero, eliminamos las políticas RLS existentes de la tabla interactions
DROP POLICY IF EXISTS "Users can view their own interactions" ON public.interactions;
DROP POLICY IF EXISTS "Users can create their own interactions" ON public.interactions;
DROP POLICY IF EXISTS "Users can update their own interactions" ON public.interactions;
DROP POLICY IF EXISTS "Users can delete their own interactions" ON public.interactions;

-- Creamos nuevas políticas basadas en empresa
-- Política para SELECT: permitir ver interacciones donde el usuario pertenece a la misma empresa
CREATE POLICY "Users can view company interactions" 
  ON public.interactions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users cu1
      WHERE cu1.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.company_users cu2
        WHERE cu2.user_id = interactions.user_id
        AND cu2.company_id = cu1.company_id
      )
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.company_users cu
        WHERE cu.user_id = interactions.user_id
        AND cu.company_id = c.id
      )
    )
    OR
    interactions.user_id = auth.uid()
  );

-- Política para INSERT: permitir crear interacciones si el usuario tiene acceso a la empresa
CREATE POLICY "Users can create company interactions" 
  ON public.interactions 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id
    AND (
      company_id IS NULL
      OR public.can_access_company_user(auth.uid(), company_id)
      OR EXISTS (
        SELECT 1 FROM public.companies c
        WHERE c.id = company_id AND c.user_id = auth.uid()
      )
    )
  );

-- Política para UPDATE: permitir actualizar interacciones de la misma empresa
CREATE POLICY "Users can update company interactions" 
  ON public.interactions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users cu1
      WHERE cu1.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.company_users cu2
        WHERE cu2.user_id = interactions.user_id
        AND cu2.company_id = cu1.company_id
      )
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.company_users cu
        WHERE cu.user_id = interactions.user_id
        AND cu.company_id = c.id
      )
    )
    OR
    interactions.user_id = auth.uid()
  );

-- Política para DELETE: permitir eliminar interacciones de la misma empresa
CREATE POLICY "Users can delete company interactions" 
  ON public.interactions 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users cu1
      WHERE cu1.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.company_users cu2
        WHERE cu2.user_id = interactions.user_id
        AND cu2.company_id = cu1.company_id
      )
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.company_users cu
        WHERE cu.user_id = interactions.user_id
        AND cu.company_id = c.id
      )
    )
    OR
    interactions.user_id = auth.uid()
  );
