window.App = window.App || {};

App.achievements = {};

App.achievements.getLatestStats = function() {

    const results = [];

    for (const email in App.data.statsStore) {

        const latest =
            App.data.statsStore[email]
            ?.current;

        if (!latest) continue;

        results.push({

            email,

            name:
                App.data.users[email]
                ?.name || email,

            photo:
                App.data.users[email]
                ?.caricature ||

                App.data.users[email]
                ?.profilePic ||

                "default-avatar.png",

            QA:
                parseFloat(latest.QA),

            AHT:
                parseInt(latest.AHT),

            Attendance:
                parseFloat(
                    latest.Attendance
                )

        });

    }

    return results;
};

App.achievements.calculateAHTScore =
function(aht) {

    const target = 188;

    let score =
        (target / aht) * 100;

    return Math.min(
        100,
        score
    );

};

App.achievements.getTopAgents =
function() {

    const users =
        App.achievements
            .getLatestStats()

            .map(user => {

                const ahtScore =
                    App.achievements
                        .calculateAHTScore(
                            user.AHT
                        );

                return {

                    ...user,

                    Overall:
                        (
                            user.QA +
                            user.Attendance +
                            ahtScore
                        ) / 3

                };

            });

    return App.achievements
        .getRankGroups(
            users,
            "Overall"
        );

};


App.achievements.getTopAttendance =
function() {

    const users =
        App.achievements
            .getLatestStats();

    return App.achievements
        .getRankGroups(
            users,
            "Attendance"
        );

};

App.achievements.getTopAHT =
function() {

    const users =
        App.achievements
            .getLatestStats();

    return App.achievements
        .getRankGroups(
            users,
            "AHT",
            true
        );

};

App.achievements.renderRankings =
function(
    containerId,
    list,
    metric
) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) return;

    container.innerHTML = "";

    list.forEach(
        (user, index) => {

            let stat = "";

            if (metric === "QA") {

                stat =
                    `${user.QA}%`;

            } else if (
                metric === "Attendance"
            ) {

                stat =
                    `${user.Attendance}%`;

            } else {

                stat =
                    `${user.AHT}s`;

            }

            container.innerHTML += `
                <div class="achievement-rank">

<img
    src="${user.photo}"
    class="achievement-avatar"
    alt="${user.name}"
>

                    <div>

                        <strong>
                            #${index + 1}
                            ${user.name}
                        </strong>

                        <p>${stat}</p>

                    </div>

                </div>
            `;
        }
    );

};

App.achievements.load =
function() {

    console.log(
        "Achievement data:",
        App.achievements.getLatestStats()
    );

App.achievements
.renderPodium(
    "achievement-top-qa",
    App.achievements.getTopQA(),
    "QA"
);


App.achievements
.renderPodium(
    "achievement-top-agent",
    App.achievements.getTopAgents(),
    "Overall"
);

App.achievements
.renderPodium(
    "achievement-top-aht",
    App.achievements.getTopAHT(),
    "AHT"
);

App.achievements
.renderPodium(
    "achievement-top-att",
    App.achievements.getTopAttendance(),
    "Attendance"
);

App.achievements.renderRankingBoard(
    "ranking-top-agent",
    App.achievements.getTopAgents(),
    "Overall"
);

App.achievements.renderRankingBoard(
    "ranking-top-qa",
    App.achievements.getTopQA(),
    "QA"
);

App.achievements.renderRankingBoard(
    "ranking-top-aht",
    App.achievements.getTopAHT(),
    "AHT"
);

App.achievements.renderRankingBoard(
    "ranking-top-att",
    App.achievements.getTopAttendance(),
    "Attendance"
);

App.achievements
    .loadEmployeeSummary();

};



App.achievements.getRankGroups = function(users, metric, ascending = false) {

    const values = {};

    users.forEach(user => {

        const value = user[metric];

        if (!values[value]) {
            values[value] = [];
        }

        values[value].push(user);

    });

    const sortedValues =
        Object.keys(values)
            .map(Number)
            .sort((a, b) =>
                ascending
                    ? a - b
                    : b - a
            );

    return sortedValues
        .slice(0, 3)
        .map((value, index) => ({

            rank: index + 1,

            value,

            users: values[value]

        }));

};

App.achievements.renderGroupedRanks =
function (
    containerId,
    groups,
    metric
) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) return;

    container.innerHTML = "";

    groups.forEach(group => {

        const medal =
            group.rank === 1
                ? "🥇"
                : group.rank === 2
                ? "🥈"
                : "🥉";

const usersHtml =
    group.users.map(user => `

        <img
            src="${user.photo}"
            class="achievement-avatar"
            alt="${user.name}"
        >

    `).join("");

        let valueText = "";

if (
    metric === "Attendance" ||
    metric === "QA"
) {

valueText =
    `${Number(group.value).toFixed(2)}%`;

} else if (
            metric === "AHT"
        ) {

            valueText =
                `${group.value}s`;

} else {

    valueText =
        `${group.value.toFixed(2)}%`;

}

        container.innerHTML += `

            <div class="achievement-group">

                <div class="achievement-medal">
                    ${medal}
                    Rank ${group.rank}
                </div>

                <div class="achievement-avatar-row">
                    ${usersHtml}
                </div>

                <div class="achievement-score">
                    ${valueText}
                </div>

            </div>
        `;
    });

};

App.achievements.getTopQA =
function() {

    const users =
        App.achievements
            .getLatestStats();

    return App.achievements
        .getRankGroups(
            users,
            "QA"
        );

};


App.achievements.renderPodium =
function (
    containerId,
    groups,
    metric
) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) return;

    container.innerHTML = "";

    const rank1 = groups[0];
    const rank2 = groups[1];
    const rank3 = groups[2];

    const buildGroup = group => {

        if (!group) return "";

const usersHtml =
    group.users.map(user => `

        <img
            src="${user.photo}"
            class="achievement-avatar"
            alt="${user.name}"
        >

    `).join("");

        let valueText = "";

        if (
            metric === "QA" ||
            metric === "Attendance"
        ) {

valueText =
    `${Number(group.value).toFixed(2)}%`;

        }
        else if (
            metric === "AHT"
        ) {

            valueText =
                `${group.value}s`;

        }
        else {

            valueText =
                `${group.value.toFixed(2)}%`;

        }

        return `
            <div class="achievement-group">

                <div class="achievement-medal">
                    ${group.rank === 1 ? "🥇" :
                      group.rank === 2 ? "🥈" : "🥉"}
                    Rank ${group.rank}
                </div>

                <div class="achievement-avatar-row">
                    ${usersHtml}
                </div>

                <div class="achievement-score">
                    ${valueText}
                </div>

            </div>
        `;
    };

    container.innerHTML = `

        <div class="achievement-podium">

            <div class="achievement-podium-top">
                ${buildGroup(rank1)}
            </div>

            <div class="achievement-podium-bottom">
                ${buildGroup(rank2)}
                ${buildGroup(rank3)}
            </div>

        </div>

    `;
};

App.achievements.renderRankingBoard =
function (
    containerId,
    groups,
    metric
) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) return;

    container.innerHTML = "";

    groups.forEach(group => {

        const medal =
            group.rank === 1 ? "🥇" :
            group.rank === 2 ? "🥈" :
            "🥉";

        let valueText = "";

        if (
            metric === "QA" ||
            metric === "Attendance"
        ) {

            valueText =
                `${Number(group.value).toFixed(2)}%`;

        } else if (
            metric === "AHT"
        ) {

            valueText =
                `${group.value}s`;

        } else {

            valueText =
                `${group.value.toFixed(2)}%`;

        }

        const usersHtml =
            group.users.map(user => `

                <div class="ranking-user">

                    <img
                        src="${user.photo}"
                        class="achievement-avatar"
                        altiv>

                </div>

            `).join("");

        container.innerHTML += `

            <div class="ranking-tier">

                <div class="ranking-medal">
                    ${medal} Rank ${group.rank}
                </div>

                <div class="ranking-users">
                    ${usersHtml}
                </div>

                <div class="ranking-score">
                    ${valueText}
                </div>

            </div>

        `;

    });

};

App.achievements.renderRankingBoard =
function (
    containerId,
    groups,
    metric
) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) return;

    container.innerHTML = "";

    groups.forEach(group => {

        const medal =
            group.rank === 1
                ? "🥇"
                : group.rank === 2
                ? "🥈"
                : "🥉";

        let valueText = "";

        if (
            metric === "QA" ||
            metric === "Attendance"
        ) {

            valueText =
                `${Number(group.value).toFixed(2)}%`;

        } else if (
            metric === "AHT"
        ) {

            valueText =
                `${group.value}s`;

        } else {

            valueText =
                `${group.value.toFixed(2)}%`;

        }

        const usersHtml =
            group.users.map(user => `

                <div class="ranking-row">

                    <span>
                        ${user.name}
                    </span>

                    <span>
                        ${valueText}
                    </span>

                </div>

            `).join("");

        container.innerHTML += `

            <div class="ranking-tier">

                <div class="ranking-medal">
                    ${medal} Rank ${group.rank}
                </div>

                ${usersHtml}

            </div>

        `;
    });

};

App.achievements.getOverallRanking =
function(email) {

    const users =
        App.achievements
            .getLatestStats()
            .map(user => {

                const ahtScore =
                    App.achievements
                        .calculateAHTScore(
                            user.AHT
                        );

                return {

                    ...user,

                    Overall:
                        (
                            user.QA +
                            user.Attendance +
                            ahtScore
                        ) / 3

                };

            });

    users.sort(
        (a, b) =>
            b.Overall - a.Overall
    );

    const rank =
        users.findIndex(
            user =>
                user.email === email
        ) + 1;

    const employee =
        users.find(
            user =>
                user.email === email
        );

    return {

        rank,

        total:
            users.length,

        overall:
            employee
                ?.Overall || 0

    };

};

App.achievements.loadEmployeeSummary =
function() {

console.log(
    "Current user:",
    App.auth.currentUser
);

const email =
    App.currentUserEmail;

    if (!email) return;

    const users =
        App.achievements
            .getLatestStats()
            .map(user => {

                const ahtScore =
                    App.achievements
                        .calculateAHTScore(
                            user.AHT
                        );

                return {

                    ...user,

                    Overall:
                        (
                            user.QA +
                            user.Attendance +
                            ahtScore
                        ) / 3

                };

            });

    users.sort(
        (a, b) =>
            b.Overall - a.Overall
    );

console.log(
    "Stats users:",
    users
);

    const index =
        users.findIndex(
            user =>
                user.email === email
        );

    if (index === -1) return;

    const currentUser =
        users[index];

    document.getElementById(
        "employee-current-rank"
    ).textContent =
        `#${index + 1}`;

    document.getElementById(
        "employee-overall-score"
    ).textContent =
        `${currentUser.Overall.toFixed(2)}%`;

};