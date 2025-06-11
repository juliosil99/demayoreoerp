
-- Eliminar el constraint actual
ALTER TABLE public.interactions DROP CONSTRAINT interactions_type_check;

-- Crear el nuevo constraint con 'mercadolibre_question' incluido
ALTER TABLE public.interactions ADD CONSTRAINT interactions_type_check 
CHECK (type = ANY (ARRAY[
  'email'::text, 
  'call'::text, 
  'meeting'::text, 
  'note'::text, 
  'task'::text, 
  'sale'::text, 
  'invoice'::text, 
  'payment'::text,
  'mercadolibre_question'::text
]));
