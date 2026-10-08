/* Plantão ON — site institucional */
(function () {
  'use strict';

  /* ---------- Mock do aplicativo (decorativo, ilustrativo) ---------- */
  var tab = function (on) {
    return '<div class="tabbar">' +
      '<span class="' + (on === 0 ? 'on' : '') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18"/></svg>Início</span>' +
      '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4"/></svg>Agenda</span>' +
      '<span class="plus">+</span>' +
      '<span class="' + (on === 3 ? 'on' : '') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 20V11M11 20V4M17 20v-6"/></svg>Finanças</span>' +
      '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>Perfil</span>' +
      '</div>';
  };

  function calendarCells() {
    // Outubro/2026 começa numa quinta-feira (4 dias do mês anterior)
    var marks = { 2: '#16a34a', 5: '#3b82f6', 7: '#16a34a', 9: '#f59e0b', 12: '#3b82f6', 14: '#16a34a', 17: '#8b5cf6', 20: '#16a34a', 23: '#f59e0b', 26: '#3b82f6', 29: '#16a34a' };
    var out = '';
    [27, 28, 29, 30].forEach(function (d) { out += '<span class="m">' + d + '</span>'; });
    for (var d = 1; d <= 31; d++) {
      var cls = [];
      var style = '';
      if (marks[d]) { cls.push('d'); style = ' style="--c:' + marks[d] + '"'; }
      if (d === 7) cls.push('t');
      out += '<span' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + style + '>' + d + '</span>';
    }
    return out;
  }

  var PHONES = {
    calendar:
      '<div class="screen">' +
        '<div class="screen-top"><div class="hello"><span>Olá, Dr. José 👋</span><i>＋</i></div>' +
        '<div class="month">Outubro 2026</div>' +
        '<div class="stat-row"><div class="stat"><b>12</b><span>Plantões</span></div><div class="stat"><b>144</b><span>Horas</span></div></div></div>' +
        '<div class="money-row">' +
          '<div class="money"><small>Previstos</small><b>R$ 18.400</b></div>' +
          '<div class="money money--g"><small>Recebidos</small><b>R$ 12.600</b></div>' +
          '<div class="money money--a"><small>A receber</small><b>R$ 5.800</b></div>' +
        '</div>' +
        '<div class="screen-body">' +
          '<div class="cal"><div class="cal-head"><span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span></div><div class="cal-grid">' + calendarCells() + '</div></div>' +
          '<div class="screen-title">Próximos plantões</div>' +
          '<div class="shift" style="--c:#16a34a"><i class="bar"></i><div><b>Hospital Central</b><small>07:00 – 19:00 · UTI</small></div><em>R$ 1.500</em></div>' +
          '<div class="shift" style="--c:#f59e0b"><i class="bar"></i><div><b>Pronto Atendimento Sul</b><small>19:00 – 07:00 · PS</small></div><em>R$ 1.400</em></div>' +
        '</div>' + tab(0) +
      '</div>',
    finance:
      '<div class="screen">' +
        '<div class="screen-top"><div class="hello"><span>Finanças</span></div><div class="month">Outubro 2026</div></div>' +
        '<div class="screen-body" style="padding-top:12px">' +
          '<div class="money-row" style="padding:0 0 4px"><div class="money"><small>Previstos</small><b>R$ 18.400</b></div><div class="money money--g"><small>Recebidos</small><b>R$ 12.600</b></div><div class="money money--a"><small>A receber</small><b>R$ 5.800</b></div></div>' +
          '<div class="donut"><div><span><b>12</b><small>plantões</small></span></div></div>' +
          '<div class="screen-title">Ganhos por hospital</div>' +
          '<div class="hbars">' +
            '<div class="row"><span>Hosp. Central</span><div class="track"><i style="--c:#16a34a;--w:82%"></i></div><span>7.500</span></div>' +
            '<div class="row"><span>UPA Norte</span><div class="track"><i style="--c:#3b82f6;--w:66%"></i></div><span>6.000</span></div>' +
            '<div class="row"><span>Clínica Vida</span><div class="track"><i style="--c:#f59e0b;--w:48%"></i></div><span>4.500</span></div>' +
            '<div class="row"><span>Hosp. Sul</span><div class="track"><i style="--c:#8b5cf6;--w:30%"></i></div><span>2.800</span></div>' +
          '</div>' +
        '</div>' + tab(3) +
      '</div>'
  };

  document.querySelectorAll('[data-phone]').forEach(function (slot) {
    var html = PHONES[slot.getAttribute('data-phone')];
    if (!html) return;
    var phone = document.createElement('div');
    phone.className = 'phone';
    if (slot.classList.contains('phone--back-slot')) phone.classList.add('phone--back');
    if (slot.classList.contains('phone--front-slot')) phone.classList.add('phone--front');
    phone.setAttribute('aria-hidden', 'true');
    phone.innerHTML = html;
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
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
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
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
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
