
window.App = window.App || {};
App.data = App.data || {};

/**************** DATA ****************/



App.data.targets = {
  QA: 98,
  Attendance: 95,

  AHT: {
    QPB: 312,
    HCPO: 420
  }
};



App.data.users = {
    

"agent@company.com": {
  role: "employee",
  name: "Ralfh Malones",
  password: "1234",
  team: "Team A",
  qaType: "standard"
},


"lead@company.com": {
  role: "teamlead",
  name: "Team Lead Ria",
  password: "1234",
  team: "Team A" // ✅ ADD THIS
}
};



App.data.teams = {
  "Team Ria": {
    lead: "lead@company.com",
    members: [
      "agent@company.com"]

    }
  };





App.data.statsStore = {

"agent2@company.com": {
  history: [],
  current: {}
},

"agent3@company.com": {
  history: [],
  current: {}
},

"agent@company.com": {
  history: [
    {
      date: "2026-05-01",
      QA: 92,
      AHT: 360,
      Attendance: 98
    }
  ],
  current: {}
}

};


App.data.saveUsers = function () {
  localStorage.setItem("users", JSON.stringify(App.data.users));
};


App.data.loadUsers = function () {
  App.data.users = JSON.parse(localStorage.getItem("users")) || {};
};



App.data.saveStats = function () {
  localStorage.setItem("statsStore", JSON.stringify(App.data.statsStore));
};



App.data.saveTeams = function () {
  localStorage.setItem("teams", JSON.stringify(App.data.teams));
};




App.data.loadTeams = function () {
  App.data.teams = JSON.parse(localStorage.getItem("teams")) || {};
};

App.data.loadStats = function () {
  App.data.statsStore = JSON.parse(localStorage.getItem("statsStore")) || {};
};




App.data.initData = function () {

  // ✅ Run only once EVER
  if (localStorage.getItem("app_initialized")) return;

  localStorage.setItem("users", JSON.stringify(App.data.users));
  localStorage.setItem("statsStore", JSON.stringify(App.data.statsStore));
  localStorage.setItem("teams", JSON.stringify(App.data.teams));

  localStorage.setItem("app_initialized", "true");
};



App.data.migrateStats = function () {
  const store = App.data.statsStore;

  for (let email in store) {
    const history = store[email].history || [];

    history.forEach(entry => {
      // Convert QA
      if (typeof entry.QA === "string") {
        entry.QA = parseInt(entry.QA);
      }

      // Convert AHT
      if (typeof entry.AHT === "string") {
        entry.AHT = parseInt(entry.AHT);
      }

      // Convert Attendance
      if (typeof entry.Attendance === "string") {
        entry.Attendance = parseInt(entry.Attendance);
      }
    });
  }

  App.data.saveStats();
};



App.data.saveTeams = function () {
  localStorage.setItem("teams", JSON.stringify(App.data.teams));
};

// ✅ RIGHT AFTER this (or near other data functions)




App.data.calculateMonthlyAverage = function (email, month) {

  const history = App.data.statsStore[email]?.history || [];

  
const filtered = history.filter(e => {
  if (!e.date) return false;
  return e.date.slice(0, 7) === month;
});


  if (filtered.length === 0) return null;



const total = filtered.reduce((acc, entry) => {

  
// ✅ FINAL QA ONLY
const qa = parseFloat(entry.QA);
if (!isNaN(qa)) {
  acc.qa += qa;
  acc.qaCount++;
}


  // ✅ AHT
  const aht = parseInt(entry.AHT);
  if (!isNaN(aht)) {
    acc.aht += aht;
    acc.ahtCount++;
  }

  // ✅ Attendance
  const att = parseFloat(entry.Attendance);
  if (!isNaN(att)) {
    acc.att += att;
    acc.attCount++;
  }

  return acc;

}, { qa: 0, aht: 0, att: 0, qaCount: 0, ahtCount: 0, attCount: 0 });



  

return {
  QA: total.qaCount ? Number(total.qa / total.qaCount).toFixed(2) : null,

  
  AHT: total.ahtCount ? Math.round(total.aht / total.ahtCount) : null,
  
Attendance: total.attCount
  ? Number(total.att / total.attCount).toFixed(2)
  : null

};


};






App.data.getUser = async function (email) {
  try {
    const doc = await FirebaseService.db
      .collection("users")
      .doc(email)
      .get();

    if (!doc.exists) return null;

    return doc.data();

  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};


// ✅ ✅ ADD THIS RIGHT BELOW 👇
App.data.getStats = async function (email) {
  try {
    const snapshot = await FirebaseService.db
      .collection("stats")
      .doc(email)
      .collection("history")
      .get();

    const history = [];

    snapshot.forEach(doc => {
      history.push(doc.data());
    });

    return history;

  } catch (error) {
    console.error("Error loading stats:", error);
    return [];
  }
};



App.data.getTeamMembers = async function (teamName) {
  try {
    const snapshot = await FirebaseService.db
      .collection("users")
      .where("team", "==", teamName)
      .get();

    const members = [];

    snapshot.forEach(doc => {
      members.push({
        email: doc.id,
        ...doc.data()
      });
    });

    return members;

  } catch (error) {
    console.error("Error getting team members:", error);
    return [];
  }
};


App.data.loadStatsFromFirestore = async function () {
  const statsStore = {};

  const usersSnapshot = await FirebaseService.db.collection("stats").get();

  for (const doc of usersSnapshot.docs) {
    const email = doc.id;

    const historySnapshot = await FirebaseService.db
      .collection("stats")
      .doc(email)
      .collection("history")
      .get();

    statsStore[email] = { history: [], current: null };

    
historySnapshot.forEach(h => {
  statsStore[email].history.push({
    ...h.data(),
    id: h.id // ✅ THIS IS THE FIX
  });
});



const sorted = statsStore[email].history.sort(
  (a, b) => new Date(a.date) - new Date(b.date)
);


// ✅ THIS LINE IS MISSING
statsStore[email].current = sorted[sorted.length - 1] || null;


  }

  App.data.statsStore = statsStore;

  console.log("✅ Stats loaded from Firestore:", statsStore);
};




App.data.calculateTeamStats = function () {
  const statsStore = App.data.statsStore;

  let totalQA = 0;
  let totalAHT = 0;
  let totalAtt = 0;

  let qaCount = 0;
  let ahtCount = 0;
  let attCount = 0;

  for (let email in statsStore) {


const latest = statsStore[email]?.current;

if (!latest) continue;


    // ✅ QA
    const qa = parseFloat((latest.QA || "").toString().replace("%", ""));
    if (!isNaN(qa)) {
      totalQA += qa;
      qaCount++;
    }

    // ✅ AHT
    const aht = parseInt(latest.AHT);
    if (!isNaN(aht)) {
      totalAHT += aht;
      ahtCount++;
    }

    // ✅ Attendance ✅ (THIS WAS MISSING)
    const att = parseFloat(latest.Attendance);
    if (!isNaN(att)) {
      totalAtt += att;
      attCount++;
    }
  }

  if (qaCount === 0 && ahtCount === 0 && attCount === 0) return null;

  return {
    qa: qaCount ? (totalQA / qaCount).toFixed(2) + "%" : "—",
    aht: ahtCount ? Math.round(totalAHT / ahtCount) + "s" : "—",
    
attendance: attCount
  ? (totalAtt / attCount).toFixed(2) + "%"
  : "—"

  };
};