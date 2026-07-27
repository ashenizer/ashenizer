window.App = window.App || {};

App.statsOCR = {};

App.statsOCR.lastImport = [];

document.addEventListener("DOMContentLoaded", () => {

  const upload =
    document.getElementById("ocr-upload");

  if (!upload) return;

  upload.addEventListener(
    "change",
    App.statsOCR.readImage
  );

});

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
    .replace(/\s+/g, " ")
    .trim();
};

App.statsOCR.readImage = async function(event) {

  const file =
    event.target.files?.[0];

  if (!file) return;



  const result =
    await Tesseract.recognize(file);

const rows =
  App.statsOCR.extractAHT(
    result.data.text
  );

const matchedRows =
  App.statsOCR.matchEmployees(rows);


App.statsOCR.lastImport =
  matchedRows;


App.statsOCR.showReviewModal(
  matchedRows
);

};

App.statsOCR.extractAHT = function(text) {

  const rows = [];

  const lines = text.split("\n");

  lines.forEach(line => {

    line = line.trim();

    const match =
      line.match(/^(.+?)\s+(\d+)$/);

    if (!match) return;

    const name =
      match[1].trim();

    const aht =
      parseInt(match[2], 10);

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


return (
  App.statsOCR.normalizeName(user.name) ===
  App.statsOCR.normalizeName(row.name)
);

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

  }
);
