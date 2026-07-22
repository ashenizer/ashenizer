window.App = window.App || {};
App.incentives = {};

App.incentives.populateMonths = function () {

  const dropdown =
    document.getElementById("incentive-month");

  if (!dropdown) return;

  dropdown.innerHTML =
    `<option value="">Select Month</option>`;

  const date = new Date();

  for (let i = 0; i < 12; i++) {

    const d = new Date(
      date.getFullYear(),
      i,
      1
    );

    const value =
      `${d.getFullYear()}-${String(i + 1).padStart(2, "0")}`;

    const label =
      d.toLocaleString("default", {
        month: "long",
        year: "numeric"
      });

    dropdown.innerHTML +=
      `<option value="${value}">
         ${label}
       </option>`;
  }
};

App.incentives.importBulk = async function() {

  const email =
    document.getElementById(
      "agent-select"
    ).value;

  if (!email) {
    alert("Select employee first");
    return;
  }

const monthMap = {
  january: "01",
  jan: "01",

  february: "02",
  feb: "02",

  march: "03",
  mar: "03",

  april: "04",
  apr: "04",

  may: "05",

  june: "06",
  jun: "06",

  july: "07",
  jul: "07",

  august: "08",
  aug: "08",

  september: "09",
  sept: "09",
  sep: "09",

  october: "10",
  oct: "10",

  november: "11",
  nov: "11",

  december: "12",
  dec: "12"
};


  const text =
    document.getElementById(
      "bulk-qpb-input"
    ).value;

  const lines =
    text
      .split("\n")
      .filter(line => line.trim());

  for (const line of lines) {

    const parts =
      line.trim().split(/\s+/);

let month = null;
let amount = null;
let grade = null;

parts.forEach(part => {

  const value = part.toLowerCase();

  if (monthMap[value]) {
    month = value;
  }

  else if (!isNaN(part)) {
    amount = Number(part);
  }

  else {
    grade = part.toUpperCase();
  }

});

   const monthNumber =
  monthMap[month];


    if (!monthNumber) {
      console.error(
        "Invalid month:",
        month
      );
      continue;
    }

    const firestoreMonth =
      `${new Date().getFullYear()}-${monthNumber}`;

    await FirebaseService.db
      .collection("incentives")
      .doc(email)
      .collection("monthly")
      .doc(firestoreMonth)
.set({
  month: firestoreMonth,
  amount,
  additionalIncentive: 0,
  grade,
  createdAt: new Date()
});

    console.log(
      "Saved:",
      firestoreMonth
    );
  }

await App.incentives.loadHistory(email);

await App.incentives.loadEmployeeIncentives(email);

alert("✅ Import complete");


};



App.incentives.save = async function () {

  const email =
    document.getElementById("agent-select").value;

  const month =
    document.getElementById("incentive-month").value;

  const amount =
    parseFloat(
      document.getElementById("incentive-amount").value
    );

const additionalIncentive =
  parseFloat(
    document.getElementById("additional-incentive").value
  ) || 0;


  const grade =
  document.getElementById("qpb-grade").value;


  if (!email) {
    alert("Select employee");
    return;
  }

  if (!month) {
    alert("Select month");
    return;
  }

  if (!grade) {
  alert("Select grade");
  return;
}

  try {

await FirebaseService.db
  .collection("incentives")
  .doc(email)
  .collection("monthly")
  .doc(month)
  .set({
    month,
    amount,
    additionalIncentive,
    grade,
    createdAt: new Date()
  });



    alert("✅ Incentive saved");

document.getElementById(
  "additional-incentive"
).value = "0";

App.incentives.loadHistory(email);

  } catch (error) {

    console.error(error);
    alert("Failed");

  }
};

App.incentives.getQuarterInfo = function(month) {

  if (month >= 1 && month <= 3) {
    return {
      name: "Q1",
      label: "Jan-Mar"
    };
  }

  if (month >= 4 && month <= 6) {
    return {
      name: "Q2",
      label: "Apr-Jun"
    };
  }

  if (month >= 7 && month <= 9) {
    return {
      name: "Q3",
      label: "Jul-Sep"
    };
  }

  return {
    name: "Q4",
    label: "Oct-Dec"
  };
};

App.incentives.loadEmployeeIncentive =
async function(email) {

  const snapshot =
    await FirebaseService.db
      .collection("incentives")
      .doc(email)
      .collection("monthly")
      .orderBy("month", "desc")
      .limit(1)
      .get();

  if (snapshot.empty) return;

  const data =
    snapshot.docs[0].data();

  document.getElementById(
    "employee-qpb"
  ).textContent =
    `₱${data.amount.toLocaleString()}`;

const [year, month] =
  data.month.split("-");

const date =
  new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  document.getElementById(
    "employee-qpb-month"
  ).textContent =
    date.toLocaleString("default", {
      month: "long",
      year: "numeric"
    });
};




document.addEventListener(
  "DOMContentLoaded",
  () => {

    App.incentives.populateMonths();

const manualTab =
  document.getElementById("manual-qpb-tab");


const bulkTab =
  document.getElementById("bulk-qpb-tab");

const manualPanel =
  document.getElementById("manual-qpb-panel");

const bulkPanel =
  document.getElementById("bulk-qpb-panel");

if (
  manualTab &&
  bulkTab &&
  manualPanel &&
  bulkPanel
) {

  manualTab.addEventListener("click", () => {

    manualPanel.classList.remove("hidden");
    bulkPanel.classList.add("hidden");

    manualTab.classList.add("active");
    bulkTab.classList.remove("active");

  });

  bulkTab.addEventListener("click", () => {

    bulkPanel.classList.remove("hidden");
    manualPanel.classList.add("hidden");

    bulkTab.classList.add("active");
    manualTab.classList.remove("active");

  });

}

document
  .getElementById("import-qpb-btn")
  ?.addEventListener(
    "click",
    App.incentives.importBulk
  );

    document
      .getElementById("save-incentive-btn")
      ?.addEventListener(
        "click",
        App.incentives.save
      );


document
  .getElementById("delete-incentive-btn")
  ?.addEventListener(
    "click",
    App.incentives.delete
  );

document
  .getElementById("agent-select")
  ?.addEventListener("change", (e) => {

    const email = e.target.value;

    App.incentives.loadHistory(email);

  });

  }
);

App.incentives.delete = async function () {

  const email =
    document.getElementById("agent-select").value;

  const month =
    document.getElementById("incentive-month").value;

  if (!email || !month) {
    alert("Select employee and month.");
    return;
  }

  const confirmDelete = confirm(
    `Delete incentive for ${month}?`
  );

  if (!confirmDelete) return;

  try {

    await FirebaseService.db
      .collection("incentives")
      .doc(email)
      .collection("monthly")
      .doc(month)
      .delete();

    alert("✅ Incentive deleted.");

    document.getElementById(
      "incentive-amount"
    ).value = "";

  } catch (error) {

    console.error(error);
    alert("Failed to delete.");

  }
};

App.incentives.loadHistory =
async function(email) {

  const tbody =
    document.getElementById(
      "incentive-history-body"
    );

  if (!tbody) return;

  tbody.innerHTML = "";

  const snapshot =
    await FirebaseService.db
      .collection("incentives")
      .doc(email)
      .collection("monthly")
      .orderBy("month", "desc")
      .get();

  snapshot.forEach(doc => {

    const data = doc.data();

const [year, month] =
  data.month.split("-");

const date =
  new Date(
    Number(year),
    Number(month) - 1,
    1
  );

    const monthLabel =
      date.toLocaleDateString(
        "default",
        {
          month: "long",
          year: "numeric"
        }
      );

tbody.innerHTML += `
  <tr>
    <td>${monthLabel}</td>

    <td>
      ${data.grade || "-"}
    </td>

<td>
  Base: ₱${Number(data.amount).toLocaleString()}
  <br>
  Add'l: ₱${Number(data.additionalIncentive || 0).toLocaleString()}
  <br>
  <strong>
    Total:
    ₱${(
      Number(data.amount || 0) +
      Number(data.additionalIncentive || 0)
    ).toLocaleString()}
  </strong>
</td>

    <td>
      <button
        class="delete-incentive-btn"
        data-month="${data.month}"
      >
        ❌
      </button>
    </td>
  </tr>
`;

  });


  App.incentives.bindDeleteButtons(email);
};

App.incentives.bindDeleteButtons =
function(email) {

  document
    .querySelectorAll(
      ".delete-incentive-btn"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        async () => {

          const month =
            btn.dataset.month;

          const confirmDelete =
            confirm(
              `Delete incentive for ${month}?`
            );

          if (!confirmDelete) return;

          await FirebaseService.db
            .collection("incentives")
            .doc(email)
            .collection("monthly")
            .doc(month)
            .delete();

          alert("✅ Deleted");

          App.incentives.loadHistory(email);
        }
      );

    });
};

App.incentives.calculateQuarterTotals = function(incentives) {

  const totals = {
    Q1: 0,
    Q2: 0,
    Q3: 0,
    Q4: 0
  };

  Object.values(incentives).forEach(item => {

    const month =
      Number(item.month.split("-")[1]);

const amount =
  (Number(item.amount) || 0) +
  (Number(item.additionalIncentive) || 0);


    if (month >= 1 && month <= 3) {
      totals.Q1 += amount;
    }

    else if (month >= 4 && month <= 6) {
      totals.Q2 += amount;
    }

    else if (month >= 7 && month <= 9) {
      totals.Q3 += amount;
    }

    else {
      totals.Q4 += amount;
    }

  });

  return totals;
};


App.incentives.loadEmployeeIncentives =
async function(email) {

  const select =
    document.getElementById(
      "employee-qpb-month-select"
    );

  if (!select) return;

  select.innerHTML = "";

  const snapshot =
    await FirebaseService.db
      .collection("incentives")
      .doc(email)
      .collection("monthly")
      .orderBy("month", "desc")
      .get();

  const incentives = {};

  snapshot.forEach(doc => {

console.log(
  "Found incentive:",
  doc.data()
);

    const data = doc.data();

    incentives[data.month] = data;

    const [year, month] =
      data.month.split("-");

    const date =
      new Date(
        Number(year),
        Number(month) - 1,
        1
      );

    const label =
      date.toLocaleDateString(
        "default",
        {
          month: "long",
          year: "numeric"
        }
      );

    select.innerHTML += `
      <option value="${data.month}">
        ${label}
      </option>
    `;



  });

const quarterTotals =
  App.incentives.calculateQuarterTotals(
    incentives
  );

function render(month) {

  const data = incentives[month];

  if (!data) return;

const baseAmount =
  Number(data.amount || 0);

const additionalAmount =
  Number(data.additionalIncentive || 0);

const totalAmount =
  baseAmount + additionalAmount;

document.getElementById(
  "employee-qpb"
).innerHTML = `
  Base: ₱${baseAmount.toLocaleString()}
  <br>
  Additional: ₱${additionalAmount.toLocaleString()}
  <br>
  <strong>
    Total: ₱${totalAmount.toLocaleString()}
  </strong>
`;

  document.getElementById(
    "employee-qpb-grade"
  ).textContent =
    `Grade: ${data.grade}`;

  const monthNumber =
    Number(month.split("-")[1]);

  const quarter =
    App.incentives.getQuarterInfo(
      monthNumber
    );

  const quarterAmount =
    quarterTotals[quarter.name];

  document.getElementById(
    "quarterly-incentives"
  ).innerHTML = `

    <div class="quarter-card">

      <h4>Current Quarter</h4>

      <p>
        ${quarter.name}
        (${quarter.label})
      </p>

      <h3>
        ₱${quarterAmount.toLocaleString()}
      </h3>

    </div>

  `;
}

if (select.value) {
  render(select.value);
}

select.addEventListener(
  "change",
  () => render(select.value)
);

};