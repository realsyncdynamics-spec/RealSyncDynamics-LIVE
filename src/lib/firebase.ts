import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, getDoc, getDocFromServer, collection, onSnapshot, setDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, limit, Timestamp, increment, arrayUnion, runTransaction, or } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Import the Firebase configuration
import firebaseConfig from '../../firebase-applet-config.json';

// Validate configuration
const isConfigValid = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== 'TODO_KEYHERE';

if (!isConfigValid) {
  console.warn('Firebase configuration is missing or invalid. Authentication and database features will be disabled.');
}

// Initialize Firebase SDK
const app = isConfigValid ? initializeApp(firebaseConfig) : null;
export const db = isConfigValid ? getFirestore(app!, firebaseConfig.firestoreDatabaseId) : null as any;
export const auth = isConfigValid ? getAuth(app!) : null as any;
export const storage = isConfigValid ? getStorage(app!) : null as any;
export const googleProvider = new GoogleAuthProvider();
export const firebaseApp = app;
export { isConfigValid };

/**
 * PRODUCTION OAUTH NOTE:
 * 1. Add your production domain to Firebase Console > Auth > Settings > Authorized Domains
 * 2. Add your production domain to Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client IDs
 * 3. Ensure the redirect URI is: https://<your-project-id>.firebaseapp.com/__/auth/handler
 */

// Error Handling Spec for Firestore Operations
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

export { 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  doc,
  getDoc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  or,
  orderBy,
  limit,
  Timestamp,
  increment,
  arrayUnion,
  runTransaction,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL
};
