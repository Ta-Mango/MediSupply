import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { Medicine, Order } from '../../lib/firebase';
import { where } from 'firebase/firestore';
import { Package2, ShoppingCart, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SupplierOverview() {
  const { profile } = useAuth();
  const { data: medicines } = useCollection<Medicine>('medicines', [where('supplierId', '==', profile?.uid)]);
  const { data: orders } = useCollection<Order>('orders', [where('supplierId', '==', profile?.uid)]);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const lowStock = medicines.filter(m => m.stock < 100);
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Orders', value: pendingOrders.length, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Stock Alerts', value: lowStock.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Medicines', value: medicines.length, icon: Package2, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  // Dummy chart data
  const chartData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 5000 },
    { name: 'Thu', revenue: 4500 },
    { name: 'Fri', revenue: 6000 },
    { name: 'Sat', revenue: 2000 },
    { name: 'Sun', revenue: 3500 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-neutral-500">Welcome back, {profile?.displayName || 'Supplier'}. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold mb-6">Revenue Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#171717" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#171717" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E5E5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#171717" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-6">Recent Pending Orders</h3>
          <div className="space-y-4">
            {pendingOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Order #{order.id.slice(-6)}</p>
                  <p className="text-xs text-neutral-500">{order.items.length} items • {formatCurrency(order.totalAmount)}</p>
                </div>
                <div className="badge bg-blue-100 text-blue-700">Pending</div>
              </div>
            ))}
            {pendingOrders.length === 0 && (
              <div className="py-8 text-center">
                <Package2 className="h-12 w-12 text-neutral-200 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">No pending orders</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
