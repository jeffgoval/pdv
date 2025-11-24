import React, { useEffect, useState } from 'react';
import { PageShell } from './PageShell';
import { supabase } from '@/lib/supabase';

type NavTab = 'dashboard' | 'products' | 'profile';

interface Sale {
  id: string;
  created_at: string;
  total: number;
  status: string;
}

interface SalesHistoryScreenProps {
  onBack: () => void;
  activeTab?: NavTab;
  onNavigate?: (tab: NavTab) => void;
}

export const SalesHistoryScreen: React.FC<SalesHistoryScreenProps> = ({
  onBack,
  activeTab,
  onNavigate,
}) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('id, created_at, total, status')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setSales(data);
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <PageShell
      title="Histórico de vendas"
      onBack={onBack}
      activeTab={activeTab}
      onNavigate={onNavigate}
    >
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="p-8 text-center bg-white rounded-2xl border-2 border-gray-200">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-3"></div>
            <p className="text-sm text-gray-600 font-medium">
              Carregando vendas...
            </p>
          </div>
        ) : sales.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border-2 border-gray-200">
            <span className="text-4xl mb-3 block">📋</span>
            <p className="text-sm text-gray-600 font-medium">
              Nenhuma venda encontrada.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              As vendas aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-gray-200 bg-white divide-y-2 divide-gray-100 shadow-sm overflow-hidden">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-gray-900">
                    {formatDate(sale.created_at)}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    #{sale.id.slice(0, 8)}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-base font-bold text-gray-900">
                    {formatCurrency(sale.total)}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      sale.status === 'PAID'
                        ? 'text-emerald-700 bg-emerald-100'
                        : 'text-amber-700 bg-amber-100'
                    }`}
                  >
                    {sale.status === 'PAID' ? 'PAGO' : sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};
