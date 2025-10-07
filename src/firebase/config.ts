import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// 1. Import the necessary App Check functions
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your Firebase config object (this part is unchanged)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App (this part is unchanged)
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// --- 2. ADD THIS BLOCK TO INITIALIZE APP CHECK ---
// We place this immediately after the app is initialized.
// The `if (typeof window !== 'undefined')` check is important to ensure
// this code only runs in the browser, not on the server.
if (typeof window !== 'undefined') {
  initializeAppCheck(app, {
    // We create a new ReCaptchaV3Provider and pass it the Site Key
    // from your .env.local file.
    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!),
    
    // isTokenAutoRefreshEnabled: true is the default, but it's good to be explicit.
    // It means the SDK will automatically handle refreshing the token.
    isTokenAutoRefreshEnabled: true,
  });
}
// --- END OF THE NEW BLOCK ---

// Initialize Firestore and Auth (this part is unchanged)
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

// Export your services (this part is unchanged)
export { db, auth };