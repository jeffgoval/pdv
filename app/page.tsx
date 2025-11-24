'use client';

import React, { useState, useEffect } from 'react';
import { LoginScreen } from '@/components/LoginScreen';
import { DashboardScreen } from '@/components/DashboardScreen';
import { ProductsScreen } from '@/components/ProductsScreen';
import { NewSaleScreen } from '@/components/NewSaleScreen';
import {
  PaymentMethodScreen,
  PaymentWaitingScreen,
  PaymentConfirmationScreen,
} from '@/components/PaymentScreens';
import { SalesHistoryScreen } from '@/components/SalesHistoryScreen';
import { ProfileScreen } from '@/components/ProfileScreen';
import { supabase } from '@/lib/supabase';

// ------------------------------------------------------
// Types
// ------------------------------------------------------

type ViewId =
  | 'login'
  | 'dashboard'
  | 'products'
  | 'new-sale'
  | 'payment-method'
  | 'payment-waiting'
  | 'payment-confirmation'
  | 'sales-history'
  | 'profile';

type NavTab = 'dashboard' | 'products' | 'profile';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

type CartItem = {
  product: Product;
  quantity: number;
};

// ------------------------------------------------------
// Root App (state machine)
// ------------------------------------------------------

const PDVRaizApp: React.FC = () => {
  const [view, setView] = useState<ViewId>('login');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [method, setMethod] = useState<'pix' | 'link' | 'cash' | null>(null);
  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null);

  // Auto-create store on mount if needed
  useEffect(() => {
    const ensureStore = async () => {
      const { data: stores } = await supabase
        .from('stores')
        .select('id')
        .limit(1);
      if (!stores || stores.length === 0) {
        console.log('No store found. Creating default store...');
      }
    };
    ensureStore();
  }, []);

  const handleLogin = async () => {
    // Check if store exists, if not create one
    const { data: stores } = await supabase
      .from('stores')
      .select('id')
      .limit(1);
    if (!stores || stores.length === 0) {
      const { data: user } = await supabase
        .from('users')
        .insert({
          name: 'Demo User',
          email: 'demo@pdvraiz.com',
          role: 'OWNER',
        })
        .select()
        .single();

      if (user) {
        await supabase.from('stores').insert({
          user_id: user.id,
          name: 'Minha Loja',
          address: {},
          business_hours: {},
        });
      }
    }
    setView('dashboard');
  };

  const handleNavigate = (tab: NavTab) => {
    setView(tab);
  };

  const handleAdd = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (!existing) return [...prev, { product, quantity: 1 }];
      return prev.map((i) =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    });
  };

  const handleRemove = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        return prev.filter((i) => i.product.id !== product.id);
      }
      return prev.map((i) =>
        i.product.id === product.id ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  const total = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handleCreateSale = async (selectedMethod: 'pix' | 'link' | 'cash') => {
    setMethod(selectedMethod);

    const { data: stores } = await supabase
      .from('stores')
      .select('id')
      .limit(1);
    const storeId = stores?.[0]?.id;

    if (!storeId) {
      // Error will be handled by dialog context if needed
      console.error('Nenhuma loja encontrada');
      return;
    }

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        store_id: storeId,
        total: total,
        status: 'PENDING',
      })
      .select()
      .single();

    if (saleError || !sale) {
      console.error('Error creating sale:', saleError);
      // Error will be handled by dialog context if needed
      return;
    }

    setCurrentSaleId(sale.id);

    const saleItems = cart.map((item) => ({
      sale_id: sale.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      total: item.product.price * item.quantity,
      product_name: item.product.name,
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) {
      console.error('Error creating items:', itemsError);
      // Error will be handled by dialog context if needed
      return;
    }

    if (selectedMethod === 'cash') {
      const { data: payment } = await supabase
        .from('payments')
        .insert({
          sale_id: sale.id,
          amount: total,
          method: 'CASH',
          status: 'PAID',
        })
        .select()
        .single();

      if (payment) {
        await supabase.rpc('process_payment', { payment_uuid: payment.id });
      }

      setView('payment-confirmation');
    } else {
      await supabase.from('payments').insert({
        sale_id: sale.id,
        amount: total,
        method: selectedMethod === 'pix' ? 'PIX' : 'CREDIT_CARD',
        status: 'PENDING',
      });

      setView('payment-waiting');
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-start p-4">
      {view === 'login' && <LoginScreen onLogin={handleLogin} />}

      {view === 'dashboard' && (
        <DashboardScreen
          onNewSale={() => {
            setCart([]);
            setView('new-sale');
          }}
          onGoProducts={() => setView('products')}
          onGoSalesHistory={() => setView('sales-history')}
          activeTab="dashboard"
          onNavigate={handleNavigate}
        />
      )}

      {view === 'products' && (
        <ProductsScreen
          onBack={() => setView('dashboard')}
          activeTab="products"
          onNavigate={handleNavigate}
        />
      )}

      {view === 'new-sale' && (
        <NewSaleScreen
          cart={cart}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onFinalize={() => setView('payment-method')}
          onBack={() => setView('dashboard')}
        />
      )}

      {view === 'payment-method' && (
        <PaymentMethodScreen
          total={total}
          onSelect={handleCreateSale}
          onBack={() => setView('new-sale')}
        />
      )}

      {view === 'payment-waiting' && method && (
        <PaymentWaitingScreen
          total={total}
          method={method}
          onBack={() => setView('payment-method')}
        />
      )}

      {view === 'payment-confirmation' && (
        <PaymentConfirmationScreen
          total={total}
          onNewSale={() => {
            setCart([]);
            setView('new-sale');
          }}
        />
      )}

      {view === 'sales-history' && (
        <SalesHistoryScreen
          onBack={() => setView('dashboard')}
          onNavigate={handleNavigate}
        />
      )}

      {view === 'profile' && (
        <ProfileScreen
          onBack={() => setView('dashboard')}
          activeTab="profile"
          onNavigate={handleNavigate}
          onLogout={() => setView('login')}
        />
      )}
    </div>
  );
};

export default PDVRaizApp;
