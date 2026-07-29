import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  Firestore 
} from 'firebase/firestore';
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
  
  const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
  try {
    db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    }, dbId);
  } catch (_e) {
    db = getFirestore(app, dbId);
  }

  auth = getAuth(app);
  isFirebaseInitialized = true;
} catch (err: any) {
  initErrorMessage = err?.message || 'Firebase failed to initialize';
  console.warn('[Firebase Init Warning]', initErrorMessage);
}

export { app, db, auth, isFirebaseInitialized, initErrorMessage };


