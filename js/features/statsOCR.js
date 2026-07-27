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

  // remove apostrophes/quotes
  .replace(/[''`]/g, "")

  // remove commas
  .replace(/,/g, " ")

  // remove periods
  .replace(/\./g, " ")

  // collapse spaces
  .replace(/\s+/g, " ")

  .trim();
};

App.statsOCR.processFile =
  async function(file) {

    const result =
      await Tesseract.recognize(
        file
      );

    const rows =
      App.statsOCR.extractAHT(
        result.data.text
      );

    const matchedRows =
      App.statsOCR.matchEmployees(
        rows
      );

    App.statsOCR.lastImport =
      matchedRows;

    App.statsOCR.showReviewModal(
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

if (dbName === ocrName) {
  return true;
}

const compactDb =
  dbName.replace(/\s+/g, "");

const compactOcr =
  ocrName.replace(/\s+/g, "");

if (compactDb === compactOcr) {
  return true;
}

const dbTokens =
  dbName.split(" ");

const ocrTokens =
  ocrName.split(" ");

const matchingTokens =
  ocrTokens.filter(token =>
    dbTokens.includes(token)
  );

return matchingTokens.length >= 2;
      });

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

      <td>${row.AHT}</td>

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
            <th>AHT</th>
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