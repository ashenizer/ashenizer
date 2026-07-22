window.App = window.App || {};
App.header = {};

App.header.init = function () {

  const menuBtn = document.getElementById("menu-btn");
  const menuDropdown = document.getElementById("menu-dropdown");

  const profilePic = document.getElementById("profile-pic");

  const profileDropdown = document.getElementById("profile-dropdown");

menuBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  menuDropdown?.classList.toggle("hidden");
  profileDropdown?.classList.add("hidden");
});

// 👤 PROFILE
profilePic?.addEventListener("click", (e) => {
  e.stopPropagation();
  profileDropdown?.classList.toggle("hidden");
  menuDropdown?.classList.add("hidden");
});



// ===============================
// HEADER INTERACTIONS (Step 3)
// Prevent closing when clicking inside dropdown
// ===============================

menuDropdown?.addEventListener("click", (e) => {
  e.stopPropagation();
});

profileDropdown?.addEventListener("click", (e) => {
  e.stopPropagation();
});



// ===============================
// HEADER INTERACTIONS (Step 4)
// Close dropdown when clicking outside
// ===============================
document.addEventListener("click", () => {
  menuDropdown?.classList.add("hidden");
  profileDropdown?.classList.add("hidden");
});


};