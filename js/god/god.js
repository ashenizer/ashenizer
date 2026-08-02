document.addEventListener("DOMContentLoaded", () => {

  FirebaseService.auth.onAuthStateChanged(async (user) => {

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const doc = await FirebaseService.db
      .collection("users")
      .doc(user.email)
      .get();

    const data = doc.data();

    if (data.role !== "god") {
      window.location.href = "ui.html";
      return;
    }

    loadRequests();
  });

 const logoutBtn = document.getElementById("god-logout");

console.log("Logout button:", logoutBtn);

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {

    console.log("Logout clicked");

    await FirebaseService.auth.signOut();

    console.log("✅ Logged out");

    window.location.href = "login.html";

  });
}


  });


async function loadRequests() {

  const container = document.getElementById("god-requests");

  const snapshot = await FirebaseService.db
    .collection("passwordRequests")
    .orderBy("createdAt", "desc")
    .get();

const countBadge =
  document.getElementById("request-count");

if (countBadge) {
  countBadge.textContent = snapshot.size;
}

const coreRequests =
  document.getElementById("core-requests");

if (coreRequests) {
  coreRequests.textContent = snapshot.size;
}

  container.innerHTML = snapshot.docs.map(doc => {

    const data = doc.data();

return `
  <div class="request-card">

    <div class="request-title">
      🔐 PASSWORD REQUEST
    </div>

    <div class="request-row">
      <span>Email</span>
      <strong>${data.email}</strong>
    </div>

    <div class="request-row">
      <span>Requested Password</span>
      <strong>${data.newPassword || "N/A"}</strong>
    </div>

    <div class="request-row">
      <span>Status</span>
      <strong class="status-${data.status}">
        ${data.status}
      </strong>
    </div>

    <button
      class="approve-btn"
      onclick="approve('${doc.id}')"
    >
      ✔ APPROVE
    </button>

  </div>
`;

  }).join("");
}


window.approve = async function(id) {

  await FirebaseService.db
    .collection("passwordRequests")
    .doc(id)
    .update({

      status: "done",

      approved: true,

      acknowledged: false,

      approvedAt:
        firebase.firestore.FieldValue.serverTimestamp()

    });

  alert("✅ Password Request Approved");

  loadRequests();
};

