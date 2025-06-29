import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getDatabase, ref, push, onValue } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';

// Firebase config (same as main)
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
