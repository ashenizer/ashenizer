window.App = window.App || {};
App.tl = App.tl || {};



App.tl.populateAgentDropdown = async function () {
  const select = document.getElementById("agent-select");
  if (!select) return;

  select.innerHTML = `<option value="">-- Select Agent --</option>`;

  const role = App.currentUser?.role;
  const team = App.currentUser?.team;

  // ✅ EMPLOYEE → only themselves
  if (role === "employee") {
    const opt = document.createElement("option");
    opt.value = App.currentUserEmail;
    opt.textContent = App.currentUser.name;

    select.appendChild(opt);
    select.value = App.currentUserEmail;
    select.disabled = true;

    return;
  }

  // ✅ TEAM LEAD → get from Firestore
  const members = await App.data.getTeamMembers(team);

  console.log("✅ TEAM:", team);
  console.log("✅ MEMBERS FROM FIRESTORE:", members);

  members.forEach(member => {
    if (member.role === "employee") {

      const opt = document.createElement("option");
      opt.value = member.email;
      opt.textContent = member.name;

      select.appendChild(opt);
    }
  });
};


App.tl.renderHistory = function (email) {


  const body = document.getElementById("history-body");

if (!body) return;
  

const history = [...(App.data.statsStore[email]?.history || [])]
  .sort((a, b) => new Date(a.date) - new Date(b.date));



  
body.innerHTML = history
.map(
  (e) => `
      <tr>
        <td>${e.date}</td>
        

<td>
  <strong>${e.QA ?? "—"}%</strong><br>
  <small>
    Dis: ${e.QA_Disability_Count ?? 0} |
    Com: ${e.QA_Commercial_Count ?? 0}
  </small>
</td>


        <td>${e.AHT}</td>
        
<td>
  ${e.Attendance != null
    ? parseFloat(e.Attendance).toFixed(2) + "%"
    : "—"}
</td>

        <td>
          <button class="delete-btn" data-email="${email}" data-id="${e.id}">
  		❌
	  </button>
        </td>
      </tr>`
  )
  .join("");


// ✅ ✅ ADD THIS RIGHT HERE ✅ ✅
document.querySelectorAll(".delete-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const email = btn.dataset.email;
    const id = btn.dataset.id;

    App.tl.deleteEntry(email, id);
  });
});


  // ✅ SHOW or HIDE history section properly
document
  .getElementById("agent-history")
  ?.classList.toggle("hidden", history.length === 0);
};


App.tl.deleteEntry = async function(email, id) {
  if (!confirm("Delete this entry?")) return;

const history =
  App.data.statsStore[email]?.history || [];

const entry =
  history.find(x => x.id === id);



  if (!entry) {
    alert("Entry not found");
    return;
  }
  try {
    // ✅ DELETE FROM FIRESTORE
    await FirebaseService.db
      .collection("stats")
      .doc(email)
      .collection("history")
      .doc(entry.id)
      .delete();

    console.log("✅ Deleted from Firestore:", entry.id);

    // ✅ DELETE LOCAL
App.data.statsStore[email].history =
  history.filter(x => x.id !== id);

const updatedHistory = App.data.statsStore[email].history;

const latest = [...updatedHistory]
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .at(-1);

App.data.statsStore[email].current = latest || {};

    // ✅ Refresh UI
    App.tl.renderHistory(email);
    App.ranking.updateRanking();

} catch (error) {
  console.error("❌ Delete failed:", error);
  alert("Delete failed ❌\n\n" + error.message);
}
};

App.tl.registerEmployee = async function () {

  const name = document.getElementById("new-name").value.trim();
  const email = document.getElementById("new-email").value.trim();
  const password = document.getElementById("new-password").value.trim();

  if (!name || !email || !password) {
    alert("Missing fields");
    return;
  }

  try {

    const currentUser = FirebaseService.auth.currentUser;
    const tlEmail = currentUser.email;

    const tlPassword = prompt("Enter your TL password:");

    // ✅ Create employee (this logs you in as them)
    await FirebaseService.auth.createUserWithEmailAndPassword(email, password);

    // ✅ Save in Firestore
    await FirebaseService.db.collection("users").doc(email).set({
      name: name,
      role: "employee",
      team: App.currentUser.team
    });

    // ✅ FORCE logout of employee session
    await FirebaseService.auth.signOut();

    // ✅ Small delay (IMPORTANT)
    await new Promise(resolve => setTimeout(resolve, 300));

    // ✅ Log back in as TL CLEANLY
    await FirebaseService.auth.signInWithEmailAndPassword(tlEmail, tlPassword);

    

    alert("✅ Employee registered!");

  } catch (error) {
    alert(error.message);
  }

};

App.tl.saveEmployeeNote = async function () {

  const email =
    document.getElementById("agent-select")?.value;

  const note =
    document.getElementById("employee-note")?.value.trim();

  if (!email) {
    alert("Select an agent first");
    return;
  }

  try {

    await FirebaseService.db
      .collection("employeeNotes")
      .doc(email)
      .set({
        note,
        updatedAt: new Date().toISOString()
      });

    alert("✅ Note saved");

  } catch (error) {

    console.error("Note save error:", error);

    alert("Failed to save note ❌");
  }
};

window.App.tl.loadTeamPerformance = async function () {

  try {

    console.log("📊 Fetching Team Stats...");

    if (!FirebaseService?.db) return;

const team = App.currentUser?.team;

const members = await App.data.getTeamMembers(team);

const teamEmails = members.map(m => m.email);

    const qaCard = document.getElementById("team-qa-card");
    const ahtCard = document.getElementById("team-aht-card");
    const attCard = document.getElementById("team-attendance-card");

    let totalQA = 0;
    let totalAHT = 0;
    let totalAttendance = 0;

    let qaCount = 0;
    let ahtCount = 0;
    let attendanceCount = 0;

    const statsSnapshot =
      await FirebaseService.db.collection("stats").get();

    const promises = statsSnapshot.docs
  .filter(userDoc => teamEmails.includes(userDoc.id))
  .map(async (userDoc) => {

      const historySnapshot =
        await userDoc.ref.collection("history").get();

      historySnapshot.forEach(entryDoc => {

        const data = entryDoc.data();

        if (data?.QA != null) {
          totalQA += parseFloat(data.QA);
          qaCount++;
        }

        if (data?.AHT != null) {
          totalAHT += parseFloat(data.AHT);
          ahtCount++;
        }

        if (data?.Attendance != null) {
          totalAttendance += parseFloat(data.Attendance);
          attendanceCount++;
        }

      });

    });

    await Promise.all(promises);

    const avgQA =
      qaCount ? (totalQA / qaCount).toFixed(2) : "--";

    const avgAHT =
      ahtCount ? Math.round(totalAHT / ahtCount) : "--";

    const avgAttendance =
      attendanceCount ? (totalAttendance / attendanceCount).toFixed(2) : "--";

    if (qaCard) {
      qaCard.innerHTML =
        `<div>TEAM QA</div><div>${avgQA}%</div>`;
    }

    if (ahtCard) {
      ahtCard.innerHTML =
        `<div>TEAM AHT</div><div>${avgAHT}s</div>`;
    }

    if (attCard) {
      attCard.innerHTML =
        `<div>TEAM ATTENDANCE</div><div>${avgAttendance}%</div>`;
    }

  } catch (error) {

    console.error("❌ Team stats error:", error);

  }

};

App.tl.saveEmployeeStats = async function () {

if (App.currentUser?.role !== "teamlead") {
  alert("You are not allowed to edit stats");
  return;
}


  const email = document.getElementById("agent-select").value;


const qa = document.getElementById("input-qa").value;


const qaDisCount = document.getElementById("input-qa-disability-count").value;

const qaComCount = document.getElementById("input-qa-commercial-count").value;

const member = App.data.users[email];

const aht = document.getElementById("input-aht").value;
const att = document.getElementById("input-attendance").value;


  const date = document.getElementById("input-date").value;

console.log("DATE PICKER:", date);

if (qa && !isValidPercent(qa)) {
  alert("QA must be a valid number");
  return;
}


if (aht && !isValidSeconds(aht)) {
  alert("AHT must be a number (e.g. 320)");
  return;
}

if (att && !isValidPercent(att)) {
  alert("Attendance must be a number (e.g. 99)");
  return;
}


if (!email) {
  alert("Select an agent");
  return;
}

if (!date) {
  alert("Select a date");
  return;
}

  if (!App.data.statsStore[email]) {
    App.data.statsStore[email] = { history: [], current: {} };
  }

// ✅ keep this for carry-over
const prevEntry = { ...(App.data.statsStore[email]?.current || {}) };

console.log("PREV ENTRY:", prevEntry);

delete prevEntry.id;
delete prevEntry.date;




// ✅ Start with previous values
let entry = {
  ...prevEntry,
  date
};

console.log("ENTRY BEFORE SAVE:", entry);

// ✅ REQUIRE FINAL QA


// ✅ FINAL QA ONLY
if (qa) {
  entry.QA = parseFloat(qa);
}


// ✅ COUNTS (keep these)
if (qaDisCount) {
  entry.QA_Disability_Count = parseInt(qaDisCount, 10);
}

if (qaComCount) {
  entry.QA_Commercial_Count = parseInt(qaComCount, 10);
}

// ✅ AHT
if (aht !== "") {
  entry.AHT = parseInt(aht, 10);
}

// ✅ Attendance
if (att !== "") {
  entry.Attendance = parseFloat(att);
}

try {
  // ✅ Ensure parent doc exists
  await FirebaseService.db
    .collection("stats")
    .doc(email)
    .set({ exists: true }, { merge: true });

  // ✅ Then add history
  
const docRef = await FirebaseService.db
  .collection("stats")
  .doc(email)
  .collection("history")
  .add(entry);

// ✅ store the ID
entry.id = docRef.id;


  console.log("✅ Saved to Firestore:", entry);

  // ✅ ALSO update local store
  
App.data.statsStore[email].history.push(entry);

// ✅ ALSO store current separately
App.data.statsStore[email].current = entry;


} catch (error) {
  console.error("❌ FIRESTORE SAVE ERROR:", error);

  alert("Failed to save stats ❌");

  return;
}


  // ✅ Update selected agent stats UI
  

let latest = App.data.statsStore[email]?.current;

if (!latest || Object.keys(latest).length === 0) {
  const history = App.data.statsStore[email]?.history || [];

  latest = [...history]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .at(-1);
}


// 👇 keep this only for arrow comparison
const historyList = [...(App.data.statsStore[email]?.history || [])]
  .sort((a, b) => new Date(a.date) - new Date(b.date));

const previousTrend = historyList[historyList.length - 2];


// ✅ Monthly average (use selected date already in your code)

let selectedDate = document.getElementById("input-date").value;

// ✅ fallback if empty
if (!selectedDate) {
  selectedDate = new Date().toISOString().split("T")[0];
}

// ✅ Apply WITH colored arrows


document.getElementById("selected-qa").innerHTML =
  (latest?.QA != null ? latest.QA + "%" : "—") +
  `<br><small>Target: ${App.data.targets.QA}%</small>` +
  " " +
  getStatusBadge("QA", latest?.QA);


// ✅ SUB BOX DISPLAY

const subBox = document.getElementById("qa-sub-boxes");

if (!latest) {
  subBox?.classList.add("hidden");
} else if (member?.qaType === "hybrid") {

  subBox?.classList.remove("hidden");

  document.getElementById("selected-qa-dis").textContent =
    "Count: " + (latest.QA_Disability_Count ?? 0);

  document.getElementById("selected-qa-com").textContent =
    "Count: " + (latest.QA_Commercial_Count ?? 0);

} else {

  // ✅ STANDARD AGENT FIX
  subBox?.classList.remove("hidden");

  const total =
    (latest.QA_Disability_Count ?? 0) +
    (latest.QA_Commercial_Count ?? 0);

  document.getElementById("selected-qa-dis").textContent =
    "Audit Count: " + total;

  document.getElementById("selected-qa-com").textContent = ""; // clean
}


document.getElementById("selected-aht").innerHTML =
  (latest?.AHT != null ? latest.AHT + "s" : "—") +
  " " +
  getStatusBadge("AHT", latest?.AHT) +
  getTrendArrow(latest?.AHT, previousTrend?.AHT, "AHT");


document.getElementById("selected-attendance").innerHTML =
  
(latest?.Attendance != null
  ? parseFloat(latest.Attendance).toFixed(2) + "%"
  : "—")
 +
  " " +
  getStatusBadge("Attendance", latest?.Attendance) +
  getTrendArrow(latest?.Attendance, previousTrend?.Attendance, "Attendance");


  document.getElementById("selected-agent-stats").classList.remove("hidden");

  // ✅ Update history table
  App.tl.renderHistory(email);

  // ✅ Update team stats
  const teamStats = App.data.calculateTeamStats();
  

if (teamStats) {
  const qaEl = document.getElementById("team-qa");
  const ahtEl = document.getElementById("team-aht");
  const attEl = document.getElementById("team-attendance");

  if (qaEl) qaEl.textContent = teamStats.qa;
  if (ahtEl) ahtEl.textContent = teamStats.aht;
  if (attEl) attEl.textContent = teamStats.attendance;
}


alert("Stats saved ✅");

App.tl.returnToInitialTLState();

return;




};


App.tl.resetTLView = function () {

  const select = document.getElementById("agent-select");

  if (select) {
    select.value = ""; // ✅ just clear dropdown
  }


  // ✅ ✅ ADD THIS (MAIN FIX)
  document.querySelector(".tl-input-panel")?.classList.add("hidden");


  // ✅ Hide EVERYTHING
  document.getElementById("lead-view")?.classList.add("hidden");
  document.getElementById("selected-agent-stats")?.classList.add("hidden");
  App.ui.hideChart();
  document.getElementById("tl-input-fields")?.classList.add("hidden");
  document.getElementById("agent-history")?.classList.add("hidden");

  // ✅ Reset title
  const title = document.getElementById("selected-agent-title");
  if (title) {
    title.textContent = "Selected Agent Performance";
  }

  // ✅ Clear stat values
document.getElementById("selected-qa")?.replaceChildren();
document.getElementById("selected-aht")?.replaceChildren();
document.getElementById("selected-attendance")?.replaceChildren();

  // ✅ Hide QA sub boxes
  document.getElementById("qa-sub-boxes")?.classList.add("hidden");

  // ✅ Reset chart
App.ui.resetChart();


}


App.tl.returnToInitialTLState = function () {

  const select = document.getElementById("agent-select");

  // ✅ reset dropdown
  if (select) {
    select.value = "";
  }

  // ✅ remove selected agent
  App.ui.currentAgent = null;

  // ✅ hide EVERYTHING except main panel
  document.getElementById("lead-view")?.classList.add("hidden");
  document.getElementById("selected-agent-stats")?.classList.add("hidden");
  App.ui.hideChart();
  document.getElementById("tl-input-fields")?.classList.add("hidden");
  document.getElementById("agent-history")?.classList.add("hidden");

  // ✅ reset title
  const title = document.getElementById("selected-agent-title");
  if (title) {
    title.textContent = "Selected Agent Performance";
  }

  // ✅ clear displayed values
const qa = document.getElementById("selected-qa");
if (qa) qa.innerHTML = "";

const aht = document.getElementById("selected-aht");
if (aht) aht.innerHTML = "";

const att = document.getElementById("selected-attendance");
if (att) att.innerHTML = "";


  document.getElementById("qa-sub-boxes")?.classList.add("hidden");

  // ✅ reset chart safely
App.ui.resetChart();

  // ✅ clear inputs
const qaInput = document.getElementById("input-qa");
if (qaInput) qaInput.value = "";

const ahtInput = document.getElementById("input-aht");
if (ahtInput) ahtInput.value = "";

const attendanceInput = document.getElementById("input-attendance");
if (attendanceInput) attendanceInput.value = "";

const disabilityInput = document.getElementById("input-qa-disability-count");
if (disabilityInput) disabilityInput.value = "";
}

document.addEventListener("DOMContentLoaded", () => {

  const saveNoteBtn =
    document.getElementById("save-note-btn");

  if (saveNoteBtn) {
    saveNoteBtn.addEventListener(
      "click",
      App.tl.saveEmployeeNote
    );
  }

});


App.tl.loadEmployeeNote = async function (email) {

  const textarea =
    document.getElementById("employee-note");

  if (!textarea) return;

  try {

    const doc = await FirebaseService.db
      .collection("employeeNotes")
      .doc(email)
      .get();

    if (!doc.exists) {
      textarea.value = "";
      return;
    }

    textarea.value =
      doc.data()?.note || "";

  } catch (error) {

    console.error(
      "Failed to load note:",
      error
    );

  }
};

App.tl.handleAgentSelection = function () {

  const agentSelect =
    document.getElementById("agent-select");

  const saveBtn =
    document.getElementById("save-stats-btn");

  if (!agentSelect || !saveBtn) return;

  agentSelect.addEventListener("change", () => {

    const email = agentSelect.value;



  // ✅ ✅ HARD GUARD (THIS FIXES EVERYTHING)

if (!email) {
  App.tl.resetTLView();
  return;
}


document.getElementById("tl-input-fields")?.classList.remove("hidden");


  App.ui.currentAgent = email;

  // ✅ SHOW UI ONLY AFTER SELECTION
  document.getElementById("lead-view")?.classList.remove("hidden");
  
  document.getElementById("selected-agent-stats")?.classList.remove("hidden");


  const member = App.data.users[email];
const finalQaGroup = document.getElementById("final-qa-group");
  const commercialGroup = document.getElementById("commercial-qa-group");
const commercialCountGroup = document.getElementById("commercial-count-group");

  // ✅ Show commercial input only for hybrid
  

// ✅ ALWAYS show Final QA
finalQaGroup?.classList.remove("hidden");

// ✅ Only show commercial fields for hybrid
if (!email || !member || member.qaType !== "hybrid") {

  commercialGroup?.classList.add("hidden");
  commercialCountGroup?.classList.add("hidden");


const qaComCountInput = document.getElementById("input-qa-commercial-count");

if (qaComCountInput) qaComCountInput.value = "";



} else {

  commercialGroup?.classList.remove("hidden");
  commercialCountGroup?.classList.remove("hidden");

}


  saveBtn.disabled = email === "";

  const selectedSection = document.getElementById("selected-agent-stats");

  if (!email) {
    selectedSection?.classList.add("hidden");
    document.getElementById("agent-history")?.classList.add("hidden");
    document.getElementById("selected-agent-title").textContent =
      "Selected Agent Performance";
    return;
  }

  // ✅ SHOW CHART
App.ui.showChart();

  // ✅ UPDATE CHART
  App.ui.updatePerformanceChart(email);

  const month =
    document.getElementById("input-date")?.value.slice(0, 7) ||
    new Date().toISOString().slice(0, 7);

  const agentName = App.data.users[email]?.name || "Selected Agent";

  document.getElementById("selected-agent-title").textContent =
    `${agentName}'s Performance`;

App.ui.updateChartTitle(agentName);


  
const latest = App.data.statsStore[email].current;


document.getElementById("selected-qa").innerHTML =
  (latest?.QA != null ? latest.QA + "%" : "—") +
  " " +
  getStatusBadge("QA", latest?.QA);



// ✅ SUB BOX DISPLAY
const subBox = document.getElementById("qa-sub-boxes");

if (member?.qaType === "hybrid") {

  subBox?.classList.remove("hidden");


document.getElementById("selected-qa-dis").textContent =
  "Count: " + (latest?.QA_Disability_Count ?? 0);

document.getElementById("selected-qa-com").textContent =
  "Count: " + (latest?.QA_Commercial_Count ?? 0);


} else {

  subBox?.classList.add("hidden");
}


document.getElementById("selected-aht").innerHTML =
  (latest?.AHT != null ? latest.AHT + "s" : "—") +
  `<br><small>QPB: ${App.data.targets.AHT.QPB}s | HCPO: ${App.data.targets.AHT.HCPO}s</small>` +
  " " +
  getStatusBadge("AHT", latest?.AHT);

document.getElementById("selected-attendance").innerHTML =
  (latest?.Attendance != null
    ? parseFloat(latest.Attendance).toFixed(2) + "%"
    : "—") +
  `<br><small>Target: ${App.data.targets.Attendance}%</small>` +
  " " +
  getStatusBadge("Attendance", latest?.Attendance);



  selectedSection.classList.remove("hidden");

  App.tl.renderHistory(email);
App.tl.loadEmployeeNote(email);
});

};



