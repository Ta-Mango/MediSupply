import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { Order, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Truck, MapPin, Package, Phone, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function DriverSchedule() {
  const { profile } = useAuth();
  const { data: orders, loading } = useCollection<Order>('orders', [
    where('driverId', '==', profile?.uid),
    where('status', '==', 'shipped')
  ]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const confirmDelivery = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'delivered',
        updatedAt: serverTimestamp(),
        proofOfDelivery: "Signed digitally on " + new Date().toLocaleString()
      });
      setSelectedOrder(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Delivery Schedule</h2>
          <p className="text-neutral-500">Pick up and deliver medical supplies safely.</p>
        </div>
        <div className="badge bg-neutral-900 text-white px-4 py-2">
          {orders.length} ACTIVE DELIVERIES
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div 
              key={order.id} 
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedOrder(order)}
              className={cn(
                "card p-6 cursor-pointer hover:border-neutral-900 transition-all",
                selectedOrder?.id === order.id && "ring-2 ring-neutral-900 ring-offset-2"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase text-xs text-neutral-400">Parcel ID</h3>
                    <p className="font-mono text-sm">{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <ChevronRight className={cn(
                  "h-5 w-5 text-neutral-300 transition-transform",
                  selectedOrder?.id === order.id && "rotate-90 text-neutral-900"
                )} />
              </div>
              
              <div className="flex items-start gap-3 mt-4">
                <MapPin className="h-5 w-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase">Destination</p>
                  <p className="text-sm font-medium">{order.shippingAddress || 'Pharmacy Location'}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {orders.length === 0 && !loading && (
            <div className="py-20 text-center card border-dashed">
              <Truck className="h-12 w-12 text-neutral-200 mx-auto mb-4" />
              <p className="text-neutral-500">No active deliveries assigned to you.</p>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {selectedOrder ? (
            <motion.div 
              key={selectedOrder.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card h-fit sticky top-8"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Delivery Details</h3>
                  <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-neutral-900">
                    <Plus className="h-6 w-6 rotate-45" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-neutral-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Shipping Address</p>
                      <p className="font-medium text-lg leading-tight">{selectedOrder.shippingAddress}</p>
                      <button className="text-xs font-bold text-blue-600 mt-2 uppercase tracking-wider hover:underline">Open in Google Maps</button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-neutral-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Contact Recipient</p>
                      <p className="font-medium">+1 (555) 000-1234</p>
                    </div>
                  </div>

                  <div className="bg-neutral-50 p-6 rounded-2xl space-y-4">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Manifest</p>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-neutral-500">x {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => confirmDelivery(selectedOrder.id)}
                  className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="h-6 w-6" />
                  Confirm Delivery
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center card bg-neutral-50 border-none">
              <Truck size={80} className="text-neutral-200 mb-4" />
              <p className="text-neutral-400 font-medium">Select a delivery to view full route info</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
