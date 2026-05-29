(function () {
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");
  const askCard = document.getElementById("ask-card");
  const successCard = document.getElementById("success-card");
  const actions = document.getElementById("actions");

  const DODGE_RADIUS = 90;
  const DODGE_PADDING = 16;

  let particles = [];
  let animationId;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles() {
    const count = Math.floor((window.innerWidth * window.innerHeight) / 14000);
    particles = [];

    for (let i = 0; i < count; i++) {
      particles.push(createParticle(true));
    }
  }

  function createParticle(randomY) {
    const types = ["petal", "heart", "paw"];
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      x: Math.random() * window.innerWidth,
      y: randomY ? Math.random() * window.innerHeight : -20,
      size: 8 + Math.random() * 14,
      speedY: 0.3 + Math.random() * 0.7,
      speedX: (Math.random() - 0.5) * 0.5,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      opacity: 0.25 + Math.random() * 0.45,
      type,
      hue: 330 + Math.random() * 30,
    };
  }

  function drawPetal(x, y, size, rotation, opacity, hue) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    grad.addColorStop(0, `hsla(${hue}, 85%, 78%, 1)`);
    grad.addColorStop(1, `hsla(${hue}, 70%, 72%, 0.3)`);

    ctx.fillStyle = grad;
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / 5);
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.35, size * 0.22, size * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = `hsla(${hue}, 60%, 85%, ${opacity})`;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawHeart(x, y, size, opacity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = opacity * 0.7;
    ctx.fillStyle = `rgba(255, 143, 171, ${opacity})`;
    ctx.beginPath();
    const s = size * 0.35;
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(0, -s, -s * 1.4, -s, 0, s * 1.2);
    ctx.bezierCurveTo(s * 1.4, -s, 0, -s, 0, s * 0.3);
    ctx.fill();
    ctx.restore();
  }

  function drawPaw(x, y, size, opacity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = opacity * 0.55;
    ctx.fillStyle = `rgba(255, 180, 200, ${opacity})`;
    const pad = size * 0.22;
    [[-pad, -pad], [pad, -pad], [-pad * 0.6, pad]].forEach(([ox, oy]) => {
      ctx.beginPath();
      ctx.ellipse(ox, oy, pad * 0.55, pad * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.beginPath();
    ctx.ellipse(0, pad * 0.8, pad * 0.9, pad * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function animateParticles() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const p of particles) {
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.y * 0.01) * 0.15;
      p.rotation += p.spin;

      if (p.y > window.innerHeight + 30) {
        Object.assign(p, createParticle(false));
        p.y = -20;
      }

      if (p.type === "petal") {
        drawPetal(p.x, p.y, p.size, p.rotation, p.opacity, p.hue);
      } else if (p.type === "heart") {
        drawHeart(p.x, p.y, p.size, p.opacity);
      } else {
        drawPaw(p.x, p.y, p.size, p.opacity);
      }
    }

    animationId = requestAnimationFrame(animateParticles);
  }

  function getRandomPosition(btnRect) {
    const w = btnRect.width;
    const h = btnRect.height;
    const maxX = window.innerWidth - w - DODGE_PADDING;
    const maxY = window.innerHeight - h - DODGE_PADDING;
    const minX = DODGE_PADDING;
    const minY = DODGE_PADDING;

    let x, y, attempts = 0;
    do {
      x = minX + Math.random() * Math.max(0, maxX - minX);
      y = minY + Math.random() * Math.max(0, maxY - minY);
      attempts++;
    } while (
      attempts < 12 &&
      Math.hypot(x + w / 2 - (window.innerWidth / 2), y + h / 2 - (window.innerHeight / 2)) <
        120
    );

    return { x, y };
  }

  function dodgeNoButton(pointerX, pointerY) {
    const rect = btnNo.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(pointerX - cx, pointerY - cy);

    if (dist > DODGE_RADIUS) return;

    if (!btnNo.classList.contains("dodging")) {
      btnNo.classList.add("dodging");
    }

    const { x, y } = getRandomPosition(rect);
    btnNo.style.left = x + "px";
    btnNo.style.top = y + "px";
  }

  function resetNoButton() {
    btnNo.classList.remove("dodging");
    btnNo.style.left = "";
    btnNo.style.top = "";
  }

  function showSuccess() {
    askCard.classList.add("hidden");
    successCard.classList.remove("hidden");
    burstHearts();
  }

  function burstHearts() {
    for (let i = 0; i < 24; i++) {
      setTimeout(() => {
        particles.push({
          ...createParticle(false),
          x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
          y: window.innerHeight / 2 + (Math.random() - 0.5) * 100,
          speedY: -1 - Math.random() * 2,
          speedX: (Math.random() - 0.5) * 2,
          size: 12 + Math.random() * 16,
          opacity: 0.6 + Math.random() * 0.4,
          type: Math.random() > 0.3 ? "heart" : "petal",
        });
      }, i * 40);
    }
  }

  document.addEventListener("mousemove", (e) => dodgeNoButton(e.clientX, e.clientY));
  document.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches[0]) dodgeNoButton(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  btnNo.addEventListener("mouseenter", (e) => dodgeNoButton(e.clientX, e.clientY));
  btnNo.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      if (e.touches[0]) dodgeNoButton(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: false }
  );

  btnNo.addEventListener("click", (e) => {
    e.preventDefault();
    dodgeNoButton(e.clientX, e.clientY);
  });

  btnYes.addEventListener("click", showSuccess);

  window.addEventListener("resize", () => {
    resizeCanvas();
    resetNoButton();
  });

  resizeCanvas();
  animateParticles();
})();
