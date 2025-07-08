import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getDatabase, ref, push, onValue } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';
import { firebaseConfig } from './firebase-config.js';
import { initAuth, getCurrentUser } from './auth.js';

// Init
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let annRef;
let currentUser = null;

const list = document.getElementById('announcement-list');
const text = document.getElementById('announcementText');
const postBtn = document.getElementById('postAnnouncementBtn');
const addBtn = document.getElementById('addAnnouncementBtn'); // new button

// Initialize authentication
initAuth().then(user => {
  if (!user) {
    window.location.href = '/auth.html';
    return;
  }
  
  currentUser = user;
  annRef = ref(db, 'hatch-quiz/projects/hatch-chat/announcements');
  initAnnouncementListeners();
});

// Display Announcements
function initAnnouncementListeners() {
  if (!annRef) return;
  
  onValue(annRef, snapshot => {
    list.innerHTML = '';
    const data = snapshot.val();
    if (!data) return;
    Object.values(data).reverse().forEach(item => {
      const card = document.createElement('div');
      card.className = 'announcement-card';
      card.innerHTML = `
        <img src="${item.image}" alt="Ann" />
        <div>
          <h3>${item.title}</h3>
          <p>${item.body}</p>
          <small>${new Date(item.publishedAt).toLocaleString()} by ${item.author || 'Anonymous'}</small>
        </div>
      `;
      list.appendChild(card);
    });
  });
}

// Post new announcement
postBtn.addEventListener('click', () => {
  if (!currentUser) return alert('Please sign in first.');
  const msg = text.value.trim();
  if (msg.length < 10) return alert('Announcement must be at least 10 characters.');
  
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
    alert('Announcement posted!');
  }).catch(err => {
    console.error('Failed:', err);
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
