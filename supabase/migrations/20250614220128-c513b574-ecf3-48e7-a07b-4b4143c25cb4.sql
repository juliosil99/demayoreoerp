
-- Recrear la función con SECURITY DEFINER para que pueda saltar las políticas de RLS
-- y buscar interacciones en toda la compañía del usuario.
CREATE OR REPLACE FUNCTION get_crm_conversation_previews(
  p_user_id uuid,
  p_filter TEXT,
  p_page_size integer,
  p_page_number integer
)
RETURNS SETOF crm_conversation_preview_type AS $$
DECLARE
    p_offset integer;
    user_company_ids uuid[];
BEGIN
    p_offset := (p_page_number - 1) * p_page_size;

    -- Obtener todas las empresas a las que el usuario tiene acceso
    SELECT ARRAY(
        SELECT DISTINCT company_id 
        FROM company_users 
        WHERE user_id = p_user_id
        UNION
        SELECT DISTINCT id 
        FROM companies 
        WHERE user_id = p_user_id
    ) INTO user_company_ids;

    RETURN QUERY
    WITH company_user_ids AS (
        -- Obtener todos los usuarios que pertenecen a las mismas empresas
        SELECT DISTINCT cu.user_id
        FROM company_users cu
        WHERE cu.company_id = ANY(user_company_ids)
        UNION
        SELECT DISTINCT c.user_id
        FROM companies c
        WHERE c.id = ANY(user_company_ids)
    ),
    ranked_interactions AS (
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
        WHERE i.user_id IN (SELECT user_id FROM company_user_ids)
    ),
    conversation_previews AS (
        SELECT
            group_id AS id, company_id, company_name, contact_id, contact_name,
            COALESCE(subject, description, '') AS last_message,
            interaction_date AS last_message_time,
            type AS last_message_type,
            contains_ml, -- Se mantiene para el filtrado
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
