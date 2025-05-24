import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCG0Y4EAPsaSC-jTIi2g7MoAqn6PnMkZ-0",
  authDomain: "find-francesca-auth.firebaseapp.com",
  projectId: "find-francesca-auth",
  storageBucket: "find-francesca-auth.firebasestorage.app",
  messagingSenderId: "209376793518",
  appId: "1:209376793518:web:d85d81920a0936b8a6ae3f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);