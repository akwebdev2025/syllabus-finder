let syllabusData = [];
let currentResults = [];

const subjectInput = document.getElementById("subject");
const courseSelect = document.getElementById("course");
const semesterSelect = document.getElementById("semester");
const searchBtn = document.getElementById("searchBtn");
const resultsSection = document.getElementById("resultsSection");
const resultsBox = document.getElementById("results");
const resultCount = document.getElementById("resultCount");
const detailSection = document.getElementById("detailSection");
const detailCard = document.getElementById("detailCard");
const popularBox = document.getElementById("popularSubjects");
const errorText = "No syllabus found. Try another subject or remove a filter.";

async function loadData() {
  try {
    const response = await fetch("data/syllabus.json");
    if (!response.ok) throw new Error("Data file could not be loaded.");
    syllabusData = await response.json();
    renderPopular();
  } catch (error) {
    resultsSection.classList.remove("hidden");
    resultCount.textContent = "Could not load syllabus data.";
    resultsBox.innerHTML = `<div class="result-card"><div class="result-info"><h3>Data file missing</h3><p class="meta">Make sure data/syllabus.json exists in the repository.</p></div></div>`;
  }
}

function renderPopular() {
  const subjects = [...new Set(syllabusData.map(item => item.subject))].slice(0, 8);
  popularBox.innerHTML = subjects.map(subject =>
    `<button class="chip" data-subject="${escapeHtml(subject)}">${escapeHtml(subject)}</button>`
  ).join("");

  popularBox.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      subjectInput.value = btn.dataset.subject;
      search();
    });
  });
}

function search() {
  const query = subjectInput.value.trim().toLowerCase();
  const course = courseSelect.value;
  const semester = semesterSelect.value;

  currentResults = syllabusData.filter(item => {
    const haystack = `${item.subject} ${item.aliases || ""}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesCourse = !course || item.course === course;
    const matchesSemester = !semester || item.semester === semester;
    return matchesQuery && matchesCourse && matchesSemester;
  });

  detailSection.classList.add("hidden");
  resultsSection.classList.remove("hidden");
  resultCount.textContent = currentResults.length
    ? `${currentResults.length} syllabus result${currentResults.length === 1 ? "" : "s"} found`
    : errorText;

  resultsBox.innerHTML = currentResults.map((item, index) => `
    <button class="result-card" data-index="${index}" style="width:100%;text-align:left">
      <span class="result-icon">📘</span>
      <span class="result-info">
        <h3>${escapeHtml(item.subject)}</h3>
        <span class="meta">${escapeHtml(courseName(item.course))} · Semester ${escapeHtml(item.semester)}</span>
      </span>
      <span class="open-arrow">›</span>
    </button>
  `).join("");

  resultsBox.querySelectorAll(".result-card").forEach(card => {
    card.addEventListener("click", () => showDetails(currentResults[Number(card.dataset.index)]));
  });

  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showDetails(item) {
  resultsSection.classList.add("hidden");
  detailSection.classList.remove("hidden");

  const units = item.units.map(unit => `
    <section class="unit">
      <h3>📌 ${escapeHtml(unit.title)}</h3>
      <ul>${unit.topics.map(topic => `<li>${escapeHtml(topic)}</li>`).join("")}</ul>
    </section>
  `).join("");

  detailCard.innerHTML = `
    <div class="detail-head">
      <div class="detail-icon">📚</div>
      <div>
        <h2>${escapeHtml(item.subject)}</h2>
        <div class="meta">${escapeHtml(courseName(item.course))} · Semester ${escapeHtml(item.semester)}</div>
        <span class="badge">Official-source data</span>
      </div>
    </div>
    ${units}
    <a class="pdf-btn" href="${escapeAttribute(item.sourceUrl)}" target="_blank" rel="noopener">↗ View Official Source</a>
  `;

  detailSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function courseName(value) {
  const names = { BA: "B.A.", BCom: "B.Com.", BSc: "B.Sc.", MA: "M.A.", MCom: "M.Com." };
  return names[value] || value;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

function escapeAttribute(value) {
  return escapeHtml(value || "#");
}

searchBtn.addEventListener("click", search);
subjectInput.addEventListener("keydown", e => {
  if (e.key === "Enter") search();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  subjectInput.value = "";
  courseSelect.value = "";
  semesterSelect.value = "";
  resultsSection.classList.add("hidden");
  detailSection.classList.add("hidden");
});

document.getElementById("backBtn").addEventListener("click", () => {
  detailSection.classList.add("hidden");
  resultsSection.classList.remove("hidden");
});

document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  document.getElementById("themeBtn").textContent = dark ? "☀" : "☾";
  localStorage.setItem("puTheme", dark ? "dark" : "light");
});

if (localStorage.getItem("puTheme") === "dark") {
  document.body.classList.add("dark");
  document.getElementById("themeBtn").textContent = "☀";
}

document.getElementById("year").textContent = new Date().getFullYear();
loadData();
