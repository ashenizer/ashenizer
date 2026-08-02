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

// ✅ Refresh ranking
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

const email =
  App.tlModal.currentAgent;

const date =
  document.getElementById(
    "modal-input-date"
  )?.value;

const qa =
  document.getElementById(
    "modal-input-qa"
  ).value;


const qaDisCount =
  document.getElementById(
    "modal-input-qa-disability-count"
  )?.value;

const qaComCount =
  document.getElementById(
    "modal-input-qa-commercial-count"
  )?.value;

const aht =
    document.getElementById(
        "modal-input-aht"
    ).value;

const att =
    document.getElementById(
        "modal-input-attendance"
    ).value;




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

// Refresh modal performance tab
App.tlModal.showPerformance();

// Switch back to Performance tab
document
  .querySelector('[data-tab="performance"]')
  ?.click();

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
  App.ui.hideChart();


  // ✅ Reset chart
App.ui.resetChart();

};



App.tl.returnToInitialTLState = function () {

  const select = document.getElementById("agent-select");

  // ✅ reset dropdown
  if (select) {
    select.value = "";
  }

  // ✅ remove selected agent
  App.ui.currentAgent = null;

  // ✅ hide EVERYTHING except main panel
  App.ui.hideChart();
  
  // ✅ reset chart safely
App.ui.resetChart();

  // ✅ clear inputs
const qaInput =
    document.getElementById("modal-input-qa");

const ahtInput =
    document.getElementById("modal-input-aht");

const attendanceInput =
    document.getElementById("modal-input-attendance");

const dateInput =
    document.getElementById("modal-input-date");

if (dateInput) dateInput.value = "";
if (qaInput) qaInput.value = "";
if (ahtInput) ahtInput.value = "";
if (attendanceInput) attendanceInput.value = "";

const disabilityInput =
  document.getElementById(
    "modal-input-qa-disability-count"
  );

const commercialInput =
  document.getElementById(
    "modal-input-qa-commercial-count"
  );

if (disabilityInput)
  disabilityInput.value = "";

if (commercialInput)
  commercialInput.value = "";
}


App.tl.handleAgentSelection = function () {

  const agentSelect =
    document.getElementById("agent-select");

  if (!agentSelect) return;

  agentSelect.addEventListener("change", () => {

    const email = agentSelect.value;



  // ✅ ✅ HARD GUARD (THIS FIXES EVERYTHING)

if (!email) {
  App.tl.resetTLView();
  return;
}


  App.ui.currentAgent = email;

  // ✅ SHOW UI ONLY AFTER SELECTION
document.getElementById("lead-view")
?.classList.add("hidden");




  const member = App.data.users[email];
const commercialCountGroup =
  document.getElementById(
    "modal-commercial-count-group"
  );

  // ✅ Show commercial input only for hybrid
  

// ✅ ALWAYS show Final QA

// ✅ Only show commercial fields for hybrid
if (!email || !member || member.qaType !== "hybrid") {

commercialCountGroup?.classList.add("hidden");


const qaComCountInput =
    document.getElementById(
        "modal-input-qa-commercial-count"
    );

if (qaComCountInput) qaComCountInput.value = "";



} else {

commercialCountGroup?.classList.remove("hidden");

}





  // ✅ SHOW CHART
App.ui.showChart();

  // ✅ UPDATE CHART
  App.ui.updatePerformanceChart(email);




  const agentName = App.data.users[email]?.name || "Selected Agent";

App.tlModal.open(
    agentName,
    email
);

return;

  });
};



