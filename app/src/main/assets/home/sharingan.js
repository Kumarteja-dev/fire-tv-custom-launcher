// Event-driven effects: no continuous render loop or background animation.
let wake = () => {};
let suspend = () => {};
let launching = false;
let launchTimer;
let restoreTimer;
const IDLE_TIMEOUT_MS = 25_000;
let idleTimer;
const active = () => document.body.dataset.theme === "sharingan";
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function clearIdle() {
  clearTimeout(idleTimer);
  document.body.classList.remove("sharingan-idle");
}
export function resetSharinganIdle() {
  clearIdle();
  if (!active() || document.hidden) return;
  idleTimer = setTimeout(() => {
    if (active() && !document.hidden) document.body.classList.add("sharingan-idle");
  }, IDLE_TIMEOUT_MS);
}
function resetLaunch() {
  clearTimeout(restoreTimer);
  document.body.classList.remove("sharingan-launch");
  launching = false;
}
export function launchWithSharingan(launch) {
  if (!active() || reduced()) return launch();
  if (launching) return;
  launching = true;
  document.body.classList.remove("sharingan-blink");
  document.body.classList.add("sharingan-launch");
  launchTimer = setTimeout(() => {
    launchTimer = undefined;
    try {
      if (launch() === false) resetLaunch();
    } finally {
      // Recover even if the bridge fails or no visibility event arrives.
      restoreTimer = setTimeout(resetLaunch, 700);
    }
  }, 240);
}
export function wakeSharingan() { wake(); }
export function suspendSharingan() { suspend(); }
export function initSharinganTracking() {
  const stage = document.getElementById("itachi-stage");
  const spotlight = document.getElementById("sharingan-spotlight");
  const eyes = [...document.querySelectorAll(".sharingan-gaze")];
  let blinkTimer, blinkEnd, spinEnd, frame;
  let awake = !document.hidden;
  function track() {
    if (!active() || !awake) return;
    const app = document.activeElement?.closest(".app");
    spotlight.classList.toggle("visible", Boolean(app));
    // Use layout bounds, not the in-progress focus transform, for the glow.
    const rowRect = app?.offsetParent?.getBoundingClientRect();
    if (app && rowRect) {
      const x = rowRect.left + app.offsetLeft + app.offsetWidth / 2;
      const y = rowRect.top + app.offsetTop + app.offsetHeight / 2 - 8;
      spotlight.style.transform = `translate3d(${x - 150}px,${y - 90}px,0)`;
    }
    // Layout centers ignore focus scaling and its transition. Normalize against
    // this app row, so the first/last apps always reach the full gaze range.
    const row = app?.parentElement;
    const apps = row ? [...row.querySelectorAll(".app")] : [];
    const centers = apps.map(el => el.offsetLeft + el.offsetWidth / 2);
    const min = Math.min(...centers), max = Math.max(...centers);
    const center = app ? app.offsetLeft + app.offsetWidth / 2 : 0;
    const horizontal = max > min ? Math.max(-1, Math.min(1, 2 * (center - min) / (max - min) - 1)) : 0;
    const vertical = app ? 2 : 0;
    eyes.forEach((eye) => {
      // Full iris + pupil move together in artwork pixels; wake spin is nested.
      eye.style.transform = app && !reduced()
        ? `translate(${horizontal * 11}px,${vertical}px)` : "";
    });
  }
  function scheduleTrack() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(track);
  }
  function scheduleBlink() {
    clearTimeout(blinkTimer);
    if (!active() || !awake || reduced()) return;
    blinkTimer = setTimeout(() => {
      if (!launching) {
        document.body.classList.add("sharingan-blink");
        blinkEnd = setTimeout(() => document.body.classList.remove("sharingan-blink"), 220);
      }
      scheduleBlink();
    }, 5500 + Math.random() * 6500);
  }
  suspend = () => {
    clearIdle();
    awake = false;
    clearTimeout(blinkTimer); clearTimeout(blinkEnd); clearTimeout(spinEnd);
    clearTimeout(launchTimer); cancelAnimationFrame(frame);
    resetLaunch();
    document.body.classList.remove("sharingan-wake", "sharingan-blink");
    spotlight.classList.remove("visible");
    eyes.forEach((eye) => { eye.style.transform = ""; });
  };
  wake = () => {
    suspend();
    awake = !document.hidden;
    if (!active() || !awake) return;
    resetSharinganIdle();
    scheduleTrack();
    if (!reduced()) {
      void stage.getBoundingClientRect();
      document.body.classList.add("sharingan-wake");
      spinEnd = setTimeout(() => document.body.classList.remove("sharingan-wake"), 900);
    }
    scheduleBlink();
  };
  document.addEventListener("focusin", scheduleTrack);
  // Observe input without consuming it or triggering the eye wake animation.
  for (const event of ["keydown", "keyup", "focusin", "pointerdown", "click"]) {
    document.addEventListener(event, resetSharinganIdle, true);
  }
  document.addEventListener("focusout", scheduleTrack);
  window.addEventListener("resize", scheduleTrack);
  document.getElementById("theme-css").addEventListener("load", scheduleTrack);
  document.addEventListener("visibilitychange", () => document.hidden ? suspend() : wake());
  window.addEventListener("pageshow", wake);
  window.addEventListener("pagehide", suspend);
  new MutationObserver(wake).observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
  wake();
}
