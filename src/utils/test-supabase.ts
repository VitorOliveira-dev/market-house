/**
 * Supabase Connection Test Utility
 * Call testSupabase() in the browser console to test your connection
 */

import { supabase } from '@/lib/supabase';

export async function testSupabase() {
  console.log('🔍 Iniciando testes de conexão com Supabase...\n');
  
  let totalTests = 0;
  let passedTests = 0;

  // Test 1: Environment Variables
  console.log('📋 Teste 1: Variáveis de Ambiente');
  totalTests++;
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ FALHOU: Variáveis não configuradas');
    console.log('   Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no arquivo .env\n');
    return;
  }
  
  console.log('✅ PASSOU: Variáveis configuradas');
  console.log(`   URL: ${supabaseUrl.substring(0, 40)}...`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);
  passedTests++;

  // Test 2: Supabase Client
  console.log('📋 Teste 2: Cliente Supabase');
  totalTests++;
  if (!supabase) {
    console.error('❌ FALHOU: Cliente não inicializado\n');
    return;
  }
  console.log('✅ PASSOU: Cliente inicializado com sucesso\n');
  passedTests++;

  // Test 3: Database Connection
  console.log('📋 Teste 3: Conexão com Banco de Dados');
  totalTests++;
  try {
    const { data, error, count } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: false })
      .limit(1);

    if (error) {
      console.error('❌ FALHOU: Erro ao conectar');
      console.error(`   ${error.message}`);
      console.log('\n💡 Dica: Certifique-se de que você executou o SQL schema no painel do Supabase\n');
    } else {
      console.log('✅ PASSOU: Conexão OK');
      console.log(`   Tabela 'categories' encontrada com ${count ?? 0} registro(s)\n`);
      passedTests++;
    }
  } catch (err: any) {
    console.error('❌ FALHOU: Erro ao conectar');
    console.error(`   ${err?.message || 'Erro desconhecido'}\n`);
  }

  // Test 4: Other Tables
  console.log('📋 Teste 4: Verificação de Tabelas');
  totalTests++;
  const tables = ['items', 'shopping_list_items', 'cart_items', 'pantry_items', 'purchases', 'purchase_items'];
  let allTablesOk = true;

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .limit(1);
      
      if (error) {
        console.error(`   ❌ ${table}: ${error.message}`);
        allTablesOk = false;
      } else {
        console.log(`   ✅ ${table}`);
      }
    } catch (err: any) {
      console.error(`   ❌ ${table}: ${err?.message}`);
      allTablesOk = false;
    }
  }
  
  if (allTablesOk) {
    console.log('✅ PASSOU: Todas as tabelas OK\n');
    passedTests++;
  } else {
    console.error('❌ FALHOU: Algumas tabelas com erro\n');
  }

  // Test 5: Authentication
  console.log('📋 Teste 5: Autenticação');
  totalTests++;
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ FALHOU: Erro ao verificar sessão');
      console.error(`   ${error.message}\n`);
    } else if (session) {
      console.log('✅ PASSOU: Usuário autenticado');
      console.log(`   Email: ${session.user.email}\n`);
      passedTests++;
    } else {
      console.log('✅ PASSOU: Sistema de auth configurado');
      console.log('   Sem sessão ativa (normal para início)\n');
      passedTests++;
    }
  } catch (err: any) {
    console.error('❌ FALHOU: Erro ao verificar autenticação');
    console.error(`   ${err?.message || 'Erro desconhecido'}\n`);
  }

  // Summary
  console.log('═══════════════════════════════════════');
  console.log('📊 RESUMO DOS TESTES');
  console.log('═══════════════════════════════════════');
  console.log(`Total: ${totalTests} testes`);
  console.log(`✅ Passou: ${passedTests}`);
  console.log(`❌ Falhou: ${totalTests - passedTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Parabéns! Seu Supabase está configurado corretamente!');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique os erros acima.');
    console.log('\n📖 Passos para configurar:');
    console.log('   1. Crie um projeto no https://supabase.com');
    console.log('   2. Vá em SQL Editor e execute o arquivo src/lib/supabase-schema.sql');
    console.log('   3. Copie a URL e chave anon do Settings > API');
    console.log('   4. Configure no arquivo .env\n');
  }
}

// Expose to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).testSupabase = testSupabase;
  console.log('💡 Digite testSupabase() no console para testar a conexão com Supabase');
}
