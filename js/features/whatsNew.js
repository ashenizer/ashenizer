window.App = window.App || {};

App.whatsNew = {};

App.whatsNew.version = "2.1.0";

App.whatsNew.updates = [

{
    version: "2.3.0",

    released: "July 2026",

    title: "📸 OCR Performance Import",

    summary:
        "Team Leads can now import employee AHT data directly from performance screenshots using OCR with a built-in review and validation workflow.",

    items: [

        "Added OCR screenshot reader powered by Tesseract.",

        "Added automatic employee name matching against registered users.",

        "Added OCR Import Review modal.",

        "Added import validation before saving data.",

        "Added employee match verification with success and failure indicators.",

        "Added bulk AHT import from screenshots.",

        "Added import date selection directly inside the OCR review modal.",

        "Added automatic import review workflow before database updates.",

        "Improved Team Lead productivity when entering performance data.",

        "Reduced manual AHT entry requirements."

    ]
},

{
    version: "2.2.1",

    released: "July 2026",

    title: "💖 Vacation Request & Approval Enhancement",

    summary:
        "Vacation requests now include automatic email generation, standard subject lines, improved approvals, and a more polished employee experience.",

    items: [

        "Added automatic vacation request email generation.",

        "Added one-click 'Copy Email' functionality.",

        "Added one-click 'Copy Subject' functionality.",

        "Standardized Outlook subject line: TEAM RIA - VL REQUEST.",

        "Added guided email submission workflow for employees.",

        "Added leave request success and confirmation modals.",

        "Fixed timezone issue causing leave dates to appear one day early in emails.",

        "Improved leave request calendar synchronization.",

        "Leave requests now update on the calendar immediately after submission.",

        "Enhanced Light Mode and Dark Mode support for leave requests.",

        "Improved vacation request modal styling and usability.",

        "Added Team Lead vacation request notifications.",

        "Improved overall approval workflow and user experience."

    ]
},

{
    version: "2.2.0",

    released: "July 2026",

    title: "💌 Vacation Request Experience Upgrade",

    summary:
        "Vacation requests now update instantly, include guided email templates, and feature a polished approval workflow.",

    items: [

        "Leave requests now appear on the calendar immediately without refreshing.",

        "Added automatic leave request email generation.",

        "Added one-click email copy functionality.",

        "Introduced a redesigned leave request workflow.",

        "Added a guided approval process for employees.",

        "Improved leave request modal styling and readability.",

        "Added beautiful custom confirmation popups.",

        "Enhanced Light Mode and Dark Mode leave request experience."

    ]
},

{
    version: "2.1.0",

    released: "July 2026",

    title: "🌴 Vacation Request System",

    summary:
        "Leave requests, approvals, calendar integration, and employee self-service are now available.",

    items: [

        "Employees can submit leave requests directly from the calendar.",

        "Team Leads can view all leave requests.",

        "Employees now only see their own leave requests.",

        "Leave requests appear directly on the calendar.",

        "Improved request styling for Light Mode and Dark Mode."

    ]
},

{
    version: "2.0.0",

    title: "📸 Happy Snaps Social Upgrade",

    items: [

        "Happy Snaps now works like a social media feed.",

        "Added comments on posts.",

        "Added image navigation controls.",

        "Added support for multiple images.",

        "Improved gallery viewing experience."
    ]
}

];

App.whatsNew.render = function () {

    const container =
        document.getElementById(
            "whats-new-container"
        );

    const sidebar =
        document.getElementById(
            "whats-new-sidebar"
        );

    if (!container || !sidebar) {
        return;
    }

    sidebar.innerHTML = "";

    App.whatsNew.updates.forEach(
        (update, index) => {

            sidebar.innerHTML += `
                <button
                    class="
                        release-nav-btn
                        ${index === 0 ? "active" : ""}
                    "
                    data-version="${update.version}"
                >
                    ${update.version}
                </button>
            `;

        }
    );

    const renderUpdate =
    (version) => {

        const update =
            App.whatsNew.updates.find(
                u =>
                    u.version === version
            );

        if (!update) return;

        container.innerHTML = `
            <div class="update-card">

                <h3>
                    ${update.title}
                </h3>

                <p>
                    Version ${update.version}
                </p>

                <p class="release-date">
                    ${update.released || ""}
                </p>

                <p class="update-summary">
                    ${update.summary || ""}
                </p>

                <ul>
                    ${update.items
                        .map(item =>
                            `<li>${item}</li>`
                        )
                        .join("")}
                </ul>

            </div>
        `;
    };

    renderUpdate(
        App.whatsNew.updates[0].version
    );

    sidebar
        .querySelectorAll(
            ".release-nav-btn"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    sidebar
                        .querySelectorAll(
                            ".release-nav-btn"
                        )
                        .forEach(
                            b =>
                                b.classList.remove(
                                    "active"
                                )
                        );

                    btn.classList.add(
                        "active"
                    );

                    renderUpdate(
                        btn.dataset.version
                    );

                }
            );

        });

};

App.whatsNew.loadBanner = function () {

    const release =
        App.whatsNew.updates[0];

    const version =
        document.getElementById(
            "release-version"
        );

    const title =
        document.getElementById(
            "release-title"
        );

    const summary =
        document.getElementById(
            "release-summary"
        );

    if (version) {

        version.textContent =
            `✨ New in Version ${release.version}`;

    }

    if (title) {

        title.textContent =
            release.title;

    }

    if (summary) {

        summary.textContent =
            release.summary || "";

    }

};