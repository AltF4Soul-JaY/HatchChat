const firebaseConfig = {
  apiKey: "AIzaSyA-LkMwxEsKcz30XFiZNNp52kfOb8rJtkY",
  authDomain: "idea-hatch-f30a2.firebaseapp.com",
  databaseURL: "https://idea-hatch-f30a2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "idea-hatch-f30a2",
  storageBucket: "idea-hatch-f30a2.appspot.com",
  messagingSenderId: "772329230400",
  appId: "1:772329230400:web:1e633f72154d0c318b0fa5"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const entrySection = document.getElementById("entry-section");
const chatSection = document.getElementById("chat-section");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("messageInput");
const welcomeText = document.getElementById("welcomeText");
const editUsername = document.getElementById("editUsername");
const saveUsernameBtn = document.getElementById("saveUsernameBtn");

let username = "";

document.getElementById("enterChatBtn").onclick = () => {
  username = "User-" + Math.floor(Math.random() * 9000 + 1000);
  editUsername.value = username;
  welcomeText.textContent = `Welcome, ${username}!`;
  entrySection.classList.add("hidden");
  chatSection.classList.remove("hidden");
};

saveUsernameBtn.onclick = () => {
  const newName = editUsername.value.trim();
  if (newName) {
    username = newName;
    welcomeText.textContent = `Welcome, ${username}!`;
  }
};

function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    db.ref("chats").push({ user: username, message });
    messageInput.value = "";
  }
}

document.getElementById("sendBtn").onclick = sendMessage;
messageInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

db.ref("chats").on("child_added", snapshot => {
  const data = snapshot.val();
  const p = document.createElement("p");
  p.classList.add("fade-in");
  p.innerHTML = `<strong class="text-cyan-400">${data.user}:</strong> ${data.message}`;
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
});
