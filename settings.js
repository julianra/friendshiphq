// ======================================================
// Friendship HQ – Settings
// ======================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  update,
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
// DOM refs
// ------------------------------------------------------
const firstNameInput = document.getElementById("firstNameInput");
const lastNameInput = document.getElementById("lastNameInput");
const zipcodeInput = document.getElementById("zipcodeInput");
const avatarGrid = document.getElementById("avatarGrid");
const saveBtn = document.getElementById("saveBtn");

// ------------------------------------------------------
// Avatar list (200)
// ------------------------------------------------------
const AVATARS = [
  // 🎵 Muziek – solo
  "David Bowie","Prince","Michael Jackson","Madonna","Elvis Presley",
  "Freddie Mercury","Eminem","Kanye West","Taylor Swift","Adele",
  "Drake","Rihanna","The Weeknd","Beyoncé","Bruno Mars",
  "Johnny Cash","Bob Dylan","Elton John","Paul McCartney","Lady Gaga",

  // 🎸 Bands
  "The Beatles","Queen","Nirvana","Metallica","Pink Floyd",
  "AC/DC","Linkin Park","Radiohead","Coldplay","U2",
  "Rammstein","Gorillaz","Foo Fighters","Green Day","Arctic Monkeys",
  "Daft Punk","Red Hot Chili Peppers","Muse","Pearl Jam","Oasis",

  // 🎬 Film icons
  "Iron Man","Captain America","Thor","Hulk","Black Widow",
  "Batman","Joker","Superman","Wonder Woman","Flash",
  "Darth Vader","Yoda","Luke Skywalker","Obi-Wan Kenobi","Han Solo",
  "Indiana Jones","James Bond","Neo","Morpheus","Trinity",
  "John Wick","Rocky Balboa","Rambo","Terminator","Robocop",

  // 📺 Series
  "Walter White","Jesse Pinkman","Saul Goodman","Rick Grimes","Daryl Dixon",
  "Jon Snow","Daenerys","Tyrion Lannister","Arya Stark","The Hound",
  "Geralt of Rivia","Yennefer","Ciri","Kratos","Atreus",
  "Eleven","Vecna","Sherlock Holmes","Doctor Who","The Mandalorian",

  // 🦸 Comics
  "Spider-Man","Deadpool","Wolverine","Professor X","Magneto",
  "Doctor Strange","Scarlet Witch","Vision","Thanos","Loki",
  "Green Lantern","Aquaman","Shazam","Darkseid","Nightwing",
  "Punisher","Ghost Rider","Blade","Moon Knight","Silver Surfer",

  // 🎮 Games
  "Mario","Luigi","Bowser","Yoshi","Donkey Kong",
  "Link","Zelda","Ganondorf","Samus Aran","Kirby",
  "Sonic","Tails","Knuckles","Shadow","Pikachu",
  "Ash Ketchum","Cloud Strife","Sephiroth","Tifa","Aerith",
  "Arthur Morgan","John Marston","CJ","Big Smoke","Trevor Philips",

  // 🧠 Sci-Fi / Fantasy
  "Gandalf","Aragorn","Legolas","Gimli","Frodo",
  "Saruman","Sauron","Dumbledore","Voldemort","Harry Potter",
  "Neo Matrix","Agent Smith","Master Chief","Cortana","Marcus Fenix",

  // 🥋 Sport & MMA
  "Conor McGregor","Khabib Nurmagomedov","Jon Jones","Anderson Silva","Israel Adesanya",
  "Georges St-Pierre","Francis Ngannou","Nate Diaz","Nick Diaz","Alex Pereira",
  "Mike Tyson","Muhammad Ali","Floyd Mayweather","Manny Pacquiao","Bruce Lee",
  "Fedor Emelianenko","Ronda Rousey","Valentina Shevchenko","Max Holloway","Sean O'Malley",

  // 🌍 Pop culture / misc
  "Elon Musk","Steve Jobs","Nikola Tesla","Albert Einstein","Stephen Hawking",
  "Mr. Bean","Charlie Chaplin","James Cameron","Stan Lee","Hideo Kojima"
];

// ------------------------------------------------------
// State
// ------------------------------------------------------
let currentUser = null;
let selectedAvatar = null;

// ------------------------------------------------------
// Render avatars
// ------------------------------------------------------
function renderAvatars(currentAvatar) {
  avatarGrid.innerHTML = "";

  AVATARS.forEach(name => {
    const div = document.createElement("div");
    div.className = "avatar-option";
    div.textContent = name;

    if (name === currentAvatar) {
      div.classList.add("selected");
      selectedAvatar = name;
    }

    div.onclick = () => {
      selectedAvatar = name;
      document
        .querySelectorAll(".avatar-option")
        .forEach(el => el.classList.remove("selected"));
      div.classList.add("selected");
    };

    avatarGrid.appendChild(div);
  });
}

// ------------------------------------------------------
// Auth + load user data
// ------------------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);

  let savedAvatar = null;

if (snapshot.exists()) {
  const data = snapshot.val();

  firstNameInput.value = data.firstName || "";
  lastNameInput.value = data.lastName || "";
  zipcodeInput.value = data.zipcode || "";
  savedAvatar = data.avatar || null;
}

renderAvatars(savedAvatar);

});

// ------------------------------------------------------
// Save settings
// ------------------------------------------------------
saveBtn.onclick = async () => {
  if (!currentUser) return;

  await update(ref(db, `users/${currentUser.uid}`), {
    firstName: firstNameInput.value.trim(),
    lastName: lastNameInput.value.trim(),
    zipcode: zipcodeInput.value.trim(),
    avatar: selectedAvatar
  });

  alert("Instellingen opgeslagen ✅");
};
