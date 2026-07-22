window.App = window.App || {};
App.employee = App.employee || {};

App.employee.updatePersonalStats = function (email) {

  const qaEl = document.getElementById("qa");
  const ahtEl = document.getElementById("aht");
  const attendanceEl = document.getElementById("attendance");

  if (!qaEl || !ahtEl || !attendanceEl) {
    console.warn("Stats UI not ready");
    return;
  }

  const latest = App.data.statsStore[email]?.current;


  if (!latest) {
    document.getElementById("qa").textContent = "—";
    document.getElementById("aht").textContent = "—";
    document.getElementById("attendance").textContent = "—";
    return;
  }

  // ✅ QA




const member = App.data.users[email];

let qaBoxHTML = "";

// ✅ HYBRID
if (member?.qaType === "hybrid") {

  qaBoxHTML = `
    <div class="qa-sub-grid mt-10">
      <div class="sub-box">
        <p class="sub-label">Disability</p>
        <p class="sub-value">${latest?.QA_Disability_Count ?? 0}</p>
      </div>

      <div class="sub-box">
        <p class="sub-label">Commercial</p>
        <p class="sub-value">${latest?.QA_Commercial_Count ?? 0}</p>
      </div>
    </div>
  `;

} else {

  // ✅ STANDARD → SINGLE BOX
  const totalCount =
    (latest?.QA_Disability_Count ?? 0) +
    (latest?.QA_Commercial_Count ?? 0);

  qaBoxHTML = `
    <div class="qa-sub-grid mt-10">
      <div class="sub-box single">
        <p class="sub-label">Audit Count</p>
        <p class="sub-value">${totalCount}</p>
      </div>
    </div>
  `;
}

console.log("qa:", document.getElementById("qa"));
console.log("aht:", document.getElementById("aht"));
console.log("attendance:", document.getElementById("attendance"));

qaEl.innerHTML =
  (latest.QA != null ? latest.QA + "%" : "—") +
  `<br><small>Target: ${App.data.targets.QA}%</small>` +
  " " +
  getStatusBadge("QA", latest.QA) +
  qaBoxHTML;



  // ✅ AHT
  ahtEl.innerHTML =
    (latest.AHT != null ? latest.AHT + "s" : "—") +
    `<br><small>QPB: ${App.data.targets.AHT.QPB}s | HCPO: ${App.data.targets.AHT.HCPO}s</small>` +
    " " +
    getStatusBadge("AHT", latest.AHT);


  // ✅ Attendance
  attendanceEl.innerHTML =
    (latest.Attendance != null
      ? parseFloat(latest.Attendance).toFixed(2) + "%"
      : "—") +
    `<br><small>Target: ${App.data.targets.Attendance}%</small>` +
    " " +
    getStatusBadge("Attendance", latest.Attendance);
};

App.employee.renderEmployeeHistory = function (email) {
  const body = document.getElementById("employee-history-body");
  const section = document.getElementById("employee-history");

  if (!body || !section) return;

  
const history = [...(App.data.statsStore[email]?.history || [])]
  .sort((a, b) => new Date(a.date) - new Date(b.date));


  if (history.length === 0) {
    section.classList.add("hidden");
    return;
  }

  body.innerHTML = history
    .map(
      (e, index) => `
        <tr>
          <td>${e.date}</td>

<td>${e.QA ?? "—"}</td>
<td>${e.AHT ?? "—"}</td>
<td>${e.Attendance ?? "—"}</td>

        </tr>`
    )
    .join("");

  section.classList.remove("hidden");
};

App.employee.loadTLNote = async function () {

  const email = App.currentUserEmail;

  if (!email) return;

  try {

    const doc = await FirebaseService.db
      .collection("employeeNotes")
      .doc(email)
      .get();

    const card =
      document.getElementById("employee-note-card");

    const display =
      document.getElementById("employee-note-display");

    if (!card || !display) return;

    if (!doc.exists) {

      display.textContent =
        "No notes available.";

      card.classList.remove("hidden");
      return;
    }

    display.textContent =
      doc.data()?.note || "No notes available.";

    card.classList.remove("hidden");

  } catch (error) {

    console.error(
      "Failed to load Team Lead note:",
      error
    );

  }

};

