import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { 
  getDatabase, 
  ref, 
  push, 
  onValue,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';
import { firebaseConfig } from './firebase-config.js';
import { initAuth, getCurrentUser } from './auth.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let annRef;
let currentUser = null;

const list = document.getElementById('announcement-list');
const text = document.getElementById('announcementText');
const postBtn = document.getElementById('postAnnouncementBtn');
const addBtn = document.getElementById('addAnnouncementBtn');

// Initialize authentication
initAuth().then(user => {
  if (!user) {
    window.location.href = '/auth.html';
    return;
  }
  
  currentUser = user;
  annRef = ref(db, 'hatch-quiz/projects/hatch-chat/announcements');
  initAnnouncementListeners();
  console.log('✅ Announcement page initialized');
});

// Display Announcements
function initAnnouncementListeners() {
  if (!annRef) return;
  
  onValue(annRef, snapshot => {
    list.innerHTML = '';
    const data = snapshot.val();
    
    if (!data) {
      list.innerHTML = '<p class="text-center text-muted">No announcements yet.</p>';
      return;
    }
    
    Object.entries(data).reverse().forEach(([id, item]) => {
      const card = document.createElement('div');
      card.className = 'announcement-card';
      card.innerHTML = `
        <img src="${item.image || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="Announcement" />
        <div>
          <h3>${item.title || 'Notice'}</h3>
          <p>${item.body || 'No content'}</p>
          <small>${new Date(item.publishedAt).toLocaleString()} by ${item.author || 'Anonymous'}</small>
        </div>
      `;
      list.appendChild(card);
    });
  });
}

// Post new announcement
postBtn.addEventListener('click', () => {
  if (!currentUser) {
    alert('Please sign in first.');
    return;
  }
  
  const msg = text.value.trim();
  if (msg.length < 10) {
    alert('Announcement must be at least 10 characters.');
    return;
  }
  
  console.log('🔄 Posting announcement...');
  
  const newAnn = {
    title: "Notice",
    body: msg,
    author: currentUser.displayName || currentUser.email,
    authorId: currentUser.uid,
    image: "https://www.ideahatch.xyz/assets/images/HatchChat/HatchChatLogo.jpg",
    publishedAt: Date.now()
  };

  push(annRef, newAnn).then(() => {
    text.value = '';
    alert('✅ Announcement posted!');
    console.log('✅ Announcement posted successfully');
  }).catch(err => {
    console.error('❌ Failed to post announcement:', err);
    alert('Failed to post announcement.');
  });
});

// Scroll to form on "Add Announcement" click
if (addBtn) {
  addBtn.addEventListener('click', () => {
    const form = document.getElementById('new-announcement');
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    text.focus();
  });
}