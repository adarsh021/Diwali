/**
 * THE FESTIVAL OF LIGHTS – A MAGICAL DIWALI EXPERIENCE
 * Production GSAP Animations, Canvas Fireworks, Web Audio Synthesizer & Diya Interactions
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. GLOBAL STATE & CONFIGURATION
  // =========================================================================
  const state = {
    audioEnabled: false,
    sparklerEnabled: true,
    isPlacementMode: false,
    diyasLitCount: 12488,
    cursorPos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    lastMousePos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    isLoaded: false
  };

  // Color palettes for authentic Diwali festivities
  const PALETTES = {
    gold: ['#ffe600', '#ffd700', '#ffb700', '#ff9100', '#fff2a3'],
    saffron: ['#ff4500', '#ff6a00', '#ff8c00', '#ff3300', '#ffa700'],
    festiveMix: ['#ffd700', '#ff0055', '#ff6600', '#00f2fe', '#8a2be2', '#00ff88'],
    sparkler: ['#ffffff', '#fffbe0', '#ffd700', '#ffeed1', '#ffaa00']
  };

  // =========================================================================
  // 2. PROCEDURAL WEB AUDIO SYNTHESIZER
  // (Synthesizes realistic temple chimes, fireworks booms, crackles, & drone)
  // Guaranteed zero broken external file dependencies!
  // =========================================================================
  class FestiveAudioEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.droneOscillators = [];
      this.isDronePlaying = false;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    // Sacred Temple Bell Chime (played when a Diya is lit)
    playTempleChime(freq = 528) {
      if (!state.audioEnabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      
      const freqs = [freq, freq * 1.5, freq * 2.02, freq * 2.76, freq * 3.4];
      const gains = [0.35, 0.22, 0.15, 0.08, 0.04];

      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(gains[idx], now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5 + idx * 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 3.5);
      });
    }

    // Firework Launch Whoosh & Explosion Boom
    playFireworkExplosion() {
      if (!state.audioEnabled || !this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Low frequency resonant boom
      const boomOsc = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boomOsc.type = 'sine';
      boomOsc.frequency.setValueAtTime(140, now);
      boomOsc.frequency.exponentialRampToValueAtTime(32, now + 0.6);

      boomGain.gain.setValueAtTime(0.65, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      boomOsc.connect(boomGain);
      boomGain.connect(this.masterGain);

      boomOsc.start(now);
      boomOsc.stop(now + 1.3);

      // 2. Filtered noise burst for crackle/explosion texture
      const bufferSize = this.ctx.sampleRate * 0.8;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.7);
      filter.Q.setValueAtTime(3, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.9);
    }

    // Sparkler Crackle Fizz
    playSparklerCrackle() {
      if (!state.audioEnabled || !this.ctx || Math.random() > 0.15) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200 + Math.random() * 2000, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
    }

    // Ambient Meditative Tanpura / Sitar Harmonics Drone
    toggleAmbientDrone(enable) {
      if (!this.ctx) return;
      if (enable && !this.isDronePlaying) {
        const rootFreq = 146.83; // D3 root note (traditional festive Raga Yaman base)
        const harmonics = [rootFreq, rootFreq * 1.5, rootFreq * 2, rootFreq * 2.67]; // Pa, Sa, Ga

        this.droneOscillators = harmonics.map((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.04 / (idx + 1), this.ctx.currentTime);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start();
          return { osc, gain };
        });
        this.isDronePlaying = true;
      } else if (!enable && this.isDronePlaying) {
        this.droneOscillators.forEach(({ osc, gain }) => {
          try {
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
            osc.stop(this.ctx.currentTime + 0.6);
          } catch (e) {}
        });
        this.droneOscillators = [];
        this.isDronePlaying = false;
      }
    }
  }

  const audio = new FestiveAudioEngine();

  // =========================================================================
  // 3. CANVAS 1: STARRY NIGHT SKY & NEBULAE
  // =========================================================================
  class SkyEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.stars = [];
      this.shootingStars = [];
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.resize();
      this.initStars();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }

    initStars() {
      this.stars = [];
      const count = Math.min(220, Math.floor((this.width * this.height) / 5500));
      for (let i = 0; i < count; i++) {
        this.stars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height * 0.75, // Top 75% for celestial view
          radius: Math.random() * 1.6 + 0.4,
          baseAlpha: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.03 + 0.008,
          phase: Math.random() * Math.PI * 2,
          color: Math.random() > 0.3 ? '#fff5d0' : '#d2f3ff'
        });
      }
    }

    spawnShootingStar() {
      if (this.shootingStars.length < 2 && Math.random() < 0.008) {
        this.shootingStars.push({
          x: Math.random() * this.width * 0.8,
          y: Math.random() * this.height * 0.3,
          length: Math.random() * 80 + 50,
          speed: Math.random() * 9 + 6,
          angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
          alpha: 1,
          decay: 0.015
        });
      }
    }

    updateAndRender() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Celestial Gradient & Deep Night Sky
      const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
      skyGrad.addColorStop(0, '#060111');
      skyGrad.addColorStop(0.5, '#0c0420');
      skyGrad.addColorStop(1, '#05010b');
      this.ctx.fillStyle = skyGrad;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Deep Purple / Golden Cosmic Nebulae Dust
      const nebulaGrad = this.ctx.createRadialGradient(
        this.width * 0.5, this.height * 0.35, 50,
        this.width * 0.5, this.height * 0.35, this.width * 0.6
      );
      nebulaGrad.addColorStop(0, 'rgba(64, 14, 110, 0.25)');
      nebulaGrad.addColorStop(0.5, 'rgba(28, 6, 52, 0.15)');
      nebulaGrad.addColorStop(1, 'transparent');
      this.ctx.fillStyle = nebulaGrad;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Render Twinkling Stars
      this.stars.forEach(star => {
        star.phase += star.twinkleSpeed;
        const currentAlpha = star.baseAlpha + Math.sin(star.phase) * 0.3;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = star.color;
        this.ctx.globalAlpha = Math.max(0.1, Math.min(1, currentAlpha));
        this.ctx.fill();
      });
      this.ctx.globalAlpha = 1;

      // Update & Render Shooting Stars
      this.spawnShootingStar();
      for (let i = this.shootingStars.length - 1; i >= 0; i--) {
        const s = this.shootingStars[i];
        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const starGrad = this.ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        starGrad.addColorStop(0, 'transparent');
        starGrad.addColorStop(1, `rgba(255, 230, 150, ${s.alpha})`);

        this.ctx.beginPath();
        this.ctx.moveTo(tailX, tailY);
        this.ctx.lineTo(s.x, s.y);
        this.ctx.strokeStyle = starGrad;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          this.shootingStars.splice(i, 1);
        }
      }
    }
  }

  // =========================================================================
  // 4. CANVAS 2: CINEMATIC FIREWORKS PHYSICS ENGINE
  // (Chrysanthemum, Willow Palm, Rings, Peony with gravity & drag)
  // =========================================================================
  class FireworksEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.rockets = [];
      this.particles = [];
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.autoLaunchTimer = 0;
      this.autoInterval = 140; // ticks between background fireworks
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }

    launchRocket(targetX, targetY, type = 'peony') {
      const startX = this.width * 0.15 + Math.random() * (this.width * 0.7);
      const startY = this.height + 10;
      const angle = Math.atan2(targetY - startY, targetX - startX);
      const distance = Math.hypot(targetX - startX, targetY - startY);
      const speed = Math.min(18, distance / 28 + 9);

      this.rockets.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        targetY: targetY,
        type: type,
        color: PALETTES.gold[Math.floor(Math.random() * PALETTES.gold.length)],
        trail: []
      });
    }

    explode(x, y, type) {
      audio.playFireworkExplosion();

      const particleCount = type === 'willow' ? 90 : 130;
      const palette = Math.random() > 0.4 ? PALETTES.festiveMix : PALETTES.gold;
      const baseColor = palette[Math.floor(Math.random() * palette.length)];

      for (let i = 0; i < particleCount; i++) {
        let speed, angle, vx, vy;

        if (type === 'ring') {
          angle = (i / particleCount) * Math.PI * 2;
          speed = Math.random() * 1.5 + 4.5;
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
        } else {
          angle = Math.random() * Math.PI * 2;
          speed = Math.random() * 6.5 + 1.5;
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
        }

        this.particles.push({
          x: x,
          y: y,
          vx: vx,
          vy: vy,
          friction: type === 'willow' ? 0.94 : 0.965,
          gravity: type === 'willow' ? 0.08 : 0.045,
          color: Math.random() > 0.3 ? baseColor : palette[Math.floor(Math.random() * palette.length)],
          alpha: 1,
          decay: type === 'willow' ? 0.009 : (Math.random() * 0.015 + 0.012),
          size: Math.random() * 2.5 + 1.2,
          trail: []
        });
      }
    }

    triggerBarrage(count = 7) {
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const tx = this.width * 0.15 + Math.random() * (this.width * 0.7);
          const ty = this.height * 0.12 + Math.random() * (this.height * 0.35);
          const types = ['peony', 'willow', 'ring'];
          const chosenType = types[Math.floor(Math.random() * types.length)];
          this.launchRocket(tx, ty, chosenType);
        }, i * 220);
      }
    }

    updateAndRender() {
      // Trail fade effect for fireworks canvas
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.globalCompositeOperation = 'lighter';

      // 1. Update Rockets
      for (let i = this.rockets.length - 1; i >= 0; i--) {
        const r = this.rockets[i];
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 5) r.trail.shift();

        // Draw Rocket Trail
        this.ctx.beginPath();
        for (let j = 0; j < r.trail.length; j++) {
          const pt = r.trail[j];
          this.ctx.lineTo(pt.x, pt.y);
        }
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 2.5;
        this.ctx.stroke();

        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.05; // slight rocket gravity

        // Check if reached apex / target
        if (r.vy >= 0 || r.y <= r.targetY) {
          this.explode(r.x, r.y, r.type);
          this.rockets.splice(i, 1);
        }
      }

      // 2. Update Explosion Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 4) p.trail.shift();

        // Draw particle trail
        this.ctx.beginPath();
        for (let j = 0; j < p.trail.length; j++) {
          const pt = p.trail[j];
          this.ctx.lineTo(pt.x, pt.y);
        }
        this.ctx.strokeStyle = p.color;
        this.ctx.globalAlpha = p.alpha * 0.7;
        this.ctx.lineWidth = p.size;
        this.ctx.stroke();

        // Draw particle head
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fill();

        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }
      this.ctx.globalAlpha = 1;

      // Auto Background Fireworks
      this.autoLaunchTimer++;
      if (this.autoLaunchTimer >= this.autoInterval) {
        this.autoLaunchTimer = 0;
        const tx = this.width * 0.2 + Math.random() * (this.width * 0.6);
        const ty = this.height * 0.15 + Math.random() * (this.height * 0.3);
        const types = ['peony', 'willow', 'ring'];
        this.launchRocket(tx, ty, types[Math.floor(Math.random() * types.length)]);
      }
    }
  }

  // =========================================================================
  // 5. CANVAS 3: FLOATING GOLDEN EMBERS & DUST
  // =========================================================================
  class SparksEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.sparks = [];
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.resize();
      this.initSparks();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }

    initSparks() {
      this.sparks = [];
      const count = Math.min(80, Math.floor(this.width / 16));
      for (let i = 0; i < count; i++) {
        this.sparks.push(this.createSpark(true));
      }
    }

    createSpark(randomY = false) {
      return {
        x: Math.random() * this.width,
        y: randomY ? Math.random() * this.height : this.height + Math.random() * 20,
        radius: Math.random() * 2.2 + 0.6,
        vy: -(Math.random() * 1.2 + 0.4),
        vx: (Math.random() - 0.5) * 0.8,
        swaySpeed: Math.random() * 0.03 + 0.01,
        swayAngle: Math.random() * Math.PI * 2,
        swayDist: Math.random() * 25 + 10,
        alpha: Math.random() * 0.7 + 0.3,
        color: PALETTES.gold[Math.floor(Math.random() * PALETTES.gold.length)]
      };
    }

    updateAndRender() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.sparks.length; i++) {
        const s = this.sparks[i];
        s.swayAngle += s.swaySpeed;
        const currentX = s.x + Math.sin(s.swayAngle) * (s.swayDist * 0.1);
        s.y += s.vy;

        this.ctx.beginPath();
        this.ctx.arc(currentX, s.y, s.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = s.color;
        this.ctx.globalAlpha = s.alpha;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = s.color;
        this.ctx.fill();

        // Respawn when spark floats above viewport
        if (s.y < -10) {
          this.sparks[i] = this.createSpark(false);
        }
      }
      this.ctx.shadowBlur = 0;
      this.ctx.globalAlpha = 1;
    }
  }

  // =========================================================================
  // 6. CANVAS 4: MAGIC SPARKLER (PHULJHADI) CURSOR TRAIL
  // =========================================================================
  class SparklerCursorEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.sparks = [];
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }

    addSparks(x, y, count = 3) {
      if (!state.sparklerEnabled) return;
      audio.playSparklerCrackle();

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.5 + 1.2;
        this.sparks.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2 + 1,
          color: PALETTES.sparkler[Math.floor(Math.random() * PALETTES.sparkler.length)],
          alpha: 1,
          decay: Math.random() * 0.05 + 0.03
        });
      }
    }

    updateAndRender() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      if (!state.sparklerEnabled && this.sparks.length === 0) return;

      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const s = this.sparks[i];
        this.ctx.beginPath();
        this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        this.ctx.fillStyle = s.color;
        this.ctx.globalAlpha = s.alpha;
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = '#fff';
        this.ctx.fill();

        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.12; // spark gravity
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          this.sparks.splice(i, 1);
        }
      }
      this.ctx.shadowBlur = 0;
      this.ctx.globalAlpha = 1;
    }
  }

  // =========================================================================
  // 7. INITIALIZE ENGINES & ANIMATION LOOP
  // =========================================================================
  const skyEngine = new SkyEngine('sky-canvas');
  const fireworksEngine = new FireworksEngine('fireworks-canvas');
  const sparksEngine = new SparksEngine('sparks-canvas');
  const sparklerEngine = new SparklerCursorEngine('sparkler-cursor-canvas');

  // Unified 60fps RequestAnimationFrame Loop
  function mainAnimationLoop() {
    skyEngine.updateAndRender();
    fireworksEngine.updateAndRender();
    sparksEngine.updateAndRender();
    sparklerEngine.updateAndRender();
    requestAnimationFrame(mainAnimationLoop);
  }
  requestAnimationFrame(mainAnimationLoop);

  // Mouse move sparkler tracker
  window.addEventListener('mousemove', (e) => {
    state.cursorPos.x = e.clientX;
    state.cursorPos.y = e.clientY;
    sparklerEngine.addSparks(e.clientX, e.clientY, 2);
  });

  // Touch move tracker for mobile
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      state.cursorPos.x = touch.clientX;
      state.cursorPos.y = touch.clientY;
      sparklerEngine.addSparks(touch.clientX, touch.clientY, 2);
    }
  }, { passive: true });

  // =========================================================================
  // 8. INTERACTIVE DIYAS & CLICK LIGHTING
  // =========================================================================
  
  // A. Central Maha Diya Interaction
  const centralDiya = document.getElementById('central-maha-diya');
  if (centralDiya) {
    centralDiya.addEventListener('click', () => {
      audio.init();
      audio.playTempleChime(528);

      // Trigger pulse visual
      centralDiya.classList.remove('clicked');
      void centralDiya.offsetWidth; // trigger reflow
      centralDiya.classList.add('clicked');

      // Burst gold sparks and fireworks around Maha Diya
      const rect = centralDiya.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      sparklerEngine.addSparks(centerX, centerY, 30);
      fireworksEngine.launchRocket(centerX + (Math.random() * 200 - 100), centerY - 150, 'peony');

      // Increment community counter
      incrementDiyaCounter();
    });
  }

  // B. Orbiting Diyas in Hero
  const orbitDiyas = document.querySelectorAll('.orbit-diya');
  orbitDiyas.forEach(diya => {
    diya.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.init();
      audio.playTempleChime(660);
      const rect = diya.getBoundingClientRect();
      sparklerEngine.addSparks(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
      incrementDiyaCounter();
    });
  });

  // C. Shrine Walkway Diyas (Section 2)
  const shrineButtons = document.querySelectorAll('.light-this-btn');
  const shrineCards = document.querySelectorAll('.diya-shrine-card');

  shrineButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.diya-shrine-card');
      if (card) {
        igniteShrineCard(card);
      }
    });
  });

  shrineCards.forEach(card => {
    card.addEventListener('click', () => {
      igniteShrineCard(card);
    });
  });

  function igniteShrineCard(card) {
    audio.init();
    audio.playTempleChime(587.33); // D5 chime
    card.classList.add('is-lit');
    card.classList.add('is-active');

    const btn = card.querySelector('.light-this-btn');
    if (btn) {
      btn.innerHTML = '✨ Blessed & Illuminated';
      btn.style.background = 'linear-gradient(135deg, #ffd700, #ff8c00)';
      btn.style.color = '#110200';
    }

    const diyaWrap = card.querySelector('.shrine-diya-wrap');
    if (diyaWrap) {
      const rect = diyaWrap.getBoundingClientRect();
      sparklerEngine.addSparks(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);
    }

    incrementDiyaCounter();
  }

  // D. Global Community Diya Counter
  const counterElement = document.getElementById('global-diya-counter');
  const counterActionBtn = document.getElementById('counter-light-action-btn');

  function incrementDiyaCounter() {
    state.diyasLitCount++;
    if (counterElement) {
      counterElement.textContent = state.diyasLitCount.toLocaleString();
    }
  }

  if (counterActionBtn) {
    counterActionBtn.addEventListener('click', () => {
      audio.init();
      audio.playTempleChime(784); // G5 chime
      incrementDiyaCounter();
      fireworksEngine.launchRocket(window.innerWidth / 2, window.innerHeight * 0.3, 'ring');
    });
  }

  // E. "Light a Diya" Anywhere on Screen Mode
  const hudLightDiyaBtn = document.getElementById('hud-light-diya-btn');
  const heroLightMainBtn = document.getElementById('hero-light-main-btn');
  const diyaPlacementToast = document.getElementById('diya-placement-toast');
  const toastClose = document.getElementById('toast-close');

  function togglePlacementMode(enable) {
    state.isPlacementMode = enable;
    if (diyaPlacementToast) {
      if (enable) {
        diyaPlacementToast.classList.add('is-visible');
      } else {
        diyaPlacementToast.classList.remove('is-visible');
      }
    }
  }

  if (hudLightDiyaBtn) {
    hudLightDiyaBtn.addEventListener('click', () => {
      audio.init();
      togglePlacementMode(!state.isPlacementMode);
    });
  }

  if (heroLightMainBtn) {
    heroLightMainBtn.addEventListener('click', () => {
      audio.init();
      togglePlacementMode(true);
    });
  }

  if (toastClose) {
    toastClose.addEventListener('click', () => togglePlacementMode(false));
  }

  // Screen click to place new Diya
  window.addEventListener('click', (e) => {
    // Avoid placement if clicking buttons or inputs
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.interactive-diya')) {
      return;
    }

    if (state.isPlacementMode) {
      spawnPlacedDiya(e.clientX, e.clientY);
      togglePlacementMode(false);
    }
  });

  function spawnPlacedDiya(x, y) {
    audio.init();
    audio.playTempleChime(700);

    const diyaDiv = document.createElement('div');
    diyaDiv.className = 'placed-diya';
    diyaDiv.style.left = `${x}px`;
    diyaDiv.style.top = `${y}px`;

    diyaDiv.innerHTML = `
      <div class="mini-flame"><div class="mini-flame-core"></div></div>
      <div class="mini-diya-body"></div>
    `;

    document.body.appendChild(diyaDiv);
    sparklerEngine.addSparks(x, y, 20);
    incrementDiyaCounter();

    // Clicking placed diya plays sound and sparkles
    diyaDiv.addEventListener('click', (ev) => {
      ev.stopPropagation();
      audio.playTempleChime(880);
      sparklerEngine.addSparks(x, y, 15);
    });
  }

  // =========================================================================
  // 9. CELEBRATION BUTTONS & FIREWORKS LAUNCHERS
  // =========================================================================
  const heroCelebrateBtn = document.getElementById('hero-celebrate-btn');
  const megaFireworksBtn = document.getElementById('mega-fireworks-btn');
  const fireworkShowerBtn = document.getElementById('firework-shower-btn');

  function launchCelebrationBarrage() {
    audio.init();
    fireworksEngine.triggerBarrage(8);

    // Canvas confetti burst
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: PALETTES.gold
      });
    }
  }

  if (heroCelebrateBtn) heroCelebrateBtn.addEventListener('click', launchCelebrationBarrage);
  if (megaFireworksBtn) megaFireworksBtn.addEventListener('click', launchCelebrationBarrage);
  if (fireworkShowerBtn) fireworkShowerBtn.addEventListener('click', launchCelebrationBarrage);

  // Return to top button
  const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =========================================================================
  // 10. INTERACTIVE SKY LANTERN (AKASH DEEP) LAUNCHER
  // =========================================================================
  const launchLanternBtn = document.getElementById('launch-lantern-btn');
  const lanternWishInput = document.getElementById('lantern-wish-input');
  const lanternLaunchStatus = document.getElementById('lantern-launch-status');

  if (launchLanternBtn) {
    launchLanternBtn.addEventListener('click', () => {
      audio.init();
      const wish = lanternWishInput.value.trim() || 'Health, Happiness & Peace for All';

      // Create floating 3D lantern
      createAscendingSkyLantern(wish);

      if (lanternLaunchStatus) {
        lanternLaunchStatus.textContent = `✨ Your prayer "${wish}" has been carried into the heavens!`;
        setTimeout(() => {
          lanternLaunchStatus.textContent = '';
        }, 6000);
      }
      lanternWishInput.value = '';
    });
  }

  function createAscendingSkyLantern(wishText) {
    audio.playTempleChime(528);

    const lantern = document.createElement('div');
    lantern.style.position = 'fixed';
    lantern.style.left = `${window.innerWidth * 0.2 + Math.random() * (window.innerWidth * 0.6)}px`;
    lantern.style.bottom = '40px';
    lantern.style.width = '64px';
    lantern.style.height = '85px';
    lantern.style.background = 'linear-gradient(180deg, rgba(255, 230, 100, 0.95), rgba(255, 120, 0, 0.9))';
    lantern.style.borderRadius = '32px 32px 14px 14px';
    lantern.style.boxShadow = '0 0 35px rgba(255, 180, 0, 0.95)';
    lantern.style.zIndex = '90';
    lantern.style.pointerEvents = 'none';
    lantern.style.display = 'flex';
    lantern.style.flexDirection = 'column';
    lantern.style.alignItems = 'center';
    lantern.style.justifyContent = 'center';
    lantern.style.padding = '5px';
    lantern.style.textAlign = 'center';
    lantern.style.transition = 'transform 10s cubic-bezier(0.1, 0.7, 0.1, 1), opacity 10s ease';

    lantern.innerHTML = `
      <div style="font-size: 0.65rem; color: #5a1e00; font-weight: bold; line-height: 1.1; overflow: hidden; text-overflow: ellipsis; max-height: 40px;">
        ${wishText}
      </div>
      <div style="position: absolute; bottom: 8px; width: 12px; height: 16px; background: #fff; border-radius: 50%; box-shadow: 0 0 10px #ffe600;"></div>
    `;

    document.body.appendChild(lantern);

    // Animate lantern ascending high into sky
    setTimeout(() => {
      lantern.style.transform = `translateY(-${window.innerHeight + 200}px) scale(0.35) rotate(${Math.random() * 20 - 10}deg)`;
      lantern.style.opacity = '0.2';
    }, 50);

    setTimeout(() => {
      lantern.remove();
    }, 10500);
  }

  // =========================================================================
  // 11. PERSONALIZED DIWALI GREETING CARD BUILDER
  // =========================================================================
  const senderNameInput = document.getElementById('sender-name-input');
  const receiverNameInput = document.getElementById('receiver-name-input');
  const previewTo = document.getElementById('preview-to');
  const previewFrom = document.getElementById('preview-from');
  const copyGreetingBtn = document.getElementById('copy-greeting-btn');

  function updateGreetingPreview() {
    const toVal = receiverNameInput.value.trim() || 'You & Your Family';
    const fromVal = senderNameInput.value.trim() || 'Adarsh & Family';
    if (previewTo) previewTo.textContent = toVal;
    if (previewFrom) previewFrom.textContent = fromVal;
  }

  if (senderNameInput) senderNameInput.addEventListener('input', updateGreetingPreview);
  if (receiverNameInput) receiverNameInput.addEventListener('input', updateGreetingPreview);

  if (copyGreetingBtn) {
    copyGreetingBtn.addEventListener('click', () => {
      const toVal = previewTo ? previewTo.textContent : 'You & Your Family';
      const fromVal = previewFrom ? previewFrom.textContent : 'Adarsh & Family';
      const greetingMessage = `✨ ॐ शुभ दीपावली ॐ ✨\n\nWishing ${toVal} a very Happy and Prosperous Diwali!\n\n"May the divine glow of sacred diyas illuminate your home and heart with supreme health, boundless peace, success, and eternal happiness." 🪔🎆\n\nWith Warmest Wishes,\n${fromVal}`;

      navigator.clipboard.writeText(greetingMessage).then(() => {
        const origText = copyGreetingBtn.innerHTML;
        copyGreetingBtn.innerHTML = '<span>✅ Copied to Clipboard!</span>';
        setTimeout(() => {
          copyGreetingBtn.innerHTML = origText;
        }, 2500);
      }).catch(() => {
        alert('Greeting copied to clipboard!');
      });
    });
  }

  // =========================================================================
  // 12. GENERATE SEA OF HUNDREDS OF GLOWING DIYAS AT FINALE HORIZON
  // =========================================================================
  const seaContainer = document.getElementById('sea-of-diyas');
  if (seaContainer) {
    const totalSeaDiyas = Math.min(140, Math.floor(window.innerWidth / 10));
    for (let i = 0; i < totalSeaDiyas; i++) {
      const flame = document.createElement('div');
      flame.className = 'sea-diya-flame';
      const xPercent = (i / totalSeaDiyas) * 100 + (Math.random() * 2 - 1);
      const yOffset = Math.random() * 85 + 10;
      const scale = Math.random() * 0.5 + 0.6;
      const animDelay = Math.random() * 2;

      flame.style.left = `${xPercent}%`;
      flame.style.bottom = `${yOffset}px`;
      flame.style.transform = `scale(${scale})`;
      flame.style.animationDelay = `${animDelay}s`;

      seaContainer.appendChild(flame);
    }
  }

  // =========================================================================
  // 13. HUD TOGGLES: AUDIO & SPARKLER WAND
  // =========================================================================
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicStateText = document.getElementById('music-state-text');
  const audioIndicator = document.getElementById('audio-indicator');
  const sparklerToggleBtn = document.getElementById('sparkler-toggle-btn');

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      audio.init();
      state.audioEnabled = !state.audioEnabled;

      if (state.audioEnabled) {
        musicStateText.textContent = 'ON';
        musicToggleBtn.style.borderColor = '#ffd700';
        audioIndicator.classList.add('is-playing');
        audio.toggleAmbientDrone(true);
        audio.playTempleChime(528);
      } else {
        musicStateText.textContent = 'OFF';
        musicToggleBtn.style.borderColor = 'rgba(255, 215, 0, 0.3)';
        audioIndicator.classList.remove('is-playing');
        audio.toggleAmbientDrone(false);
      }
    });
  }

  if (sparklerToggleBtn) {
    sparklerToggleBtn.addEventListener('click', () => {
      state.sparklerEnabled = !state.sparklerEnabled;
      sparklerToggleBtn.style.borderColor = state.sparklerEnabled ? '#ffd700' : 'rgba(255, 215, 0, 0.3)';
    });
  }

  // =========================================================================
  // 14. GSAP & SCROLLTRIGGER CINEMATIC CHOREOGRAPHY
  // =========================================================================
  function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // A. Hero Section Cinematic Entrance Timeline
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl
      .from('.sacred-crest', { y: -30, opacity: 0, duration: 1 })
      .from('.word-happy', { y: 60, opacity: 0, scale: 0.9, duration: 1.1 }, '-=0.6')
      .from('.word-diwali', { y: 60, opacity: 0, scale: 0.9, duration: 1.1 }, '-=0.8')
      .from('.hero-subtitle', { y: 30, opacity: 0, duration: 1 }, '-=0.7')
      .from('.hero-actions .festive-btn', { y: 25, opacity: 0, stagger: 0.2, duration: 0.8 }, '-=0.6')
      .from('.maha-diya-container', { scale: 0.4, opacity: 0, duration: 1.4, ease: 'back.out(1.5)' }, '-=0.8')
      .from('.ambient-ground-illumination', { opacity: 0, scale: 0.5, duration: 1.2 }, '-=1')
      .from('.orbit-diya', { scale: 0, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'back.out(2)' }, '-=0.8');

    // B. Parallax Scrolling on Haveli Palace & Background
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.to('.palace-backdrop-layer', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      gsap.to('.maha-diya-stage', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      // C. Section 2: Diya Sanctuary Illumination on Scroll
      gsap.utils.toArray('.scroll-illuminate').forEach((card, index) => {
        ScrollTrigger.create({
          trigger: card,
          start: 'top 78%',
          onEnter: () => {
            gsap.to(card, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: index * 0.15,
              ease: 'power2.out',
              onComplete: () => {
                card.classList.add('is-lit');
                card.classList.add('is-active');
              }
            });
          }
        });
      });

      // D. Section 3: Rangoli Revelation
      gsap.from('#rangoli-mandala', {
        scale: 0.6,
        opacity: 0,
        rotation: -45,
        duration: 1.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#grand-celebration-section',
          start: 'top 70%'
        }
      });

      // E. Feature cards stagger
      gsap.from('.feature-glass-card', {
        y: 40,
        opacity: 0,
        stagger: 0.2,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.festive-features-row',
          start: 'top 80%'
        }
      });

      // F. Interactive Panels entrance
      gsap.from('.interactive-panel', {
        y: 50,
        opacity: 0,
        stagger: 0.25,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#interactive-arena-section',
          start: 'top 75%'
        }
      });

      // G. Grand Finale Section Celebration
      gsap.from('.finale-content', {
        scale: 0.85,
        opacity: 0,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#grand-finale-section',
          start: 'top 65%',
          onEnter: () => {
            // Launch celebratory fireworks salvo on arriving at finale!
            fireworksEngine.triggerBarrage(5);
          }
        }
      });
    }
  }

  // =========================================================================
  // 15. PRELOADER & INITIAL LOAD CHOREOGRAPHY
  // =========================================================================
  const loader = document.getElementById('experience-loader');
  const loaderProgress = document.getElementById('loader-progress');
  const enterBtn = document.getElementById('enter-experience-btn');

  let loadPercent = 0;
  const loadInterval = setInterval(() => {
    loadPercent += Math.floor(Math.random() * 15) + 12;
    if (loadPercent >= 100) {
      loadPercent = 100;
      clearInterval(loadInterval);
      if (loaderProgress) loaderProgress.style.width = '100%';
      if (enterBtn) {
        enterBtn.style.display = 'inline-block';
        gsap.fromTo(enterBtn, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' });
      }
    } else {
      if (loaderProgress) loaderProgress.style.width = `${loadPercent}%`;
    }
  }, 100);

  function startExperience() {
    audio.init();
    state.audioEnabled = true;
    audio.toggleAmbientDrone(true);
    audio.playTempleChime(528);
    musicStateText.textContent = 'ON';
    audioIndicator.classList.add('is-playing');

    if (loader) {
      loader.classList.add('is-hidden');
    }

    // Launch welcome rocket
    setTimeout(() => {
      fireworksEngine.launchRocket(window.innerWidth / 2, window.innerHeight * 0.25, 'willow');
    }, 600);

    initGSAPAnimations();
  }

  if (enterBtn) {
    enterBtn.addEventListener('click', startExperience);
  }

  // Auto-dismiss preloader if user scrolls or clicks
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !state.isLoaded) {
      startExperience();
    }
  });

})();
