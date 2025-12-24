// ======================================================
// Friendship HQ – Realtime stemmen (wijzigbaar, correct)
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
  onValue,
  runTransaction
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
// State
// ------------------------------------------------------
let currentUser = null;
let currentVoteActivityId = null;

// ------------------------------------------------------
// UI refs
// ------------------------------------------------------
const activitiesDiv = document.getElementById("activities");
const newActivityInput = document.getElementById("newActivity");
const addActivityBtn = document.getElementById("addActivityBtn");

// ------------------------------------------------------
// Auth + user vote listener
// ------------------------------------------------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  // 🔑 SINGLE SOURCE OF TRUTH
  const userVoteRef = ref(db, `votes/${user.uid}`);
  onValue(userVoteRef, (snapshot) => {
    currentVoteActivityId = snapshot.exists()
      ? snapshot.val().activityId
      : null;
  });
});

// ------------------------------------------------------
// Realtime activiteiten
// ------------------------------------------------------
const activitiesRef = ref(db, "activities");

onValue(activitiesRef, (snapshot) => {
  activitiesDiv.innerHTML = "";

  const data = snapshot.val();
  if (!data) return;

  Object.entries(data).forEach(([id, activity]) => {
    const isMine = currentVoteActivityId === id;

    const row = document.createElement("div");
    row.className = "activity-row";
    if (isMine) row.classList.add("mine");

    row.innerHTML = `
      <strong>${activity.name}</strong>
      <span>${activity.votes || 0} stemmen</span>
      <button class="secondary">
        ${isMine ? "Jouw stem" : "Stem"}
      </button>
    `;

    row.querySelector("button").onclick = async () => {
      // 😄 zelfde stem → animatie
      if (currentVoteActivityId === id) {
        row.classList.remove("shake");
        void row.offsetWidth;
        row.classList.add("shake");
        return;
      }

      const previousId = currentVoteActivityId;

      // 1️⃣ update stemrecord
      await runTransaction(
        ref(db, `votes/${currentUser.uid}`),
        () => ({
          activityId: id,
          votedAt: Date.now()
        })
      );

      // 2️⃣ nieuwe +1
      await runTransaction(
        ref(db, `activities/${id}`),
        (a) => {
          if (a) a.votes = (a.votes || 0) + 1;
          return a;
        }
      );

      // 3️⃣ oude -1
      if (previousId) {
        await runTransaction(
          ref(db, `activities/${previousId}`),
          (a) => {
            if (a && a.votes > 0) a.votes -= 1;
            return a;
          }
        );
      }
    };

    activitiesDiv.appendChild(row);
  });
});

// ------------------------------------------------------
// Activiteit toevoegen
// ------------------------------------------------------
addActivityBtn.onclick = async () => {
  const name = newActivityInput.value.trim();
  if (!name) return;

  await push(ref(db, "activities"), {
    name,
    votes: 0,
    createdAt: Date.now()
  });

  newActivityInput.value = "";
};
