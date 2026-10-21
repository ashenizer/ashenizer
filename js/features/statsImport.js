window.App = window.App || {};

App.statsImport = {};
App.statsExcel = {};


App.statsImport.importAHT = async function () {

const date =
  document.getElementById(
    "ocr-modal-date"
  )?.value;

  if (!date) {
    alert(
      "Please select an OCR import date."
    );
    return;
  }

const rows =
  App.statsOCR.lastImport?.rows || [];

  if (!rows.length) {
    alert(
      "No OCR data found."
    );
    return;
  }

  let imported = 0;

  try {

    for (const row of rows) {

      if (!row.found) continue;

      const email = row.email;

      if (!App.data.statsStore[email]) {

        App.data.statsStore[email] = {
          history: [],
          current: {}
        };

      }

      const previous =
        App.data.statsStore[email]
          ?.current || {};

const entry = {
  ...previous,
  date
};

if (
  App.statsOCR.lastImport.type ===
  "Attendance"
) {

  entry.Attendance =
    row.Attendance;

}
else if (
  App.statsOCR.lastImport.type ===
  "QA"
) {

  entry.QA =
    row.QA;

  entry.Evaluations =
    row.Evaluations;

}
else {

  entry.AHT =
    row.AHT;

}
      delete entry.id;

      await FirebaseService.db
        .collection("stats")
        .doc(email)
        .set(
          { exists: true },
          { merge: true }
        );

      const docRef =
        await FirebaseService.db
          .collection("stats")
          .doc(email)
          .collection("history")
          .add(entry);

      entry.id = docRef.id;

      App.data.statsStore[email]
        .history.push(entry);

      App.data.statsStore[email]
        .current = entry;

      imported++;
    }

alert(
  `✅ Imported ${imported} ${App.statsOCR.lastImport.type} records`
);

document
  .getElementById(
    "ocr-review-modal"
  )
  ?.classList.add(
    "hidden"
  );

  } catch (error) {

    console.error(error);

    alert(
      "Import failed ❌\n\n" +
      error.message
    );

  }

};


App.statsExcel.downloadTemplate =
function () {

    const rows =
        App.statsOCR.lastImport?.rows || [];

    if (!rows.length) {

        alert(
            "No OCR data available."
        );

        return;

    }

    const csvRows = [

        "Employee,QA,Evaluations,AHT,Attendance"

    ];

    rows.forEach(row => {

        csvRows.push([
            row.name || "",
            row.QA ?? "",
            row.Evaluations ?? "",
            row.AHT ?? "",
            row.Attendance ?? ""
        ].join(","));

    });

    const csv =
        csvRows.join("\n");

    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        `KPI_${App.statsOCR.lastImport.type}.csv`;

    a.click();

    URL.revokeObjectURL(url);

};

document.addEventListener(
  "DOMContentLoaded",
  () => {

    document
      .getElementById(
        "download-kpi-template"
      )
      ?.addEventListener(
        "click",
        App.statsExcel.downloadTemplate
      );

  }
);
