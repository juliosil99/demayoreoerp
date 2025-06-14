
-- 1. Agregar estado de la conversación y "read" a las interacciones
ALTER TABLE public.interactions
ADD COLUMN IF NOT EXISTS conversation_status text DEFAULT 'open', -- open | closed | pending_response | archived
ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_response_date timestamp with time zone;

-- 2. Índices para optimizar consultas por estado/conversación
CREATE INDEX IF NOT EXISTS idx_interactions_conversation_status
  ON public.interactions(conversation_status);

CREATE INDEX IF NOT EXISTS idx_interactions_is_read
  ON public.interactions(is_read);

CREATE INDEX IF NOT EXISTS idx_interactions_company_contact
  ON public.interactions(company_id, contact_id);

-- 3. Políticas RLS ampliadas: 
-- (Ya existen políticas, pero si las necesitáramos, aquí agregaríamos para UPDATE de los nuevos campos)

