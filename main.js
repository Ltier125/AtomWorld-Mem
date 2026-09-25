(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealElements = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = Array.from(document.querySelectorAll("main section[id]"));

  if ("IntersectionObserver" in window && navLinks.length && sections.length) {
    const linkById = new Map(
      navLinks.map((link) => [link.getAttribute("href").slice(1), link])
    );

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        navLinks.forEach((link) => link.classList.remove("is-active"));
        linkById.get(visible.target.id)?.classList.add("is-active");
      },
      { rootMargin: "-30% 0px -58%", threshold: [0.01, 0.2, 0.5] }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const motionImage = document.querySelector("[data-motion-src]");
  if (motionImage && !reduceMotion) {
    const loadMotion = () => {
      const source = motionImage.dataset.motionSrc;
      if (!source || motionImage.dataset.motionLoaded === "true") return;
      motionImage.dataset.motionLoaded = "true";
      motionImage.src = source;
      motionImage.closest(".motion-frame")?.classList.add("is-animated");
    };

    if ("IntersectionObserver" in window) {
      const motionObserver = new IntersectionObserver(
        (entries, observer) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          loadMotion();
          observer.disconnect();
        },
        { rootMargin: "420px 0px", threshold: 0.01 }
      );
      motionObserver.observe(motionImage);
    } else {
      loadMotion();
    }
  }

  const copyButton = document.querySelector("[data-copy-target]");
  copyButton?.addEventListener("click", async () => {
    const target = document.getElementById(copyButton.dataset.copyTarget);
    const label = copyButton.querySelector("span");
    if (!target || !label) return;

    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      label.textContent = "Copied";
      copyButton.classList.add("is-copied");
      window.setTimeout(() => {
        label.textContent = "Copy";
        copyButton.classList.remove("is-copied");
      }, 1800);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(target);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      label.textContent = "Selected";
    }
  });
})();
