// The favorites row and the "All apps" grid.

import config from "./config.js";
import { TV, iconUrl } from "./tv.js";
import { launchWithSharingan } from "./sharingan.js";

const favoritesRow = document.getElementById("favorites");
const allSection = document.getElementById("all-section");
const allGrid = document.getElementById("all-apps");
const favoritesSection = document.getElementById("favorites-section");
const allButton = document.getElementById("btn-all");

let apps = [];


export function loadApps() {
  try {
    apps = JSON.parse(TV.apps());
  } catch {
    apps = [];
  }

  renderFavorites();

  if (isAllShown()) {
    renderAll();
  }
}


export const isAllShown =
  () => !allSection.hidden;


export function showAll(show) {
  allSection.hidden = !show;
  favoritesSection.hidden = show;

  allButton.textContent =
    show ? "Back" : "All apps";

  if (show) {
    renderAll();
  }

  focusFirst();
}


export function focusFirst() {
  const container =
    isAllShown()
      ? allGrid
      : favoritesRow;

  (
    container.querySelector(".app") ||
    allButton
  ).focus();
}


function renderFavorites() {
  const focused =
    document.activeElement?.dataset.pkg;

  const byPkg =
    new Map(
      apps.map((app) => [
        app.pkg,
        app
      ])
    );

  const cards =
    config.favorites
      .filter((pkg) => byPkg.has(pkg))
      .map((pkg) =>
        appCard(
          byPkg.get(pkg),
          true
        )
      );

  favoritesRow.replaceChildren(...cards);

  favoritesRow
    .querySelector(
      `[data-pkg="${focused}"]`
    )
    ?.focus();
}


function renderAll() {
  const hidden =
    new Set(config.hidden);

  const cards =
    apps
      .filter(
        (app) =>
          !hidden.has(app.pkg)
      )
      .sort(
        (a, b) =>
          a.label.localeCompare(b.label)
      )
      .map(
        (app) =>
          appCard(app, false)
      );

  allGrid.replaceChildren(...cards);
}


function appCard(app, favorite = false) {

  const card =
    document.createElement("button");

  card.className =
    app.tv
      ? "app"
      : "app icon-only";

  if (favorite) {
    card.classList.add(
      "favorite-app"
    );
  }

  card.dataset.pkg = app.pkg;

  /*
   * Keep original Android artwork available.
   * Glass and All Apps can continue using it.
   */
  card.style.backgroundImage =
    `url("${iconUrl(app.pkg)}")`;

  card.setAttribute(
    "aria-label",
    app.label
  );


  /* =====================================
     LABEL
     ===================================== */

  const label =
    document.createElement("span");

  label.className =
    "label";

  label.textContent =
    app.label;

  card.append(label);


  /* =====================================
     LAUNCH
     ===================================== */

  card.addEventListener(
    "click",
    () =>
      launchWithSharingan(
        () => TV.launch(app.pkg)
      )
  );

  return card;
}