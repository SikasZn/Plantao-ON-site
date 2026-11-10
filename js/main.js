/* Plantão ON — site institucional */
(function () {
  'use strict';

  /* ---------- Telas reais do aplicativo (decorativas nos slots) ---------- */
  var IMG = {
    inicio: 'assets/img/app-inicio.webp',
    financeiro: 'assets/img/app-financeiro.webp',
    relatorios: 'assets/img/app-relatorios.webp'
  };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-phone]').forEach(function (slot) {
    var src = IMG[slot.getAttribute('data-phone')];
    if (!src) return;
    var eager = !!slot.closest('.hero');
    var phone = document.createElement('div');
    phone.className = 'phone';
    if (slot.classList.contains('phone--back-slot')) phone.classList.add('phone--back');
    if (slot.classList.contains('phone--front-slot')) phone.classList.add('phone--front');
    phone.setAttribute('aria-hidden', 'true');
    phone.innerHTML = '<div class="screen screen--img"><img src="' + src + '" alt="" width="738" height="1600" decoding="async"' + (eager ? ' fetchpriority="high"' : ' loading="lazy"') + '></div>';
    slot.replaceWith(phone);
  });

  /* ---------- Menu mobile ---------- */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('menu');

  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.matchMedia('(min-width: 1020px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  /* ---------- Header com sombra ao rolar ---------- */
  var progress = document.querySelector('.progress i');
  var ticking = false;
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (progress) {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Link ativo conforme a seção ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if ('IntersectionObserver' in window && links.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = '#' + en.target.id;
        links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (t) { if (t) spy.observe(t); });
  }

  /* ---------- Revelar ao rolar ---------- */
  document.querySelectorAll('.feature-grid, .audience, .values, .plans, .contact-cards, .showcase-stage').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) { child.style.setProperty('--d', i); });
  });
  var revealEls = document.querySelectorAll('.reveal');
  function markDone(el) {
    var d = parseFloat(el.style.getPropertyValue('--d')) || 0;
    window.setTimeout(function () { el.classList.add('is-done'); }, 900 + d * 90);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); markDone(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in', 'is-done'); });
  }

  /* ---------- Brilho que segue o ponteiro (botões e cartões) ---------- */
  var glowSel = '.btn, .store-btn, .feature, .aud, .value, .contact-card, .plan';
  document.addEventListener('pointermove', function (e) {
    var t = e.target.closest ? e.target.closest(glowSel) : null;
    if (!t) return;
    var r = t.getBoundingClientRect();
    t.style.setProperty('--x', (e.clientX - r.left) + 'px');
    t.style.setProperty('--y', (e.clientY - r.top) + 'px');
  }, { passive: true });

  if (!reduceMotion) {
    /* ---------- Inclinação 3D nos celulares da vitrine ---------- */
    document.querySelectorAll('.tilt').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--rx', (x * 14).toFixed(2));
        el.style.setProperty('--ry', (-y * 10).toFixed(2));
        el.classList.add('is-tilting');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--rx', 0);
        el.style.setProperty('--ry', 0);
        el.classList.remove('is-tilting');
      });
    });

    /* ---------- Paralaxe suave dos celulares do hero ---------- */
    document.querySelectorAll('.hero-visual').forEach(function (box) {
      box.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = box.getBoundingClientRect();
        box.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        box.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
      box.addEventListener('pointerleave', function () {
        box.style.setProperty('--px', 0);
        box.style.setProperty('--py', 0);
      });
    });
  }


  /* ---------- Galeria em leque (uma tela no centro, vizinhas ao fundo) ---------- */
  var gTrack = document.getElementById('gal-track');
  if (gTrack) {
    var gCards = Array.prototype.slice.call(gTrack.children);
    var gDotsBox = document.getElementById('gal-dots');
    var gBtns = Array.prototype.slice.call(document.querySelectorAll('[data-gal]'));
    var gCur = 0, gN = gCards.length;

    gDotsBox.innerHTML = '';
    gCards.forEach(function (c, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Ver tela ' + (i + 1) + ' de ' + gN);
      d.addEventListener('click', function () { gSet(i); });
      gDotsBox.appendChild(d);
    });
    gDotsBox.removeAttribute('aria-hidden');

    var gRender = function () {
      var cw = gCards[0].getBoundingClientRect().width / (gCards[0].getBoundingClientRect().width ? 1 : 1);
      cw = parseFloat(getComputedStyle(gCards[0]).width) || cw;
      gCards.forEach(function (c, i) {
        var d = i - gCur, a = Math.abs(d), s = d < 0 ? -1 : 1;
        var x = 0, y = 0, sc = 1, rot = 0, op = 1, z = 10;
        if (a === 1) { x = s * cw * 0.78; y = 20; sc = 0.86; rot = s * 5; op = 0.58; z = 9; }
        else if (a === 2) { x = s * cw * 1.3; y = 46; sc = 0.74; rot = s * 10; op = 0.28; z = 8; }
        else if (a > 2) { x = s * cw * 1.6; y = 60; sc = 0.66; rot = s * 12; op = 0; z = 7; }
        c.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + rot + 'deg) scale(' + sc + ')';
        c.style.opacity = op;
        c.style.zIndex = z;
        c.style.pointerEvents = a > 2 ? 'none' : '';
        c.classList.toggle('is-active', d === 0);
        c.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
      });
      Array.prototype.forEach.call(gDotsBox.children, function (d, k) { d.classList.toggle('on', k === gCur); if (k === gCur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    };
    var gSet = function (i) { gCur = (i + gN) % gN; gRender(); };

    gBtns.forEach(function (b) { b.addEventListener('click', function () { gSet(gCur + parseInt(b.getAttribute('data-gal'), 10)); }); });
    gTrack.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); gSet(gCur + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); gSet(gCur - 1); }
    });
    gCards.forEach(function (c, i) { c.addEventListener('click', function () { if (!gMoved && i !== gCur) gSet(i); }); });

    // arrastar / deslizar com o dedo ou o mouse
    var gStartX = null, gMoved = false;
    gTrack.addEventListener('pointerdown', function (e) { gStartX = e.clientX; gMoved = false; });
    gTrack.addEventListener('pointermove', function (e) {
      if (gStartX === null) return;
      if (Math.abs(e.clientX - gStartX) > 8) { gMoved = true; gTrack.classList.add('is-drag'); }
    });
    var gEnd = function (e) {
      if (gStartX === null) return;
      var dx = e.clientX - gStartX;
      gStartX = null; gTrack.classList.remove('is-drag');
      if (Math.abs(dx) > 40) gSet(gCur + (dx < 0 ? 1 : -1));
      window.setTimeout(function () { gMoved = false; }, 0);
    };
    gTrack.addEventListener('pointerup', gEnd);
    gTrack.addEventListener('pointercancel', gEnd);
    gTrack.addEventListener('pointerleave', function () { gStartX = null; gTrack.classList.remove('is-drag'); });
    gTrack.addEventListener('dragstart', function (e) { e.preventDefault(); });
    window.addEventListener('resize', gRender);
    gRender();
  }

  /* ---------- Ano no rodapé ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Formulário de contato ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    var btn = document.getElementById('form-btn');
    var show = function (msg, ok) {
      status.textContent = msg;
      status.className = 'form-status ' + (ok ? 'is-ok' : 'is-err');
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = form.nome.value.trim();
      var email = form.email.value.trim();
      var assunto = form.assunto.value;
      var msg = form.mensagem.value.trim();
      if (!nome || !email || !assunto || msg.length < 5) { show('Preencha todos os campos para enviar.', false); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { show('Informe um e-mail válido.', false); return; }

      btn.disabled = true;
      var original = btn.textContent;
      btn.textContent = 'Enviando…';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (res.ok && res.body.ok) { show('Mensagem enviada! Responderemos em breve no e-mail informado.', true); form.reset(); }
          else { show((res.body && res.body.error) || 'Não foi possível enviar agora. Escreva para imthealthtech@imtmed.com.br.', false); }
        })
        .catch(function () { show('Não foi possível enviar agora. Escreva para imthealthtech@imtmed.com.br.', false); })
        .then(function () { btn.disabled = false; btn.textContent = original; });
    });
  }
})();
