
window.App = window.App || {};
App.register = {};

// ✅ REGISTER FUNCTION

App.register.createEmployee = async function () {

  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  const team = document.getElementById("reg-team").value;
  const qaType = document.getElementById("reg-qa-type").value;

  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    // ✅ Create Firebase Auth user
    await FirebaseService.auth.createUserWithEmailAndPassword(email, password);

    // ✅ Save in Firestore
    await FirebaseService.db.collection("users").doc(email).set({
      name: name,
      email: email,

      role: "employee",   // 🔒 HARD LOCK

      team: team,
      qaType: qaType,

      profilePic: "",
      caricature: ""
    });

    alert("✅ Employee registered!");

    window.location.href = "login.html";

  } catch (error) {
    alert("Error: " + error.message);
  }
};


// ✅ BUTTON EVENT
document.getElementById("register-btn")?.addEventListener("click", () => {
  App.register.createEmployee();
});

