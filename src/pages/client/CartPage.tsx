import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '../../lib/utils';
import {
  collection,
  addDoc,
  serverTimestamp,
  writeBatch,
  doc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';

export default function CartPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    items,
    loading,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleQuantityChange = async (medicineId: string, delta: number) => {
    const item = items.find(i => i.medicineId === medicineId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      await removeItem(medicineId);
    } else {
      try {
        await updateQuantity(medicineId, newQty);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleRemove = async (medicineId: string) => {
    try {
      await removeItem(medicineId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // Group items by supplier
      const supplierGroups: { [supplierId: string]: any[] } = {};

      items.forEach((item) => {
        const { medicineId, quantity, medicine } = item;
        if (!supplierGroups[medicine.supplierId]) {
          supplierGroups[medicine.supplierId] = [];
        }
        supplierGroups[medicine.supplierId].push({
          medicineId,
          name: medicine.name,
          quantity,
          priceAtOrder: medicine.price,
        });
      });

      // Create orders (one per supplier)
      const batch = writeBatch(db);
      const orderPromises: Promise<void>[] = [];

      Object.entries(supplierGroups).forEach(([supplierId, orderItems]) => {
        const totalAmount = orderItems.reduce(
          (sum, item) => sum + item.priceAtOrder * item.quantity,
          0
        );

        const orderRef = doc(collection(db, 'orders'));
        batch.set(orderRef, {
          clientId: profile?.uid,
          supplierId,
          items: orderItems,
          totalAmount,
          shippingAddress: profile?.address || 'Default Pharmacy Address',
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Also clear cart items for these medicines
        orderItems.forEach((item: any) => {
          const cartItemRef = doc(db, 'carts', profile!.uid, 'items', item.medicineId);
          batch.delete(cartItemRef);
        });

        orderPromises.push(batch.commit());
      });

      await Promise.all(orderPromises);
      setCheckoutSuccess(true);
      setTimeout(() => {
        navigate('/client/orders');
      }, 2000);
    } catch (err: any) {
      console.error('Checkout error:', err);
      handleFirestoreError(err, OperationType.CREATE, 'orders');
      setCheckoutError('Failed to place order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/client')}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">My Cart</h2>
            <p className="text-neutral-500">{itemCount} item(s) selected</p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {checkoutSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3"
          >
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Orders placed successfully! Redirecting to order history...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {checkoutError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{checkoutError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Content */}
      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-100 rounded-full mb-6">
            <ShoppingCart className="h-10 w-10 text-neutral-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
          <p className="text-neutral-500 mb-6">Browse medicines and add them to your order</p>
          <button
            onClick={() => navigate('/client')}
            className="btn-primary"
          >
            Browse Medicines
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.medicineId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card p-6 flex flex-col sm:flex-row gap-4"
                >
                  {/* Medicine Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="badge bg-neutral-100 text-neutral-600 mb-2">
                          {item.medicine.category}
                        </span>
                        <h3 className="font-bold text-lg">{item.medicine.name}</h3>
                        <p className="text-sm text-neutral-500 mt-1">
                          {item.medicine.description?.substring(0, 100)}
                          {item.medicine.description?.length > 100 ? '...' : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.medicineId)}
                        className="p-2 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item.medicineId, -1)}
                          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.medicineId, 1)}
                          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                          disabled={item.quantity >= item.medicine.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <span className="text-sm text-neutral-500">
                          / {item.medicine.stock} {item.medicine.unit}s available
                        </span>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-neutral-400">Unit Price</p>
                        <p className="font-mono font-bold">{formatCurrency(item.medicine.price)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="border-t sm:border-t-0 sm:border-l border-neutral-200 pt-4 sm:pt-0 sm:pl-6 flex flex-col justify-center">
                    <p className="text-sm text-neutral-500 mb-1">Line Total</p>
                    <p className="text-2xl font-mono font-bold text-neutral-900">
                      {formatCurrency(item.medicine.price * item.quantity)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-6">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Items ({itemCount})</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Shipping</span>
                  <span className="text-green-600">Calculated at checkout</span>
                </div>
                <div className="border-t border-neutral-200 pt-3 flex justify-between font-bold text-lg">
                  <span>Estimated Total</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || items.length === 0}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4" />
                    Place Bulk Order
                  </>
                )}
              </button>

              <p className="text-xs text-neutral-500 mt-4 text-center">
                Orders will be sent to suppliers for approval
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
