
/* ==========================================
   ONE — Workspace Interactions
   File: platform.js
   Lightweight vanilla JavaScript
   ========================================== */

"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

const STORAGE = {
  activity: "one_platform_activity_v1",
  savedJobs: "one_platform_saved_jobs_v1",
  profile: "one_platform_profile_v1",
  notes: "one_platform_notes_v1"
};

const section = $("#dynamicSection");
const viewTitle = $("#viewTitle");
const viewKicker = $("#viewKicker");
const viewContent = $("#viewContent");
const homeSections = [
  $("#home"),
  $("#workspace"),
  $("#activity"),
  $(".notice")
];

const safeRead = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
};

const safeWrite = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    setActivity("Storage unavailable", "Your browser could not save this data.");
    return false;
  }
};

function setActivity(title, description) {
  $("#activityTitle").textContent = title;
  $("#activityText").textContent = description;

  safeWrite(STORAGE.activity, {
    title,
    description,
    updatedAt: new Date().toISOString()
  });
}

function restoreActivity() {
  const saved = safeRead(STORAGE.activity, null);

  if (saved && saved.title && saved.description) {
    $("#activityTitle").textContent = saved.title;
    $("#activityText").textContent = saved.description;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function panel(title, description = "") {
  return `
    <article class="content-panel">
      <h3>${escapeHTML(title)}</h3>
      ${description ? `<p>${escapeHTML(description)}</p>` : ""}
      <div class="panel-body"></div>
    </article>
  `;
}

function showView(name) {
  const views = {
    earn: renderEarn,
    jobs: renderJobs,
    tools: renderTools,
    profile: renderProfile
  };

  if (!views[name]) {
    goHome();
    return;
  }

  homeSections.forEach(element => {
    if (element) element.hidden = true;
  });

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

  homeSections.forEach(element => {
    if (element) element.hidden = false;
  });

  $$(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.nav === "home");
  });

  $("#home").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function renderEarn() {
  viewKicker.textContent = "ONE EARN";
  viewTitle.textContent = "Explore useful tasks";

  viewContent.innerHTML = `
    <div class="content-panel">
      <span class="demo-label">DEMO EXAMPLES</span>
      <h3>Start with a skill</h3>
      <p>
        These examples help you practise. They are not paid offers,
        verified jobs or promises of income.
      </p>

      <div class="task-item">
        <h4>01 — Write a short product description</h4>
        <p>Practise clear writing for a sample product.</p>
        <button class="action-button" data-task="writing">
          Start practice
        </button>
      </div>

      <div class="task-item">
        <h4>02 — Create a simple poster concept</h4>
        <p>Plan a visual concept for a fictional local business.</p>
        <button class="action-button" data-task="design">
          Start practice
        </button>
      </div>

      <div class="task-item">
        <h4>03 — Organize sample information</h4>
        <p>Practise arranging fictional data in a clean table.</p>
        <button class="action-button" data-task="data">
          Start practice
        </button>
      </div>
    </div>

    <div class="content-panel">
      <h3>Your practice workspace</h3>
      <p id="taskInstructions">
        Select an example task to see its instructions here.
      </p>

      <label for="taskResponse">Your work</label>
      <textarea id="taskResponse"
        placeholder="Write your practice answer here..."></textarea>

      <button class="action-button" id="saveTask">
        Save practice locally
      </button>

      <div id="taskResult" aria-live="polite"></div>
    </div>

    <div class="content-panel">
      <h3>Finding genuine paid work</h3>
      <ul>
        <li>Build a few sample projects first.</li>
        <li>Check the client's identity and project requirements.</li>
        <li>Agree on payment and delivery terms before working.</li>
        <li>Never pay a registration fee to receive a job.</li>
        <li>If you're under 18, follow the platform's age rules and ask a trusted adult for help.</li>
      </ul>
      <p>
        ONE does not currently verify tasks, employ workers or send payments.
      </p>
    </div>
  `;

  const instructions = {
    writing: "Write 2–3 sentences describing a fictional reusable water bottle.",
    design: "Describe the layout, headline and colours of a poster for a fictional bookshop.",
    data: "Write three fictional product names and their prices in a clear, organized format."
  };

  $$("[data-task]", viewContent).forEach(button => {
    button.addEventListener("click", () => {
      $("#taskInstructions").textContent =
        instructions[button.dataset.task];

      $("#taskResult").textContent = "";
      $("#taskResponse").focus();
      setActivity("Practice started", "You selected a ONE Earn practice example.");
    });
  });

  $("#saveTask").addEventListener("click", () => {
    const response = $("#taskResponse").value.trim();

    if (!response) {
      $("#taskResult").textContent = "Write something before saving.";
      return;
    }

    const saved = safeWrite("one_platform_task_draft_v1", {
      response,
      savedAt: new Date().toISOString()
    });

    $("#taskResult").textContent = saved
      ? "Practice saved on this device. This is not a paid submission."
      : "Could not save. Check your browser storage settings.";

    if (saved) {
      setActivity("Practice saved", "Your example task draft is stored on this device.");
    }
  });
}

function renderJobs() {
  viewKicker.textContent = "JOBS & PROJECTS";
  viewTitle.textContent = "Plan your next step";

  viewContent.innerHTML = `
    <div class="content-panel">
      <h3>Example project ideas</h3>
      <p>
        These are project ideas for practice, not verified vacancies.
      </p>

      <div class="job-item">
        <span class="demo-label">PRACTICE IDEA</span>
        <h4>Build a one-page website</h4>
        <p>Practise HTML, CSS and responsive design.</p>
        <button class="action-button" data-save-job="website">
          Save idea
        </button>
      </div>

      <div class="job-item">
        <span class="demo-label">PRACTICE IDEA</span>
        <h4>Create a small Python tool</h4>
        <p>Build a calculator or a simple task organizer.</p>
        <button class="action-button" data-save-job="python">
          Save idea
        </button>
      </div>

      <div class="job-item">
        <span class="demo-label">PRACTICE IDEA</span>
        <h4>Prepare a sample design portfolio</h4>
        <p>Show three original poster or interface concepts.</p>
        <button class="action-button" data-save-job="design">
          Save idea
        </button>
      </div>
    </div>

    <div class="content-panel">
      <h3>Saved ideas</h3>
      <p>Your saved ideas are stored in this browser only.</p>
      <div id="savedJobs"></div>
    </div>

    <div class="content-panel">
      <h3>Project planner</h3>
      <label for="projectName">Project name</label>
      <input id="projectName" maxlength="100"
        placeholder="e.g. My first portfolio">

      <label for="projectGoal">What will you build?</label>
      <textarea id="projectGoal" maxlength="1000"
        placeholder="Describe your goal and next step..."></textarea>

      <button class="action-button" id="saveProject">
        Save project plan
      </button>

      <div id="projectResult" aria-live="polite"></div>
    </div>
  `;

  function renderSavedJobs() {
    const saved = safeRead(STORAGE.savedJobs, []);
    const container = $("#savedJobs");

    if (!Array.isArray(saved) || saved.length === 0) {
      container.innerHTML = "<p>No saved ideas yet.</p>";
      return;
    }

    const labels = {
      website: "Build a one-page website",
      python: "Create a small Python tool",
      design: "Prepare a sample design portfolio"
    };

    container.innerHTML = saved.map(id => `
      <div class="task-item">
        <h4>${escapeHTML(labels[id] || id)}</h4>
        <button class="action-button" data-remove-job="${escapeHTML(id)}">
          Remove
        </button>
      </div>
    `).join("");

    $$("[data-remove-job]", container).forEach(button => {
      button.addEventListener("click", () => {
        const updated = safeRead(STORAGE.savedJobs, [])
          .filter(id => id !== button.dataset.removeJob);

        safeWrite(STORAGE.savedJobs, updated);
        renderSavedJobs();
        setActivity("Saved idea removed", "Your project list has been updated.");
      });
    });
  }

  $$("[data-save-job]", viewContent).forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.saveJob;
      const saved = safeRead(STORAGE.savedJobs, []);
      const list = Array.isArray(saved) ? saved : [];

      if (!list.includes(id)) {
        list.push(id);
        safeWrite(STORAGE.savedJobs, list);
        setActivity("Project idea saved", "You saved a project idea for later.");
      }

      renderSavedJobs();
    });
  });

  $("#saveProject").addEventListener("click", () => {
    const name = $("#projectName").value.trim();
    const goal = $("#projectGoal").value.trim();

    if (!name || !goal) {
      $("#projectResult").textContent = "Enter a project name and goal first.";
      return;
    }

    const saved = safeWrite("one_platform_project_v1", {
      name,
      goal,
      updatedAt: new Date().toISOString()
    });

    $("#projectResult").textContent = saved
      ? "Project plan saved on this device."
      : "Could not save your project plan.";

    if (saved) {
      setActivity("Project plan saved", name);
    }
  });

  renderSavedJobs();
}

function renderTools() {
  viewKicker.textContent = "ONE TOOLS";
  viewTitle.textContent = "Useful everyday tools";

  viewContent.innerHTML = `
    <div class="content-panel">
      <h3>Quick calculator</h3>
      <p>Enter two numbers and choose an operation.</p>

      <label for="calcA">First number</label>
      <input type="number" id="calcA" step="any" placeholder="e.g. 25">

      <label for="calcB">Second number</label>
      <input type="number" id="calcB" step="any" placeholder="e.g. 5">

      <label for="calcOperation">Operation</label>
      <select id="calcOperation">
        <option value="add">Addition (+)</option>
        <option value="subtract">Subtraction (−)</option>
        <option value="multiply">Multiplication (×)</option>
        <option value="divide">Division (÷)</option>
      </select>

      <button class="action-button" id="calculateButton">Calculate</button>
      <div class="result-box" id="calcResult" aria-live="polite">
        Your result will appear here.
      </div>
    </div>

    <div class="content-panel">
      <h3>Quick notes</h3>
      <p>Write a reminder or idea. Notes remain in this browser.</p>

      <label for="quickNotes">Your notes</label>
      <textarea id="quickNotes" maxlength="5000"
        placeholder="Write a note..."></textarea>

      <button class="action-button" id="saveNotes">Save notes</button>
      <div id="notesResult" aria-live="polite"></div>
    </div>

    <div class="content-panel">
      <h3>Daily checklist</h3>
      <p>Tick an item when you finish it.</p>

      <label class="checklist">
        <input type="checkbox" data-check="learn">
        <span>Learn something new</span>
      </label>

      <label class="checklist">
        <input type="checkbox" data-check="build">
        <span>Make progress on a project</span>
      </label>

      <label class="checklist">
        <input type="checkbox" data-check="review">
        <span>Review today's work</span>
      </label>

      <div class="result-box" id="checklistResult" aria-live="polite">
        0 of 3 completed
      </div>
    </div>
  `;

  const notes = safeRead(STORAGE.notes, "");
  $("#quickNotes").value = typeof notes === "string" ? notes : "";

  $("#calculateButton").addEventListener("click", () => {
    const a = $("#calcA").value.trim();
    const b = $("#calcB").value.trim();

    if (a === "" || b === "") {
      $("#calcResult").textContent = "Enter both numbers first.";
      return;
    }

    const first = Number(a);
    const second = Number(b);

    if (!Number.isFinite(first) || !Number.isFinite(second)) {
      $("#calcResult").textContent = "Enter valid numbers.";
      return;
    }

    let result;
    switch ($("#calcOperation").value) {
      case "add":
        result = first + second;
        break;
      case "subtract":
        result = first - second;
        break;
      case "multiply":
        result = first * second;
        break;
      case "divide":
        if (second === 0) {
          $("#calcResult").textContent = "Cannot divide by zero.";
          return;
        }
        result = first / second;
        break;
      default:
        $("#calcResult").textContent = "Choose an operation.";
        return;
    }

    $("#calcResult").textContent = `Result: ${result}`;
    setActivity("Calculator used", "You completed a calculation in ONE Tools.");
  });

  $("#saveNotes").addEventListener("click", () => {
    const ok = safeWrite(STORAGE.notes, $("#quickNotes").value);

    $("#notesResult").textContent = ok
      ? "Notes saved on this device."
      : "Could not save your notes.";

    if (ok) setActivity("Notes saved", "Your notes were saved locally.");
  });

  const checkboxes = $$("[data-check]", viewContent);

  function updateChecklist() {
    const completed = checkboxes.filter(item => item.checked).length;

    $("#checklistResult").textContent =
      `${completed} of ${checkboxes.length} completed`;

    if (completed > 0) {
      setActivity(
        "Checklist updated",
        `You completed ${completed} of ${checkboxes.length} checklist items.`
      );
    }
  }

  checkboxes.forEach(item => {
    item.addEventListener("change", updateChecklist);
  });
}

function renderProfile() {
  viewKicker.textContent = "YOUR PROFILE";
  viewTitle.textContent = "Your personal space";

  const profile = safeRead(STORAGE.profile, { name: "You" });
  const name = typeof profile.name === "string" ? profile.name : "You";

  viewContent.innerHTML = `
    <div class="content-panel">
      <h3>Personal settings</h3>
      <p>Your display name is saved only in this browser.</p>

      <label for="profileName">Display name</label>
      <input id="profileName" maxlength="40"
        value="${escapeHTML(name)}">

      <button class="action-button" id="saveProfile">Save profile</button>
      <button class="action-button" id="resetActivity">Reset activity message</button>

      <div id="profileResult" aria-live="polite"></div>
    </div>

    <div class="content-panel">
      <h3>Privacy & account status</h3>
      <p>
        This prototype has no user login, cloud profile, verified job system
        or payment system. Local data is specific to this browser.
      </p>
      <p>Do not enter passwords, financial details or sensitive personal information here.</p>
    </div>
  `;

  $("#saveProfile").addEventListener("click", () => {
    const newName = $("#profileName").value.trim();

    if (!newName) {
      $("#profileResult").textContent = "Enter a display name first.";
      return;
    }

    const ok = safeWrite(STORAGE.profile, { name: newName });

    if (ok) {
      $("#avatarLetter").textContent = newName.charAt(0).toUpperCase();
      $("#profileResult").textContent = "Display name saved on this device.";
      setActivity("Profile updated", `Your display name is ${newName}.`);
    }
  });

  $("#resetActivity").addEventListener("click", () => {
    setActivity("Your space is ready.", "Choose a module above to begin.");
    $("#profileResult").textContent = "Activity message reset.";
  });
}

function restoreProfile() {
  const profile = safeRead(STORAGE.profile, { name: "You" });
  const name = typeof profile.name === "string" ? profile.name : "You";

  $("#avatarLetter").textContent = name.charAt(0).toUpperCase();
}

function initialize() {
  $("#footerYear").textContent = new Date().getFullYear();

  restoreActivity();
  restoreProfile();

  $$("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
      showView(button.dataset.view);
    });
  });

  $$("[data-nav]").forEach(button => {
    button.addEventListener("click", () => {
      const destination = button.dataset.nav;

      if (destination === "home") {
        goHome();
      } else {
        showView(destination);
      }
    });
  });

  $("#startButton").addEventListener("click", () => {
    $("#workspace").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  $("#backHome").addEventListener("click", goHome);

  $("#profileButton").addEventListener("click", () => {
    showView("profile");
  });

  // Allow browser Back to return from an opened module.
  window.addEventListener("keydown", event => {
    if (event.key === "Escape" && !section.hidden) {
      goHome();
    }
  });
}

initialize();
