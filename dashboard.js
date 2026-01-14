// ======================================================
// Friendship HQ – Dashboard (realtime overzicht)
// ======================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";


import {
  getDatabase,
  ref,
  onValue,
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
// Auth check + logout
// ------------------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);

  // -------------------------------
  // ❌ PROFIEL ONVOLLEDIG → NAAR SETTINGS
  // -------------------------------
  if (!snapshot.exists()) {
    window.location.href = "settings.html";
    return;
  }

  const data = snapshot.val();

  const hasFirstName = data.firstName && data.firstName.trim() !== "";
  const hasLastName = data.lastName && data.lastName.trim() !== "";
  const hasZipcode = data.zipcode && data.zipcode.trim() !== "";

  if (!hasFirstName || !hasLastName || !hasZipcode) {
    window.location.href = "settings.html";
    return;
  }

  // -------------------------------
  // ✅ PROFIEL OK → DASHBOARD TOEGESTAAN
  // -------------------------------
  const welcome = document.getElementById("welcomeText");
  if (welcome) {
    welcome.textContent = `Welkom, ${data.firstName}`;
  }
});

document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

// ------------------------------------------------------
// Realtime stemmen
// ------------------------------------------------------
const overviewDiv = document.getElementById("votesOverview");
const winnerName = document.getElementById("winnerName");
const winnerVotes = document.getElementById("winnerVotes");

const activitiesRef = ref(db, "activities");

onValue(activitiesRef, (snapshot) => {
  overviewDiv.innerHTML = "";

  const data = snapshot.val();
  if (!data) {
    overviewDiv.innerHTML = "<p class='muted'>Nog geen activiteiten</p>";
    winnerName.textContent = "—";
    winnerVotes.textContent = "Nog geen stemmen";
    return;
  }

  // Zet data om naar array
  const activities = Object.values(data).map(activity => ({
    name: activity.name,
    votes: activity.votes || 0
  }));

  // Sorteer op stemmen (hoog → laag)
  activities.sort((a, b) => b.votes - a.votes);

  // -------------------------------
  // 🔒 LIVE STEMMEN: MAX 4
  // -------------------------------
  const topFour = activities.slice(0, 4);

  topFour.forEach((activity, index) => {
    const row = document.createElement("div");
    row.className = "vote-row";

    // Optioneel: highlight leider
    if (index === 0) {
      row.classList.add("leading-vote");
    }

    row.innerHTML = `
      <span>${activity.name}</span>
      <strong>${activity.votes}</strong>
    `;
    overviewDiv.appendChild(row);
  });

  // -------------------------------
  // 🏆 WINNAAR
  // -------------------------------
  const winner = activities[0];
  if (winner) {
    winnerName.textContent = winner.name;
    winnerVotes.textContent = `${winner.votes} stemmen`;
  } else {
    winnerName.textContent = "—";
    winnerVotes.textContent = "Nog geen stemmen";
  }
});

const daysLeftEl = document.getElementById("daysLeft");

if (daysLeftEl) {
  const now = new Date();

  const currentYear = now.getFullYear();

  // Deadline: 15 januari
  let deadline = new Date(currentYear, 0, 15);

  // Als we NA 15 januari zitten, pak volgend jaar
  if (now > deadline) {
    deadline = new Date(currentYear + 1, 0, 15);
  }

  const diffMs = deadline - now;
  const daysLeft = Math.max(
    0,
    Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  );

  daysLeftEl.textContent = daysLeft;
}
const settingsBtn = document.getElementById("settingsBtn");

if (settingsBtn) {
  settingsBtn.onclick = () => {
    window.location.href = "settings.html";
  };
}
