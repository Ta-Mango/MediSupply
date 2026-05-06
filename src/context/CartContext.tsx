import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db, UserProfile, Medicine } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export interface CartItem {
  id?: string; // Firestore doc ID if persisted
  medicineId: string;
  quantity: number;
  medicine: Medicine; // Full medicine data for display
  addedAt: any;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  itemCount: number;
  subtotal: number;
  addItem: (medicine: Medicine, quantity?: number) => Promise<void>;
  removeItem: (medicineId: string) => Promise<void>;
  updateQuantity: (medicineId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { profile, user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cart from Firestore on mount, and subscribe to real-time updates
  useEffect(() => {
    if (!user || !profile) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const cartRef = collection(db, 'carts', user.uid, 'items');

    const unsubscribe = onSnapshot(
      cartRef,
      async (snapshot) => {
        const cartItems: CartItem[] = [];
        const promises: Promise<void>[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          cartItems.push({
            id: docSnap.id,
            medicineId: data.medicineId,
            quantity: data.quantity,
            medicine: data.medicine,
            addedAt: data.addedAt,
          });
        });

        // Sort by addedAt descending (newest first)
        cartItems.sort((a, b) => b.addedAt?.toMillis() - a.addedAt?.toMillis());

        setItems(cartItems);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Cart subscription error:', err);
        setError('Failed to load cart');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, profile]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);

  const addItem = async (medicine: Medicine, quantity: number = 1) => {
    if (!user || !profile) throw new Error('Must be logged in');

    const existingItemIndex = items.findIndex(i => i.medicineId === medicine.id);
    const newQuantity = existingItemIndex >= 0 ? items[existingItemIndex].quantity + quantity : quantity;

    // Validate stock
    if (newQuantity > medicine.stock) {
      throw new Error(`Cannot add more than available stock (${medicine.stock} ${medicine.unit}s)`);
    }

    const cartItemData = {
      medicineId: medicine.id,
      quantity: newQuantity,
      medicine,
      addedAt: serverTimestamp(),
    };

    const cartRef = collection(db, 'carts', user.uid, 'items');
    const docRef = doc(cartRef, medicine.id);

    try {
      if (existingItemIndex >= 0) {
        await updateDoc(docRef, { quantity: newQuantity });
      } else {
        await setDoc(docRef, cartItemData);
      }
    } catch (err: any) {
      console.error('Add to cart error:', err);
      throw new Error('Failed to update cart');
    }
  };

  const removeItem = async (medicineId: string) => {
    if (!user) throw new Error('Must be logged in');

    const cartRef = collection(db, 'carts', user.uid, 'items');
    const docRef = doc(cartRef, medicineId);

    try {
      await deleteDoc(docRef);
    } catch (err: any) {
      console.error('Remove from cart error:', err);
      throw new Error('Failed to remove item');
    }
  };

  const updateQuantity = async (medicineId: string, quantity: number) => {
    if (!user) throw new Error('Must be logged in');
    if (quantity <= 0) {
      await removeItem(medicineId);
      return;
    }

    const item = items.find(i => i.medicineId === medicineId);
    if (!item) throw new Error('Item not in cart');

    if (quantity > item.medicine.stock) {
      throw new Error(`Cannot exceed available stock (${item.medicine.stock} ${item.medicine.unit}s)`);
    }

    const cartRef = collection(db, 'carts', user.uid, 'items');
    const docRef = doc(cartRef, medicineId);

    try {
      await updateDoc(docRef, { quantity });
    } catch (err: any) {
      console.error('Update quantity error:', err);
      throw new Error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    if (!user) throw new Error('Must be logged in');

    const cartRef = collection(db, 'carts', user.uid, 'items');
    const batch = writeBatch(db);

    try {
      const snapshot = await getDocs(cartRef);
      snapshot.forEach((docSnap) => {
        batch.delete(doc(cartRef, docSnap.id));
      });
      await batch.commit();
    } catch (err: any) {
      console.error('Clear cart error:', err);
      throw new Error('Failed to clear cart');
    }
  };

  const refreshCart = async () => {
    if (!user) return;
    const cartRef = collection(db, 'carts', user.uid, 'items');
    try {
      const snapshot = await getDocs(cartRef);
      const cartItems: CartItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as CartItem));
      setItems(cartItems);
    } catch (err: any) {
      console.error('Refresh cart error:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        error,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
