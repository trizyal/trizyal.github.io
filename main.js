document.addEventListener("DOMContentLoaded", () => {
  initHeroCanvas();
  initRaytracerCarousel();
  initProjectFilters();
  initFooterYear();
});

/**
 * 1. Multi-Mesh Brownian Motion Field + Interactive Mouse Perturbation & Colored Trail
 */
function initHeroCanvas() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width, height;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
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

  const trail = []; // Stores { x, y, age, maxAge }
  const MAX_TRAIL_AGE = 38;

  window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;

    // Only track trail while inside the hero viewport
    if (newY >= 0 && newY <= height && newX >= 0 && newX <= width) {
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
    } else {
      mouse.active = false;
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
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;

      // Scale & depth variation
      this.scale = 18 + Math.random() * 34;
      this.alpha = 0.16 + (this.scale / 52) * 0.25;

      // 3D rotation angles & angular velocities
      this.angleX = Math.random() * Math.PI * 2;
      this.angleY = Math.random() * Math.PI * 2;
      this.angleZ = Math.random() * Math.PI * 2;

      this.spinX = (Math.random() - 0.5) * 0.012;
      this.spinY = (Math.random() - 0.5) * 0.012;
      this.spinZ = (Math.random() - 0.5) * 0.008;
    }

    update() {
      // 1. Brownian stochastic impulse (Gaussian-like random walk jitter)
      const brownianStrength = 0.09;
      this.vx += (Math.random() + Math.random() - 1) * brownianStrength;
      this.vy += (Math.random() + Math.random() - 1) * brownianStrength;

      // 2. Mouse perturbation & repulsion field
      if (mouse.active && mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        const influenceRadius = 190;

        if (dist < influenceRadius && dist > 0.01) {
          const falloff = 1 - dist / influenceRadius;

          // Radial push away from cursor + wake drag from mouse velocity
          const pushForce = falloff * 0.45;
          this.vx += (dx / dist) * pushForce + mouse.vx * falloff * 0.025;
          this.vy += (dy / dist) * pushForce + mouse.vy * falloff * 0.025;

          // Excite 3D rotation when disturbed by mouse
          this.angleX += this.spinX * falloff * 4;
          this.angleY += this.spinY * falloff * 4;
        }
      }

      // 3. Viscous fluid damping (keeps velocities bounded)
      this.vx *= 0.965;
      this.vy *= 0.965;

      // 4. Integrate position & rotation
      this.x += this.vx;
      this.y += this.vy;

      this.angleX += this.spinX;
      this.angleY += this.spinY;
      this.angleZ += this.spinZ;

      // 5. Soft toroidal screen wrap with padding
      const pad = 80;
      if (this.x < -pad) this.x = width + pad;
      if (this.x > width + pad) this.x = -pad;
      if (this.y < -pad) this.y = height + pad;
      if (this.y > height + pad) this.y = -pad;
    }

    projectVertex([vx, vy, vz]) {
      // Rotate X
      const y1 = vy * Math.cos(this.angleX) - vz * Math.sin(this.angleX);
      const z1 = vy * Math.sin(this.angleX) + vz * Math.cos(this.angleX);

      // Rotate Y
      const x2 = vx * Math.cos(this.angleY) + z1 * Math.sin(this.angleY);
      const z2 = -vx * Math.sin(this.angleY) + z1 * Math.cos(this.angleY);

      // Rotate Z
      const x3 = x2 * Math.cos(this.angleZ) - y1 * Math.sin(this.angleZ);
      const y3 = x2 * Math.sin(this.angleZ) + y1 * Math.cos(this.angleZ);

      // Perspective projection
      const perspective = 4 / (4 + z2 * 0.45);
      return {
        x: this.x + x3 * this.scale * perspective,
        y: this.y + y3 * this.scale * perspective,
      };
    }

    draw() {
      const projected = this.shape.vertices.map((v) => this.projectVertex(v));

      // Check proximity to mouse for subtle highlight tint
      let highlight = 0;
      if (mouse.active && mouse.x !== null) {
        const d = Math.hypot(this.x - mouse.x, this.y - mouse.y);
        if (d < 190) highlight = 1 - d / 190;
      }

      ctx.strokeStyle =
        highlight > 0.05
          ? `rgba(244, 114, 182, ${this.alpha + highlight * 0.35})` // Warm pink/magenta tint near cursor
          : `rgba(59, 156, 186, ${this.alpha})`;

      ctx.lineWidth = 1.1;
      ctx.beginPath();
      this.shape.edges.forEach(([i, j]) => {
        ctx.moveTo(projected[i].x, projected[i].y);
        ctx.lineTo(projected[j].x, projected[j].y);
      });
      ctx.stroke();

      // Vertices
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

  // Spawn 16 floating Brownian meshes
  const MESH_COUNT = 16;
  const meshes = Array.from({ length: MESH_COUNT }, () => new BrownianMesh());

  // --- Render Colored Mouse Trail ---
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
      const lifeRatio = 1 - p1.age / p1.maxAge; // 1.0 = newest, 0.0 = oldest

      // Gradient color shift along the trail: Amber/Gold -> Coral/Magenta
      const r = Math.round(245 - (1 - lifeRatio) * 15);
      const g = Math.round(158 * lifeRatio + 65 * (1 - lifeRatio));
      const b = Math.round(11 + (1 - lifeRatio) * 135);

      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lifeRatio * 0.75})`;
      ctx.lineWidth = Math.max(1, lifeRatio * 4.5);
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }

    // Subtle glowing cursor core
    if (mouse.active && mouse.x !== null) {
      const grad = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        24,
      );
      grad.addColorStop(0, "rgba(251, 191, 36, 0.35)");
      grad.addColorStop(1, "rgba(236, 72, 153, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 24, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Main Animation Loop ---
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Decay mouse velocity smoothly when cursor pauses
    mouse.vx *= 0.85;
    mouse.vy *= 0.85;

    // Update & render all Brownian 3D meshes
    for (const mesh of meshes) {
      mesh.update();
      mesh.draw();
    }

    // Render colored cursor ribbon trail on top
    drawMouseTrail();

    requestAnimationFrame(animate);
  }

  animate();
}

/**
 * 2. Image Carousel for the Optical Physics Raytracer
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
 * 3. Category Filter Tabs for Projects
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
 * 4. Automatic Copyright Year
 */
function initFooterYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
