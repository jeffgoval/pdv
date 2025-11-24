import React from 'react';
import { BottomNav } from './BottomNav';

type NavTab = 'dashboard' | 'products' | 'profile';

interface PageShellProps {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  activeTab?: NavTab;
  onNavigate?: (tab: NavTab) => void;
}

export const PageShell: React.FC<PageShellProps> = ({
  title,
  children,
  onBack,
  activeTab,
  onNavigate,
}) => {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col w-full max-w-md relative border-2 border-gray-200 shadow-xl rounded-2xl overflow-hidden">
      <header className="flex items-center gap-4 px-6 pt-6 pb-4 border-b-2 border-gray-200 bg-white sticky top-0 z-30">
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-full border-2 border-gray-400 w-9 h-9 flex items-center justify-center text-sm hover:bg-gray-100 transition-colors text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Voltar"
          >
            ←
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>
      </header>
      <main
        className={`flex-1 px-6 pb-6 pt-6 flex flex-col gap-6 overflow-y-auto bg-gray-50 ${activeTab ? 'mb-20' : ''}`}
      >
        {children}
      </main>
      {activeTab && onNavigate && (
        <BottomNav activeTab={activeTab} onNavigate={onNavigate} />
      )}
    </div>
  );
};
