/* ============================================================
   DiveVision — общие утилиты: сайдбар, макет, бейджи, модалки,
   тосты, графики
   ============================================================ */
window.DV = window.DV || {};

DV.escapeHtml = function (str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

/* Маска даты дд.мм.гггг — точки подставляются автоматически */
DV.maskDate = function (el) {
  var v = (el.value || '').replace(/\D/g, '').slice(0, 8);
  var parts = [];
  if (v.length > 4) parts = [v.slice(0, 2), v.slice(2, 4), v.slice(4)];
  else if (v.length > 2) parts = [v.slice(0, 2), v.slice(2)];
  else parts = [v];
  el.value = parts.join('.');
};

/* Переход на страницу */
DV.goTo = function (href) {
  window.location.href = href;
};

DV.badge = function (key) {
  var s = DV.statusOf(key);
  var label = s ? s.label : key;
  var icon = key === 'ready' ? 'check' : (key === 'processing' ? 'spinner' : 'alert');
  return '<span class="badge ' + (s ? s.badge : '') + '">' + DV.icon(icon, 14) + DV.escapeHtml(label) + '</span>';
};

DV.avatar = function (initials, cls) {
  return '<div class="avatar ' + (cls || '') + '">' + DV.icon('user') + '</div>';
};

/* ---------- Сайдбар ---------- */
DV.navItems = [
  { key: 'home', label: 'Главная', icon: 'home', href: 'index.html' },
  { key: 'athletes', label: 'Мои спортсмены', icon: 'users', href: 'athletes.html' },
  { key: 'videos', label: 'Видеозаписи', icon: 'video', href: 'videos.html' },
  { key: 'analytics', label: 'Аналитика', icon: 'chart', href: 'analytics.html' },
  { key: 'compare', label: 'Сравнение', icon: 'compare', href: 'compare.html' }
];
DV.helpItems = [
  { key: 'help', label: 'Как снять видео?', icon: 'help', href: '#' },
  { key: 'settings', label: 'Настройки', icon: 'settings', href: '#' }
];

DV.sidebar = function (activeKey) {
  var nav = DV.navItems.map(function (i) {
    return '<button class="nav-item' + (i.key === activeKey ? ' active' : '') + '" data-nav="' + i.key + '" onclick="DV.goTo(\'' + i.href + '\')">' +
      DV.icon(i.icon) + '<span>' + i.label + '</span></button>';
  }).join('');
  var help = DV.helpItems.map(function (i) {
    return '<button class="nav-item" onclick="DV.toast(\'Раздел «' + i.label + '» доступен в полной версии\', \'info\')">' +
      DV.icon(i.icon) + '<span>' + i.label + '</span></button>';
  }).join('');

  return '<aside class="sidebar">' +
    '<div class="sidebar-brand"><img class="logo" src="assets/logo.png" alt="DiveVision"/><span class="name">DiveVision</span></div>' +
    '<button class="btn btn-primary upload-btn" onclick="DV.openUploadModal()">' + DV.icon('plus') + 'Загрузить видео</button>' +
    '<nav class="sidebar-nav">' +
      nav +
      '<div class="nav-sep"></div>' + help +
    '</nav>' +
    '<div class="sidebar-profile">' +
      DV.avatar('', '') +
      '<div><div class="p-name">' + DV.escapeHtml(DV.currentUser.name) + '</div><div class="p-role">' + DV.escapeHtml(DV.currentUser.role) + '</div></div>' +
      '<button class="chev-btn" title="Профиль" onclick="DV.openProfileModal()">' + DV.icon('chevUp') + '</button>' +
    '</div>' +
  '</aside>';
};

/* ---------- Макет страницы ---------- */
DV.layout = function (opts) {
  var toplineCrumb = '';
  if (opts.breadcrumb) {
    var parts = opts.breadcrumb.map(function (b, idx) {
      if (idx === opts.breadcrumb.length - 1) return '<span class="cur">' + DV.escapeHtml(b.label) + '</span>';
      var link = b.href ? '<a href="' + b.href + '">' + DV.escapeHtml(b.label) + '</a>' : '<span>' + DV.escapeHtml(b.label) + '</span>';
      return link + '<span class="sep">›</span>';
    }).join('');
    toplineCrumb = '<div class="topline-crumb">' + parts + '</div>';
  } else {
    toplineCrumb = '<div class="topline-title">' + DV.escapeHtml(opts.title) + '</div>';
  }

  var topline =
    '<div class="topline">' +
      toplineCrumb +
      '<div class="topline-user">' +
        '<button class="head-user" onclick="DV.openProfileModal()">' + DV.icon('user', 18) + '</button>' +
      '</div>' +
    '</div>';

  var head = '';
  if (opts.subtitle || opts.actions || opts.lead) {
    var inner = '';
    if (opts.lead) {
      inner = '<div class="title-wrap">' + opts.lead +
        '<div><h1>' + DV.escapeHtml(opts.title) + '</h1>' +
        (opts.subtitle ? '<div class="subtitle">' + DV.escapeHtml(opts.subtitle) + '</div>' : '') +
        '</div></div>';
    } else if (opts.subtitle) {
      inner = '<div class="subtitle">' + DV.escapeHtml(opts.subtitle) + '</div>';
    }
    var actions = '<div class="head-actions">' + (opts.actions || '') + '</div>';
    head = '<div class="page-head' + (opts.underline ? ' underline' : '') + '">' + inner + actions + '</div>';
  }

  return '<div class="app-layout">' + DV.sidebar(opts.active) +
      '<main class="main"><div class="content">' +
        topline + head + opts.body +
      '</div></main>' +
    '</div>';
};

/* ---------- Миниатюра видео ---------- */
DV.thumb = function (video, opts) {
  opts = opts || {};
  return '<span class="thumb ' + (video.thumb || 'dark') + '">' +
    '<span class="play">' + DV.icon('play') + '</span></span>';
};

/* ---------- Модальные окна ---------- */
DV.openModal = function (html, opts) {
  opts = opts || {};
  var root = document.getElementById('modal-root');
  var cls = 'modal ' + (opts.wide ? 'modal-wide' : '') + (opts.error ? ' modal-error' : '');
  root.innerHTML = '<div class="modal-overlay" onclick="if(event.target===this)DV.closeModal()">' +
    '<div class="' + cls.trim() + '" role="dialog">' + html + '</div></div>';
  document.body.style.overflow = 'hidden';
  var first = root.querySelector('input,select,textarea');
  if (first) setTimeout(function () { first.focus(); }, 30);
};

DV.modalShell = function (title, body, foot, opts) {
  opts = opts || {};
  return '<div class="modal-head"><h2>' + DV.escapeHtml(title) + '</h2>' +
    '<button class="modal-close" onclick="DV.closeModal()">' + DV.icon('close') + '</button></div>' +
    '<div class="modal-body">' + body + '</div>' +
    (foot ? '<div class="modal-foot">' + foot + '</div>' : '');
};

DV.closeModal = function () {
  var root = document.getElementById('modal-root');
  if (root) root.innerHTML = '';
  document.body.style.overflow = '';
};

/* ---------- Тосты ---------- */
DV.toast = function (msg, type) {
  type = type || 'info';
  var root = document.getElementById('toast-root');
  var el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = DV.icon('check', 16) + DV.escapeHtml(msg);
  root.appendChild(el);
  setTimeout(function () { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; }, 3000);
  setTimeout(function () { el.remove(); }, 3350);
};

/* ---------- Пагинация ---------- */
DV.pagination = function (current, totalPages) {
  var btns = [];
  var go = 'DV.goPage(event, %p)';
  var num = function (p) {
    btns.push('<button class="page-btn' + (p === current ? ' active' : '') + '" onclick="' + go.replace('%p', p) + '">' + p + '</button>');
  };
  var ell = function () {
    btns.push('<span class="page-ell">…</span>');
  };
  if (current > 1) btns.push('<button class="page-btn" onclick="' + go.replace('%p', current - 1) + '">' + DV.icon('chevLeft', 16) + '</button>');

  var max = 4;
  if (totalPages <= max) {
    for (var p = 1; p <= totalPages; p++) num(p);
  } else {
    var start = Math.max(1, current - 1);
    var end = Math.min(totalPages, start + max - 1);
    start = Math.max(1, end - max + 1);
    if (start > 1) num(1);
    if (start > 2) ell();
    for (var i = start; i <= end; i++) num(i);
    if (end < totalPages - 1) ell();
    if (end < totalPages) num(totalPages);
  }

  if (current < totalPages) btns.push('<button class="page-btn" onclick="' + go.replace('%p', current + 1) + '">' + DV.icon('chevRight', 16) + '</button>');
  return '<div class="pagination">' + btns.join('') + '</div>';
};

/* ---------- Линейный график (SVG) ---------- */
DV.lineChart = function (opts) {
  var W = 620, H = 260, padL = 42, padR = 16, padT = 16, padB = 32;
  var iw = W - padL - padR, ih = H - padT - padB;
  var min = opts.yMin, max = opts.yMax;
  var n = opts.labels.length;

  function X(i) { return padL + (n === 1 ? 0 : (iw * i / (n - 1))); }
  function Y(v) { return padT + ih - ((v - min) / (max - min)) * ih; }

  var grid = '';
  var steps = 7;
  for (var g = 0; g <= steps; g++) {
    var yv = min + ((max - min) * g / steps);
    var gy = Y(yv);
    grid += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (W - padR) + '" y2="' + gy + '" stroke="#e7ecf5" stroke-width="1"/>';
    grid += '<text x="' + (padL - 10) + '" y="' + (gy + 4) + '" text-anchor="end" font-size="11" fill="#adb5bd">' + yv.toFixed(2).replace('.', ',') + '</text>';
  }
  var xlabels = '';
  opts.labels.forEach(function (l, i) {
    xlabels += '<text x="' + X(i) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="11" fill="#adb5bd">' + l + '</text>';
  });

  function series(data, color) {
    var pts = data.map(function (v, i) { return X(i) + ',' + Y(v); });
    var line = '<polyline fill="none" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="' + pts.join(' ') + '"/>';
    var dots = data.map(function (v, i) {
      return '<circle cx="' + X(i) + '" cy="' + Y(v) + '" r="4" fill="#fff" stroke="' + color + '" stroke-width="2.5"/>';
    }).join('');
    return line + dots;
  }

  return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" style="max-height:320px">' +
    grid + xlabels +
    series(opts.series[0].data, opts.series[0].color) +
    (opts.series[1] ? series(opts.series[1].data, opts.series[1].color) : '') +
    '</svg>';
};

/* ---------- Видео-плеер (заглушка) ---------- */
DV.videoPlayer = function (opts) {
  opts = opts || {};
  var dur = opts.duration || '0:24';
  var cur = opts.current || '0:12';
  return '<div class="video-player" style="' + (opts.style || '') + '">' +
    '<div class="overlay" style="background:radial-gradient(circle at 50% 40%, #1a4a78 0%, #0a2a4a 55%, #06203a 100%)"></div>' +
    '<div class="tag-line" style="top:18%"><span class="t-name">Положение тела</span></div>' +
    '<div class="tag" style="left:64%;top:42%">Угол в тазобедренном суставе · 172°</div>' +
    '<div class="tag" style="left:14%;top:62%">Скорость входа в воду · 3,1 м/с</div>' +
    '<div class="big-play" onclick="DV.toast(\'Воспроизведение видео (демо)\', \'info\')">' + DV.icon('playBig') + '</div>' +
    '<div class="video-controls">' +
      '<button class="ctrl">' + DV.icon('play', 18) + '</button>' +
      '<span class="time">' + cur + ' / ' + dur + '</span>' +
      '<div class="video-track"><div class="fill"></div></div>' +
      '<button class="ctrl">' + DV.icon('volume', 18) + '</button>' +
      '<button class="ctrl">' + DV.icon('fullscreen', 18) + '</button>' +
    '</div></div>';
};