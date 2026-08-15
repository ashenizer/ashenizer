window.App = window.App || {};
App.ui = App.ui || {};

App.ui.initPerformanceChart = function () {
  const ctx = document.getElementById("performanceChart");
  if (!ctx) return;

  if (App.ui.performanceChart) {
    App.ui.performanceChart.destroy();
  }

  App.ui.performanceChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        
{
  label: "QA Score",
  data: [],
  borderColor: "rgb(59,130,246)",
  backgroundColor: "rgba(59,130,246,0.3)",
  borderWidth: 2,
  tension: 0.4,
  pointRadius: 5,
  pointHoverRadius: 8,
  pointHoverBorderWidth: 3
}
,
       
        {
          label: "Team Average",
          data: [],
          borderColor: "rgb(34,197,94)",
          backgroundColor: "rgba(34,197,94,0.3)",
          borderWidth: 2,
          borderDash: [6, 6]
        }
      ]
    },
    
plugins: {
  legend: { position: "top" },

  tooltip: {
    callbacks: {
      label: function(context) {

        const index = context.dataIndex;
        const email = App.ui.currentAgent || App.currentUserEmail;

        const history = App.data.statsStore[email]?.history || [];
        const entry = history[index];

        

const count =
  App.ui.chartMode === "monthly"
    ? "—"
    : (entry?.QA_Disability_Count ?? 0) +
      (entry?.QA_Commercial_Count ?? 0);



        
const unit =
  App.ui.metric === "AHT" ? "s" : "%";

return `${context.dataset.label}: ${context.raw}${unit} (Count: ${count})`;

      }
    }
  }
}

  });
};





// ✅ Chart mode state
App.ui.chartMode = "daily";
App.ui.metric = "QA";

// ✅ DAILY DATA
App.ui.getDailyData = function(agentEmail) {
  
const history = [...(App.data.statsStore[agentEmail]?.history || [])]
  .sort((a, b) => new Date(a.date) - new Date(b.date));



  const labels = history.map(e => e.date);
  

let agentDis = [];
let agentCom = [];



agentDis = history.map(e => {
  const val = e[App.ui.metric];
  return val != null ? parseFloat(val) : null;
});

agentCom = []; // no second line anymore



  const teamData = labels.map(date => {
    let total = 0;
    let count = 0;

    for (let email in App.data.statsStore) {
      const entry = App.data.statsStore[email]?.history
        ?.find(h => h.date === date);

      if (entry) {
        total += parseInt(entry[App.ui.metric]);
        count++;
      }
    }

    return count ? Math.round(total / count) : null;
  });

  return { labels, agentDis, agentCom, teamData };
};

// ✅ MONTHLY DATA
App.ui.getMonthlyData = function(agentEmail) {
  
const history = [...(App.data.statsStore[agentEmail]?.history || [])]
  .sort((a, b) => new Date(a.date) - new Date(b.date));

  const monthly = {};

  
history.forEach(e => {
  const month = e.date.slice(0, 7);

  if (!monthly[month]) {
    monthly[month] = { total: 0, count: 0 };
  }

  const val = e[App.ui.metric];

  if (val != null && !isNaN(val)) {
    monthly[month].total += parseFloat(val); // ✅ FIX
    monthly[month].count++;
  }
});


  const labels = Object.keys(monthly).sort();

  const agentData = labels.map(m =>
    Math.round(monthly[m].total / monthly[m].count)
  );

  const teamData = labels.map(month => {
    let total = 0, count = 0;

    for (let email in App.data.statsStore) {
      
const history = [...(App.data.statsStore[email]?.history || [])]
  .sort((a, b) => new Date(a.date) - new Date(b.date));


      history
        .filter(h => h.date.startsWith(month))
        .forEach(e => {
          
const val = e[App.ui.metric];
if (val != null && !isNaN(val)) {
  total += parseFloat(val);
  count++;
}


        });
    }

    return count ? Math.round(total / count) : null;
  });

  return { labels, agentData, teamData };
};



// ===============================
// Update Performance Chart
// ===============================



App.ui.updatePerformanceChart = function(
    agentEmail,
    chart = App.ui.performanceChart
) {

const activeChart =
  chart || App.ui.performanceChart;

if (!activeChart) return;

if (!activeChart) return;
  if (!App.ui.performanceChart) return;

  const isYTD = App.ui.currentChartTab === "ytd";

  let data;

 
if (isYTD) {
  // ✅ FORCE monthly for YTD
  data = App.ui.getMonthlyData(agentEmail);
} else {
  if (App.ui.chartMode === "monthly") {
    data = App.ui.getMonthlyData(agentEmail);
  } else {
    data = App.ui.getDailyData(agentEmail);
  }
}


  if (!data) return;

  // ✅ CHANGE CHART TYPE (LINE / BAR)
  const newType = App.ui.chartMode === "monthly" ? "bar" : "line";

  if (activeChart.config.type !== newType) {
    activeChart.config.type = newType;
  }

  // ✅ APPLY DATA
  activeChart.data.labels = data.labels;


// ✅ ✅ DYNAMIC LABEL (🔥 ADD THIS HERE)
activeChart.data.datasets[0].label =
  App.ui.metric === "AHT"
    ? "AHT"
    : App.ui.metric === "Attendance"
    ? "Attendance"
    : "QA Score";

// ✅ optional: team label
App.ui.performanceChart.data.datasets[1].label =
  "Team Avg (" + App.ui.metric + ")";


if (App.ui.currentChartTab === "ytd") {

  App.ui.performanceChart.data.datasets[0].label =
    "Year-to-Date " + App.ui.metric;

  App.ui.performanceChart.data.datasets[1].label =
    "Team YTD Avg (" + App.ui.metric + ")";
}



// ✅ HARD RESET (prevents ghost rendering bug)
App.ui.performanceChart.update();

 


const user = App.data.users[agentEmail];

// ✅ HYBRID (2 lines)

// ✅ ONLY split lines for QA + hybrid





const combined =
  App.ui.chartMode === "monthly"
    ? data.agentData
    : data.agentDis;


  const colors = combined.map(v => getColor(v, App.ui.metric));

  App.ui.performanceChart.data.datasets[0].data = combined;
  App.ui.performanceChart.data.datasets[0].backgroundColor = colors;




// ✅ FIX LINE COLOR PER SEGMENT (IMPORTANT)
App.ui.performanceChart.data.datasets[0].segment = {
  borderColor: ctx => {
    const value = ctx.p1.parsed.y;

    if (App.ui.metric === "QA") {
      return value >= 98 ? "rgba(34,197,94,1)" : "rgba(239,68,68,1)";
    }

    if (App.ui.metric === "Attendance") {
      return value >= 95 ? "rgba(34,197,94,1)" : "rgba(239,68,68,1)";
    }

    if (App.ui.metric === "AHT") {
      return value <= 320 ? "rgba(34,197,94,1)" : "rgba(239,68,68,1)";
    }

    return "rgba(37,99,235,1)";
  }
};





App.ui.performanceChart.data.datasets[0].pointBackgroundColor =
  combined.map(v => getColor(v, App.ui.metric))






// ✅ Build TEAM colors (same logic as agent)
const teamColors = data.teamData.map(value => {

  if (value === null) return "rgba(156,163,175,0.4)"; // gray for missing

  if (App.ui.metric === "QA") {
    return value >= 98
      ? "rgba(34,197,94,0.7)"   // ✅ green
      : "rgba(239,68,68,0.7)";  // ❌ red
  }

  if (App.ui.metric === "Attendance") {
    return value >= 95
      ? "rgba(34,197,94,0.7)"
      : "rgba(239,68,68,0.7)";
  }

  if (App.ui.metric === "AHT") {
    return value <= 320
      ? "rgba(34,197,94,0.7)"
      : "rgba(239,68,68,0.7)";
  }

  return "rgba(107,114,128,0.7)"; // fallback gray
});

// ✅ APPLY TEAM DATA + COLORS
App.ui.performanceChart.data.datasets[1].data = data.teamData;
App.ui.performanceChart.data.datasets[1].backgroundColor = teamColors;
App.ui.performanceChart.data.datasets[1].pointBackgroundColor = teamColors;

// ✅ Add dynamic border color too
App.ui.performanceChart.data.datasets[1].borderColor = (ctx) => {
  const index = ctx.p0DataIndex;
  const value = data.teamData[index];

  if (value === null) return "rgba(156,163,175,1)";

  if (App.ui.metric === "QA") {
    return value >= 98 ? "rgba(34,197,94,1)" : "rgba(239,68,68,1)";
  }

  if (App.ui.metric === "Attendance") {
    return value >= 95 ? "rgba(34,197,94,1)" : "rgba(239,68,68,1)";
  }

  if (App.ui.metric === "AHT") {
    return value <= 320 ? "rgba(34,197,94,1)" : "rgba(239,68,68,1)";
  }

  return "rgba(107,114,128,1)";
};

// ✅ Fix segment color for line chart
App.ui.performanceChart.data.datasets[1].segment = {
  borderColor: ctx => {
    const value = ctx.p1.parsed.y;

    if (value === null) return "rgba(156,163,175,1)";

    if (App.ui.metric === "QA") {
      return value >= 98 ? "rgba(34,197,94,1)" : "rgba(239,68,68,1)";
    }

    if (App.ui.metric === "Attendance") {
      return value >= 95 ? "rgba(34,197,94,1)" : "rgba(239,68,68,1)";
    }

    if (App.ui.metric === "AHT") {
      return value <= 320 ? "rgba(34,197,94,1)" : "rgba(239,68,68,1)";
    }

    return "rgba(107,114,128,1)";
  }
};


  // ✅ FIX Y-AXIS BASED ON METRIC
  if (App.ui.metric === "AHT") {
    App.ui.performanceChart.options.scales.y.max = 1500;
  } else {
    App.ui.performanceChart.options.scales.y.max = 100;
  }

  App.ui.performanceChart.update("active");
};

// ✅ METRIC TOGGLE
const btnQA = document.getElementById("metric-qa");
const btnAHT = document.getElementById("metric-aht");
const btnATT = document.getElementById("metric-att");

function setMetric(metric) {
  App.ui.metric = metric;

  btnQA?.classList.toggle("active", metric === "QA");
  btnAHT?.classList.toggle("active", metric === "AHT");
  btnATT?.classList.toggle("active", metric === "Attendance");

  const email =
    App.ui.currentAgent || App.currentUserEmail;

  if (email) {
    App.ui.updatePerformanceChart(email);
  }
}

btnQA?.addEventListener("click", () => setMetric("QA"));
btnAHT?.addEventListener("click", () => setMetric("AHT"));
btnATT?.addEventListener("click", () => setMetric("Attendance"));

const btnDaily = document.getElementById("toggle-daily");
const btnMonthly = document.getElementById("toggle-monthly");

function setChartMode(mode) {
  App.ui.chartMode = mode;

  btnDaily?.classList.toggle("active", mode === "daily");
  btnMonthly?.classList.toggle("active", mode === "monthly");

  const email =
    App.ui.currentAgent || App.currentUserEmail;

  if (email) {
    App.ui.updatePerformanceChart(email);
  }
}

btnDaily?.addEventListener("click", () => setChartMode("daily"));
btnMonthly?.addEventListener("click", () => setChartMode("monthly"));

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {

    document
      .querySelectorAll(".tab-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    App.ui.currentChartTab = btn.dataset.tab;

    const email =
      App.ui.currentAgent || App.currentUserEmail;

    if (email) {
      App.ui.updatePerformanceChart(email);
    }
  });
});

// ✅ Reusable color logic (CLEAN VERSION)
function getColor(value, metric) {
  if (value == null) return "rgba(156,163,175,0.6)";

  if (metric === "QA") {
    return value >= 98
      ? "rgba(34,197,94,0.7)"   // green
      : "rgba(239,68,68,0.7)";  // red
  }

  if (metric === "Attendance") {
    return value >= 95
      ? "rgba(34,197,94,0.7)"
      : "rgba(239,68,68,0.7)";
  }

  if (metric === "AHT") {
    return value <= 320
      ? "rgba(34,197,94,0.7)"
      : "rgba(239,68,68,0.7)";
  }

  return "rgba(107,114,128,0.7)";
}

App.ui.showChart = function() {
  document
    .getElementById("performance-chart-section")
    ?.classList.remove("hidden");
};

App.ui.hideChart = function() {
  document
    .getElementById("performance-chart-section")
    ?.classList.add("hidden");
};

App.ui.updateChartTitle = function(agentName) {

  const chartTitle =
    document.getElementById("chart-title");

  if (!chartTitle) return;

  chartTitle.textContent =
    App.ui.currentChartTab === "ytd"
      ? `${agentName} - Year-to-Date`
      : `${agentName} - Monthly Performance`;
};

App.ui.setDefaultChartTitle = function(userName) {

  const chartTitle =
    document.getElementById("chart-title");

  if (!chartTitle) return;

  chartTitle.textContent =
    `${userName} vs Team Performance`;
};

App.ui.resetChart = function() {

  if (!App.ui.performanceChart) return;

  App.ui.performanceChart.data.labels = [];

  App.ui.performanceChart.data.datasets.forEach(ds => {
    ds.data = [];
  });

  App.ui.performanceChart.update();
};

App.ui.initTLPerformanceChart = function () {

  const canvas =
    document.getElementById(
      "tl-performance-chart"
    );

  if (!canvas) return;

  if (App.ui.tlPerformanceChart) {
    App.ui.tlPerformanceChart.destroy();
  }

  App.ui.tlPerformanceChart =
    new Chart(canvas, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "QA Score",
            data: [],
            borderWidth: 2,
            tension: 0.4
          },
          {
            label: "Team Avg",
            data: [],
            borderWidth: 2,
            borderDash: [6, 6]
          }
        ]
      }
    });

};

