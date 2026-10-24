/**
 * Canvas 2D renderer for Sky Traps: night sky with data rain, the laser base and its shield dome,
 * the falling trap, laser shots, shatter particles and impact explosions.
 * The fall advances with frame time (not the wall clock), so a hidden tab pauses the trap.
 */

const COLORS = {
  skyTop: "#090d16",
  skyBottom: "#0f172a",
  emerald: "#10b981",
  blue: "#3b82f6",
  crimson: "#ef4444",
  amber: "#f59e0b",
};

const GLYPHS = "01{}[];=<>()+*/";

export class SkyRenderer {
  constructor(canvas, { reducedMotion = false, onLand, onTick } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.reducedMotion = reducedMotion;
    this.onLand = onLand;
    this.onTick = onTick;
    this.trap = null; // { kind, n, title, x, progress, durationMs, shieldUp }
    this.particles = [];
    this.rings = [];
    this.laser = null;
    this.flash = 0;
    this.shields = 3;
    this.rain = [];
    this.last = 0;
    this.frame = 0;
    this.resize();
    this.loop = this.loop.bind(this);
    this.frame = requestAnimationFrame(this.loop);
  }

  resize() {
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.canvas.width = Math.round(this.width * ratio);
    this.canvas.height = Math.round(this.height * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const columns = Math.floor(this.width / 22);
    this.rain = Array.from({ length: columns }, (_, i) => ({
      x: i * 22 + 8,
      y: Math.random() * this.height,
      speed: 30 + Math.random() * 70,
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    }));
  }

  destroy() {
    cancelAnimationFrame(this.frame);
  }

  get groundY() {
    return this.height - 70;
  }

  /** Starts a trap falling from the top; it lands after durationMs of visible time. */
  dropTrap(trap, durationMs) {
    this.trap = {
      kind: trap.kind,
      n: trap.n,
      title: trap.title,
      x: this.width * (0.28 + Math.random() * 0.44),
      progress: 0,
      durationMs,
      shieldUp: trap.kind === "shielded",
      landed: false,
    };
    this.laser = null;
  }

  /** Remaining fall time in ms (0 when nothing is falling). */
  remainingMs() {
    if (!this.trap || this.trap.landed) return 0;
    return Math.max(0, (1 - this.trap.progress) * this.trap.durationMs);
  }

  trapPosition() {
    const t = this.trap;
    const top = 60;
    return { x: t.x, y: top + (this.groundY - 40 - top) * t.progress };
  }

  cannonTip() {
    return { x: this.width / 2, y: this.groundY - 34 };
  }

  /** Laser from the cannon, then the trap shatters. Resolves when the effect has played. */
  shoot() {
    if (!this.trap) return Promise.resolve();
    const target = this.trapPosition();
    this.laser = { from: this.cannonTip(), to: target, life: 1 };
    this.trap.frozen = true;
    return new Promise((resolve) => {
      setTimeout(() => {
        this.burst(target.x, target.y, this.reducedMotion ? 20 : 75, [COLORS.crimson, COLORS.amber, "#ffffff", COLORS.emerald]);
        this.rings.push({ x: target.x, y: target.y, r: 6, life: 1, color: COLORS.emerald });
        this.trap = null;
        setTimeout(resolve, this.reducedMotion ? 200 : 700);
      }, 220);
    });
  }

  /** The trap hit the base: explosion and a crack in the shield dome. */
  impact(shieldsLeft) {
    const x = this.trap ? this.trap.x : this.width / 2;
    this.shields = shieldsLeft;
    this.burst(x, this.groundY - 10, this.reducedMotion ? 25 : 90, [COLORS.amber, COLORS.crimson, "#fde68a", "#ffffff"], 1.4);
    this.rings.push({ x, y: this.groundY - 10, r: 10, life: 1, color: COLORS.crimson });
    this.flash = this.reducedMotion ? 0.2 : 0.7;
    this.trap = null;
  }

  setShields(count) {
    this.shields = count;
  }

  burst(x, y, count, palette, power = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (60 + Math.random() * 260) * power;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        size: 1.5 + Math.random() * 3.5,
        life: 1,
        decay: 0.6 + Math.random() * 0.7,
        color: palette[i % palette.length],
      });
    }
  }

  loop(now) {
    const dt = Math.min(0.1, this.last ? (now - this.last) / 1000 : 0);
    this.last = now;
    this.update(dt);
    this.draw();
    this.frame = requestAnimationFrame(this.loop);
  }

  update(dt) {
    for (const drop of this.rain) {
      drop.y += drop.speed * dt;
      if (drop.y > this.height) {
        drop.y = -10;
        drop.glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
    }
    const t = this.trap;
    if (t && !t.frozen && !t.landed) {
      t.progress = Math.min(1, t.progress + (dt * 1000) / t.durationMs);
      if (t.progress >= 1) {
        t.landed = true;
        this.onLand?.();
      }
    }
    this.onTick?.(this.remainingMs());
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 420 * dt;
      p.vx *= 0.985;
      p.life -= p.decay * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const ring of this.rings) {
      ring.r += 260 * dt;
      ring.life -= 1.4 * dt;
    }
    this.rings = this.rings.filter((r) => r.life > 0);
    if (this.laser) {
      this.laser.life -= 3 * dt;
      if (this.laser.life <= 0) this.laser = null;
    }
    this.flash = Math.max(0, this.flash - 1.6 * dt);
  }

  draw() {
    const { ctx, width, height } = this;
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, COLORS.skyTop);
    sky.addColorStop(1, COLORS.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Data rain.
    ctx.font = "12px monospace";
    for (const drop of this.rain) {
      ctx.fillStyle = "rgba(59, 130, 246, 0.18)";
      ctx.fillText(drop.glyph, drop.x, drop.y);
    }

    this.drawBase();
    if (this.trap) this.drawTrap();
    this.drawLaser();

    for (const ring of this.rings) {
      ctx.strokeStyle = ring.color;
      ctx.globalAlpha = Math.max(0, ring.life);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    if (this.trap) this.drawAltitude();

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(239, 68, 68, ${this.flash * 0.35})`;
      ctx.fillRect(0, 0, width, height);
    }
  }

  drawBase() {
    const { ctx, width } = this;
    const ground = this.groundY;
    // Shield dome, fainter and cracked as hits accumulate.
    const strength = this.shields / 3;
    ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 + 0.5 * strength})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(width / 2, ground, width * 0.46, 120, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    if (this.shields < 3) {
      ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3 - this.shields; i++) {
        const cx = width * (0.3 + i * 0.2);
        ctx.beginPath();
        ctx.moveTo(cx, ground - 95);
        ctx.lineTo(cx + 12, ground - 70);
        ctx.lineTo(cx - 6, ground - 52);
        ctx.lineTo(cx + 8, ground - 30);
        ctx.stroke();
      }
    }
    // Ground and platform.
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, ground, width, this.height - ground);
    ctx.fillStyle = COLORS.emerald;
    ctx.shadowColor = COLORS.emerald;
    ctx.shadowBlur = 12;
    ctx.fillRect(0, ground, width, 2);
    ctx.shadowBlur = 0;
    // Cannon aimed at the trap.
    const tip = this.cannonTip();
    const aim = this.trap ? Math.atan2(this.trapPosition().y - tip.y, this.trapPosition().x - tip.x) : -Math.PI / 2;
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(width / 2, ground, 26, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(width / 2, ground - 10);
    ctx.rotate(aim);
    ctx.fillStyle = "#334155";
    ctx.fillRect(0, -5, 30, 10);
    ctx.fillStyle = COLORS.blue;
    ctx.shadowColor = COLORS.blue;
    ctx.shadowBlur = 10;
    ctx.fillRect(26, -3, 6, 6);
    ctx.restore();
    ctx.shadowBlur = 0;
  }

  drawTrap() {
    const { ctx } = this;
    const t = this.trap;
    const { x, y } = this.trapPosition();
    const size = t.kind === "boss" ? 34 : 22;

    // Fire tail above (it is falling down).
    for (let i = 0; i < 6; i++) {
      ctx.globalAlpha = 0.25 - i * 0.035;
      ctx.fillStyle = i % 2 ? COLORS.amber : COLORS.crimson;
      ctx.beginPath();
      ctx.arc(x + (Math.random() - 0.5) * 6, y - size - i * 9, size * (0.55 - i * 0.07), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Danger halo.
    const halo = ctx.createRadialGradient(x, y, size * 0.4, x, y, size * 2.2);
    halo.addColorStop(0, "rgba(239, 68, 68, 0.45)");
    halo.addColorStop(1, "rgba(239, 68, 68, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, size * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(performance.now() / 900);
    ctx.fillStyle = "#1f2937";
    ctx.strokeStyle = COLORS.crimson;
    ctx.shadowColor = COLORS.crimson;
    ctx.shadowBlur = 14;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const sides = { destroy: 8, charge: 3, lowercase: 4, shielded: 4, boss: 6 }[t.kind] || 6;
    for (let i = 0; i <= sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const r = t.kind === "destroy" && i % 2 ? size * 0.7 : size;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.shadowBlur = 0;

    if (t.shieldUp) {
      ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, size + 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Label above the trap.
    const label = `#${t.n} ${t.title.toUpperCase()}`;
    ctx.font = "bold 11px sans-serif";
    const w = ctx.measureText(label).width + 14;
    const lx = Math.min(Math.max(x - w / 2, 6), this.width - w - 6);
    ctx.fillStyle = "rgba(9, 13, 22, 0.85)";
    ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(lx, y + size + 10, w, 20, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fecaca";
    ctx.fillText(label, lx + 7, y + size + 24);
  }

  drawLaser() {
    if (!this.laser) return;
    const { ctx } = this;
    const { from, to, life } = this.laser;
    ctx.globalAlpha = Math.max(0, life);
    ctx.strokeStyle = COLORS.emerald;
    ctx.shadowColor = COLORS.blue;
    ctx.shadowBlur = 20;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  drawAltitude() {
    const { ctx } = this;
    const x = this.width - 22;
    const top = 50;
    const bottom = this.groundY - 10;
    const left = 1 - this.trap.progress;
    ctx.fillStyle = "rgba(30, 41, 59, 0.9)";
    ctx.fillRect(x, top, 8, bottom - top);
    ctx.fillStyle = left < 0.25 ? COLORS.crimson : left < 0.5 ? COLORS.amber : COLORS.emerald;
    ctx.fillRect(x, bottom - (bottom - top) * left, 8, (bottom - top) * left);
  }
}
