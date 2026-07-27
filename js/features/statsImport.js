window.App = window.App || {};

App.statsImport = {};


App.statsImport.importAHT = async function () {

  const date =
    document.getElementById(
      "ocr-import-date"
    )?.value;

  if (!date) {
    alert(
      "Please select an OCR import date."
    );
    return;
  }

  const rows =
    App.statsOCR.lastImport || [];

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
        date,
        AHT: row.AHT
      };

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
      `✅ Imported ${imported} AHT records`
    );

  } catch (error) {

    console.error(error);

    alert(
      "Import failed ❌\n\n" +
      error.message
    );

  }

};
