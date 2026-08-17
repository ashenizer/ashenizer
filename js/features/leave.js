window.App = window.App || {};
App.leave = {};

App.leave.leaveRequests = {};

App.leave.requestedLeaves = {};

App.leave.currentLeaveDate = null;

App.leave.init = function () {

const requestsTab =
    document.getElementById("leave-requests-tab");

const addTab =
    document.getElementById("leave-add-tab");

const requestsPanel =
    document.getElementById("leave-requests-panel");

const addPanel =
    document.getElementById("leave-add-panel");

requestsTab?.addEventListener("click", () => {

    requestsTab.classList.add("active");
    addTab.classList.remove("active");

    requestsPanel.classList.remove("hidden");
    addPanel.classList.add("hidden");

});

addTab?.addEventListener("click", () => {

    addTab.classList.add("active");
    requestsTab.classList.remove("active");

    addPanel.classList.remove("hidden");
    requestsPanel.classList.add("hidden");

});

  document.getElementById("close-leave")?.addEventListener("click", () => {
    document.getElementById("leave-modal").classList.add("hidden");
  });

  document.getElementById("leave-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "leave-modal") {
      e.currentTarget.classList.add("hidden");
    }
  });

document.getElementById("save-leave")?.addEventListener("click", async () => {

const requestsPanelVisible =
    !document
        .getElementById("leave-requests-panel")
        .classList.contains("hidden");

if (requestsPanelVisible) {

    const dropdowns =
        document.querySelectorAll(
            ".pending-request-status"
        );

    for (const dropdown of dropdowns) {

const card =
    dropdown.closest(".pending-request-card");

const employeeName =
    card.querySelector("strong").textContent;

const requestId =
    dropdown.dataset.id;

        const status =
            dropdown.value;

await FirebaseService.db
    .collection("leaveRequests")
    .doc(requestId)
    .update({
        status
    });

const vacationSnapshot =
    await FirebaseService.db
        .collection("vacationRequests")
        .where(
            "employeeName",
            "==",
            employeeName
        )
        .get();

for (const doc of vacationSnapshot.docs) {

    await doc.ref.delete();

}


    }

    await App.leave.loadRequestedLeaves();
    await App.leave.loadLeaveRequests();

    document
        .getElementById("leave-modal")
        .classList.add("hidden");

    return;
}

  const name =
      App.leave.isRequestMode
          ? App.leave.currentEmployee
          : document.getElementById(
                "leave-employee"
            ).value;

  const status =
      document.getElementById(
          "leave-status"
      ).value;

  const date =
      App.leave.currentLeaveDate;

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
    .delete();


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

App.leave.openLeaveModal =
function(
    dateKey,
    employeeName = null,
    isRequest = false
) {



  App.leave.currentLeaveDate = dateKey;

App.leave.currentEmployee =
    employeeName;

App.leave.isRequestMode =
    isRequest;

  const modal = document.getElementById("leave-modal");

const title =
    document.getElementById(
        "leave-modal-title"
    );

if (isRequest) {

    title.textContent =
        "🔄 Change Status";

    document
        .getElementById("leave-add-tab")
        ?.click();

} else {

    title.textContent =
        "➕ Add Leave";

    document
        .getElementById("leave-requests-tab")
        ?.click();

}
  modal.classList.remove("hidden");

  const label = document.getElementById("selected-date-label");

  if (label) {
    label.textContent = "📅 " + dateKey;
  }

const pendingList =
    document.getElementById(
        "leave-pending-list"
    );

console.log(
    "Modal Date:",
    dateKey
);

console.log(
    "Requested Leaves:",
    App.leave.requestedLeaves
);

console.log(
    "For Date:",
    App.leave.requestedLeaves[dateKey]
);

const requests =
    App.leave.leaveRequests[
        dateKey
    ] || [];

if (!requests.length) {

    pendingList.innerHTML =
        "<p>No pending requests.</p>";

} else {

pendingList.innerHTML =
    requests.map(r => `
        <div class="pending-request-card">

            <strong>
                ${r.name}
            </strong>

            <div class="mt-10">

                <label>Status</label>

<select
    class="pending-request-status"
    data-id="${r.id}"
>

                    <option
                        value="Pending"
                        ${r.status === "Pending"
                            ? "selected"
                            : ""}
                    >
                        Pending
                    </option>

                    <option
                        value="Approved"
                        ${r.status === "Approved"
                            ? "selected"
                            : ""}
                    >
                        Approved
                    </option>

                    <option
                        value="Denied"
                        ${r.status === "Denied"
                            ? "selected"
                            : ""}
                    >
                        Denied
                    </option>

                </select>

            </div>

        </div>
    `).join("");

}

  const select = document.getElementById("leave-employee");

  select.innerHTML = Object.values(App.data.users)
    .filter(u => u.role === "employee")
    .map(u => `<option value="${u.name}">${u.name}</option>`)
    .join("");

if (employeeName) {

    select.value = employeeName;

}

const requestEmployeeGroup =
    document.getElementById(
        "request-employee-group"
    );

const requestEmployeeName =
    document.getElementById(
        "request-employee-name"
    );

if (isRequest) {

    requestEmployeeGroup
        ?.classList.remove("hidden");

    select.classList.add("hidden");

    requestEmployeeName.value =
        employeeName || "";

} else {

    requestEmployeeGroup
        ?.classList.add("hidden");

    select.classList.remove("hidden");

}
const statusSelect =
    document.getElementById(
        "leave-status"
    );

statusSelect.value =
    "Pending";

if (isRequest) {

    const request =
        App.leave.requestedLeaves[dateKey]
        ?.find(
            r => r.name === employeeName
        );

    if (request) {

        statusSelect.value =
            request.status;

    }

}
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

const statusClass =
    e.status.toLowerCase();

tag.className =
    `calendar-entry ${statusClass}`;

tag.textContent =
    `${e.name} (${e.status})`;

  cell.appendChild(tag);

tag.style.cursor = "pointer";

if (isTL) {

    tag.addEventListener("click", (event) => {

        event.stopPropagation();

        App.leave.openLeaveModal(
            dateKey,
            e.name,
            true
        );

    });

}

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

  id: doc.id,
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


