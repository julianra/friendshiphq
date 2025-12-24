// ======================================================
// Friendship HQ – Firebase Auth (GitHub Pages)
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
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// ------------------------------------------------------
// Firebase configuratie
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
// UI elementen (index.html)
// ------------------------------------------------------
const modal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");

const openLogin = document.getElementById("openLogin");
const openRegister = document.getElementById("openRegister");
const modalTitle = document.getElementById("modalTitle");

const googleBtn = document.getElementById("googleLogin");
const emailLoginBtn = document.getElementById("emailLogin");
const emailRegisterBtn = document.getElementById("emailRegister");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// ------------------------------------------------------
// Modal open/sluit
// ------------------------------------------------------
if (openLogin) {
  openLogin.onclick = () => {
    modalTitle.textContent = "Aanmelden";
    modal.classList.remove("hidden");
  };
}

if (openRegister) {
  openRegister.onclick = () => {
    modalTitle.textContent = "Registreren";
    modal.classList.remove("hidden");
  };
}

if (closeModal) {
  closeModal.onclick = () => {
    modal.classList.add("hidden");
  };
}

// ------------------------------------------------------
// Google login (login = registratie indien nodig)
// ------------------------------------------------------
if (googleBtn) {
  googleBtn.onclick = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      alert(err.message);
    }
  };
}

// ------------------------------------------------------
// Email login (GEEN auto-registratie)
// ------------------------------------------------------
if (emailLoginBtn) {
  emailLoginBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Vul email en wachtwoord in");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      alert("Onjuist email of wachtwoord");
    }
  };
}

// ------------------------------------------------------
// Email registratie (expliciet)
// ------------------------------------------------------
if (emailRegisterBtn) {
  emailRegisterBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Vul email en wachtwoord in");
      return;
    }

    if (password.length < 6) {
      alert("Wachtwoord moet minstens 6 tekens lang zijn");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }
  };
}

// ------------------------------------------------------
// Auth state + redirects
// ------------------------------------------------------
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

// ------------------------------------------------------
// Logout (dashboard)
// ------------------------------------------------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.onclick = async () => {
    await signOut(auth);
    window.location.href = "index.html";
  };
}
