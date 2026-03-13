# CORREÇÃO URGENTE - Recursão Infinita RLS

## ⚠️ Problema Identificado
Erro: "infinite recursion detected in policy for relation user_households"

## ✅ Solução (Execute AGORA no Supabase SQL Editor)

### Passo 1: Acesse o Supabase SQL Editor
1. Abra https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em "SQL Editor"

### Passo 2: Execute este SQL (copie e cole tudo de uma vez)

```sql
-- CORREÇÃO DE RECURSÃO INFINITA NAS POLÍTICAS RLS

-- 1. Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can view their households" ON households;
DROP POLICY IF EXISTS "Users can insert households" ON households;
DROP POLICY IF EXISTS "Household owners can update" ON households;
DROP POLICY IF EXISTS "Household owners can delete" ON households;
DROP POLICY IF EXISTS "Users can view their household memberships" ON user_households;
DROP POLICY IF EXISTS "Users can insert their household memberships" ON user_households;
DROP POLICY IF EXISTS "Household admins can manage memberships" ON user_households;

-- 2. Recriar políticas para user_households SEM recursão
CREATE POLICY "Users can view own memberships" ON user_households
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own memberships" ON user_households
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own memberships" ON user_households
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own memberships" ON user_households
  FOR DELETE 
  USING (user_id = auth.uid());

-- 3. Recriar políticas para households usando IN subquery (evita recursão)
CREATE POLICY "Users view households they belong to" ON households
  FOR SELECT 
  USING (
    id IN (
      SELECT household_id 
      FROM user_households 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create households" ON households
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

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

-- 4. Atualizar função helper
DROP FUNCTION IF EXISTS user_has_household_access(UUID);

CREATE OR REPLACE FUNCTION user_has_household_access(household_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM user_households
    WHERE user_id = auth.uid()
    AND household_id = household_uuid
  ) INTO has_access;
  
  RETURN COALESCE(has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Passo 3: Verificar se funcionou

Execute esta query no SQL Editor para confirmar que as políticas estão corretas:

```sql
-- Ver todas as políticas ativas
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename IN ('households', 'user_households')
ORDER BY tablename, policyname;
```

Você deve ver 8 políticas:
- `user_households`: 4 políticas (view, insert, update, delete)
- `households`: 4 políticas (view, create, update, delete)

### Passo 4: Testar no App

1. Recarregue o app (pode precisar fazer `npx expo start -c`)
2. Faça login
3. Abra o menu lateral
4. ✅ Os households devem aparecer agora!

## 🎯 Explicação Técnica

**Problema anterior:**
A política "Household admins can manage memberships" fazia:
```sql
SELECT FROM user_households WHERE ... (dispara RLS de user_households)
  └─> que chama "Household admins can manage memberships"
      └─> que faz SELECT FROM user_households (LOOP INFINITO!)
```

**Solução aplicada:**
- Políticas de `user_households` agora verificam apenas `user_id = auth.uid()` (sem subqueries)
- Políticas de `households` usam `IN (SELECT ...)` que o Postgres otimiza sem causar recursão
- Função helper usa `SECURITY DEFINER` para executar sem RLS

## 📝 Arquivos Alterados

- ✅ `src/lib/fix-household-rls.sql` - Script de correção standalone
- ✅ `src/lib/supabase.migration.household.sql` - Migração atualizada para futuras instalações
- ✅ `HOUSEHOLD_TROUBLESHOOTING.md` - Documentação atualizada

## ❓ Se Ainda Houver Problemas

1. Execute o debug: Menu → Sobre → "Debug Households"
2. Copie os logs do console
3. Compartilhe os logs para análise
