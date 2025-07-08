import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getDatabase, ref, set, get } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';
import { firebaseConfig } from './firebase-config.js';
import { initAuth, getCurrentUser, updateUserProfile } from './auth.js';


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = null;

const usernameInput = document.getElementById('usernameInput');
const statusInput = document.getElementById('statusInput');
const saveBtn = document.getElementById('saveProfileBtn');
const storedUsername = document.getElementById('storedUsername');
const storedStatus = document.getElementById('storedStatus');

// Initialize authentication
initAuth().then(user => {
  if (!user) {
    window.location.href = '/auth.html';
    return;
  }
  
  currentUser = user;
  loadUserProfile();
});

async function loadUserProfile() {
  if (!currentUser) return;
  
  const userRef = ref(db, `hatch-quiz/users/${currentUser.uid}`);
  const snapshot = await get(userRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    usernameInput.value = data.username || '';
    statusInput.value = data.status || '';
    if (storedUsername) storedUsername.textContent = data.username || '—';
    if (storedStatus) storedStatus.textContent = data.status || '—';
  }
}
saveBtn.addEventListener('click', async () => {
  if (!currentUser) return alert('Please sign in first.');
  
  const username = usernameInput.value.trim();
  const status = statusInput.value.trim();
  if (!username) return alert('Enter a username.');
  
  const result = await updateUserProfile({
    username,
    displayName: username,
    status
  });
  
  if (result.success) {
    alert('Profile saved!');
    if (storedUsername) storedUsername.textContent = username;
    if (storedStatus) storedStatus.textContent = status || '—';
  } else {
    alert('Failed to save profile: ' + result.error);
  }
});