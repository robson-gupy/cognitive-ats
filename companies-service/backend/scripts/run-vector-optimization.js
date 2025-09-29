#!/usr/bin/env node

/**
 * Script para executar a otimização da busca vetorial
 * Executa a migration e atualiza embeddings existentes
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando otimização da busca vetorial...\n');

try {
  // 1. Executar migration
  console.log('📦 Executando migration de otimização...');
  execSync('npm run migration:run', { stdio: 'inherit' });
  console.log('✅ Migration executada com sucesso\n');

  // 2. Verificar se as colunas foram criadas
  console.log('🔍 Verificando estrutura do banco...');
  execSync('npm run typeorm schema:log', { stdio: 'inherit' });
  console.log('✅ Verificação concluída\n');

  console.log('🎉 Otimização da busca vetorial concluída!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Execute o endpoint POST /jobs/update-all-embeddings para atualizar embeddings existentes');
  console.log('2. Teste a busca vetorial com threshold 0.8 (mais rigoroso)');
  console.log('3. Monitore os logs para verificar a performance\n');

} catch (error) {
  console.error('❌ Erro durante a otimização:', error.message);
  process.exit(1);
}
