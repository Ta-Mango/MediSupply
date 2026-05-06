import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  BarChart3, 
  Package2, 
  ShoppingCart, 
  Users, 
  Truck
} from 'lucide-react';
import SupplierOverview from './SupplierOverview';
import MedicineCatalog from './MedicineCatalog';
import OrderManager from './OrderManager';

export default function SupplierDashboard() {
  const navItems = [
    { icon: BarChart3, label: 'Overview', href: '/supplier' },
    { icon: Package2, label: 'Inventory', href: '/supplier/inventory' },
    { icon: ShoppingCart, label: 'Orders', href: '/supplier/orders' },
    { icon: Users, label: 'Clients', href: '/supplier/clients' },
    { icon: Truck, label: 'Drivers', href: '/supplier/drivers' },
  ];

  return (
    <DashboardLayout navItems={navItems}>
      <Routes>
        <Route index element={<SupplierOverview />} />
        <Route path="inventory" element={<MedicineCatalog />} />
        <Route path="orders" element={<OrderManager />} />
        <Route path="clients" element={<div>Client Management Coming Soon</div>} />
        <Route path="drivers" element={<div>Driver Fleet Management Coming Soon</div>} />
      </Routes>
    </DashboardLayout>
  );
}
