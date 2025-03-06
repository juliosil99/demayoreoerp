
-- Create a function to find an invitation by token with flexible matching
CREATE OR REPLACE FUNCTION public.find_invitation_by_token(token_param TEXT)
RETURNS SETOF user_invitations
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM user_invitations
  WHERE invitation_token::text = token_param
  OR invitation_token::text = ('{'||token_param||'}')
  OR invitation_token::text LIKE '%' || token_param || '%'
  LIMIT 1;
$$;
