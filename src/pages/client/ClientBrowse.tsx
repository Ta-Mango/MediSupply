import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { Medicine, db, handleFirestoreError, OperationType, OrderItem } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Search, ShoppingCart, Plus, Minus, Package, Filter, CheckCircle2 } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function ClientBrowse() {
  const { profile } = useAuth();
  const { data: medicines, loading } = useCollection<Medicine>('medicines');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{ [medicineId: string]: number }>({});
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateCart = (medicineId: string, delta: number) => {
    setCart(prev => {
      const current = prev[medicineId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [medicineId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [medicineId]: next };
    });
  };

  const cartItemsCount = Object.values(cart).reduce((a, b) => (a as number) + (b as number), 0) as number;

  const handlePlaceOrder = async () => {
    if (cartItemsCount === 0) return;
    setIsOrdering(true);
    try {
      // Group items by supplier
      const supplierGroups: { [supplierId: string]: OrderItem[] } = {};
      
      Object.entries(cart).forEach(([id, qty]) => {
        const med = medicines.find(m => m.id === id);
        if (med) {
          if (!supplierGroups[med.supplierId]) supplierGroups[med.supplierId] = [];
          supplierGroups[med.supplierId].push({
            medicineId: id,
            name: med.name,
            quantity: qty as number,
            priceAtOrder: med.price,
          });
        }
      });

      // Create an order for each supplier
      const promises = Object.entries(supplierGroups).map(([supplierId, items]) => {
        const totalAmount = items.reduce((sum, item) => sum + (item.priceAtOrder * item.quantity), 0);
        return addDoc(collection(db, 'orders'), {
          clientId: profile?.uid,
          supplierId,
          items,
          totalAmount,
          status: 'pending',
          shippingAddress: profile?.address || 'Default Pharmacy Address',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await Promise.all(promises);
      setCart({});
      setOrderComplete(true);
      setTimeout(() => setOrderComplete(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Browse Medicines</h2>
          <p className="text-neutral-500">Search and order healthcare products from verified suppliers.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search by name or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-64 pl-10"
            />
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMedicines.map((med) => (
          <motion.div 
            key={med.id} 
            layout
            className="card group hover:border-neutral-900 transition-all flex flex-col"
          >
            <div className="p-6 flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="badge bg-neutral-100 text-neutral-600">{med.category}</span>
                {med.stock < 100 && <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Low Stock</span>}
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{med.name}</h3>
                <p className="text-sm text-neutral-500 line-clamp-2 min-h-[40px]">{med.description || "No description provided."}</p>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Price</p>
                  <p className="text-xl font-mono">{formatCurrency(med.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Availability</p>
                  <p className="text-sm font-medium">{med.stock} {med.unit}s</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
              {cart[med.id] ? (
                <div className="flex items-center gap-4 bg-white border border-neutral-200 rounded-lg px-2 py-1 shadow-sm">
                  <button onClick={() => updateCart(med.id, -1)} className="p-1 hover:text-red-500"><Minus className="h-4 w-4" /></button>
                  <span className="font-bold min-w-[20px] text-center">{cart[med.id]}</span>
                  <button 
                    onClick={() => updateCart(med.id, 1)} 
                    disabled={(cart[med.id] as number) >= med.stock}
                    className="p-1 hover:text-green-500 disabled:opacity-20"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => updateCart(med.id, 1)}
                  disabled={med.stock === 0}
                  className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add to Order
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {loading && medicines.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
        </div>
      )}

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {cartItemsCount > 0 && !orderComplete && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4"
          >
            <div className="bg-neutral-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-2 rounded-xl relative">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm">Review Your Selection</p>
                  <p className="text-xs text-white/60">Ready to place bulk order?</p>
                </div>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={isOrdering}
                className="bg-white text-neutral-900 px-6 py-2 rounded-xl font-bold hover:bg-neutral-100 disabled:opacity-50"
              >
                {isOrdering ? 'Placing Order...' : 'Confirm Order'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {orderComplete && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-md"
          >
            <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-sm">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Order Confirmed!</h3>
              <p className="text-neutral-500">Your bulk orders have been sent to suppliers for approval.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
