window.App = window.App || {};

App.vacationRequests = {};

App.vacationRequests.leaveScreenshot = null;

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

for (const date of dates) {

    const docRef =
        await FirebaseService.db
            .collection("vacationRequests")
            .add({

employeeId:
    App.currentUser.email ||
    App.currentUser.username ||
    App.currentUser.name,

                employeeName:
                    App.currentUser.name,

                date,

                reason,

                status:
                    "Requested",

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });

    console.log(
        "✅ Saved Request:",
        docRef.id,
        date
    );
}


await App.leave.loadRequestedLeaves();

try {

App.vacationRequests.pendingDates =
    dates;

App.vacationRequests.pendingReason =
    reason;

document
    .getElementById(
        "leave-screenshot-modal"
    )
    .classList
    .remove("hidden");

console.log(
    "📸 Waiting for screenshot upload"
);


} catch (error) {

    console.error(
        "❌ Email failed:",
        error
    );

    alert(
        "Leave request saved, but email notification failed."
    );

}

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


const dropzone =
    document.getElementById(
        "leave-screenshot-dropzone"
    );

const preview =
    document.getElementById(
        "leave-screenshot-preview"
    );

document
    .getElementById(
        "save-leave-notifications"
    )
    ?.addEventListener(
        "click",
        async () => {

            const cards =
                document.querySelectorAll(
                    "#leave-notification-list .request-alert-card"
                );

            for (const card of cards) {

                const id =
                    card.dataset.id;

                const status =
                    card.querySelector(
                        ".vacation-status-select"
                    ).value;

                const requestDoc =
                    await FirebaseService.db
                        .collection(
                            "vacationRequests"
                        )
                        .doc(id)
                        .get();

                if (!requestDoc.exists) {
                    continue;
                }

                const requestData =
                    requestDoc.data();

                await FirebaseService.db
                    .collection(
                        "vacationRequests"
                    )
                    .doc(id)
                    .delete();

                const date =
    requestData.date;

const existingLeave =
    await FirebaseService.db
        .collection(
            "leaveRequests"
        )
        .where(
            "date",
            "==",
            date
        )
        .where(
            "name",
            "==",
            requestData.employeeName
        )
        .get();

if (!existingLeave.empty) {

    await FirebaseService.db
        .collection(
            "leaveRequests"
        )
        .doc(
            existingLeave.docs[0].id
        )
        .update({
            status
        });

} else {

    await FirebaseService.db
        .collection(
            "leaveRequests"
        )
        .add({

            date,

            name:
                requestData.employeeName,

            status

        });

}
}


            document
                .getElementById(
                    "leave-notification-modal"
                )
                .classList
                .add("hidden");

            await App.leave.loadLeaveRequests();

            await App.leave.loadRequestedLeaves();

            await App.vacationRequests
                .loadNotificationRequests();

        }
    );

document
    .getElementById(
        "close-leave-notifications"
    )
    ?.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "leave-notification-modal"
                )
                .classList
                .add("hidden");

        }
    );

document
    .getElementById(
        "leave-notification-btn"
    )
    ?.addEventListener(
        "click",
        App.vacationRequests
            .openNotificationModal
    );

document
    .getElementById(
        "vacation-alert-save"
    )
    ?.addEventListener(
        "click",
        async () => {

            const cards =
                document.querySelectorAll(
                    ".request-alert-card"
                );

for (const card of cards) {

    const id =
        card.dataset.id;

    const status =
        card.querySelector(
            ".vacation-status-select"
        ).value;

    const requestDoc =
        await FirebaseService.db
            .collection(
                "vacationRequests"
            )
            .doc(id)
            .get();

    const requestData =
        requestDoc.data();

await FirebaseService.db
    .collection(
        "vacationRequests"
    )
    .doc(id)
    .delete();


console.log(
  "✅ Vacation request updated:",
  requestData.employeeName,
  requestData.date,
  status
);

const date =
    requestData.date;

const existingLeave =
    await FirebaseService.db
        .collection("leaveRequests")
        .where("date", "==", date)
        .where(
            "name",
            "==",
            requestData.employeeName
        )
        .get();

if (!existingLeave.empty) {

    await FirebaseService.db
        .collection("leaveRequests")
        .doc(
            existingLeave.docs[0].id
        )
        .update({
            status
        });

} else {

    await FirebaseService.db
        .collection("leaveRequests")
        .add({

            date,

            name:
                requestData.employeeName,

            status

        });

}

}

            document
                .getElementById(
                    "vacation-alert-modal"
                )
                .classList.add(
                    "hidden"
                );

            await App.leave.loadRequestedLeaves();
            await App.leave.loadLeaveRequests();

        }
    );

document
    .getElementById(
        "close-leave-success"
    )
    ?.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "leave-success-modal"
                )
                .classList.add(
                    "hidden"
                );

        }
    );

document.addEventListener(
    "paste",
    (event) => {

        const item =
            [...event.clipboardData.items]
            .find(
                item =>
                    item.type.includes(
                        "image"
                    )
            );

        if (!item) return;

        const file =
            item.getAsFile();

        App.vacationRequests
            .leaveScreenshot = file;

        preview.src =
            URL.createObjectURL(file);

        preview.style.display =
            "block";
    }
);

dropzone?.addEventListener(
    "dragover",
    (e) => {
        e.preventDefault();
    }
);

dropzone?.addEventListener(
    "drop",
    (e) => {

        e.preventDefault();

        const file =
            e.dataTransfer.files[0];

        if (!file) return;

        App.vacationRequests
            .leaveScreenshot =
            file;

        preview.src =
            URL.createObjectURL(file);

        preview.style.display =
            "block";
    }
);

dropzone?.addEventListener(
    "click",
    () => {

        document
            .getElementById(
                "leave-screenshot-input"
            )
            .click();

    }
);

document
    .getElementById(
        "leave-screenshot-input"
    )
    ?.addEventListener(
        "change",
        (e) => {

            const file =
                e.target.files[0];

            if (!file) return;

            App.vacationRequests
                .leaveScreenshot =
                file;

            preview.src =
                URL.createObjectURL(file);

            preview.style.display =
                "block";

        }
    );

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
    .getElementById(
        "send-leave-email"
    )
    ?.addEventListener(
        "click",
        async () => {

            if (
                !App.vacationRequests
                    .leaveScreenshot
            ) {

const message =
    document.getElementById(
        "leave-screenshot-message"
    );

message.innerHTML = `
    ❌ Screenshot Required

    <br><br>

    Please upload your leave balance
    screenshot before sending the request.
`;

return;
            }

            try {

                const imageUrl =
                    await App
                    .vacationRequests
                    .uploadLeaveImage(
                        App
                        .vacationRequests
                        .leaveScreenshot
                    );

                await App
                    .vacationRequests
                    .sendEmail(
                        App
                        .vacationRequests
                        .pendingDates,

                        App
                        .vacationRequests
                        .pendingReason,

                        imageUrl
                    );

                // Reset screenshot state

App.vacationRequests.leaveScreenshot =
    null;

preview.src = "";

preview.style.display =
    "none";

// Hide upload modal

document
    .getElementById(
        "leave-screenshot-modal"
    )
    .classList.add(
        "hidden"
    );

// Show success modal

document
    .getElementById(
        "leave-success-modal"
    )
    .classList.remove(
        "hidden"
    );

            } catch(error) {

                console.error(error);

                alert(
                    "❌ Failed to send email."
                );

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
                    ${request.date}
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
    .get();

  App.leave.requestedLeaves = {};

snapshot.forEach(doc => {

    const data = doc.data();

    const date = data.date;

    if (!date) return;

    if (!App.leave.requestedLeaves[date]) {

        App.leave.requestedLeaves[date] = [];

    }

    App.leave.requestedLeaves[date].push({

        id: doc.id,

        name: data.employeeName,

        status: data.status

    });

});

console.log(
  "✅ Requested Leaves:",
  App.leave.requestedLeaves
);

App.leave.renderCalendar();

await App.vacationRequests
    .loadNotificationRequests();

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
    <div
        class="request-alert-card"
        data-id="${doc.id}"
    >

        <strong>
            ${data.employeeName}
        </strong>

        <div class="request-date-label">
            📅 ${data.date || "No Date"}
        </div>

        <select
            class="vacation-status-select"
        >

            <option value="Pending">
                Pending
            </option>

            <option value="Approved">
                Approved
            </option>

            <option value="Denied">
                Denied
            </option>

        </select>

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


App.vacationRequests.sendEmail =
async function (
    dates,
    reason,
    screenshotUrl
) {

return emailjs.send(
    "service_2iqdrlr",
    "template_koed959",
    {
        employee_name:
            App.currentUser.name,

        leave_dates:
            dates.join(", "),

        total_days:
            dates.length,

        reason:
            reason ||
            "Personal Time Off",

        screenshot_url:
            screenshotUrl
    }
);

};

App.vacationRequests.uploadLeaveImage =
async function(file) {

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "upload_preset",
        "profile_upload"
    );

    const response =
        await fetch(
            "https://api.cloudinary.com/v1_1/dbivddinj/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

    const data =
        await response.json();

    return data.secure_url;

};

App.vacationRequests.loadNotificationRequests =
async function() {

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

    const btn =
        document.getElementById(
            "leave-notification-btn"
        );

    const count =
        document.getElementById(
            "leave-notification-count"
        );

if (snapshot.empty) {

    btn?.classList.add("hidden");

    return;
}

btn?.classList.remove("hidden");

count.textContent =
    snapshot.size;
};

App.vacationRequests.openNotificationModal =
async function() {

    const list =
        document.getElementById(
            "leave-notification-list"
        );

    list.innerHTML = "";

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

    snapshot.forEach(doc => {

        const data =
            doc.data();

        list.innerHTML += `

            <div
                class="request-alert-card"
                data-id="${doc.id}"
            >

                <strong>
                    ${data.employeeName}
                </strong>

                <br>

                📅 ${data.date}

                <select
                    class="vacation-status-select"
                >

                    <option value="Pending">
                        Pending
                    </option>

                    <option value="Approved">
                        Approved
                    </option>

                    <option value="Denied">
                        Denied
                    </option>

                </select>

            </div>

        `;

    });

    document
        .getElementById(
            "leave-notification-modal"
        )
        .classList.remove(
            "hidden"
        );

};




