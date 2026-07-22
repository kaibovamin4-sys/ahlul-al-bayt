// ── FULL CALENDAR ──
(function() {

  // All events by month (1-indexed) and day
  const EVENTS = {
    1: [ // Январь
      { d:3,  name:'Рождение Имама Али (а)',                        type:'birth' },
      { d:5,  name:'Смерть Хазрата Зейнаб (с.а.)',                  type:'death' },
      { d:15, name:'Мученическая смерть Имама Мусы Казима (а)',     type:'death' },
      { d:17, name:'Мабас — начало пророческой миссии Пророка',     type:'feast' },
      { d:23, name:'Рождение Имама Хусейна (а)',                    type:'birth' },
      { d:24, name:'Рождение Хазрата Аббаса (а)',                   type:'birth' },
      { d:25, name:'Рождение Имама Саджада (а)',                    type:'birth' },
      { d:31, name:'Рождение Али Акбара (а)',                       type:'birth' },
    ],
    2: [ // Февраль
      { d:4,  name:'Рождение Имама Махди (а)',                      type:'birth' },
      { d:19, name:'Начало Рамадана (по наблюдению луны)',          type:'feast' },
      { d:28, name:'Смерть Хазрата Хадиджи (с.а.)',                type:'death' },
    ],
    3: [ // Март
      { d:5,  name:'Рождение Имама Хасана (а)',                     type:'birth' },
      { d:8,  name:'Первая Ночь Кадр',                              type:'feast' },
      { d:10, name:'Вторая Ночь Кадр',                              type:'feast' },
      { d:11, name:'Мученическая смерть Имама Али (а)',             type:'death' },
      { d:12, name:'Третья Ночь Кадр',                              type:'feast' },
      { d:21, name:'Ид аль-Фитр — Ураза-байрам',                   type:'feast' },
    ],
    4: [ // Апрель
      { d:14, name:'Мученическая смерть Имама Джафара Садыка (а)', type:'death' },
      { d:19, name:'Рождение Хазрата Масумы (с.а.)',               type:'birth' },
      { d:29, name:'Рождение Имама Казима (а)',                     type:'birth' },
    ],
    5: [ // Май
      { d:17, name:'Мученическая смерть Имама Мухаммада Таки (а)', type:'death' },
      { d:19, name:'Годовщина мученичества Хазрата Фатимы Захры (с.а.)', type:'death' },
      { d:24, name:'Мученическая смерть Имама Мухаммада Бакира (а)', type:'death' },
      { d:26, name:'День Арафа',                                    type:'feast' },
      { d:27, name:'Курбан-байрам — Ид аль-Адха',                  type:'feast' },
    ],
    6: [ // Июнь
      { d:1,  name:'Рождение Имама Али ан-Наки (а)',               type:'birth' },
      { d:4,  name:'Гадир Хум',                                     type:'feast' },
      { d:6,  name:'Рождение Имама Мусы Казима (а)',               type:'birth' },
      { d:16, name:'Первый день месяца Мухаррам',                   type:'other' },
      { d:24, name:'Тасуа',                                         type:'other' },
      { d:25, name:'Ашура — день скорби',                          type:'death' },
      { d:27, name:'Мученическая смерть Имама Саджада (а)',         type:'death' },
    ],
    7: [ // Июль
      { d:10, name:'Мученическая смерть Имама Зейн аль-Абидина (а)', type:'death' },
      { d:22, name:'Мученическая смерть Имама Хасана (а)',          type:'death' },
    ],
    8: [ // Август
      { d:4,  name:'Арбаин Имама Хусейна (а)',                     type:'other' },
      { d:12, name:'Смерть Пророка Мухаммада (с) и Имама Хасана (а)', type:'death' },
      { d:13, name:'Мученическая смерть Имама Резы (а)',           type:'death' },
      { d:21, name:'Мученическая смерть Имама Хасана Аскари (а)', type:'death' },
      { d:25, name:'Начало Недели единства — Мавлид',              type:'feast' },
      { d:30, name:'Рождение Пророка Мухаммада (с) и Имама Джафара Садыка (а)', type:'birth' },
    ],
    9: [ // Сентябрь
      { d:20, name:'Рождение Имама Хасана Аскари (а)',             type:'birth' },
      { d:22, name:'Смерть Хазрата Масумы (с.а.)',                 type:'death' },
    ],
    10: [ // Октябрь
      { d:16, name:'Рождение Хазрата Зейнаб (с.а.)',              type:'birth' },
      { d:24, name:'Мученическая смерть Хазрата Фатимы Захры (с.а.)', type:'death' },
    ],
    11: [ // Ноябрь
      { d:13, name:'Мученическая смерть Хазрата Фатимы Захры (с.а.)', type:'death' },
      { d:30, name:'Рождение Хазрата Фатимы Захры (с.а.)',        type:'birth' },
    ],
    12: [ // Декабрь
      { d:11, name:'Рождение Имама Мухаммада Бакира (а)',          type:'birth' },
      { d:13, name:'Мученическая смерть Имама Хасана (а)',         type:'death' },
      { d:20, name:'Рождение Имама Джавада (а)',                   type:'birth' },
      { d:23, name:'Рождение Имама Али (а)',                       type:'birth' },
      { d:25, name:'Смерть Хазрата Зейнаб (с.а.)',                type:'death' },
    ],
  };

  const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь',
                     'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  const WEEKDAYS  = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  const TYPE_LABEL = { birth:'Рождение', death:'Мученичество / Смерть', feast:'Праздник', other:'Событие' };
  const DOT_COLOR  = { birth:'#4a9d5a', death:'#9d4a4a', feast:'#c9a84c', other:'#4a7a9d' };

  const now = new Date();
  let curYear  = now.getFullYear();
  let curMonth = now.getMonth() + 1; // 1-indexed
  let selectedDay = null;

  const grid    = document.getElementById('cal-grid');
  const heading = document.getElementById('cal-events-heading');
  const list    = document.getElementById('cal-events-list');
  const label   = document.getElementById('cal-month-name');
  const yearLbl = document.getElementById('cal-year-label');

  function getEventsByDay(month, day) {
    return (EVENTS[month] || []).filter(e => e.d === day);
  }

  function getDaysInMonth(y, m) {
    return new Date(y, m, 0).getDate();
  }

  function getFirstDayOfWeek(y, m) {
    // 0=Sun..6=Sat -> convert to Mon-based (0=Mon..6=Sun)
    const d = new Date(y, m - 1, 1).getDay();
    return d === 0 ? 6 : d - 1;
  }

  function renderCalendar() {
    label.textContent = MONTHS_RU[curMonth - 1];
    yearLbl.textContent = curYear + ' · Исламский календарь';

    const days     = getDaysInMonth(curYear, curMonth);
    const startDay = getFirstDayOfWeek(curYear, curMonth);
    const evMap    = {};
    (EVENTS[curMonth] || []).forEach(e => {
      if (!evMap[e.d]) evMap[e.d] = [];
      evMap[e.d].push(e);
    });

    let html = '';
    // Weekday headers
    WEEKDAYS.forEach(w => { html += `<div class="cal-weekday">${w}</div>`; });

    // Empty cells before start
    for (let i = 0; i < startDay; i++) {
      html += `<div class="cal-cell empty"></div>`;
    }

    // Day cells
    const todayD = now.getDate(), todayM = now.getMonth()+1, todayY = now.getFullYear();
    for (let d = 1; d <= days; d++) {
      const evs = evMap[d] || [];
      const isToday   = (d === todayD && curMonth === todayM && curYear === todayY);
      const isSelected = (d === selectedDay);
      let cls = 'cal-cell';
      if (evs.length)  cls += ' has-event';
      if (isToday)     cls += ' today';
      if (isSelected)  cls += ' selected';

      let dots = '';
      evs.forEach(e => {
        dots += `<div class="cal-dot ${e.type}"></div>`;
      });

      html += `<div class="${cls}" data-day="${d}">
        <div class="cal-cell-num">${d}</div>
        ${dots ? `<div class="cal-dots">${dots}</div>` : ''}
      </div>`;
    }

    grid.innerHTML = html;

    // Attach click handlers
    grid.querySelectorAll('.cal-cell.has-event').forEach(cell => {
      cell.addEventListener('click', () => {
        selectedDay = parseInt(cell.dataset.day);
        renderCalendar();
        showDayEvents(selectedDay);
      });
    });

    // Show month overview or selected day
    if (selectedDay && evMap[selectedDay]) {
      showDayEvents(selectedDay);
    } else {
      showMonthEvents();
    }
  }

  function showDayEvents(day) {
    const evs = getEventsByDay(curMonth, day);
    heading.textContent = `${day} ${MONTHS_RU[curMonth-1]} · Events`;
    if (!evs.length) {
      list.innerHTML = `<div class="cal-no-events">Нет событий в этот день</div>`;
      return;
    }
    list.innerHTML = evs.map(e => `
      <div class="cal-ev-item">
        <div class="cal-ev-dot" style="background:${DOT_COLOR[e.type]}"></div>
        <div>
          <div class="cal-ev-name">${e.name}</div>
          <div class="cal-ev-type">${TYPE_LABEL[e.type]}</div>
        </div>
      </div>
    `).join('');
  }

  function showMonthEvents() {
    const allEvs = (EVENTS[curMonth] || []).sort((a,b) => a.d - b.d);
    heading.textContent = `События · ${MONTHS_RU[curMonth-1]}`;
    if (!allEvs.length) {
      list.innerHTML = `<div class="cal-no-events">Нет событий в этом месяце</div>`;
      return;
    }
    list.innerHTML = allEvs.map(e => `
      <div class="cal-ev-item">
        <div class="cal-ev-dot" style="background:${DOT_COLOR[e.type]}"></div>
        <div>
          <div class="cal-ev-name"><span style="font-family:'Cormorant Garamond',serif;font-size:16px;color:var(--gold);margin-right:8px;">${e.d}</span>${e.name}</div>
          <div class="cal-ev-type">${TYPE_LABEL[e.type]}</div>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('cal-prev').addEventListener('click', () => {
    curMonth--;
    if (curMonth < 1) { curMonth = 12; curYear--; }
    selectedDay = null;
    renderCalendar();
  });

  document.getElementById('cal-next').addEventListener('click', () => {
    curMonth++;
    if (curMonth > 12) { curMonth = 1; curYear++; }
    selectedDay = null;
    renderCalendar();
  });

  renderCalendar();

  // Highlight current prayer time
  function highlightPrayer() {
    const h = now.getHours(), m = now.getMinutes();
    const mins = h * 60 + m;
    const times = { fajr:252, sunrise:354, dhuhr:802, asr:1038, maghrib:1262, isha:1364 };
    let active = null;
    const order = ['fajr','sunrise','dhuhr','asr','maghrib','isha'];
    for (let i = 0; i < order.length; i++) {
      if (mins >= times[order[i]]) active = order[i];
    }
    document.querySelectorAll('.prayer-item').forEach(el => {
      el.classList.toggle('active-prayer', el.dataset.prayer === active);
    });
  }
  highlightPrayer();

})();
