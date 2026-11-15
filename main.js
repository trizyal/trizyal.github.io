document.addEventListener("DOMContentLoaded", () => {
  initHeroCanvas();
  initRaytracerCarousel();
  initProjectFilters();
  initFooterYear();
});

/**
 * Full-Viewport Brownian Mesh Field + Interactive Mouse Perturbation & Colored Trail
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
        [-1, t, 0],
        [1, t, 0],
        [-1, -t, 0],
        [1, -t, 0],
        [0, -1, t],
        [0, 1, t],
        [0, -1, -t],
        [0, 1, -t],
        [t, 0, -1],
        [t, 0, 1],
        [-t, 0, -1],
        [-t, 0, 1],
      ],
      edges: [
        [0, 11],
        [0, 5],
        [0, 1],
        [0, 7],
        [0, 10],
        [1, 5],
        [5, 11],
        [11, 10],
        [10, 7],
        [7, 1],
        [3, 9],
        [3, 4],
        [3, 2],
        [3, 6],
        [3, 8],
        [4, 9],
        [2, 4],
        [6, 2],
        [8, 6],
        [9, 8],
        [1, 9],
        [5, 4],
        [11, 2],
        [10, 6],
        [7, 8],
      ],
    },
    octahedron: {
      vertices: [
        [1.4, 0, 0],
        [-1.4, 0, 0],
        [0, 1.4, 0],
        [0, -1.4, 0],
        [0, 0, 1.4],
        [0, 0, -1.4],
      ],
      edges: [
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [2, 4],
        [4, 3],
        [3, 5],
        [5, 2],
      ],
    },
    tetrahedron: {
      vertices: [
        [1.2, 1.2, 1.2],
        [-1.2, -1.2, 1.2],
        [-1.2, 1.2, -1.2],
        [1.2, -1.2, -1.2],
      ],
      edges: [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [2, 3],
        [3, 1],
      ],
    },
  };

  const shapeKeys = Object.keys(SHAPES);

  // --- Mouse State & Colored Trail History ---
  const mouse = {
    x: null,
    y: null,
    vx: 0,
    vy: 0,
    active: false,
  };

  const trail = [];
  const MAX_TRAIL_AGE = 45;

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

    trail.push({
      x: newX,
      y: newY,
      age: 0,
      maxAge: MAX_TRAIL_AGE,
    });
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
      this.alpha = 0.18 + (this.scale / 58) * 0.28;

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

    draw() {
      const projected = this.shape.vertices.map((v) => this.projectVertex(v));

      let highlight = 0;
      if (mouse.active && mouse.x !== null) {
        const d = Math.hypot(this.x - mouse.x, this.y - mouse.y);
        if (d < 210) highlight = 1 - d / 210;
      }

      ctx.strokeStyle =
        highlight > 0.05
          ? `rgba(244, 114, 182, ${this.alpha + highlight * 0.35})`
          : `rgba(59, 156, 186, ${this.alpha})`;

      ctx.lineWidth = 1.1;
      ctx.beginPath();
      this.shape.edges.forEach(([i, j]) => {
        ctx.moveTo(projected[i].x, projected[i].y);
        ctx.lineTo(projected[j].x, projected[j].y);
      });
      ctx.stroke();

      ctx.fillStyle =
        highlight > 0.05
          ? `rgba(251, 191, 36, ${0.45 + highlight * 0.5})`
          : `rgba(56, 189, 248, ${this.alpha + 0.15})`;

      projected.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  // Spawn 24 floating meshes to cover the full website nicely
  const MESH_COUNT = 24;
  const meshes = Array.from({ length: MESH_COUNT }, () => new BrownianMesh());

  function drawMouseTrail() {
    for (let i = trail.length - 1; i >= 0; i--) {
      trail[i].age++;
      if (trail[i].age >= trail[i].maxAge) {
        trail.splice(i, 1);
      }
    }

    if (trail.length < 2) return;

    for (let i = 1; i < trail.length; i++) {
      const p0 = trail[i - 1];
      const p1 = trail[i];
      const lifeRatio = 1 - p1.age / p1.maxAge;

      const r = Math.round(245 - (1 - lifeRatio) * 15);
      const g = Math.round(158 * lifeRatio + 65 * (1 - lifeRatio));
      const b = Math.round(11 + (1 - lifeRatio) * 135);

      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lifeRatio * 0.8})`;
      ctx.lineWidth = Math.max(1, lifeRatio * 5);
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }

    if (mouse.active && mouse.x !== null) {
      const grad = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        28,
      );
      grad.addColorStop(0, "rgba(251, 191, 36, 0.4)");
      grad.addColorStop(1, "rgba(236, 72, 153, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 28, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    mouse.vx *= 0.85;
    mouse.vy *= 0.85;

    for (const mesh of meshes) {
      mesh.update();
      mesh.draw();
    }

    drawMouseTrail();

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
        card.classList.toggle("hidden", !isMatch);
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
