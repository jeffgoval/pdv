import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageShell } from './PageShell';
import { supabase } from '@/lib/supabase';
import { useDialog } from '@/contexts/DialogContext';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface NewSaleScreenProps {
  cart: CartItem[];
  onAdd: (product: Product) => void;
  onRemove: (product: Product) => void;
  onFinalize: () => void;
  onBack: () => void;
}

export const NewSaleScreen: React.FC<NewSaleScreenProps> = ({
  cart,
  onAdd,
  onRemove,
  onFinalize,
  onBack,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { showError } = useDialog();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock')
        .eq('is_active', true)
        .gt('stock', 0)
        .order('name');

      if (error) {
        await showError(
          'Não foi possível carregar os produtos. Verifique sua conexão.',
          'Erro ao carregar produtos'
        );
        return;
      }

      if (data) {
        setProducts(data);
      }
    } catch (error: any) {
      await showError(
        `Erro inesperado: ${error?.message || 'Tente novamente.'}`,
        'Erro'
      );
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });

  return (
    <PageShell title="Nova venda" onBack={onBack}>
      <div className="flex flex-col gap-4 relative flex-1">
        <div className="rounded-2xl border-2 border-gray-200 bg-white divide-y-2 divide-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-3"></div>
              <p className="text-sm text-gray-600 font-medium">
                Carregando produtos...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-4xl mb-3 block">📦</span>
              <p className="text-sm text-gray-600 font-medium">
                Nenhum produto disponível.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Adicione produtos na tela de produtos
              </p>
            </div>
          ) : (
            products.map((p) => {
              const cartItem = cart.find((c) => c.product.id === p.id);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {p.name}
                    </span>
                    <span className="text-xs text-gray-600 font-medium">
                      {formatCurrency(p.price)} · {p.stock} em estoque
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {cartItem && (
                      <button
                        onClick={() => onRemove(p)}
                        className="h-9 w-9 rounded-full border-2 border-gray-300 text-base font-bold flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={`Remover ${p.name} do carrinho`}
                      >
                        −
                      </button>
                    )}
                    <motion.span
                      key={cartItem?.quantity ?? 0}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="min-w-[28px] text-center text-base text-gray-900 font-bold"
                    >
                      {cartItem?.quantity ?? 0}
                    </motion.span>
                    <button
                      onClick={() => onAdd(p)}
                      className="h-9 w-9 rounded-full bg-blue-600 text-white text-base font-bold flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label={`Adicionar ${p.name} ao carrinho`}
                    >
                      ＋
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AnimatePresence>
        {total > 0 && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="absolute inset-x-0 bottom-0 px-4 pb-4"
          >
            <div className="rounded-2xl border-2 border-blue-200 bg-white backdrop-blur shadow-lg px-5 py-4 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                  Total da venda
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(total)}
                </span>
              </div>
              <button
                onClick={onFinalize}
                className="rounded-xl bg-blue-600 text-white text-sm font-bold px-5 py-3 flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Finalizar venda"
              >
                Finalizar
                <span>→</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};
