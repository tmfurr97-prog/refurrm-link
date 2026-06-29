import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, collection, query, where, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize App Check
export const appCheck = typeof window !== 'undefined' ? initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"),
  isTokenAutoRefreshEnabled: true
}) : null;

// Initialize Analytics conditionally
export const analytics = typeof window !== 'undefined' ? isSupported().then(yes => yes ? getAnalytics(app) : null).catch(() => null) : null;

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/admob.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/admob.report');
googleProvider.addScope('https://www.googleapis.com/auth/adsense.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/drive');
export const githubProvider = new GithubAuthProvider();

// Auth Helpers
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;
  if (token) {
    sessionStorage.setItem('google_access_token', token);
  }
  return result;
};
export const loginWithEmail = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const signupWithEmail = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);
export const loginWithGithub = async () => {
  githubProvider.addScope('repo');
  const result = await signInWithPopup(auth, githubProvider);
  const credential = GithubAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;
  if (token) {
    sessionStorage.setItem('github_access_token', token);
  }
  return result;
};
export const logout = () => signOut(auth);

// Firestore Error Handler
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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
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
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Profile Helpers
export async function syncUserProfile(user: User) {
  const userDocRef = doc(db, 'users', user.uid);
  const admins = ['harleygirley97@gmail.com', 'tree@refurrm.org', 'admin@refurrm.org'];
  const isAdmin = admins.includes(user.email || '');

  try {
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAdmin: isAdmin,
        proAccess: isAdmin, // Give pro access to admins
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } else {
      await setDoc(userDocRef, {
        lastLogin: serverTimestamp(),
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAdmin: isAdmin,
        proAccess: isAdmin
      }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

// Audit Log Helpers
export async function saveAuditLog(log: { repoName: string; repoUrl: string; analysisResult: any; infographicUrl?: string }) {
  if (!auth.currentUser) return;
  
  const path = 'auditLogs';
  try {
    await addDoc(collection(db, path), {
      ...log,
      userId: auth.currentUser.uid,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveArticleLog(log: { title: string; url: string; imageData: string }) {
  if (!auth.currentUser) return;
  
  const path = 'articleLogs';
  try {
    await addDoc(collection(db, path), {
      ...log,
      userId: auth.currentUser.uid,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserAuditLogs() {
  if (!auth.currentUser) return [];
  
  const path = 'auditLogs';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
