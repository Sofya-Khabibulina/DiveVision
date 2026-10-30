/* ============================================================
   DiveVision — многостраничное приложение: логика страниц,
   модалок и авторизации. Разметка — в HTML, UI-хелперы — common.js
   ============================================================ */
window.DV = window.DV || {};

/* ---------- Состояние ---------- */
DV.state = {
  homePage: 1,
  videosPage: 1,
  athletePage: 1,
  selected: {},       // выбранные видео для сравнения
  compareAttempts: { 1: null, 2: null }, // видео для попыток на экране «Сравнение»
  analyticsVideo: null, // видео, анализируемое на экране «Аналитика»
  analyticsMetric: '', // выбранный показатель для графика ('' — не выбран)
  videosQuery: '', // поисковый запрос на экране «Видеозаписи»
  athletesQuery: '', // поисковый запрос на экране «Мои спортсмены»
  athletesGroup: '', // выбранная группа спортсменов ('' — все)
  athletesAge: '', // выбранная возрастная категория ('' — все)
  uploading: null, // последняя загрузка видео (для прогресс-бара)
  uploadProgress: 0, // процент загрузки текущего видео
  quickVideo: false, // выбрано ли видео в «Быстрой загрузке»
  authError: false, // ошибка «Неверный email или пароль»
  registerErrors: {}, // ошибки валидации формы регистрации
  registerEmail: '', // email после успешной регистрации
  videosFilter: { athlete: '', element: '', statuses: { all: true, ready: false, processing: false, error: false }, dateFrom: '', dateTo: '' }
};

/* ---------- Авторизация ---------- */
DV.authed = function () { return sessionStorage.getItem('dv_auth') === '1'; };

DV.logout = function () {
  sessionStorage.removeItem('dv_auth');
  sessionStorage.removeItem('dv_user');
  DV.goTo('login.html');
};

/* Показ/скрытие пароля */
DV.togglePass = function (id) {
  var inp = document.getElementById(id);
  if (!inp) return;
  var show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  var btn = document.querySelector('[data-toggle="' + id + '"]');
  if (btn) btn.innerHTML = DV.icon(show ? 'eyeOff' : 'eye', 20);
};

/* Сброс ошибки поля при вводе */
DV.clearFieldError = function (key) {
  if (!DV.state.registerErrors[key]) return;
  delete DV.state.registerErrors[key];
  var map = { name: 'rg_name', email: 'rg_email', pass: 'rg_pass' };
  var inp = document.getElementById(map[key]);
  if (inp) inp.classList.remove('invalid');
  var span = document.getElementById('err_' + key);
  if (span) span.innerHTML = '';
};

/* ---------- Экран авторизации ---------- */
DV.goAuth = function (mode) {
  DV.state.authError = false;
  DV.state.registerErrors = {};
  if (mode === 'login') { DV.goTo('login.html'); return; }
  if (mode === 'register') { DV.goTo('register.html'); return; }
  DV.renderAuth(mode);
};

DV.renderAuth = function (mode) {
  mode = mode || 'login';
  DV.users = DV.loadUsers();
  var app = document.getElementById('app');
  var card =
    '<div class="login-wrap"><div class="login-card">' +
      '<div class="login-brand"><img class="logo" src="assets/logo.png" alt="DiveVision"/><span class="name">DiveVision</span></div>';

  if (mode === 'login') {
    var banner = DV.state.authError
      ? '<div class="auth-error"><span class="ae-ic">' + DV.icon('alertCircle', 20) + '</span>' +
        '<div><div class="ae-title">Неверный email или пароль</div><div class="ae-sub">Проверьте данные и попробуйте ещё раз.</div></div></div>'
      : '';
    var body =
      '<h1>Вход в аккаунт</h1>' +
      '<p class="login-sub">Введите данные, чтобы продолжить</p>' + banner +
      '<form onsubmit="DV.doLogin(event)">' +
        '<div class="field"><label>Email</label>' +
          '<input class="input" id="lg_email" type="text" placeholder="example@mail.com" autocomplete="email" />' +
        '</div>' +
        '<div class="field"><label>Пароль</label>' +
          '<div class="password-wrap">' +
            '<input class="input" id="lg_pass" type="password" placeholder="Введите пароль" autocomplete="current-password" />' +
            '<button type="button" class="eye-btn" data-toggle="lg_pass" onclick="DV.togglePass(\'lg_pass\')">' + DV.icon('eye', 20) + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="login-opt">' +
          '<label class="checkbox-row"><input type="checkbox">Запомнить меня</label>' +
          '<a href="#" class="forgot" onclick="event.preventDefault();DV.toast(\'Восстановление пароля (демо)\',\'info\')">Забыли пароль?</a>' +
        '</div>' +
        '<button class="btn btn-primary btn-block" type="submit">Войти</button>' +
      '</form>' +
      '<p class="auth-switch">Нет аккаунта? <a href="#" onclick="event.preventDefault();DV.goAuth(\'register\')">Зарегистрироваться</a></p>';
  }
  else if (mode === 'register') {
    var err = DV.state.registerErrors || {};
    var errSpan = function (key) {
      return '<span class="field-error" id="err_' + key + '">' + (err[key] || '') + '</span>';
    };
    var invalid = function (key) {
      return err[key] ? ' invalid' : '';
    };
    var body =
      '<h1>Регистрация</h1>' +
      '<p class="login-sub">Создайте аккаунт тренера, чтобы получить доступ к возможностям DiveVision</p>' +
      '<form onsubmit="DV.doRegister(event)">' +
        '<div class="field"><label>ФИО</label>' +
          '<input class="input' + invalid('name') + '" id="rg_name" placeholder="Иванов Иван Иванович" oninput="DV.clearFieldError(\'name\')" />' +
          errSpan('name') + '</div>' +
        '<div class="field"><label>Email</label>' +
          '<input class="input' + invalid('email') + '" id="rg_email" type="text" placeholder="example@mail.com" oninput="DV.clearFieldError(\'email\')" />' +
          errSpan('email') + '</div>' +
        '<div class="field"><label>Пароль</label>' +
          '<div class="password-wrap">' +
            '<input class="input' + invalid('pass') + '" id="rg_pass" type="password" placeholder="Придумайте пароль" oninput="DV.clearFieldError(\'pass\')" />' +
            '<button type="button" class="eye-btn" data-toggle="rg_pass" onclick="DV.togglePass(\'rg_pass\')">' + DV.icon('eye', 20) + '</button>' +
          '</div>' + errSpan('pass') + '</div>' +
        '<button class="btn btn-primary btn-block" type="submit">Зарегистрироваться</button>' +
      '</form>' +
      '<p class="auth-switch">Уже есть аккаунт? <a href="#" onclick="event.preventDefault();DV.goAuth(\'login\')">Войти</a></p>';
  }
  else {
    var info = {
      success: { ic: 'checkCircle', title: 'Регистрация прошла успешно!', sub: 'Теперь вы можете войти в свой аккаунт и начать работу с DiveVision.', btn: 'Перейти к входу', cb: 'DV.goAuth(\'login\')' },
      expired: { ic: 'alertCircle', title: 'Сессия истекла', sub: 'Ваша сессия завершилась. Пожалуйста, войдите в аккаунт снова.', btn: 'Войти', cb: 'DV.goAuth(\'login\')' },
      network: { ic: 'wifiOff', title: 'Ошибка соединения', sub: 'Проверьте подключение к интернету и попробуйте ещё раз.', btn: 'Повторить', cb: 'DV.goAuth(\'login\')' }
    }[mode] || { ic: 'alertCircle', title: 'Что-то пошло не так', sub: 'Попробуйте ещё раз.', btn: 'Назад', cb: 'DV.goAuth(\'login\')' };
    var body =
      '<div class="auth-status">' +
        '<div class="as-ic">' + DV.icon(info.ic, 54) + '</div>' +
        '<h1>' + info.title + '</h1>' +
        '<p class="login-sub">' + info.sub + '</p>' +
        '<button class="btn btn-primary" onclick="' + info.cb + '">' + info.btn + '</button>' +
      '</div>';
  }

  app.innerHTML = card + body + '</div></div>';
};

/* ---------- Вход ---------- */
DV.doLogin = function (e) {
  e.preventDefault();
  var email = document.getElementById('lg_email').value.trim();
  var pass = document.getElementById('lg_pass').value;
  if (!email || !pass) {
    if (!email) document.getElementById('lg_email').classList.add('invalid');
    if (!pass) document.getElementById('lg_pass').classList.add('invalid');
    return;
  }
  var user = DV.users.find(function (u) { return u.email.toLowerCase() === email.toLowerCase(); });
  if (!user || user.pass !== pass) {
    DV.state.authError = true;
    DV.renderAuth('login');
    return;
  }
  DV.currentUser.name = user.name;
  DV.currentUser.email = user.email;
  sessionStorage.setItem('dv_user', JSON.stringify(user));
  sessionStorage.setItem('dv_auth', '1');
  DV.goTo('index.html');
};

/* ---------- Регистрация ---------- */
DV.doRegister = function (e) {
  e.preventDefault();
  var name = document.getElementById('rg_name').value.trim();
  var email = document.getElementById('rg_email').value.trim();
  var pass = document.getElementById('rg_pass').value;
  var errs = {};

  if (name.split(/\s+/).filter(Boolean).length < 2) errs.name = 'Укажите полное ФИО';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Введите корректный email';
  else if (DV.users.some(function (u) { return u.email.toLowerCase() === email.toLowerCase(); })) errs.email = 'Этот email уже зарегистрирован';
  if (pass.length < 8) errs.pass = 'Пароль должен содержать минимум 8 символов';

  DV.state.registerErrors = errs;
  if (Object.keys(errs).length) { DV.renderAuth('register'); return; }

  DV.users.push({ name: name, email: email, pass: pass });
  DV.saveUsers();
  DV.state.registerErrors = {};
  DV.state.registerEmail = email;
  DV.renderAuth('success');
};

/* ---------- Навигация ---------- */
DV.getParam = function (name) {
  var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return m ? decodeURIComponent(m[1]) : null;
};

/* Переход на страницу */
DV.go = function (e, href) {
  if (e) e.preventDefault();
  window.location.href = href;
};

/* Переключение страницы пагинации (перезагрузка текущей страницы) */
DV.goPage = function (e, p) {
  if (e) e.preventDefault();
  if (DV.page === 'home') DV.state.homePage = p;
  else if (DV.page === 'videos') DV.state.videosPage = p;
  else if (DV.page === 'athlete') DV.state.athletePage = p;
  DV.reload();
};

/* ---------- Состояние между страницами ---------- */
DV.loadSel = function () {
  try { return JSON.parse(sessionStorage.getItem('dv_sel') || '{}'); } catch (e) { return {}; }
};
DV.saveSel = function () {
  sessionStorage.setItem('dv_sel', JSON.stringify(DV.state.selected));
};
DV.loadUsers = function () {
  try {
    var saved = JSON.parse(localStorage.getItem('dv_users'));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (e) { /* ignore */ }
  return DV.users;
};
DV.saveUsers = function () {
  localStorage.setItem('dv_users', JSON.stringify(DV.users));
};

/* Персистентные данные: видеозаписи и спортсмены (добавленные пользователем) */
DV.loadVideos = function () {
  try {
    var saved = JSON.parse(localStorage.getItem('dv_videos'));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (e) { /* ignore */ }
  return DV.videos;
};
DV.saveVideos = function () {
  localStorage.setItem('dv_videos', JSON.stringify(DV.videos));
};
DV.loadAthletes = function () {
  try {
    var saved = JSON.parse(localStorage.getItem('dv_athletes'));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (e) { /* ignore */ }
  return DV.athletes;
};
DV.saveAthletes = function () {
  localStorage.setItem('dv_athletes', JSON.stringify(DV.athletes));
};

/* Восстановление профиля вошедшего пользователя */
DV.applyUser = function () {
  try {
    var u = JSON.parse(sessionStorage.getItem('dv_user'));
    if (u) { DV.currentUser.name = u.name; DV.currentUser.email = u.email; }
  } catch (e) { /* ignore */ }
};

/* ---------- Инициализация страницы ---------- */
DV.page = ''; // название текущей страницы (home, athletes, athlete, videos, analytics, compare)
DV.reload = function () { DV.init(DV.page); };

DV.init = function (page) {
  DV.page = page || DV.page;
  if (!DV.authed()) { DV.goTo('login.html'); return; }

  DV.users = DV.loadUsers();
  DV.videos = DV.loadVideos();
  DV.athletes = DV.loadAthletes();
  DV.applyUser();
  DV.state.selected = DV.loadSel();

  var app = document.getElementById('app');
  var body;
  if (DV.page === 'home') body = DV.pageHome();
  else if (DV.page === 'athletes') body = DV.pageAthletes();
  else if (DV.page === 'athlete') body = DV.pageAthlete(DV.getParam('id'));
  else if (DV.page === 'videos') body = DV.pageVideos();
  else if (DV.page === 'analytics') body = DV.pageAnalytics(DV.getParam('v'));
  else if (DV.page === 'compare') body = DV.pageCompare();
  else { DV.goTo('index.html'); return; }

  app.innerHTML = body;
  if (DV.state.uploading) {
    app.insertAdjacentHTML('beforeend', DV.homeUploadToast());
    DV.startUpload();
  }
  window.scrollTo(0, 0);
};

/* ============================================================
   ГЛАВНАЯ
   ============================================================ */
DV.pageHome = function () {
  var cards = DV.summary.map(function (c) {
    return '<a class="stat-card' + (c.alert ? ' alert' : '') + '" href="' + c.link + '">' +
      '<div class="ic ' + c.ic + '">' + DV.icon(c.icon) + '</div>' +
      '<div><div class="val">' + c.value + '</div><div class="lbl">' + c.label + '</div></div>' +
    '</a>';
  }).join('');

  var alerts = DV.alerts.map(function (a) {
    var onClick = a.action === 'Выбрать другой файл'
      ? 'DV.openReplaceVideo()'
      : 'DV.toast(\'Действие выполнено\',\'success\')';
    return '<div class="alert-item">' +
      '<div class="a-ic ' + a.type + '">' + DV.icon(a.type === 'warn' ? 'alert' : 'alertCircle') + '</div>' +
      '<div class="a-text">' + a.title + '<div class="a-sub">' + a.sub + '</div></div>' +
      '<a class="a-link" href="#" onclick="event.preventDefault();' + onClick + '">' + a.action + '</a>' +
    '</div>';
  }).join('');

  var homePer = 4;
  var homeTotal = DV.videos.length;
  var homePages = Math.max(1, Math.ceil(homeTotal / homePer));
  var hp = DV.state.homePage; if (hp > homePages) hp = homePages;
  var recent = DV.videos.slice((hp - 1) * homePer, hp * homePer).map(function (v) {
    var checked = DV.state.selected[v.id] ? 'checked' : '';
    return '<tr>' +
      DV.checkCell(v) +
      '<td><div class="cell-video">' + DV.thumb(v) + '</div></td>' +
      '<td>' + DV.escapeHtml(v.element) + '</td>' +
      '<td>' + v.date + '</td>' +
      '<td>' + DV.badge(v.status) + '</td>' +
      DV.analyticsArrow(v) +
    '</tr>';
  }).join('');
  var homeShown = recent.split('</tr>').length - 1;

  var selectedCount = Object.keys(DV.state.selected).filter(function (k) { return DV.videoById(k); }).length;
  var canCompare = selectedCount >= 2;

  var body =
    '<div class="home-sec-head">Сводка</div>' +
    '<div class="stat-grid">' + cards + '</div>' +
    '<div class="home-duo">' +
      '<div class="card"><div class="card-title">Быстрая загрузка</div>' +
        '<div class="quick-upload">' +
          '<div class="field"><label>Спортсмен</label><select class="select" id="q-student" onchange="DV.checkQuick()"><option value="">Выбрать спортсмена</option>' +
            DV.athletes.map(function (a) { return '<option value="' + a.id + '">' + a.name + '</option>'; }).join('') + '</select></div>' +
          '<div class="field"><label>Спортивный элемент</label><select class="select" id="q-element" onchange="DV.checkQuick()"><option value="">Выберите элемент</option>' +
            DV.elements.map(function (el) { return '<option>' + el + '</option>'; }).join('') + '</select></div>' +
          '<div class="quick-actions">' +
          '<button class="btn btn-primary" onclick="DV.pickQuickVideo()">' + DV.icon('video') + 'Выбрать видео из галереи</button>' +
          '<button class="btn" id="q-submit" disabled onclick="DV.quickUpload()">Загрузить</button>' +
        '</div>' +
        '</div>' +
      '</div>' +
      '<div class="card"><div class="card-title">Требует внимания</div><div class="alert-list">' + alerts + '</div></div>' +
    '</div>' +
    '<div class="card"><div class="card-title">Последние выполнения</div>' +
      '<div class="table-wrap"><table class="table">' +
        '<thead><tr><th></th><th>Видео</th><th>Выполняемый элемент</th><th>Дата съемки</th><th>Статус</th><th></th></tr></thead>' +
        '<tbody>' + recent + '</tbody>' +
      '</table></div>' +
      '<div class="table-foot">' +
        '<span class="info">Показано ' + homeShown + ' из ' + homeTotal + '</span>' +
        DV.pagination(hp, homePages) +
      '</div>' +
    '</div>' +
    '<div class="compare-cta">' +
      '<button class="btn btn-primary" ' + (canCompare ? '' : 'disabled') + ' onclick="DV.go(event,\'compare.html\')">' + DV.icon('compare') + 'Сравнить выбранные</button>' +
      '<span class="tip">Выберите 2 выполнения со статусом «Готово»</span>' +
    '</div>';

  return DV.layout({ active: 'home', title: 'Главная', plainTitle: true, underline: true, body: body });
};

DV.homeUploadToast = function () {
  var up = DV.state.uploading;
  if (!up) return '';
  return '<div class="upload-toast">' +
    '<div>' + DV.icon('video', 26) + '</div>' +
    '<div><div class="u-name">' + DV.escapeHtml(up.name) + '</div><div class="u-sub">' + DV.escapeHtml(up.athleteName) + '</div></div>' +
    '<div class="u-progress"><div class="u-fill" id="up-fill" style="width:0%"></div></div>' +
    '<span class="u-pct" id="up-pct">0%</span>' +
    '<div style="display:flex;gap:4px">' +
      '<button class="icon-btn" onclick="DV.toast(\'Открыть видео\',\'info\')">' + DV.icon('upload') + '</button>' +
      '<button class="icon-btn" onclick="event.target.closest(\'.upload-toast\').remove()">' + DV.icon('close') + '</button>' +
    '</div>' +
  '</div>';
};

/* Анимация медленной загрузки */
DV.uploadTimer = null;
DV.startUpload = function () {
  if (DV.uploadTimer) clearInterval(DV.uploadTimer);
  var fill = document.getElementById('up-fill');
  var pct = document.getElementById('up-pct');
  if (!fill) return;
  var v = DV.state.uploadProgress || 0;
  fill.style.width = v + '%';
  pct.textContent = Math.round(v) + '%';
  DV.uploadTimer = setInterval(function () {
    var step;
    if (v < 60) step = 0.4 + Math.random() * 1.4;
    else if (v < 90) step = 0.15 + Math.random() * 0.5;
    else step = 0.08;
    v += step;
    if (v >= 100) {
      v = 100;
      clearInterval(DV.uploadTimer); DV.uploadTimer = null;
      DV.state.uploadProgress = 100;
      fill.style.width = '100%';
      pct.textContent = '100%';
      setTimeout(DV.completeUpload, 600);
      return;
    }
    DV.state.uploadProgress = v;
    fill.style.width = v + '%';
    pct.textContent = Math.round(v) + '%';
  }, 100);
};

/* Завершение загрузки: записываем видео в список и обновляем экран */
DV.completeUpload = function () {
  var up = DV.state.uploading;
  DV.state.uploading = null;
  DV.state.uploadProgress = 0;
  if (up && up.video) {
    var video = up.video;
    video.id = 'v' + (DV.videos.length + 1);
    video.selected = false;
    DV.videos.unshift(video);
    DV.saveVideos();
    DV.toast('Видео загружено', 'success');
  }
  DV.reload();
};

/* ============================================================
   МОИ СПОРТСМЕНЫ
   ============================================================ */
DV.pageAthletes = function () {
  var groups = [];
  DV.athletes.forEach(function (a) { if (a.group && groups.indexOf(a.group) === -1) groups.push(a.group); });
  var groupOpts = groups.map(function (g) {
    return '<option value="' + g + '"' + (g === DV.state.athletesGroup ? ' selected' : '') + '>' + g + '</option>';
  }).join('');
  var ageOpts = DV.ageGroups.map(function (ag) {
    return '<option value="' + ag.key + '"' + (ag.key === DV.state.athletesAge ? ' selected' : '') + '>' + ag.label + '</option>';
  }).join('');

  var body =
    '<div class="filter-bar">' +
      '<div class="input-group" style="max-width:420px">' +
        '<div style="position:relative;flex:1"><span style="position:absolute;left:12px;top:9px;color:#adb5bd">' + DV.icon('search', 18) + '</span>' +
        '<input class="input" style="padding-left:38px" placeholder="Поиск по ФИО спортсмена..." value="' + DV.state.athletesQuery + '" oninput="DV.searchAthletes(this.value)" /></div>' +
      '</div>' +
      '<select class="select" onchange="DV.filterByGroup(this.value)"><option value="">Все группы</option>' + groupOpts + '</select>' +
      '<select class="select" onchange="DV.filterByAge(this.value)"><option value="">Все возраста</option>' + ageOpts + '</select>' +
      '<button class="btn btn-soft">' + DV.icon('sort') + 'Сортировка</button>' +
    '</div>' +
    '<div class="athlete-grid" id="athlete-grid">' + DV.athleteGridHTML(DV.filterAthletes()) + '</div>';

  return DV.layout({
    active: 'athletes',
    breadcrumb: [{ label: 'Мои спортсмены' }, { label: '' }],
    lead: '<span class="page-lead">' + DV.icon('users', 24) + '</span>',
    title: 'Мои спортсмены',
    subtitle: 'Управляйте профилями спортсменов',
    underline: true,
    actions: '<button class="btn btn-primary" onclick="DV.openAddAthlete()">' + DV.icon('plus') + 'Добавить спортсмена</button>',
    body: body
  });
};

/* --- Карточки спортсменов (сетка) --- */
DV.athleteGridHTML = function (list) {
  return list.map(function (a, i) {
    var ac = (i % 2 === 0) ? ' ac-blue' : ' ac-purple';
    var last = a.last
      ? '<div class="last"><span class="l-lbl">Последнее выполнение</span><div class="l-row"><b>' + a.last.date + '</b><b>' + a.last.score + '</b>' + DV.badge(a.last.status) + '</div></div>'
      : '';
    return '<div class="athlete-card">' +
      '<div class="top">' + DV.avatar(a.initials, 'avatar-lg' + ac) +
        '<div><div class="a-name">' + a.name + '</div><div class="a-cat">' + a.category + ' | ' + a.age + '</div></div>' +
      '</div>' +
      '<div class="stats">' +
        '<div class="s-block"><span class="s-ic">' + DV.icon('video', 16) + '</span><div><div class="s-val">' + a.performances + '</div><div class="s-lbl">выполнений</div></div></div>' +
        '<div class="s-block"><span class="s-ic">' + DV.icon('chart', 16) + '</span><div><div class="s-val">' + a.analyses + '</div><div class="s-lbl">анализов</div></div></div>' +
      '</div>' +
      last +
      '<div class="bottom"><a class="a-link" href="athlete.html?id=' + a.id + '">Открыть</a>' +
        '<span class="ell">' + DV.icon('dots') + '</span></div>' +
    '</div>';
  }).join('');
};

/* --- Возрастные категории для фильтра --- */
DV.ageGroups = [
  { key: 'under18', label: 'До 18 лет', test: function (y) { return y < 18; } },
  { key: '18-20', label: '18–20 лет', test: function (y) { return y >= 18 && y <= 20; } },
  { key: '21-23', label: '21–23 года', test: function (y) { return y >= 21 && y <= 23; } },
  { key: '24plus', label: '24+ года', test: function (y) { return y >= 24; } }
];

/* --- Фильтрация спортсменов по поиску, группе и возрасту --- */
DV.filterAthletes = function () {
  var q = (DV.state.athletesQuery || '').trim().toLowerCase();
  var g = DV.state.athletesGroup;
  var a = DV.state.athletesAge;
  var ageGroup = DV.ageGroups.find(function (x) { return x.key === a; });
  return DV.athletes.filter(function (at) {
    if (q && at.name.toLowerCase().indexOf(q) === -1) return false;
    if (g && at.group !== g) return false;
    if (ageGroup && !ageGroup.test(at.ageYears)) return false;
    return true;
  });
};

/* --- Поиск и фильтры спортсменов --- */
DV.renderAthletes = function () {
  var grid = document.getElementById('athlete-grid');
  if (grid) grid.innerHTML = DV.athleteGridHTML(DV.filterAthletes());
};
DV.searchAthletes = function (q) {
  DV.state.athletesQuery = q || '';
  DV.renderAthletes();
};
DV.filterByGroup = function (v) {
  DV.state.athletesGroup = v || '';
  DV.renderAthletes();
};
DV.filterByAge = function (v) {
  DV.state.athletesAge = v || '';
  DV.renderAthletes();
};

/* ============================================================
   ЭКРАН СПОРТСМЕНА
   ============================================================ */
DV.pageAthlete = function (id) {
  var a = DV.athleteById(id);
  if (!a) { DV.goTo('athletes.html'); return ''; }
  var list = DV.videos.filter(function (v) { return v.athlete === id; });
  var total = list.length;
  var per = 4;
  var pages = Math.max(1, Math.ceil(total / per));
  var pg = DV.state.athletePage; if (pg > pages) pg = pages;
  var rows = list.slice((pg - 1) * per, pg * per).map(function (v) {
    var err = v.status === 'error' ? ' <a href="#" class="a-link" style="font-size:13px" onclick="event.preventDefault();DV.toast(\'Анализ повторно запущен\',\'success\')">Повторить</a>' : '';
    var checked = DV.state.selected[v.id] ? 'checked' : '';
    return '<tr>' +
      DV.checkCell(v) +
      '<td><div class="cell-video">' + DV.thumb(v) + '</div></td>' +
      '<td>' + DV.escapeHtml(v.element) + '</td>' +
      '<td>' + v.date + '</td>' +
      '<td>' + DV.badge(v.status) + ' ' + err + '</td>' +
      DV.analyticsArrow(v) +
    '</tr>';
  }).join('');

  var shown = rows ? rows.split('</tr>').length - 1 : 0;
  var selectedCount = Object.keys(DV.state.selected).filter(function (k) { return DV.videoById(k); }).length;
  var canCompare = selectedCount >= 2;

  var head =
    '<button class="btn btn-primary" onclick="DV.openUploadModal()">' + DV.icon('plus') + 'Загрузить видео</button>' +
    '<button class="icon-btn" onclick="DV.toast(\'Дополнительные действия\',\'info\')">' + DV.icon('dots') + '</button>';

  var body =
    '<div class="tabs">' +
      '<button class="tab active">Выполнения</button>' +
      '<button class="tab" onclick="DV.toast(\'Раздел доступен в полной версии\',\'info\')">Аналитика</button>' +
    '</div>' +
    '<div class="card" style="padding-bottom:14px">' +
      '<div class="card-title">История выполнений</div>' +
      '<div class="table-wrap"><table class="table">' +
        '<thead><tr><th></th><th>Видео</th><th>Выполняемый элемент</th><th>Дата съемки</th><th>Статус</th><th></th></tr></thead>' +
        '<tbody>' + (rows || '<tr><td colspan="6" style="text-align:center;color:#adb5bd">Нет выполнений</td></tr>') + '</tbody>' +
      '</table></div>' +
      '<div class="table-foot">' +
        '<span class="info">Показано ' + shown + ' из ' + total + '</span>' +
        DV.pagination(pg, pages) +
      '</div>' +
      '<div class="compare-cta" style="margin-top:16px">' +
        '<button class="btn btn-primary" ' + (canCompare ? '' : 'disabled') + ' onclick="DV.go(event,\'compare.html\')">' + DV.icon('compare') + 'Сравнить выбранные</button>' +
        '<span class="tip">Выберите 2 выполнения со статусом «Готово»</span>' +
      '</div>' +
    '</div>';

  return DV.layout({
    active: 'athletes',
    breadcrumb: [{ label: 'Мои спортсмены', href: 'athletes.html' }, { label: a.name }],
    lead: DV.avatar('', 'avatar-lg'),
    title: a.name,
    subtitle: a.category + ' | ' + a.age,
    actions: head,
    body: body
  });
};

DV.toggleSel = function (id, cb) {
  if (cb.checked) DV.state.selected[id] = true; else delete DV.state.selected[id];
  DV.saveSel();
  // пересчитываем кнопку без полной перерисовки: просто подскажем
  var n = Object.keys(DV.state.selected).filter(function (k) { return DV.videoById(k); }).length;
  var btn = document.querySelector('.compare-cta .btn');
  if (btn) { btn.disabled = n < 2; }
};

/* Ячейка чекбокса: можно отметить только видео со статусом «Готово» */
DV.checkCell = function (v) {
  if (v.status !== 'ready') {
    return '<td class="cb-block" title="Видео ещё обрабатывается" onclick="DV.blockNotReady()">' +
      '<input type="checkbox" class="cb-disabled" disabled></td>';
  }
  var checked = DV.state.selected[v.id] ? 'checked' : '';
  return '<td><input type="checkbox" ' + checked + ' onchange="DV.toggleSel(\'' + v.id + '\', this)"></td>';
};

/* Стрелка к аналитике: недоступна, пока видео в обработке/ошибке */
DV.analyticsArrow = function (v) {
  if (v.status !== 'ready') {
    return '<td class="row-arrow disabled" title="Аналитика станет доступна после обработки">' + DV.icon('chevRight') + '</td>';
  }
  return '<td><a class="row-arrow" href="analytics.html?v=' + v.id + '">' + DV.icon('chevRight') + '</a></td>';
};

/* Строка в таблицах выбора видео: недоступна, пока видео в обработке/ошибке */
DV.pickRowHTML = function (v, onclick, extra) {
  extra = extra || '';
  var content = DV.thumb(v) + '</td>' +
    '<td>' + v.athleteShort + '</td>' +
    '<td>' + DV.escapeHtml(v.element) + '</td>' +
    '<td>' + v.date + '</td>' +
    '<td>' + DV.badge(v.status) + '</td>';
  if (v.status !== 'ready') {
    return '<tr class="pick-row' + extra + ' pick-disabled" title="Видео ещё обрабатывается"><td>' + content + '</tr>';
  }
  return '<tr class="pick-row' + extra + '" onclick="' + onclick + '"><td>' + content + '</tr>';
};
DV.blockNotReady = function () {
  DV.toast('Подождите, видео ещё обрабатывается', 'info');
};

/* ============================================================
   ВИДЕОЗАПИСИ
   ============================================================ */
DV.pageVideos = function () {
  var per = 6;
  var filtered = DV.filterVideos();
  var total = filtered.length;
  var pages = Math.max(1, Math.ceil(total / per));
  var pg = DV.state.videosPage; if (pg > pages) pg = pages;
  var rows = filtered.slice((pg - 1) * per, pg * per).map(DV.videoRowHTML).join('');

  var selectedCount = Object.keys(DV.state.selected).filter(function (k) { return DV.videoById(k); }).length;
  var canCompare = selectedCount >= 2;

  var vf = DV.state.videosFilter;
  var athleteOpts = DV.athletes.map(function (a) {
    return '<option value="' + a.id + '"' + (a.id === vf.athlete ? ' selected' : '') + '>' + a.name + '</option>';
  }).join('');
  var elementOpts = DV.elements.map(function (el) {
    return '<option' + (el === vf.element ? ' selected' : '') + '>' + el + '</option>';
  }).join('');

  var filtersBar =
    '<div class="filter-bar">' +
      '<div style="position:relative;flex:1"><span style="position:absolute;left:12px;top:9px;color:#adb5bd">' + DV.icon('search', 18) + '</span>' +
      '<input class="input" style="padding-left:38px" placeholder="Поиск по спортсмену, элементу или дате..." value="' + DV.state.videosQuery + '" oninput="DV.searchVideos(this.value)" /></div>' +
      '<select class="select" onchange="DV.setVideoFilter(\'athlete\', this.value)"><option value="">Все спортсмены</option>' + athleteOpts + '</select>' +
      '<select class="select" onchange="DV.setVideoFilter(\'element\', this.value)"><option value="">Все элементы</option>' + elementOpts + '</select>' +
      '<select class="select"><option>Период</option></select>' +
    '</div>';

var tableCard =
    '<div class="card" style="padding-bottom:14px">' +
      '<div class="table-wrap"><table class="table">' +
        '<thead><tr><th></th><th>Видео</th><th>Спортсмен</th><th>Выполняемый элемент</th><th>Дата съемки</th><th>Статус</th><th></th></tr></thead>' +
        '<tbody id="video-tbody">' + rows + '</tbody>' +
      '</table></div>' +
      '<div class="table-foot" id="video-foot">' +
        '<span class="info">Показано ' + Math.min(per, total - (pg - 1) * per) + ' из ' + total + '</span>' +
        DV.pagination(pg, pages) +
      '</div>' +
      '<div class="compare-cta" style="margin-top:16px">' +
        '<button class="btn btn-primary" ' + (canCompare ? '' : 'disabled') + ' onclick="DV.go(event,\'compare.html\')">' + DV.icon('compare') + 'Сравнить выбранные</button>' +
        '<span class="tip">Выберите 2 выполнения со статусом «Готово»</span>' +
      '</div>' +
    '</div>';

  var st = vf.statuses;
  var filterPanel =
    '<div class="filter-panel"><h3>Фильтры</h3>' +
      '<div class="f-group"><label>Спортсмен</label><select class="select" onchange="DV.setVideoFilter(\'athlete\', this.value)"><option value="">Выбрать спортсмена</option>' + athleteOpts + '</select></div>' +
      '<div class="f-group"><label>Спортивный элемент</label><select class="select" onchange="DV.setVideoFilter(\'element\', this.value)"><option value="">Выбрать элемент</option>' + elementOpts + '</select></div>' +
      '<div class="f-group"><label>Статус анализа</label><div class="f-checks">' +
        '<label><input type="checkbox"' + (st.all ? ' checked' : '') + ' onchange="DV.toggleVideosStatus(\'all\', this.checked)"> Все</label>' +
        '<label><input type="checkbox"' + (st.ready ? ' checked' : '') + ' onchange="DV.toggleVideosStatus(\'ready\', this.checked)"> Готово</label>' +
        '<label><input type="checkbox"' + (st.processing ? ' checked' : '') + ' onchange="DV.toggleVideosStatus(\'processing\', this.checked)"> В обработке</label>' +
        '<label><input type="checkbox"' + (st.error ? ' checked' : '') + ' onchange="DV.toggleVideosStatus(\'error\', this.checked)"> Ошибка</label>' +
      '</div></div>' +
      '<div class="f-group"><label>Дата съемки</label>' +
        '<input class="input" value="' + vf.dateFrom + '" placeholder="с дд.мм.гггг" style="margin-bottom:6px" oninput="DV.maskDate(this); DV.setVideoDate(\'from\', this.value)">' +
        '<input class="input" value="' + vf.dateTo + '" placeholder="по дд.мм.гггг" oninput="DV.maskDate(this); DV.setVideoDate(\'to\', this.value)">' +
      '</div>' +
      '<button class="btn btn-soft btn-block" onclick="DV.resetVideoFilters()">Сбросить фильтр</button>' +
    '</div>';

  var body = filtersBar + '<div class="split"><div>' + tableCard + '</div>' + filterPanel + '</div>';

  return DV.layout({
    active: 'videos',
    breadcrumb: [{ label: 'Видеозаписи' }, { label: '' }],
    lead: '<span class="page-lead">' + DV.icon('video', 24) + '</span>',
    title: 'Видеозаписи',
    subtitle: 'Все загруженные видеозаписи и результаты анализа',
    actions: '<select class="select btn-sort"><option>Сортировка: новые сначала</option></select>',
    body: body
  });
};

/* --- Фильтрация и поиск по видеозаписям --- */
DV.filterVideos = function () {
  var q = (DV.state.videosQuery || '').trim().toLowerCase();
  var f = DV.state.videosFilter;
  var st = f.statuses;
  return DV.videos.filter(function (v) {
    if (q) {
      var hay = (v.athleteShort + ' ' + v.element + ' ' + v.date).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    if (f.athlete && v.athlete !== f.athlete) return false;
    if (f.element && v.element !== f.element) return false;
    if (!st.all && !st[v.status]) return false;
    if (f.dateFrom && v.date < f.dateFrom) return false;
    if (f.dateTo && v.date > f.dateTo) return false;
    return true;
  });
};

DV.videoRowHTML = function (v) {
  var checked = DV.state.selected[v.id] ? 'checked' : '';
  return '<tr>' +
    DV.checkCell(v) +
    '<td><div class="cell-video">' + DV.thumb(v) + '</div></td>' +
    '<td>' + v.athleteShort + '</td>' +
    '<td>' + DV.escapeHtml(v.element) + '</td>' +
    '<td>' + v.date + '</td>' +
    '<td>' + DV.badge(v.status) + '</td>' +
    DV.analyticsArrow(v) +
  '</tr>';
};

/* Перерисовка таблицы видеозаписей по текущим фильтрам */
DV.renderVideos = function () {
  DV.state.videosPage = 1;
  var per = 6;
  var filtered = DV.filterVideos();
  var total = filtered.length;
  var pages = Math.max(1, Math.ceil(total / per));
  var rows = filtered.slice(0, per).map(DV.videoRowHTML).join('');
  var tbody = document.getElementById('video-tbody');
  if (tbody) tbody.innerHTML = rows;
  var foot = document.getElementById('video-foot');
  if (foot) foot.innerHTML = '<span class="info">Показано ' + Math.min(per, total) + ' из ' + total + '</span>' + DV.pagination(1, pages);
};

DV.searchVideos = function (q) {
  DV.state.videosQuery = q || '';
  DV.renderVideos();
};

/* --- Обработчики фильтров видеозаписей --- */
DV.setVideoFilter = function (key, value) {
  DV.state.videosFilter[key] = value || '';
  DV.state.videosPage = 1;
  DV.reload();
};
DV.toggleVideosStatus = function (key, checked) {
  var s = DV.state.videosFilter.statuses;
  if (key === 'all') {
    s.all = checked;
    if (checked) { s.ready = false; s.processing = false; s.error = false; }
  } else {
    s[key] = checked;
    if (checked) s.all = false;
    else if (!s.ready && !s.processing && !s.error) s.all = true;
  }
  DV.renderVideos();
};
DV.setVideoDate = function (field, value) {
  DV.state.videosFilter[field === 'from' ? 'dateFrom' : 'dateTo'] = value || '';
  DV.renderVideos();
};
DV.resetVideoFilters = function () {
  DV.state.videosQuery = '';
  DV.state.videosPage = 1;
  DV.state.videosFilter = { athlete: '', element: '', statuses: { all: true, ready: false, processing: false, error: false }, dateFrom: '', dateTo: '' };
  DV.reload();
};

/* ============================================================
   АНАЛИТИКА
   ============================================================ */
DV.pageAnalytics = function (videoId) {
  var video = videoId ? DV.videoById(videoId) : null;

  if (!video) {
    var pickBody =
      '<div class="card">' +
        '<div class="card-title">Анализ видеозаписи</div>' +
        '<div class="attempt-empty">' + DV.icon('video', 42) +
          '<div class="ae-title">Выберите видео для анализа</div>' +
          '<div class="ae-sub">Запись будет проанализирована автоматически</div>' +
          '<button class="btn btn-primary" onclick="DV.pickAnalyticsVideo()">Выбрать видео</button>' +
        '</div>' +
      '</div>';
    return DV.layout({
      active: 'analytics',
      breadcrumb: [{ label: 'Аналитика' }, { label: '' }],
      lead: '<span class="page-lead">' + DV.icon('chart', 24) + '</span>',
      title: 'Аналитика',
      subtitle: 'Показатели, динамика выполнения элементов',
      body: pickBody
    });
  }

  var metrics = DV.metrics.map(function (m) {
    return '<div class="metric"><div class="m-label">' + m.label + '</div>' +
      '<div class="m-value">' + m.value + '<span class="m-unit">' + m.unit + '</span></div></div>';
  }).join('');

  var phases = DV.phases.map(function (p, i) {
    return '<span class="phase"><span class="n">' + (i + 1) + '</span>' + p + '</span>' +
      (i < DV.phases.length - 1 ? '<span class="phase-arrow">' + DV.icon('chevRight', 16) + '</span>' : '');
  }).join('');

  var metricOpts = DV.metrics.map(function (m) {
    return '<option value="' + m.key + '"' + (m.key === DV.state.analyticsMetric ? ' selected' : '') + '>' + m.label + '</option>';
  }).join('');

  var mc = DV.state.analyticsMetric && DV.metricCharts[DV.state.analyticsMetric];
  var chartBlock;
  if (mc) {
    var chart = DV.lineChart({
      labels: DV.chart.labels, yMin: mc.yMin, yMax: mc.yMax,
      series: [{ data: mc.data, color: '#0d6efd' }]
    });
    var mLabel = DV.metrics.find(function (m) { return m.key === DV.state.analyticsMetric; });
    chartBlock = '<div class="chart">' + chart + '</div>' +
      '<div class="chart-legend"><span><span class="legend-dot" style="background:#0d6efd"></span>' + (mLabel ? mLabel.label : DV.state.analyticsMetric) + '</span></div>';
  } else {
    chartBlock = '<div class="chart-empty">' + DV.icon('chart', 40) + '<div>Выберите показатель для отображения динамики</div></div>';
  }

  var body =
    '<div class="tabs">' +
      '<button class="tab active">Динамика</button>' +
      '<button class="tab" onclick="DV.openExportPDF()">Экспорт</button>' +
    '</div>' +
    '<div class="split">' +
      '<div>' +
        '<div class="card"><div class="card-title">Динамика показателей</div>' +
          '<div class="metric-select"><select class="select" onchange="DV.setAnalyticsMetric(this.value)"><option value="">Название показателя</option>' + metricOpts + '</select></div>' +
          chartBlock +
        '</div>' +
      '</div>' +
      '<div>' +
        '<div class="card"><div class="card-title">Видео</div>' + DV.videoPlayer({}) + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="card"><div class="card-title">Ключевые показатели</div><div class="metric-grid">' + metrics + '</div></div>' +
    '<div class="card"><div class="card-title">Ключевые фазы выполнения</div><div class="phases">' + phases + '</div></div>';

  return DV.layout({
    active: 'analytics',
    breadcrumb: [{ label: 'Аналитика' }, { label: '' }],
    lead: '<span class="page-lead">' + DV.icon('chart', 24) + '</span>',
    title: 'Аналитика',
    subtitle: 'Показатели, динамика выполнения элементов',
    body: body
  });
};

/* --- Выбор видео для анализа --- */
DV.pickAnalyticsVideo = function () {
  var rows = DV.videos.map(function (v) {
    return DV.pickRowHTML(v, "DV.chooseAnalyticsVideo('" + v.id + "')");
  }).join('');
  var body = '<div class="table-wrap"><table class="table pick-table">' +
    '<thead><tr><th>Видео</th><th>Спортсмен</th><th>Элемент</th><th>Дата</th><th>Статус</th></tr></thead>' +
    '<tbody>' + rows + '</tbody>' +
  '</table></div>';
  DV.openModal(DV.modalShell('Выберите видео для анализа', body), { wide: true });
};

DV.chooseAnalyticsVideo = function (id) {
  DV.closeModal();
  DV.goTo('analytics.html?v=' + id);
};

/* Выбор показателя для графика динамики */
DV.setAnalyticsMetric = function (key) {
  DV.state.analyticsMetric = key || '';
  DV.reload();
};

/* ============================================================
   СРАВНЕНИЕ
   ============================================================ */
DV.pageCompare = function () {
  var selectedIds = Object.keys(DV.state.selected).filter(function (k) { return DV.videoById(k); });
  if (selectedIds.length >= 2) {
    DV.state.compareAttempts[1] = selectedIds[0];
    DV.state.compareAttempts[2] = selectedIds[1];
    return DV.compareResult();
  }
  if (DV.state.compareAttempts[1] && DV.state.compareAttempts[2]) {
    return DV.compareResult();
  }
  var videoOpts = DV.videos.map(function (v) {
    var dis = v.status !== 'ready' ? ' disabled' : '';
    return '<option value="' + v.id + '"' + dis + '>' + v.athleteShort + ' — ' + v.element + ' — ' + v.date + '</option>';
  }).join('');

  var athleteOpts = DV.athletes.map(function (a) {
    return '<option value="' + a.id + '">' + a.name + '</option>';
  }).join('');

  var form =
    '<div class="card compare-form">' +
      '<div class="card-title">Выбор попыток для сравнения</div>' +
      '<div class="cf-grid">' +
        '<div class="field"><label>Спортсмен</label><select class="select"><option value="">Выбрать спортсмена</option>' + athleteOpts + '</select></div>' +
        '<div class="field"><label>Попытка 1</label><select class="select"><option value="">Выбрать видео</option>' + videoOpts + '</select></div>' +
        '<div class="field"><label>Попытка 2</label><select class="select"><option value="">Выбрать видео</option>' + videoOpts + '</select></div>' +
      '</div>' +
      '<button class="btn btn-primary" onclick="DV.toast(\'Сравнение выполнено\',\'success\')">' + DV.icon('compare') + 'Сравнить</button>' +
    '</div>';

  var placeholder = function (n) {
    var v = DV.state.compareAttempts[n] ? DV.videoById(DV.state.compareAttempts[n]) : null;
    if (v) {
      return '<div class="attempt-card">' +
        '<div class="attempt-head"><span class="t">Попытка ' + n + '</span><span class="d">' + v.date + '</span></div>' +
        '<div class="attempt-selected">' + DV.thumb(v) +
          '<div class="as-info"><div class="as-name">' + v.athleteShort + '</div><div class="as-sub">' + DV.escapeHtml(v.element) + '</div></div>' +
        '</div>' +
        '<button class="btn btn-soft btn-sm" onclick="DV.pickAttempt(' + n + ')">Изменить</button>' +
      '</div>';
    }
    return '<div class="attempt-card">' +
      '<div class="attempt-head"><span class="t">Попытка ' + n + '</span><span class="d">не выбрана</span></div>' +
      '<div class="attempt-empty">' + DV.icon('video', 42) +
        '<div class="ae-title">Выберите видео попытки ' + n + '</div>' +
        '<div class="ae-sub">Запись появится здесь</div>' +
        '<button class="btn btn-primary btn-sm" onclick="DV.pickAttempt(' + n + ')">Выбрать видео</button>' +
      '</div>' +
    '</div>';
  };

  var attempts = '<div class="compare-top">' + placeholder(1) + placeholder(2) + '</div>';

  var body = form + attempts;

  return DV.layout({
    active: 'compare',
    breadcrumb: [{ label: 'Сравнение' }, { label: '' }],
    lead: '<span class="page-lead">' + DV.icon('compare', 24) + '</span>',
    title: 'Сравнение попыток',
    subtitle: 'Показатели различных попыток выполнения одного элемента',
    body: body
  });
};

/* --- Выбор видео попытки --- */
DV.pickAttempt = function (n) {
  var rows = DV.videos.map(function (v) {
    var sel = DV.state.compareAttempts[n] === v.id ? ' row-selected' : '';
    return DV.pickRowHTML(v, "DV.chooseAttempt(" + n + ", '" + v.id + "')", sel);
  }).join('');
  var body = '<div class="table-wrap"><table class="table pick-table">' +
    '<thead><tr><th>Видео</th><th>Спортсмен</th><th>Элемент</th><th>Дата</th><th>Статус</th></tr></thead>' +
    '<tbody>' + rows + '</tbody>' +
  '</table></div>';
  DV.openModal(DV.modalShell('Выберите видео — попытка ' + n, body), { wide: true });
};

DV.chooseAttempt = function (n, id) {
  DV.state.compareAttempts[n] = id;
  DV.closeModal();
  DV.reload();
};

/* --- Полный экран сравнения (после выбора двух попыток) --- */
DV.compareResult = function () {
  var c = DV.comparison;
  var rows = c.rows.map(function (r) {
    return '<tr><td class="val">' + r.a1 + r.unit + '</td><td class="metric">' + r.metric + '</td><td class="val">' + r.a2 + r.unit + '</td></tr>';
  }).join('');

  var chart = DV.lineChart({
    labels: ['1', '5', '10', '15', '20', '25', '30', '35'], yMin: 1.05, yMax: 1.35,
    series: [{ data: DV.chart.attempt1, color: '#0d6efd' }, { data: DV.chart.attempt2, color: '#7048e8' }]
  });

  var v1 = DV.state.compareAttempts[1] ? DV.videoById(DV.state.compareAttempts[1]) : null;
  var v2 = DV.state.compareAttempts[2] ? DV.videoById(DV.state.compareAttempts[2]) : null;

  var attemptCard = function (n, v, date) {
    var body = v
      ? '<div class="attempt-selected">' + DV.thumb(v) + '<div class="as-info"><div class="as-name">' + v.athleteShort + '</div><div class="as-sub">' + DV.escapeHtml(v.element) + '</div></div></div>'
      : DV.videoPlayer({});
    return '<div class="attempt-card">' +
      '<div class="attempt-head"><span class="t">Попытка ' + n + '</span><span class="d">' + (v ? v.date : date) + '</span></div>' +
      body +
    '</div>';
  };

  var attempts = attemptCard(1, v1, c.attempt1.date) + attemptCard(2, v2, c.attempt2.date) + '<div class="score-col">' +
      '<div class="attempt-card score-card">' +
        '<div class="attempt-head"><span class="t">Общая оценка</span></div>' +
        '<div class="score-box">' +
          '<span class="s-val up-down">' + DV.icon('arrowUp') + '+' + c.overall.value + '%</span>' +
          '<span class="s-sub">по сравнению с предыдущей попыткой</span>' +
        '</div>' +
      '</div>' +
      '<div class="compare-export">' +
        '<button class="btn btn-soft" onclick="DV.openExportCSV()">' + DV.icon('upload') + 'Экспорт CSV</button>' +
        '<button class="btn btn-primary" onclick="DV.openExportPDF()">' + DV.icon('upload') + 'Экспорт PDF</button>' +
      '</div>' +
    '</div>';

  var body =
    '<div class="filter-bar">' +
      '<select class="select"><option>Спортсмен</option></select>' +
      '<input class="input" style="width:140px" value="12.09.2026">' +
      '<input class="input" style="width:140px" value="18.09.2026">' +
      '<button class="btn btn-primary" onclick="DV.toast(\'Сравнение выполнено\',\'success\')">Сравнить</button>' +
    '</div>' +
    '<div class="compare-grid">' + attempts + '</div>' +
    '<div class="compare-bottom">' +
      '<div class="card"><div class="card-title">Динамика показателей</div>' +
        '<div class="metric-select"><select class="select"><option>Название показателя</option></select></div>' +
        '<div class="chart">' + chart + '</div>' +
        '<div class="chart-legend">' +
          '<span><span class="legend-dot" style="background:#0d6efd"></span>Попытка 1</span>' +
          '<span><span class="legend-dot" style="background:#7048e8"></span>Попытка 2</span>' +
        '</div>' +
      '</div>' +
      '<div class="card"><div class="card-title">Ключевые показатели</div>' +
        '<div class="table-wrap"><table class="compare-table">' +
          '<thead><tr><th>Попытка 1</th><th></th><th>Попытка 2</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table></div>' +
      '</div>' +
    '</div>';

  return DV.layout({
    active: 'compare',
    breadcrumb: [{ label: 'Сравнение' }, { label: '' }],
    lead: '<span class="page-lead">' + DV.icon('compare', 24) + '</span>',
    title: 'Сравнение попыток',
    subtitle: 'Показатели различных попыток выполнения одного элемента',
    body: body
  });
};

/* ============================================================
   МОДАЛКИ
   ============================================================ */
/* --- Профиль тренера --- */
DV.openProfileModal = function () {
  var u = DV.currentUser;
  var body =
    '<div class="profile-modal">' +
      '<div class="pm-head">' +
        '<div class="avatar-lg">' + DV.icon('user') + '</div>' +
        '<div>' +
          '<div class="pm-name">' + DV.escapeHtml(u.name) + '</div>' +
          '<div class="pm-spec">' + DV.escapeHtml(u.spec) + '</div>' +
          '<span class="badge ready">' + DV.icon('check', 14) + DV.escapeHtml(u.role) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="pm-info">' +
        '<div><span>Email</span>' + DV.escapeHtml(u.email) + '</div>' +
        '<div><span>Телефон</span>' + DV.escapeHtml(u.phone) + '</div>' +
        '<div><span>Стаж</span>' + DV.escapeHtml(u.experience) + '</div>' +
      '</div>' +
      '<div class="pm-fields">' +
        '<div><span>Специализация</span>' + DV.escapeHtml(u.specialization) + '</div>' +
        '<div><span>Категория</span>' + DV.escapeHtml(u.category) + '</div>' +
        '<div><span>Группы</span>' + DV.escapeHtml(u.groups) + '</div>' +
      '</div>' +
      '<div class="pm-about">' +
        '<div class="pm-lbl">О себе</div>' +
        '<p>' + DV.escapeHtml(u.about) + '</p>' +
      '</div>' +
    '</div>';
  var foot = '<button class="btn btn-primary" onclick="DV.closeModal()">Редактировать профиль</button>';
  DV.openModal(DV.modalShell('Профиль', body, foot), {});
};

/* --- Выбор видеофайла (системный диалог) --- */
DV.openFilePicker = function () {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.mov,.mp4,video/*';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.onchange = function () {
    var f = input.files && input.files[0];
    if (f) DV.toast('Выбран файл: ' + f.name, 'success');
    input.remove();
  };
  input.click();
};

/* --- Заглушка выбора файла в форме загрузки --- */
DV.pickFile = function () {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.mov,.mp4,video/*';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.onchange = function () {
    var f = input.files && input.files[0];
    input.remove();
    if (!f) return;
    var st = document.getElementById('file-status');
    if (st) st.innerHTML = '<span class="spinner"></span> Загрузка видео...';
    setTimeout(function () {
      if (st) st.innerHTML = '<span class="fs-ok">' + DV.icon('check', 14) + '</span> Файл выбран: ' + f.name;
      DV.toast('Видео загружено', 'success');
    }, 2000);
  };
  input.click();
};

/* --- Загрузка видео --- */
DV.openUploadModal = function (opts) {
  opts = opts || {};
  var body =
    '<div class="dropzone' + (opts.error ? ' error' : '') + '">' +
      '<div class="dz-ic">' + DV.icon('cloudUp') + '</div>' +
      '<div class="dz-title">Перетащите видео сюда<br>или выберите файл</div>' +
      '<div class="dz-sub" style="margin:10px 0 12px"><button class="btn btn-primary" onclick="DV.pickFile()">Выбрать файл</button></div>' +
      '<div class="file-status" id="file-status"></div>' +
      (opts.error ? '<div class="dz-err">Некорректный формат или параметры видеозаписи</div>' : '') +
      '<div class="file-meta">Форматы: MOV, MP4 · Максимальный размер: 500 МБ</div>' +
    '</div>' +
    '<div style="font-weight:700;font-size:16px;margin:18px 0 14px">Данные о выполнении</div>' +
    '<div class="field" style="margin-bottom:12px"><label>Спортсмен</label>' +
      '<select class="select" id="up-student" onchange="DV.validateUpload(this)"><option value="">Выбрать спортсмена</option>' +
        DV.athletes.map(function (a) { return '<option value="' + a.id + '">' + a.name + '</option>'; }).join('') +
      '</select></div>' +
    '<div class="field" style="margin-bottom:12px"><label>Спортивный элемент</label>' +
      '<select class="select" id="up-element" onchange="DV.validateUpload(this)"><option value="">Выберите элемент</option>' +
        DV.elements.map(function (el) { return '<option>' + el + '</option>'; }).join('') + '</select></div>' +
    '<div class="field" style="margin-bottom:12px"><label>Дата выполнения</label>' +
      '<input class="input" id="up-date" placeholder="дд.мм.гггг" oninput="DV.maskDate(this); DV.validateUpload(this)"></div>' +
    '<div class="field"><label>Комментарий</label>' +
      '<textarea class="textarea" maxlength="600" oninput="document.getElementById(\'dv_char\').textContent=this.value.length+\'/600\'"></textarea>' +
      '<span class="char-count" id="dv_char">0/600</span></div>';

  var foot = '<button class="btn-link" onclick="DV.closeModal()">Отмена</button>' +
    '<button class="btn btn-primary" id="up-submit" onclick="DV.submitUpload()">Загрузить</button>';

  DV.openModal(DV.modalShell('Загрузить видео', body, foot), { wide: false });
};

/* --- Валидация формы загрузки видео --- */
DV.validStudent = null;
DV.validateUpload = function (el) {
  // При заполнении поля убираем красную подсветку
  if (el && (el.value || '').trim()) el.classList.remove('invalid');

  var req = ['up-student', 'up-element', 'up-date'];
  var allFilled = true;
  var force = !el; // вызов без поля — при попытке отправить: подсветить пустые
  req.forEach(function (id) {
    var field = document.getElementById(id);
    if (!field) return;
    if (!(field.value || '').trim()) {
      allFilled = false;
      if (force) field.classList.add('invalid');
    }
  });

  var st = document.getElementById('up-student');
  DV.validStudent = (st && st.value && DV.athleteById(st.value)) || null;

  return allFilled;
};

DV.submitUpload = function () {
  if (!DV.validateUpload()) return;
  var elSel = document.getElementById('up-element');
  var element = elSel && elSel.value ? elSel.value : DV.elements[0];
  var dateIn = document.getElementById('up-date');
  var date = dateIn && dateIn.value ? dateIn.value : '01.10.2026';
  DV.state.uploadProgress = 0;
  DV.state.uploading = {
    name: 'video_' + date.replace(/\./g, '_'),
    athleteName: DV.validStudent.name,
    video: {
      athlete: DV.validStudent.id,
      athleteShort: DV.validStudent.name,
      element: element,
      date: date,
      status: 'processing',
      score: null,
      thumb: 'dark',
      dur: '0:24'
    }
  };
  DV.closeModal();
  DV.toast('Видео загружается…', 'info');
  DV.reload();
};

/* --- Быстрая загрузка на главной --- */
DV.checkQuick = function () {
  var st = document.getElementById('q-student');
  var el = document.getElementById('q-element');
  var btn = document.getElementById('q-submit');
  if (btn) btn.disabled = !(st && st.value && el && el.value && DV.state.quickVideo);
};

DV.pickQuickVideo = function () {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.mov,.mp4,video/*';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.onchange = function () {
    var f = input.files && input.files[0];
    input.remove();
    if (!f) return;
    DV.state.quickVideo = true;
    DV.toast('Видео выбрано: ' + f.name, 'success');
    DV.checkQuick();
  };
  input.click();
};

DV.quickUpload = function () {
  var st = document.getElementById('q-student');
  var el = document.getElementById('q-element');
  if (!st || !st.value || !el || !el.value) return;
  var student = DV.athleteById(st.value);
  var d = new Date();
  var dd = ('0' + d.getDate()).slice(-2);
  var mm = ('0' + (d.getMonth() + 1)).slice(-2);
  var yyyy = d.getFullYear();
  var dateStr = dd + '.' + mm + '.' + yyyy;
  DV.state.uploadProgress = 0;
  DV.state.uploading = {
    name: 'video_' + dd + '_' + mm + '_' + yyyy,
    athleteName: student.name,
    video: {
      athlete: student.id, athleteShort: student.name, element: el.value,
      date: dateStr, status: 'processing', score: null, thumb: 'dark', dur: '0:24'
    }
  };
  DV.toast('Видео загружается…', 'info');
  DV.reload();
};

/* --- Редактирование записи: выбрать новое видео --- */
DV.openReplaceVideo = function () {
  var rows = DV.videos.map(function (v) {
    return DV.pickRowHTML(v, "DV.replaceVideo('" + v.id + "')");
  }).join('');
  var body = '<div class="table-wrap"><table class="table pick-table">' +
    '<thead><tr><th>Видео</th><th>Спортсмен</th><th>Элемент</th><th>Дата</th><th>Статус</th></tr></thead>' +
    '<tbody>' + rows + '</tbody>' +
  '</table></div>';
  DV.openModal(DV.modalShell('Выберите новую запись', body), { wide: true });
};

DV.replaceVideo = function (id) {
  DV.closeModal();
  DV.toast('Запись обновлена: выбрано другое видео', 'success');
};

/* --- Добавление спортсмена --- */
DV.openAddAthlete = function () {
  var body =
    '<div class="field" style="margin-bottom:12px"><label>Спортсмен</label>' +
      '<input class="input" id="add-name" placeholder="Введите ФИО" oninput="DV.checkAddAthlete()"></div>' +
    '<div class="field" style="margin-bottom:12px"><label>Дата рождения</label>' +
      '<input class="input" id="add-birth" placeholder="дд.мм.гггг" oninput="DV.maskDate(this); DV.checkAddAthlete()"></div>' +
    '<div class="field" style="margin-bottom:16px"><label>Спортивная группа</label>' +
      '<input class="input" id="add-group" placeholder="Название группы" oninput="DV.checkAddAthlete()"></div>' +
    '<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px">' +
      '<label class="checkbox-row"><input type="checkbox" id="add-consent" onchange="DV.checkAddAthlete()">' +
        '<span>Подтверждаю, что спортсмен достиг 18 лет и дал согласие на видеосъёмку, обработку видеозаписей и их передачу третьим лицам (в том числе для хранения и анализа)</span>' +
      '</label>' +
      '<div style="margin:10px 0 0 28px"><a href="#" onclick="event.preventDefault()">Пользовательское соглашение и политика обработки данных</a></div>' +
      '<div style="margin:8px 0 0 28px;font-size:12.5px;color:var(--gray-500)">Видеозаписи содержат биометрические данные. Вы несёте ответственность за наличие согласия спортсмена.</div>' +
    '</div>';

  var foot = '<button class="btn-link" onclick="DV.closeModal()">Отмена</button>' +
    '<button class="btn" id="add-submit" disabled onclick="DV.addAthlete()">Добавить спортсмена</button>';

  DV.openModal(DV.modalShell('Добавить спортсмена', body, foot), { wide: false });
};

/* --- Активация кнопки добавления: поля заполнены + отмечен чекбокс --- */
DV.checkAddAthlete = function () {
  var n = document.getElementById('add-name');
  var b = document.getElementById('add-birth');
  var g = document.getElementById('add-group');
  var c = document.getElementById('add-consent');
  var ok = !!(n && n.value.trim() && b && b.value.trim() && g && g.value.trim() && c && c.checked);
  var btn = document.getElementById('add-submit');
  if (btn) btn.disabled = !ok;
  return ok;
};

/* --- Добавление спортсмена в список --- */
DV.addAthlete = function () {
  if (!DV.checkAddAthlete()) return;
  var name = document.getElementById('add-name').value.trim();
  var birth = document.getElementById('add-birth').value.trim();
  var group = document.getElementById('add-group').value.trim();

  var birthYear = parseInt(birth.split('.')[2], 10);
  var ageYears = isNaN(birthYear) ? 18 : Math.max(18, new Date().getFullYear() - birthYear);
  var words = name.split(/\s+/).filter(Boolean);
  var initials = (words[0] ? words[0][0] : '') + (words[1] ? words[1][0] : '');

  var ageLabel = ageYears + ' лет';
  if (ageYears % 10 === 1 && ageYears % 100 !== 11) ageLabel = ageYears + ' год';
  else if (ageYears % 10 >= 2 && ageYears % 10 <= 4 && (ageYears % 100 < 12 || ageYears % 100 > 14)) ageLabel = ageYears + ' года';

  DV.athletes.push({
    id: 'a' + (DV.athletes.length + 1), name: name, initials: initials,
    category: 'Взрослая категория', group: group,
    age: ageLabel, ageYears: ageYears, performances: 0, analyses: 0, last: null
  });
  DV.saveAthletes();
  DV.closeModal();
  DV.toast('Спортсмен добавлен', 'success');
  DV.reload();
};

/* --- Ошибка --- */
DV.openError = function (title, msg, retry) {
  var body = '<div class="err-box"><div class="e-ic">' + DV.icon('alert', 34) + '</div>' +
    '<h2>' + DV.escapeHtml(title) + '</h2><p>' + DV.escapeHtml(msg) + '</p></div>';
  var foot = '<button class="btn-link" onclick="DV.closeModal()">Отмена</button>' +
    '<button class="btn-link" onclick="DV.closeModal();' + (retry || '') + '">Попробовать снова</button>';
  DV.openModal(DV.modalShell('', body, foot), { error: true });
};

/* --- Экспорт PDF --- */
DV.openExportPDF = function () {
  var body =
    '<div class="export-hero">' +
      '<div class="file-ic">' + DV.icon('pdf') + '<span class="fi-label">.PDF</span></div>' +
      '<p>Скачайте сводный отчет по выбранной попытке в формате PDF. В отчет войдут ключевые метрики и графики.</p>' +
      '<p class="e-note">Файл будет сформирован автоматически после нажатия на кнопку</p>' +
      '<div style="text-align:left"><div style="font-weight:700;margin:16px 0 10px">Что будет в отчете?</div>' +
        '<div class="check-list">' +
          '<label><input type="checkbox" checked> Фотографии с разметкой фаз прыжка</label>' +
          '<label><input type="checkbox" checked> Основные метрики выполнения</label>' +
          '<label><input type="checkbox" checked> Графики показателей</label>' +
          '<label><input type="checkbox" checked> Сводная информация по попытке</label>' +
        '</div>' +
      '</div>' +
    '</div>';
  var foot = '<button class="btn-link" onclick="DV.closeModal()">Отмена</button>' +
    '<button class="btn btn-primary" onclick="DV.closeModal();DV.toast(\'PDF-отчет сформирован\',\'success\')">Экспорт PDF</button>';
  DV.openModal(DV.modalShell('Экспорт результатов анализа в PDF', body, foot), {});
};

/* --- Экспорт CSV --- */
DV.openExportCSV = function () {
  var body =
    '<div class="export-hero">' +
      '<div class="file-ic csv">CSV</div>' +
      '<p>Скачайте сводный отчет по выбранной попытке в формате CSV.<br>Файл содержит все метрики и показатели для дальнейшего анализа.</p>' +
      '<p class="e-note">Файл будет сформирован автоматически после нажатия на кнопку</p>' +
      '<div style="text-align:left"><div style="font-weight:700;margin:16px 0 10px">Что будет в отчете?</div>' +
        '<div class="check-list">' +
          '<label><input type="checkbox" checked> Все числовые метрики</label>' +
          '<label><input type="checkbox" checked> Показатели по фазам прыжка</label>' +
          '<label><input type="checkbox" checked> Данные по графикам</label>' +
          '<label><input type="checkbox" checked> Информация о попытке и спортсмене</label>' +
        '</div>' +
      '</div>' +
    '</div>';
  var foot = '<button class="btn-link" onclick="DV.closeModal()">Отмена</button>' +
    '<button class="btn btn-primary" onclick="DV.closeModal();DV.toast(\'CSV-файл сформирован\',\'success\')">Экспорт CSV</button>';
  DV.openModal(DV.modalShell('Экспорт результатов анализа в CSV', body, foot), {});
};

/* ============================================================
   ИНИЦИАЛИЗАЦИЯ: определяем страницу по имени файла
   ============================================================ */
window.addEventListener('DOMContentLoaded', function () {
  var name = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (name === 'login.html') DV.renderAuth('login');
  else if (name === 'register.html') DV.renderAuth('register');
  else if (name === 'athletes.html') DV.init('athletes');
  else if (name === 'athlete.html') DV.init('athlete');
  else if (name === 'videos.html') DV.init('videos');
  else if (name === 'analytics.html') DV.init('analytics');
  else if (name === 'compare.html') DV.init('compare');
  else DV.init('home');
});