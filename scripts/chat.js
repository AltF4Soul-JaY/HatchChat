import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getDatabase, ref, onChildAdded, push, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';

// This should be centralized in a single config file, but for now, we'll initialize it here.
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
const db = getDatabase(app);
const chatRef = ref(db, 'hatch-chat/chats');

// DOM Elements
const messagesContainer = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// Get username from localStorage, same as in the main script
const username = localStorage.getItem('hatchChatUser') || 'Anonymous';

// Function to send a message
function sendMessage(e) {
  e.preventDefault();
  const messageText = messageInput.value.trim();

  if (messageText) {
    push(chatRef, {
      user: username,
      message: messageText,
      timestamp: serverTimestamp() // Use server-side timestamp for consistency
    });
    messageInput.value = ''; // Clear input after sending
  }
}

// Listen for new messages and display them
onChildAdded(chatRef, (snapshot) => {
  const data = snapshot.val();
  const messageElement = document.createElement('div');
  // Use the same CSS classes as the main chat for consistent styling
  messageElement.classList.add('message', data.user === username ? 'sent' : 'received');
  messageElement.innerHTML = `<strong>${data.user}:</strong> ${data.message}`;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll to the bottom
});

messageForm.addEventListener('submit', sendMessage);