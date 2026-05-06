import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { Medicine, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { where, collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, Search, MoreVertical, Trash2, Edit2, AlertCircle, Package2 } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function MedicineCatalog() {
  const { profile } = useAuth();
  const { data: medicines, loading } = useCollection<Medicine>('medicines', [where('supplierId', '==', profile?.uid)]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await deleteDoc(doc(db, 'medicines', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `medicines/${id}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Medicine Catalog</h2>
          <p className="text-neutral-500">Manage your product inventory and pricing.</p>
        </div>
        <button 
          onClick={() => {
            setEditingMedicine(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Medicine
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Medicine Details</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Category</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Stock</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Price</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Expiry</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {medicines.map((med) => (
                <tr key={med.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold">{med.name}</p>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5">BATCH: {med.batchNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge bg-neutral-100 text-neutral-700">{med.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium",
                        med.stock < 100 ? "text-amber-600" : "text-neutral-900"
                      )}>
                        {med.stock} {med.unit}s
                      </span>
                      {med.stock < 100 && <AlertCircle className="h-3 w-3 text-amber-600" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono">
                    {formatCurrency(med.price)}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">
                    {formatDate(med.expiryDate)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setEditingMedicine(med);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(med.id)}
                        className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && medicines.length === 0 && (
            <div className="py-20 text-center">
              <Package2 className="h-12 w-12 text-neutral-200 mx-auto mb-4" />
              <p className="text-neutral-500 italic">No medicines found in your catalog.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <MedicineModal 
            onClose={() => setIsModalOpen(false)} 
            initialData={editingMedicine}
            supplierId={profile?.uid || ''}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MedicineModal({ onClose, initialData, supplierId }: { onClose: () => void, initialData: Medicine | null, supplierId: string }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'General',
    stock: initialData?.stock || 0,
    price: initialData?.price || 0,
    unit: initialData?.unit || 'Box',
    batchNumber: initialData?.batchNumber || '',
    expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '',
    requiresPrescription: initialData?.requiresPrescription || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        supplierId,
        stock: Number(formData.stock),
        price: Number(formData.price),
        updatedAt: serverTimestamp(),
        expiryDate: new Date(formData.expiryDate),
      };

      if (initialData) {
        await updateDoc(doc(db, 'medicines', initialData.id), data);
      } else {
        await addDoc(collection(db, 'medicines'), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'medicines');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-xl font-bold">{initialData ? 'Edit Medicine' : 'Add New Medicine'}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 transition-colors">
            <Plus className="h-6 w-6 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">Medicine Name</label>
              <input 
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="input" 
                placeholder="e.g., Paracetamol 500mg" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                <option>General</option>
                <option>Antibiotics</option>
                <option>Analgesics</option>
                <option>Vaccines</option>
                <option>Insulin</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">Stock Quantity</label>
              <input 
                required
                type="number"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="input" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">Unit Type</label>
              <input 
                required
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="input" 
                placeholder="e.g., Box" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">Price per Unit</label>
              <input 
                required
                type="number"
                step="0.01"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="input" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">Batch Number</label>
              <input 
                required
                value={formData.batchNumber}
                onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                className="input" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">Expiry Date</label>
              <input 
                required
                type="date"
                value={formData.expiryDate}
                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                className="input" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">Description</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="input resize-none h-24" 
              placeholder="Detailed usage and storage instructions..."
            />
          </div>
        </form>

        <div className="px-8 py-6 bg-neutral-50 flex items-center justify-end gap-4 border-t border-neutral-100">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary">
            {initialData ? 'Update Medicine' : 'Save Medicine'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
