import React, { useEffect, useState } from 'react';
import { PageShell } from './PageShell';
import { supabase } from '@/lib/supabase';
import { useDialog } from '@/contexts/DialogContext';
import { translateRole } from '@/lib/translations';

type NavTab = 'dashboard' | 'products' | 'profile';

interface ProfileScreenProps {
  onBack: () => void;
  activeTab?: NavTab;
  onNavigate?: (tab: NavTab) => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  activeTab,
  onNavigate,
  onLogout,
}) => {
  const [user, setUser] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useDialog();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: stores } = await supabase
        .from('stores')
        .select('*')
        .limit(1);
      const { data: users } = await supabase.from('users').select('*').limit(1);

      if (stores && stores.length > 0) setStore(stores[0]);
      if (users && users.length > 0) setUser(users[0]);

      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <PageShell title="Meu Perfil" activeTab={activeTab} onNavigate={onNavigate}>
      <div className="flex flex-col gap-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-gray-200 shadow-sm">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl border-2 border-blue-200 text-blue-600 font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-gray-900">
              {user?.name || 'Usuário'}
            </h2>
            <span className="text-sm text-gray-700 font-medium">
              {user?.email || 'email@exemplo.com'}
            </span>
            <span className="text-xs text-blue-700 mt-1 px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 w-fit font-bold">
              {translateRole(user?.role || 'VIEWER')}
            </span>
          </div>
        </div>

        {/* Store Info */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            Minha Loja
          </h3>
          <div className="p-5 rounded-2xl bg-white border-2 border-gray-200 flex flex-col gap-3 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 font-semibold">Nome</span>
              <span className="text-sm font-bold text-gray-900">
                {store?.name || 'Minha Loja'}
              </span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 font-semibold">
                ID da Loja
              </span>
              <span className="text-xs font-mono text-gray-600 font-semibold">
                {store?.id?.slice(0, 8) || '...'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => showAlert('Funcionalidade em desenvolvimento')}
            className="w-full p-5 rounded-2xl bg-white border-2 border-gray-200 flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Abrir configurações"
          >
            <span className="text-sm font-bold text-gray-800 group-hover:text-gray-900">
              Configurações
            </span>
            <span className="text-gray-500 font-bold">→</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full p-5 rounded-2xl border-2 border-red-200 bg-red-50 flex items-center justify-center text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors font-bold text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Sair da conta"
          >
            Sair da conta
          </button>
        </div>

        <div className="text-center mt-2">
          <span className="text-xs text-gray-500 font-semibold">
            Versão 0.1.0 (Beta)
          </span>
        </div>
      </div>
    </PageShell>
  );
};
