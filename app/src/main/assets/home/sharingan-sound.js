// Independent feedback observer: never handles navigation or app launching.
export function initSharinganSound() {
  let context;
  let buffer;
  let source;
  let lastPlayed = -Infinity;
  const enabled = () => document.body.dataset.theme === "sharingan" && !document.hidden;
  const stop = () => {
    try { source?.stop(); } catch { /* Already ended. */ }
    source = null;
  };

  // Decode the bundled PCM once, before navigation needs it. No remote assets.
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    fetch(new URL("./audio/sharingan-nav.wav", import.meta.url))
      .then(response => {
        if (!response.ok) throw new Error("Navigation audio unavailable");
        return response.arrayBuffer();
      })
      .then(bytes => context.decodeAudioData(bytes))
      .then(decoded => { buffer = decoded; })
      .catch(() => {});
  } catch { return; }

  const unlock = () => {
    if (enabled() && context.state === "suspended") {
      try { context.resume().catch(() => {}); } catch { /* Audio is optional. */ }
    }
  };
  document.addEventListener("keydown", unlock, true);
  document.addEventListener("pointerdown", unlock, true);
  document.addEventListener("focusin", event => {
    const next = event.target.closest?.(".app");
    const previous = event.relatedTarget?.closest?.(".app");
    if (!enabled() || !next || !previous || next.dataset.pkg === previous.dataset.pkg) return;
    const movedAt = performance.now();
    const play = () => {
      const now = performance.now();
      if (!enabled() || !buffer || context.state !== "running" ||
          document.activeElement !== next || now - movedAt > 80 || now - lastPlayed < 90) return;
      try {
        stop();
        const gain = context.createGain();
        gain.gain.value = 0.12;
        const tick = context.createBufferSource();
        tick.buffer = buffer;
        tick.connect(gain);
        gain.connect(context.destination);
        tick.onended = () => {
          tick.disconnect();
          gain.disconnect();
          if (source === tick) source = null;
        };
        source = tick;
        tick.start();
        lastPlayed = now;
      } catch { /* Sound failures never escape into focus handling. */ }
    };
    if (context.state === "suspended") {
      try { context.resume().then(play).catch(() => {}); } catch { /* Optional. */ }
    } else play();
  });
  new MutationObserver(() => { if (!enabled()) stop(); })
    .observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  window.addEventListener("pagehide", stop);
}
