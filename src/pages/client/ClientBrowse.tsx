import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useCollection } from '../../hooks/useCollection';
import { Medicine } from '../../lib/firebase';
import { Plus, Search, Package, Filter, Minus } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ClientBrowse() {
  const { profile } = useAuth();
  const { data: medicines, loading } = useCollection<Medicine>('medicines');
  const {
    items: cartItems,
    addItem,
    removeItem,
    updateQuantity,
    itemCount
  } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);

  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCartQuantity = (medicineId: string) => {
    const item = cartItems.find(i => i.medicineId === medicineId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = async (medicine: Medicine) => {
    try {
      await addItem(medicine, 1);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateQuantity = async (medicineId: string, delta: number) => {
    const currentQty = getCartQuantity(medicineId);
    const newQty = currentQty + delta;

    if (newQty <= 0) {
      try {
        await removeItem(medicineId);
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      try {
        await updateQuantity(medicineId, newQty);
      } catch (err: any) {
        alert(err.message);
      }
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
        {filteredMedicines.map((med) => {
          const cartQty = getCartQuantity(med.id);
          return (
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
                {cartQty > 0 ? (
                  <div className="flex items-center gap-4 bg-white border border-neutral-200 rounded-lg px-2 py-1 shadow-sm">
                    <button
                      onClick={() => handleUpdateQuantity(med.id, -1)}
                      className="p-1 hover:text-red-500"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-bold min-w-[20px] text-center">{cartQty}</span>
                    <button
                      onClick={() => handleUpdateQuantity(med.id, 1)}
                      disabled={cartQty >= med.stock}
                      className="p-1 hover:text-green-500 disabled:opacity-20"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToCart(med)}
                    disabled={med.stock === 0}
                    className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add to Cart
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {loading && medicines.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
        </div>
      )}
    </div>
  );
}
