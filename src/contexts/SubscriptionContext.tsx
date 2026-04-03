import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirebase } from './FirebaseContext';
import { db, doc, updateDoc, OperationType, handleFirestoreError } from '../lib/firebase';

interface SubscriptionContextType {
  plan: 'bronze' | 'silver' | 'gold' | 'platinum';
  loading: boolean;
  upgrade: (priceId: string) => Promise<void>;
  verifySession: (sessionId: string) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useFirebase();
  const [plan, setPlan] = useState<'bronze' | 'silver' | 'gold' | 'platinum'>('bronze');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setPlan((profile as any).plan || 'bronze');
      setLoading(false);
    } else if (!user) {
      setPlan('bronze');
      setLoading(false);
    }
  }, [profile, user]);

  const upgrade = async (priceId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.uid,
        }),
      });

      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  const verifySession = async (sessionId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/verify-session/${sessionId}`);
      const data = await response.json();
      
      if (data.success && data.plan && data.userId === user.uid) {
        const profileRef = doc(db, 'users', user.uid);
        await updateDoc(profileRef, { plan: data.plan });
        setPlan(data.plan);
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('Session verification failed:', error);
    }
  };

  return (
    <SubscriptionContext.Provider value={{ plan, loading, upgrade, verifySession }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
