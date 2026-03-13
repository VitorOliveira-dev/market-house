/**
 * Fix Household RLS Policies
 * Corrige recursão infinita nas políticas RLS
 * Execute este SQL no Supabase SQL Editor
 */

-- 1. Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can view their households" ON households;
DROP POLICY IF EXISTS "Users can insert households" ON households;
DROP POLICY IF EXISTS "Household owners can update" ON households;
DROP POLICY IF EXISTS "Household owners can delete" ON households;
DROP POLICY IF EXISTS "Users can view their household memberships" ON user_households;
DROP POLICY IF EXISTS "Users can insert their household memberships" ON user_households;
DROP POLICY IF EXISTS "Household admins can manage memberships" ON user_households;

-- 2. Recriar políticas para user_households sem recursão
-- Política simples para SELECT: usuário só vê suas próprias associações
CREATE POLICY "Users can view own memberships" ON user_households
  FOR SELECT 
  USING (user_id = auth.uid());

-- Política simples para INSERT: usuário pode se adicionar a households
CREATE POLICY "Users can insert own memberships" ON user_households
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Política para UPDATE: apenas o próprio usuário pode atualizar (ex: sair do household)
CREATE POLICY "Users can update own memberships" ON user_households
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Política para DELETE: apenas o próprio usuário pode se remover
CREATE POLICY "Users can delete own memberships" ON user_households
  FOR DELETE 
  USING (user_id = auth.uid());

-- 3. Recriar políticas para households usando a nova abordagem
-- Para SELECT, verificar se existe relacionamento na user_households
CREATE POLICY "Users view households they belong to" ON households
  FOR SELECT 
  USING (
    id IN (
      SELECT household_id 
      FROM user_households 
      WHERE user_id = auth.uid()
    )
  );

-- Para INSERT, qualquer usuário autenticado pode criar household
CREATE POLICY "Authenticated users can create households" ON households
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Para UPDATE, usar subconsulta otimizada
CREATE POLICY "Admins can update households" ON households
  FOR UPDATE 
  USING (
    id IN (
      SELECT household_id 
      FROM user_households 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Para DELETE, apenas owners
CREATE POLICY "Owners can delete households" ON households
  FOR DELETE 
  USING (
    id IN (
      SELECT household_id 
      FROM user_households 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
    )
  );

-- 4. Atualizar a função helper para evitar recursão
DROP FUNCTION IF EXISTS user_has_household_access(UUID);

CREATE OR REPLACE FUNCTION user_has_household_access(household_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
BEGIN
  -- Usar query direta sem depender de RLS
  SELECT EXISTS (
    SELECT 1 FROM user_households
    WHERE user_id = auth.uid()
    AND household_id = household_uuid
  ) INTO has_access;
  
  RETURN COALESCE(has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Verificação - Listar todas as políticas ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('households', 'user_households')
ORDER BY tablename, policyname;
