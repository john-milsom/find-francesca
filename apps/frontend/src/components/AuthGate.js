import React, { useState, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase";

const ALLOWED_USERS = [
  "john.milsom01@gmail.com",
  "liamdcunliffe@gmail.com"
];

export default function AuthGate({ children }) {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return unsub;
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      alert("Google authentication failed");
    }
  };

  if (!user) {
    return (
      <div style={{ marginTop: 40 }}>
        <h2>Sign In</h2>
        <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      </div>
    );
  }

  if (!ALLOWED_USERS.includes(user.email)) {
    return (
      <div>
        <p>Access denied for this user.</p>
        <button onClick={() => signOut(auth)}>Sign Out</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "right", margin: 10 }}>
        Signed in as {user.email}{" "}
        <button onClick={() => signOut(auth)}>Sign Out</button>
      </div>
      {children}
    </div>
  );
}