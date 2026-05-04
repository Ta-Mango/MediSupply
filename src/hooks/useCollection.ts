import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export function useCollection<T = DocumentData>(collectionPath: string, constraints: QueryConstraint[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, collectionPath), ...constraints);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as T);
      });
      setData(items);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, collectionPath);
    });

    return () => unsubscribe();
  }, [collectionPath, JSON.stringify(constraints)]);

  return { data, loading, error };
}
