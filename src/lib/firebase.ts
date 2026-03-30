import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBRjFEd0kNmTLFik7JARKDvA8ySPXPOwv4",
  authDomain: "darwin-now-agent-2026.firebaseapp.com",
  projectId: "darwin-now-agent-2026",
  storageBucket: "darwin-now-agent-2026.firebasestorage.app",
  messagingSenderId: "918060634492",
  appId: "1:918060634492:web:71761ef338fd3345e994f9",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
