-- RLS 우회 없이 안전하게 soft delete (본인 경기만)
CREATE OR REPLACE FUNCTION public.soft_delete_match(match_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.matches
  SET deleted_at = now()
  WHERE id = match_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION '경기를 삭제할 수 없습니다.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.soft_delete_match(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.soft_delete_match(UUID) TO authenticated;
