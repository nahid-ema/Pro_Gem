import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let isFirebaseInitialized = false;
let initErrorMessage: string | null = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
  isFirebaseInitialized = true;
} catch (err: any) {
  initErrorMessage = err?.message || 'Firebase failed to initialize';
  console.warn('[Firebase Init Warning]', initErrorMessage);
}

export { app, db, auth, isFirebaseInitialized, initErrorMessage };

