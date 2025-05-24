import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  // ...other config values from your Firebase project
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);