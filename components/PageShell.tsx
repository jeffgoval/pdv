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
    <div className="h-screen bg-white text-gray-900 flex flex-col w-full max-w-md border-x-2 border-gray-200 shadow-xl">
      <header className="flex items-center gap-4 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b-2 border-gray-200 bg-white shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-full border-2 border-gray-400 w-9 h-9 flex items-center justify-center text-sm hover:bg-gray-100 transition-colors text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shrink-0"
            aria-label="Voltar"
          >
            ←
          </button>
        )}
        <div className="flex flex-col min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            {title}
          </h1>
        </div>
      </header>
      <main
        className={`flex-1 px-4 sm:px-6 pb-4 sm:pb-6 pt-4 sm:pt-6 flex flex-col gap-4 sm:gap-6 overflow-y-auto bg-gray-50 ${activeTab ? 'pb-24' : ''}`}
      >
        {children}
      </main>
      {activeTab && onNavigate && (
        <BottomNav activeTab={activeTab} onNavigate={onNavigate} />
      )}
    </div>
  );
};
