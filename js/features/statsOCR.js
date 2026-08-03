window.App = window.App || {};

App.statsOCR = {};

App.statsOCR.lastImport = [];


App.statsOCR.normalizeName = function(name) {

  if (!name) return "";

  name = name.trim();

  // Database format:
  // Piamonte, Ashley Keith

  if (name.includes(",")) {

    const parts = name.split(",");

    const last =
      parts[0].trim();

    const first =
      parts[1].trim();

    name =
      first + " " + last;
  }

return name
  .toLowerCase()
  .replace(/[''`]/g, "")
  .replace(/,/g, " ")
  .replace(/\./g, " ")

  // OCR fix
  .replace(/\blsubal\b/g, "isubal")

  .replace(/\s+/g, " ")
  .trim();
};

App.statsOCR.processFile =
async function(file) {



    const result =
        await Tesseract.recognize(file);

const text =
    result.data.text;

console.log(
    "RAW OCR TEXT",
    text
);

    let rows = [];
    let type = "AHT";

    if (
        text.toLowerCase().includes(
            "reliability"
        )
    ) {

        type = "Attendance";

        rows =
            App.statsOCR.extractAttendance(
                text
            );

    } else {

        rows =
            App.statsOCR.extractAHT(
                text
            );

    }

    const matchedRows =
        App.statsOCR.matchEmployees(
            rows
        );

App.statsOCR.lastImport = {
    type,
    rows: matchedRows
};

App.statsOCR.showReviewModal(
    matchedRows
);

console.log(
    "LAST IMPORT",
    App.statsOCR.lastImport
);

App.statsOCR.lastImport = {
    type,
    rows: matchedRows
};

    console.log(
        "DETECTED:",
        type
    );

    console.log(
        matchedRows
    );

};

App.statsOCR.readImage =
  async function(event) {

    const file =
      event.target.files?.[0];

    if (!file) return;

    App.statsOCR.processFile(
      file
    );

};

App.statsOCR.extractAHT = function(text) {

  const rows = [];

  const lines =
    text.split("\n");

  lines.forEach(line => {

    line = line.trim();

let match =
  line.match(
    /^(.+?)\s+(\d+)\s+(\d+)/
  );

let aht;

if (match) {

  // Format:
  // Name Handled AHT

  aht = parseInt(
    match[3],
    10
  );

} else {

  match =
    line.match(
      /^(.+?)\s+(\d+)$/
    );

  if (!match) return;

  // Format:
  // Name AHT

  aht = parseInt(
    match[2],
    10
  );

}

const name =
  match[1].trim();

    rows.push({
      name,
      AHT: aht
    });

  });

  return rows;

};

App.statsOCR.matchEmployees = function(rows) {

  return rows.map(row => {

const match = Object.entries(App.data.users)
  .find(([email, user]) => {


const dbName =
  App.statsOCR.normalizeName(
    user.name
  );

const ocrName =
  App.statsOCR.normalizeName(
    row.name
  );

if (
  row.name
    .toLowerCase()
    .includes("even")
) {

  console.log(
    "RAW ROW:",
    row.name
  );

  console.log(
    "OCR NAME:",
    ocrName
  );

}

if (dbName === ocrName) {
  return true;
}

if (
  row.name.toLowerCase().includes("even")
) {

  console.log(
    "OCR:",
    JSON.stringify(ocrName)
  );

  console.log(
    "DB:",
    JSON.stringify(dbName)
  );

}

const compactDb =
  dbName.replace(/\s+/g, "");

const compactOcr =
  ocrName.replace(/\s+/g, "");

if (compactDb === compactOcr) {
  return true;
}

if (
  compactDb.includes(compactOcr) ||
  compactOcr.includes(compactDb)
) {
  return true;
}

const dbTokens =
  dbName.split(" ");

const ocrTokens =
  ocrName.split(" ");

const dbLast =
  dbTokens[dbTokens.length - 1];

if (
  compactOcr.includes(dbLast)
) {
  return true;
}




const matchingTokens =
  ocrTokens.filter(token =>
    dbTokens.includes(token)
  );



return matchingTokens.length >= 2;
      });


if (!match) {

    console.log(
        "NO MATCH:",
        row.name
    );

    Object.values(App.data.users)
      .forEach(user => {

        console.log(
          "DB:",
          user.name
        );

      });
}

console.log(
  "MATCH RESULT:",
  row.name,
  match?.[0]
);

    return {
      ...row,
      email: match?.[0] || null,
      found: !!match
    };

  });

};


App.statsOCR.showReviewModal = function(rows) {

  const modal =
    document.getElementById(
      "ocr-review-modal"
    );

  const body =
    document.getElementById(
      "ocr-review-body"
    );

  const html = rows.map(row => `

    <tr>

      <td>
        ${row.found ? "✅" : "❌"}
      </td>

      <td>${row.name}</td>

<td>
  ${row.AHT ?? row.Attendance}
</td>

      <td>
        ${row.email || "Not Found"}
      </td>

    </tr>

  `).join("");

  body.innerHTML = `

    <div class="ocr-review-body">

      <table class="ocr-review-table">

        <thead>
          <tr>
            <th>Status</th>
            <th>Name</th>
<th>
 ${
   rows[0]?.Attendance !== undefined
     ? "Attendance"
     : "AHT"
 }
</th>
            <th>Email</th>
          </tr>
        </thead>

        <tbody>
          ${html}
        </tbody>

      </table>

    </div>

  `;

const dateInput =
  document.getElementById(
    "ocr-modal-date"
  );

if (dateInput && !dateInput.value) {

  dateInput.value =
    new Date()
      .toISOString()
      .split("T")[0];

}


  modal.classList.remove("hidden");
};

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const upload =
      document.getElementById(
        "ocr-upload"
      );

    const dropzone =
      document.getElementById(
        "ocr-dropzone"
      );

    const cancelBtn =
      document.getElementById(
        "ocr-cancel-btn"
      );

    const importBtn =
      document.getElementById(
        "ocr-confirm-btn"
      );

    const modal =
      document.getElementById(
        "ocr-review-modal"
      );

    if (!upload) return;

    upload.addEventListener(
      "change",
      App.statsOCR.readImage
    );

    dropzone?.addEventListener(
      "click",
      () => {
        upload.click();
      }
    );

    dropzone?.addEventListener(
      "dragover",
      event => {

        event.preventDefault();

        dropzone.classList.add(
          "drag-active"
        );

      }
    );

    dropzone?.addEventListener(
      "dragleave",
      () => {

        dropzone.classList.remove(
          "drag-active"
        );

      }
    );

    dropzone?.addEventListener(
      "drop",
      event => {

        event.preventDefault();

        dropzone.classList.remove(
          "drag-active"
        );

        const file =
          event.dataTransfer.files?.[0];

        if (!file) return;

        App.statsOCR.processFile(
          file
        );

      }
    );

    cancelBtn?.addEventListener(
      "click",
      () => {

        modal.classList.add(
          "hidden"
        );

      }
    );

    importBtn?.addEventListener(
      "click",
      App.statsImport.importAHT
    );

document.addEventListener(
  "paste",
  event => {

    const items =
      event.clipboardData?.items;

    if (!items) return;

    for (const item of items) {

      if (
        item.type.startsWith(
          "image/"
        )
      ) {

        const file =
          item.getAsFile();

        if (!file) continue;

        App.statsOCR.processFile(
          file
        );

        break;
      }

    }

  }
);

  }


);


App.statsOCR.extractAttendance =
function(text) {

    const rows = [];

    const lines =
        text.split("\n");

    lines.forEach(line => {

        line = line.trim();

        const match =
            line.match(
                /^(.+?)\s+(\d+(?:\.\d+)?)%/
            );

        if (!match) {
            return;
        }

        const name =
            match[1].trim();

const lower =
    name.toLowerCase();

if (
    lower.includes("grand total") ||
    lower.includes("team")
) {
    return;
}

        let attendance =
            match[2];

        attendance =
            attendance.replace(
                /[^0-9.]/g,
                ""
            );

        let value =
            parseFloat(attendance);

        if (isNaN(value)) {
            return;
        }

        // Fix OCR values like:
        // 999 -> 99.9
        // 9967 -> 99.67

if (
    !attendance.includes(".") &&
    value > 100
) {

    if (attendance.length === 3) {

        value = value / 10;

    } else if (
        attendance.length === 4
    ) {

        value = value / 100;

    } else if (
        attendance.length === 5
    ) {

        value = value / 100;

    }

}

        rows.push({
            name,
            Attendance: value
        });

    });

    console.log(
        "ATTENDANCE ROWS",
        rows
    );

    return rows;

};