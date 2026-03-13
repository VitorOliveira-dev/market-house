/**
 * SQL Quick Start - Criar Primeira Casa
 * 
 * Execute estes comandos no Supabase SQL Editor para criar sua primeira casa
 */

-- PASSO 1: Descobrir seu User ID  
-- Copie o UUID da coluna 'id' que corresponde ao seu email
SELECT id, email FROM auth.users;

-- PASSO 2: Criar casa e vincular ao seu usuário
-- ⚠️ IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo UUID que você copiou acima
WITH new_household AS (
  INSERT INTO households (name, description)
  VALUES ('Minha Casa', 'Casa principal')
  RETURNING id
)
INSERT INTO user_households (user_id, household_id, role)
SELECT 'SEU_USER_ID_AQUI'::uuid, id, 'owner'
FROM new_household
RETURNING *;

-- PASSO 3 (OPCIONAL): Criar casa adicional (ex: casa dos pais)
-- ⚠️ Substitua 'SEU_USER_ID_AQUI' novamente
WITH new_household AS (
  INSERT INTO households (name, description)
  VALUES ('Casa dos Pais', 'Casa no interior')
  RETURNING id
)
INSERT INTO user_households (user_id, household_id, role)
SELECT 'SEU_USER_ID_AQUI'::uuid, id, 'owner'
FROM new_household
RETURNING *;

-- VERIFICAÇÃO: Ver suas casas criadas
SELECT 
  h.id,
  h.name,
  h.description,
  uh.role,
  h.created_at
FROM households h
JOIN user_households uh ON h.id = uh.household_id
JOIN auth.users u ON uh.user_id = u.id
WHERE u.email = 'seu.email@exemplo.com'; -- Substitua pelo seu email

-- OPCIONAL: Migrar dados existentes para uma casa específica
-- ⚠️ Substitua 'ID_DA_CASA' pelo UUID da casa que você quer usar como padrão
/*
DO $$
DECLARE
  default_household_id UUID := 'ID_DA_CASA'::uuid;
BEGIN
  UPDATE categories SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE items SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE shopping_list_items SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE cart_items SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE purchases SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE purchase_items SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE pantry_items SET household_id = default_household_id WHERE household_id IS NULL;
  
  RAISE NOTICE 'Dados migrados para household %', default_household_id;
END $$;
*/
