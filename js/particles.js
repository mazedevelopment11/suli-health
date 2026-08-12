(() => {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  const hero = document.querySelector('.hero');

  const colors = ['#3fe0a5', '#2ecc71', '#3fa9f5', '#6fe3c4', '#8fd3ff', '#1fae6b'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0, height = 0;
  let particles = [];

  function particleCount() {
    const area = width * height;
    const base = Math.round(area / 9000);
    return reduceMotion ? Math.min(base, 40) : Math.min(Math.max(base, 40), 140);
  }

  function makeParticle(spawnAtBottom) {
    const r = Math.random();
    return {
      x: Math.random() * width,
      y: spawnAtBottom ? height + Math.random() * 60 : height * Math.random(),
      radius: 1 + Math.random() * 2.4,
      speed: 0.25 + Math.random() * 0.7,
      drift: (Math.random() - 0.5) * 0.4,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.006 + Math.random() * 0.014,
      color: colors[Math.floor(Math.random() * colors.length)],
      baseAlpha: 0.35 + Math.random() * 0.55,
      life: 0,
      maxLife: height / (0.25 + r * 0.7) + Math.random() * 200
    };
  }

  function resize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = particleCount();
    particles = new Array(count).fill(null).map(() => makeParticle(false));
  }

  function fadeFactor(p) {
    const topFade = Math.min(1, (p.y / height) / 0.18);
    const lifeFade = 1 - Math.min(1, p.life / p.maxLife);
    const entryFade = Math.min(1, (height - p.y) / 60);
    return Math.max(0, Math.min(topFade, lifeFade, entryFade)) * p.baseAlpha;
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.wobble += p.wobbleSpeed;
      p.y -= p.speed;
      p.x += Math.sin(p.wobble) * 0.3 + p.drift * 0.05;
      p.life += 1;

      const alpha = fadeFactor(p);
      if (alpha > 0.01) {
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.radius * 3;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (p.y < -20 || p.life > p.maxLife) {
        Object.assign(p, makeParticle(true));
      }
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    requestAnimationFrame(step);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  resize();
  requestAnimationFrame(step);
})();
