import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Package2,
  ShoppingCart,
  History,
  Search,
  Bell
} from 'lucide-react';
import ClientBrowse from './ClientBrowse';
import CartPage from './CartPage';
import OrderHistory from './OrderHistory';

export default function ClientDashboard() {
  const navItems = [
    { icon: Search, label: 'Browse Medicines', href: '/client' },
    { icon: ShoppingCart, label: 'My Cart', href: '/client/cart' },
    { icon: History, label: 'Order History', href: '/client/orders' },
  ];

  return (
    <DashboardLayout navItems={navItems}>
      <Routes>
        <Route index element={<ClientBrowse />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="orders" element={<OrderHistory />} />
      </Routes>
    </DashboardLayout>
  );
}
