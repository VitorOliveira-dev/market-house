# Configuração do Sistema de Households (Casas)

## Visão Geral

O sistema de households permite que você gerencie diferentes casas (ex: sua casa e a casa dos pais) com listas de compras, compras e despensa separadas.

## 🔧 Migração do Banco de Dados

### Passo 1: Executar a Migração SQL

1. Acesse o **Supabase Dashboard** → **SQL Editor**
2. Abra o arquivo `src/lib/supabase.migration.household.sql`
3. Copie todo o conteúdo
4. Cole no SQL Editor e execute **"Run"**

Isso irá:
- Criar a tabela `households`
- Criar a tabela `user_households` (relacionamento usuário-casa)
- Adicionar coluna `household_id` em todas as tabelas existentes
- Atualizar as políticas RLS (Row Level Security)
- Criar triggers automáticos

### Passo 2: Criar Sua Primeira Casa

Após executar a migração, você precisa criar pelo menos uma casa.

**Importante:** Como você está criando via SQL Editor (não pela app), precisa fazer em 2 passos:

```sql
-- Passo 2.1: Criar a casa e obter o ID
INSERT INTO households (name, description)
VALUES ('Minha Casa', 'Casa principal')
RETURNING id;

-- Passo 2.2: Copie o UUID retornado acima e vincule ao seu usuário
-- Primeiro, descubra seu user_id:
SELECT id, email FROM auth.users;

-- Depois insira a relação (substitua os UUIDs):
INSERT INTO user_households (user_id, household_id, role)
VALUES (
  'SEU_USER_ID_AQUI',        -- Cole o UUID do SELECT auth.users acima
  'ID_DA_CASA_RETORNADO',    -- Cole o UUID do RETURNING id acima
  'owner'
);
```

**Dica Rápida:** Se quiser fazer em um comando só:
```sql
-- Descobrir seu user_id primeiro
SELECT id, email FROM auth.users;

-- Então executar tudo de uma vez (substitua SEU_USER_ID):
WITH new_household AS (
  INSERT INTO households (name, description)
  VALUES ('Minha Casa', 'Casa principal')
  RETURNING id
)
INSERT INTO user_households (user_id, household_id, role)
SELECT 'SEU_USER_ID_AQUI', id, 'owner'
FROM new_household;
```

### Passo 3: Criar Casas Adicionais

Para criar a casa dos pais ou outras casas, use o mesmo processo:

Se você já tem dados (categorias, itens, etc.), precisa associá-los a uma casa:

```sql
-- Use o ID da casa criada anteriormente
DO $$
DECLARE
  default_household_id UUID := 'COLE_O_ID_DA_SUA_CASA_AQUI';
BEGIN
  UPDATE categories SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE items SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE shopping_list_items SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE cart_items SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE purchases SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE purchase_items SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE pantry_items SET household_id = default_household_id WHERE household_id IS NULL;
END $$;
```

### Passo 5: Criar Casas Adicionais

Para criar a casa dos pais ou outras casas:
-- Descobrir seu user_id (se ainda não souber)
SELECT id, email FROM auth.users;

-- Criar a casa dos pais com vinculação em um comando
WITH new_household AS (
  INSERT INTO households (name, description)
  VALUES ('Casa dos Pais', 'Casa no interior')
  RETURNING id
)
INSERT INTO user_households (user_id, household_id, role)
SELECT 'SEU_USER_ID_AQUI', id, 'owner'
FROM new_household;
```

### Passo 4: Migrar Dados Existentes (Opcional)

## 📱 Usando no Aplicativo

### Seletor de Casa

Após a migração, o aplicativo mostrará um **seletor de casa** no menu lateral:

1. Abra o **menu lateral** (drawer)
2. Logo abaixo do seu email, verá o seletor de casa atual
3. Toque no seletor para ver todas as suas casas
4. Selecione a casa desejada

Todos os dados (categorias, itens, lista de compras, etc.) serão filtrados automaticamente pela casa selecionada.

### Funcionalidades Implementadas

✅ **Categorias** - Filtradas por household  
✅ **Itens** - Filtrados por household  
✅ **Busca de Itens** - Busca dentro do household atual  

⚠️ **Em Andamento:**
- Lista de Compras
- Carrinho
- Compras
- Despensa (Pantry)

> **Nota:** Os serviços de shopping-list, cart, purchases e pantry serão atualizados em breve para respeitar o household selecionado.

## 🎯 Estrutura das Tabelas

### households
```
id: UUID (PK)
name: TEXT - Nome da casa
description: TEXT - Descrição opcional
created_at, updated_at: TIMESTAMP
```

### user_households
```
id: UUID (PK)
user_id: UUID (FK → auth.users)
household_id: UUID (FK → households)
role: TEXT - 'owner' | 'admin' | 'member'
created_at: TIMESTAMP
```

### Papéis (Roles)

- **owner**: Pode deletar a casa e gerenciar todos os membros
- **admin**: Pode gerenciar membros mas não deletar a casa  
- **member**: Acesso básico para usar a casa

## 🔐 Segurança (RLS)

As políticas RLS garantem que:
- Você só vê casas das quais é membro
- Você só vê/edita dados das casas que tem acesso
- Owners e admins têm permissões especiais de gestão

## Erro: "null value in column user_id violates not-null constraint"

Este erro aparece quando você tenta criar um household via SQL Editor. A solução é criar a casa e a relação user_household separadamente:

```sql
-- 1. Descubra seu user_id
SELECT id, email FROM auth.users;

-- 2. Crie a casa e vincule em um comando
WITH new_household AS (
  INSERT INTO households (name, description)
  VALUES ('Nome da Casa', 'Descrição')
  RETURNING id
)
INSERT INTO user_households (user_id, household_id, role)
SELECT 'COLE_SEU_USER_ID_AQUI', id, 'owner'
FROM new_household;
```

### 🆘 Resolução de Problemas

### "Nenhuma casa configurada"

Se ver esta mensagem no app:
1. Verifique se executou o SQL de migração
2. Crie uma casa via SQL conforme Passo 2
3. Reinicie o aplicativo

### "No household selected"

Se ver este erro ao criar categorias/itens:
1. Verifique se há pelo menos uma casa criada
2. Abra o menu lateral e confirme que uma casa está selecionada
3. Tente trocar de casa e voltar

### Dados não aparecem

1. Confirme que migrou os dados existentes (Passo 4)
2. Verifique se o `household_id` está preenchido:
   ```sql
   SELECT id, name, household_id FROM categories;
   ```
3. Verifique se você está vinculado à casa:
   ```sql
   SELECT * FROM user_households WHERE user_id = 'SEU_USER_ID';
   ```

## 📝 Comandos Úteis SQL

### Ver todas as suas casas
```sql
SELECT h.* 
FROM households h
JOIN user_households uh ON h.id = uh.household_id
WHERE uh.user_id = auth.uid();
```

### Ver membros de uma casa
```sql
SELECT u.email, uh.role
FROM user_households uh
JOIN auth.users u ON uh.user_id = u.id
WHERE uh.household_id = 'ID_DA_CASA';
```

### Adicionar outra pessoa a uma casa
```sql
INSERT INTO user_households (user_id, household_id, role)
VALUES (
  'USER_ID_DA_PESSOA',
  'ID_DA_CASA',
  'member'
);
```

### Remover alguém de uma casa
```sql
DELETE FROM user_households
WHERE user_id = 'USER_ID_DA_PESSOA'
  AND household_id = 'ID_DA_CASA';
```

## 🎨 Próximos Passos

- [ ] Tela de gestão de casas no app (cadastro via interface)
- [ ] Convite de membros por email
- [ ] Permissões granulares por funcionalidade
- [ ] Estatísticas por casa
- [ ] Comparativo entre casas

---

**Importante:** Sempre faça backup do banco antes de executar migrações!
