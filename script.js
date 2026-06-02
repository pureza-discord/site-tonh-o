/* ============================================
   SITE ROMÂNTICO — ANTONIO & MELANIE
   All Interactive Logic
   ============================================ */

(function () {
  'use strict';

  // === CONFIG ===
  const PASSWORD = '0205';
  // May 2, 2026 at 00:00 in UTC-3 (BRT)
  const RELATIONSHIP_DATE = new Date(Date.UTC(2026, 4, 2, 3, 0, 0)); // UTC+3h = midnight BRT
  const PHOTO_COUNT = 9;
  const POLAROID_CAPTIONS = [
    'Nós dois', 'Juntos', 'Pra Sempre',
    'Eu sempre', 'Sempre', 'Eu',
    'Vou', 'Te amar', 'Mel'
  ];

  // === DOM REFS ===
  const gatekeeper = document.getElementById('gatekeeper');
  const gateCard = document.getElementById('gate-card');
  const gateInput = document.getElementById('gate-input');
  const gateBtn = document.getElementById('gate-btn');
  const gateError = document.getElementById('gate-error');
  const mainContent = document.getElementById('main-content');
  const vinylPlayer = document.getElementById('vinyl-player');
  const vinylDisc = document.getElementById('vinyl-disc');
  const bgMusic = document.getElementById('bg-music');
  const cursorCanvas = document.getElementById('cursor-trail');

  // ============================================
  // GATEKEEPER
  // ============================================
  function initGatekeeper() {
    // Check if already unlocked
    if (localStorage.getItem('site_unlocked') === 'true') {
      unlockSite(true);
      return;
    }

    gateBtn.addEventListener('click', attemptUnlock);
    gateInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptUnlock();
    });
    // Auto-focus input
    setTimeout(() => gateInput.focus(), 500);
  }

  function attemptUnlock() {
    const value = gateInput.value.trim();
    if (value === PASSWORD) {
      localStorage.setItem('site_unlocked', 'true');
      unlockSite(false);
    } else {
      gateError.classList.add('visible');
      gateCard.classList.add('shake');
      setTimeout(() => gateCard.classList.remove('shake'), 500);
      setTimeout(() => gateError.classList.remove('visible'), 3000);
      gateInput.value = '';
      gateInput.focus();
    }
  }

  function unlockSite(instant) {
    if (instant) {
      gatekeeper.style.display = 'none';
      mainContent.classList.add('visible');
      vinylPlayer.style.display = 'block';
      initAfterUnlock();
      return;
    }
    gatekeeper.classList.add('unlocked');
    setTimeout(() => {
      gatekeeper.style.display = 'none';
      mainContent.classList.add('visible');
      vinylPlayer.style.display = 'block';
      initAfterUnlock();
    }, 900);
  }

  function initAfterUnlock() {
    initTimeCounter();
    initPolaroids();
    initTracklist();
    initVinylPlayer();
    initScrollAnimations();
    initParallax();
    if (!isTouchDevice()) initCursorTrail();
  }

  // ============================================
  // TIME COUNTER
  // ============================================
  function initTimeCounter() {
    function update() {
      // Get current time in UTC-3 (BRT) as a UTC timestamp
      const now = new Date();
      const diff = now - RELATIONSHIP_DATE;
      if (diff < 0) return;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      document.getElementById('counter-days').textContent = days;
      document.getElementById('counter-hours').textContent = String(hours).padStart(2, '0');
      document.getElementById('counter-mins').textContent = String(mins).padStart(2, '0');
      document.getElementById('counter-secs').textContent = String(secs).padStart(2, '0');
    }
    update();
    setInterval(update, 1000);
  }

  // ============================================
  // POLAROID GALLERY
  // ============================================
  function initPolaroids() {
    const grid = document.getElementById('polaroid-grid');
    if (!grid) return;

    for (let i = 1; i <= PHOTO_COUNT; i++) {
      const rotation = (Math.random() - 0.5) * 12; // -6 to +6 degrees
      const polaroid = document.createElement('div');
      polaroid.className = 'polaroid';
      polaroid.style.transform = `rotate(${rotation}deg)`;

      polaroid.innerHTML = `
        <div class="polaroid-tape"></div>
        <div class="polaroid-img-wrap">
          <img src="./fotos/${i}.jpg" alt="Memória ${i}" loading="lazy"
               onerror="this.parentElement.style.background='linear-gradient(135deg,#B0005E22,#0A193122)';">
        </div>
        <div class="polaroid-caption">${POLAROID_CAPTIONS[i - 1] || '♡'}</div>
      `;

      // Touch support for mobile
      polaroid.addEventListener('touchstart', function () {
        document.querySelectorAll('.polaroid.touched').forEach(p => p.classList.remove('touched'));
        this.classList.add('touched');
      });

      grid.appendChild(polaroid);
    }

    // Special 10th polaroid with SVG heart
    const heartPolaroid = document.createElement('div');
    heartPolaroid.className = 'polaroid';
    heartPolaroid.style.transform = `rotate(${(Math.random() - 0.5) * 8}deg)`;
    heartPolaroid.innerHTML = `
      <div class="polaroid-tape"></div>
      <div class="polaroid-img-wrap" style="display:flex;align-items:center;justify-content:center;background:#1a1a1a;">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="#B0005E" style="filter:drop-shadow(0 0 12px rgba(176,0,94,0.5));">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <div class="polaroid-caption">♡</div>
    `;
    heartPolaroid.addEventListener('touchstart', function () {
      document.querySelectorAll('.polaroid.touched').forEach(p => p.classList.remove('touched'));
      this.classList.add('touched');
    });
    grid.appendChild(heartPolaroid);
  }

  // ============================================
  // TRACKLIST ACCORDION
  // ============================================
  function initTracklist() {
    const tracks = document.querySelectorAll('.track-item');
    tracks.forEach(track => {
      const row = track.querySelector('.track-row');
      row.addEventListener('click', () => {
        const wasActive = track.classList.contains('active');
        // Close all tracks
        tracks.forEach(t => t.classList.remove('active'));
        // Toggle clicked track
        if (!wasActive) {
          track.classList.add('active');
        }
      });
    });
  }

  // ============================================
  // VINYL MUSIC PLAYER
  // ============================================
  let isPlaying = false;

  function initVinylPlayer() {
    vinylPlayer.addEventListener('click', toggleMusic);
    // Update vinyl icon based on state
    bgMusic.addEventListener('play', () => {
      isPlaying = true;
      vinylDisc.classList.add('spinning');
      updateVinylIcon(true);
    });
    bgMusic.addEventListener('pause', () => {
      isPlaying = false;
      vinylDisc.classList.remove('spinning');
      updateVinylIcon(false);
    });
  }

  function toggleMusic() {
    if (isPlaying) {
      bgMusic.pause();
    } else {
      bgMusic.play().catch(() => {
        // Autoplay blocked — user will need to click again
      });
    }
  }

  function updateVinylIcon(playing) {
    const label = vinylDisc.querySelector('.vinyl-center-label');
    if (playing) {
      label.innerHTML = '<svg viewBox="0 0 12 12" width="10" height="10"><rect x="1" y="1" width="3.5" height="10" rx="1" fill="white"/><rect x="7.5" y="1" width="3.5" height="10" rx="1" fill="white"/></svg>';
    } else {
      label.innerHTML = '<svg viewBox="0 0 12 12" width="10" height="10"><polygon points="3,0 12,6 3,12" fill="white"/></svg>';
    }
    const tooltip = document.querySelector('.vinyl-tooltip');
    if (tooltip) tooltip.textContent = playing ? 'Pausar música ♡' : 'Clique para tocar ♡';
  }

  // ============================================
  // SCROLL REVEAL ANIMATIONS
  // ============================================
  function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger the animation slightly
          setTimeout(() => {
            entry.target.classList.add('active');
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  // ============================================
  // PARALLAX
  // ============================================
  function initParallax() {
    const layer1 = document.getElementById('parallax-1');
    const layer2 = document.getElementById('parallax-2');
    if (!layer1 && !layer2) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          if (layer1) layer1.style.transform = `translate3d(0, ${scrollY * 0.08}px, 0)`;
          if (layer2) layer2.style.transform = `translate3d(0, ${scrollY * 0.15}px, 0)`;
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ============================================
  // CURSOR TRAIL (Desktop Only)
  // ============================================
  function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  function initCursorTrail() {
    const ctx = cursorCanvas.getContext('2d');
    let particles = [];
    let mouseX = 0, mouseY = 0;
    let animId;

    function resize() {
      cursorCanvas.width = window.innerWidth;
      cursorCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Add a petal particle on movement
      if (Math.random() > 0.6) {
        particles.push({
          x: mouseX,
          y: mouseY,
          size: Math.random() * 5 + 3,
          rotation: Math.random() * Math.PI * 2,
          opacity: 0.5 + Math.random() * 0.3,
          vx: (Math.random() - 0.5) * 0.8,
          vy: Math.random() * 0.6 + 0.3,
          vr: (Math.random() - 0.5) * 0.04,
          life: 1
        });
      }
    });

    function drawPetal(x, y, size, rotation, opacity) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#D4006F';
      ctx.beginPath();
      // Simple petal shape
      ctx.moveTo(0, -size);
      ctx.bezierCurveTo(size * 0.8, -size * 0.5, size * 0.6, size * 0.5, 0, size);
      ctx.bezierCurveTo(-size * 0.6, size * 0.5, -size * 0.8, -size * 0.5, 0, -size);
      ctx.fill();
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;
        p.life -= 0.015;
        p.opacity = p.life * 0.5;
        drawPetal(p.x, p.y, p.size, p.rotation, p.opacity);
      });

      // Limit particle count for performance
      if (particles.length > 60) particles.splice(0, particles.length - 60);

      animId = requestAnimationFrame(animate);
    }
    animate();
  }

  // ============================================
  // INIT
  // ============================================
  document.addEventListener('DOMContentLoaded', initGatekeeper);

})();
