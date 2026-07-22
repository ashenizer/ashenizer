window.App = window.App || {};
App.ranking = App.ranking || {};



App.ranking.populateCompareStats = function(topEmail) {

const youQa = document.getElementById("you-qa");
const youAht = document.getElementById("you-aht");
const youAtt = document.getElementById("you-att");

const topQa = document.getElementById("top-qa");
const topAht = document.getElementById("top-aht");
const topAtt = document.getElementById("top-att");

if (
  !youQa ||
  !youAht ||
  !youAtt ||
  !topQa ||
  !topAht ||
  !topAtt
) {
  console.warn("Ranking UI not ready");
  return;
}
  const userEmail = App.currentUserEmail;

  const you = App.data.statsStore[userEmail]?.current;
  const top = App.data.statsStore[topEmail]?.current;

  if (!you || !top) return;

  // ✅ YOU
  youQa.textContent = (you.QA ?? "--") + "%";
  document.getElementById("you-aht").textContent = (you.AHT ?? "--") + "s";
  document.getElementById("you-att").textContent =
    (you.Attendance ?? "--") + "%";

  // ✅ TOP AGENT
  document.getElementById("top-qa").textContent = (top.QA ?? "--") + "%";
  document.getElementById("top-aht").textContent = (top.AHT ?? "--") + "s";
  document.getElementById("top-att").textContent =
    (top.Attendance ?? "--") + "%";
}

App.ranking.renderRank = function(containerId, winners, users) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  if (!winners || winners.length === 0) return;

  // ✅ SINGLE WINNER
  if (winners.length === 1) {
    const email = winners[0];

    const img = document.createElement("img");
    img.src =
      users[email]?.caricature ||
      users[email]?.profilePic ||
      "https://via.placeholder.com/100";

    img.className = "rank-img";

    container.appendChild(img);
  }

  // ✅ MULTIPLE WINNERS
  else {
    const stack = document.createElement("div");
    stack.className = "avatar-stack";

    const row1 = winners.slice(0, 1);
    const row2 = winners.slice(1, 3);
    const row3 = winners.slice(3, 6);

    const buildRow = (list) => {
      const row = document.createElement("div");
      row.className = "avatar-row";

      list.forEach(email => {
        const img = document.createElement("img");

        img.src =
          users[email]?.caricature ||
          users[email]?.profilePic ||
          "https://via.placeholder.com/100";

        img.className = "avatar";

        row.appendChild(img);
      });

      return row;
    };

    stack.appendChild(buildRow(row1));
    stack.appendChild(buildRow(row2));
    stack.appendChild(buildRow(row3));

    container.appendChild(stack);
  }
}

App.ranking.updateRanking = function () {
  const users = App.data.users;
  const statsStore = App.data.statsStore;

  const getName = (email) =>
    users[email]?.name || email;

  let bestOverall = null;

let bestQA = [];
let bestAHT = null; // keep single
let bestAttendance = [];

let maxQA = 0;
let minAHT = Infinity;
let maxAtt = 0;


  // ✅ FIND BEST VALUES
  for (let email in statsStore) {
    const history = statsStore[email]?.history;
    if (!history || history.length === 0) continue;

    const sorted = [...history].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    
let latest = statsStore[email]?.current;

// ✅ FALLBACK if current is missing
if (!latest) {
  const history = statsStore[email]?.history || [];
  latest = history[history.length - 1];
}

if (!latest) continue;


    
const qa = parseFloat(
  latest?.QA !== undefined && latest?.QA !== null
    ? String(latest.QA).replace("%", "")
    : ""
);

    const aht = parseInt(latest.AHT);
    const att = parseInt(latest.Attendance);

   
if (qa > maxQA) {
  maxQA = qa;
  bestQA = [email]; // RESET list
} else if (qa === maxQA) {
  bestQA.push(email); // ADD tie
}


    if (aht < minAHT) {
      minAHT = aht;
      bestAHT = email;
    }

    
if (att > maxAtt) {
  maxAtt = att;
  bestAttendance = [email];
} else if (att === maxAtt) {
  bestAttendance.push(email);
}

  }

  // ✅ BEST OVERALL
  let bestScore = -1;

  for (let email in statsStore) {
    const history = statsStore[email]?.history;
    if (!history || history.length === 0) continue;

    const sorted = [...history].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    
let latest = statsStore[email]?.current;

// ✅ fallback again
if (!latest) {
  const history = statsStore[email]?.history || [];
  latest = history[history.length - 1];
}

if (!latest) continue;


    


const qa = parseFloat(
  latest?.QA !== undefined && latest?.QA !== null
    ? String(latest.QA).replace("%", "")
    : ""
);



    const aht = parseInt(latest.AHT);
    const att = parseInt(latest.Attendance);

    const score = qa + att - (aht / 10);

    if (score > bestScore) {
      bestScore = score;
      bestOverall = email;
    }
  }

  // ✅ TOP PERFORMER
  const r1 = document.getElementById("rank-1-name");
  const r1Img = document.getElementById("rank-1-img");

  if (r1 && bestOverall) {
    r1.textContent = getName(bestOverall);

    
console.log("Top user:", bestOverall);
console.log("Top caricature:", users[bestOverall]?.caricature);
console.log("Top profile:", users[bestOverall]?.profilePic);

const pic =
  (users[bestOverall]?.caricature ||
   users[bestOverall]?.profilePic ||
   "https://via.placeholder.com/100")
  + "?t=" + Date.now();

if (r1Img) {

  console.log("Setting top image:", pic);

  r1Img.src = pic;
}
  }

App.ranking.populateCompareStats(bestOverall);


const tooltip = document.getElementById("compare-tooltip");

const rank1 = document.getElementById("rank-1-img");

if (rank1 && tooltip) {


rank1.addEventListener("mouseenter", () => {

  const userEmail = App.currentUserEmail;
  const topEmail = bestOverall;

  const you = App.data.statsStore[userEmail]?.current;
  const top = App.data.statsStore[topEmail]?.current;

  if (!you || !top) return;

  // ✅ SET IMAGE (NOW WORKS)
  const img = document.getElementById("compare-img");
  img.src =
    App.data.users[topEmail]?.caricature ||
    App.data.users[topEmail]?.profilePic ||
    "https://via.placeholder.com/100";

  // ✅ Populate YOUR stats
  youQa.textContent = (you.QA ?? "--") + "%";
  document.getElementById("you-aht").textContent = (you.AHT ?? "--") + "s";
  document.getElementById("you-att").textContent =
    (you.Attendance ?? "--") + "%";

  // ✅ Populate TOP stats
  document.getElementById("top-qa").textContent = (top.QA ?? "--") + "%";
  document.getElementById("top-aht").textContent = (top.AHT ?? "--") + "s";
  document.getElementById("top-att").textContent =
    (top.Attendance ?? "--") + "%";

  // ✅ SHOW TOOLTIP
  tooltip.style.display = "block";


tooltip.style.left = "50%";
tooltip.style.transform = "translateX(-50%)"

});


}


  
// ✅ QA
const rQA = document.getElementById("rank-qa-name");
const rQAImg = document.getElementById("rank-qa-img");

if (rQA && bestQA.length > 0) {

  const names = bestQA.map(getName).join(", ");
  rQA.textContent = names;

  App.ranking.renderRank("rank-qa-img", bestQA, users);
}


// ✅ AHT
const rAHT = document.getElementById("rank-aht-name");
const rAHTImg = document.getElementById("rank-aht-img");

if (rAHT && bestAHT) {

  const name = getName(bestAHT);
  rAHT.textContent = name;

  if (rAHTImg) {

console.log("Best AHT user:", bestAHT);
console.log("Caricature:", users[bestAHT]?.caricature);
console.log("Profile:", users[bestAHT]?.profilePic);

    const img =
      users[bestAHT]?.caricature ||
      users[bestAHT]?.profilePic ||
      "https://via.placeholder.com/100";

    rAHTImg.src = img;
  }
}



// ✅ Attendance
const rATT = document.getElementById("rank-att-name");
const rATTImg = document.getElementById("rank-att-img");

if (rATT && bestAttendance.length > 0) {

  const names = bestAttendance.map(getName).join(", ");
  rATT.textContent = names;

  App.ranking.renderRank("rank-att-img", bestAttendance, users);
}




};


