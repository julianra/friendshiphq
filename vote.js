// ======================================================
// Friendship HQ – Realtime stemmen
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
  runTransaction,
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
const votingStatus = document.getElementById("votingStatus");

// ------------------------------------------------------
// Auth + stem van gebruiker
// ------------------------------------------------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

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

onValue(activitiesRef, async (snapshot) => {
  activitiesDiv.innerHTML = "";

  const data = snapshot.val();
  if (!data) return;

  for (const [id, activity] of Object.entries(data)) {
    const isMine = currentVoteActivityId === id;
    const votingOpen = isVotingOpen();

    const row = document.createElement("div");
    row.className = "activity-row";
    if (isMine) row.classList.add("mine");

    row.innerHTML = `
      <strong>${activity.name}</strong>
      <span>${activity.votes || 0} stemmen</span>
      <button class="secondary" ${!votingOpen ? "disabled" : ""}>
        ${
          !votingOpen
            ? "Stemmen gesloten"
            : isMine
              ? "Jouw stem"
              : "Stem"
        }
      </button>
    `;

    // -------------------------------
    // STEMKNOP
    // -------------------------------
    row.querySelector("button").onclick = async () => {
      if (!isVotingOpen()) return;

      if (currentVoteActivityId === id) return;

      const previousId = currentVoteActivityId;

      // 1️⃣ stem opslaan per user
      await runTransaction(
        ref(db, `votes/${currentUser.uid}`),
        () => ({
          activityId: id,
          votedAt: Date.now()
        })
      );

      // 2️⃣ nieuwe activiteit +1 + voter
      await runTransaction(
        ref(db, `activities/${id}`),
        (a) => {
          if (!a) return a;
          a.votes = (a.votes || 0) + 1;
          if (!a.voters) a.voters = {};
          a.voters[currentUser.uid] = true;
          return a;
        }
      );

      // 3️⃣ oude activiteit -1 + voter verwijderen
      if (previousId) {
        await runTransaction(
          ref(db, `activities/${previousId}`),
          (a) => {
            if (!a) return a;
            if (a.votes > 0) a.votes -= 1;
            if (a.voters) delete a.voters[currentUser.uid];
            return a;
          }
        );
      }
    };

    // -------------------------------
    // 👥 STEMMERS TONEN (voornamen)
    // -------------------------------
    if (activity.voters) {
      const names = [];

      for (const uid of Object.keys(activity.voters)) {
        const userSnap = await get(ref(db, `users/${uid}`));
        if (!userSnap.exists()) continue;

        const userData = userSnap.val();
        if (userData.firstName && userData.firstName.trim() !== "") {
          names.push(userData.firstName.trim());
        }
      }

      if (names.length > 0) {
        const votersEl = document.createElement("div");
        votersEl.className = "voters";
        votersEl.textContent = `Gestemd door: ${names.join(", ")}`;
        row.appendChild(votersEl);
      }
    }

    activitiesDiv.appendChild(row);
  }
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

// ------------------------------------------------------
// Voting deadline
// ------------------------------------------------------
function isVotingOpen() {
  const now = new Date();
  const year = now.getFullYear();

  let deadline = new Date(year, 0, 15, 23, 59, 59);
  if (now > deadline) {
    deadline = new Date(year + 1, 0, 15, 23, 59, 59);
  }

  return now <= deadline;
}

// ------------------------------------------------------
// Status tekst
// ------------------------------------------------------
if (votingStatus) {
  votingStatus.textContent = isVotingOpen()
    ? "Je kan stemmen tot en met 15 januari."
    : "Stemmen zijn gesloten. De winnaar ligt vast.";
}
