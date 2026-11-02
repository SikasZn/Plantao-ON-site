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
