import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js';
import { getDatabase, ref, set, get } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyA-LkMwxEsKcz30XFiZNNp52kfOb8rJtkY",
  authDomain: "idea-hatch-f30a2.firebaseapp.com",
  databaseURL: "https://idea-hatch-f30a2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "idea-hatch-f30a2",
  storageBucket: "idea-hatch-f30a2.firebasestorage.app",
  messagingSenderId: "772329230400",
  appId: "1:772329230400:web:1e633f72154d0c318b0fa5",
  measurementId: "G-8BEDPTPJ76"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const analytics = getAnalytics(app);

// Log page view for analytics
logEvent(analytics, 'page_view', {
  page_title: 'Profile'
});

// Simulated UID (replace with auth later)
const uid = localStorage.getItem('hatchChatUID') || crypto.randomUUID();
localStorage.setItem('hatchChatUID', uid);

const usernameInput = document.getElementById('usernameInput');
const statusInput = document.getElementById('statusInput');
const saveBtn = document.getElementById('saveProfileBtn');
const saveConfirmation = document.getElementById('save-confirmation');
const storedUsername = document.getElementById('storedUsername');
const storedStatus = document.getElementById('storedStatus');

const userRef = ref(db, `hatch-chat/users/${uid}`);

saveBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const status = statusInput.value.trim();
  if (!username) return alert('Enter a username.');
  set(userRef, { username, status }).then(() => {
    storedUsername.textContent = username;
    storedStatus.textContent = status || '—';
    saveConfirmation.classList.remove('hidden');
    setTimeout(() => saveConfirmation.classList.add('hidden'), 3000);

    logEvent(analytics, 'save_profile', { user_id: uid });
  });
});

get(userRef).then(snapshot => {
  if (snapshot.exists()) {
    const data = snapshot.val();
    usernameInput.value = data.username || '';
    statusInput.value = data.status || '';
    storedUsername.textContent = data.username || 'Not Set';
    storedStatus.textContent = data.status || 'Not Set';
  }
});
