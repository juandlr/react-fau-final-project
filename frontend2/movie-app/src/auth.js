import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import {initializeApp} from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiT-hH7W-QfYG31LUUEJqlFQl-1B7PFuI",
  authDomain: "hw11-c04ee.firebaseapp.com",
  projectId: "hw11-c04ee",
  storageBucket: "hw11-c04ee.appspot.com",
  messagingSenderId: "720655693097",
  appId: "1:720655693097:web:1fec66df2a7f633c91b338"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export {app,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged,
  signOut,
};