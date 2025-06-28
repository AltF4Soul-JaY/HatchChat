import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyA-LkMwxEsKcz30XFiZNNp52kfOb8rJtkY",
  authDomain: "idea-hatch-f30a2.firebaseapp.com",
  databaseURL: "https://idea-hatch-f30a2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "idea-hatch-f30a2",
  storageBucket: "idea-hatch-f30a2.appspot.com",
  messagingSenderId: "772329230400",
  appId: "1:772329230400:web:1e633f72154d0c318b0fa5",
  measurementId: "G-8BEDPTPJ76"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.parent.postMessage('login-success', '*');
  } catch (err) {
    alert('Login failed: ' + err.message);
  }
});

document.getElementById('googleLogin')?.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    window.parent.postMessage('login-success', '*');
  } catch (err) {
    alert('Google login failed: ' + err.message);
  }
});
// After successful login (inside auth.js used by login.html)
window.parent.postMessage('login-success', '*');

