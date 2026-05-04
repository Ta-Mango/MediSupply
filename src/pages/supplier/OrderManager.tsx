import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { Order, UserProfile, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Truck, CheckCircle2, XCircle, Clock, MapPin, Package } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { useState } from 'react';

export default function OrderManager() {
  const { profile } = useAuth();
  const { data: orders, loading } = useCollection<Order>('orders', [where('supplierId', '==', profile?.uid)]);
  const { data: drivers } = useCollection<UserProfile>('users', [where('role', '==', 'driver')]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const updateOrderStatus = async (orderId: string, status: string, driverId?: string) => {
    try {
      const data: any = { status, updatedAt: serverTimestamp() };
      if (driverId) data.driverId = driverId;
      await updateDoc(doc(db, 'orders', orderId), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Order Management</h2>
        <p className="text-neutral-500">Approve orders and coordinate deliveries.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {orders.map((order) => (
            <div 
              key={order.id} 
              onClick={() => setSelectedOrder(order)}
              className={cn(
                "card p-6 cursor-pointer transition-all border-l-4",
                selectedOrder?.id === order.id ? "border-l-neutral-900 bg-neutral-50" : "border-l-transparent",
                order.status === 'pending' && "border-l-blue-500"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase text-xs tracking-widest text-neutral-400">Order ID</h3>
                    <p className="font-mono text-sm">{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <div className={cn(
                  "badge",
                  order.status === 'pending' ? "bg-blue-100 text-blue-700" :
                  order.status === 'approved' ? "bg-amber-100 text-amber-700" :
                  order.status === 'shipped' ? "bg-purple-100 text-purple-700" :
                  order.status === 'delivered' ? "bg-green-100 text-green-700" :
                  "bg-neutral-100 text-neutral-700"
                )}>
                  {order.status}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" /> Ordered On</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1 flex items-center gap-1"><Package className="h-3 w-3" /> Items</p>
                  <p className="font-medium">{order.items.length} Medicines</p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">Total Amount</p>
                  <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Destination</p>
                  <p className="font-medium truncate">{order.shippingAddress || 'Not specified'}</p>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && !loading && (
            <div className="card p-12 text-center text-neutral-500">
              No orders found.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6 sticky top-8">
            {selectedOrder ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Order Details</h3>
                  <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-neutral-900">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-neutral-400 mb-2">Order Items</p>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.name} x {item.quantity}</span>
                          <span className="font-mono">{formatCurrency(item.priceAtOrder * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="border-neutral-100" />

                  {selectedOrder.status === 'pending' && (
                    <div className="space-y-4">
                      <p className="text-xs font-bold uppercase text-neutral-400">Approval Actions</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateOrderStatus(selectedOrder.id, 'rejected')}
                          className="flex-1 btn-secondary text-red-600 border-red-100 hover:bg-red-50"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(selectedOrder.id, 'approved')}
                          className="flex-1 btn-primary bg-green-600 hover:bg-green-700 border-none"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedOrder.status === 'approved' && (
                    <div className="space-y-4">
                      <p className="text-xs font-bold uppercase text-neutral-400">Assign Driver</p>
                      <div className="space-y-2">
                        {drivers.map((driver) => (
                          <button
                            key={driver.uid}
                            onClick={() => updateOrderStatus(selectedOrder.id, 'shipped', driver.uid)}
                            className="w-full flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:border-neutral-900 hover:bg-neutral-50 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-neutral-100 rounded-full flex items-center justify-center text-xs font-bold group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                                {driver.displayName?.charAt(0)}
                              </div>
                              <span className="text-sm font-medium">{driver.displayName}</span>
                            </div>
                            <Truck className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900" />
                          </button>
                        ))}
                        {drivers.length === 0 && (
                          <p className="text-sm text-neutral-500 italic">No drivers available. Add drivers to your fleet first.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedOrder.status === 'shipped' && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <p className="text-xs font-bold text-purple-700 uppercase mb-1">In Transit</p>
                      <p className="text-sm text-purple-600">The order is currently being delivered by {drivers.find(d => d.uid === selectedOrder.driverId)?.displayName || 'assigned driver'}.</p>
                    </div>
                  )}

                  {selectedOrder.status === 'delivered' && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="font-bold text-green-800">Delivered</p>
                      <p className="text-sm text-green-700">Proof of delivery received.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Truck className="h-12 w-12 text-neutral-200 mx-auto mb-4" />
                <p className="text-neutral-500">Select an order to view details and take actions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
