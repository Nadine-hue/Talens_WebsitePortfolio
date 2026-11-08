/* PORTFOLIO INTERACTIONS
   Order: music control, mobile navigation, dynamic year,
   project carousel, skills carousel, contact form, background
   animation. Each feature checks for its required HTML nodes. */

// Cache the page elements used by the interactive features.
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const yearElement = document.getElementById("year");
const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");

// 1. Background music: keep playback and button state synchronized.
if (musicToggle && bgMusic) {
  const setMusicButtonState = (isPlaying) => {
    musicToggle.classList.toggle("is-on", isPlaying);
    musicToggle.textContent = isPlaying ? "♫" : "♪";
    musicToggle.setAttribute("aria-label", isPlaying ? "Pause background music" : "Play background music");
  };

  const tryPlayMusic = async () => {
    const source = bgMusic.getAttribute("src");
    if (!source || source.trim() === "") {
      setMusicButtonState(false);
      return;
    }

    try {
      bgMusic.volume = 0.3;
      bgMusic.currentTime = 2;
      await bgMusic.play();
      setMusicButtonState(true);
    } catch (error) {
      setMusicButtonState(false);
    }
  };

  musicToggle.addEventListener("click", async () => {
    if (bgMusic.paused) {
      await tryPlayMusic();
      return;
    }

    bgMusic.pause();
    setMusicButtonState(false);
  });

  document.addEventListener(
    "pointerdown",
    () => {
      if (bgMusic.paused && bgMusic.getAttribute("src")) {
        tryPlayMusic();
      }
    },
    { once: true }
  );

  bgMusic.addEventListener("error", () => setMusicButtonState(false));
  setMusicButtonState(false);
}

// 2. Mobile navigation: toggle the menu and close it after a link is selected.
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "×" : "☰";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  });
}

// 3. Footer: update the copyright year automatically.
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// 4. Projects carousel: synchronize the slider, counter, and navigation buttons.
const projectTrack = document.querySelector(".projects-grid");
const projectCards = projectTrack ? [...projectTrack.querySelectorAll(".project-card")] : [];
const projectsRange = document.getElementById("projectsRange");
const projectsCount = document.getElementById("projectsCount");
const projectPrevious = document.getElementById("projectPrevious");
const projectNext = document.getElementById("projectNext");

if (projectTrack && projectsRange && projectsCount && projectCards.length) {
  projectsRange.max = String(projectCards.length - 1);
  let requestedProjectIndex = null;
  let projectScrollTimer;

  function updateProjectsControls(preferredIndex = null) {
    const trackLeft = projectTrack.getBoundingClientRect().left;
    const nearestIndex = projectCards.reduce((closestIndex, card, index) => {
      const cardPosition = card.getBoundingClientRect().left - trackLeft + projectTrack.scrollLeft;
      const currentPosition = projectCards[closestIndex].getBoundingClientRect().left - trackLeft + projectTrack.scrollLeft;
      return Math.abs(cardPosition - projectTrack.scrollLeft) < Math.abs(currentPosition - projectTrack.scrollLeft)
        ? index
        : closestIndex;
    }, 0);
      const selectedIndex = preferredIndex ?? requestedProjectIndex ?? nearestIndex;

    projectsRange.value = String(selectedIndex);
    projectsRange.setAttribute("aria-valuetext", `Project ${selectedIndex + 1} of ${projectCards.length}: ${projectCards[selectedIndex].querySelector("h3").textContent}`);
    projectsCount.textContent = `${String(selectedIndex + 1).padStart(2, "0")} / ${String(projectCards.length).padStart(2, "0")}`;
    if (projectPrevious) projectPrevious.disabled = selectedIndex === 0;
    if (projectNext) projectNext.disabled = selectedIndex === projectCards.length - 1;
  }

  function showProject(index) {
    const targetIndex = Math.max(0, Math.min(index, projectCards.length - 1));
    const target = projectCards[targetIndex];
    requestedProjectIndex = targetIndex;
    projectsRange.value = String(targetIndex);
    updateProjectsControls(targetIndex);
    projectTrack.scrollTo({
      left: target.offsetLeft - projectTrack.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  }

  projectsRange.addEventListener("input", () => showProject(Number(projectsRange.value)));
  projectPrevious?.addEventListener("click", () => showProject(Number(projectsRange.value) - 1));
  projectNext?.addEventListener("click", () => showProject(Number(projectsRange.value) + 1));
  projectTrack.addEventListener("scroll", () => {
    if (requestedProjectIndex !== null) {
      window.clearTimeout(projectScrollTimer);
      projectScrollTimer = window.setTimeout(() => {
        requestedProjectIndex = null;
        updateProjectsControls();
      }, 140);
      return;
    }
    updateProjectsControls();
  }, { passive: true });
  window.addEventListener("resize", () => updateProjectsControls());
  updateProjectsControls();
}

// 5. Skills carousel: synchronize category navigation and its counter.
const skillsTrack = document.querySelector(".skills-grid");
const skillCards = skillsTrack ? [...skillsTrack.querySelectorAll(".skill-card")] : [];
const skillsRange = document.getElementById("skillsRange");
const skillsCount = document.getElementById("skillsCount");
const skillPrevious = document.getElementById("skillPrevious");
const skillNext = document.getElementById("skillNext");

if (skillsTrack && skillsRange && skillsCount && skillCards.length) {
  skillsRange.max = String(skillCards.length - 1);
  let requestedSkillIndex = null;
  let skillScrollTimer;

  function updateSkillsControls(preferredIndex = null) {
    const trackLeft = skillsTrack.getBoundingClientRect().left;
    const nearestIndex = skillCards.reduce((closestIndex, card, index) => {
      const cardPosition = card.getBoundingClientRect().left - trackLeft + skillsTrack.scrollLeft;
      const currentPosition = skillCards[closestIndex].getBoundingClientRect().left - trackLeft + skillsTrack.scrollLeft;
      return Math.abs(cardPosition - skillsTrack.scrollLeft) < Math.abs(currentPosition - skillsTrack.scrollLeft)
        ? index
        : closestIndex;
    }, 0);
    const selectedIndex = preferredIndex ?? requestedSkillIndex ?? nearestIndex;

    skillsRange.value = String(selectedIndex);
    skillsRange.setAttribute("aria-valuetext", `Skill category ${selectedIndex + 1} of ${skillCards.length}: ${skillCards[selectedIndex].querySelector("h3").textContent}`);
    skillsCount.textContent = `${String(selectedIndex + 1).padStart(2, "0")} / ${String(skillCards.length).padStart(2, "0")}`;
    if (skillPrevious) skillPrevious.disabled = selectedIndex === 0;
    if (skillNext) skillNext.disabled = selectedIndex === skillCards.length - 1;
  }

  function showSkillCategory(index) {
    const targetIndex = Math.max(0, Math.min(index, skillCards.length - 1));
    const target = skillCards[targetIndex];
    requestedSkillIndex = targetIndex;
    skillsRange.value = String(targetIndex);
    updateSkillsControls(targetIndex);
    skillsTrack.scrollTo({
      left: target.offsetLeft - skillsTrack.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  }

  skillsRange.addEventListener("input", () => showSkillCategory(Number(skillsRange.value)));
  skillPrevious?.addEventListener("click", () => showSkillCategory(Number(skillsRange.value) - 1));
  skillNext?.addEventListener("click", () => showSkillCategory(Number(skillsRange.value) + 1));
  skillsTrack.addEventListener("scroll", () => {
    if (requestedSkillIndex !== null) {
      window.clearTimeout(skillScrollTimer);
      skillScrollTimer = window.setTimeout(() => {
        requestedSkillIndex = null;
        updateSkillsControls();
      }, 140);
      return;
    }
    updateSkillsControls();
  }, { passive: true });
  window.addEventListener("resize", () => updateSkillsControls());
  updateSkillsControls();
}

// 6. Contact form: prepare an email in the visitor’s email application.
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");

    if (!nameInput || !emailInput || !messageInput) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    const recipient = "nadine.talens09@gmail.com"; // Matches the email shown in the Contact section.
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

    if (formNote) {
      formNote.textContent =
        "Your email app should open with the message prepared. Review it and press Send in your email application.";
    }

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  });
}


// 7. Ambient background: animate subtle rain and fireflies on the decorative canvas.
// Respect the visitor’s reduced-motion preference where supported.
(() => {
  const canvas = document.getElementById("ambientCanvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0;
  let height = 0;
  let raindrops = [];
  let fireflies = [];
  let animationFrame = 0;
  let lastFrame = 0;

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    raindrops = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 5 + Math.random() * 5,
      speed: 0.8 + Math.random() * 0.7,
      drift: 0.15 + Math.random() * 0.25,
      alpha: 0.15 + Math.random() * 0.1
    }));
    fireflies = Array.from({ length: 26 }, () => ({
      x: width * (0.24 + Math.random() * 0.52),
      y: height * (0.30 + Math.random() * 0.64),
      radius: 1 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.3 + Math.random() * 0.35
    }));
  }

  function drawPathway(time) {
    const horizonY = height * 0.68;
    const centerX = width * 0.5;
    const bottomY = height * 1.04;

    // A softly lit sidewalk receding into the distance.
    const path = context.createLinearGradient(0, horizonY, 0, height);
    path.addColorStop(0, "rgba(145, 132, 190, 0.04)");
    path.addColorStop(1, "rgba(145, 132, 190, 0.18)");
    context.beginPath();
    context.moveTo(centerX - width * 0.035, horizonY);
    context.lineTo(centerX + width * 0.035, horizonY);
    context.lineTo(centerX + width * 0.40, bottomY);
    context.lineTo(centerX - width * 0.40, bottomY);
    context.closePath();
    context.fillStyle = path;
    context.fill();

    // Perspective edges and subtle sidewalk seams.
    context.lineWidth = 1;
    context.strokeStyle = "rgba(196, 184, 255, 0.24)";
    context.beginPath();
    context.moveTo(centerX - width * 0.035, horizonY);
    context.lineTo(centerX - width * 0.40, bottomY);
    context.moveTo(centerX + width * 0.035, horizonY);
    context.lineTo(centerX + width * 0.40, bottomY);
    context.stroke();

    for (let i = 1; i <= 5; i++) {
      const t = i / 6;
      const y = horizonY + (height - horizonY) * t * t;
      const halfWidth = width * (0.035 + 0.34 * t * t);
      context.beginPath();
      context.moveTo(centerX - halfWidth, y);
      context.lineTo(centerX + halfWidth, y);
      context.strokeStyle = `rgba(196, 184, 255, ${0.06 + t * 0.06})`;
      context.stroke();
    }

    // Small low landscape lights along the pathway, with soft violet-white halos.
    const pulse = 0.82 + Math.sin(time * 0.0008) * 0.08;
    [0.22, 0.36, 0.51, 0.67, 0.82].forEach((t, index) => {
      const y = horizonY + (height - horizonY) * t * t;
      const spread = width * (0.04 + 0.31 * t * t);
      [-1, 1].forEach((side) => {
        const x = centerX + side * spread;
        const radius = 1.2 + t * 2.1;
        const glow = context.createRadialGradient(x, y, 0, x, y, 12 + t * 22);
        glow.addColorStop(0, `rgba(211, 201, 255, ${0.20 * pulse})`);
        glow.addColorStop(0.25, `rgba(169, 154, 255, ${0.12 * pulse})`);
        glow.addColorStop(1, "rgba(169, 154, 255, 0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(x, y, 12 + t * 22, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = `rgba(218, 209, 255, ${0.48 * pulse})`;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      });
    });
  }

  function draw(time = 0) {
    // Cap work on high-refresh displays to keep the effect lightweight.
    if (time - lastFrame < 30) {
      animationFrame = window.requestAnimationFrame(draw);
      return;
    }
    lastFrame = time;
    context.clearRect(0, 0, width, height);
    drawPathway(time);

    // A sparse, gentle drizzle adds a little movement to the night scene.
    context.lineWidth = 1;
    for (const drop of raindrops) {
      drop.x += drop.drift;
      drop.y += drop.speed;
      if (drop.y > height + drop.length) {
        drop.y = -drop.length;
        drop.x = Math.random() * width;
      }
      if (drop.x > width + 2) drop.x = -2;
      context.beginPath();
      context.moveTo(drop.x, drop.y);
      context.lineTo(drop.x - drop.drift, drop.y + drop.length);
      context.strokeStyle = `rgba(205, 195, 255, ${drop.alpha})`;
      context.stroke();
    }

    // Fireflies drift gently and brighten in slow, independent pulses.
    for (const firefly of fireflies) {
      const driftX = Math.sin(time * 0.00022 + firefly.phase) * 10;
      const driftY = Math.cos(time * 0.00018 + firefly.phase) * 8;
      const pulse = 0.25 + (Math.sin(time * 0.0012 + firefly.phase) + 1) * 0.375;
      const x = firefly.x + driftX;
      const y = firefly.y + driftY;
      const glow = context.createRadialGradient(x, y, 0, x, y, 10 + firefly.radius * 5);
      glow.addColorStop(0, `rgba(226, 255, 151, ${firefly.alpha * pulse})`);
      glow.addColorStop(0.25, `rgba(190, 239, 111, ${firefly.alpha * pulse * 0.45})`);
      glow.addColorStop(1, "rgba(190, 239, 111, 0)");
      context.fillStyle = glow;
      context.beginPath();
      context.arc(x, y, 10 + firefly.radius * 5, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.arc(x, y, firefly.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(238, 255, 194, ${firefly.alpha * pulse})`;
      context.fill();
    }
    animationFrame = window.requestAnimationFrame(draw);
  }

  function startAnimation() {
    window.cancelAnimationFrame(animationFrame);
    if (reduceMotion.matches) {
      context.clearRect(0, 0, width, height);
      canvas.style.display = "none";
      return;
    }
    canvas.style.display = "block";
    resizeCanvas();
    lastFrame = 0;
    animationFrame = window.requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", startAnimation);
  } else if (reduceMotion.addListener) {
    reduceMotion.addListener(startAnimation);
  }
  startAnimation();
})();

// Dazai inspection warning and basic shortcut deterrents.
// These handlers discourage common shortcuts; they cannot prevent all browser inspection.
(() => {
  const popup = document.getElementById("inspection-popup");
  const closeButton = document.getElementById("inspection-close");
  if (!popup) return;

  let lastX = window.innerWidth / 2;
  let lastY = window.innerHeight / 2;
  let hideTimer = null;

  document.addEventListener("mousemove", (event) => {
    lastX = event.clientX;
    lastY = event.clientY;
  }, { passive: true });

  function showInspectionWarning(x = lastX, y = lastY) {
    window.clearTimeout(hideTimer);
    popup.hidden = false;
    popup.setAttribute("aria-hidden", "false");

    // Keep the popup centered and use the pointer position only as a visual origin.
    const cloud = popup.querySelector(".inspection-cloud");
    if (cloud) {
      cloud.style.transformOrigin = `${Math.max(0, Math.min(x, window.innerWidth))}px ${Math.max(0, Math.min(y, window.innerHeight))}px`;
    }

    closeButton?.focus({ preventScroll: true });
    hideTimer = window.setTimeout(hideInspectionWarning, 5000);
  }

  function hideInspectionWarning() {
    popup.hidden = true;
    popup.setAttribute("aria-hidden", "true");
    if (document.activeElement === closeButton) closeButton.blur();
  }

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    showInspectionWarning(event.clientX, event.clientY);
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const blockedShortcut =
      event.key === "F12" ||
      (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
      (event.ctrlKey && key === "u") ||
      (event.metaKey && event.altKey && ["i", "j", "c"].includes(key)) ||
      (event.metaKey && key === "u");

    if (blockedShortcut) {
      event.preventDefault();
      event.stopPropagation();
      showInspectionWarning(lastX, lastY);
    } else if (event.key === "Escape" && !popup.hidden) {
      hideInspectionWarning();
    }
  });

  closeButton?.addEventListener("click", hideInspectionWarning);

  popup.addEventListener("click", (event) => {
    if (event.target === popup) hideInspectionWarning();
  });
})();

