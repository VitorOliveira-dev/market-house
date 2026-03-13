/**
 * Debug Household Access
 * Script para verificar o acesso a households do usuário atual
 */

import { supabase } from '@/lib/supabase';

export async function debugHouseholdAccess() {
  console.log('🔍 Iniciando debug de household access...\n');

  // 1. Verificar usuário atual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('❌ Erro ao obter usuário:', userError);
    return;
  }

  console.log('✅ Usuário logado:', {
    id: user.id,
    email: user.email,
  });
  console.log('');

  // 2. Verificar user_households
  console.log('🔍 Verificando user_households...');
  const { data: userHouseholds, error: uhError } = await supabase
    .from('user_households')
    .select('*');
  
  console.log('Query user_households:', {
    data: userHouseholds,
    error: uhError,
    count: userHouseholds?.length || 0,
  });
  console.log('');

  // 3. Verificar households diretamente
  console.log('🔍 Verificando households...');
  const { data: households, error: hError } = await supabase
    .from('households')
    .select('*');
  
  console.log('Query households:', {
    data: households,
    error: hError,
    count: households?.length || 0,
  });
  console.log('');

  // 4. Tentar query com embedded - sintaxe correta
  console.log('🔍 Tentando query embedded (sintaxe com !)...');
  const { data: embedded1, error: e1 } = await supabase
    .from('user_households')
    .select(`
      role,
      households!household_id (
        id,
        name,
        description
      )
    `);
  
  console.log('Query embedded com !:', {
    data: embedded1,
    error: e1,
  });
  console.log('');

  // 5. Tentar query com join manual
  console.log('🔍 Tentando query com join manual...');
  const { data: joined, error: jError } = await supabase
    .from('user_households')
    .select('*, households(*)');
  
  console.log('Query com join:', {
    data: joined,
    error: jError,
  });
  console.log('');

  // 6. Verificar RLS com query raw
  console.log('🔍 Verificando se RLS está ativa...');
  const { data: rlsCheck, error: rlsError } = await supabase.rpc('pg_policies', {});
  
  console.log('RLS Check:', {
    error: rlsError,
    note: 'Se houver erro, é esperado. RLS está ativa.',
  });
  console.log('');

  // 7. Mostrar IDs para verificação manual
  console.log('📋 IDs para verificação no Supabase SQL Editor:');
  console.log(`
-- Execute no SQL Editor do Supabase:
SELECT 
  u.id as user_id,
  u.email,
  uh.household_id,
  uh.role,
  h.name as household_name
FROM auth.users u
LEFT JOIN user_households uh ON u.id = uh.user_id
LEFT JOIN households h ON uh.household_id = h.id
WHERE u.id = '${user.id}';
  `);

  return {
    user,
    userHouseholds,
    households,
    embedded1,
    joined,
  };
}

/**
 * Função auxiliar para executar diretamente no console
 */
export async function runDebug() {
  try {
    const result = await debugHouseholdAccess();
    console.log('\n✅ Debug concluído!');
    return result;
  } catch (error) {
    console.error('\n❌ Erro durante debug:', error);
    throw error;
  }
}
