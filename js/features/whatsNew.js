window.App = window.App || {};

App.whatsNew = {};

App.whatsNew.version = "2.1.0";

App.whatsNew.updates = [

{
    version: "2.8.0",

    released: "August 2026",

    title: "🏆 Achievement Dashboard & Personal Ranking",

    summary:
        "Employees can now instantly view their personal standing through a redesigned Achievement Dashboard featuring Overall Rank tracking, Overall Score visibility, enhanced leaderboards, and improved performance recognition.",

    items: [

        "Added employee Overall Rank tracking.",

        "Added personal 'My Overall Rank' achievement card.",

        "Added Overall Score visibility directly within the Achievements section.",

        "Added employee-focused performance summary dashboard.",

        "Added personalized ranking visibility without requiring Team Lead access.",

        "Improved employee engagement through clearer performance recognition.",

        "Enhanced Top Agent leaderboard presentation.",

        "Improved achievement card layout and ranking visibility.",

        "Redesigned achievement experience to highlight individual performance standing.",

        "Improved employee awareness of overall team placement.",

        "Enhanced visual hierarchy for rankings and performance results.",

        "Improved Achievements page readability and presentation.",

        "Added stronger performance motivation through real-time rank visibility.",

        "Refined achievement dashboard styling and user experience."

    ]
},

{
    version: "2.7.0",

    released: "August 2026",

    title: "🌴 Vacation Request Automation Upgrade",

    summary:
        "Vacation requests have been redesigned with automatic email delivery, per-day request tracking, improved Team Lead approvals, and a streamlined leave management workflow.",

    items: [

        "Added automatic vacation request email delivery to Team Leads.",

        "Employees no longer need to manually copy and paste leave request emails.",

        "Employees no longer need to manually send Outlook leave request emails after submission.",

        "Added automatic leave notification workflow after request submission.",

        "Redesigned vacation request processing for improved approval management.",

        "Vacation requests are now stored individually per requested date.",

        "Each requested leave day now generates its own request record.",

        "Team Leads can now approve, deny, or review leave dates individually.",

        "Improved vacation approval flexibility for multi-day leave requests.",

        "Enhanced vacation request tracking and visibility on the calendar.",

        "Improved Team Lead notification accuracy for pending leave requests.",

        "Improved synchronization between vacation requests and approved leave records.",

        "Improved leave request reliability and data consistency.",

        "Streamlined overall employee and Team Lead leave management experience."

    ]
},


{
    version: "2.6.1",

    released: "August 2026",

    title: "📊 Team Lead Modal Workflow Improvements",

    summary:
        "The Team Lead Employee Performance Modal now provides a smoother stat-entry workflow with automatic refresh behavior, updated performance views, and improved usability after saving employee statistics.",

    items: [

        "Added automatic Performance tab refresh after saving employee stats.",

        "Added automatic return to the Performance tab after successful stat submission.",

        "Added real-time refresh of employee KPI cards after updates.",

        "Added immediate Performance History refresh without reopening the employee profile.",

        "Added automatic modal state restoration after stat entry.",

        "Improved Team Lead stat-entry workflow and navigation.",

        "Reduced repetitive tab switching after updating employee records.",

        "Improved employee performance record visibility immediately after saving.",

        "Enhanced Team Lead productivity during performance management activities.",

        "Minor Team Lead modal stability and usability improvements."

    ]
},

{
    version: "2.6.0",

    released: "August 2026",

    title: "🤖 OCR Quality Analytics Upgrade",

    summary:
        "The OCR engine has been significantly enhanced with Quality Score imports, smarter employee matching, image enhancement, screenshot recognition improvements, and a streamlined review workflow.",

    items: [

        "Added OCR Quality Assurance (QA) screenshot import support.",

        "Added automatic QA report detection.",

        "Added bulk QA score and evaluation count import.",

        "Added automatic extraction of evaluation totals.",

        "Added image enhancement scaling for improved OCR accuracy.",

        "Improved recognition of low-resolution screenshots.",

        "Improved OCR accuracy for top-row employee records.",

        "Improved employee name matching and fuzzy name detection.",

        "Added OCR correction rules for commonly misread employee names.",

        "Improved handling of merged and malformed OCR text.",

        "Improved screenshot processing performance and reliability.",

        "Enhanced OCR review workflow before importing records.",

        "Reduced manual QA entry requirements for Team Leads.",

        "Reduced performance management administrative workload.",

        "Multiple OCR stability improvements and data-quality enhancements."

    ]
},

{
    version: "2.5.0",

    released: "August 2026",

    title: "📸 OCR Attendance Import",

    summary:
        "Team Leads can now import Attendance reports directly from screenshots with automatic employee matching, OCR correction, attendance validation, and bulk database updates.",

    items: [

        "Added Attendance OCR import support.",

        "Added automatic Attendance report detection.",

        "Added Reliability report recognition workflow.",

        "Added bulk Attendance import from screenshots.",

        "Added automatic Attendance percentage extraction.",

        "Added OCR correction for common name recognition issues.",

        "Added intelligent employee matching for merged and malformed OCR names.",

        "Added support for employee name validation before import.",

        "Added import review screen for Attendance records.",

        "Added automatic exclusion of employees not found in the current roster.",

        "Improved OCR matching accuracy for Attendance reports.",

        "Improved handling of OCR-generated percentage formatting errors.",

        "Improved Team Lead productivity by reducing manual Attendance entry.",

        "Reduced Attendance processing time from manual entry to a single screenshot upload.",

        "Additional OCR stability improvements and matching enhancements."

    ]
},

{
    version: "2.4.0",

    released: "August 2026",

    title: "📊 Team Lead Performance Hub",

    summary:
        "Employee performance management has been consolidated into a dedicated Team Lead modal featuring performance tracking, stat management, incentives, coaching notes, and an enhanced dashboard experience.",

    items: [

        "Added dedicated Team Lead Employee Performance Modal.",

        "Added tabbed employee management interface.",

        "Added Performance tab for viewing employee KPI metrics.",

        "Added centralized Performance History view within employee profiles.",

        "Added Add Stats tab for faster performance entry.",

        "Added Team Lead Notes tab for coaching and feedback tracking.",

        "Added Incentives Management tab directly inside the employee profile.",

        "Added support for manual and bulk incentive management from the modal.",

        "Improved employee performance review workflow.",

        "Improved KPI card layout and readability.",

        "Improved modal navigation and organization.",

        "Improved Light Mode and Dark Mode support across Team Lead tools.",

        "Modernized employee performance dashboard styling.",

        "Enhanced performance history accessibility with integrated records view.",

        "Reduced the need to navigate between multiple dashboard sections.",

        "Prepared infrastructure for future in-modal performance chart integration.",

        "Various UI fixes, layout enhancements, and performance optimizations."

    ]
},

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