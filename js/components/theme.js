
window.App = window.App || {};
App.theme = {};

// ✅ APPLY THEME
App.theme.apply = function () {
  const isDark = localStorage.getItem("theme") === "dark";
  document.body.classList.toggle("dark", isDark);
};

// ✅ UPDATE LABEL (LOGIN + PROFILE)
App.theme.updateLabel = function () {
  const isDark = localStorage.getItem("theme") === "dark";

  const loginLabel = document.getElementById("theme-label");
  const profileLabel = document.getElementById("profile-theme-label");

  const text = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

  if (loginLabel) loginLabel.textContent = text;
  if (profileLabel) profileLabel.textContent = text;
};

// ✅ SETUP (THIS WAS BROKEN BEFORE)
App.theme.setup = function () {
  const toggle = document.getElementById("theme-toggle");

  if (!toggle) return;

  // ✅ sync toggle state
  const isDark = localStorage.getItem("theme") === "dark";
  toggle.checked = isDark;

  // ✅ apply theme
  App.theme.apply();
  App.theme.updateLabel();

  // ✅ handle toggle change
  toggle.addEventListener("change", () => {
    const isDark = toggle.checked;

    localStorage.setItem("theme", isDark ? "dark" : "light");

    App.theme.apply();

    // sync other toggles (profile)
    App.theme.syncToggles();

    App.theme.updateLabel();
  });
};

// ✅ RUN ON EVERY PAGE
document.addEventListener("DOMContentLoaded", App.theme.setup);


App.theme.syncToggles = function () {
  const isDark = localStorage.getItem("theme") === "dark";

  const loginToggle = document.getElementById("theme-toggle");
  const profileToggle = document.getElementById("profile-theme-toggle");

  if (loginToggle) loginToggle.checked = isDark;
  if (profileToggle) profileToggle.checked = isDark;
};

App.theme.setupProfileToggle = function () {
  const profileToggle =
    document.getElementById("profile-theme-toggle");

  if (!profileToggle) return;

  const savedTheme =
    localStorage.getItem("theme") || "light";

  profileToggle.checked =
    savedTheme === "dark";

  profileToggle.addEventListener("change", () => {

    const isDark = profileToggle.checked;

    localStorage.setItem(
      "theme",
      isDark ? "dark" : "light"
    );

    App.theme.apply();
    App.theme.syncToggles();
    App.theme.updateLabel();
  });
};