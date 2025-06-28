// ✅ Imports (required)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';
import {
  getDatabase,
  ref,
  push,
  onValue,
  goOffline,
  goOnline
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js';

// ✅ Firebase config
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
const db = getDatabase(app);
const analytics = getAnalytics(app);

// ✅ DOM Elements
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const viewContainer = document.getElementById('view-container');

// ✅ Handle postMessage from login.html iframe
window.addEventListener('message', (event) => {
  if (event.data === 'login-success') {
    loginScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');
    loadView('views/chat.html');
    logEvent(analytics, 'login_success');
  }
});

// ✅ Load views dynamically
function loadView(path) {
  fetch(path)
    .then(res => res.text())
    .then(html => {
      viewContainer.innerHTML = html;

      // Run view-specific setup logic
      if (path.includes('announcement.html')) setupAnnouncements();
      // Future: setupChat() etc. for other views
    });
}

// ✅ Nav buttons handler
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      if (section === 'chat') loadView('views/chat.html');
      if (section === 'announcement') loadView('announcement.html');
      if (section === 'dm') loadView('dm.html');
    });
  });
});

// =====================
// ✅ Announcement Logic
// =====================
function setupAnnouncements() {
  const annRef = ref(db, 'hatch-chat/announcements');

  const annList = document.getElementById('announcement-list');
  const annText = document.getElementById('announcementText');
  const postBtn = document.getElementById('postAnnouncementBtn');
  const addBtn  = document.getElementById('addAnnouncementBtn');

  if (!annList || !annText || !postBtn) return;

  onValue(annRef, snapshot => {
    annList.innerHTML = '';

    const data = snapshot.val();
    if (!data) return;

    Object.entries(data).reverse().forEach(([id, item]) => {
      const title = item?.title || 'Notice';
      const body  = item?.body || 'No content';
      const image = item?.image || 'https://via.placeholder.com/400x200?text=No+Image';
      const date  = item?.publishedAt
        ? new Date(item.publishedAt).toLocaleString()
        : 'Unknown time';

      const card = document.createElement('div');
      card.className = 'announcement-card bg-panel p-4 rounded shadow';
      card.innerHTML = `
        <img src="${image}" alt="Announcement Image" class="w-full max-h-60 object-cover rounded mb-2" />
        <h3 class="text-primary font-semibold">${title}</h3>
        <p class="text-white">${body}</p>
        <small class="text-muted">${date}</small>
      `;
      annList.appendChild(card);
    });
  });

  postBtn.addEventListener('click', () => {
    const msg = annText.value.trim();
    if (msg.length < 10) return alert('Announcement must be at least 10 characters.');

    const newAnn = {
      title: "Notice",
      body: msg,
      image: "https://www.ideahatch.xyz/assets/images/HatchChat/HatchChatLogo.jpg",
      publishedAt: Date.now()
    };

    push(annRef, newAnn).then(() => {
      annText.value = '';
      alert('✅ Announcement posted!');
    }).catch(err => {
      console.error('❌ Failed to post announcement:', err);
      alert('Error posting announcement.');
    });
  });

  addBtn?.addEventListener('click', () => {
    document.getElementById('new-announcement')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    annText?.focus();
  });
}

// ✅ Offline/Online tracking
window.addEventListener('offline', () => goOffline(db));
window.addEventListener('online', () => goOnline(db));
window.addEventListener('beforeunload', () => {
  logEvent(analytics, 'leave_chat', { user: auth.currentUser?.email || 'Anonymous' });
});
