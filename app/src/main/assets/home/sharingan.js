// ============================================
// KT TV LAUNCHER
// Sharingan real iris tracking
// ============================================

export function initSharinganTracking() {
  const irises = Array.from(
    document.querySelectorAll(".sharingan-iris")
  );

  if (!irises.length) {
    return;
  }

  function resetEyes() {
    irises.forEach((iris) => {
      iris.style.transform = "translate(0px, 0px)";
    });
  }

  function lookAtApp(app) {
    if (!app) {
      resetEyes();
      return;
    }

    const rect = app.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    irises.forEach((iris) => {
      const eyeRect = iris.parentElement.getBoundingClientRect();

      const eyeX = eyeRect.left + eyeRect.width / 2;
      const eyeY = eyeRect.top + eyeRect.height / 2;

      const dx = targetX - eyeX;
      const dy = targetY - eyeY;
      const angle = Math.atan2(dy, dx);

      // Subtle movement only, so it looks like the real eye is tracking.
      const maxX = 5;
      const maxY = 2;

      const moveX = Math.cos(angle) * maxX;
      const moveY = Math.sin(angle) * maxY;

      iris.style.transform =
        `translate(${moveX}px, ${moveY}px)`;
    });
  }

  document.addEventListener("focusin", (event) => {
    if (document.body.dataset.theme !== "sharingan") {
      return;
    }

    const app = event.target.closest(".app");

    if (app) {
      lookAtApp(app);
    }
  });

  const observer = new MutationObserver(() => {
    if (document.body.dataset.theme === "sharingan") {
      const focused = document.activeElement;

      if (
        focused &&
        focused.classList.contains("app")
      ) {
        lookAtApp(focused);
      } else {
        resetEyes();
      }
    } else {
      resetEyes();
    }
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });

  resetEyes();
}
