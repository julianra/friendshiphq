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
// Auth check + logout
// ------------------------------------------------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const welcome = document.getElementById("welcomeText");
  if (welcome) {
    welcome.textContent = `Welkom, ${user.displayName || user.email}`;
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

  let topActivity = null;

  Object.values(data).forEach((activity) => {
    const votes = activity.votes || 0;

    const row = document.createElement("div");
    row.className = "vote-row";
    row.innerHTML = `
      <span>${activity.name}</span>
      <strong>${votes}</strong>
    `;
    overviewDiv.appendChild(row);

    if (!topActivity || votes > topActivity.votes) {
      topActivity = {
        name: activity.name,
        votes
      };
    }
  });

  if (topActivity) {
    winnerName.textContent = topActivity.name;
    winnerVotes.textContent = `${topActivity.votes} stemmen`;
  }
});
