import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais do Supabase não encontradas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  console.log('🔍 Verificando produtos no Supabase...\n');

  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, stock, is_active')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    return;
  }

  console.log(`✅ Produtos ativos encontrados: ${data?.length || 0}\n`);

  if (data && data.length > 0) {
    console.log('Produtos:');
    data.forEach((p) => {
      console.log(`  - ${p.name} | R$ ${p.price.toFixed(2)} | Estoque: ${p.stock}`);
    });
  } else {
    console.log('⚠️  Nenhum produto ativo no banco de dados.');
    console.log('💡 Use a tela de Produtos no app para adicionar produtos.');
  }
}

checkProducts();
