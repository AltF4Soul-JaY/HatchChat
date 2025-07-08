import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getDatabase, ref, set, get } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
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
