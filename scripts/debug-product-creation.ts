import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function run() {
  console.log('--- Debugging Product Creation ---');

  // Simulate Frontend State
  const name = 'Debug Shirt';
  const priceInput = '10'; // User types 10
  const stockInput = '10'; // User types 10

  // Simulate Frontend Logic
  const price = parseFloat(priceInput.replace(',', '.'));
  const stock = parseInt(stockInput);

  console.log(`Input Price: "${priceInput}" -> Parsed: ${price}`);
  console.log(`Input Stock: "${stockInput}" -> Parsed: ${stock}`);

  // Get Store
  const { data: stores } = await supabase.from('stores').select('id').limit(1);
  const storeId = stores?.[0]?.id;

  if (!storeId) {
    console.error('No store found');
    return;
  }

  // Insert
  const { data, error } = await supabase
    .from('products')
    .insert({
      store_id: storeId,
      name,
      price,
      stock,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Inserted Product:', data);
    console.log(`Saved Price: ${data.price}`);
    console.log(`Saved Stock: ${data.stock}`);
  }
}

run();
