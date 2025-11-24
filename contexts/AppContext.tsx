'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useDialog } from './DialogContext';

// Types
export type ViewId =
  | 'login'
  | 'dashboard'
  | 'products'
  | 'new-sale'
  | 'payment-method'
  | 'payment-waiting'
  | 'payment-confirmation'
  | 'sales-history'
  | 'profile';

export type NavTab = 'dashboard' | 'products' | 'profile';

export type PaymentMethod = 'pix' | 'link' | 'cash';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface AppContextType {
  // View state
  view: ViewId;
  setView: (view: ViewId) => void;
  navigateToTab: (tab: NavTab) => void;

  // Cart state
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (product: Product) => void;
  clearCart: () => void;
  cartTotal: number;

  // Payment state
  paymentMethod: PaymentMethod | null;
  currentSaleId: string | null;
  setPaymentMethod: (method: PaymentMethod | null) => void;
  setCurrentSaleId: (id: string | null) => void;

  // Store state
  storeId: string | null;

  // Actions
  createSale: (method: PaymentMethod) => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, signOut } = useAuth();
  const { showError } = useDialog();

  // View state
  const [view, setView] = useState<ViewId>('login');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null);

  // Store state
  const [storeId, setStoreId] = useState<string | null>(null);

  // Load user's store when authenticated
  useEffect(() => {
    const loadUserStore = async () => {
      if (!user) {
        setStoreId(null);
        setView('login');
        return;
      }

      try {
        // Get or create store for this user
        const { data: stores, error } = await supabase
          .from('stores')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (error) {
          await showError(
            'Erro ao carregar informações da loja.',
            'Erro de autenticação'
          );
          return;
        }

        if (stores && stores.length > 0) {
          setStoreId(stores[0].id);
          setView('dashboard');
        } else {
          // Create store for new user
          const { data: newStore, error: createError } = await supabase
            .from('stores')
            .insert({
              user_id: user.id,
              name: 'Minha Loja',
              address: {},
              business_hours: {},
            })
            .select()
            .single();

          if (createError) {
            await showError(
              'Erro ao criar loja. Tente fazer login novamente.',
              'Erro'
            );
            return;
          }

          if (newStore) {
            setStoreId(newStore.id);
            setView('dashboard');
          }
        }
      } catch (error: any) {
        await showError(
          `Erro inesperado: ${error?.message || 'Tente novamente.'}`,
          'Erro'
        );
      }
    };

    loadUserStore();
  }, [user, showError]);

  // Navigate to tab
  const navigateToTab = (tab: NavTab) => {
    setView(tab);
  };

  // Cart actions
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (!existing) {
        if (product.stock < 1) return prev;
        return [...prev, { product, quantity: 1 }];
      }

      if (existing.quantity >= product.stock) {
        return prev;
      }

      return prev.map((i) =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    });
  };

  const removeFromCart = (product: Product) => {
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

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  // Create sale action
  const createSale = async (selectedMethod: PaymentMethod) => {
    setPaymentMethod(selectedMethod);

    try {
      let effectiveStoreId = storeId;

      if (!effectiveStoreId) {
        const { data: stores, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .limit(1);

        if (storeError) {
          await showError(
            'Erro ao buscar informações da loja. Tente novamente.',
            'Erro na venda'
          );
          return;
        }

        if (stores?.[0]?.id) {
          effectiveStoreId = stores[0].id;
          setStoreId(effectiveStoreId);
        } else {
          await showError(
            'Nenhuma loja encontrada. Configure sua loja primeiro.',
            'Loja não encontrada'
          );
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
          p_total: cartTotal,
          p_items: rpcItems,
          p_payment_method: dbMethod,
        }
      );

      if (error) {
        await showError(
          `Não foi possível criar a venda. ${error.message || 'Tente novamente.'}`,
          'Erro ao criar venda'
        );
        return;
      }

      const { sale_id, status } = result as any;
      setCurrentSaleId(sale_id);

      if (status === 'PAID') {
        setView('payment-confirmation');
      } else {
        setView('payment-waiting');
      }
    } catch (error: any) {
      await showError(
        `Erro inesperado ao processar a venda: ${error?.message || 'Tente novamente.'}`,
        'Erro'
      );
    }
  };

  // Logout action
  const logout = async () => {
    await signOut();
    clearCart();
    setStoreId(null);
    setPaymentMethod(null);
    setCurrentSaleId(null);
    setView('login');
  };

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        navigateToTab,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        paymentMethod,
        currentSaleId,
        setPaymentMethod,
        setCurrentSaleId,
        storeId,
        createSale,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
