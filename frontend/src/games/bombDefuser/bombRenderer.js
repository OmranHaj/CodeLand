/**
 * Canvas 2D renderer for Defuse the Bomb: the bomb with its countdown display and three locks,
 * a burning plasma fuse with sparks, a red pulse in the last 15 seconds, the cryo cool-down when it
 * is defused and the explosion (flash, fireball, shockwave, burning shards, smoke, cracked glass).
 * The countdown advances with frame time (not the wall clock), so a hidden tab pauses the bomb.
 */

const COLORS = {
  red: "#ef4444",
  green: "#10b981",
  ice: "#7dd3fc",
  amber: "#f59e0b",
};

/** Seconds left when the red danger pulse starts. */
export const DANGER_SECONDS = 15;

const FUSE_POINTS = 64;
const SHARDS = 120;

const easeOutBack = (t) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;
const clamp01 = (t) => Math.max(0, Math.min(1, t));

export class BombRenderer {
  constructor(canvas, { reducedMotion = false, onTick, onTimeout } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.reducedMotion = reducedMotion;
    this.onTick = onTick;
    this.onTimeout = onTimeout;
    this.state = "idle"; // idle | ticking | defused | exploded
    this.durationMs = 60000;
    this.remaining = 60000;
    this.time = 0; // seconds since the current state began
    this.clock = 0;
    this.sparks = [];
    this.frost = [];
    this.shards = [];
    this.smoke = [];
    this.cracks = [];
    this.flash = 0;
    this.resolveEffect = null;
    this.last = 0;
    this.resize();
    this.loop = this.loop.bind(this);
    this.frame = requestAnimationFrame(this.loop);
  }

  resize() {
    const ratio = window.devicePixelRatio || 1;
    const { clientWidth: w, clientHeight: h } = this.canvas;
    this.w = w || 600;
    this.h = h || 480;
    this.canvas.width = Math.round(this.w * ratio);
    this.canvas.height = Math.round(this.h * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.layout();
  }

  layout() {
    const { w, h } = this;
    this.R = Math.min(w * 0.2, h * 0.24);
    this.cx = w / 2 - this.R * 0.35;
    this.cy = h * 0.6;
    const { R, cx, cy } = this;
    const a = -Math.PI / 3;
    this.cap = { x: cx + Math.cos(a) * R * 0.92, y: cy + Math.sin(a) * R * 0.92 };
    const p0 = { x: this.cap.x + R * 0.1, y: this.cap.y - R * 0.16 };
    const p1 = { x: p0.x + R * 0.45, y: p0.y - R * 0.7 };
    const p2 = { x: p0.x + R * 1.15, y: p0.y - R * 0.05 };
    const p3 = { x: p0.x + R * 1.0, y: p0.y - R * 0.75 };
    // Sampled from the bomb outward: index 0 touches the cap, the last point is the far end.
    this.fuse = Array.from({ length: FUSE_POINTS }, (_, i) => {
      const t = i / (FUSE_POINTS - 1);
      const u = 1 - t;
      return {
        x: u ** 3 * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t ** 3 * p3.x,
        y: u ** 3 * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t ** 3 * p3.y,
      };
    });
  }

  /** Shows a bomb waiting to be armed, its display at full time. */
  show(durationMs) {
    this.settle();
    this.state = "idle";
    this.durationMs = durationMs;
    this.remaining = durationMs;
    this.time = 0;
    this.sparks = [];
    this.frost = [];
    this.shards = [];
    this.smoke = [];
    this.cracks = [];
    this.flash = 0;
  }

  /** Lights the fuse. */
  arm(durationMs) {
    this.show(durationMs);
    this.state = "ticking";
  }

  remainingMs() {
    return this.remaining;
  }

  /** Stops the countdown: green display, locks spring open, the fuse freezes. Resolves when done. */
  defuse() {
    if (this.state !== "ticking") return Promise.resolve();
    this.settle();
    this.state = "defused";
    this.time = 0;
    this.sparks = [];
    if (!this.reducedMotion) {
      for (const p of this.fuse.slice(0, this.burnIndex() + 1)) {
        for (let k = 0; k < 2; k++) this.frost.push(this.particle(p.x, p.y, 40, 1.4, "frost"));
      }
    }
    return new Promise((resolve) => {
      this.resolveEffect = resolve;
      this.effectEnds = this.reducedMotion ? 0.4 : 1.9;
    });
  }

  explode() {
    this.settle();
    this.state = "exploded";
    this.time = 0;
    this.remaining = 0;
    this.sparks = [];
    this.flash = 1;
    const { cx, cy, R } = this;
    if (!this.reducedMotion) {
      const fire = ["#fde68a", "#fbbf24", "#f97316", "#ef4444", "#b91c1c"];
      this.shards = Array.from({ length: SHARDS }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 180 + Math.random() * 520;
        return {
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 120,
          size: 3 + Math.random() * 7,
          spin: (Math.random() - 0.5) * 14,
          angle: Math.random() * Math.PI,
          life: 1.1 + Math.random() * 1.1,
          age: 0,
          color: fire[Math.floor(Math.random() * fire.length)],
        };
      });
      this.smoke = Array.from({ length: 26 }, () => ({
        x: cx + (Math.random() - 0.5) * R,
        y: cy + (Math.random() - 0.5) * R,
        vx: (Math.random() - 0.5) * 60,
        vy: -30 - Math.random() * 60,
        r: R * (0.3 + Math.random() * 0.4),
        age: -Math.random() * 0.4,
        life: 2.4 + Math.random() * 1.2,
      }));
    }
    this.cracks = this.makeCracks(cx + (Math.random() - 0.5) * R * 0.6, cy - R * 0.2);
    this.onTimeout?.();
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    this.settle();
  }

  // ---- internals ----

  settle() {
    this.resolveEffect?.();
    this.resolveEffect = null;
  }

  burnIndex() {
    const fraction = this.durationMs ? clamp01(this.remaining / this.durationMs) : 0;
    return Math.round(fraction * (FUSE_POINTS - 1));
  }

  particle(x, y, speed, life, kind) {
    const angle = Math.random() * Math.PI * 2;
    const v = speed * (0.3 + Math.random());
    return { x, y, vx: Math.cos(angle) * v, vy: Math.sin(angle) * v - (kind === "spark" ? 60 : 25), age: 0, life: life * (0.5 + Math.random() * 0.5), kind };
  }

  /** Cracked glass: jagged lines from the blast point to beyond the edges, joined by a few rings. */
  makeCracks(x, y) {
    const lines = [];
    const reach = Math.hypot(this.w, this.h);
    const count = 13;
    const rays = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const points = [{ x, y }];
      let r = 0;
      while (r < reach) {
        r += 30 + Math.random() * 60;
        const a = angle + (Math.random() - 0.5) * 0.18;
        points.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r });
      }
      rays.push(points);
      lines.push(points);
    }
    for (const step of [2, 4]) {
      const ring = rays.map((points) => points[Math.min(step, points.length - 1)]);
      lines.push([...ring, ring[0]]);
    }
    return lines;
  }

  loop(now) {
    this.frame = requestAnimationFrame(this.loop);
    const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 0;
    this.last = now;
    this.update(dt);
    this.draw();
  }

  update(dt) {
    this.clock += dt;
    this.time += dt;
    if (this.state === "ticking") {
      this.remaining = Math.max(0, this.remaining - dt * 1000);
      this.onTick?.(this.remaining);
      if (this.remaining <= 0) {
        this.explode();
        return;
      }
      if (!this.reducedMotion) {
        const tip = this.fuse[this.burnIndex()];
        for (let k = 0; k < 3; k++) this.sparks.push(this.particle(tip.x, tip.y, 140, 0.55, "spark"));
      }
    }
    if (this.state === "defused" && this.resolveEffect && this.time >= this.effectEnds) this.settle();

    const move = (list, gravity) =>
      list.filter((p) => {
        p.age += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += gravity * dt;
        return p.age < p.life;
      });
    this.sparks = move(this.sparks, 380);
    this.frost = move(this.frost, -30);
    this.shards = move(this.shards, 520);
    for (const s of this.shards) s.angle += s.spin * dt;
    this.smoke = this.smoke.filter((s) => {
      s.age += dt;
      if (s.age > 0) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.r += 22 * dt;
      }
      return s.age < s.life;
    });
    this.flash = Math.max(0, this.flash - dt * 2.2);
  }

  draw() {
    const { ctx, w, h } = this;
    const bg = ctx.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.55, Math.max(w, h) * 0.75);
    bg.addColorStop(0, "#151c2c");
    bg.addColorStop(1, "#06080f");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    this.drawGrid();
    this.drawTable();

    const seconds = this.remaining / 1000;
    if (this.state === "ticking" && seconds <= DANGER_SECONDS) this.drawDangerPulse(seconds);

    if (this.state !== "exploded") {
      this.drawFuse();
      this.drawBomb();
      if (this.state === "ticking") this.drawFlame();
    } else {
      this.drawScorch();
    }

    this.drawParticles();
    if (this.state === "exploded") this.drawExplosion();
    if (this.state === "defused") this.drawDefusedLabel();
    if (this.cracks.length) this.drawCracks();

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255, ${Math.round(240 - (1 - this.flash) * 140)}, ${Math.round(220 - (1 - this.flash) * 180)}, ${this.flash})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  drawGrid() {
    const { ctx, w, h } = this;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = (w / 2) % 40; x < w; x += 40) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 20; y < h; y += 40) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  }

  drawTable() {
    const { ctx, w, h, cy, R } = this;
    const top = cy + R * 0.88;
    const g = ctx.createLinearGradient(0, top, 0, h);
    g.addColorStop(0, "#1e293b");
    g.addColorStop(1, "#0b1120");
    ctx.fillStyle = g;
    ctx.fillRect(0, top, w, h - top);
    ctx.fillStyle = "rgba(148, 163, 184, 0.18)";
    ctx.fillRect(0, top, w, 2);
    if (this.state !== "exploded") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.beginPath();
      ctx.ellipse(this.cx, top + 4, R * 0.9, R * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawDangerPulse(seconds) {
    const { ctx, w, h } = this;
    // Faster as time runs out: from about 1 pulse a second at 15s to 4 a second at 0.
    const rate = this.reducedMotion ? 0 : 1 + (1 - seconds / DANGER_SECONDS) * 3;
    const pulse = this.reducedMotion ? 0.5 : (Math.sin(this.clock * rate * Math.PI * 2) + 1) / 2;
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.7);
    g.addColorStop(0, "rgba(239, 68, 68, 0)");
    g.addColorStop(1, `rgba(239, 68, 68, ${0.12 + pulse * 0.33})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  drawFuse() {
    const { ctx, R } = this;
    const burn = this.state === "idle" ? FUSE_POINTS - 1 : this.burnIndex();
    const line = (from, to, style, width) => {
      ctx.strokeStyle = style;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.beginPath();
      this.fuse.slice(from, to + 1).forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    };
    // The burnt part is a thin trail of ash; the rest is the fuse cord.
    if (burn < FUSE_POINTS - 1) line(burn, FUSE_POINTS - 1, "rgba(100, 116, 139, 0.35)", R * 0.025);
    if (burn > 0) {
      const frozen = this.state === "defused";
      const cord = frozen ? COLORS.ice : "#d6b98c";
      if (frozen) {
        ctx.save();
        ctx.shadowColor = COLORS.ice;
        ctx.shadowBlur = 14 * Math.max(0, 1 - this.time / 2.5) + 4;
        line(0, burn, cord, R * 0.06);
        ctx.restore();
      } else {
        line(0, burn, "#8a6d45", R * 0.075);
        line(0, burn, cord, R * 0.045);
      }
    }
  }

  drawFlame() {
    const { ctx, R } = this;
    const tip = this.fuse[this.burnIndex()];
    const flicker = this.reducedMotion ? 1 : 0.8 + Math.random() * 0.4;
    const r = R * 0.28 * flicker;
    const g = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, r);
    g.addColorStop(0, "rgba(255, 255, 255, 1)");
    g.addColorStop(0.2, "rgba(253, 224, 71, 0.95)");
    g.addColorStop(0.5, "rgba(249, 115, 22, 0.55)");
    g.addColorStop(1, "rgba(239, 68, 68, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBomb() {
    const { ctx, cx, cy, R } = this;
    const danger = this.state === "ticking" && this.remaining / 1000 <= DANGER_SECONDS;

    // Cap where the fuse goes in.
    ctx.save();
    ctx.translate(this.cap.x, this.cap.y);
    ctx.rotate(Math.PI / 6);
    const capGrad = ctx.createLinearGradient(-R * 0.2, 0, R * 0.2, 0);
    capGrad.addColorStop(0, "#334155");
    capGrad.addColorStop(0.5, "#94a3b8");
    capGrad.addColorStop(1, "#334155");
    ctx.fillStyle = capGrad;
    ctx.fillRect(-R * 0.17, -R * 0.2, R * 0.34, R * 0.26);
    ctx.restore();

    // Body.
    const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    body.addColorStop(0, "#475569");
    body.addColorStop(0.45, "#1e293b");
    body.addColorStop(1, "#020617");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = danger ? "rgba(239, 68, 68, 0.6)" : "rgba(148, 163, 184, 0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Countdown display.
    const dw = R * 1.2;
    const dh = R * 0.42;
    const dx = cx - dw / 2;
    const dy = cy - R * 0.38;
    ctx.fillStyle = "#03060c";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(dx, dy, dw, dh, R * 0.06);
    ctx.fill();
    ctx.stroke();

    const total = Math.ceil(this.remaining / 1000);
    const text = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    let color = COLORS.red;
    if (this.state === "defused") {
      // Red to green as the bomb cools down.
      const t = clamp01(this.time / 0.6);
      color = `rgb(${Math.round(239 + (16 - 239) * t)}, ${Math.round(68 + (185 - 68) * t)}, ${Math.round(68 + (129 - 68) * t)})`;
    }
    const blink = danger && !this.reducedMotion && Math.floor(this.clock * 4) % 2 === 0 ? 0.55 : 1;
    ctx.save();
    ctx.globalAlpha = blink;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.font = `800 ${Math.round(dh * 0.68)}px "Fira Code", Consolas, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cx, dy + dh / 2 + 1);
    ctx.restore();

    // Three locks under the display.
    for (let i = 0; i < 3; i++) {
      const open = this.state === "defused" ? easeOutBack(clamp01((this.time - 0.35 - i * 0.22) / 0.5)) : 0;
      this.drawLock(cx + (i - 1) * R * 0.42, cy + R * 0.32, R * 0.15, open);
    }
  }

  drawLock(x, y, size, open) {
    const { ctx } = this;
    const lit = open > 0.05;
    // Shackle: lifts and swings open with a spring.
    ctx.save();
    ctx.translate(x + size * 0.55, y - size * 0.35 - open * size * 0.55);
    ctx.rotate(-open * 0.5);
    ctx.strokeStyle = lit ? COLORS.green : "#94a3b8";
    ctx.lineWidth = size * 0.22;
    ctx.beginPath();
    ctx.arc(-size * 0.55, 0, size * 0.42, Math.PI, 0);
    ctx.lineTo(-size * 0.13, size * 0.35);
    ctx.moveTo(-size * 0.97, 0);
    ctx.lineTo(-size * 0.97, size * 0.35);
    ctx.stroke();
    ctx.restore();
    // Body.
    ctx.fillStyle = lit ? "#064e3b" : "#334155";
    ctx.strokeStyle = lit ? COLORS.green : "#64748b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x - size * 0.65, y - size * 0.3, size * 1.3, size * 1.0, size * 0.18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = lit ? COLORS.green : COLORS.red;
    ctx.beginPath();
    ctx.arc(x, y + size * 0.15, size * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }

  drawParticles() {
    const { ctx } = this;
    for (const p of this.sparks) {
      const t = p.age / p.life;
      ctx.fillStyle = t < 0.4 ? "#fef08a" : t < 0.7 ? "#fb923c" : "rgba(239, 68, 68, 0.7)";
      ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
    }
    for (const p of this.frost) {
      ctx.fillStyle = `rgba(186, 230, 253, ${0.9 * (1 - p.age / p.life)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawScorch() {
    const { ctx, cx, cy, R } = this;
    const g = ctx.createRadialGradient(cx, cy + R * 0.85, 0, cx, cy + R * 0.85, R * 1.3);
    g.addColorStop(0, "rgba(0, 0, 0, 0.8)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy + R * 0.88, R * 1.3, R * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawExplosion() {
    const { ctx, cx, cy, R, w, h } = this;
    const t = this.time;

    for (const s of this.smoke) {
      if (s.age <= 0) continue;
      const alpha = 0.45 * Math.min(1, s.age * 3) * (1 - s.age / s.life);
      ctx.fillStyle = `rgba(51, 65, 85, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fireball: grows fast, then fades.
    if (t < 1.4) {
      const grow = clamp01(t / 0.35);
      const fade = 1 - clamp01((t - 0.35) / 1.05);
      const r = R * (0.4 + grow * 2.4);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(255, 255, 255, ${fade})`);
      g.addColorStop(0.25, `rgba(253, 224, 71, ${fade})`);
      g.addColorStop(0.55, `rgba(249, 115, 22, ${0.85 * fade})`);
      g.addColorStop(1, "rgba(127, 29, 29, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shockwave ring.
    if (t < 1) {
      const r = (t / 1) * Math.hypot(w, h) * 0.7;
      ctx.strokeStyle = `rgba(254, 215, 170, ${0.8 * (1 - t)})`;
      ctx.lineWidth = 3 + (1 - t) * 10;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const s of this.shards) {
      ctx.save();
      ctx.globalAlpha = 1 - s.age / s.life;
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.fillStyle = s.color;
      ctx.shadowColor = COLORS.amber;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(-s.size, -s.size * 0.4);
      ctx.lineTo(s.size * 0.8, -s.size * 0.6);
      ctx.lineTo(s.size * 0.3, s.size * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  drawCracks() {
    const { ctx } = this;
    const appear = this.reducedMotion ? 1 : clamp01((this.time - 0.15) / 0.25);
    ctx.save();
    ctx.globalAlpha = appear;
    ctx.strokeStyle = "rgba(241, 245, 249, 0.55)";
    ctx.lineWidth = 1.4;
    ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
    ctx.shadowBlur = 3;
    ctx.beginPath();
    for (const points of this.cracks) {
      points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    }
    ctx.stroke();
    ctx.restore();
  }

  drawDefusedLabel() {
    const { ctx, cx, cy, R } = this;
    const t = clamp01((this.time - 0.9) / 0.4);
    if (!t) return;
    ctx.save();
    ctx.globalAlpha = t;
    ctx.fillStyle = COLORS.green;
    ctx.shadowColor = COLORS.green;
    ctx.shadowBlur = 18;
    ctx.font = `900 ${Math.round(R * 0.32)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("DEFUSED", cx - R * 0.25, cy - R * 1.3 - (1 - t) * 10);
    ctx.restore();
  }
}
