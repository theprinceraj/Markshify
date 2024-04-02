import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.FIREBASE_APP_ID,
// };

const firebaseConfig = {
  apiKey: "AIzaSyC_5Arobi0BdImMSBBKree9XKks-pqtkxs",
  authDomain: "smart-sheet-generator.firebaseapp.com",
  databaseURL: "https://smart-sheet-generator-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-sheet-generator",
  storageBucket: "smart-sheet-generator.appspot.com",
  messagingSenderId: "851537036727",
  appId: "1:851537036727:web:219e53c0ff4b3d67d25432"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
