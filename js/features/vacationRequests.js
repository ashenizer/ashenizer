window.App = window.App || {};

App.vacationRequests = {};

App.vacationRequests.isSelecting = false;

App.vacationRequests.selectedDates = [];

App.vacationRequests.startSelectionMode = function () {

    App.vacationRequests.isSelecting = true;

    App.vacationRequests.selectedDates = [];

    console.log("🌴 Vacation selection started");

};

App.vacationRequests.toggleDate = function (dateKey) {

    const dates = App.vacationRequests.selectedDates;

    const existingIndex =
        dates.indexOf(dateKey);

    if (existingIndex >= 0) {

        dates.splice(existingIndex, 1);

        console.log(
            "➖ Removed:",
            dateKey
        );

    } else {

        dates.push(dateKey);

        console.log(
            "✅ Added:",
            dateKey
        );

    }

    console.log(
        "Current Selection:",
        dates
    );



App.leave.renderCalendar();


};

App.vacationRequests.openRequestModal =
function(dateKey) {

    App.vacationRequests.currentDate =
        dateKey;

    const modal =
        document.getElementById(
            "leave-request-modal"
        );

    modal.classList.remove("hidden");

const [year, month, day] =
    dateKey.split("-").map(Number);

const prettyDate =
    new Date(
        year,
        month - 1,
        day
    ).toLocaleDateString(
        "en-US",
        {
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );

document.getElementById(
    "request-selected-date"
).textContent =
    `🌸 Selected Date • ${prettyDate}`;

    document.getElementById(
        "leave-date-1"
    ).value = dateKey;

    document.getElementById(
        "leave-date-2"
    ).value = "";

    document.getElementById(
        "leave-date-3"
    ).value = "";

};

App.vacationRequests.submitRequest =
async function() {

console.log("🚀 submitRequest fired");

    try {

        const dates = [

            document.getElementById(
                "leave-date-1"
            ).value,

            document.getElementById(
                "leave-date-2"
            ).value,

            document.getElementById(
                "leave-date-3"
            ).value,

            document.getElementById(
                "leave-date-4"
            )?.value,

            document.getElementById(
                "leave-date-5"
            )?.value

        ].filter(Boolean);

        const reason =
            document.getElementById(
                "extra-days-reason"
            )?.value || "";

console.log("Vacation Request Data", {
    employeeId: App.currentUser.email,
    employeeName: App.currentUser.name,
    dates,
    reason
});

const docRef =
    await FirebaseService.db
        .collection("vacationRequests")
        .add({



                employeeId:
                     App.currentUser.name,

                employeeName:
                    App.currentUser.name,

                dates,

                reason,

                status:
                    "Requested",

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });

console.log(
    "✅ Saved to Firestore:",
    docRef.id
);


await App.leave.loadRequestedLeaves();


App.vacationRequests.showEmailPreview(
    dates,
    reason
);

// 💖 Clear reason box
document.getElementById(
    "extra-days-reason"
).value = "";

// 💖 Hide extra days section again
document.getElementById(
    "additional-days-section"
)?.classList.add("hidden");

document.getElementById(
    "add-more-days"
).textContent =
    "➕ Add More Days";

document
    .getElementById(
        "leave-request-modal"
    )
    .classList
    .add("hidden");

    } catch (error) {

        console.error(
            "❌ Submit failed",
            error
        );

    }

};

App.vacationRequests.init = function () {

document
    .getElementById("copy-leave-subject")
    ?.addEventListener(
        "click",
        async () => {

            await navigator.clipboard.writeText(
                "TEAM RIA - VL REQUEST"
            );

            document.querySelector(
                "#email-copied-modal h3"
            ).textContent =
                "Subject Copied!";

            document.querySelector(
                "#email-copied-modal p"
            ).textContent =
                "The required Outlook subject line has been copied successfully.";

            document.querySelector(
                ".email-copied-message"
            ).innerHTML = `
                📌 Required Subject

                <br><br>

                <strong>
                    TEAM RIA - VL REQUEST
                </strong>

                <br><br>

                Paste it into the Outlook subject field.
            `;

            document
                .getElementById(
                    "email-copied-modal"
                )
                .classList
                .remove("hidden");

        }
    );

document
    .getElementById(
        "close-email-copied"
    )
    ?.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "email-copied-modal"
                )
                .classList
                .add("hidden");

        }
    );


document
    .getElementById(
        "copy-leave-email"
    )
    ?.addEventListener(
        "click",
        async () => {

            const text =
                document.getElementById(
                    "leave-email-preview"
                ).value;

            await navigator.clipboard.writeText(
                text
            );

            document.querySelector(
                "#email-copied-modal h3"
            ).textContent =
                "Email Copied!";

            document.querySelector(
                "#email-copied-modal p"
            ).textContent =
                "Your leave request email has been copied successfully.";

            document.querySelector(
                ".email-copied-message"
            ).innerHTML = `
                🌸 You're all set!

                <br><br>

                Don't forget to use:

                <br><br>

                <strong>
                    TEAM RIA - VL REQUEST
                </strong>

                <br><br>

                as your Outlook subject line before sending the email.
            `;

            document
                .getElementById(
                    "email-copied-modal"
                )
                .classList
                .remove("hidden");

        }
    );

document
    .getElementById(
        "close-email-preview"
    )
    ?.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "leave-email-modal"
                )
                .classList
                .add("hidden");

        }
    );

document
    .getElementById(
        "close-vacation-alert"
    )
    ?.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "vacation-alert-modal"
                )
                .classList
                .add("hidden");

        }
    );


const monthTitle =
    document.getElementById(
        "leave-month-title"
    );

if (monthTitle) {

monthTitle.textContent =
    "🌸 " +
    new Date().toLocaleString(
        "default",
        {
            month: "long",
            year: "numeric"
        }
    ) +
    " 🌸";

}

    document
        .getElementById(
            "close-request-modal"
        )
        ?.addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "leave-request-modal"
                    )
                    .classList
                    .add("hidden");

            }
        );

document
    .getElementById(
        "add-more-days"
    )
    ?.addEventListener(
        "click",
        () => {

            const section =
                document.getElementById(
                    "additional-days-section"
                );

            const button =
                document.getElementById(
                    "add-more-days"
                );

            section.classList.toggle(
                "hidden"
            );

            if (
                section.classList.contains(
                    "hidden"
                )
            ) {

                button.textContent =
                    "➕ Add More Days";

            } else {

                button.textContent =
                    "➖ Hide Extra Days";

            }

        }
    );

document
    .getElementById("submit-request")
    ?.addEventListener(
        "click",
        App.vacationRequests.submitRequest
    );

};

document.addEventListener(
    "DOMContentLoaded",
    () => {

        App.vacationRequests.init();

    }
);

App.vacationRequests.loadRequests =
async function () {

    const container =
        document.getElementById(
            "vacation-request-list"
        );

    if (!container) return;

    container.innerHTML = "";

    try {

        const snapshot =
            await FirebaseService.db
                .collection(
                    "vacationRequests"
                )
                .get();

        snapshot.forEach(doc => {

            const request =
                doc.data();

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "vacation-request-card";

            card.innerHTML = `
                <h4>${request.employeeName}</h4>

                <p>
                    ${request.dates.join(", ")}
                </p>

                <p>
                    Status:
                    ${request.status}
                </p>
            `;

            container.appendChild(
                card
            );

        });

    } catch (error) {

        console.error(
            "❌ Failed loading requests:",
            error
        );

    }

};

App.leave.loadRequestedLeaves = async function () {

  const snapshot = await FirebaseService.db
    .collection("vacationRequests")
    .where("status", "==", "Requested")
    .get();

  App.leave.requestedLeaves = {};

  snapshot.forEach(doc => {

    const data = doc.data();

    data.dates.forEach(date => {

      if (!App.leave.requestedLeaves[date]) {

        App.leave.requestedLeaves[date] = [];

      }

      App.leave.requestedLeaves[date].push({

        name: data.employeeName,
        status: "Requested"

      });

    });

  });

console.log(
  "✅ Requested Leaves:",
  App.leave.requestedLeaves
);

App.leave.renderCalendar();

App.vacationRequests.showTLAlert();

};


App.vacationRequests.showTLAlert =
async function () {

console.log(
  "🚨 Checking TL alerts"
);

console.log(
  "Current User:",
  App.currentUser
);

    if (
        App.currentUser?.role !==
        "teamlead"
    ) {
        return;
    }

    const snapshot =
        await FirebaseService.db
            .collection(
                "vacationRequests"
            )
            .where(
                "status",
                "==",
                "Requested"
            )
            .get();

    if (snapshot.empty) {
        return;
    }

    const modal =
        document.getElementById(
            "vacation-alert-modal"
        );

    const list =
        document.getElementById(
            "vacation-alert-list"
        );

    list.innerHTML = "";

    snapshot.forEach(doc => {

        const data =
            doc.data();

        list.innerHTML += `
            <div class="request-alert-card">

                <strong>
                    ${data.employeeName}
                </strong>

                <br>

                ${data.dates.join(", ")}

            </div>
        `;

    });

    modal.classList.remove(
        "hidden"
    );

};

App.vacationRequests.showEmailPreview =
function(dates, reason) {

const formattedDates = dates.map(date => {

    const [year, month, day] =
        date.split("-").map(Number);

    return new Date(
        year,
        month - 1,
        day
    ).toLocaleDateString(
        "en-US",
        {
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );

});

    const email = `
Hi TL Ria,

I hope you are doing well.

I would like to formally request leave for the following dates:

${formattedDates.map(
    d => `• ${d}`
).join("\n")}

I will ensure that my responsibilities are managed in advance and that any pending tasks are completed or delegated appropriately before these dates.

Please let me know if this request can be approved or if you would like to discuss it further.

Thank you for your time and consideration.

Dates of leave:
${formattedDates.join(", ")}

Total number of days:
${dates.length} day(s)

Reason (for documentation purposes):
${reason || "Personal Time Off"}

Screenshot of current leave credits:
(Attach screenshot here)
`;

    document.getElementById(
        "leave-email-preview"
    ).value = email;

    document
        .getElementById(
            "leave-email-modal"
        )
        .classList.remove(
            "hidden"
        );
};


