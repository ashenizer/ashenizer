window.App = window.App || {};

App.statsOCR = {};

App.statsOCR.lastImport = [];


App.statsOCR.normalizeName = function(name) {

  if (!name) return "";

  name = name.trim();

// Remove avatar initials

name = name.trim();

// Remove initials like:
// (BG,
// (AK
// | HG)
// (EI
// (SN
// (jm

name = name
    .replace(/^\s*\(?[A-Z]{1,3}[,\s)\]]+/i, "")
    .replace(/^\|\s*[A-Z]{1,3}\)\s+/i, "")
    .replace(/^\(\s*[A-Z]{1,3}\s+/i, "")
    .trim();

name = name.replace(
    /\bljaetel\b/i,
    "Jaetel"
);

name = name.trim();

// Run twice for stubborn OCR cases
name = name.replace(
    /^\s*[|]?\s*\(?[a-z]{1,3}[,\)\]]*\s+/i,
    ""
);

name = name.trim();
``

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

.replace(/\bbever[a-z]*\b/g, "beverly")
.replace(/\bgilb[a-z]*\b/g, "gilbaliga")
.replace(/\bgiossge\b/g, "gilbaliga")

.replace(/\bberane\b/g, "berano")

.replace(/\bpeart\b/g, "pearl")
.replace(/\banes\b/g, "andreo")

.replace(/\bljaetel\b/g, "jaetel")
.replace(/\bjm\b/g, "")

.replace(/\bverveyn\b/g, "vervelyn")
.replace(/\bgartero\b/g, "garferio")

.replace(/\bsnevry\b/g, "sheirry")
.replace(/\bamey\b/g, "ambid")

.replace(/\basriey\b/g, "ashley")
.replace(/\bkern\b/g, "keith")
.replace(/\bfarmorte\b/g, "piamonte")

.replace(/\baren\b/g, "hannah")
.replace(/\bgagan\b/g, "gayanilo")

  .replace(/\s+/g, " ")
  .trim();
};



App.statsOCR.processFile =
async function(file) {

document
    .getElementById(
        "ocr-loading-modal"
    )
    ?.classList.remove(
        "hidden"
    );


const image =
    await createImageBitmap(file);

console.log(
    "IMAGE SIZE:",
    image.width,
    image.height
);

const canvas =
    document.createElement("canvas");

canvas.width =
    image.width * 6;

canvas.height =
    image.height * 6;

const ctx =
    canvas.getContext("2d");

ctx.imageSmoothingEnabled =
    true;

const cropTop = 0;

ctx.drawImage(
    image,
    0,
    cropTop,
    image.width,
    image.height - cropTop,

    0,
    0,
    canvas.width,
    canvas.height
);

const result =
    await Tesseract.recognize(
        canvas,
        "eng",
        {
logger: m => {

    console.log(m);

    const label =
        document.getElementById(
            "ocr-loading-text"
        );

    if (
        label &&
        m.status
    ) {

        const pct =
            m.progress
                ? Math.round(
                    m.progress * 100
                )
                : 0;

        label.textContent =
            `${m.status} ${pct}%`;

    }

}
        }
    );

const text =
    result.data.text;



const filtered =
    result.data.words.filter(word => {

        const x =
            word.bbox?.x0 || 0;


    });

const employeeRows =
    filtered.filter(word => {

        const y =
            word.bbox?.y0 || 0;

        return y > 500;

    });

const grouped = [];

employeeRows.forEach(word => {

    const y =
        word.bbox?.y0 || 0;

    let row =
        grouped.find(r =>
            Math.abs(r.y - y) < 60
        );

    if (!row) {

        row = {
            y,
            words: []
        };

        grouped.push(row);
    }

    row.words.push(word);

});

console.log(
    "GROUPED:",
    grouped
);

const testRows =
    grouped.map(row => {

        row.words.sort(
            (a, b) =>
                (a.bbox?.x0 || 0) -
                (b.bbox?.x0 || 0)
        );

        return row.words.map(
            w => w.text
        );

    });


const rowMap = {};

employeeRows.forEach(word => {

    const rowKey =
        Math.round(
            (word.bbox?.y0 || 0) / 100
        );

    rowMap[rowKey] =
        rowMap[rowKey] || [];

    rowMap[rowKey].push(
        word.text
    );

});

console.log(
    "GROUPED RAW:",
    grouped.map(row => ({
        y: row.y,
        words: row.words.map(
            w => w.text
        )
    }))
);

console.log(
    "ROW MAP:",
    rowMap
);

console.log(
    "EMPLOYEE ROWS:",
    employeeRows.map(
        w => ({
            text: w.text,
            y: w.bbox?.y0
        })
    )
);

console.log(
    filtered.map(w => ({
        text: w.text,
        y: w.bbox?.y0
    }))
);

console.log(
    "FILTERED:",
    filtered.map(
        w => w.text
    ).join(" ")
);

result.data.words.forEach(word => {

    const t =
        word.text?.toLowerCase() || "";

    if (
        t.includes("bever") ||
        t.includes("gilbal") ||
        t.includes("99.62")
    ) {

        console.log(
            "BEVERLY WORD:",
            word.text,
            word.bbox
        );

    }

}); 


console.log(
    "RAW OCR TEXT",
    text
);

console.log(
    "HAS BEVERLY:",
    text.toLowerCase().includes("bever")
);

console.log(
    "HAS GILBALIGA:",
    text.toLowerCase().includes("gilbal")
);

const lines =
    text.split("\n");

console.log(
    "FIRST 50 LINES:",
    lines.slice(0, 50)
);

    let rows = [];
let type = "AHT";

const lower =
    text.toLowerCase();

if (
    lower.includes("quality performance") ||
    lower.includes("average score")
) {

    type = "QA";

    rows = App.statsOCR.extractQA(text);

}


else if (
    lower.includes("reliability")
) {

    type = "Attendance";

    rows =
        App.statsOCR.extractAttendance(
            text
        );

}
else {

    rows =
        App.statsOCR.extractAHT(
            text
        );

}
``

    const matchedRows =
        App.statsOCR.matchEmployees(
            rows
        );

App.statsOCR.lastImport = {
    type,
    rows: matchedRows
};

document
    .getElementById(
        "ocr-loading-modal"
    )
    ?.classList.add(
        "hidden"
    );

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

App.statsOCR.similarity =
function(a, b) {

  a =
    App.statsOCR.normalizeName(a);

  b =
    App.statsOCR.normalizeName(b);

  const aTokens =
    a.split(" ");

  const bTokens =
    b.split(" ");

  let matches = 0;

  aTokens.forEach(tokenA => {

    if (
      bTokens.some(tokenB =>
        tokenB.includes(tokenA) ||
        tokenA.includes(tokenB)
      )
    ) {
      matches++;
    }

  });

  return matches;

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

const score =
    App.statsOCR.similarity(
        dbName,
        ocrName
    );

if (score >= 2) {

    console.log(
        "FUZZY MATCH:",
        ocrName,
        "->",
        dbName
    );

    return true;
}

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
  ${
    row.QA !== undefined &&
    row.QA !== null
      ? `${row.QA} (${row.Evaluations})`
      : row.AHT ?? row.Attendance
  }
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
  rows[0]?.QA !== undefined
    ? "QA Score (Evals)"
    : rows[0]?.Attendance !== undefined
      ? "Attendance"
      : "AHT"
}
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

App.statsOCR.extractQA =
function(text) {

    const rows = [];

    const lines =
        text.split("\n");

console.log(
  "QA LINES",
  JSON.stringify(lines, null, 2)
);


    lines.forEach(line => {

        line = line.trim();

        if (line.length < 20) {
            return;
        }

let name =
    line
        .replace(
            /\bGBSC.*$/i,
            ""
        )
        .replace(
            /\bAddTime.*$/i,
            ""
        )
        .trim();

// Remove OCR avatar initials

name = name
    .replace(/^\(?[A-Z]{2}\s+/i, "")
    .replace(/^\(?[A-Z]{2},\s*/i, "")
    .replace(/^\|\s*[A-Z]{2}\)\s*/i, "")
    .replace(/^\([A-Z]{2}\s*/i, "")
    .replace(/^\([A-Z]{2},\s*/i, "")
    .replace(/^\([a-z]{2}\s*/i, "")
    .replace(/^\([a-z]{2},\s*/i, "")
    .trim();

name = name
    .replace(/^\|/g, "")
    .replace(/^\)/g, "")
    .replace(/^\]/g, "")
    .trim();

const lowerName =
    name.toLowerCase();

if (
    lowerName.includes("evaluation form") ||
    lowerName.includes("average score") ||
    lowerName.includes("no of evaluations") ||
    lowerName.includes("clicking") ||
    lowerName.includes("teams groups") ||
    lowerName.includes("search to add") ||
    lowerName.includes("from to")
) {
    return;
}

console.log(
    "QA ROW RAW:",
    line
);

line = line

  // OCR mistakes for 11
  .replace(/(\d+\.\d+)\s+mn\b/gi, "$1 11");

if (name.includes("Hannah")) {

    console.log(
        "AFTER FIX:",
        JSON.stringify(line)
    );

}

const matches =
    [...line.matchAll(
        /(\d+\.\d+)\s+(\d+)/g
    )];

const stats =
    matches.length
        ? matches[matches.length - 1]
        : null;

const qa =
    stats
        ? parseFloat(stats[1])
        : null;

const evaluations =
    stats
        ? parseInt(stats[2], 10)
        : 0;

if (name.includes("Hannah")) {

    console.log(
        "HANNAH JSON:",
        JSON.stringify(line)
    );

}

if (name.includes("Hannah")) {

    console.log(
        "ENDS WITH:",
        JSON.stringify(line.slice(-15))
    );

}

rows.push({
    name,
    QA: qa,
    Evaluations: evaluations
});


    });

    console.log(
        "QA ROWS",
        rows
    );

    return rows;

};

App.statsOCR.editDistance =
function(a, b) {

    a = App.statsOCR.normalizeName(a);
    b = App.statsOCR.normalizeName(b);

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {

        for (let j = 1; j <= a.length; j++) {

            if (b.charAt(i - 1) === a.charAt(j - 1)) {

                matrix[i][j] =
                    matrix[i - 1][j - 1];

            } else {

                matrix[i][j] =
                    Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );

            }

        }

    }

    return matrix[b.length][a.length];

};