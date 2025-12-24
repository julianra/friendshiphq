// ======================================================
// Friendship HQ – Realtime stemmen (1 stem per gebruiker)
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
  update,
  increment,
  set,
  get
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { runTransaction } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

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

let currentUser = null;
let userVoteActivityId = null;

// ------------------------------------------------------
// Auth check + load user vote
// ------------------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  const voteSnap = await get(ref(db, `votes/${user.uid}`));
  if (voteSnap.exists()) {
    userVoteActivityId = voteSnap.val().activityId;
  }
});

// ------------------------------------------------------
// UI refs
// ------------------------------------------------------
const activitiesDiv = document.getElementById("activities");
const newActivityInput = document.getElementById("newActivity");
const addActivityBtn = document.getElementById("addActivityBtn");

// ------------------------------------------------------
// Realtime activiteiten
// ------------------------------------------------------
const activitiesRef = ref(db, "activities");

onValue(activitiesRef, (snapshot) => {
  activitiesDiv.innerHTML = "";

  const data = snapshot.val();
  if (!data) return;

  Object.entries(data).forEach(([id, activity]) => {
    const row = document.createElement("div");
    row.className = "activity-row";

    const alreadyVoted = userVoteActivityId !== null;
    const isUserChoice = userVoteActivityId === id;

    row.innerHTML = `
      <strong>${activity.name}</strong>
      <span>${activity.votes || 0} stemmen</span>
      <button class="secondary" ${alreadyVoted ? "disabled" : ""}>
        ${isUserChoice ? "Jouw stem" : "Stem"}
      </button>
    `;

    row.querySelector("button").onclick = async () => {
  if (userVoteActivityId) return;

  const userVoteRef = ref(db, `votes/${currentUser.uid}`);
  const activityRef = ref(db, `activities/${id}`);

  // 1️⃣ probeer stem te registreren (wordt maar 1x toegestaan)
  const voteResult = await runTransaction(userVoteRef, (current) => {
    if (current === null) {
      return {
        activityId: id,
        votedAt: Date.now()
      };
    }
    return; // abort transaction
  });

  if (!voteResult.committed) {
    alert("Je hebt al gestemd.");
    return;
  }

  // 2️⃣ verhoog teller PAS NA succesvolle stemregistratie
  await runTransaction(activityRef, (activity) => {
    if (activity) {
      activity.votes = (activity.votes || 0) + 1;
    }
    return activity;
  });

  userVoteActivityId = id;
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

  await push(activitiesRef, {
    name,
    votes: 0,
    createdAt: Date.now()
  });

  newActivityInput.value = "";
};
