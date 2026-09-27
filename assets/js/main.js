(() => {
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      root.dataset.theme = next;
      localStorage.setItem("theme", next);
    });
  }

  const progress = document.getElementById("progress");
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
  };
  addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.getElementById("neural-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, nodes = [];

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(72, Math.max(28, Math.floor(w / 22)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18
    }));
  };

  const color = () => getComputedStyle(root).getPropertyValue("--muted").trim() || "#95a2b8";
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const c = color();
    nodes.forEach((n) => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -20 || n.x > w + 20) n.vx *= -1;
      if (n.y < -20 || n.y > h + 20) n.vy *= -1;
    });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < 120) {
          ctx.globalAlpha = (1 - d / 120) * 0.16;
          ctx.strokeStyle = c;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = c;
    nodes.forEach((n) => { ctx.beginPath(); ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  };

  resize();
  addEventListener("resize", resize);
  draw();
})();
