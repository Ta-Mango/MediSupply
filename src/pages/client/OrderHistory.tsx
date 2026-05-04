import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { Order } from '../../lib/firebase';
import { where } from 'firebase/firestore';
import { Package, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../../lib/utils';

export default function OrderHistory() {
  const { profile } = useAuth();
  const { data: orders, loading } = useCollection<Order>('orders', [where('clientId', '==', profile?.uid)]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Order history</h2>
        <p className="text-neutral-500">Track your bulk drug orders and delivery status.</p>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => (
          <div key={order.id} className="card p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-neutral-600" />
                </div>
                <div>
                  <h3 className="font-bold">Order #{order.id.slice(-8).toUpperCase()}</h3>
                  <p className="text-sm text-neutral-500">Placed on {formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="flex flex-col md:items-end">
                <div className={cn(
                  "badge mb-1",
                  order.status === 'pending' ? "bg-blue-100 text-blue-700" :
                  order.status === 'approved' ? "bg-amber-100 text-amber-700" :
                  order.status === 'shipped' ? "bg-purple-100 text-purple-700" :
                  order.status === 'delivered' ? "bg-green-100 text-green-700" :
                  "bg-neutral-100 text-neutral-700"
                )}>
                  {order.status}
                </div>
                <p className="text-xl font-mono font-bold">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <div className="space-y-1">
                <p className="text-xs font-bold text-neutral-400 uppercase">Items Ordered</p>
                <div className="text-sm">
                  {order.items.map((item, idx) => (
                    <div key={idx}>{item.name} x {item.quantity}</div>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-neutral-400 uppercase">Supplier Status</p>
                <p className="text-sm font-medium">
                  {order.status === 'pending' ? 'Awaiting Approval' : 'Approved & Processing'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Shipped Via</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  {order.driverId ? 'Assigned' : 'Awaiting Parcel'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-neutral-400 uppercase">Delivery Check</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  {order.status === 'delivered' ? (
                    <><CheckCircle2 className="h-3 w-3 text-green-600" /> Received</>
                  ) : order.status === 'cancelled' ? (
                    <><XCircle className="h-3 w-3 text-red-600" /> Cancelled</>
                  ) : (
                    <><Clock className="h-3 w-3 text-amber-600" /> In Progress</>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && !loading && (
          <div className="py-20 text-center card bg-transparent border-dashed">
            <Package className="h-16 w-16 text-neutral-200 mx-auto mb-4" />
            <p className="text-neutral-500 italic text-lg">You haven't placed any orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
