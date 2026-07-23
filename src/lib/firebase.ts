import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyADNnlQIRl2z0hkifGQHoroPJC2NvazAXM",
  authDomain: "nhd-kutir.firebaseapp.com",
  projectId: "nhd-kutir",
  storageBucket: "nhd-kutir.firebasestorage.app",
  messagingSenderId: "564893753456",
  appId: "1:564893753456:web:0a117f9147fa62036b54b5",
  measurementId: "G-7JWZJGSTYQ"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let isFirebaseInitialized = false;
let initErrorMessage: string | null = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  auth = getAuth(app);
  isFirebaseInitialized = true;
} catch (err: any) {
  initErrorMessage = err?.message || 'Firebase failed to initialize';
  console.warn('[Firebase Init Warning]', initErrorMessage);
}

export { app, db, auth, isFirebaseInitialized, initErrorMessage };
