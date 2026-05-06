import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db, UserRole } from '../lib/firebase';
import { Package2, Truck, ShoppingCart, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    if (!role) {
      setError("Please select your role first");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roles: { id: UserRole; title: string; icon: any; desc: string }[] = [
    { id: 'supplier', title: 'Supplier', icon: Package2, desc: 'Manage catalog and fulfill orders' },
    { id: 'client', title: 'Client / Pharmacy', icon: ShoppingCart, desc: 'Browse and order medicines' },
    { id: 'driver', title: 'Driver', icon: UserIcon, desc: 'Deliver orders to clients' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-neutral-100"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900">PharmaChain</h2>
          <p className="mt-2 text-neutral-500">Select your role to get started</p>
        </div>

        <div className="grid gap-4">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`flex items-start p-4 border rounded-xl transition-all text-left ${
                role === r.id 
                ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10' 
                : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <r.icon className={`h-6 w-6 mt-1 flex-shrink-0 ${role === r.id ? 'text-neutral-900' : 'text-neutral-400'}`} />
              <div className="ml-4">
                <p className="font-semibold text-neutral-900">{r.title}</p>
                <p className="text-sm text-neutral-500">{r.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading || !role}
          className="w-full btn-primary py-3 flex items-center justify-center gap-3"
        >
          {loading ? 'Processing...' : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
              Sign in with Google
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
