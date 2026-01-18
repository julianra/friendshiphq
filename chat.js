// ======================================================
// Friendship HQ – Chat
// ======================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  get
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

// ------------------------------------------------------
// Firebase config
// ------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDbShquCPLLzA-x1eDplFLjVxJKk_N2BFo",
  authDomain: "friendship-hq.firebaseapp.com",
  databaseURL: "https://friendship-hq-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "friendship-hq",
  storageBucket: "friendship-hq.appspot.com",
  messagingSenderId: "266102616857",
  appId: "1:266102616857:web:70bcc3ea14f1d0cda88b88"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------
function getActivityId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("activity");
}

const activityId = getActivityId();
if (!activityId) {
  alert("Geen activiteit gevonden");
  window.location.href = "dashboard.html";
}

// ------------------------------------------------------
// UI refs
// ------------------------------------------------------
const messagesDiv = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatTitle = document.getElementById("chatTitle");
const backBtn = document.getElementById("backBtn");

// ------------------------------------------------------
// Auth
// ------------------------------------------------------
let currentUser = null;
let displayName = "Onbekend";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  const snap = await get(ref(db, `users/${user.uid}`));
  if (snap.exists()) {
    const data = snap.val();
    displayName = data.firstName || "Onbekend";
  }

  initChat();
});

// ------------------------------------------------------
// Chat logic
// ------------------------------------------------------
function initChat() {
  const chatRef = ref(db, `chats/activity_${activityId}/messages`);

  chatTitle.textContent = `Chat – ${decodeURIComponent(activityId)}`;

  onChildAdded(chatRef, (snapshot) => {
    const msg = snapshot.val();
    renderMessage(msg);
  });

  chatForm.onsubmit = (e) => {
    e.preventDefault();

    const text = messageInput.value.trim();
    if (!text) return;

    push(chatRef, {
      uid: currentUser.uid,
      name: displayName,
      text,
      createdAt: Date.now()
    });

    messageInput.value = "";
  };
}

// ------------------------------------------------------
// Render
// ------------------------------------------------------
function renderMessage(msg) {
  const div = document.createElement("div");
  div.style.marginBottom = "0.5rem";

  const isMine = msg.uid === currentUser.uid;

  div.innerHTML = `
    <div style="
      padding: 0.5rem 0.7rem;
      border-radius: 8px;
      background: ${isMine ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)"};
      max-width: 80%;
      margin-left: ${isMine ? "auto" : "0"};
    ">
      <strong style="font-size:0.8rem;">${msg.name}</strong><br/>
      ${msg.text}
    </div>
  `;

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ------------------------------------------------------
// Navigation
// ------------------------------------------------------
backBtn.onclick = () => {
  window.location.href = "dashboard.html";
};
