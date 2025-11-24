import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between px-8 py-8 w-full max-w-md mx-auto border border-gray-200 shadow-xl rounded-2xl">
      <div className="mt-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4"
        >
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
              <span className="text-xl">⚡</span>
            </div>
            <span className="text-sm text-gray-900 font-bold">PDV</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo</h1>
          <p className="text-base text-gray-800 max-w-sm leading-relaxed font-medium">
            Sistema de ponto de venda simples e rápido para o seu negócio.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex flex-col gap-4"
      >
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-full bg-blue-600 text-white px-6 py-4 text-sm font-bold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Entrar no sistema"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              Entrando...
            </span>
          ) : (
            'Entrar com email'
          )}
        </button>
        <p className="text-xs text-gray-700 text-center px-4 leading-relaxed font-semibold">
          Ao continuar, você aceita nossos termos de serviço e política de
          privacidade.
        </p>
      </motion.div>
    </div>
  );
};
