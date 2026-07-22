window.App = window.App || {};
App.leave = {};

App.leave.leaveRequests = {};

App.leave.requestedLeaves = {};

App.leave.currentLeaveDate = null;

App.leave.init = function () {

  document.getElementById("close-leave")?.addEventListener("click", () => {
    document.getElementById("leave-modal").classList.add("hidden");
  });

  document.getElementById("leave-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "leave-modal") {
      e.currentTarget.classList.add("hidden");
    }
  });

document.getElementById("save-leave")?.addEventListener("click", async () => {
  const name = document.getElementById("leave-employee").value;
  const status = document.getElementById("leave-status").value;
  const date = App.leave.currentLeaveDate;

  try {

const requested = await FirebaseService.db
  .collection("vacationRequests")
  .where("employeeName", "==", name)
  .where("status", "==", "Requested")
  .get();

let requestUpdated = false;

for (const doc of requested.docs) {

  const data = doc.data();

  if (
    data.dates &&
    data.dates.includes(date)
  ) {

    await FirebaseService.db
      .collection("vacationRequests")
      .doc(doc.id)
      .update({
        status
      });

    requestUpdated = true;

    break;
  }
}


    const existing = await FirebaseService.db
      .collection("leaveRequests")
      .where("date", "==", date)
      .where("name", "==", name)
      .get();

if (requestUpdated) {

  const existingLeave =
    await FirebaseService.db
      .collection("leaveRequests")
      .where("date", "==", date)
      .where("name", "==", name)
      .get();

  if (!existingLeave.empty) {

    await FirebaseService.db
      .collection("leaveRequests")
      .doc(existingLeave.docs[0].id)
      .update({
        status
      });

  } else {

    await FirebaseService.db
      .collection("leaveRequests")
      .add({
        date,
        name,
        status
      });

  }

  console.log(
    "✅ Request converted:",
    name,
    date
  );

}
else if (!existing.empty) {

      const docId = existing.docs[0].id;

      await FirebaseService.db
        .collection("leaveRequests")
        .doc(docId)
        .update({ status });

    } else {
      await FirebaseService.db
        .collection("leaveRequests")
        .add({ date, name, status });
    }

document.getElementById("leave-modal").classList.add("hidden");

await App.leave.loadLeaveRequests();

await App.leave.loadRequestedLeaves();

  } catch (error) {
    console.error("❌ Error saving leave:", error);
  }
});


};

App.leave.openLeaveModal = function(dateKey) {

  App.leave.currentLeaveDate = dateKey;

  const modal = document.getElementById("leave-modal");
  modal.classList.remove("hidden");

  const label = document.getElementById("selected-date-label");

  if (label) {
    label.textContent = "📅 " + dateKey;
  }

  const select = document.getElementById("leave-employee");

  select.innerHTML = Object.values(App.data.users)
    .filter(u => u.role === "employee")
    .map(u => `<option value="${u.name}">${u.name}</option>`)
    .join("");
};

App.leave.initLeaveCalendar = function () {
  const dropdown = document.getElementById("calendar-month");
  if (!dropdown) return;

  const now = new Date();
  // ✅ Create local dynamic YYYY-MM fallback string
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  dropdown.innerHTML = "";

  // ✅ Build out local, stable month indexes safely
  for (let i = 0; i < 12; i++) {
    const value = `${now.getFullYear()}-${String(i + 1).padStart(2, '0')}`;
    const displayDate = new Date(now.getFullYear(), i, 1);
    const label = displayDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    dropdown.innerHTML += `<option value="${value}">${label}</option>`;
  }

  // ✅ Set stable current local month default
  dropdown.value = currentMonth;

  // ✅ Attach listener safely
  dropdown.onchange = App.leave.renderCalendar;

// ✅ Initial loads
App.leave.renderCalendar();

App.leave.loadLeaveRequests();

App.leave.loadRequestedLeaves();

};

App.leave.renderCalendar = function () {
  const grid = document.getElementById("calendar-grid");
  if (!grid) return;

  const dropdown = document.getElementById("calendar-month");
  const isTL = App.currentUser?.role === "teamlead";

  const [yearStr, monthStr] = dropdown.value.split("-");
  const year = parseInt(yearStr);
  
  // ✅ Fix: Use standard 0-11 index directly from your formatted value string
  const month = parseInt(monthStr) - 1; 

  grid.innerHTML = "";

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // ✅ Clean local weekday indexing anchor (0 = Sunday, 1 = Monday...)
  const firstDay = new Date(year, month, 1).getDay();

  // ✅ Render invisible padding blocks for empty days
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    grid.appendChild(empty);
  }

  // ✅ Render actual day cells
  for (let i = 1; i <= daysInMonth; i++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;

    const cell = document.createElement("div");
    cell.className = "calendar-day";

if (
  App.vacationRequests?.selectedDates?.includes(dateKey)
) {
  cell.classList.add("vacation-selected");
}

    if (!isTL) {
      cell.classList.add("readonly");
    }

    cell.innerHTML = `<strong>${i}</strong>`;

    const entries = App.leave.leaveRequests[dateKey] || [];

const requestedEntries =
  App.leave.requestedLeaves[dateKey] || [];

if (requestedEntries.length) {

  console.log(
    "📅 Requested found:",
    dateKey,
    requestedEntries
  );

}

    entries.forEach(e => {
      const tag = document.createElement("div");
      
// ✅ Fix display text (Rejected → Denied)
  const displayStatus =
    e.status === "Rejected" ? "Denied" : e.status;

  // ✅ Fix CSS class (Rejected → denied)
  const statusClass =
    e.status === "Rejected"
      ? "denied"
      : e.status.toLowerCase();

  // ✅ Apply class
  tag.className = `calendar-entry ${statusClass}`;

  // ✅ Apply text
 
tag.textContent = `${e.name} (${displayStatus})`;
tag.style.position = "relative";

// ✅ ADD DELETE BUTTON (TEAM LEAD ONLY)
if (isTL) {
  const deleteBtn = document.createElement("span");
  deleteBtn.textContent = " ❌";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.style.marginLeft = "6px";
  deleteBtn.style.fontSize = "12px";

  deleteBtn.addEventListener("click", async (event) => {
    event.stopPropagation(); // ✅ prevent opening modal

    if (!confirm(`Remove ${e.name}?`)) return;

    try {
      const snapshot = await FirebaseService.db
        .collection("leaveRequests")
        .where("date", "==", dateKey)
        .where("name", "==", e.name)
        .get();

      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id;

        await FirebaseService.db
          .collection("leaveRequests")
          .doc(docId)
          .delete();

        console.log("✅ Leave removed:", e.name);

        // ✅ reload calendar
        await App.leave.loadLeaveRequests();
      }

    } catch (error) {
      console.error("❌ Delete failed:", error);
    }
  });

  tag.appendChild(deleteBtn);
}


  cell.appendChild(tag);

    });

requestedEntries.forEach(e => {

  const isTL =
    App.currentUser?.role === "teamlead";

  const isOwner =
    e.name === App.currentUser?.name;

  if (!isTL && !isOwner) {
    return;
  }

  const tag = document.createElement("div");

  tag.className = "calendar-entry requested";

  tag.textContent =
  `${e.name} (${e.status})`;

  cell.appendChild(tag);

});


if (isTL) {

  cell.addEventListener("click", () => {

    App.leave.openLeaveModal(dateKey);

  });

}
else {

    cell.addEventListener("click", () => {

        App.vacationRequests
            .openRequestModal(dateKey);

    });

}


    grid.appendChild(cell);
  }
};


App.leave.loadLeaveRequests = async function () {

  const snapshot = await FirebaseService.db
    .collection("leaveRequests")
    .get();

  App.leave.leaveRequests = {}; // reset

  snapshot.forEach(doc => {
    const data = doc.data();

if (!App.leave.leaveRequests[data.date]) {

  App.leave.leaveRequests[data.date] = [];
}

    App.leave.leaveRequests[data.date].push({

      name: data.name,
      status: data.status
    });
  });

  console.log("✅ Loaded leave data:", App.leave.leaveRequests);

console.log(
  "✅ Requested Leaves:",
  App.leave.requestedLeaves
);

console.log(
  "Requested count:",
  Object.keys(App.leave.requestedLeaves).length
);

App.leave.renderCalendar();


  App.leave.renderCalendar();
};


