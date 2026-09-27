(() => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) root.dataset.theme = savedTheme;

  const themeToggle = document.getElementById("themeToggle");
  themeToggle?.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
  });

  const progress = document.getElementById("progress");
  const updateProgress = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    if (progress) progress.style.width = ((scrollY / max) * 100) + "%";
  };
  addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;

  if (!reduced && !coarse) {
    const cursor = document.getElementById("cursorDot");
    let cx = innerWidth / 2, cy = innerHeight / 2;
    let tx = cx, ty = cy;

    addEventListener("pointermove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
      document.body.classList.add("cursor-ready");
    }, { passive: true });

    const cursorLoop = () => {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      if (cursor) {
        cursor.style.left = cx + "px";
        cursor.style.top = cy + "px";
      }
      requestAnimationFrame(cursorLoop);
    };
    cursorLoop();

    document.querySelectorAll("a,button,input,textarea").forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-link"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-link"));
    });

    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(1200px) rotateX(${-y * 5}deg) rotateY(${x * 7}deg) translateY(-3px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0)";
      });
    });

    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (e) => {
        const r = button.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        button.style.transform = `translate(${x * 0.08}px,${y * 0.12}px)`;
      });
      button.addEventListener("pointerleave", () => {
        button.style.transform = "";
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });
  });

  let knock = "";
  addEventListener("keydown", (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key.length !== 1) return;
    knock = (knock + e.key.toLowerCase()).slice(-8);
    if (knock === "tensorme") location.href = "/tensor-room/";
  });
})();
