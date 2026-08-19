
document.addEventListener("DOMContentLoaded", () => {

  FirebaseService.auth.onAuthStateChanged(async (firebaseUser) => {

    if (!firebaseUser) return;

    const email = firebaseUser.email;
    const user = await App.data.getUser(email);

    if (!user) return;

    App.currentUser = user;
    App.currentUserEmail = email;

// ✅ INIT CHART FIRST
App.ui.initPerformanceChart();

const stats = document.getElementById("section-dashboard");

if (user.role === "teamlead") {
  stats?.classList.add("hidden");
}

App.data.users[email] = {
  ...App.data.users[email],
  ...user
};

const members = await App.data.getTeamMembers(user.team);

members.forEach(member => {
  App.data.users[member.email] = {
    ...App.data.users[member.email],
    ...member
  };
});

await App.data.loadStatsFromFirestore();

App.gallery?.init();


// ✅ LOAD DROPDOWN
await App.tl.populateAgentDropdown();

// ✅ update ranking after everything loads
// App.ranking.updateRanking();

// ✅ hide personal stats initially
document.getElementById("section-dashboard")?.classList.add("hidden");

// ✅ hide chart initially
App.ui.hideChart();


// 👑 GOD MODE PANEL
if (user.role === "god") {

  const adminPanel = document.getElementById("admin-panel");

  adminPanel?.classList.remove("hidden");

  // ✅ load password reset requests
  App.admin.loadPasswordRequests();

}


    // ✅ HEADER
    const welcome = document.getElementById("welcome");
    const roleBadge = document.getElementById("role-badge");

    if (welcome) {
      welcome.textContent = `Welcome, ${user.name}`;
    }

if (roleBadge) {
  roleBadge.textContent =
    user.role === "teamlead" ? "Team Lead" : "Employee";
}

App.whatsNew.loadBanner();

    // ✅ VIEWS
    const employeeView = document.getElementById("employee-view");
    const leadView = document.getElementById("lead-view");

    

if (user.role === "teamlead") {

  employeeView?.classList.remove("hidden");

  App.ranking.updateRanking();

  // keep hidden on initial load
  leadView?.classList.add("hidden");

  document.querySelector(".tl-input-panel")
      ?.classList.add("hidden");

  document.getElementById("selected-agent-stats")
  ?.classList.add("hidden");

  await App.tl.loadTeamPerformance();

} else {

  // ✅ Employee sees employee UI
  employeeView?.classList.remove("hidden");

  // ✅ Hide TL stuff
  leadView?.classList.add("hidden");
  document.querySelector(".tl-input-panel")?.classList.add("hidden");

// ✅ EMPLOYEE VIEW
if (App.currentUser?.role === "employee") {

  App.employee.updatePersonalStats(email);

  App.employee.renderEmployeeHistory(email);

  App.employee.loadTLNote();

  App.ui.updatePerformanceChart(email);

  App.incentives.loadEmployeeIncentives(email);

  App.ranking.updateRanking();

  setMetric("QA");
}
}



    // ✅ DEFAULT VIEW STATE
    document.getElementById("ranking-section")?.classList.remove("hidden");
    document.getElementById("bulletin-section")?.classList.add("hidden");
    document.getElementById("performance-chart-section")?.classList.add("hidden");
    document.getElementById("section-dashboard")?.classList.add("hidden");



// ✅ LOAD DATA
App.ui.updatePerformanceChart(email);

// ✅ CLOSE WHAT'S NEW MODAL
document
    .getElementById("close-whats-new")
    ?.addEventListener("click", () => {

        document
            .getElementById("whats-new-modal")
            ?.classList.add("hidden");

});

document
    .getElementById("open-whats-new")
    ?.addEventListener("click", () => {

        App.whatsNew.render();

        document
            .getElementById("whats-new-modal")
            ?.classList.remove("hidden");

});

// ✅ MENU BUTTONS
const menuButtons = document.querySelectorAll(".menu-btn");

    menuButtons.forEach(btn => {
      btn.addEventListener("click", () => {

        menuButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const section = btn.dataset.section;

console.log("SECTION:", section);

const ranking = document.getElementById("ranking-section");
const bulletin = document.getElementById("bulletin-section");
const stats = document.getElementById("section-dashboard");
const leave = document.getElementById("section-leave");
const achievement =
    document.getElementById(
        "section-achievement"
    );

	ranking?.classList.add("hidden");
        bulletin?.classList.add("hidden");
        stats?.classList.add("hidden");
        App.ui.hideChart();
        leave?.classList.add("hidden");
        achievement?.classList.add("hidden");

document
  .getElementById("section-news")
  ?.classList.add("hidden");

document
  .getElementById("section-gallery")
  ?.classList.add("hidden");

        
if (section === "leave") {

  App.leave.initLeaveCalendar();

  if (App.currentUser?.role === "employee") {

    App.vacationRequests.startSelectionMode();

  }

}

        


if (section === "dashboard") {

console.log("📊 PERFORMANCE CLICKED");

  // ✅ EMPLOYEE VIEW
  if (App.currentUser?.role === "employee") {
    stats?.classList.remove("hidden");
ranking?.classList.add("hidden");


App.employee.updatePersonalStats(App.currentUserEmail);
App.employee.renderEmployeeHistory(App.currentUserEmail);
App.employee.loadTLNote();
  }


// ✅ TEAM LEAD VIEW (FIXED)
if (App.currentUser?.role === "teamlead") {

  stats?.classList.add("hidden");
ranking?.classList.add("hidden");


  
  // ✅ ADD THIS BACK
  document.querySelector(".tl-input-panel")?.classList.remove("hidden");


  // ✅ HIDE OTHER SECTIONS
document.getElementById("lead-view")?.classList.remove("hidden");

console.log(
  "lead-view hidden?",
  document.getElementById("lead-view")?.classList.contains("hidden")
);

console.log(
  "team-qa-card:",
  document.getElementById("team-qa-card")
);

console.log(
  "team-aht-card:",
  document.getElementById("team-aht-card")
);

console.log(
  "team-attendance-card:",
  document.getElementById("team-attendance-card")
);

console.log(
  "lead-view element:",
  document.getElementById("lead-view")
);

console.log(
  "lead-view height:",
  document.getElementById("lead-view")?.offsetHeight
);


document.getElementById("selected-agent-stats")?.classList.add("hidden");



  // ✅ HIDE CHART
  App.ui.hideChart();

  const select = document.getElementById("agent-select");
  if (select) select.value = "";
}


}
else if (section === "news") {

    App.whatsNew.render();

    document
        .getElementById(
            "whats-new-modal"
        )
        ?.classList.remove("hidden");

} else if (section === "leave") {
          leave?.classList.remove("hidden");

} else if (section === "gallery") {

  const gallery =
    document.getElementById("section-gallery");

  console.log("Gallery clicked");

  console.log(gallery);

  gallery?.classList.remove("hidden");

} else if (section === "achievement") {

  achievement?.classList.remove("hidden");

  console.log(
    "employee-view height:",
    document.getElementById("employee-view")?.offsetHeight
  );

  console.log(
    "achievement height:",
    achievement?.offsetHeight
  );

  App.achievements.load();

}


if (section !== "dashboard") {

  document.getElementById("lead-view")
    ?.classList.add("hidden");

  document.getElementById("selected-agent-stats")
    ?.classList.add("hidden");

  document.getElementById("agent-history")
    ?.classList.add("hidden");

  document.querySelector(".tl-input-panel")
    ?.classList.add("hidden");

  App.ui.hideChart();

}


        console.log("✅ Dashboard loaded for:", email);

      });
    });


  });

});

