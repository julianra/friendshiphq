// ======================================================
// Friendship HQ – Firebase Auth (GitHub Pages compatible)
// ======================================================

// Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

// Firebase Auth
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// ------------------------------------------------------
// Firebase configuratie (DIT IS OK OM PUBLIEK TE STAAN)
// ------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDbShquCPLLzA-x1eDplFLjVxJKk_N2BFo",
  authDomain: "friendship-hq.firebaseapp.com",
  projectId: "friendship-hq",
  storageBucket: "friendship-hq.appspot.com",
  messagingSenderId: "266102616857",
  appId: "1:266102616857:web:70bcc3ea14f1d0cda88b88"
};

// ------------------------------------------------------
// Init
// ------------------------------------------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ------------------------------------------------------
// UI elementen
// ------------------------------------------------------
const loginBtn = document.getElementById("loginBtn");
const modal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");

const googleBtn = document.getElementById("googleLogin");
const emailBtn = document.getElementById("emailLogin");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// ------------------------------------------------------
// Modal gedrag
// ------------------------------------------------------
loginBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// ------------------------------------------------------
// Google login
// ------------------------------------------------------
googleBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    alert(err.message);
  }
});

// ------------------------------------------------------
// Email login / registratie
// ------------------------------------------------------
emailBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Vul email en wachtwoord in");
    return;
  }

  try {
    // Probeer eerst in te loggen
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      // Bestaat niet → maak account aan
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      alert(err.message);
    }
  }
});

// ------------------------------------------------------
// Auth state listener
// ------------------------------------------------------
import { signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const isDashboard = window.location.pathname.endsWith("dashboard.html");

onAuthStateChanged(auth, (user) => {
  if (user) {
    if (!isDashboard) {
      window.location.href = "dashboard.html";
    } else {
      const welcomeText = document.getElementById("welcomeText");
      if (welcomeText) {
        welcomeText.textContent =
          `Welkom, ${user.displayName || user.email}`;
      }
    }
  } else {
    if (isDashboard) {
      window.location.href = "index.html";
    }
  }
});

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}
