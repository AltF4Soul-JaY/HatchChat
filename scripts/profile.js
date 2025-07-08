import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { 
  getDatabase, 
  ref, 
  get 
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';
import { firebaseConfig } from './firebase-config.js';
import { initAuth, getCurrentUser, updateUserProfile } from './auth.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = null;

const usernameInput = document.getElementById('usernameInput');
const statusInput = document.getElementById('statusInput');
const saveBtn = document.getElementById('saveProfileBtn');

// Initialize authentication
initAuth().then(user => {
  if (!user) {
    window.location.href = '/auth.html';
    return;
  }
  
  currentUser = user;
  loadUserProfile();
  console.log('✅ Profile page initialized');
});

async function loadUserProfile() {
  if (!currentUser) return;
  
  try {
    const userRef = ref(db, `hatch-quiz/users/${currentUser.uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      usernameInput.value = data.username || '';
      statusInput.value = data.status || '';
    }
  } catch (error) {
    console.error('❌ Error loading profile:', error);
  }
}

saveBtn.addEventListener('click', async () => {
  if (!currentUser) {
    alert('Please sign in first.');
    return;
  }
  
  const username = usernameInput.value.trim();
  const status = statusInput.value.trim();
  
  if (!username) {
    alert('Please enter a username.');
    return;
  }
  
  console.log('🔄 Updating profile...');
  
  const result = await updateUserProfile({
    username,
    displayName: username,
    status
  });
  
  if (result.success) {
    alert('✅ Profile saved successfully!');
    console.log('✅ Profile updated successfully');
  } else {
    alert('❌ Failed to save profile: ' + result.error);
    console.error('❌ Profile update failed:', result.error);
  }
});