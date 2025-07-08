// Firebase SDK Imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js';
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  onValue,
  serverTimestamp,
  goOffline,
  goOnline
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';
import { firebaseConfig } from './firebase-config.js';
import { initAuth, getCurrentUser, signOutUser } from './auth.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

// Log page view
logEvent(analytics, 'page_view', {
  page_title: 'HatchChat',
  page_location: location.href
});

// ===========================
// Chat Logic
// ===========================
let chatRef;
let annRef;
let currentUser = null;

const editUsername = document.getElementById('editUsername');
const saveUsernameBtn = document.getElementById('saveUsernameBtn');
const welcomeText = document.getElementById('welcomeText');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// Initialize authentication
initAuth().then(user => {
  if (!user) {
    console.log('🔄 Redirecting to auth page...');
    window.location.href = '/auth.html';
    return;
  }
  
  currentUser = user;
  console.log('✅ User authenticated, initializing app...');
  
  // Initialize database references with new structure
  chatRef = ref(db, 'hatch-quiz/projects/hatch-chat/chats');
  annRef = ref(db, 'hatch-quiz/projects/hatch-chat/announcements');
  
  // Set welcome message
  welcomeText.textContent = `Welcome, ${user.displayName || user.email}! 🎉`;
  
  // Initialize chat listeners
  initChatListeners();
  initAnnouncementListeners();
  
  // Add sign out functionality
  addSignOutButton();
});

function addSignOutButton() {
  const nav = document.querySelector('nav');
  const signOutBtn = document.createElement('button');
  signOutBtn.className = 'nav-btn w-full py-2 text-left mt-auto bg-red-600 hover:bg-red-700';
  signOutBtn.innerHTML = '🚪 Sign Out';
  signOutBtn.addEventListener('click', async () => {
    console.log('🔄 Signing out...');
    const result = await signOutUser();
    if (result.success) {
      window.location.href = '/auth.html';
    }
  });
  nav.appendChild(signOutBtn);
}

function initChatListeners() {
  if (!chatRef) return;

  console.log('🔄 Initializing chat listeners...');
  
  // Listen for new messages
  onChildAdded(chatRef, snapshot => {
    const data = snapshot.val();
    const msg = data.message || data.msg1 || data.msg2 || data.msg3 || '[No message]';

    const div = document.createElement('div');
    div.className = 'message ' + (data.userId === currentUser.uid ? 'me' : 'user');
    
    const timestamp = data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '';
    div.innerHTML = `
      <div class="message-header">
        <strong>${data.username || data.user || 'Anonymous'}</strong>
        <small class="timestamp">${timestamp}</small>
      </div>
      <div class="message-content">${msg}</div>
    `;
    
    chatBox?.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;

    logEvent(analytics, 'receive_message', { user: data.username || data.user });
  });
}

function sendMessage() {
  if (!currentUser) {
    alert('Please sign in first.');
    return;
  }
  
  const msg = messageInput.value.trim();
  if (!msg) return;

  console.log('🔄 Sending message...');
  
  push(chatRef, {
    userId: currentUser.uid,
    username: currentUser.displayName || currentUser.email,
    user: currentUser.displayName || currentUser.email, // backward compatibility
    message: msg,
    timestamp: serverTimestamp()
  }).then(() => {
    console.log('✅ Message sent');
    messageInput.value = '';
    logEvent(analytics, 'send_message', { user: currentUser.displayName });
  }).catch(err => {
    console.error('❌ Message send failed:', err);
    alert('Failed to send message. Please try again.');
  });
}

sendBtn?.addEventListener('click', sendMessage);
messageInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

// ===========================
// Announcement Logic
// ===========================

const annList = document.getElementById('announcement-list');
const annText = document.getElementById('announcementText');
const postBtn = document.getElementById('postAnnouncementBtn');
const addBtn = document.getElementById('addAnnouncementBtn');

function initAnnouncementListeners() {
  if (!annRef) return;
  
  console.log('🔄 Initializing announcement listeners...');
  
  onValue(annRef, snapshot => {
    if (!annList) return;
    annList.innerHTML = '';

    const data = snapshot.val();
    if (!data) {
      annList.innerHTML = '<p class="text-muted text-center">No announcements yet.</p>';
      return;
    }

    Object.entries(data).reverse().forEach(([id, item]) => {
      const title = item?.title || 'Notice';
      const body = item?.body || 'No content';
      const image = item?.image || 'https://via.placeholder.com/400x200?text=No+Image';
      const date = item?.publishedAt
        ? new Date(item.publishedAt).toLocaleString()
        : 'Unknown time';

      const card = document.createElement('div');
      card.className = 'announcement-card bg-panel p-4 rounded shadow mb-4';
      card.innerHTML = `
        <img src="${image}" alt="Announcement Image" class="w-full max-h-60 object-cover rounded mb-2" />
        <h3 class="text-primary font-semibold mb-2">${title}</h3>
        <p class="text-white mb-2">${body}</p>
        <small class="text-muted">${date} by ${item.author || 'Anonymous'}</small>
      `;
      annList.appendChild(card);
    });
  });
}

postBtn?.addEventListener('click', () => {
  if (!currentUser) {
    alert('Please sign in first.');
    return;
  }
  
  const msg = annText.value.trim();
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
    annText.value = '';
    alert('✅ Announcement posted!');
    console.log('✅ Announcement posted successfully');
  }).catch(err => {
    console.error('❌ Failed to post announcement:', err);
    alert('Error posting announcement. Please try again.');
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
// Navigation Logic
// ===========================
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

navButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.dataset.section;
    if (!targetId) return;

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
// Profile Logic
// ===========================
const profileUsername = document.getElementById('profileUsername');
const profileStatus = document.getElementById('profileStatus');
const saveProfileBtn = document.getElementById('saveProfileBtn');

saveProfileBtn?.addEventListener('click', async () => {
  if (!currentUser) {
    alert('Please sign in first.');
    return;
  }
  
  const username = profileUsername.value.trim();
  const status = profileStatus.value.trim();
  
  if (!username) {
    alert('Please enter a username.');
    return;
  }
  
  console.log('🔄 Updating profile...');
  
  const { updateUserProfile } = await import('./auth.js');
  const result = await updateUserProfile({
    username,
    displayName: username,
    status
  });
  
  if (result.success) {
    alert('✅ Profile updated successfully!');
    welcomeText.textContent = `Welcome, ${username}! 🎉`;
  } else {
    alert('❌ Failed to update profile: ' + result.error);
  }
});

// ===========================
// Connection Status
// ===========================
window.addEventListener('offline', () => {
  console.log('📡 Going offline...');
  goOffline(db);
});

window.addEventListener('online', () => {
  console.log('📡 Going online...');
  goOnline(db);
});

window.addEventListener('beforeunload', () => {
  if (currentUser) {
    logEvent(analytics, 'leave_chat', { user: currentUser.displayName });
  }
});

console.log('✅ HatchChat initialized successfully!');