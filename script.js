// Paste your Firebase config below
const firebaseConfig = {
  apiKey: "AIzaSyBtkT_QL9EYjavvmeJyijWhEnUJQH4Od3E",
  authDomain: "socialspace-c1dd8.firebaseapp.com",
  databaseURL: "https://socialspace-c1dd8-default-rtdb.firebaseio.com",
  projectId: "socialspace-c1dd8",
  storageBucket: "socialspace-c1dd8.firebasestorage.app",
  messagingSenderId: "935904008674",
  appId: "1:935904008674:web:a369a2960fa0985617c1bb"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
const msgBox = document.getElementById("messages");

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("chat-section").style.display = "block";
    document.getElementById("user-email").textContent = user.email;
    loadUsers(user.uid);
    listenForMessages();
  }
});

function signup() {
  const email = email.value, pass = password.value;
  auth.createUserWithEmailAndPassword(email, pass).catch(alert);
}

function login() {
  const email = email.value, pass = password.value;
  auth.signInWithEmailAndPassword(email, pass).catch(alert);
}

function logout() {
  auth.signOut();
  location.reload();
}

function sendMessage() {
  const msg = messageInput.value;
  const target = chatTarget.value;
  if (!msg) return;
  db.ref(`messages/${target}`).push({
    sender: auth.currentUser.email,
    message: msg,
    time: Date.now()
  });
  messageInput.value = "";
}

function listenForMessages() {
  chatTarget.onchange = () => listenForMessages(); // switch chat room
  const target = chatTarget.value;
  db.ref(`messages/${target}`).off(); // remove old listener
  db.ref(`messages/${target}`).on("child_added", snap => {
    const data = snap.val();
    const p = document.createElement("p");
    p.textContent = `${data.sender}: ${data.message}`;
    msgBox.appendChild(p);
    msgBox.scrollTop = msgBox.scrollHeight;
  });
}

function loadUsers(currentUid) {
  auth.onAuthStateChanged(user => {
    if (user) {
      db.ref("users").once("value", snap => {
        const dropdown = document.getElementById("chatTarget");
        dropdown.innerHTML = '<option value="group">Group Chat</option>';
        Object.entries(snap.val() || {}).forEach(([uid, email]) => {
          if (uid !== user.uid) {
            const option = document.createElement("option");
            option.value = uid < user.uid ? uid + "_" + user.uid : user.uid + "_" + uid;
            option.text = "Chat with " + email;
            dropdown.appendChild(option);
          }
        });
      });
      db.ref(`users/${user.uid}`).set(user.email);
    }
  });
}
