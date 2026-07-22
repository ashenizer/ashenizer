
window.App = window.App || {};
App.ui = App.ui || {};
App.ui.currentAgent = null;




function getStatusBadge(metric, value) {
  
value = parseFloat(value);
if (isNaN(value)) return "";


  if (metric === "QA") {
    return value >= 98 ? "Excellent 🟢" : "Needs Improvement 🔴";
  }


if (metric === "AHT") {
  const { QPB, HCPO } = App.data.targets.AHT;

  if (value <= QPB) return "QPB Level 🟢";
  if (value <= HCPO) return "HCPO Level 🟡";
  return "Above Target 🔴";
}



  if (metric === "Attendance") {
    return value >= 95 ? "Good 🟢" : "Poor 🔴";
  }

  return ""; // ✅ proper fallback
}



function isValidPercent(value) {
  return /^\d{1,3}(\.\d{1,2})?$/.test(value); // allows 95 or 95.25
}



function isValidSeconds(value) {
  return /^\d+$/.test(value); // only numbers
}











// ✅ Trend arrow helper (POLISHED VERSION)
function getTrendArrow(current, previous, metric) {
  if (current == null || previous == null) return "";

  current = parseInt(current);
  previous = parseInt(previous);

if (isNaN(current) || isNaN(previous)) return "";

  let arrow = "";
  let color = "";

  if (metric === "AHT") {
    // LOWER is better
    if (current < previous) {
      arrow = "↓";
      color = "limegreen"; // improvement
    } else if (current > previous) {
      arrow = "↑";
      color = "red"; // worse
    } else {
      arrow = "→";
      color = "gray";
    }
  } else {
    // HIGHER is better
    if (current > previous) {
      arrow = "↑";
      color = "limegreen"; // improvement
    } else if (current < previous) {
      arrow = "↓";
      color = "red"; // worse
    } else {
      arrow = "→";
      color = "gray";
    }
  }

  return `<span style="color:${color}; font-weight:bold; margin-left:5px;">${arrow}</span>`;
}


// ✅ HARD RESET TL VIEW (FULL REFRESH SIMULATION)





// ✅ EXISTING FUNCTION






// ✅ QA






// ✅ Handle file selection

App.theme.apply();
App.theme.syncToggles();
App.theme.updateLabel();
App.theme.setupProfileToggle();
App.header.init();
App.profile.init();
App.leave.init();

setTimeout(() => {

  App.vacationRequests
    ?.showTLAlert?.();

}, 3000);
  

const toggleBtn = document.getElementById("toggleRegisterPanel");
const registerBody = document.getElementById("register-body");

toggleBtn?.addEventListener("click", () => {
  registerBody.classList.toggle("open");

  const isOpen = registerBody.classList.contains("open");

  toggleBtn.classList.toggle("active", isOpen);
  toggleBtn.textContent = isOpen ? "−" : "+";
});


document
  .getElementById("registerEmployee")
  ?.addEventListener("click", App.tl.registerEmployee);

document
  .getElementById("save-stats-btn")
  ?.addEventListener("click", App.tl.saveEmployeeStats);


// ✅ Set default chart title for logged-in user




const currentEmail = App.currentUserEmail;

if (currentEmail) {
  const userName = App.data.users[currentEmail]?.name;

  if (userName) {
    App.ui.setDefaultChartTitle(userName);
  }
}

App.tl.handleAgentSelection();

window.App = window.App || {};
window.App.ui = window.App.ui || {};

