
window.App = window.App || {};
App.admin = {};

App.admin.loadPasswordRequests = async function () {

  const container = document.getElementById("password-requests");

  if (!container) return;

  const snapshot = await FirebaseService.db
    .collection("passwordRequests")
    .orderBy("createdAt", "desc")
    .get();

  container.innerHTML = snapshot.docs.map(doc => {

    const data = doc.data();

    return `
      <div class="request-card">
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>New Password:</strong> ${data.newPassword}</p>
        <p><strong>Status:</strong> ${data.status}</p>

        <button data-id="${doc.id}" class="mark-done-btn">
          ✅ Mark Done
        </button>
      </div>
    `;

  }).join("");

  // ✅ bind events
  document.querySelectorAll(".mark-done-btn").forEach(btn => {
    btn.addEventListener("click", async () => {

      const id = btn.dataset.id;

      await FirebaseService.db
        .collection("passwordRequests")
        .doc(id)
        .update({
          status: "done"
        });

      alert("✅ Marked as done");

      App.admin.loadPasswordRequests(); // refresh
    });
  });
};
