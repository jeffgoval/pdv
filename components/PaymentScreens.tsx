import React from 'react';
import { motion } from 'framer-motion';
import { PageShell } from './PageShell';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

interface PaymentMethodScreenProps {
  total: number;
  onSelect: (method: 'pix' | 'link' | 'cash') => void;
  onBack: () => void;
}

export const PaymentMethodScreen: React.FC<PaymentMethodScreenProps> = ({
  total,
  onSelect,
  onBack,
}) => {
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });

  return (
    <PageShell title="Forma de pagamento" onBack={onBack}>
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 px-5 py-4 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
              Total da venda
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect('pix')}
            className="w-full rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-5 py-4 flex items-center justify-between hover:border-emerald-600 hover:bg-emerald-100 transition-all shadow-sm"
            aria-label="Selecionar pagamento via PIX"
          >
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg font-bold">
                ⬢
              </span>
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold text-gray-900">
                  PIX imediato
                </span>
                <span className="text-xs text-gray-600 font-medium">
                  QR dinâmico via Asaas
                </span>
              </div>
            </div>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-100 px-2 py-1 rounded-full">
              Recomendado
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect('link')}
            className="w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all"
            aria-label="Selecionar pagamento via link"
          >
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-lg">
                🔗
              </span>
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold text-gray-900">
                  Link de pagamento
                </span>
                <span className="text-xs text-gray-600 font-medium">
                  Cartão ou PIX pelo celular do cliente
                </span>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect('cash')}
            className="w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all"
            aria-label="Selecionar pagamento em dinheiro"
          >
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-lg">
                💵
              </span>
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold text-gray-900">
                  Dinheiro
                </span>
                <span className="text-xs text-gray-600 font-medium">
                  Você confirma manualmente o recebimento
                </span>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </PageShell>
  );
};

interface PaymentWaitingScreenProps {
  total: number;
  method: string;
  saleId: string | null;
  onBack: () => void;
  onPaymentConfirmed: () => void;
}

export const PaymentWaitingScreen: React.FC<PaymentWaitingScreenProps> = ({
  total,
  method,
  saleId,
  onBack,
  onPaymentConfirmed,
}) => {
  useEffect(() => {
    if (!saleId) return;

    // 1. Realtime Subscription
    const channel = supabase
      .channel('payment-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
          filter: `sale_id=eq.${saleId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          if (newStatus === 'PAID') {
            onPaymentConfirmed();
          }
        }
      )
      .subscribe();

    // 2. Polling Fallback (every 3s)
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('payments')
        .select('status')
        .eq('sale_id', saleId)
        .single();

      if (data?.status === 'PAID') {
        onPaymentConfirmed();
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [saleId, onPaymentConfirmed]);
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });

  return (
    <PageShell title="Aguardando pagamento" onBack={onBack}>
      <div className="flex flex-col gap-6 items-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-sm text-gray-600 font-semibold mb-2">
            Mostre este QR code para o cliente
          </span>
          <div className="rounded-3xl border-2 border-gray-200 bg-white p-6 inline-flex shadow-lg">
            <div className="h-48 w-48 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center border-2 border-gray-100">
              <div className="h-40 w-40 bg-white rounded-xl grid grid-cols-4 grid-rows-4 gap-1 p-3 border-2 border-gray-200">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${i % 3 === 0 ? 'bg-gray-900' : 'bg-gray-100'}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 max-w-xs text-center mt-2 font-medium">
            Este é um QR ilustrativo. No projeto real, aqui entra o QR code
            dinâmico retornado pela API do Asaas.
          </p>
        </div>

        <div className="w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
              Total
            </span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(total)}
            </span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
              Método
            </span>
            <span className="text-xs text-gray-900 font-bold uppercase">
              {method === 'pix'
                ? 'PIX'
                : method === 'link'
                  ? 'Link'
                  : 'Dinheiro'}
            </span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            className="w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-3 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all"
            aria-label="Copiar código PIX"
          >
            <span className="text-sm font-bold text-gray-900">
              Copiar código PIX
            </span>
            <span className="text-xs text-gray-500 font-medium">
              copia e cola
            </span>
          </button>
          <button
            className="w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-3 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all"
            aria-label="Enviar link pelo WhatsApp"
          >
            <span className="text-sm font-bold text-gray-900">
              Enviar link pelo WhatsApp
            </span>
            <span className="text-xs text-gray-500 font-medium">
              compartilhar
            </span>
          </button>
        </div>
      </div>
    </PageShell>
  );
};

interface PaymentConfirmationScreenProps {
  total: number;
  onNewSale: () => void;
}

export const PaymentConfirmationScreen: React.FC<
  PaymentConfirmationScreenProps
> = ({ total, onNewSale }) => {
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });

  return (
    <PageShell title="Pagamento recebido">
      <div className="flex flex-col items-center mt-8 gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          className="h-20 w-20 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center shadow-lg"
        >
          <span className="text-4xl">✅</span>
        </motion.div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">
            Pagamento aprovado
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            {formatCurrency(total)} recebidos
          </p>
        </div>

        <div className="w-full flex flex-col gap-3 mt-2">
          <button
            className="w-full rounded-2xl bg-emerald-500 text-white px-5 py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-sm"
            aria-label="Enviar recibo"
          >
            Enviar recibo
            <span>🧾</span>
          </button>
          <button
            onClick={onNewSale}
            className="w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 text-gray-900 font-bold text-sm hover:border-blue-300 hover:shadow-sm transition-all"
            aria-label="Iniciar nova venda"
          >
            Nova venda
          </button>
        </div>
      </div>
    </PageShell>
  );
};
