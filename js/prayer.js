// ── PRAYER TIMES ──
(function(){
  const PRAYERS_LIST = [
    { key:'Fajr',    name:'Фаджр',   ar:'الفجر'  },
    { key:'Sunrise', name:'Восход',  ar:'الشروق' },
    { key:'Dhuhr',   name:'Зухр',    ar:'الظهر'  },
    { key:'Asr',     name:'Аср',     ar:'العصر'  },
    { key:'Maghrib', name:'Магриб',  ar:'المغرب' },
    { key:'Isha',    name:'Иша',     ar:'العشاء' },
    { key:'Midnight',name:'Полночь', ar:'منتصف'  },
  ];
  const HIJRI_MONTHS = ['Мухаррам','Сафар','Раби аль-Авваль','Раби ас-Сани','Джумада аль-Авваль','Джумада ас-Сани','Раджаб','Шаабан','Рамадан','Шавваль','Зуль-Каъда','Зуль-Хиджа'];
  const HIJRI_MONTHS_AR = ['مُحَرَّم','صَفَر','رَبِيعُ الأَوَّل','رَبِيعُ الآخِر','جُمَادَى الأُولَى','جُمَادَى الآخِرَة','رَجَب','شَعْبَان','رَمَضَان','شَوَّال','ذُو الْقَعْدَة','ذُو الْحِجَّة'];

  let prayerCountdown = null;

  window.getPrayerGeo = function() {
    setPrayerLoading('Определяем местоположение...');
    if (!navigator.geolocation) { setPrayerError('Геолокация не поддерживается'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => fetchPrayerByCoords(pos.coords.latitude, pos.coords.longitude),
      () => setPrayerError('Не удалось получить местоположение')
    );
  };

  window.searchPrayerCity = async function() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) return;
    setPrayerLoading('Ищем ' + city + '...');
    try {
      const res = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(city) + '&format=json&limit=1', { headers: {'Accept-Language':'ru'} });
      const data = await res.json();
      if (!data.length) { setPrayerError('Город не найден'); return; }
      document.getElementById('cityInput').value = data[0].display_name.split(',')[0];
      fetchPrayerByCoords(parseFloat(data[0].lat), parseFloat(data[0].lon));
    } catch(e) { setPrayerError('Ошибка поиска города'); }
  };

  async function fetchPrayerByCoords(lat, lon) {
    setPrayerLoading('Загружаем время намаза...');
    try {
      const t = new Date();
      const url = `https://api.aladhan.com/v1/timings/${t.getDate()}-${t.getMonth()+1}-${t.getFullYear()}?latitude=${lat}&longitude=${lon}&method=0&school=1`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.code !== 200) throw new Error();
      renderPrayerTimes(json.data.timings, json.data.date.hijri);
    } catch(e) { setPrayerError('Не удалось загрузить данные'); }
  }

  function renderPrayerTimes(timings, hijri) {
    const db = document.getElementById('prayerDateBar');
    if (db) {
      db.style.display = 'flex';
      const hm = parseInt(hijri.month.number) - 1;
      document.getElementById('prayerDateGregorian').textContent =
        new Date().toLocaleDateString('ru-RU', {weekday:'long',day:'numeric',month:'long',year:'numeric'});
      document.getElementById('prayerDateHijri').textContent =
        hijri.day + ' ' + HIJRI_MONTHS_AR[hm] + ' ' + hijri.year;
      document.getElementById('prayerDateHijriRu').textContent =
        hijri.day + ' ' + HIJRI_MONTHS[hm] + ' ' + hijri.year + ' г.х.';
    }

    const now = new Date();
    const nowMins = now.getHours()*60 + now.getMinutes();
    const list = PRAYERS_LIST.filter(p => timings[p.key]);
    const mins = list.map(p => { const [h,m]=timings[p.key].split(':').map(Number); return h*60+m; });

    let activeIdx = -1;
    for (let i=mins.length-1;i>=0;i--) { if(nowMins>=mins[i]){activeIdx=i;break;} }
    const nextIdx = (activeIdx+1) % list.length;
    const pad = n => String(n).padStart(2,'0');
    const fmt = t => { if(!t) return '--:--'; const [h,m]=t.split(':'); return pad(+h)+':'+pad(+m); };

    let rows = '';
    list.forEach((p,i) => {
      const isActive=i===activeIdx, isPassed=i<activeIdx;
      rows += `<li style="display:flex;align-items:center;justify-content:space-between;padding:13px 32px;border-bottom:1px solid var(--border);list-style:none;position:relative;${isActive?'background:rgba(201,168,76,0.04);':''}" >
        ${isActive?'<span style="position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--gold);"></span>':''}
        <div style="display:flex;align-items:center;gap:14px;">
          <span style="font-family:\'Scheherazade New\',serif;font-size:16px;color:${isActive?'var(--gold)':'var(--gold-dim)'};width:36px;text-align:right;">${p.ar}</span>
          <span style="font-size:13px;color:${isActive?'var(--gold)':isPassed?'var(--text-muted)':'var(--text-dim)'};font-weight:300;">${p.name}</span>
          ${isActive?'<span style="font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);border:1px solid var(--border-gold);padding:2px 8px;">Сейчас</span>':''}
        </div>
        <span style="font-family:\'Cormorant Garamond\',serif;font-size:22px;color:${isPassed?'var(--text-muted)':'var(--gold)'};font-weight:300;">${fmt(timings[p.key])}</span>
      </li>`;
    });

    rows += `<div style="padding:18px 32px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px;">Следующий намаз</div>
        <div style="font-family:\'Cormorant Garamond\',serif;font-size:17px;color:var(--text);font-weight:300;">${list[nextIdx].name} · ${list[nextIdx].ar}</div>
      </div>
      <div style="text-align:right;">
        <div id="prayerCountdown" style="font-family:\'Cormorant Garamond\',serif;font-size:30px;color:var(--gold);font-weight:300;letter-spacing:0.05em;">--:--:--</div>
        <div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--text-muted);margin-top:2px;">осталось</div>
      </div>
    </div>`;

    document.getElementById('prayerContent').innerHTML = '<ul style="list-style:none;padding:8px 0 0;">' + rows + '</ul>';

    if (prayerCountdown) clearInterval(prayerCountdown);
    function tick() {
      const n=new Date();
      const [nh,nm]=timings[list[nextIdx].key].split(':').map(Number);
      let diff=(nh*60+nm)*60000-(n.getHours()*3600+n.getMinutes()*60+n.getSeconds())*1000;
      if(diff<0) diff+=86400000;
      const h=Math.floor(diff/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);
      const el=document.getElementById('prayerCountdown');
      if(el) el.textContent=pad(h)+':'+pad(m)+':'+pad(s);
    }
    tick();
    prayerCountdown = setInterval(tick,1000);
  }

  function setPrayerLoading(msg) {
    const db=document.getElementById('prayerDateBar'); if(db) db.style.display='none';
    document.getElementById('prayerContent').innerHTML=`<div style="padding:40px 32px;text-align:center;"><div style="width:24px;height:24px;border:1px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;"></div><div style="font-family:'Cormorant Garamond',serif;font-size:16px;color:var(--text-dim);font-style:italic;">${msg}</div></div>`;
  }
  function setPrayerError(msg) {
    document.getElementById('prayerContent').innerHTML=`<div style="padding:40px 32px;text-align:center;"><div style="font-size:24px;opacity:0.4;margin-bottom:14px;">⚠</div><div style="font-family:'Cormorant Garamond',serif;font-size:16px;color:var(--text-dim);font-style:italic;">${msg}</div></div>`;
  }

  setTimeout(getPrayerGeo, 600);
})();
