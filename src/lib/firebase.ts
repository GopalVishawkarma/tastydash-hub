
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSbiKuad0dv2pugMhBh1SQf4qq6aVV_90",
  authDomain: "tastydash-e9ce9.firebaseapp.com",
  projectId: "tastydash-e9ce9",
  storageBucket: "tastydash-e9ce9.firebasestorage.app",
  messagingSenderId: "554891213408",
  appId: "1:554891213408:web:5a2ef9eb97054928ff6105",
  measurementId: "G-1LYSDYQ8WB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
