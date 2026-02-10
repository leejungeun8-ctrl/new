
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBN0d9pr7MRqRilfV29bU0gBQH-NGsa3wM",
  authDomain: "gen-lang-client-0143592967.firebaseapp.com",
  projectId: "gen-lang-client-0143592967",
  storageBucket: "gen-lang-client-0143592967.firebasestorage.app",
  messagingSenderId: "812817025512",
  appId: "1:812817025512:web:759a8a80fecdcf6e913c5d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Collection Names
export const COL_RECRUIT = "recruit";
export const COL_LESSON = "col_lesson";
export const COL_USERS = "users";

// Storage Path
export const STR_LESSON = "str_lesson";
