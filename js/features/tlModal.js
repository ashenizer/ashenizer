window.App = window.App || {};
App.tlModal = App.tlModal || {};

App.tlModal.currentAgent = null;

App.tlModal.open = function(agentName, email) {

    const modal =
        document.getElementById("tl-modal");

    const title =
        document.getElementById("tl-modal-title");

    if (!modal) return;

    App.tlModal.currentAgent = email;

    title.textContent = agentName;

    modal.classList.remove("hidden");

    App.tlModal.showPerformance();
};

App.tlModal.close = function() {

    document
        .getElementById("tl-modal")
        ?.classList.add("hidden");
};

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .getElementById("close-tl-modal")
            ?.addEventListener(
                "click",
                App.tlModal.close
            );

    }
);


document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .querySelectorAll(".tl-tab")
            .forEach(btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(".tl-tab")
                            .forEach(tab =>
                                tab.classList.remove("active")
                            );

                        btn.classList.add("active");

                        document
                            .getElementById("tl-performance-tab")
                            ?.classList.add("hidden");

                        document
                            .getElementById("tl-stats-tab")
                            ?.classList.add("hidden");

                        document
                            .getElementById("tl-incentives-tab")
                            ?.classList.add("hidden");

document
    .getElementById("tl-notes-tab")
    ?.classList.add("hidden");

                        const target =
                            document.getElementById(
                                "tl-" +
                                btn.dataset.tab +
                                "-tab"
                            );

                        target?.classList.remove(
                            "hidden"
                        );

if (btn.dataset.tab === "stats") {
    App.tlModal.showStats();
}

if (btn.dataset.tab === "incentives") {
    App.tlModal.showIncentives();
}

if (btn.dataset.tab === "notes") {
    App.tlModal.showNotes();
}
                    }
                );

            });

    }
);

App.tlModal.showPerformance = function() {



    const email =
        App.tlModal.currentAgent;

    const target =
        document.getElementById(
            "tl-performance-tab"
        );

    if (!email || !target) return;

const history =
    [...(App.data.statsStore[email]?.history || [])]
    .sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );

const latest = history[0] || {};

target.innerHTML = `

    <div class="tl-performance-chart-card">

        <div class="chart-tabs">
            <button class="tab-btn active" data-tab="agent">
                Monthly Performance
            </button>

            <button class="tab-btn" data-tab="ytd">
                Year to Date
            </button>
        </div>

        <div class="flex-between">

            <div class="chart-toggle">
                <button id="modal-toggle-daily"
                    class="nav-btn active">
                    Daily
                </button>

                <button id="modal-toggle-monthly"
                    class="nav-btn">
                    Monthly
                </button>
            </div>

            <div class="chart-toggle">

                <button id="modal-metric-qa"
                    class="nav-btn active">
                    QA
                </button>

                <button id="modal-metric-aht"
                    class="nav-btn">
                    AHT
                </button>

                <button id="modal-metric-att"
                    class="nav-btn">
                    Attendance
                </button>

            </div>

        </div>

        <canvas
            id="tl-performance-chart"
            height="120">
        </canvas>

    </div>

    <div class="stats-grid">

        <div class="stat-card">
            <p class="stat-label">QA</p>
            <p class="stat-value">
                ${latest.QA ?? "—"}%
            </p>
        </div>

        <div class="stat-card">
            <p class="stat-label">AHT</p>
            <p class="stat-value">
                ${latest.AHT ?? "—"}s
            </p>
        </div>

        <div class="stat-card">
            <p class="stat-label">Attendance</p>
            <p class="stat-value">
                ${
                  latest.Attendance != null
                    ? Number(latest.Attendance).toFixed(2)
                    : "—"
                }%
            </p>
        </div>

    </div>

    <h3 class="mt-20">
        Performance History
    </h3>

    <table class="history-table">

        <thead>
            <tr>
                <th>Date</th>
                <th>QA</th>
                <th>AHT</th>
                <th>Attendance</th>
                <th>Action</th>
            </tr>
        </thead>

        <tbody>

            ${history.map(row => `
                <tr>
                    <td>${row.date}</td>
                    <td>${row.QA ?? "—"}%</td>
                    <td>${row.AHT ?? "—"}</td>

                    <td>
                        ${
                          row.Attendance != null
                            ? Number(row.Attendance).toFixed(2)
                            : "—"
                        }%
                    </td>

                    <td>
                        <button
                            class="modal-delete-history"
                            data-email="${email}"
                            data-id="${row.id}">
                            ❌
                        </button>
                    </td>
                </tr>
            `).join("")}

        </tbody>

    </table>

`;

App.ui.initTLPerformanceChart();

App.ui.updatePerformanceChart(
    email,
    App.ui.tlPerformanceChart
);

document
  .getElementById("modal-metric-qa")
  ?.addEventListener("click", () => {

      App.ui.metric = "QA";

      App.ui.updatePerformanceChart(
          email,
          App.ui.tlPerformanceChart
      );

  });

document
  .getElementById("modal-metric-aht")
  ?.addEventListener("click", () => {

      App.ui.metric = "AHT";

      App.ui.updatePerformanceChart(
          email,
          App.ui.tlPerformanceChart
      );

  });

document
  .getElementById("modal-metric-att")
  ?.addEventListener("click", () => {

      App.ui.metric = "Attendance";

      App.ui.updatePerformanceChart(
          email,
          App.ui.tlPerformanceChart
      );

  });
        
document
    .querySelectorAll(
        ".modal-delete-history"
    )
    .forEach(btn => {

        btn.addEventListener(
            "click",
            async () => {

                const email =
                    btn.dataset.email;

                const id =
                    btn.dataset.id;

                await App.tl.deleteEntry(
                    email,
                    id
                );

                App.tlModal.showPerformance();

            }
        );

    });

};


App.tlModal.showStats = function() {

const email =
    App.tlModal.currentAgent;

    const member =
        App.data.users[email];

    const commercialGroup =
        document.getElementById(
            "modal-commercial-count-group"
        );

    if (member?.qaType === "hybrid") {

        commercialGroup?.classList.remove(
            "hidden"
        );

    } else {

        commercialGroup?.classList.add(
            "hidden"
        );

        const input =
            document.getElementById(
                "modal-input-qa-commercial-count"
            );

        if (input) {
            input.value = "";
        }

    }

};
App.tlModal.showIncentives = async function() {

    const email =
        App.tlModal.currentAgent;

    const target =
        document.getElementById(
            "tl-incentives-tab"
        );

    const incentives =
        document.getElementById(
            "tl-incentive-section"
        );

    if (!email || !target || !incentives) return;

    target.innerHTML = "";

    target.appendChild(
        incentives
    );

    incentives.classList.remove(
        "hidden"
    );

    await App.incentives.loadHistory(
        email
    );
};
document.addEventListener("DOMContentLoaded", () => {

    const saveBtn =
        document.getElementById(
            "modal-save-stats-btn"
        );

    if (!saveBtn) return;

    saveBtn.addEventListener(
        "click",
        () => {


            App.tl.saveEmployeeStats();

        }
    );

});

App.tlModal.showNotes = async function() {

    const email =
        App.tlModal.currentAgent;

    const textarea =
        document.getElementById(
            "modal-employee-note"
        );

    if (!email || !textarea) return;

    try {

        const doc =
            await FirebaseService.db
                .collection("employeeNotes")
                .doc(email)
                .get();

        textarea.value =
            doc.exists
                ? (doc.data()?.note || "")
                : "";

    } catch (error) {

        console.error(
            "Failed to load note:",
            error
        );

    }

};

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .getElementById(
                "modal-save-note-btn"
            )
            ?.addEventListener(
                "click",
                async () => {

                    const email =
                        App.tlModal.currentAgent;

                    const note =
                        document
                            .getElementById(
                                "modal-employee-note"
                            )
                            ?.value
                            .trim();

                    if (!email) {
                        alert(
                            "No agent selected"
                        );
                        return;
                    }

                    try {

                        await FirebaseService.db
                            .collection(
                                "employeeNotes"
                            )
                            .doc(email)
                            .set({
                                note,
                                updatedAt:
                                    new Date()
                                    .toISOString()
                            });

                        alert(
                            "✅ Note saved"
                        );

                    } catch (error) {

                        console.error(
                            error
                        );

                        alert(
                            "Failed to save note"
                        );

                    }

                }
            );

    }
);

App.tlModal.resetToPerformance = function() {

    document
        .querySelectorAll(".tl-tab")
        .forEach(tab =>
            tab.classList.remove("active")
        );

    document
        .getElementById("tl-performance-tab")
        ?.classList.remove("hidden");

    document
        .getElementById("tl-stats-tab")
        ?.classList.add("hidden");

    document
        .getElementById("tl-incentives-tab")
        ?.classList.add("hidden");

    document
        .getElementById("tl-notes-tab")
        ?.classList.add("hidden");

    document
        .querySelector('[data-tab="performance"]')
        ?.classList.add("active");

    App.tlModal.showPerformance();
};

