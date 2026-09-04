import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  deleteDoc,
  deleteField,
  where,
  getDocs
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-WlGgjVC3kH9bPZf3QeuInO6Oa-J900M",
  authDomain: "winchinka.firebaseapp.com",
  projectId: "winchinka",
  storageBucket: "winchinka.firebasestorage.app",
  messagingSenderId: "818235575048",
  appId: "1:818235575048:web:f41409605fc6348182babd"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  deleteDoc,
  deleteField,
  where,
  getDocs
};
