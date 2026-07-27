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

  const preview =
    document.getElementById("ocr-preview");

  preview.innerHTML =
    "🔍 Reading screenshot...";

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


App.statsOCR.renderPreview(
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

App.statsOCR.renderPreview = function(rows) {

  const preview =
    document.getElementById("ocr-preview");

  const html = rows.map(row => `
    <tr>
      <td>${row.found ? "✅" : "❌"}</td>
      <td>${row.name}</td>
      <td>${row.AHT}</td>
      <td>${row.email || "Not Found"}</td>
    </tr>
  `).join("");

  preview.innerHTML = `
    <h4>Matched Employees</h4>

    <table class="history-table">
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

    <div class="mt-20">
      <button
        id="import-aht-btn"
        class="nav-btn btn-primary"
        type="button"
      >
        🚀 Import All AHT
      </button>
    </div>
  `;

  // ATTACH CLICK EVENT HERE
  const importBtn =
    document.getElementById("import-aht-btn");

  if (importBtn) {

importBtn.addEventListener(
  "click",
  App.statsImport.importAHT
);



  }

};
