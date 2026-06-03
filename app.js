/* =========================================================================
   PLAYBACK — interactions (3-section build)
   ========================================================================= */
(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- 1. REVEAL on scroll ---------- */
  $$('.reveal').forEach(n => { if (n.dataset.d) n.style.setProperty('--d', n.dataset.d); });
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(n => io.observe(n));
  } else $$('.reveal').forEach(n => n.classList.add('in'));

  /* ---------- 2. FINISHES — coverflow colourway carousel (recolours the stage) ---------- */
  const FIN = [
    { name:'SILVER',   label:'Silver',   accent:'steel',    bg:'#C2C7CD', ink:'#1B1D21', img:'assets/finish-silver.png' },
    { name:'MIDNIGHT', label:'Midnight', accent:'cobalt',   bg:'#34508C', ink:'#FFFFFF', img:'assets/finish-midnight.png' },
    { name:'BLUSH',    label:'Blush',    accent:'magenta',  bg:'#EC85AC', ink:'#FFFFFF', img:'assets/finish-blush.png' },
    { name:'FOREST',   label:'Forest',   accent:'forest',   bg:'#3E6B52', ink:'#FFFFFF', img:'assets/finish-forest.png' },
    { name:'MARIGOLD', label:'Marigold', accent:'marigold', bg:'#F3C744', ink:'#1B1A0E', img:'assets/finish-marigold.png' },
    { name:'CORAL',    label:'Coral',    accent:'coral',    bg:'#F4845F', ink:'#FFFFFF', img:'assets/finish-coral.png' },
  ];
  const finSec = $('#finishes'), finCar = $('#finCarousel'), finGhost = $('#finGhost'), finNameEl = $('#finName');
  const finGhostT = finGhost && finGhost.firstElementChild;
  if (finCar) {
    const N = FIN.length;
    let active = Math.max(0, FIN.findIndex(f => f.name === 'CORAL'));
    let busy = false, mobile = innerWidth < 680, sx = null;

    const items = FIN.map(f => {
      const d = document.createElement('div'); d.className = 'fin-item';
      const img = document.createElement('img'); img.src = f.img; img.alt = 'Playback in ' + f.label; img.draggable = false;
      d.appendChild(img); finCar.appendChild(d); return d;
    });
    const roleOf = i =>
      i === active ? 'center' :
      i === (active + N - 1) % N ? 'left' :
      i === (active + 1) % N ? 'right' :
      i === (active + 2) % N ? 'back' : 'hidden';
    // consistent filter lists (blur + drop-shadow) so the centre is explicitly blur(0) and transitions cleanly
    const styleFor = role => { const m = mobile; switch (role) {
      case 'center': return { transform:`translateX(-50%) scale(${m?1.12:1.18})`, filter:'blur(0px) drop-shadow(0 30px 42px rgba(0,0,0,.32))', opacity:1, zIndex:20, left:'50%',     height:m?'42%':'60%', bottom:m?'24%':'9%' };
      case 'left':   return { transform:'translateX(-50%) scale(1)', filter:'blur(2px) drop-shadow(0 14px 22px rgba(0,0,0,.18))', opacity:.82, zIndex:10, left:m?'16%':'29%', height:m?'18%':'27%', bottom:m?'34%':'16%' };
      case 'right':  return { transform:'translateX(-50%) scale(1)', filter:'blur(2px) drop-shadow(0 14px 22px rgba(0,0,0,.18))', opacity:.82, zIndex:10, left:m?'84%':'71%', height:m?'18%':'27%', bottom:m?'34%':'16%' };
      case 'back':   return { transform:'translateX(-50%) scale(1)', filter:'blur(4px) drop-shadow(0 10px 18px rgba(0,0,0,.15))', opacity:.95, zIndex:5,  left:'50%',         height:m?'14%':'21%', bottom:m?'34%':'16%' };
      default:       return { transform:'translateX(-50%) scale(.7)', filter:'blur(6px) drop-shadow(0 0 0 rgba(0,0,0,0))', opacity:0,  zIndex:1,  left:'50%',         height:m?'14%':'21%', bottom:m?'34%':'16%' };
    } };
    const fitGhost = () => {                       // scale the ghost word so it never runs off-screen
      finGhost.style.fontSize = '';
      const w = finGhostT.getBoundingClientRect().width, avail = innerWidth * 0.94;
      if (w > avail) finGhost.style.fontSize = (parseFloat(getComputedStyle(finGhost).fontSize) * avail / w) + 'px';
    };
    const render = () => {
      const f = FIN[active];
      finSec.style.backgroundColor = f.bg; finSec.style.color = f.ink;
      document.body.dataset.accent = f.accent;   // ripple the colour to the rest of the site
      finGhostT.textContent = f.name; fitGhost();
      if (finNameEl) finNameEl.textContent = f.label;
      items.forEach((el, i) => { const s = styleFor(roleOf(i));
        el.style.transform = s.transform; el.style.opacity = s.opacity;
        el.style.zIndex = s.zIndex; el.style.left = s.left; el.style.height = s.height; el.style.bottom = s.bottom;
        el.firstElementChild.style.filter = s.filter; });   // filter on the <img>, not the transformed item
    };
    const bump = () => { if (reduce) return; finGhost.classList.remove('anim'); void finGhost.offsetWidth; finGhost.classList.add('anim'); };
    const go = dir => { if (busy) return; busy = true;
      active = dir > 0 ? (active + 1) % N : (active + N - 1) % N;
      render(); bump(); setTimeout(() => busy = false, reduce ? 0 : 660); };

    $('#finNext').addEventListener('click', () => go(1));
    $('#finPrev').addEventListener('click', () => go(-1));
    items.forEach((el, i) => el.addEventListener('click', () => { const r = roleOf(i); if (r === 'left') go(-1); else if (r === 'right' || r === 'back') go(1); }));
    finCar.addEventListener('pointerdown', e => { sx = e.clientX; });
    finCar.addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; if (Math.abs(dx) > 44) go(dx < 0 ? 1 : -1); sx = null; });
    addEventListener('resize', () => { const m = innerWidth < 680; if (m !== mobile) { mobile = m; render(); } else fitGhost(); });

    render();
    requestAnimationFrame(() => finCar.classList.remove('booting'));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitGhost);  // re-fit once the display font loads
  }

  /* ---------- 3. SCROLL — progress bar, nav, parallax, marquee skew ---------- */
  const sb = $('#scrollbar'), nav = $('#nav'), parallaxEls = $$('[data-parallax]'), marquee = $('#marqueeSkew');
  let lastY = window.scrollY, ticking = false, skewTarget = 0, skew = 0;

  function onScroll() {
    const y = window.scrollY, vh = innerHeight, max = document.documentElement.scrollHeight - vh;
    if (sb) sb.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
    if (nav) nav.classList.toggle('hidden', y > 260 && y > lastY);
    if (!reduce) parallaxEls.forEach(p => {
      const r = p.getBoundingClientRect(), off = (r.top + r.height / 2 - vh / 2) / vh;
      const sp = parseFloat(p.dataset.speed || 0), rot = parseFloat(p.dataset.rotate || 0), scA = parseFloat(p.dataset.scale || 0);
      const sc = scA ? 1 + scA * (1 - Math.min(Math.abs(off), 1)) : 1;
      p.style.transform = `translate3d(0,${(-off * sp * vh).toFixed(1)}px,0) rotate(${(off * rot).toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    });
    if (marquee && !reduce) skewTarget = clamp((y - lastY) * 0.4, -8, 8);
    lastY = y; ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if (marquee && !reduce) (function skewLoop() {
    skewTarget *= 0.9; skew += (skewTarget - skew) * 0.16;
    marquee.style.transform = `skewX(${skew.toFixed(2)}deg)`;
    requestAnimationFrame(skewLoop);
  })();

  /* ---------- 4. HERO — idle float + scroll drift + hover scale + tilt ---------- */
  const stage = $('[data-parallax-stage]');
  if (stage && !reduce) {
    const depthEls = $$('[data-depth]', stage), tiltEl = $('[data-tilt]', stage);
    let tx = 0, ty = 0, cx = 0, cy = 0, hv = 0, hvT = 0;
    if (fine) {
      stage.addEventListener('pointermove', e => {
        const r = stage.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
      });
      stage.addEventListener('pointerenter', () => { hvT = 1; });
      stage.addEventListener('pointerleave', () => { tx = 0; ty = 0; hvT = 0; });
    }
    (function loop(t) {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06; hv += (hvT - hv) * 0.08;
      const bob = Math.sin(t / 1500) * 10;
      const sy = window.scrollY, sp = Math.min(sy / 900, 1);
      const shiftX = 0;   // device sits in its own column (right), not tucked behind the text
      depthEls.forEach(d => {
        const dep = parseFloat(d.dataset.depth || 0.2), z = dep * 80;
        const drift = sy * (0.08 + dep * 0.28);                 // deeper layers drift faster on scroll
        const bx = d === tiltEl ? shiftX : 0;
        let tr = `translate3d(${(cx * z + bx).toFixed(1)}px,${(cy * z + drift + (d === tiltEl ? bob : 0)).toFixed(1)}px,0)`;
        if (d === tiltEl) {
          const sc = (1 + hv * 0.05) * (1 - sp * 0.07);
          tr += ` rotateY(${(cx * 16).toFixed(2)}deg) rotateX(${(-cy * 12).toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        }
        d.style.transform = tr;
      });
      requestAnimationFrame(loop);
    })(0);
  }

  /* ---------- 5. SOFT TILT on product imagery (device shot + finish viewer) ---------- */
  if (!reduce && fine) $$('[data-tilt-soft]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1000px) rotateY(${(nx * 9).toFixed(2)}deg) rotateX(${(-ny * 7).toFixed(2)}deg)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* ---------- 5b. DEVICE — hover a feature, annotate the image ---------- */
  const dMedia = $('.device-sec__media'), dvm = $('#dvm'), dList = $('.device-sec__list');
  if (dvm && dList) {
    const POS = [{ t:'40%', l:'34%' }, { t:'58%', l:'32%' }, { t:'49%', l:'73%' }, { t:'27%', l:'47%' }];
    const lis = $$('li', dList);
    const pins = lis.map((li, i) => {
      const title = (li.querySelector('h3')?.textContent || '').trim();
      const pin = document.createElement('div');
      pin.className = 'dvm__pin';
      pin.style.top = (POS[i] || {}).t || '50%';
      pin.style.left = (POS[i] || {}).l || '50%';
      pin.innerHTML = `<span class="dvm__dot"></span><span class="dvm__card">${title}</span>`;
      dvm.appendChild(pin);
      return pin;
    });
    const activate = i => { dMedia.classList.add('annotating'); pins.forEach((p, j) => p.classList.toggle('is-active', j === i)); };
    const clear = () => { dMedia.classList.remove('annotating'); pins.forEach(p => p.classList.remove('is-active')); };
    lis.forEach((li, i) => li.addEventListener('pointerenter', () => activate(i)));
    dList.addEventListener('pointerleave', clear);
  }

  /* ---------- 5c. HEADSHOT — idle float + cursor tilt + hover lift ---------- */
  const photo = $('.creator__photo');
  if (photo && !reduce) {
    const img = photo.querySelector('img');
    let tx = 0, ty = 0, cx = 0, cy = 0, hv = 0, hT = 0;
    if (fine) {
      photo.addEventListener('pointermove', e => {
        const r = photo.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
      });
      photo.addEventListener('pointerenter', () => { hT = 1; });
      photo.addEventListener('pointerleave', () => { tx = 0; ty = 0; hT = 0; });
    }
    (function loop(t) {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08; hv += (hT - hv) * 0.1;
      const bob = Math.sin(t / 2200) * 6;
      img.style.transform = `translateY(${bob.toFixed(1)}px) rotateY(${(cx * 10).toFixed(2)}deg) rotateX(${(-cy * 8).toFixed(2)}deg) scale(${(1 + hv * 0.04).toFixed(3)})`;
      requestAnimationFrame(loop);
    })(0);
  }

  /* ---------- 6. MAGNETIC buttons ---------- */
  if (!reduce && fine) $$('[data-magnetic]').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const mx = (e.clientX - r.left - r.width / 2) / r.width, my = (e.clientY - r.top - r.height / 2) / r.height;
      btn.style.transform = `translate(${(mx * 14).toFixed(1)}px,${(my * 12).toFixed(1)}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });

  /* ---------- 7. RESERVE form (emails submissions via Web3Forms) ----------
     SETUP: go to https://web3forms.com, enter arjunkalbag07@gmail.com, and it emails
     you a free access key. Paste it below, then commit & push. Until then the form
     falls back to the demo confirmation so the button still works. */
  const WEB3FORMS_KEY = '22bc5667-c273-4d45-a570-00ff77de8270';

  const form = $('#reserveForm'), input = $('#email'), msg = $('#emailHelp'), submitBtn = $('#reserveBtn');
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (form) {
    const done = (ok, text, v) => {
      submitBtn.disabled = false;
      submitBtn.textContent = ok ? 'Reserved ✓' : 'Try again';
      msg.textContent = text; msg.className = 'field__msg ' + (ok ? 'ok' : 'error');
      if (ok && v) input.value = '';
    };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const v = input.value.trim();
      if (!EMAIL.test(v)) {
        input.setAttribute('aria-invalid', 'true');
        msg.textContent = 'That email doesn’t look right — mind checking it?';
        msg.className = 'field__msg error'; input.focus(); return;
      }
      input.removeAttribute('aria-invalid');
      submitBtn.disabled = true; submitBtn.textContent = 'Reserving…';
      msg.textContent = 'Securing your spot…'; msg.className = 'field__msg';

      if (!WEB3FORMS_KEY || WEB3FORMS_KEY === 'YOUR_ACCESS_KEY_HERE') {
        console.warn('[Playback] Form not connected yet — add your Web3Forms key (WEB3FORMS_KEY) in app.js.');
        setTimeout(() => done(true, `You’re on the list. We’ll write to ${v} when it ships.`, v), 800);
        return;
      }
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: 'New Playback reservation',
            from_name: 'Playback waitlist',
            email: v,
            message: `New reservation request from ${v}`,
          }),
        });
        const data = await res.json();
        if (data.success) done(true, `You’re on the list. We’ll write to ${v} when it ships.`, v);
        else done(false, 'Hmm, that didn’t go through — please try again.');
      } catch {
        done(false, 'Network error — please try again.');
      }
    });
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true' && EMAIL.test(input.value.trim())) {
        input.removeAttribute('aria-invalid');
        msg.textContent = 'We’ll only email you once, when it’s real.'; msg.className = 'field__msg';
      }
    });
  }

  /* ---------- 8. FOOTER clock (Eastern Time) ---------- */
  const clock = $('#footClock');
  if (clock) {
    const t = () => {
      const time = new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/New_York', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
      clock.textContent = time + ' EST';
    };
    t(); setInterval(t, 1000);
  }

  /* ---------- 8b. FOOTER wordmark — scale so PLAYBACK always fits ---------- */
  const fw = $('.foot__wordmark'), fwt = fw && fw.firstElementChild;
  if (fwt) {
    const fitFoot = () => {
      fw.style.fontSize = '';
      const avail = innerWidth * 0.96, w = fwt.getBoundingClientRect().width;
      if (w > avail) fw.style.fontSize = (parseFloat(getComputedStyle(fw).fontSize) * avail / w) + 'px';
    };
    fitFoot();
    addEventListener('resize', fitFoot);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitFoot);
  }

  /* ---------- 8c. FILM — product video player ---------- */
  const filmFrame = $('#filmFrame'), video = $('#filmVideo'), filmScene = $('#filmScene'), filmDevice = $('#filmDevice');
  if (filmFrame && video) {
    const fill = $('#filmFill'), toggle = $('#filmToggle'), muteBtn = $('#filmMute'), track = $('#filmTrack'), big = $('#filmBig');
    const playPause = () => { if (video.paused) video.play().catch(() => {}); else video.pause(); };
    const syncMute = () => muteBtn.classList.toggle('is-muted', video.muted);
    video.addEventListener('play', () => filmFrame.classList.add('playing'));
    video.addEventListener('pause', () => filmFrame.classList.remove('playing'));
    video.addEventListener('ended', () => filmFrame.classList.remove('playing'));
    filmFrame.addEventListener('click', e => { if (!e.target.closest('.film__controls')) playPause(); });
    big.addEventListener('click', e => { e.stopPropagation(); playPause(); });
    toggle.addEventListener('click', e => { e.stopPropagation(); playPause(); });
    muteBtn.addEventListener('click', e => { e.stopPropagation(); video.muted = !video.muted; syncMute(); });
    video.addEventListener('timeupdate', () => { if (video.duration) fill.style.transform = `scaleX(${(video.currentTime / video.duration).toFixed(4)})`; });
    track.addEventListener('click', e => { e.stopPropagation(); const r = track.getBoundingClientRect(); if (video.duration) video.currentTime = clamp((e.clientX - r.left) / r.width, 0, 1) * video.duration; });
    syncMute();

    // fullscreen
    const fsBtn = $('#filmFs');
    const fsToggle = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (fsEl) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else (filmFrame.requestFullscreen || filmFrame.webkitRequestFullscreen).call(filmFrame);
    };
    if (fsBtn) fsBtn.addEventListener('click', e => { e.stopPropagation(); fsToggle(); });
    const onFsChange = () => {
      const fs = (document.fullscreenElement || document.webkitFullscreenElement) === filmFrame;
      filmFrame.classList.toggle('is-fs', fs);
      if (fs && filmDevice) filmDevice.style.transform = 'rotateX(0deg)';
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);

    // smooth 3D mouse-tracking rotation (reveals the machined aluminium sides) + screen spotlight
    if (!reduce && filmDevice && filmScene) {
      const BASE_RX = -7;
      let tx = 0, ty = 0, cx = 0, cy = 0;
      if (fine) {
        filmScene.addEventListener('pointermove', e => {
          const r = filmScene.getBoundingClientRect();
          tx = (e.clientX - r.left) / r.width - 0.5;
          ty = (e.clientY - r.top) / r.height - 0.5;
          const fr = filmFrame.getBoundingClientRect();
          filmFrame.style.setProperty('--mx', (((e.clientX - fr.left) / fr.width) * 100).toFixed(1) + '%');
          filmFrame.style.setProperty('--my', (((e.clientY - fr.top) / fr.height) * 100).toFixed(1) + '%');
        });
        filmScene.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
      }
      (function spin() {
        cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
        if (!filmFrame.classList.contains('is-fs'))
          filmDevice.style.transform = `rotateX(${(BASE_RX - cy * 12).toFixed(2)}deg) rotateY(${(cx * 24).toFixed(2)}deg)`;
        requestAnimationFrame(spin);
      })();
    }

    // pointer callout — "Product Video" + straight leader line appear when the cursor is
    // AROUND the player; over the player nothing shows but the colour blob. Native cursor hidden.
    const fSec = $('#film'), ptr = $('.film__pointer'), cur = $('.film__cursor'), lead = $('.film__lead');
    if (fSec && ptr && cur && lead && fine && !reduce) {
      fSec.classList.add('is-live');
      let inSec = false, started = false, tx = 0, ty = 0, sx = 0, sy = 0;
      fSec.addEventListener('pointermove', e => {
        const sr = fSec.getBoundingClientRect();
        tx = e.clientX - sr.left; ty = e.clientY - sr.top;
        if (!started) { sx = tx; sy = ty; started = true; }
        inSec = true;
      });
      fSec.addEventListener('pointerleave', () => { inSec = false; });
      (function follow() {
        if (inSec) {
          sx += (tx - sx) * 0.2; sy += (ty - sy) * 0.2;
          const sr = fSec.getBoundingClientRect(), fr = filmFrame.getBoundingClientRect();
          const fl = fr.left - sr.left, ft = fr.top - sr.top, frt = fl + fr.width, fbt = ft + fr.height;
          const over = tx >= fl && tx <= frt && ty >= ft && ty <= fbt;   // hit-test the real pointer
          if (over || filmFrame.classList.contains('is-fs')) {
            ptr.classList.remove('show');
          } else {
            ptr.classList.add('show');
            cur.style.left = sx + 'px'; cur.style.top = sy + 'px';
            const ex = clamp(sx, fl, frt), ey = clamp(sy, ft, fbt);   // nearest point on the player edge
            const dx = sx - ex, dy = sy - ey;
            lead.style.left = ex + 'px'; lead.style.top = ey + 'px';
            lead.style.width = Math.hypot(dx, dy) + 'px';
            lead.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
          }
        } else {
          ptr.classList.remove('show');
        }
        requestAnimationFrame(follow);
      })();
    }

    if ('IntersectionObserver' in window) {   // pause when scrolled away
      new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting && !video.paused) video.pause(); }), { threshold: 0.25 }).observe(filmFrame);
    }
  }

  /* ---------- 8d. DETAIL TILES — slight cursor tilt + lift (dial & bezel macros) ---------- */
  if (fine && !reduce) {
    $$('.detail__img').forEach(box => {
      const img = box.querySelector('img');
      if (!img) return;
      box.addEventListener('pointermove', e => {
        const r = box.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        img.style.transform = `rotateY(${(px * 9).toFixed(2)}deg) rotateX(${(-py * 9).toFixed(2)}deg) translateY(-7px) scale(1.04)`;
      });
      box.addEventListener('pointerleave', () => { img.style.transform = ''; });
    });
  }

  /* ---------- 9. LOADER ---------- */
  const loader = $('#loader'), lFill = $('#loaderFill'), lPct = $('#loaderPct'), lAscii = $('#loaderAscii');
  (function loaderAscii() {
    const rows = 6, cols = 54, ramp = ' .:-=+*#%@'; let ph = 0;
    (function f() {
      if (loader.classList.contains('done')) return;
      let out = '';
      for (let y = 0; y < rows; y++) { let line = '';
        for (let x = 0; x < cols; x++) {
          const w = Math.sin(x / cols * 14 + ph) * 0.5 + Math.sin(x / cols * 30 - ph * 2) * 0.3;
          const mid = rows / 2 + w * rows * 0.5;
          line += ramp[Math.floor(clamp(1 - Math.abs(y - mid) / (rows * 0.5), 0, 1) * (ramp.length - 1))];
        } out += line + '\n'; }
      lAscii.textContent = out; ph += 0.16;
      if (!reduce) requestAnimationFrame(f);
    })();
  })();

  const start = performance.now(), dur = reduce ? 260 : 1300;
  (function progress(now) {
    const p = clamp((now - start) / dur, 0, 1);
    lPct.textContent = String(Math.floor(p * 100)).padStart(3, '0');
    lFill.style.width = (p * 100) + '%';
    if (p < 1) requestAnimationFrame(progress); else finish();
  })(start);

  function finish() {
    if (loader.classList.contains('done')) return;
    loader.classList.add('done');
    $$('.hero .reveal').forEach(n => n.classList.add('in'));
    // auto-demo the wordmark fill once
    const w = $('.playword');
    if (w && !reduce) { setTimeout(() => { w.classList.add('lit'); setTimeout(() => w.classList.remove('lit'), 1400); }, 400); }
  }
  setTimeout(finish, 2600); // safety net
})();
