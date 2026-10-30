/* ============================================================
   DiveVision — данные (демо-набор по макетам Figma)
   ============================================================ */
window.DV = window.DV || {};

DV.currentUser = {
  name: 'Александр Смирнов',
  role: 'Тренер',
  spec: 'Тренер по прыжкам в воду',
  email: 'smirnov@mail.ru',
  phone: '+7 (912) 191 83 63',
  experience: '7 лет',
  specialization: 'Прыжки в воду',
  category: 'Взрослая',
  groups: 'Подготовительная, Основная',
  about: 'Опытный тренер с многолетней практикой подготовки спортсменов по прыжкам в воду. Работаю со взрослыми разных групп, помогаю развивать технику и достигать высоких результатов.'
};

/* Зарегистрированные пользователи (демо) */
DV.users = [
  { name: 'Александр Смирнов', email: 'smirnov@mail.ru', pass: '12345678' }
];

DV.elements = [
  'Прыжок с 3м (винтом)',
  'Прыжок с 3м (прямой)',
  'Прыжок с 5м (винтом)',
  'Прыжок с 5м (прямой)'
];

DV.statuses = [
  { key: 'ready', label: 'Готово', badge: 'ready' },
  { key: 'processing', label: 'В обработке', badge: 'processing' },
  { key: 'error', label: 'Ошибка', badge: 'error' }
];

DV.athletes = [
  { id: 'a1', name: 'Иван Иванов', initials: 'ИИ', category: 'Взрослая категория', group: 'Основная', age: '21 год', ageYears: 21, performances: 12, analyses: 8, last: { date: '01.10.2026', score: '3.5C', status: 'ready' } },
  { id: 'a2', name: 'Анна Петрова', initials: 'АП', category: 'Взрослая категория', group: 'Подготовительная', age: '21 год', ageYears: 21, performances: 10, analyses: 5, last: { date: '01.10.2026', score: '3.5C', status: 'processing' } },
  { id: 'a3', name: 'Сергей Попов', initials: 'СП', category: 'Взрослая категория', group: 'Основная', age: '25 лет', ageYears: 25, performances: 20, analyses: 15, last: { date: '01.10.2026', score: '3.8C', status: 'error' } },
  { id: 'a4', name: 'Ирина Михайлова', initials: 'ИМ', category: 'Взрослая категория', group: 'Подготовительная', age: '25 лет', ageYears: 25, performances: 12, analyses: 8, last: { date: '01.10.2026', score: '3.6C', status: 'ready' } },
  { id: 'a5', name: 'Иван Смирнов', initials: 'ИС', category: 'Взрослая категория', group: 'Основная', age: '21 год', ageYears: 21, performances: 12, analyses: 8, last: { date: '01.10.2026', score: '3.4C', status: 'ready' } },
  { id: 'a6', name: 'Ольга Андреева', initials: 'ОА', category: 'Взрослая категория', group: 'Подготовительная', age: '19 лет', ageYears: 19, performances: 12, analyses: 8, last: { date: '01.10.2026', score: '3.7C', status: 'processing' } }
];

DV.athleteById = function (id) { return DV.athletes.find(function (a) { return a.id === id; }); };

/* Видеозаписи / выполнения */
DV.videos = [
  { id: 'v1',  athlete: 'a1', athleteShort: 'Иванов И.В.',  element: DV.elements[0], date: '01.10.2026', status: 'ready',      score: '3.5C', thumb: 'dark', dur: '0:24', selected: true  },
  { id: 'v2',  athlete: 'a2', athleteShort: 'Петрова А.Д.',  element: DV.elements[1], date: '01.10.2026', status: 'processing', score: '3.5C', thumb: 'mid',  dur: '0:24', selected: false },
  { id: 'v3',  athlete: 'a3', athleteShort: 'Попов С.А.',    element: DV.elements[2], date: '01.10.2026', status: 'ready',      score: '3.8C', thumb: 'dark', dur: '0:24', selected: false },
  { id: 'v4',  athlete: 'a4', athleteShort: 'Михайлова И.С.', element: DV.elements[3], date: '01.10.2026', status: 'ready',      score: '3.6C', thumb: 'mid',  dur: '0:24', selected: false },
  { id: 'v5',  athlete: 'a5', athleteShort: 'Смирнов И.О.',  element: DV.elements[0], date: '01.10.2026', status: 'ready',      score: '3.4C', thumb: 'dark', dur: '0:24', selected: false },
  { id: 'v6',  athlete: 'a6', athleteShort: 'Андреева О.В.', element: DV.elements[1], date: '01.10.2026', status: 'processing', score: '3.7C', thumb: 'mid',  dur: '0:24', selected: false },
  { id: 'v7',  athlete: 'a1', athleteShort: 'Иванов И.В.',  element: DV.elements[2], date: '01.10.2026', status: 'ready',      score: '3.5C', thumb: 'dark', dur: '0:24', selected: false },
  { id: 'v8',  athlete: 'a3', athleteShort: 'Попов С.А.',    element: DV.elements[3], date: '01.10.2026', status: 'error',      score: null,   thumb: 'mid',  dur: '0:24', selected: false },
  { id: 'v9',  athlete: 'a1', athleteShort: 'Иванов И.В.',  element: DV.elements[1], date: '01.10.2026', status: 'ready',      score: '3.5C', thumb: 'mid',  dur: '0:24', selected: false },
  { id: 'v10', athlete: 'a2', athleteShort: 'Петрова А.Д.',  element: DV.elements[2], date: '01.10.2026', status: 'ready',      score: '3.5C', thumb: 'dark', dur: '0:24', selected: false },
  { id: 'v11', athlete: 'a4', athleteShort: 'Михайлова И.С.', element: DV.elements[0], date: '28.09.2026', status: 'ready',      score: '3.6C', thumb: 'dark', dur: '0:24', selected: false },
  { id: 'v12', athlete: 'a5', athleteShort: 'Смирнов И.О.',  element: DV.elements[1], date: '28.09.2026', status: 'processing', score: '3.4C', thumb: 'mid',  dur: '0:24', selected: false },
  { id: 'v13', athlete: 'a6', athleteShort: 'Андреева О.В.', element: DV.elements[2], date: '28.09.2026', status: 'ready',      score: '3.7C', thumb: 'dark', dur: '0:24', selected: false },
  { id: 'v14', athlete: 'a1', athleteShort: 'Иванов И.В.',  element: DV.elements[3], date: '28.09.2026', status: 'ready',      score: '3.5C', thumb: 'mid',  dur: '0:24', selected: false },
  { id: 'v15', athlete: 'a3', athleteShort: 'Попов С.А.',    element: DV.elements[0], date: '28.09.2026', status: 'error',      score: null,   thumb: 'dark', dur: '0:24', selected: false },
  { id: 'v16', athlete: 'a2', athleteShort: 'Петрова А.Д.',  element: DV.elements[3], date: '28.09.2026', status: 'ready',      score: '3.5C', thumb: 'mid',  dur: '0:24', selected: false },
  { id: 'v17', athlete: 'a4', athleteShort: 'Михайлова И.С.', element: DV.elements[1], date: '22.09.2026', status: 'ready',      score: '3.6C', thumb: 'dark', dur: '0:24', selected: false },
  { id: 'v18', athlete: 'a5', athleteShort: 'Смирнов И.О.',  element: DV.elements[2], date: '22.09.2026', status: 'ready',      score: '3.4C', thumb: 'dark', dur: '0:24', selected: false },
  { id: 'v19', athlete: 'a6', athleteShort: 'Андреева О.В.', element: DV.elements[3], date: '22.09.2026', status: 'processing', score: '3.7C', thumb: 'mid',  dur: '0:24', selected: false },
  { id: 'v20', athlete: 'a1', athleteShort: 'Иванов И.В.',  element: DV.elements[0], date: '22.09.2026', status: 'ready',      score: '3.5C', thumb: 'dark', dur: '0:24', selected: false },
  { id: 'v21', athlete: 'a3', athleteShort: 'Попов С.А.',    element: DV.elements[2], date: '22.09.2026', status: 'ready',      score: '3.8C', thumb: 'mid',  dur: '0:24', selected: false },
  { id: 'v22', athlete: 'a2', athleteShort: 'Петрова А.Д.',  element: DV.elements[0], date: '22.09.2026', status: 'ready',      score: '3.5C', thumb: 'dark', dur: '0:24', selected: false },
  { id: 'v23', athlete: 'a4', athleteShort: 'Михайлова И.С.', element: DV.elements[2], date: '15.09.2026', status: 'ready',      score: '3.6C', thumb: 'dark', dur: '0:24', selected: false },
  { id: 'v24', athlete: 'a5', athleteShort: 'Смирнов И.О.',  element: DV.elements[0], date: '15.09.2026', status: 'processing', score: '3.4C', thumb: 'mid',  dur: '0:24', selected: false },
  { id: 'v25', athlete: 'a6', athleteShort: 'Андреева О.В.', element: DV.elements[1], date: '15.09.2026', status: 'ready',      score: '3.7C', thumb: 'dark', dur: '0:24', selected: false }
];

DV.videoById = function (id) { return DV.videos.find(function (v) { return v.id === id; }); };
DV.statusOf = function (key) { return DV.statuses.find(function (s) { return s.key === key; }); };

/* Аналитика: ключевые показатели и фазы */
DV.metrics = [
  { key: 'flightTime', label: 'Время полёта', value: '1.27', unit: 'с' },
  { key: 'entryAngle', label: 'Угол входа', value: '86.4', unit: '°' },
  { key: 'rotSpeed', label: 'Скорость вращения', value: '412', unit: '°/с' },
  { key: 'jumpHeight', label: 'Высота прыжка', value: '0.84', unit: 'м' }
];
DV.phases = ['Подход', 'Отталкивание', 'Полёт', 'Раскрытие', 'Вход в воду'];

/* Данные графика "Динамика показателей" */
DV.chart = {
  labels: ['3.09', '10.09', '15.09', '22.09', '28.09', '1.10', '6.10'],
  yMin: 1.0, yMax: 1.35,
  attempt1: [1.12, 1.18, 1.22, 1.35, 1.28, 1.15, 1.05],
  attempt2: [1.08, 1.14, 1.16, 1.2, 1.24, 1.3, 1.32]
};

/* Данные графиков динамики по каждому показателю (одна линия) */
DV.metricCharts = {
  flightTime: { yMin: 1.0, yMax: 1.35, data: [1.12, 1.18, 1.22, 1.35, 1.28, 1.15, 1.05] },
  entryAngle: { yMin: 80, yMax: 90, data: [85.2, 85.8, 86.4, 87.1, 86.8, 86.2, 86.4] },
  rotSpeed: { yMin: 380, yMax: 460, data: [405, 412, 418, 425, 438, 445, 412] },
  jumpHeight: { yMin: 0.6, yMax: 1.0, data: [0.78, 0.82, 0.8, 0.87, 0.84, 0.79, 0.84] }
};

/* Сравнение двух попыток */
DV.comparison = {
  attempt1: { label: 'Попытка 1', date: '12.09.2026 16:47' },
  attempt2: { label: 'Попытка 2', date: '18.09.2026 18:15' },
  overall: { value: 6, delta: 1 }, // +6%
  rows: [
    { metric: 'Угол входа', a1: '175', a2: '180', unit: '°' },
    { metric: 'Угол тела', a1: '172', a2: '178', unit: '°' },
    { metric: 'Скорость вращения', a1: '2,1', a2: '2,4', unit: 'м/с' },
    { metric: 'Скорость входа', a1: '2,8', a2: '3,1', unit: 'м/с' },
    { metric: 'Время полета', a1: '1,2', a2: '1,3', unit: 'с' }
  ]
};

/* Требует внимания (главная) */
DV.alerts = [
  { type: 'warn', title: 'Не удалось проанализировать видео', sub: 'Прыжок с 5м (прямой) · Сергей Попов · 01.10.2026', action: 'Повторить' },
  { type: 'info', title: 'Низкое качество видео', sub: 'Прыжок с 3м (прямой) · Анна Петрова · 01.10.2026', action: 'Выбрать другой файл' }
];

/* Сводка на главной */
DV.summary = [
  { key: 'athletes', label: 'Спортсмены', value: 12, icon: 'users', ic: 'blue', link: 'athletes.html' },
  { key: 'videos', label: 'Видеозаписи', value: 148, icon: 'video', ic: 'cyan', link: 'videos.html' },
  { key: 'processing', label: 'В обработке', value: 2, icon: 'spinner', ic: 'green', link: 'videos.html' },
  { key: 'error', label: 'Ошибка анализа', value: 1, icon: 'alert', ic: 'red', alert: true, link: 'videos.html' }
];