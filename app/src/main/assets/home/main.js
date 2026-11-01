// Starts the page and connects it to Android.

import { TV } from "./tv.js";
import {
  loadApps,
  showAll,
  isAllShown,
  focusFirst
} from "./apps.js";

import { updateWeather } from "./weather.js";
import { startBackground } from "./background.js";
import { enableRemoteKeys } from "./remote.js";
import { initThemes } from "./themes.js";
import { initSharinganTracking } from "./sharingan.js";

const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");


function updateClock() {
  const now = new Date();

  timeEl.textContent =
    now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });

  dateEl.textContent =
    now.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
}


// Android calls these from MainActivity.

window.onShow = () => {
  updateClock();
  updateWeather();
  loadApps();
};

window.onAppsChanged = loadApps;

window.onHome = () => {
  showAll(false);
};

window.onBack = () => {
  if (isAllShown()) {
    showAll(false);
  }
};


// Bottom buttons

document
  .getElementById("btn-all")
  .addEventListener("click", () => {
    showAll(!isAllShown());
  });


document
  .getElementById("btn-settings")
  .addEventListener("click", () => {
    TV.openSettings();
  });


document
  .getElementById("btn-amazon")
  .addEventListener("click", () => {
    TV.openStockHome();
  });


// Theme system

initThemes();
initSharinganTracking();


// Remote

enableRemoteKeys(focusFirst);


// Background

startBackground();


// Clock

updateClock();

setInterval(
  updateClock,
  10_000
);


// Weather

updateWeather(true);

setInterval(
  updateWeather,
  60_000
);


// Apps

loadApps();
focusFirst();