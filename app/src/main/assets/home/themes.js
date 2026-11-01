// KT TV Launcher theme manager

const themes = [
  {
    name: "Glass",
    file: ""
  },
  {
    name: "Sharingan",
    file: "themes/sharingan.css"
  },
  {
    name: "JARVIS",
    file: "themes/jarvis.css"
  },
  {
    name: "Cyberpunk",
    file: "themes/cyberpunk.css"
  }
];

const STORAGE_KEY = "kt-tv-theme";

let currentTheme = Number(localStorage.getItem(STORAGE_KEY) || 0);

if (
  Number.isNaN(currentTheme) ||
  currentTheme < 0 ||
  currentTheme >= themes.length
) {
  currentTheme = 0;
}

function applyTheme(index) {
  currentTheme = index;

  const theme = themes[currentTheme];
  const themeCss = document.getElementById("theme-css");
  const themeButton = document.getElementById("btn-theme");

  if (theme.file) {
    themeCss.href = theme.file;
  } else {
    themeCss.removeAttribute("href");
  }

  document.body.dataset.theme = theme.name.toLowerCase();

  themeButton.textContent = `Theme: ${theme.name}`;

  localStorage.setItem(STORAGE_KEY, String(currentTheme));
}

export function initThemes() {
  applyTheme(currentTheme);

  document
    .getElementById("btn-theme")
    .addEventListener("click", () => {
      const nextTheme = (currentTheme + 1) % themes.length;
      applyTheme(nextTheme);
    });
}