// Wave Ink Studio · «Walk-in»: olas de línea fina que el cursor empuja, estado en directo y selector de diseños
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const L = () => (document.documentElement.lang === 'en' ? 'en' : 'es');
  const WA = 'https://wa.me/34656770956?text=';

  // ---------- olas: líneas finas que se ondulan y se apartan del cursor ----------
  function waves(cv, opt) {
    const g = cv.getContext('2d');
    let W, H, d, mx = -999, my = -999, tx = -999, ty = -999, vis = true;
    const size = () => { const r = cv.getBoundingClientRect(); d = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0); };
    size(); new ResizeObserver(size).observe(cv);
    const host = cv.parentElement;
    host.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; });
    host.addEventListener('pointerleave', () => { tx = -999; ty = -999; });
    new IntersectionObserver(([e]) => (vis = e.isIntersecting)).observe(cv);
    const draw = (t) => {
      g.clearRect(0, 0, W, H);
      mx += (tx - mx) * .08; my += (ty - my) * .08;
      const n = opt.lines, gap = H / (n + 1);
      g.lineWidth = opt.w; g.strokeStyle = opt.color;
      for (let i = 1; i <= n; i++) {
        const y0 = i * gap, k = i / n;
        g.globalAlpha = opt.alpha * (.35 + .65 * Math.sin(k * Math.PI));
        g.beginPath();
        for (let x = -10; x <= W + 10; x += 8) {
          let y = y0 + Math.sin(x * .006 + t * .0006 + i * .45) * (opt.amp * (.5 + k)) + Math.sin(x * .017 - t * .001 + i) * opt.amp * .25;
          const dx = x - mx, dy = y - my, dist = Math.hypot(dx, dy);
          if (dist < 180) y += (dy / (dist || 1)) * (180 - dist) * .35;
          x === -10 ? g.moveTo(x, y) : g.lineTo(x, y);
        }
        g.stroke();
      }
      g.globalAlpha = 1;
    };
    if (reduce) { draw(0); return; }
    const loop = (t) => { if (vis) draw(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  // ---------- abierto ahora ----------
  function live() {
    const el = document.getElementById('live'), sp = el.querySelector('span');
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const day = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
    const workday = day >= 1 && day <= 6;
    const am = workday && m >= 600 && m < 840, pm = workday && m >= 1020 && m < 1320;
    const en = L() === 'en';
    let txt;
    if (am) txt = en ? 'Open now, come in without an appointment · until 14:00' : 'Abierto ahora, ven sin cita · hasta las 14:00';
    else if (pm) txt = en ? 'Open now, come in without an appointment · until 22:00' : 'Abierto ahora, ven sin cita · hasta las 22:00';
    else if (workday && m >= 840 && m < 1020) txt = en ? 'Back at 17:00 · walk-ins welcome' : 'Volvemos a las 17:00 · sin cita previa';
    else if (workday && m < 600) txt = en ? 'We open at 10:00 · walk-ins welcome' : 'Abrimos a las 10:00 · sin cita previa';
    else txt = day === 0 || (day === 6 && m >= 1320) ? (en ? 'Closed now · back on Monday at 10:00' : 'Ahora cerrado · volvemos el lunes a las 10:00') : (en ? 'Closed now · tomorrow from 10:00' : 'Ahora cerrado · mañana desde las 10:00');
    el.classList.toggle('open', am || pm);
    sp.textContent = txt;
  }

  // ---------- elige tu tattoo ----------
  function picker() {
    const tray = document.getElementById('tray'), t = document.getElementById('trayT'), wa = document.getElementById('trayWa');
    const upd = () => {
      const sel = [...document.querySelectorAll('.pk[aria-pressed="true"]')].map((b) => b.querySelector('span').textContent);
      tray.classList.toggle('on', sel.length > 0);
      const en = L() === 'en';
      t.textContent = sel.length ? (en ? `${sel.length} selected: ` : `${sel.length} elegido${sel.length > 1 ? 's' : ''}: `) + sel.join(', ') : '';
      const msg = en ? `Hi! I saw these designs on your website: ${sel.join(', ')}. Do you have a slot today? How much would it be?` : `¡Hola! He visto estos diseños en vuestra web: ${sel.join(', ')}. ¿Tenéis hueco hoy? ¿Cuánto costaría?`;
      wa.href = WA + encodeURIComponent(msg);
    };
    document.getElementById('pick').addEventListener('click', (e) => {
      const b = e.target.closest('.pk'); if (!b) return;
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      if (!reduce && typeof gsap !== 'undefined') gsap.fromTo(b, { scale: .94 }, { scale: 1, duration: .6, ease: 'elastic.out(1, .5)' });
      upd();
    });
    document.addEventListener('langchange', upd);
    upd();
  }

  // ---------- flotar: las tarjetas se mecen como sobre el agua al bajar ----------
  function bob() {
    if (reduce) return;
    const els = [...document.querySelectorAll('.pk, .rs blockquote, .hero-float img')];
    let y = scrollY, cur = y;
    const f = (t) => {
      cur += (scrollY - cur) * .08;
      els.forEach((el, i) => el.style.setProperty('--bob', (Math.sin(cur * .006 + i * .9 + t * .0008) * 7).toFixed(2) + 'px'));
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }

  function header() {
    const top = document.querySelector('.top'); let last = 0;
    addEventListener('scroll', () => {
      const y = scrollY; top.classList.toggle('solid', y > 40);
      if (y > 500 && y > last + 4) top.classList.add('hide'); else if (y < last - 4) top.classList.remove('hide');
      last = y;
    }, { passive: true });
  }

  function motion() {
    gsap.registerPlugin(ScrollTrigger);
    // los títulos entran como una ola: palabra a palabra, subiendo y bajando
    gsap.utils.toArray('h2.tw').forEach((h) => {
      const words = h.textContent.trim().split(/\s+/);
      h.dataset.txt = h.innerHTML;
      h.innerHTML = words.map((w) => `<span class="wv" style="display:inline-block">${w}</span>`).join(' ');
      gsap.from(h.querySelectorAll('.wv'), { y: (i) => 40 + Math.sin(i) * 20, opacity: 0, rotate: (i) => (i % 2 ? 4 : -4), duration: 1.2, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: h, start: 'top 88%' } });
    });
    gsap.utils.toArray('.sec-head p, .sc li, .sv article, .ar-i, .vs-txt > p, .visita dl').forEach((el) => gsap.from(el, { y: 36, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
    gsap.from('.pk', { y: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: { each: .05, from: 'start' }, scrollTrigger: { trigger: '.pick', start: 'top 85%' } });
    gsap.from('.sincita', { borderRadius: '200px 200px 0 0', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.sincita', start: 'top 95%' } });
  }

  function intro() {
    if (reduce || typeof gsap === 'undefined') return;
    gsap.from('.live, .hero h1 span, .hero h1 em, .hero-p, .hero-cta, .hero-rate', { y: 40, opacity: 0, duration: 1.3, stagger: .08, ease: 'expo.out', delay: .15 });
    gsap.from('.waves', { opacity: 0, duration: 2, ease: 'power2.out' });
  }

  function init() {
    waves(document.querySelector('.waves'), { lines: 26, amp: 16, w: 1, color: '#10294a', alpha: .38 });
    waves(document.querySelector('.foot-waves'), { lines: 14, amp: 12, w: 1, color: '#4fb8a9', alpha: .6 });
    live(); setInterval(live, 60000);
    picker(); bob(); header(); intro();
    if (!reduce && typeof gsap !== 'undefined') motion();
    document.fonts && document.fonts.ready.then(() => typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh());
  }
  document.addEventListener('langchange', () => {
    if (!document.body.dataset.inited) return;
    live();
    document.querySelectorAll('h2.tw .wv').forEach((s) => { s.style.opacity = 1; s.style.transform = 'none'; });
  });
  const go = () => { init(); document.body.dataset.inited = '1'; };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
