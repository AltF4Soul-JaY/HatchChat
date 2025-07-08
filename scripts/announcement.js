import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getDatabase, ref, push, onValue } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';

// Firebase config (same as main)
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

// Init
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const annRef = ref(db, 'hatch-chat/announcements');

const list = document.getElementById('announcement-list');
const text = document.getElementById('announcementText');
const postBtn = document.getElementById('postAnnouncementBtn');
const addBtn = document.getElementById('addAnnouncementBtn'); // new button

// Display Announcements
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
        <small>${new Date(item.publishedAt).toLocaleString()}</small>
      </div>
    `;
    list.appendChild(card);
  });
});

// Post new announcement
postBtn.addEventListener('click', () => {
  const msg = text.value.trim();
  if (msg.length < 10) return alert('Announcement must be at least 10 characters.');
  
  const newAnn = {
    title: "Notice",
    body: msg,
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
