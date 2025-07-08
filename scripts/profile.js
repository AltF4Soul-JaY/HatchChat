import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getDatabase, ref, set, get } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';

console.log("env key:", import.meta.env.VITE_FIREBASE_API_KEY);
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Simulated UID (replace with auth later)
const uid = localStorage.getItem('hatchChatUID') || crypto.randomUUID();
localStorage.setItem('hatchChatUID', uid);

const usernameInput = document.getElementById('usernameInput');
const statusInput = document.getElementById('statusInput');
const saveBtn = document.getElementById('saveProfileBtn');
const storedUsername = document.getElementById('storedUsername');
const storedStatus = document.getElementById('storedStatus');

const userRef = ref(db, `hatch-chat/users/${uid}`);

saveBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const status = statusInput.value.trim();
  if (!username) return alert('Enter a username.');
  set(userRef, { username, status });
  alert('Profile saved!');
  storedUsername.textContent = username;
  storedStatus.textContent = status || '—';
});

get(userRef).then(snapshot => {
  if (snapshot.exists()) {
    const data = snapshot.val();
    usernameInput.value = data.username || '';
    statusInput.value = data.status || '';
    storedUsername.textContent = data.username || '—';
    storedStatus.textContent = data.status || '—';
  }
});
