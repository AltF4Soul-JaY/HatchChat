// ✅ Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(reg => console.log('✅ Service Worker registered:', reg.scope))
    .catch(err => console.error('❌ Service Worker registration failed:', err));
}

// ✅ Firebase SDK Imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js';
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  onValue,
  goOffline,
  goOnline
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';
import { firebaseConfig } from './firebase-config.js';
import { initAuth, getCurrentUser, signOutUser } from './auth.js';

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

// ✅ Log page view
logEvent(analytics, 'page_view', {
  page_title: 'HatchChat',
  page_location: location.href
});

// ===========================
// ✅ Chat Logic
// ===========================
let chatRef;
let annRef;
let currentUser = null;

const editUsername    = document.getElementById('editUsername');
const saveUsernameBtn = document.getElementById('saveUsernameBtn');
const welcomeText     = document.getElementById('welcomeText');
const chatBox         = document.getElementById('chat-box');
const messageInput    = document.getElementById('messageInput');
const sendBtn         = document.getElementById('sendBtn');

// Initialize authentication
initAuth().then(user => {
  if (!user) {
    // Redirect to auth page if not signed in
    window.location.href = '/auth.html';
    return;
  }
  
  currentUser = user;
  
  // Initialize database references with new structure
  chatRef = ref(db, 'hatch-quiz/projects/hatch-chat/chats');
  annRef = ref(db, 'hatch-quiz/projects/hatch-chat/announcements');
  
  // Set welcome message
  welcomeText.textContent = `Welcome, ${user.displayName || user.email}!`;
  
  // Initialize chat listeners
  initChatListeners();
  initAnnouncementListeners();
  
  // Add sign out functionality
  addSignOutButton();
});

function addSignOutButton() {
  const nav = document.querySelector('nav');
  const signOutBtn = document.createElement('button');
  signOutBtn.className = 'nav-btn w-full py-2 text-left mt-auto';
  signOutBtn.innerHTML = '🚪 Sign Out';
  signOutBtn.addEventListener('click', async () => {
    const result = await signOutUser();
    if (result.success) {
      window.location.href = '/auth.html';
    }
  });
  nav.appendChild(signOutBtn);
}
function initChatListeners() {
  if (!chatRef) return;

  // Listen for new messages
  onChildAdded(chatRef, snapshot => {
    const data = snapshot.val();
    const msg = data.message || data.msg1 || data.msg2 || data.msg3 || '[No message]';

    const div = document.createElement('div');
    div.className = 'message ' + (data.userId === currentUser.uid ? 'me' : 'user');
    div.innerHTML = `<strong>${data.username || data.user}:</strong> ${msg}`;
    chatBox?.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;

    logEvent(analytics, 'receive_message', { user: data.username || data.user });
  });
}

function sendMessage() {
  if (!currentUser) return alert('Please sign in first.');
  const msg = messageInput.value.trim();
  if (!msg) return;

  push(chatRef, {
    userId: currentUser.uid,
    username: currentUser.displayName || currentUser.email,
    user: currentUser.displayName || currentUser.email, // backward compatibility
    message: msg,
    timestamp: Date.now()
  }).catch(err => console.error('❌ Message push failed:', err));

  messageInput.value = '';
  logEvent(analytics, 'send_message', { user: currentUser.displayName });
}

sendBtn?.addEventListener('click', sendMessage);
messageInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

// ===========================
// ✅ Announcement Logic
// ===========================

const annList = document.getElementById('announcement-list');
const annText = document.getElementById('announcementText');
const postBtn = document.getElementById('postAnnouncementBtn');
const addBtn  = document.getElementById('addAnnouncementBtn');

function initAnnouncementListeners() {
  if (!annRef) return;
  
  onValue(annRef, snapshot => {
    if (!annList) return;
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
        <small class="text-muted">${date} by ${item.author || 'Anonymous'}</small>
      `;
      annList.appendChild(card);
    });
  });
}

postBtn?.addEventListener('click', () => {
  if (!currentUser) return alert('Please sign in first.');
  const msg = annText.value.trim();
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

// ===========================
// ✅ Navigation Logic
// ===========================
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

navButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.dataset.section;

    sections.forEach(section => {
      section.classList.remove('active', 'block');
      section.classList.add('hidden');
    });

    const target = document.getElementById(targetId);
    if (target) {
      target.classList.add('active');
      target.classList.remove('hidden');
    }

    navButtons.forEach(btn => btn.classList.remove('bg-primary', 'text-white'));
    button.classList.add('bg-primary', 'text-white');
  });
});

// ===========================
// ✅ Connection Status
// ===========================
window.addEventListener('offline', () => goOffline(db));
window.addEventListener('online', () => goOnline(db));
window.addEventListener('beforeunload', () => {
  if (currentUser) {
    logEvent(analytics, 'leave_chat', { user: currentUser.displayName });
  }
});
