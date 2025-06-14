
-- Primero, eliminamos el tipo si ya existe para evitar conflictos.
DROP TYPE IF EXISTS crm_conversation_preview_type CASCADE;

-- Creamos un tipo de dato que coincida con la estructura de la vista previa de una conversación.
CREATE TYPE crm_conversation_preview_type AS (
  id TEXT,
  company_id UUID,
  company_name TEXT,
  contact_id UUID,
  contact_name TEXT,
  last_message TEXT,
  last_message_time TIMESTAMPTZ,
  last_message_type TEXT,
  unread_count BIGINT,
  conversation_status TEXT
);

-- Ahora, creamos la función que obtiene las conversaciones de forma paginada.
CREATE OR REPLACE FUNCTION get_crm_conversation_previews(
  p_user_id uuid,
  p_filter TEXT,
  p_page_size integer,
  p_page_number integer
)
RETURNS SETOF crm_conversation_preview_type AS $$
DECLARE
    p_offset integer;
BEGIN
    p_offset := (p_page_number - 1) * p_page_size;

    RETURN QUERY
    WITH ranked_interactions AS (
        SELECT
            i.id, i.company_id, i.contact_id, comp.name AS company_name, cont.name AS contact_name,
            i.description, i.subject, i.type, i.conversation_status, i.interaction_date, i.is_read,
            CASE
                WHEN i.company_id IS NOT NULL OR i.contact_id IS NOT NULL THEN
                    'comp_' || COALESCE(i.company_id::text, 'none') || '-cont_' || COALESCE(i.contact_id::text, 'none')
                ELSE 'int_' || i.id::text
            END AS group_id,
            ROW_NUMBER() OVER (PARTITION BY (CASE WHEN i.company_id IS NOT NULL OR i.contact_id IS NOT NULL THEN 'comp_' || COALESCE(i.company_id::text, 'none') || '-cont_' || COALESCE(i.contact_id::text, 'none') ELSE 'int_' || i.id::text END) ORDER BY i.interaction_date DESC) AS rn,
            BOOL_OR(i.type = 'mercadolibre_question') OVER (PARTITION BY (CASE WHEN i.company_id IS NOT NULL OR i.contact_id IS NOT NULL THEN 'comp_' || COALESCE(i.company_id::text, 'none') || '-cont_' || COALESCE(i.contact_id::text, 'none') ELSE 'int_' || i.id::text END)) as contains_ml,
            SUM(CASE WHEN i.is_read = false THEN 1 ELSE 0 END) OVER (PARTITION BY (CASE WHEN i.company_id IS NOT NULL OR i.contact_id IS NOT NULL THEN 'comp_' || COALESCE(i.company_id::text, 'none') || '-cont_' || COALESCE(i.contact_id::text, 'none') ELSE 'int_' || i.id::text END)) as unread
        FROM
            interactions i
        LEFT JOIN companies_crm comp ON i.company_id = comp.id
        LEFT JOIN contacts cont ON i.contact_id = cont.id
        WHERE i.user_id = p_user_id
    ),
    conversation_previews AS (
        SELECT
            group_id AS id, company_id, company_name, contact_id, contact_name,
            COALESCE(subject, description, '') AS last_message,
            interaction_date AS last_message_time,
            type AS last_message_type,
            contains_ml, -- Keep for filtering
            CASE WHEN contains_ml THEN 0 ELSE unread END AS unread_count,
            CASE WHEN contains_ml THEN 'closed' ELSE COALESCE(conversation_status, 'open') END AS conversation_status,
            interaction_date
        FROM ranked_interactions
        WHERE rn = 1
    )
    SELECT
        cp.id, cp.company_id, cp.company_name, cp.contact_id, cp.contact_name,
        cp.last_message, cp.last_message_time, cp.last_message_type,
        cp.unread_count, cp.conversation_status
    FROM conversation_previews AS cp
    WHERE
      CASE
        WHEN p_filter = 'all' THEN true
        WHEN p_filter = 'open' THEN cp.conversation_status = 'open' AND NOT cp.contains_ml
        WHEN p_filter = 'closed' THEN cp.conversation_status = 'closed'
        WHEN p_filter = 'unanswered' THEN cp.conversation_status = 'pending_response' AND NOT cp.contains_ml
        ELSE true
      END
    ORDER BY cp.interaction_date DESC
    LIMIT p_page_size
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
