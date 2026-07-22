
window.App = window.App || {};
App.forgot = {};

App.forgot.showPopup = function (message) {

  const popup =
    document.getElementById("error-popup");

  const popupMessage =
    document.getElementById("popup-message");

  if (!popup || !popupMessage) return;

  popupMessage.textContent = message;

  popup.classList.remove("hidden");
  popup.classList.add("show");

  setTimeout(() => {

    popup.classList.remove("show");
    popup.classList.add("hidden");

  }, 3000);
};

App.forgot.clearForm = function () {

  document.getElementById("fp-email").value = "";
  document.getElementById("fp-new-password").value = "";
  document.getElementById("fp-reason").value = "";

};




App.forgot.submitRequest = async function () {

  const email = document.getElementById("fp-email").value.trim();
const reason =
  document.getElementById("fp-reason")
  .value
  .trim();

const newPassword =
  document.getElementById("fp-new-password")
  .value
  .trim();


if (!email || !newPassword || !reason) {

  App.forgot.showPopup(
    "Please complete all fields ❌"
  );

  return;
}


  try {

    // ✅ SAVE RESET REQUEST TO FIRESTORE
await FirebaseService.db
.collection("passwordRequests")
.add({
  email,
  reason,
  status: "pending",
  createdAt: new Date()
});

App.forgot.showPopup(
  "✅ Request sent! Contact admin."
);

App.forgot.clearForm();

modal.classList.add("hidden");
    
  } catch (error) {

  App.forgot.showPopup(
    error.message || "Something went wrong ❌"
  );

}
};


const openBtn = document.getElementById("forgot-password");
const modal = document.getElementById("forgot-modal");

openBtn?.addEventListener("click", (e) => {

  e.preventDefault();

  modal.classList.remove("hidden");

  document.getElementById("fp-email")?.focus();

});

document.getElementById("fp-close")?.addEventListener("click", () => {

  App.forgot.clearForm();

  modal.classList.add("hidden");

});

document.getElementById("fp-submit")?.addEventListener("click", () => {
  App.forgot.submitRequest();
});

