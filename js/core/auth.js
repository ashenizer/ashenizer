window.App = window.App || {};
App.auth = {};

// ✅ LOGIN
App.auth.login = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await FirebaseService.auth.signInWithEmailAndPassword(email, password);
    console.log("Login success ✅");

  } catch (error) {
   console.log("🔥 inside catch", error.code);

    let message = "Login failed ❌";

    switch (error.code) {
      case "auth/invalid-email":
        message = "Please enter a valid email address 📧";
        break;

      case "auth/user-not-found":
        message = "Account not found ❌";
        break;

      case "auth/wrong-password":
        message = "Incorrect password ❌";
        break;

      case "auth/too-many-requests":
        message = "Too many attempts. Try again later ⏳";
        break;

      default:
        message = "Login failed. Please try again.";
    }

    const popup = document.getElementById("error-popup");
    const messageBox = document.getElementById("popup-message");

if (popup && messageBox) {
  messageBox.textContent = message;

  // ✅ REMOVE hidden first
  popup.classList.remove("hidden");

  // ✅ THEN show animation
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");

    // ✅ IMPORTANT: hide it again after animation
    popup.classList.add("hidden");

  }, 3000);
}
  }
};



// ✅ AUTH STATE
document.addEventListener("DOMContentLoaded", () => {

  FirebaseService.auth.onAuthStateChanged(async (firebaseUser) => {

const loginForm =
  document.getElementById("login-form");

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      await App.auth.login();

    }
  );

}

const currentPage =
  window.location.pathname.split("/").pop();

const isLoginPage = currentPage === "login.html";
const isDashboard = currentPage === "ui.html";
const isGodPage = currentPage === "god.html";
const isRegisterPage = currentPage === "register.html";

    // ❌ Not logged in
    if (!firebaseUser && (isDashboard || isGodPage)) {
      window.location.href = "login.html";
      return;
    }

    // ✅ Logged in
    if (firebaseUser) {

      const email = firebaseUser.email;
      const user = await App.data.getUser(email);

      if (!user) {
        console.log("User not found");
        return;
      }

      App.currentUser = user;
      App.currentUserEmail = email;

      console.log("✅ Logged in:", email);

      if (isLoginPage) {
  if (user.role === "god") {
    window.location.href = "god.html";
  } else {
    window.location.href = "ui.html";
  }
}
    }
  });

  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) loginBtn.addEventListener("click", App.auth.login);

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", App.auth.logout);
});

// ✅ navigate to register
document.getElementById("go-register")?.addEventListener("click", () => {
  window.location.href = "register.html";
});

App.auth.logout = function () {

  console.log(window.location.href);
  console.log(window.location.pathname);

  FirebaseService.auth.signOut().then(() => {
    window.location.href = "login.html";
  });

};