import React from 'react';

type NavTab = 'dashboard' | 'products' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onNavigate,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 px-6 py-3 pb-6 flex items-center justify-between max-w-md mx-auto z-40 shadow-lg safe-area-inset-bottom">
      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1 ${
          activeTab === 'dashboard'
            ? 'text-blue-600'
            : 'text-gray-600 hover:text-gray-800'
        }`}
        aria-label="Ir para início"
        aria-current={activeTab === 'dashboard' ? 'page' : undefined}
      >
        <span className="text-2xl">🏠</span>
        <span className="text-[11px] font-bold">Início</span>
      </button>

      <button
        onClick={() => onNavigate('products')}
        className={`flex flex-col items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1 ${
          activeTab === 'products'
            ? 'text-blue-600'
            : 'text-gray-600 hover:text-gray-800'
        }`}
        aria-label="Ir para produtos"
        aria-current={activeTab === 'products' ? 'page' : undefined}
      >
        <span className="text-2xl">📦</span>
        <span className="text-[11px] font-bold">Produtos</span>
      </button>

      <button
        onClick={() => onNavigate('profile')}
        className={`flex flex-col items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1 ${
          activeTab === 'profile'
            ? 'text-blue-600'
            : 'text-gray-600 hover:text-gray-800'
        }`}
        aria-label="Ir para perfil"
        aria-current={activeTab === 'profile' ? 'page' : undefined}
      >
        <span className="text-2xl">👤</span>
        <span className="text-[11px] font-bold">Perfil</span>
      </button>
    </div>
  );
};
