
"use strict";

/* ONE Platform — Search, Earn, Projects and Tools */

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const STORAGE = {
  profile: "one_platform_profile_v2",
  activity: "one_platform_activity_v2",
  notes: "one_platform_notes_v2",
  projects: "one_platform_projects_v2"
};

const section = $("#dynamicSection");
const viewContent = $("#viewContent");

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function safeText(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

function activity(title, message) {
  $("#activityTitle").textContent = title;
  $("#activityText").textContent = message;
  write(STORAGE.activity, { title, message });
}

function panel(title, content) {
  return `
    <article class="content-panel">
      <h3>${safeText(title)}</h3>
      ${content}
    </article>`;
}

/* Open actual Google results in a new tab.
   This does not scrape Google or claim to verify results. */

function googleSearch(query, type = "web") {
  const q = String(query || "").trim();

  if (!q) {
    alert("Pehle search mein kuch likho.");
    return;
  }

  const params = new URLSearchParams({ q });

  if (type === "images") params.set("udm", "2");
  if (type === "news") params.set("tbm", "nws");

  const url = "https://www.google.com/search?" + params.toString();

  window.open(url, "_blank", "noopener,noreferrer");
  activity("Search opened", "You opened external search results.");
}

function searchBox(placeholder, buttonLabel, callbackName) {
  return `
    <form class="one-search-form" data-search-form="${callbackName}">
      <label>
        <span class="sr-only">Search query</span>
        <input name="query" required maxlength="300"
          placeholder="${safeText(placeholder)}">
      </label>
      <button class="action-button" type="submit">
        ${safeText(buttonLabel)}
      </button>
    </form>`;
}

/* Navigation */

function showView(name) {
  const views = {
    earn: renderEarn,
    jobs: renderJobs,
    tools: renderTools,
    profile: renderProfile
  };

  if (!views[name]) return goHome();

  ["home", "workspace", "activity"].forEach(id => {
    const el = $("#" + id);
    if (el) el.hidden = true;
  });

  const notice = $(".notice");
  if (notice) notice.hidden = true;

  section.hidden = false;
  viewContent.innerHTML = "";

  $$(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.nav === name);
  });

  views[name]();

  section.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function goHome() {
  section.hidden = true;

  ["home", "workspace", "activity"].forEach(id => {
    const el = $("#" + id);
    if (el) el.hidden = false;
  });

  const notice = $(".notice");
  if (notice) notice.hidden = false;

  $$(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.nav === "home");
  });

  $("#home").scrollIntoView({ behavior: "smooth", block: "start" });
}

function addBackButton() {
  if ($("#oneInternalBack")) return;

  const button = document.createElement("button");
  button.id = "oneInternalBack";
  button.className = "action-button";
  button.textContent = "← Back to ONE";
  button.addEventListener("click", goHome);

  section.insertBefore(button, section.firstChild);
}

/* ONE EARN */

function renderEarn() {
  $("#viewKicker").textContent = "ONE EARN";
  $("#viewTitle").textContent = "Explore opportunities";

  viewContent.innerHTML = `
    ${panel("Find earning opportunities", `
      <p>Search the web for paid work and opportunities. Results are external and have not been verified by ONE.</p>

      ${searchBox("e.g. beginner freelance writing opportunities", "Search web", "earn")}

      <div class="quick-searches">
        <button class="action-button" data-earn-query="beginner freelance projects for students India">Freelance projects</button>
        <button class="action-button" data-earn-query="remote internships India official company careers">Internships</button>
        <button class="action-button" data-earn-query="remote jobs India official employer careers">Remote jobs</button>
        <button class="action-button" data-earn-query="online tutoring opportunities India official websites">Tutoring</button>
        <button class="action-button" data-earn-query="beginner graphic design freelance projects">Design work</button>
        <button class="action-button" data-earn-query="beginner web development freelance projects">Web development</button>
      </div>
    `)}

    ${panel("Search by type", `
      <p>Choose a category to open a targeted web search.</p>
      <div class="quick-searches">
        <button class="action-button" data-earn-query="paid freelance projects India">Paid projects</button>
        <button class="action-button" data-earn-query="part time work opportunities India official employers">Part-time work</button>
        <button class="action-button" data-earn-query="remote internships official company careers India">Internships</button>
        <button class="action-button" data-earn-query="online writing jobs official employer India">Writing jobs</button>
        <button class="action-button" data-earn-query="website development client projects India">Website projects</button>
        <button class="action-button" data-earn-query="government skill training free official India">Skill training</button>
      </div>
    `)}

    ${panel("Create a practice task", `
      <p>Use these activities to build skills. They are practice exercises, not paid jobs.</p>
      <div class="task-item">
        <h4>Write a product description</h4>
        <p>Practise writing a clear description for a fictional product.</p>
        <button class="action-button" data-practice="writing">Start practice</button>
      </div>
      <div class="task-item">
        <h4>Plan a simple website</h4>
        <p>Write down the pages and features your website needs.</p>
        <button class="action-button" data-practice="website">Start practice</button>
      </div>
      <div id="practiceArea"></div>
    `)}

    ${panel("Safety before accepting work", `
      <ul>
        <li>Verify the employer and original listing.</li>
        <li>Never pay a registration fee to obtain a job.</li>
        <li>Do not share passwords, OTPs or bank login details.</li>
        <li>Check payment terms before agreeing to work.</li>
        <li>If you are under 18, follow the service's age rules and involve a trusted adult where needed.</li>
      </ul>
      <p><strong>Important:</strong> ONE does not currently employ people, verify vacancies or process payments.</p>
    `)}
  `;

  addBackButton();
}

function renderPractice(type) {
  const prompts = {
    writing: "Write 2–3 sentences describing a reusable water bottle.",
    website: "List the pages and features for a simple personal portfolio."
  };

  $("#practiceArea").innerHTML = `
    <div class="result-box">
      <p>${safeText(prompts[type])}</p>
      <label for="practiceText">Your answer</label>
      <textarea id="practiceText" maxlength="3000"
        placeholder="Write your practice answer..."></textarea>
      <button class="action-button" id="savePractice">Save locally</button>
      <p id="practiceMessage" aria-live="polite"></p>
    </div>
  `;

  $("#savePractice").addEventListener("click", () => {
    const text = $("#practiceText").value.trim();

    if (!text) {
      $("#practiceMessage").textContent = "Pehle apna answer likho.";
      return;
    }

    const ok = write("one_practice_" + type, text);

    $("#practiceMessage").textContent = ok
      ? "Saved on this device. This is not a paid submission."
      : "Save nahi hua. Browser storage check karo.";

    if (ok) activity("Practice saved", "Your practice answer is stored locally.");
  });
}

/* JOBS AND PROJECTS */

function renderJobs() {
  $("#viewKicker").textContent = "JOBS & PROJECTS";
  $("#viewTitle").textContent = "Find and organize work";

  viewContent.innerHTML = `
    ${panel("Search opportunities", `
      ${searchBox("Search jobs, projects or internships", "Search web", "jobs")}
      <div class="quick-searches">
        <button class="action-button" data-job-query="official company careers India">Company careers</button>
        <button class="action-button" data-job-query="beginner web developer projects India">Web projects</button>
        <button class="action-button" data-job-query="student portfolio project ideas">Portfolio ideas</button>
      </div>
    `)}

    ${panel("Your project planner", `
      <label for="projectName">Project name</label>
      <input id="projectName" maxlength="100" placeholder="My portfolio website">
      <label for="projectGoal">Goal and next step</label>
      <textarea id="projectGoal" maxlength="2000" placeholder="What will you build?"></textarea>
      <button class="action-button" id="saveProject">Save project</button>
      <div id="projectMessage" aria-live="polite"></div>
    `)}

    ${panel("Saved projects", `<div id="savedProjects"></div>`)}
  `;

  addBackButton();
  renderSavedProjects();

  $("#saveProject").addEventListener("click", () => {
    const name = $("#projectName").value.trim();
    const goal = $("#projectGoal").value.trim();

    if (!name || !goal) {
      $("#projectMessage").textContent = "Project name aur goal dono likho.";
      return;
    }

    const projects = read(STORAGE.projects, []);
    const list = Array.isArray(projects) ? projects : [];

    list.push({
      id: Date.now(),
      name,
      goal,
      createdAt: new Date().toISOString()
    });

    const ok = write(STORAGE.projects, list);

    $("#projectMessage").textContent = ok
      ? "Project saved on this device."
      : "Project save nahi ho paya.";

    if (ok) {
      renderSavedProjects();
      activity("Project saved", name);
    }
  });
}

function renderSavedProjects() {
  const container = $("#savedProjects");
  if (!container) return;

  const projects = read(STORAGE.projects, []);

  if (!Array.isArray(projects) || projects.length === 0) {
    container.innerHTML = "<p>No saved projects yet.</p>";
    return;
  }

  container.innerHTML = projects.map(project => `
    <div class="task-item">
      <h4>${safeText(project.name)}</h4>
      <p>${safeText(project.goal)}</p>
      <button class="action-button" data-delete-project="${Number(project.id)}">Delete</button>
    </div>
  `).join("");

  $$("[data-delete-project]", container).forEach(button => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.deleteProject);
      const updated = read(STORAGE.projects, []).filter(p => p.id !== id);

      write(STORAGE.projects, updated);
      renderSavedProjects();
      activity("Project removed", "Your saved project list was updated.");
    });
  });
}

/* TOOLS */

function renderTools() {
  $("#viewKicker").textContent = "ONE TOOLS";
  $("#viewTitle").textContent = "Everyday utilities";

  viewContent.innerHTML = `
    ${panel("Calculator", `
      <label for="numberA">First number</label>
      <input id="numberA" type="number" step="any" placeholder="Enter number">
      <label for="numberB">Second number</label>
      <input id="numberB" type="number" step="any" placeholder="Enter number">
      <label for="operation">Operation</label>
      <select id="operation">
        <option value="add">Addition (+)</option>
        <option value="sub">Subtraction (−)</option>
        <option value="mul">Multiplication (×)</option>
        <option value="div">Division (÷)</option>
      </select>
      <button class="action-button" id="calculate">Calculate</button>
      <div class="result-box" id="calcResult" aria-live="polite">Result appears here.</div>
    `)}

    ${panel("Quick notes", `
      <label for="notes">Your notes</label>
      <textarea id="notes" maxlength="5000" placeholder="Write your ideas..."></textarea>
      <button class="action-button" id="saveNotes">Save notes</button>
      <p id="notesMessage" aria-live="polite"></p>
    `)}

    ${panel("Search helper", `
      <p>Search for information on the web.</p>
      ${searchBox("What do you want to find?", "Search Google", "tools")}
    `)}
  `;

  addBackButton();

  $("#notes").value = read(STORAGE.notes, "");

  $("#saveNotes").addEventListener("click", () => {
    const ok = write(STORAGE.notes, $("#notes").value);
    $("#notesMessage").textContent = ok
      ? "Notes saved on this device."
      : "Could not save notes.";

    if (ok) activity("Notes saved", "Your notes were saved locally.");
  });

  $("#calculate").addEventListener("click", () => {
    const aRaw = $("#numberA").value.trim();
    const bRaw = $("#numberB").value.trim();

    if (!aRaw || !bRaw) {
      $("#calcResult").textContent = "Enter both numbers.";
      return;
    }

    const a = Number(aRaw);
    const b = Number(bRaw);
    let result;

    switch ($("#operation").value) {
      case "add": result = a + b; break;
      case "sub": result = a - b; break;
      case "mul": result = a * b; break;
      case "div":
        if (b === 0) {
          $("#calcResult").textContent = "Cannot divide by zero.";
          return;
        }
        result = a / b;
        break;
    }

    $("#calcResult").textContent = "Result: " + result;
    activity("Calculator used", "You completed a calculation.");
  });
}

/* LOCAL PROFILE */

function renderProfile() {
  $("#viewKicker").textContent = "PROFILE";
  $("#viewTitle").textContent = "Personal settings";

  const profile = read(STORAGE.profile, { name: "You" });

  viewContent.innerHTML = `
    ${panel("Display name", `
      <label for="displayName">Your name or nickname</label>
      <input id="displayName" maxlength="40" value="${safeText(profile.name || "You")}">
      <button class="action-button" id="saveProfile">Save name</button>
      <p id="profileMessage" aria-live="polite"></p>
    `)}

    ${panel("About this prototype", `
      <p>Profile and saved items are stored in this browser only.</p>
      <p>There is no account system, cloud sync, verified jobs database or payment processing in this prototype.</p>
    `)}
  `;

  addBackButton();

  $("#saveProfile").addEventListener("click", () => {
    const name = $("#displayName").value.trim();

    if (!name) {
      $("#profileMessage").textContent = "Enter a name first.";
      return;
    }

    const ok = write(STORAGE.profile, { name });

    if (ok) {
      $("#avatarLetter").textContent = name[0].toUpperCase();
      $("#profileMessage").textContent = "Name saved on this device.";
      activity("Profile updated", "Your display name was updated.");
    }
  });
}

/* Event delegation */

document.addEventListener("submit", event => {
  const form = event.target.closest("[data-search-form]");
  if (!form) return;

  event.preventDefault();

  const query = new FormData(form).get("query");
  const type = form.dataset.searchForm;

  if (type === "earn") {
    googleSearch(query + " paid opportunities");
  } else if (type === "jobs") {
    googleSearch(query + " jobs projects");
  } else {
    googleSearch(query);
  }
});

document.addEventListener("click", event => {
  const earnButton = event.target.closest("[data-earn-query]");
  const jobButton = event.target.closest("[data-job-query]");
  const practiceButton = event.target.closest("[data-practice]");

  if (earnButton) {
    googleSearch(earnButton.dataset.earnQuery);
  }

  if (jobButton) {
    googleSearch(jobButton.dataset.jobQuery);
  }

  if (practiceButton) {
    renderPractice(practiceButton.dataset.practice);
  }
});

/* Initialize */

function initialize() {
  $("#footerYear").textContent = new Date().getFullYear();

  const savedActivity = read(STORAGE.activity, null);

  if (savedActivity) {
    $("#activityTitle").textContent = savedActivity.title || "Welcome back";
    $("#activityText").textContent = savedActivity.message || "Your workspace is ready.";
  }

  const profile = read(STORAGE.profile, { name: "You" });
  $("#avatarLetter").textContent = (profile.name || "Y").charAt(0).toUpperCase();

  $$("[data-view]").forEach(button => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  $$("[data-nav]").forEach(button => {
    button.addEventListener("click", () => {
      const destination = button.dataset.nav;
      destination === "home" ? goHome() : showView(destination);
    });
  });

  $("#startButton").addEventListener("click", () => {
    $("#workspace").scrollIntoView({ behavior: "smooth" });
  });

  $("#backHome").addEventListener("click", goHome);
  $("#profileButton").addEventListener("click", () => showView("profile"));

  window.addEventListener("keydown", event => {
    if (event.key === "Escape" && !section.hidden) goHome();
  });

  // Restore the correct initial state.
  section.hidden = true;
}

initialize();
