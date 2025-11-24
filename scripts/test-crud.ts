import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log('🚀 Starting Backend Verification Script...');

  // 1. Create/Get Store
  console.log('\n1. Checking Store...');
  let storeId: string;
  const { data: stores } = await supabase.from('stores').select('id').limit(1);

  if (stores && stores.length > 0) {
    storeId = stores[0].id;
    console.log(`✅ Found existing store: ${storeId}`);
  } else {
    console.log('ℹ️ No store found. Creating default store...');
    // Create dummy user first
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name: 'Test User',
        email: `test_${Date.now()}@pdvraiz.com`,
        role: 'OWNER',
      })
      .select()
      .single();

    if (userError || !user) {
      console.error('❌ Failed to create user:', userError);
      process.exit(1);
    }

    const { data: newStore, error: storeError } = await supabase
      .from('stores')
      .insert({
        user_id: user.id,
        name: 'Test Store',
        address: {},
        business_hours: {},
      })
      .select()
      .single();

    if (storeError || !newStore) {
      console.error('❌ Failed to create store:', storeError);
      process.exit(1);
    }
    storeId = newStore.id;
    console.log(`✅ Created new store: ${storeId}`);
  }

  // 2. Create Product
  console.log('\n2. Creating Product...');
  const productName = `Test Product ${Date.now()}`;
  const { data: product, error: prodError } = await supabase
    .from('products')
    .insert({
      store_id: storeId,
      name: productName,
      price: 10.5,
      stock: 100,
      is_active: true,
    })
    .select()
    .single();

  if (prodError || !product) {
    console.error('❌ Failed to create product:', prodError);
    process.exit(1);
  }
  console.log(`✅ Product created: ${product.name} (ID: ${product.id})`);

  // 3. Update Product
  console.log('\n3. Updating Product...');
  const { error: updateError } = await supabase
    .from('products')
    .update({
      price: 12.0,
      stock: 90,
    })
    .eq('id', product.id);

  if (updateError) {
    console.error('❌ Failed to update product:', updateError);
    process.exit(1);
  }
  console.log('✅ Product updated successfully');

  // 4. Create Sale
  console.log('\n4. Creating Sale...');
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      store_id: storeId,
      total: 24.0, // 2 items * 12.00
      status: 'PENDING',
    })
    .select()
    .single();

  if (saleError || !sale) {
    console.error('❌ Failed to create sale:', saleError);
    process.exit(1);
  }
  console.log(`✅ Sale created: ${sale.id}`);

  // 5. Add Sale Items
  console.log('\n5. Adding Sale Items...');
  const { error: itemError } = await supabase.from('sale_items').insert({
    sale_id: sale.id,
    product_id: product.id,
    quantity: 2,
    unit_price: 12.0,
    total: 24.0,
    product_name: product.name,
  });

  if (itemError) {
    console.error('❌ Failed to add sale items:', itemError);
    process.exit(1);
  }
  console.log('✅ Sale items added');

  // 6. Process Payment (and trigger stock update)
  console.log('\n6. Processing Payment...');
  const { data: payment, error: payError } = await supabase
    .from('payments')
    .insert({
      sale_id: sale.id,
      amount: 24.0,
      method: 'CASH',
      status: 'PAID',
    })
    .select()
    .single();

  if (payError || !payment) {
    console.error('❌ Failed to create payment:', payError);
    process.exit(1);
  }

  const { error: rpcError } = await supabase.rpc('process_payment', {
    payment_uuid: payment.id,
  });
  if (rpcError) {
    console.error('❌ Failed to process payment RPC:', rpcError);
    process.exit(1);
  }
  console.log('✅ Payment processed via RPC');

  // 7. Verify Stock Update
  console.log('\n7. Verifying Stock Update...');
  const { data: updatedProduct } = await supabase
    .from('products')
    .select('stock')
    .eq('id', product.id)
    .single();
  if (updatedProduct?.stock === 88) {
    // Started at 90, sold 2
    console.log(`✅ Stock updated correctly: ${updatedProduct.stock}`);
  } else {
    console.error(
      `❌ Stock mismatch! Expected 88, got ${updatedProduct?.stock}`
    );
    process.exit(1);
  }

  // 8. Delete Product (Soft Delete)
  console.log('\n8. Deleting Product...');
  const { error: deleteError } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', product.id);
  if (deleteError) {
    console.error('❌ Failed to delete product:', deleteError);
    process.exit(1);
  }
  console.log('✅ Product soft-deleted');

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

runTest();
