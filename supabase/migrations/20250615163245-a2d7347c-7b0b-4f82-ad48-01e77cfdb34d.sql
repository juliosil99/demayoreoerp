
-- Paso 1: Permitir que las notificaciones se vinculen a conversaciones usando su ID de texto.
ALTER TABLE public.notifications
ALTER COLUMN related_id TYPE TEXT;

-- Paso 2: Crear una función que genera la notificación.
CREATE OR REPLACE FUNCTION public.create_crm_notification()
RETURNS TRIGGER AS $$
DECLARE
    notification_title TEXT;
    notification_message TEXT;
    notification_type TEXT;
    conversation_id TEXT;
    recipient_name TEXT;
BEGIN
    -- Construir el ID de la conversación, que es nuestro ID de referencia (related_id).
    conversation_id := 'comp_' || COALESCE(NEW.company_id::text, 'none') || '-cont_' || COALESCE(NEW.contact_id::text, 'none');

    -- Determinar el tipo y contenido de la notificación basado en la interacción.
    -- Caso 1: Nueva pregunta de Mercado Libre sin respuesta.
    IF TG_OP = 'INSERT' AND NEW.type = 'mercadolibre_question' AND NEW.description IS NULL THEN
        notification_type := 'mercadolibre_question';
        notification_title := 'Nueva pregunta de Mercado Libre';
        notification_message := 'De: ' || COALESCE(NEW.metadata->>'sender_nickname', 'un cliente') || '. Pregunta: "' || LEFT(NEW.subject, 80) || '..."';

    -- Caso 2: El estado de la conversación cambia a "pendiente de respuesta" o "necesita revisión humana".
    ELSIF NEW.conversation_status IN ('pending_response', 'needs_human_review') AND OLD.conversation_status IS DISTINCT FROM NEW.conversation_status THEN
        notification_type := 'conversation_needs_attention';
        notification_title := 'Conversación requiere atención';

        -- Obtener el nombre del destinatario para el mensaje.
        IF NEW.contact_id IS NOT NULL THEN
            SELECT name INTO recipient_name FROM contacts WHERE id = NEW.contact_id;
        ELSIF NEW.company_id IS NOT NULL THEN
            SELECT name INTO recipient_name FROM companies_crm WHERE id = NEW.company_id;
        END IF;

        notification_message := 'La conversación con ' || COALESCE(recipient_name, 'un cliente') || ' necesita una respuesta.';
    ELSE
        RETURN NULL; -- No se necesita notificación para otros casos.
    END IF;

    -- Insertar la notificación si se estableció un tipo.
    IF notification_type IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, related_id, is_read)
        VALUES (NEW.user_id, notification_type, notification_title, notification_message, conversation_id, false);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 3: Limpiar triggers antiguos para evitar conflictos.
DROP TRIGGER IF EXISTS trigger_crm_notification ON public.interactions;
DROP TRIGGER IF EXISTS trigger_crm_notification_on_insert ON public.interactions;
DROP TRIGGER IF EXISTS trigger_crm_notification_on_update ON public.interactions;

-- Paso 4: Crear el trigger que se ejecuta al insertar o actualizar una interacción.
CREATE TRIGGER trigger_crm_notification
AFTER INSERT OR UPDATE ON public.interactions
FOR EACH ROW
EXECUTE FUNCTION public.create_crm_notification();
