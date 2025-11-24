'use client';

import React from 'react';
import { LoginScreen } from '@/components/LoginScreen';
import { DashboardScreen } from '@/components/DashboardScreen';
import { ProductsScreen } from '@/components/ProductsScreen';
import { NewSaleScreen } from '@/components/NewSaleScreen';
import {
  PaymentMethodScreen,
  PaymentWaitingScreen,
  PaymentConfirmationScreen,
} from '@/components/PaymentScreens';
import { SalesHistoryScreen } from '@/components/SalesHistoryScreen';
import { ProfileScreen } from '@/components/ProfileScreen';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { useApp, AppProvider } from '@/contexts/AppContext';

// ------------------------------------------------------
// Root App (view router)
// ------------------------------------------------------

const PDVRaizApp: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const {
    view,
    setView,
    navigateToTab,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    cartTotal,
    paymentMethod,
    currentSaleId,
    createSale,
    logout,
  } = useApp();

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-100 overflow-hidden">
      {view === 'login' && (
        <LoginScreen onLogin={signIn} onSignUp={signUp} />
      )}

      {view === 'dashboard' && (
        <DashboardScreen
          onNewSale={() => {
            clearCart();
            setView('new-sale');
          }}
          onGoProducts={() => setView('products')}
          onGoSalesHistory={() => setView('sales-history')}
          activeTab="dashboard"
          onNavigate={navigateToTab}
        />
      )}

      {view === 'products' && (
        <ProductsScreen
          onBack={() => setView('dashboard')}
          activeTab="products"
          onNavigate={navigateToTab}
        />
      )}

      {view === 'new-sale' && (
        <NewSaleScreen
          cart={cart}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onFinalize={() => setView('payment-method')}
          onBack={() => setView('dashboard')}
        />
      )}

      {view === 'payment-method' && (
        <PaymentMethodScreen
          total={cartTotal}
          onSelect={createSale}
          onBack={() => setView('new-sale')}
        />
      )}

      {view === 'payment-waiting' && paymentMethod && (
        <PaymentWaitingScreen
          total={cartTotal}
          method={paymentMethod}
          saleId={currentSaleId}
          onBack={() => setView('payment-method')}
          onPaymentConfirmed={() => setView('payment-confirmation')}
        />
      )}

      {view === 'payment-confirmation' && (
        <PaymentConfirmationScreen
          total={cartTotal}
          onNewSale={() => {
            clearCart();
            setView('new-sale');
          }}
        />
      )}

      {view === 'sales-history' && (
        <SalesHistoryScreen
          onBack={() => setView('dashboard')}
          onNavigate={navigateToTab}
        />
      )}

      {view === 'profile' && (
        <ProfileScreen
          onBack={() => setView('dashboard')}
          activeTab="profile"
          onNavigate={navigateToTab}
          onLogout={logout}
        />
      )}
    </div>
  );
};

export default function RootApp() {
  return (
    <AuthProvider>
      <AppProvider>
        <PDVRaizApp />
      </AppProvider>
    </AuthProvider>
  );
}
