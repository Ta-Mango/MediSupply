import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Truck, 
  MapPin, 
  History,
  CheckCircle2
} from 'lucide-react';
import DriverSchedule from './DriverSchedule';
import DriverHistory from './DriverHistory';

export default function DriverDashboard() {
  const navItems = [
    { icon: Truck, label: 'My Schedule', href: '/driver' },
    { icon: History, label: 'Delivery History', href: '/driver/history' },
  ];

  return (
    <DashboardLayout navItems={navItems}>
      <Routes>
        <Route index element={<DriverSchedule />} />
        <Route path="history" element={<DriverHistory />} />
      </Routes>
    </DashboardLayout>
  );
}
