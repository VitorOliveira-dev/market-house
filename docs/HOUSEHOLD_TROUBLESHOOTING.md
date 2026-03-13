# Troubleshooting: Households não aparecem no app

## Problema Identificado

O app estava mostrando "Nenhuma casa configurada" mesmo após criar households e associá-los a usuários. O problema tinha duas causas:

### 1. Sintaxe incorreta na query do Supabase

A query embedded estava usando sintaxe antiga/incorreta:

```typescript
// ❌ INCORRETO
.select(`
  role,
  households:household_id (
    id,
    name,
    description
  )
`)
```

**Solução aplicada:** Usar a sintaxe simplificada e correta:

```typescript
// ✅ CORRETO
.select('role, households(*)')
```

### 2. Falta de logs para diagnóstico

Não havia forma fácil de diagnosticar problemas de acesso aos households.

**Solução aplicada:** Adicionado script de debug completo em `src/utils/debug-household.ts`.

## Como Testar

### Opção 1: Usar o botão de debug no app

1. Abra o app e faça login
2. Vá para o menu lateral → **"Sobre"**
3. Role até o final e clique no botão **"Debug Households"**
4. Observe o console do Metro (terminal) para os logs detalhados

### Opção 2: Executar manualmente no console

```javascript
import { runDebug } from '@/utils/debug-household';
await runDebug();
```

### Opção 3: Verificar diretamente no Supabase SQL Editor

Execute esta query no Supabase SQL Editor para verificar o relacionamento:

```sql
-- Substitua 'seu.email@exemplo.com' pelo email do usuário
SELECT 
  u.id as user_id,
  u.email,
  uh.household_id,
  uh.role,
  h.name as household_name,
  h.description
FROM auth.users u
LEFT JOIN user_households uh ON u.id = uh.user_id
LEFT JOIN households h ON uh.household_id = h.id
WHERE u.email = 'seu.email@exemplo.com';
```

## O que o debug mostra

O script de debug verifica:

1. ✅ **Usuário atual** - Confirma que você está logado corretamente
2. ✅ **user_households** - Lista todas as associações user↔household que você tem acesso
3. ✅ **households** - Lista todos os households que você pode ver (baseado em RLS)
4. ✅ **Query embedded** - Testa diferentes sintaxes de query
5. ✅ **Join manual** - Testa query alternativa
6. ✅ **SQL para verificação** - Gera query SQL para executar no Supabase

## Possíveis Problemas e Soluções

### Problema: "infinite recursion detected in policy for relation user_households"

**Causa:** Políticas RLS com dependências circulares causando recursão infinita.

**Sintoma:**
```
Error: {"code": "42P17", "message": "infinite recursion detected in policy for relation \"user_households\""}
```

**Solução:**
Execute o SQL de correção no Supabase SQL Editor:

```bash
# No projeto, o arquivo está em:
src/lib/fix-household-rls.sql
```

Ou execute diretamente:

```sql
-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Household admins can manage memberships" ON user_households;
DROP POLICY IF EXISTS "Users can view their households" ON households;
DROP POLICY IF EXISTS "Household owners can update" ON households;
DROP POLICY IF EXISTS "Household owners can delete" ON households;

-- Recriar com sintaxe sem recursão
CREATE POLICY "Users view households they belong to" ON households
  FOR SELECT 
  USING (
    id IN (
      SELECT household_id 
      FROM user_households 
      WHERE user_id = auth.uid()
    )
  );

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
```

**Verificação:**
Após executar, teste novamente o app. Os households devem aparecer sem mais erros de recursão.

---

### Problema: Nenhum household aparece

**Possível causa 1:** User ID incorreto ao criar o household

```sql
-- Verifique se usou o UUID correto
SELECT id, email FROM auth.users;

-- Verifique se a associação foi criada
SELECT * FROM user_households WHERE user_id = 'SEU_USER_ID';
```

**Solução:**
- Certifique-se de usar o UUID correto (não o email)
- Execute novamente o script `create-household-quickstart.sql` com o UUID correto

---

**Possível causa 2:** RLS bloqueando acesso

```sql
-- Verificar se RLS está ativa
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('households', 'user_households');
```

**Solução:**
- As políticas RLS devem permitir acesso baseado em `auth.uid()`
- Verifique se você está logado no app (não no SQL Editor)

---

**Possível causa 3:** Políticas RLS não aplicadas

```sql
-- Ver políticas ativas
SELECT * FROM pg_policies 
WHERE tablename IN ('households', 'user_households');
```

**Solução:**
- Execute novamente a migration completa: `supabase.migration.household.sql`

## Verificação Pós-Fix

Após a correção, você deve ver:

1. ✅ Households aparecem no seletor do menu lateral
2. ✅ Household atual é salvo e restaurado entre sessões
3. ✅ Dados são filtrados por household em todas as telas

## Logs Esperados

Quando o debug é executado com sucesso, você verá logs como:

```
🔍 Iniciando debug de household access...

✅ Usuário logado: {
  id: 'abc123-...',
  email: 'usuario@exemplo.com'
}

🔍 Verificando user_households...
Query user_households: {
  data: [
    {
      id: 'xyz789-...',
      user_id: 'abc123-...',
      household_id: 'def456-...',
      role: 'owner',
      created_at: '2026-02-28...'
    }
  ],
  error: null,
  count: 1
}

✅ Debug concluído!
```

## Próximos Passos

Se após a correção ainda não funcionar:

1. Pare o Metro (`Ctrl+C`)
2. Limpe o cache: `npx expo start -c`
3. Execute o debug novamente
4. Se ainda houver problemas, compartilhe os logs do debug

## Arquivos Modificados

- ✅ `src/services/household.service.ts` - Corrigida sintaxe da query
- ✅ `src/utils/debug-household.ts` - Adicionado script completo de debug
- ✅ `src/app/about.tsx` - Adicionado botão para executar debug
- ✅ `src/utils/index.ts` - Exportado funções de debug
