document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initHeroCanvas();
  initRaytracerCarousel();
  initProjectFilters();
  initFooterYear();
});

/**
 * Handle Light/Dark Mode Toggling
 */
function initThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches) ||
    !("theme" in localStorage)
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  toggleBtn.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    if (document.documentElement.classList.contains("dark")) {
      localStorage.theme = "dark";
    } else {
      localStorage.theme = "light";
    }
  });
}

/**
 * Full-Viewport Brownian Mesh Field + Magical Pink Particle Trail
 */
function initHeroCanvas() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  // --- Polyhedron Geometry Definitions ---
  const t = (1 + Math.sqrt(5)) / 2;

  const SHAPES = {
    icosahedron: {
      vertices: [
        [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
        [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
        [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
      ],
      edges: [
        [0, 11], [0, 5], [0, 1], [0, 7], [0, 10], [1, 5],
        [5, 11], [11, 10], [10, 7], [7, 1], [3, 9], [3, 4],
        [3, 2], [3, 6], [3, 8], [4, 9], [2, 4], [6, 2], [8, 6],
        [9, 8], [1, 9], [5, 4], [11, 2], [10, 6], [7, 8]
      ],
    },
    octahedron: {
      vertices: [
        [1.4, 0, 0], [-1.4, 0, 0], [0, 1.4, 0],
        [0, -1.4, 0], [0, 0, 1.4], [0, 0, -1.4]
      ],
      edges: [
        [0, 2], [0, 3], [0, 4], [0, 5],
        [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 4], [4, 3], [3, 5], [5, 2]
      ],
    },
    tetrahedron: {
      vertices: [
        [1.2, 1.2, 1.2], [-1.2, -1.2, 1.2],
        [-1.2, 1.2, -1.2], [1.2, -1.2, -1.2]
      ],
      edges: [
        [0, 1], [0, 2], [0, 3],
        [1, 2], [2, 3], [3, 1]
      ],
    },
  };

  const shapeKeys = Object.keys(SHAPES);

  // --- Mouse State & Magical Particle Trail History ---
  const mouse = {
    x: null,
    y: null,
    vx: 0,
    vy: 0,
    active: false,
  };

  const trailParticles = [];

  window.addEventListener("mousemove", (e) => {
    const newX = e.clientX;
    const newY = e.clientY;

    if (mouse.x !== null) {
      mouse.vx = newX - mouse.x;
      mouse.vy = newY - mouse.y;
    }
    mouse.x = newX;
    mouse.y = newY;
    mouse.active = true;

    const particleShapes = ["heart", "star", "sparkle"];
    const pinks = [
      [255, 105, 180], // HotPink
      [255, 20, 147],  // DeepPink
      [255, 182, 193], // LightPink
      [255, 192, 203], // Pink
      [219, 39, 119],  // Deep Rose/Pink
    ];

    // Spawn 2 particles per mouse movement for a lush trail
    for (let i = 0; i < 2; i++) {
      trailParticles.push({
        x: newX + (Math.random() - 0.5) * 20,
        y: newY + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
        life: 0,
        maxLife: 30 + Math.random() * 25,
        shape: particleShapes[Math.floor(Math.random() * particleShapes.length)],
        color: pinks[Math.floor(Math.random() * pinks.length)],
        size: 5 + Math.random() * 9,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
      });
    }
  });

  window.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

// --- Brownian Mesh Particle Class ---
  class BrownianMesh {
    constructor() {
      const key = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
      this.shape = SHAPES[key];

      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;

      this.scale = 20 + Math.random() * 38;

      // 1. Boosted base opacity (was 0.18 + ... * 0.28)
      this.alpha = 0.45 + (this.scale / 58) * 0.45;

      this.angleX = Math.random() * Math.PI * 2;
      this.angleY = Math.random() * Math.PI * 2;
      this.angleZ = Math.random() * Math.PI * 2;

      this.spinX = (Math.random() - 0.5) * 0.01;
      this.spinY = (Math.random() - 0.5) * 0.01;
      this.spinZ = (Math.random() - 0.5) * 0.007;
    }

    update() {
      const brownianStrength = 0.08;
      this.vx += (Math.random() + Math.random() - 1) * brownianStrength;
      this.vy += (Math.random() + Math.random() - 1) * brownianStrength;

      if (mouse.active && mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        const influenceRadius = 210;

        if (dist < influenceRadius && dist > 0.01) {
          const falloff = 1 - dist / influenceRadius;
          const pushForce = falloff * 0.4;
          this.vx += (dx / dist) * pushForce + mouse.vx * falloff * 0.02;
          this.vy += (dy / dist) * pushForce + mouse.vy * falloff * 0.02;

          this.angleX += this.spinX * falloff * 3.5;
          this.angleY += this.spinY * falloff * 3.5;
        }
      }

      this.vx *= 0.968;
      this.vy *= 0.968;

      this.x += this.vx;
      this.y += this.vy;

      this.angleX += this.spinX;
      this.angleY += this.spinY;
      this.angleZ += this.spinZ;

      const pad = 100;
      if (this.x < -pad) this.x = width + pad;
      if (this.x > width + pad) this.x = -pad;
      if (this.y < -pad) this.y = height + pad;
      if (this.y > height + pad) this.y = -pad;
    }

    projectVertex([vx, vy, vz]) {
      const y1 = vy * Math.cos(this.angleX) - vz * Math.sin(this.angleX);
      const z1 = vy * Math.sin(this.angleX) + vz * Math.cos(this.angleX);
      const x2 = vx * Math.cos(this.angleY) + z1 * Math.sin(this.angleY);
      const z2 = -vx * Math.sin(this.angleY) + z1 * Math.cos(this.angleY);
      const x3 = x2 * Math.cos(this.angleZ) - y1 * Math.sin(this.angleZ);
      const y3 = x2 * Math.sin(this.angleZ) + y1 * Math.cos(this.angleZ);

      const perspective = 4 / (4 + z2 * 0.45);
      return {
        x: this.x + x3 * this.scale * perspective,
        y: this.y + y3 * this.scale * perspective,
      };
    }

    draw(isDark) {
      const projected = this.shape.vertices.map((v) => this.projectVertex(v));

      let highlight = 0;
      if (mouse.active && mouse.x !== null) {
        const d = Math.hypot(this.x - mouse.x, this.y - mouse.y);
        if (d < 210) highlight = 1 - d / 210;
      }

      // 2. Brighter, more saturated color palettes
      const baseCyan = isDark ? '34, 211, 238' : '6, 182, 212';
      const highlightPink = isDark ? '244, 114, 182' : '236, 72, 153';
      const fillCyan = isDark ? '125, 211, 252' : '2, 132, 199';
      const fillAmber = isDark ? '253, 224, 71' : '245, 158, 11';

      // 3. Add shadowBlur for a neon glow effect
      ctx.shadowBlur = isDark ? 10 : 5;
      ctx.shadowColor = highlight > 0.05
          ? `rgba(${highlightPink}, 0.8)`
          : `rgba(${baseCyan}, 0.6)`;

      ctx.strokeStyle = highlight > 0.05
          ? `rgba(${highlightPink}, ${this.alpha + highlight * 0.5})`
          : `rgba(${baseCyan}, ${this.alpha})`;

      // 4. Thicker wireframe lines (was 1.1)
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      this.shape.edges.forEach(([i, j]) => {
        ctx.moveTo(projected[i].x, projected[i].y);
        ctx.lineTo(projected[j].x, projected[j].y);
      });
      ctx.stroke();

      ctx.fillStyle = highlight > 0.05
          ? `rgba(${fillAmber}, ${0.7 + highlight * 0.3})`
          : `rgba(${fillCyan}, ${this.alpha + 0.3})`;

      projected.forEach((p) => {
        ctx.beginPath();
        // 5. Slightly larger vertex nodes (was 1.8)
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Reset shadow so it doesn't bleed into other shapes
      ctx.shadowBlur = 0;
    }
  }

  const MESH_COUNT = 24;
  const meshes = Array.from({ length: MESH_COUNT }, () => new BrownianMesh());

  // --- Particle Drawing Helpers ---
  function drawStar(ctx, size) {
    const points = 5;
    const outerRadius = size * 0.7;
    const innerRadius = size * 0.3;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawHeart(ctx, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    ctx.bezierCurveTo(-size / 2, size / 2, 0, size * 0.8, 0, size);
    ctx.bezierCurveTo(0, size * 0.8, size / 2, size / 2, size / 2, topCurveHeight);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    ctx.fill();
  }

  function drawSparkle(ctx, size) {
    const s = size * 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(0, 0, s, 0);
    ctx.quadraticCurveTo(0, 0, 0, s);
    ctx.quadraticCurveTo(0, 0, -s, 0);
    ctx.quadraticCurveTo(0, 0, 0, -s);
    ctx.fill();
  }

  function drawMouseTrail(isDark) {
    for (let i = trailParticles.length - 1; i >= 0; i--) {
      const p = trailParticles[i];
      p.life++;

      if (p.life >= p.maxLife) {
        trailParticles.splice(i, 1);
        continue;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;

      const lifeRatio = 1 - p.life / p.maxLife;
      // Boost alpha for dark mode to make it brighter/more vivid
      const baseAlpha = isDark ? Math.min(1, lifeRatio * 1.2) : lifeRatio * 0.9;

      ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${baseAlpha})`;
      ctx.shadowBlur = isDark ? 18 : 12;
      ctx.shadowColor = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${baseAlpha})`;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      if (p.shape === "star") {
        drawStar(ctx, p.size);
      } else if (p.shape === "heart") {
        ctx.translate(0, -p.size * 0.35); // Center the heart visually
        drawHeart(ctx, p.size);
      } else {
        drawSparkle(ctx, p.size);
      }

      ctx.restore();
    }

    // Reset shadow so it doesn't affect other elements
    ctx.shadowBlur = 0;

    // Soft glowing cursor orb
    if (mouse.active && mouse.x !== null) {
      const grad = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        35
      );
      if (isDark) {
        grad.addColorStop(0, "rgba(255, 105, 180, 0.4)");
        grad.addColorStop(1, "rgba(236, 72, 153, 0)");
      } else {
        grad.addColorStop(0, "rgba(217, 119, 6, 0.3)");
        grad.addColorStop(1, "rgba(219, 39, 119, 0)");
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 35, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    mouse.vx *= 0.85;
    mouse.vy *= 0.85;

    const isDark = document.documentElement.classList.contains("dark");

    for (const mesh of meshes) {
      mesh.update();
      mesh.draw(isDark);
    }

    drawMouseTrail(isDark);

    requestAnimationFrame(animate);
  }

  animate();
}

/**
 * Image Carousel for the Optical Physics Raytracer
 */
function initRaytracerCarousel() {
  const container = document.getElementById("raytracer-carousel");
  if (!container) return;

  const slides = container.querySelectorAll(".carousel-slide");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  const counter = document.getElementById("carousel-counter");

  let currentIndex = 0;

  function updateCarousel(newIndex) {
    currentIndex = (newIndex + slides.length) % slides.length;
    slides.forEach((slide, idx) => {
      slide.classList.toggle("hidden", idx !== currentIndex);
    });
    if (counter) {
      counter.textContent = `${currentIndex + 1} / ${slides.length}`;
    }
  }

  prevBtn?.addEventListener("click", () => updateCarousel(currentIndex - 1));
  nextBtn?.addEventListener("click", () => updateCarousel(currentIndex + 1));
}

/**
 * Category Filter Tabs for Projects
 */
function initProjectFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      cards.forEach((card) => {
        const categories = card.dataset.category.split(" ");
        const isMatch = filter === "all" || categories.includes(filter);
        card.style.display = isMatch ? "grid" : "none";
      });
    });
  });
}

/**
 * Automatic Copyright Year
 */
function initFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}