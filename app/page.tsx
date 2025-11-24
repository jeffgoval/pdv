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
  const [storeId, setStoreId] = useState<string | null>(null);

  // Auto-create store on mount if needed and cache ID
  useEffect(() => {
    const ensureStore = async () => {
      const { data: stores } = await supabase
        .from('stores')
        .select('id')
        .limit(1);

      if (stores && stores.length > 0) {
        setStoreId(stores[0].id);
      } else {
        console.log('No store found. Creating default store...');
        // Logic to create store is in handleLogin, maybe move here or keep simple
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
        const { data: newStore } = await supabase
          .from('stores')
          .insert({
            user_id: user.id,
            name: 'Minha Loja',
            address: {},
            business_hours: {},
          })
          .select()
          .single();

        if (newStore) setStoreId(newStore.id);
      }
    } else {
      setStoreId(stores[0].id);
    }
    setView('dashboard');
  };

  const handleNavigate = (tab: NavTab) => {
    setView(tab);
  };

  const handleAdd = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (!existing) {
        if (product.stock < 1) return prev; // Should not happen due to filter, but safe
        return [...prev, { product, quantity: 1 }];
      }

      if (existing.quantity >= product.stock) {
        // Optional: Show toast/alert here
        return prev;
      }

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

    // Optimistic UI: Show loading state or transition immediately if possible
    // For now, we just want the network request to be fast.

    let effectiveStoreId = storeId;

    if (!effectiveStoreId) {
      console.error('Nenhuma loja encontrada (ID não carregado)');
      // Try to fetch one last time
      const { data: stores } = await supabase
        .from('stores')
        .select('id')
        .limit(1);
      if (stores?.[0]?.id) {
        effectiveStoreId = stores[0].id;
        setStoreId(effectiveStoreId);
      } else {
        return;
      }
    }

    // Prepare items for RPC
    const rpcItems = cart.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      total: item.product.price * item.quantity,
      product_name: item.product.name,
    }));

    const dbMethod =
      selectedMethod === 'cash'
        ? 'CASH'
        : selectedMethod === 'pix'
          ? 'PIX'
          : 'CREDIT_CARD';

    const { data: result, error } = await supabase.rpc(
      'create_sale_transaction',
      {
        p_store_id: effectiveStoreId,
        p_total: total,
        p_items: rpcItems,
        p_payment_method: dbMethod,
      }
    );

    if (error) {
      console.error('Error creating sale transaction:', error);
      alert('Erro ao criar venda: ' + error.message);
      return;
    }

    const { sale_id, status } = result as any;
    setCurrentSaleId(sale_id);

    if (status === 'PAID') {
      setView('payment-confirmation');
    } else {
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
          saleId={currentSaleId}
          onBack={() => setView('payment-method')}
          onPaymentConfirmed={() => setView('payment-confirmation')}
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
