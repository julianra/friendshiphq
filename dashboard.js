// ======================================================
// Friendship HQ – Dashboard (realtime overzicht)
// ======================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

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
function isVotingClosed() {
  const now = new Date();
  const deadline = new Date(now.getFullYear(), 0, 15, 23, 59, 59);
  return now > deadline;
}

// ------------------------------------------------------
// Auth
// ------------------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const snapshot = await get(ref(db, `users/${user.uid}`));
  if (!snapshot.exists()) {
    window.location.href = "settings.html";
    return;
  }

  const data = snapshot.val();
  if (!data.firstName || !data.lastName || !data.zipcode) {
    window.location.href = "settings.html";
    return;
  }

  document.getElementById("welcomeText").textContent = `Welkom, ${data.firstName}`;
});

document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

// ------------------------------------------------------
// UI refs
// ------------------------------------------------------
const overviewDiv = document.getElementById("votesOverview");
const winnerName = document.getElementById("winnerName");
const winnerVotes = document.getElementById("winnerVotes");
const chatBtn = document.getElementById("chatBtn");
const voteBtn = document.getElementById("voteBtn");

const statusText = document.getElementById("statusText");
const statusSub = document.getElementById("statusSub");

// ------------------------------------------------------
// Realtime stemmen
// ------------------------------------------------------
onValue(ref(db, "activities"), (snapshot) => {
  overviewDiv.innerHTML = "";

  if (!snapshot.exists()) return;

  const activities = Object.values(snapshot.val()).map(a => ({
    name: a.name,
    votes: a.votes || 0
  }));

  activities.sort((a, b) => b.votes - a.votes);

  activities.slice(0, 4).forEach((a, i) => {
    const row = document.createElement("div");
    row.className = "vote-row" + (i === 0 ? " leading-vote" : "");
    row.innerHTML = `<span>${a.name}</span><strong>${a.votes}</strong>`;
    overviewDiv.appendChild(row);
  });

  const winner = activities[0];
  if (!winner) return;

  winnerName.textContent = winner.name;
  winnerVotes.textContent = `${winner.votes} stemmen`;

  if (isVotingClosed()) {
    statusText.textContent = "Stemronde gesloten";
    statusSub.textContent = "De activiteit ligt vast. Ga naar de groepschat.";

    voteBtn.classList.add("hidden");
    chatBtn.classList.remove("hidden");

    chatBtn.href = `chat.html?activity=${encodeURIComponent(winner.name)}`;
  }
});

// ------------------------------------------------------
// Countdown
// ------------------------------------------------------
const daysLeftEl = document.getElementById("daysLeft");
if (daysLeftEl) {
  const now = new Date();
  let deadline = new Date(now.getFullYear(), 0, 15);
  if (now > deadline) deadline = new Date(now.getFullYear() + 1, 0, 15);

  const days = Math.max(0, Math.ceil((deadline - now) / 86400000));
  daysLeftEl.textContent = days;
}

// ------------------------------------------------------
// Settings
// ------------------------------------------------------
document.getElementById("settingsBtn").onclick = () => {
  window.location.href = "settings.html";
};
