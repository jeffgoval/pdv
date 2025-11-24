import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PageShell } from './PageShell';
import { supabase } from '@/lib/supabase';

type NavTab = 'dashboard' | 'products' | 'profile';

interface DashboardScreenProps {
  onNewSale: () => void;
  onGoProducts: () => void;
  onGoSalesHistory: () => void;
  activeTab?: NavTab;
  onNavigate?: (tab: NavTab) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNewSale,
  onGoProducts,
  onGoSalesHistory,
  activeTab,
  onNavigate,
}) => {
  const [metrics, setMetrics] = useState({
    todaySales: 0,
    todayRevenue: 0,
    pixRevenue: 0,
    pixCount: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        // Get today's sales
        const { data: sales, error: salesError } = await supabase
          .from('sales')
          .select('total, status')
          .gte('created_at', todayISO);

        if (salesError) {
          console.error('Error fetching sales:', salesError);
          return;
        }

        if (sales) {
          const todaySales = sales.filter((s) => s.status === 'PAID').length;
          const todayRevenue = sales
            .filter((s) => s.status === 'PAID')
            .reduce((sum, s) => sum + (s.total || 0), 0);

          setMetrics({
            todaySales,
            todayRevenue,
            pixRevenue: 0,
            pixCount: 0,
          });
        }
      } catch (error) {
        console.error('Error in fetchMetrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });

  return (
    <PageShell
      title="Resumo do dia"
      activeTab={activeTab}
      onNavigate={onNavigate}
    >
      <section className="flex flex-col gap-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onNewSale}
          className="w-full rounded-2xl bg-blue-600 text-white text-base font-bold py-4 flex items-center justify-center gap-2 shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Iniciar nova venda"
        >
          <span className="text-xl">＋</span>
          Nova venda
        </motion.button>

        <div className="grid grid-cols-2 gap-4">
          <motion.div
            layout
            className="rounded-2xl border-2 border-gray-200 bg-white p-5 flex flex-col gap-2 shadow-sm"
          >
            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
              Vendas de hoje
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(metrics.todayRevenue)}
            </span>
            <span className="text-sm text-blue-600 font-bold">
              {metrics.todaySales} vendas
            </span>
          </motion.div>
          <motion.div
            layout
            className="rounded-2xl border-2 border-gray-200 bg-white p-5 flex flex-col gap-2 shadow-sm"
          >
            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
              Recebido via PIX
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(metrics.pixRevenue)}
            </span>
            <span className="text-sm text-gray-600 font-bold">
              {metrics.pixCount} pendentes
            </span>
          </motion.div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            Atalhos rápidos
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={onNewSale}
            className="rounded-2xl border-2 border-gray-200 bg-white p-4 flex flex-col items-start gap-2 hover:border-blue-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Nova venda"
          >
            <span className="rounded-full bg-blue-100 text-blue-600 text-base px-2 py-1">
              ⚡
            </span>
            <span className="text-xs text-gray-700 font-bold">Nova venda</span>
          </button>
          <button
            onClick={onGoProducts}
            className="rounded-2xl border-2 border-gray-200 bg-white p-4 flex flex-col items-start gap-2 hover:border-blue-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Ver produtos"
          >
            <span className="rounded-full bg-gray-100 text-gray-700 text-base px-2 py-1">
              📦
            </span>
            <span className="text-xs text-gray-700 font-bold">Produtos</span>
          </button>
          <button
            onClick={onGoSalesHistory}
            className="rounded-2xl border-2 border-gray-200 bg-white p-4 flex flex-col items-start gap-2 hover:border-blue-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Ver histórico de vendas"
          >
            <span className="rounded-full bg-gray-100 text-gray-700 text-base px-2 py-1">
              🧾
            </span>
            <span className="text-xs text-gray-700 font-bold">Vendas</span>
          </button>
        </div>
      </section>
    </PageShell>
  );
};
