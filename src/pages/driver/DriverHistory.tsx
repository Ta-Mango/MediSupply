import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { Order } from '../../lib/firebase';
import { where } from 'firebase/firestore';
import { Package, CheckCircle2, Calendar } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export default function DriverHistory() {
  const { profile } = useAuth();
  const { data: orders } = useCollection<Order>('orders', [
    where('driverId', '==', profile?.uid),
    where('status', '==', 'delivered')
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Delivery History</h2>
        <p className="text-neutral-500">Your completed deliveries and performance log.</p>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold">Order #{order.id.slice(-8).toUpperCase()}</h3>
                <p className="text-sm text-neutral-500 truncate max-w-xs">{order.shippingAddress}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 text-neutral-500">
                <Calendar className="h-4 w-4" />
                {formatDate(order.updatedAt)}
              </div>
              <div className="flex items-center gap-2 text-neutral-500">
                <Package className="h-4 w-4" />
                {order.items.length} items
              </div>
              <div className="font-medium text-neutral-900 italic">
                {order.proofOfDelivery || 'Delivered'}
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="py-20 text-center card border-dashed">
            <p className="text-neutral-500 italic font-medium">No completed deliveries yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
