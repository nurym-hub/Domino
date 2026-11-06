import {initializeApp} from 'firebase/app';import {getDatabase} from 'firebase/database';import {getAuth,signInAnonymously} from 'firebase/auth';
const e=import.meta.env;
const app=initializeApp({apiKey:e.VITE_FIREBASE_API_KEY,authDomain:e.VITE_FIREBASE_AUTH_DOMAIN,databaseURL:e.VITE_FIREBASE_DATABASE_URL,projectId:e.VITE_FIREBASE_PROJECT_ID,appId:e.VITE_FIREBASE_APP_ID});
export const db=getDatabase(app),auth=getAuth(app);
export const login=async()=>{await auth.authStateReady();return auth.currentUser?auth.currentUser.uid:(await signInAnonymously(auth)).user.uid};
