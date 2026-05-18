/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @author Ciami
 */

import { type ReactNode } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Compass,
  MapPin,
  PlusCircle,
  MessageCircle,
  User,
  Bell,
  ArrowLeft,
} from 'lucide-react';

import ImgWithFallback from './components/ImgWithFallback';

// Pages
import Discovery from './pages/Discovery';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Login from './pages/Login';
import PostPublish from './pages/PostPublish';
import Messages from './pages/Messages';
import Community from './pages/Community';
import Profile from './pages/Profile';
import RentedOut from './pages/RentedOut';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isDetailPage = location.pathname.startsWith('/detail/');
  const isPostPage = location.pathname === '/post';
  const isCartPage = location.pathname === '/cart';
  const isCheckoutPage = location.pathname === '/checkout';
  const isOrderDetailPage = location.pathname.startsWith('/order/');
  const isOrdersPage = location.pathname === '/orders';
  const isMessagesPage = location.pathname === '/messages';

  const showBackButton = isDetailPage || isCartPage || isCheckoutPage || isOrderDetailPage || isOrdersPage || isMessagesPage;

  const isTabActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[1200px] mx-auto shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] bg-surface-container-lowest/90 backdrop-blur-md z-50 px-4 py-3 flex justify-between items-center border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-surface-container-low rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-on-surface" />
            </button>
          )}
          <h1 className="font-display font-bold text-xl text-primary tracking-tight">
            TreasureShare
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/messages')} className="p-2 hover:bg-surface-container-low rounded-full transition-colors relative">
            <Bell className="w-6 h-6 text-on-surface-variant" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant cursor-pointer" onClick={() => navigate('/profile')}>
            <ImgWithFallback
              src=""
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-24 overflow-y-auto no-scrollbar">
        <Outlet />
      </main>

      {/* Bottom Nav - hidden on sub-pages that have their own navigation */}
      {!isPostPage && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 flex justify-around items-center pt-2 pb-6 px-4 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-50">
          <NavButton
            active={isTabActive('/')}
            icon={<Compass />}
            label="发现"
            onClick={() => navigate('/')}
          />
          <NavButton
            active={isTabActive('/community')}
            icon={<MapPin />}
            label="社区"
            onClick={() => navigate('/community')}
          />
          <div className="relative -top-6 flex flex-col items-center">
            <button
              onClick={() => navigate('/post')}
              className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90"
            >
              <PlusCircle className="w-8 h-8 text-on-primary" />
            </button>
            <span className="text-[12px] font-bold mt-1 text-primary">发布</span>
          </div>
          <NavButton
            active={isTabActive('/messages')}
            icon={<MessageCircle />}
            label="消息"
            onClick={() => navigate('/messages')}
            hasBadge
          />
          <NavButton
            active={isTabActive('/profile')}
            icon={<User />}
            label="我"
            onClick={() => navigate('/profile')}
          />
        </nav>
      )}
    </div>
  );
}

function NavButton({
  active,
  icon,
  label,
  onClick,
  hasBadge,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  hasBadge?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${
        active ? 'text-primary font-bold' : 'text-secondary hover:text-primary'
      }`}
    >
      <div className="relative">
        {icon}
        {hasBadge && <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />}
      </div>
      <span className="text-[12px]">{label}</span>
    </button>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Discovery />} />
        <Route path="/detail/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/post" element={<PostPublish />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/rented-out" element={<RentedOut />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
