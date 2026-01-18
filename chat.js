// ======================================================
// Friendship HQ – Chat + Planning
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
  set,
  get,
  onChildAdded,
  onValue
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
// Firebase refs
// ------------------------------------------------------
const basePath = `chats/activity_${activityId}`;
const messagesRef = ref(db, `${basePath}/messages`);
const metaRef = ref(db, `${basePath}/meta`);
const participantsRef = ref(db, `${basePath}/participants`);

// ------------------------------------------------------
// UI refs
// ------------------------------------------------------
const messagesDiv = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");

const chatTitle = document.getElementById("chatTitle");
const backBtn = document.getElementById("backBtn");

const activityNameEl = document.getElementById("activityName");
const participantsList = document.getElementById("participantsList");
const comingCheckbox = document.getElementById("comingCheckbox");

const locationInput = document.getElementById("locationInput");
const timeInput = document.getElementById("timeInput");
const savePlanBtn = document.getElementById("savePlanBtn");

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
    displayName = snap.val().firstName || "Onbekend";
  }

  initChat();
});

// ------------------------------------------------------
// Init chat
// ------------------------------------------------------
function initChat() {
  chatTitle.textContent = `Chat – ${decodeURIComponent(activityId)}`;
  activityNameEl.textContent = decodeURIComponent(activityId);

  // ----------------------------------
  // Realtime messages
  // ----------------------------------
  onChildAdded(messagesRef, (snapshot) => {
    renderMessage(snapshot.val());
  });

  // ----------------------------------
  // Meta (locatie + startuur)
  // ----------------------------------
  onValue(metaRef, (snapshot) => {
    if (!snapshot.exists()) return;

    const meta = snapshot.val();
    activityNameEl.textContent = meta.name || decodeURIComponent(activityId);
    locationInput.value = meta.location || "";
    timeInput.value = meta.startTime || "";
  });

  // ----------------------------------
  // Deelnemerslijst
  // ----------------------------------
  onValue(participantsRef, (snapshot) => {
    if (!snapshot.exists()) {
      participantsList.textContent = "Nog niemand bevestigd";
      return;
    }

    const participants = Object.values(snapshot.val())
      .filter(p => p.coming)
      .map(p => p.name);

    participantsList.textContent =
      participants.length ? participants.join(", ") : "Nog niemand bevestigd";
  });

  // ----------------------------------
  // Mijn aanwezigheid sync
  // ----------------------------------
  onValue(ref(db, `${basePath}/participants/${currentUser.uid}`), (snapshot) => {
    if (snapshot.exists()) {
      comingCheckbox.checked = snapshot.val().coming === true;
    }
  });

  // ----------------------------------
  // Send message
  // ----------------------------------
  chatForm.onsubmit = (e) => {
    e.preventDefault();

    const text = messageInput.value.trim();
    if (!text) return;

    push(messagesRef, {
      uid: currentUser.uid,
      name: displayName,
      text,
      createdAt: Date.now()
    });

    messageInput.value = "";
  };
}

// ------------------------------------------------------
// UI actions
// ------------------------------------------------------
comingCheckbox.onchange = () => {
  set(ref(db, `${basePath}/participants/${currentUser.uid}`), {
    name: displayName,
    coming: comingCheckbox.checked
  });
};

savePlanBtn.onclick = () => {
  set(metaRef, {
    name: decodeURIComponent(activityId),
    location: locationInput.value.trim(),
    startTime: timeInput.value
  });
};

backBtn.onclick = () => {
  window.location.href = "dashboard.html";
};

// ------------------------------------------------------
// Render message
// ------------------------------------------------------
function renderMessage(msg) {
  const wrapper = document.createElement("div");
  wrapper.style.marginBottom = "0.5rem";

  const isMine = msg.uid === currentUser.uid;

  wrapper.innerHTML = `
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

  messagesDiv.appendChild(wrapper);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
