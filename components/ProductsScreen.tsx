import React, { useEffect, useState } from 'react';
import { PageShell } from './PageShell';
import { supabase } from '@/lib/supabase';
import { ProductForm } from './ProductForm';
import { useDialog } from '@/contexts/DialogContext';

type NavTab = 'dashboard' | 'products' | 'profile';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface ProductsScreenProps {
  onBack: () => void;
  activeTab?: NavTab;
  onNavigate?: (tab: NavTab) => void;
}

export const ProductsScreen: React.FC<ProductsScreenProps> = ({
  onBack,
  activeTab,
  onNavigate,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(
    undefined
  );
  const { showConfirm, showError } = useDialog();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .eq('is_active', true)
      .order('name');

    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm(
      'Tem certeza que deseja excluir este produto?',
      'Confirmar exclusão'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      await showError('Erro ao excluir produto');
    } else {
      fetchProducts();
    }
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });

  return (
    <PageShell
      title="Produtos"
      onBack={onBack}
      activeTab={activeTab}
      onNavigate={onNavigate}
    >
      <div className="flex flex-col gap-4">
        <button
          onClick={handleAdd}
          className="w-full rounded-2xl border-2 border-dashed border-gray-300 bg-white px-4 py-4 flex items-center justify-between hover:border-blue-400 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Adicionar novo produto"
        >
          <span className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-full border-2 border-gray-400 flex items-center justify-center text-base text-gray-700 font-bold">
              ＋
            </span>
            <span className="text-sm font-bold text-gray-800">
              Novo produto
            </span>
          </span>
        </button>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="p-8 text-center bg-white rounded-2xl border-2 border-gray-200">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-3"></div>
              <p className="text-sm text-gray-600 font-medium">
                Carregando produtos...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border-2 border-gray-200">
              <span className="text-4xl mb-3 block">📦</span>
              <p className="text-sm text-gray-600 font-medium">
                Nenhum produto encontrado.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Adicione seu primeiro produto acima
              </p>
            </div>
          ) : (
            products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-5 py-4 bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-gray-900">
                    {p.name}
                  </span>
                  <span className="text-xs text-gray-700 font-medium">
                    {formatCurrency(p.price)} · estoque {p.stock}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                    aria-label={`Editar produto ${p.name}`}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
                    aria-label={`Excluir produto ${p.name}`}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isFormOpen && (
        <ProductForm
          key={editingProduct?.id || 'new'}
          product={editingProduct}
          onSave={() => {
            setIsFormOpen(false);
            fetchProducts();
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </PageShell>
  );
};
