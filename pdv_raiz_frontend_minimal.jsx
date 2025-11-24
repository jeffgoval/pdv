"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ------------------------------------------------------
// Types
// ------------------------------------------------------

type ViewId =
  | "login"
  | "dashboard"
  | "products"
  | "new-sale"
  | "payment-method"
  | "payment-waiting"
  | "payment-confirmation"
  | "sales-history";

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
// Mock data helpers
// ------------------------------------------------------

const mockProducts: Product[] = [
  { id: "1", name: "Corte de cabelo", price: 40, stock: 99 },
  { id: "2", name: "Barba", price: 30, stock: 99 },
  { id: "3", name: "Combo Corte + Barba", price: 60, stock: 99 },
];

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

// ------------------------------------------------------
// Layout shell
// ------------------------------------------------------

const PageShell: React.FC<{ title: string; children: React.ReactNode; onBack?: () => void }> = ({
  title,
  children,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-800/60">
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-full border border-slate-700/70 w-8 h-8 flex items-center justify-center text-xs"
          >
            ←
          </button>
        )}
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
            PDV
          </span>
          <h1 className="text-base font-medium text-slate-50">{title}</h1>
        </div>
      </header>
      <main className="flex-1 px-4 pb-4 pt-3 flex flex-col gap-3 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

// ------------------------------------------------------
// Login
// ------------------------------------------------------

const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between px-6 py-6">
      <div className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-2"
        >
          <span className="inline-flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-[11px]">
              ⚡
            </span>
            Venda em até 6 toques
          </span>
          <h1 className="text-2xl font-semibold text-slate-50">
            PDV simples, direto do seu celular.
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mt-1">
            Registre vendas, gere PIX dinâmico e envie o comprovante pelo WhatsApp — sem maquininha e sem burocracia.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
        className="flex flex-col gap-3"
      >
        <button
          onClick={onLogin}
          className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/70 px-4 py-3.5 text-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
        >
          <span className="text-lg">💬</span>
          <span>Entrar com WhatsApp</span>
        </button>
        <button
          onClick={onLogin}
          className="w-full rounded-2xl border border-slate-700/70 bg-slate-950 px-4 py-3 text-xs text-slate-400"
        >
          Entrar com email
        </button>
        <p className="text-[11px] text-slate-500 text-center mt-1">
          Ao continuar, você aceita nossos termos e política de privacidade.
        </p>
      </motion.div>
    </div>
  );
};

// ------------------------------------------------------
// Dashboard
// ------------------------------------------------------

const DashboardScreen: React.FC<{
  onNewSale: () => void;
  onGoProducts: () => void;
  onGoSalesHistory: () => void;
}> = ({ onNewSale, onGoProducts, onGoSalesHistory }) => {
  return (
    <PageShell title="Resumo do dia">
      <section className="flex flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNewSale}
          className="w-full rounded-2xl bg-emerald-500 text-emerald-950 text-sm font-medium py-3.5 flex items-center justify-center gap-2 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
        >
          <span className="text-base">＋</span>
          Nova venda
        </motion.button>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <motion.div
            layout
            className="rounded-2xl border border-slate-800/80 bg-slate-900/60 px-3 py-3 flex flex-col gap-1"
          >
            <span className="text-[11px] text-slate-400">Vendas de hoje</span>
            <span className="text-lg font-semibold">R$ 320,00</span>
            <span className="text-[11px] text-emerald-400">8 vendas</span>
          </motion.div>
          <motion.div
            layout
            className="rounded-2xl border border-slate-800/80 bg-slate-900/40 px-3 py-3 flex flex-col gap-1"
          >
            <span className="text-[11px] text-slate-400">Recebido via PIX</span>
            <span className="text-lg font-semibold">R$ 280,00</span>
            <span className="text-[11px] text-slate-500">2 pendentes</span>
          </motion.div>
        </div>
      </section>

      <section className="mt-1 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Atalhos rápidos</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <button
            onClick={onNewSale}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/50 px-2.5 py-2 flex flex-col items-start gap-1"
          >
            <span className="rounded-full bg-emerald-500/10 text-emerald-400 text-xs px-1.5 py-0.5">
              ⚡
            </span>
            <span>Nova venda</span>
          </button>
          <button
            onClick={onGoProducts}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/40 px-2.5 py-2 flex flex-col items-start gap-1"
          >
            <span className="rounded-full bg-slate-800 text-slate-300 text-xs px-1.5 py-0.5">
              📦
            </span>
            <span>Produtos</span>
          </button>
          <button
            onClick={onGoSalesHistory}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/40 px-2.5 py-2 flex flex-col items-start gap-1"
          >
            <span className="rounded-full bg-slate-800 text-slate-300 text-xs px-1.5 py-0.5">
              🧾
            </span>
            <span>Vendas</span>
          </button>
        </div>
      </section>
    </PageShell>
  );
};

// ------------------------------------------------------
// Products
// ------------------------------------------------------

const ProductsScreen: React.FC<{ products: Product[] }> = ({ products }) => {
  return (
    <PageShell title="Produtos">
      <div className="flex flex-col gap-2">
        <button className="w-full rounded-2xl border border-dashed border-slate-700/80 bg-slate-950 px-3 py-2.5 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full border border-slate-700/70 flex items-center justify-center text-sm">
              ＋
            </span>
            Novo produto
          </span>
          <span className="text-[10px] text-slate-500">nome, preço, estoque</span>
        </button>

        <div className="mt-1 flex flex-col divide-y divide-slate-800/80 rounded-2xl border border-slate-800/80 bg-slate-950/60">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between px-3 py-2.5 text-xs"
            >
              <div className="flex flex-col">
                <span className="text-slate-100">{p.name}</span>
                <span className="text-[11px] text-slate-500">
                  {formatCurrency(p.price)} · estoque {p.stock}
                </span>
              </div>
              <button className="text-[11px] text-slate-400">Editar</button>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

// ------------------------------------------------------
// New Sale + Cart
// ------------------------------------------------------

const NewSaleScreen: React.FC<{
  products: Product[];
  cart: CartItem[];
  onAdd: (product: Product) => void;
  onRemove: (product: Product) => void;
  onFinalize: () => void;
}> = ({ products, cart, onAdd, onRemove, onFinalize }) => {
  const total = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <PageShell title="Nova venda">
      <div className="flex flex-col gap-3 pb-24">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 divide-y divide-slate-800/80">
          {products.map((p) => {
            const cartItem = cart.find((c) => c.product.id === p.id);
            return (
              <div
                key={p.id}
                className="flex items-center justify-between px-3 py-2.5 text-xs"
              >
                <div className="flex flex-col">
                  <span className="text-slate-100">{p.name}</span>
                  <span className="text-[11px] text-slate-500">
                    {formatCurrency(p.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {cartItem && (
                    <button
                      onClick={() => onRemove(p)}
                      className="h-7 w-7 rounded-full border border-slate-700/80 text-xs flex items-center justify-center"
                    >
                      −
                    </button>
                  )}
                  <motion.span
                    key={cartItem?.quantity ?? 0}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="min-w-[20px] text-center text-[11px] text-slate-300"
                  >
                    {cartItem?.quantity ?? 0}
                  </motion.span>
                  <button
                    onClick={() => onAdd(p)}
                    className="h-7 w-7 rounded-full bg-slate-100 text-slate-950 text-xs flex items-center justify-center"
                  >
                    ＋
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {total > 0 && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-x-0 bottom-0 px-4 pb-4"
          >
            <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/95 backdrop-blur shadow-lg shadow-emerald-500/20 px-3.5 py-3 flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400">
                  Total da venda
                </span>
                <span className="text-base font-semibold text-emerald-400">
                  {formatCurrency(total)}
                </span>
              </div>
              <button
                onClick={onFinalize}
                className="rounded-2xl bg-emerald-500 text-emerald-950 text-xs font-medium px-4 py-2 flex items-center gap-1"
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

// ------------------------------------------------------
// Payment Method
// ------------------------------------------------------

const PaymentMethodScreen: React.FC<{
  total: number;
  onSelect: (method: "pix" | "link" | "cash") => void;
}> = ({ total, onSelect }) => {
  return (
    <PageShell title="Forma de pagamento">
      <div className="flex flex-col gap-3">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 px-3 py-3 text-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400">Total da venda</span>
            <span className="text-base font-semibold text-slate-50">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect("pix")}
            className="w-full rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-emerald-500 text-emerald-950 flex items-center justify-center text-sm">
                ⬢
              </span>
              <div className="flex flex-col items-start">
                <span className="text-slate-50">PIX imediato</span>
                <span className="text-[11px] text-emerald-300">
                  QR dinâmico via Asaas
                </span>
              </div>
            </div>
            <span className="text-[11px] text-emerald-300">Recomendado</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect("link")}
            className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/70 px-3 py-2.5 text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-sm">
                🔗
              </span>
              <div className="flex flex-col items-start">
                <span className="text-slate-50">Link de pagamento</span>
                <span className="text-[11px] text-slate-400">
                  Cartão ou PIX pelo celular do cliente
                </span>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect("cash")}
            className="w-full rounded-2xl border border-slate-800/80 bg-slate-950 px-3 py-2.5 text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-sm">
                💵
              </span>
              <div className="flex flex-col items-start">
                <span className="text-slate-50">Dinheiro</span>
                <span className="text-[11px] text-slate-500">
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

// ------------------------------------------------------
// Payment Waiting
// ------------------------------------------------------

const PaymentWaitingScreen: React.FC<{ total: number; method: string }> = ({
  total,
  method,
}) => {
  return (
    <PageShell title="Aguardando pagamento">
      <div className="flex flex-col gap-4 items-center mt-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-slate-400 mb-1">
            Mostre este QR code para o cliente
          </span>
          <div className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-4 inline-flex">
            <div className="h-40 w-40 rounded-2xl bg-[radial-gradient(circle_at_10%_20%,rgba(45,212,191,0.3),transparent_60%),radial-gradient(circle_at_80%_0,rgba(129,140,248,0.35),transparent_55%)] flex items-center justify-center">
              <div className="h-32 w-32 bg-slate-950 rounded-xl grid grid-cols-4 grid-rows-4 gap-1 p-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-[3px] ${i % 3 === 0 ? "bg-slate-50" : "bg-slate-700"}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 max-w-xs text-center mt-1">
            Este é um QR ilustrativo. No projeto real, aqui entra o QR code dinâmico retornado pela API do Asaas.
          </p>
        </div>

        <div className="w-full rounded-2xl border border-slate-800/80 bg-slate-950/80 px-3 py-3 text-xs flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Total</span>
            <span className="text-sm font-semibold text-slate-50">
              {formatCurrency(total)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Método</span>
            <span className="text-[11px] text-slate-200 uppercase">
              {method === "pix" ? "PIX" : method === "link" ? "Link" : "Dinheiro"}
            </span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2 text-[11px]">
          <button className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/70 px-3 py-2 flex items-center justify-between">
            <span className="text-slate-200">Copiar código PIX</span>
            <span className="text-slate-500 text-[10px]">copia e cola</span>
          </button>
          <button className="w-full rounded-2xl border border-slate-800/80 bg-slate-950 px-3 py-2 flex items-center justify-between">
            <span className="text-slate-200">Enviar link pelo WhatsApp</span>
            <span className="text-slate-500 text-[10px]">compartilhar</span>
          </button>
        </div>
      </div>
    </PageShell>
  );
};

// ------------------------------------------------------
// Payment Confirmation
// ------------------------------------------------------

const PaymentConfirmationScreen: React.FC<{ total: number }> = ({ total }) => {
  return (
    <PageShell title="Pagamento recebido">
      <div className="flex flex-col items-center mt-10 gap-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 18 }}
          className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center"
        >
          <span className="text-3xl">✅</span>
        </motion.div>
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-base font-semibold text-slate-50">
            Pagamento aprovado
          </h2>
          <p className="text-xs text-slate-400">
            {formatCurrency(total)} recebidos via PIX.
          </p>
        </div>

        <div className="w-full mt-4 flex flex-col gap-2 text-xs">
          <button className="w-full rounded-2xl bg-emerald-500 text-emerald-950 px-4 py-2.5 font-medium flex items-center justify-center gap-2">
            Enviar recibo
            <span>🧾</span>
          </button>
          <button className="w-full rounded-2xl border border-slate-800/80 bg-slate-950 px-4 py-2.5 text-slate-200">
            Nova venda
          </button>
        </div>
      </div>
    </PageShell>
  );
};

// ------------------------------------------------------
// Sales History
// ------------------------------------------------------

const SalesHistoryScreen: React.FC = () => {
  const items = [
    { id: "1", date: "Hoje · 14:22", total: 120, status: "PAGO" },
    { id: "2", date: "Hoje · 11:10", total: 60, status: "PAGO" },
    { id: "3", date: "Ontem · 19:03", total: 40, status: "PENDENTE" },
  ];

  return (
    <PageShell title="Histórico de vendas">
      <div className="flex flex-col gap-2 mt-1">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 divide-y divide-slate-800/80">
          {items.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between px-3 py-2.5 text-xs"
            >
              <div className="flex flex-col">
                <span className="text-slate-100">{sale.date}</span>
                <span className="text-[11px] text-slate-500">#{sale.id}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-slate-100">
                  {formatCurrency(sale.total)}
                </span>
                <span
                  className={`text-[11px] ${
                    sale.status === "PAGO"
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {sale.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

// ------------------------------------------------------
// Root App (state machine)
// ------------------------------------------------------

const PDVRaizApp: React.FC = () => {
  const [view, setView] = useState<ViewId>("login");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [method, setMethod] = useState<"pix" | "link" | "cash" | null>(null);

  const handleAdd = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (!existing) return [...prev, { product, quantity: 1 }];
      return prev.map((i) =>
        i.product.id === product.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
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
        i.product.id === product.id
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
    });
  };

  const total = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-slate-950 text-slate-50">
      <AnimatePresence mode="wait">
        {view === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            <LoginScreen onLogin={() => setView("dashboard")} />
          </motion.div>
        )}

        {view === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            <DashboardScreen
              onNewSale={() => setView("new-sale")}
              onGoProducts={() => setView("products")}
              onGoSalesHistory={() => setView("sales-history")}
            />
          </motion.div>
        )}

        {view === "products" && (
          <motion.div
            key="products"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            <ProductsScreen products={mockProducts} />
          </motion.div>
        )}

        {view === "new-sale" && (
          <motion.div
            key="new-sale"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            <NewSaleScreen
              products={mockProducts}
              cart={cart}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onFinalize={() => setView("payment-method")}
            />
          </motion.div>
        )}

        {view === "payment-method" && (
          <motion.div
            key="payment-method"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            <PaymentMethodScreen
              total={total}
              onSelect={(m) => {
                setMethod(m);
                if (m === "cash") {
                  setView("payment-confirmation");
                } else {
                  setView("payment-waiting");
                }
              }}
            />
          </motion.div>
        )}

        {view === "payment-waiting" && method && (
          <motion.div
            key="payment-waiting"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            <PaymentWaitingScreen total={total} method={method} />
          </motion.div>
        )}

        {view === "payment-confirmation" && (
          <motion.div
            key="payment-confirmation"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            <PaymentConfirmationScreen total={total} />
          </motion.div>
        )}

        {view === "sales-history" && (
          <motion.div
            key="sales-history"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            <SalesHistoryScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PDVRaizApp;
