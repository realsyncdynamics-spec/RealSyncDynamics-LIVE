import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, doc, onSnapshot, setDoc, OperationType, handleFirestoreError, Timestamp, isConfigValid } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { toast } from 'sonner';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  handle: string;
  verified: boolean;
  verificationLevel: 'none' | 'id' | 'professional' | 'enterprise';
  trustScore: number;
  followers: string;
  followersCount: number;
  followingCount: number;
  socials: string[];
  role: 'creator' | 'brand' | 'admin';
  plan: 'gratis' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  createdAt: Timestamp;
  balance?: number;
  stripeConnectId?: string;
  stripeConnectStatus?: 'pending' | 'active';
  category?: string;
  price?: string;
  bio?: string;
  demographics?: {
    ageGroups: { label: string; value: number }[];
    topLocations: { label: string; value: number }[];
  };
  youtubeData?: {
    channelId: string;
    title: string;
    subscriberCount: number;
    viewCount: number;
    videoCount: number;
    thumbnail: string;
    lastSynced: Timestamp;
  };
}

interface FirebaseContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  isConfigValid: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (!isConfigValid) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Listen for profile changes
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const unsubProfile = onSnapshot(profileRef, (docSnap) => {
          const role = firebaseUser.email === 'realsyncdynamics@gmail.com' ? 'admin' : 'creator';
          
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
            
            // Ensure role is correct (e.g. if email matches admin)
            if (data.role !== role) {
              setDoc(profileRef, { role }, { merge: true }).catch(err => 
                handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`)
              );
            }
          } else {
            // Create initial profile if it doesn't exist
            const initialProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Anonymous',
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/200/200`,
              handle: `@${(firebaseUser.displayName || 'user').toLowerCase().replace(/\s/g, '')}`,
              verified: false,
              verificationLevel: 'none',
              trustScore: 88,
              followers: '0',
              followersCount: 0,
              followingCount: 0,
              socials: ['youtube'],
              role: role,
              plan: 'gratis',
              createdAt: Timestamp.now(),
            };
            setDoc(profileRef, initialProfile).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`));
          }
        }, (err) => handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`));
        
        setLoading(false);
        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    if (!isConfigValid) {
      toast.error('Firebase configuration is missing. Please set up Firebase in the AI Studio settings.');
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login window was closed.');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized for Google Sign-In. Please add it to the Firebase Console.');
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (!isConfigValid) return;
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error('Email login failed:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    if (!isConfigValid) return;
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, pass);
      // Profile creation is handled by the onAuthStateChanged listener, 
      // but we can pre-set the name if we want.
      // The listener will pick up the new user and create the profile.
      // We can update the profile immediately after creation if needed.
      const profileRef = doc(db, 'users', user.uid);
      await setDoc(profileRef, { name }, { merge: true });
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    if (!isConfigValid) return;
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      console.error('Password reset failed:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    if (!isConfigValid) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <FirebaseContext.Provider value={{ user, profile, loading, isLoginModalOpen, setIsLoginModalOpen, login, loginWithEmail, registerWithEmail, resetPassword, logout, isConfigValid }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
