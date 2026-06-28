// ── Calendar ────────────────────────────────────────────────────────
const CAL_COLORS = [
  { name: 'Blue',     hex: '#4285f4' },
  { name: 'Red',      hex: '#ea4335' },
  { name: 'Green',    hex: '#34a853' },
  { name: 'Yellow',   hex: '#f6bf26' },
  { name: 'Purple',   hex: '#7986cb' },
  { name: 'Teal',     hex: '#33b679' },
  { name: 'Pink',     hex: '#e67c73' },
  { name: 'Graphite', hex: '#616161' },
];

const CAL_MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const CAL_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── State ──────────────────────────────────────────────────────────
let _calYear       = new Date().getFullYear();
let _calMonth      = new Date().getMonth();
let _calEvents     = [];
let _calSelDate    = null;  // currently selected day
let _calEditId     = null;  // id of event being edited (null = new)
let _calEditScope  = null;  // 'this' | 'all' (null for new / non-recurring edits)
let _calOccDate    = null;  // specific occurrence date when scope = 'this'
let _calColor      = '#4285f4';
let _calWeeklyDays = new Set();
let _pendingAction = null;  // 'edit' | 'delete' — waiting for scope choice
let _pendingEv     = null;  // event object involved in pending action

// ── Boot ───────────────────────────────────────────────────────────
async function initCalendar() {
  _calEvents = await fetch('/api/events').then(r => r.json()).catch(() => []);
  renderCal();
  bindCalModal();
  initImportModal();
}

// ── Recurrence helpers ─────────────────────────────────────────────
function isoDate(y, m, d) {
  return String(y) + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
}

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function occursOn(ev, dateStr) {
  if (!ev.recurrence || ev.recurrence.type === 'none') return ev.date === dateStr;
  if (dateStr < ev.date) return false;
  const endDate = ev.recurrence.end_date;
  if (endDate && dateStr > endDate) return false;

  const start = parseLocalDate(ev.date);
  const check = parseLocalDate(dateStr);
  const type  = ev.recurrence.type;

  if (type === 'daily')    return true;
  if (type === 'weekdays') { const d = check.getDay(); return d >= 1 && d <= 5; }
  if (type === 'weekly') {
    const days = ev.recurrence.days && ev.recurrence.days.length
      ? ev.recurrence.days
      : [start.getDay()];
    return days.includes(check.getDay());
  }
  if (type === 'monthly')  return check.getDate() === start.getDate();
  if (type === 'yearly')   return check.getMonth() === start.getMonth() && check.getDate() === start.getDate();
  return false;
}

function isException(ev, dateStr) {
  return Array.isArray(ev.exceptions) && ev.exceptions.includes(dateStr);
}

function isRecurring(ev) {
  return ev.recurrence && ev.recurrence.type && ev.recurrence.type !== 'none';
}

function recurrenceLabel(ev) {
  if (!isRecurring(ev)) return '';
  const type = ev.recurrence.type;
  if (type === 'daily')    return 'Daily';
  if (type === 'weekdays') return 'Every weekday';
  if (type === 'weekly') {
    const days = ev.recurrence.days || [parseLocalDate(ev.date).getDay()];
    if (days.length === 7) return 'Daily';
    const abbr = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    return 'Weekly · ' + days.map(d => abbr[d]).join(', ');
  }
  if (type === 'monthly') return 'Monthly';
  if (type === 'yearly')  return 'Annually';
  return '';
}

function eventsOn(dateStr) {
  const results = [];
  for (const ev of _calEvents) {
    if (!isRecurring(ev)) {
      if (ev.date === dateStr) results.push({ ...ev, _recurring: false });
    } else {
      if (occursOn(ev, dateStr) && !isException(ev, dateStr)) {
        results.push({ ...ev, _recurring: true, _occDate: dateStr });
      }
    }
  }
  return results.sort((a, b) => {
    if (a.all_day && !b.all_day) return -1;
    if (!a.all_day && b.all_day) return 1;
    return (a.start_time || '').localeCompare(b.start_time || '');
  });
}

function escCal(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Render calendar grid ───────────────────────────────────────────
function renderCal() {
  const grid  = document.getElementById('cal-grid');
  const label = document.getElementById('cal-month-label');
  if (!grid) return;

  const now   = new Date();
  const today = isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
  label.textContent = CAL_MONTHS[_calMonth] + ' ' + _calYear;
  grid.innerHTML    = '';

  CAL_DAYS.forEach(d => {
    const h = document.createElement('div');
    h.className   = 'cal-day-header';
    h.textContent = d;
    grid.appendChild(h);
  });

  const firstDow      = new Date(_calYear, _calMonth, 1).getDay();
  const daysInMonth   = new Date(_calYear, _calMonth + 1, 0).getDate();
  const prevMonthDays = new Date(_calYear, _calMonth, 0).getDate();
  const totalCells    = Math.ceil((firstDow + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'cal-cell';

    let dateStr, dayNum, inMonth = true;

    if (i < firstDow) {
      dayNum = prevMonthDays - firstDow + i + 1;
      const pm = _calMonth === 0 ? 12 : _calMonth;
      const py = _calMonth === 0 ? _calYear - 1 : _calYear;
      dateStr = isoDate(py, pm, dayNum);
      inMonth = false;
    } else if (i >= firstDow + daysInMonth) {
      dayNum  = i - firstDow - daysInMonth + 1;
      const nm = _calMonth === 11 ? 1 : _calMonth + 2;
      const ny = _calMonth === 11 ? _calYear + 1 : _calYear;
      dateStr = isoDate(ny, nm, dayNum);
      inMonth = false;
    } else {
      dayNum  = i - firstDow + 1;
      dateStr = isoDate(_calYear, _calMonth + 1, dayNum);
    }

    if (!inMonth)            cell.classList.add('cal-cell--other');
    if (dateStr === today)   cell.classList.add('cal-cell--today');
    if (dateStr === _calSelDate) cell.classList.add('cal-cell--selected');
    cell.dataset.date = dateStr;

    const num = document.createElement('div');
    num.className   = 'cal-day-num';
    num.textContent = dayNum;
    cell.appendChild(num);

    const evs = eventsOn(dateStr);

    if (evs.length) {
      // Dots (mobile)
      const dots = document.createElement('div');
      dots.className = 'cal-dots';
      evs.slice(0, 3).forEach(ev => {
        const dot = document.createElement('span');
        dot.className        = 'cal-dot';
        dot.style.background = ev.color || '#4285f4';
        dots.appendChild(dot);
      });
      cell.appendChild(dots);

      // Pills (desktop)
      const pills = document.createElement('div');
      pills.className = 'cal-pills';
      evs.slice(0, 2).forEach(ev => {
        const p = document.createElement('div');
        p.className        = 'cal-pill';
        p.style.background = ev.color || '#4285f4';
        p.textContent      = (ev._recurring ? '↻ ' : '') + ev.title;
        pills.appendChild(p);
      });
      if (evs.length > 2) {
        const more = document.createElement('div');
        more.className   = 'cal-pill-more';
        more.textContent = '+' + (evs.length - 2) + ' more';
        pills.appendChild(more);
      }
      cell.appendChild(pills);
    }

    cell.addEventListener('click', () => openDayModal(dateStr));
    grid.appendChild(cell);
  }
}

window.calPrevMonth = function() {
  if (_calMonth === 0) { _calMonth = 11; _calYear--; } else _calMonth--;
  renderCal();
};
window.calNextMonth = function() {
  if (_calMonth === 11) { _calMonth = 0; _calYear++; } else _calMonth++;
  renderCal();
};
window.calGoToday = function() {
  _calYear = new Date().getFullYear(); _calMonth = new Date().getMonth(); renderCal();
};

// ── Day modal ──────────────────────────────────────────────────────
function openDayModal(dateStr) {
  _calSelDate = dateStr;
  _calEditId  = null;
  renderCal();

  const d = parseLocalDate(dateStr);
  document.getElementById('cal-modal-date').textContent =
    d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  renderDayList(dateStr);
  showCalView('list');
  document.getElementById('cal-modal-overlay').classList.remove('hidden');
  document.getElementById('cal-modal').classList.remove('hidden');
}

function closeCalModal() {
  document.getElementById('cal-modal-overlay').classList.add('hidden');
  document.getElementById('cal-modal').classList.add('hidden');
  _calSelDate = null; _calEditId = null;
  _calEditScope = null; _calOccDate = null;
  renderCal();
}

function showCalView(v) {
  document.getElementById('cal-list-view').style.display = v === 'list' ? '' : 'none';
  document.getElementById('cal-form-view').style.display = v === 'form' ? '' : 'none';
}

function renderDayList(dateStr) {
  const list  = document.getElementById('cal-events-list');
  const empty = document.getElementById('cal-events-empty');
  const evs   = eventsOn(dateStr);
  list.innerHTML = '';

  if (evs.length === 0) {
    if (empty) empty.style.display = '';
  } else {
    if (empty) empty.style.display = 'none';
    evs.forEach(ev => {
      const row = document.createElement('div');
      row.className = 'cal-event-row';
      const timeStr = ev.all_day ? 'All day'
                    : [ev.start_time, ev.end_time].filter(Boolean).join(' – ');
      const recLabel = ev._recurring ? recurrenceLabel(ev) : '';

      row.innerHTML =
        '<div class="cal-event-dot" style="background:' + (ev.color || '#4285f4') + '"></div>' +
        '<div class="cal-event-info">' +
          '<div class="cal-event-name">' + escCal(ev.title) +
            (ev._recurring ? ' <span class="cal-rec-badge">↻</span>' : '') +
          '</div>' +
          ((timeStr || recLabel) ?
            '<div class="cal-event-time">' + escCal([timeStr, recLabel].filter(Boolean).join('  ·  ')) + '</div>' : '') +
        '</div>' +
        '<button class="cal-row-edit btn-ghost" type="button">Edit</button>' +
        '<button class="cal-row-del" type="button" title="Delete">×</button>';

      row.querySelector('.cal-row-edit').addEventListener('click', () => {
        if (ev._recurring) {
          _pendingAction = 'edit'; _pendingEv = ev;
          openScopeDialog('Edit recurring event');
        } else {
          openEventForm(ev, null);
        }
      });

      row.querySelector('.cal-row-del').addEventListener('click', () => {
        if (ev._recurring) {
          _pendingAction = 'delete'; _pendingEv = ev;
          openScopeDialog('Delete recurring event');
        } else {
          if (!confirm('Delete this event?')) return;
          doDeleteEvent(ev.id, null, dateStr);
        }
      });

      list.appendChild(row);
    });
  }
}

// ── Scope dialog (recurring edit/delete) ───────────────────────────
function openScopeDialog(heading) {
  document.getElementById('cal-scope-heading').textContent = heading;
  document.getElementById('cal-scope-overlay').classList.remove('hidden');
  document.getElementById('cal-scope-modal').classList.remove('hidden');
}

function closeScopeDialog() {
  document.getElementById('cal-scope-overlay').classList.add('hidden');
  document.getElementById('cal-scope-modal').classList.add('hidden');
}

// ── Event form ─────────────────────────────────────────────────────
function openEventForm(ev, scope) {
  _calEditId    = ev ? ev.id : null;
  _calEditScope = scope;
  _calOccDate   = (scope === 'this') ? (ev?._occDate || _calSelDate) : null;
  _calColor     = ev ? (ev.color || '#4285f4') : '#4285f4';

  document.getElementById('cal-ev-title').value = ev ? ev.title : '';

  // For 'this' scope use the occurrence date; otherwise base event date
  const dateVal = (scope === 'this')
    ? (_calOccDate || ev?.date || _calSelDate || '')
    : (ev?.date || _calSelDate || '');
  document.getElementById('cal-ev-date').value = dateVal;

  const allDay = ev ? !!ev.all_day : false;
  document.getElementById('cal-ev-allday').checked = allDay;
  document.getElementById('cal-ev-start').value = (!ev || allDay) ? '' : (ev.start_time || '');
  document.getElementById('cal-ev-end').value   = (!ev || allDay) ? '' : (ev.end_time   || '');
  toggleCalTime(allDay);

  // Recurrence section — hide when editing a single occurrence
  const recSection = document.getElementById('cal-recurrence-section');
  const thisOnly   = scope === 'this';
  if (recSection) recSection.style.display = thisOnly ? 'none' : '';

  if (!thisOnly) {
    const rec     = ev?.recurrence;
    const recType = rec?.type || 'none';
    document.getElementById('cal-ev-recurrence').value = recType;

    // Weekly day picker
    _calWeeklyDays = new Set(rec?.days || []);
    if (recType === 'weekly' && !_calWeeklyDays.size) {
      _calWeeklyDays.add(parseLocalDate(ev?.date || _calSelDate || isoDate(
        new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()
      )).getDay());
    }
    updateWeeklyDayUI();
    document.getElementById('cal-weekly-days').style.display     = recType === 'weekly' ? '' : 'none';
    document.getElementById('cal-recurrence-end').style.display  = recType !== 'none'   ? '' : 'none';
    document.getElementById('cal-ev-end-rec').value = rec?.end_date || '';
  }

  document.querySelectorAll('.cal-swatch').forEach(s =>
    s.classList.toggle('active', s.dataset.color === _calColor)
  );

  document.getElementById('cal-form-view-label').textContent =
    !ev ? 'New event' : scope === 'this' ? 'Edit this event' : 'Edit event';
  document.getElementById('cal-form-del').style.display = ev ? '' : 'none';

  showCalView('form');
  setTimeout(() => document.getElementById('cal-ev-title')?.focus(), 60);
}

function toggleCalTime(allDay) {
  const row = document.getElementById('cal-time-row');
  if (row) row.style.display = allDay ? 'none' : '';
}

function updateWeeklyDayUI() {
  document.querySelectorAll('.cal-day-tog').forEach(btn => {
    btn.classList.toggle('active', _calWeeklyDays.has(Number(btn.dataset.dow)));
  });
}

// ── Save event ─────────────────────────────────────────────────────
async function saveCalEvent() {
  const title  = (document.getElementById('cal-ev-title')?.value  || '').trim();
  const date   =  document.getElementById('cal-ev-date')?.value   || '';
  const allDay =  document.getElementById('cal-ev-allday')?.checked || false;
  const start  =  document.getElementById('cal-ev-start')?.value  || '';
  const end    =  document.getElementById('cal-ev-end')?.value    || '';
  const btn    =  document.getElementById('cal-form-save');

  if (!title) { document.getElementById('cal-ev-title').focus(); return; }

  // Recurrence (not collected when editing 'this' scope)
  let recurrence = null;
  if (document.getElementById('cal-recurrence-section')?.style.display !== 'none') {
    const recType = document.getElementById('cal-ev-recurrence')?.value || 'none';
    if (recType !== 'none') {
      recurrence = {
        type:     recType,
        days:     recType === 'weekly' ? [..._calWeeklyDays].sort() : undefined,
        end_date: document.getElementById('cal-ev-end-rec')?.value || null,
      };
    }
  }

  const payload = {
    title, date,
    all_day:    allDay,
    start_time: allDay ? null : (start || null),
    end_time:   allDay ? null : (end   || null),
    color:      _calColor,
    recurrence,
  };

  if (btn) btn.disabled = true;
  try {
    if (_calEditId && _calEditScope === 'this') {
      // --- Edit only this occurrence ---
      // 1. Add occurrence date to base event's exceptions
      const base = _calEvents.find(e => e.id === _calEditId);
      const newExc = [...(base.exceptions || []), _calOccDate];
      await fetch('/api/events/' + _calEditId, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...base, exceptions: newExc }),
      });
      _calEvents = _calEvents.map(e =>
        e.id === _calEditId ? { ...e, exceptions: newExc } : e
      );
      // 2. Create standalone one-time event for the edited occurrence
      const res     = await fetch('/api/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, date: _calOccDate, recurrence: null, exceptions: [] }),
      });
      const created = await res.json();
      _calEvents = [created, ..._calEvents];

    } else if (_calEditId) {
      // --- Edit all events (or non-recurring) ---
      const res     = await fetch('/api/events/' + _calEditId, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      _calEvents = _calEvents.map(e => e.id === _calEditId ? updated : e);

    } else {
      // --- New event ---
      const res     = await fetch('/api/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, exceptions: [] }),
      });
      const created = await res.json();
      _calEvents = [created, ..._calEvents];
    }

    _calEditId = null; _calEditScope = null; _calOccDate = null;
    renderCal();
    renderDayList(_calSelDate || date);
    showCalView('list');
  } catch {
    alert('Error saving event.');
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ── Delete helpers ─────────────────────────────────────────────────
async function doDeleteEvent(id, occurrenceDate, refreshDate) {
  if (occurrenceDate) {
    // Delete only this occurrence — add to exceptions
    const base   = _calEvents.find(e => e.id === id);
    const newExc = [...(base.exceptions || []), occurrenceDate];
    await fetch('/api/events/' + id, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...base, exceptions: newExc }),
    });
    _calEvents = _calEvents.map(e => e.id === id ? { ...e, exceptions: newExc } : e);
  } else {
    // Delete all events in the series
    await fetch('/api/events/' + id, { method: 'DELETE' });
    _calEvents = _calEvents.filter(e => e.id !== id);
  }
  renderCal();
  renderDayList(refreshDate || _calSelDate);
}

// ── Bind modal interactions ────────────────────────────────────────
function bindCalModal() {
  // ── Day modal controls ──
  document.getElementById('cal-modal-overlay')?.addEventListener('click', closeCalModal);
  document.getElementById('cal-modal-close')?.addEventListener('click', closeCalModal);
  document.getElementById('cal-add-btn')?.addEventListener('click', () => openEventForm(null, null));

  // ── Form controls ──
  document.getElementById('cal-form-back')?.addEventListener('click', () => {
    renderDayList(_calSelDate); showCalView('list');
  });
  document.getElementById('cal-ev-allday')?.addEventListener('change', e =>
    toggleCalTime(e.target.checked)
  );
  document.getElementById('cal-form-save')?.addEventListener('click', saveCalEvent);
  document.getElementById('cal-ev-title')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveCalEvent();
  });

  document.getElementById('cal-form-del')?.addEventListener('click', () => {
    if (!_calEditId) return;
    const ev = _calEvents.find(e => e.id === _calEditId);
    if (ev && isRecurring(ev) && _calEditScope !== 'this') {
      _pendingAction = 'delete';
      _pendingEv = { ...ev, _occDate: _calOccDate || _calSelDate };
      closeScopeDialog();
      openScopeDialog('Delete recurring event');
    } else {
      const occDate = _calEditScope === 'this' ? _calOccDate : null;
      if (!confirm('Delete this event?')) return;
      const refreshDate = _calSelDate;
      _calEditId = null; _calEditScope = null; _calOccDate = null;
      showCalView('list');
      doDeleteEvent(ev.id, occDate, refreshDate);
    }
  });

  // ── Recurrence controls ──
  document.getElementById('cal-ev-recurrence')?.addEventListener('change', e => {
    const v = e.target.value;
    document.getElementById('cal-weekly-days').style.display    = v === 'weekly' ? '' : 'none';
    document.getElementById('cal-recurrence-end').style.display = v !== 'none'   ? '' : 'none';
    if (v === 'weekly' && _calWeeklyDays.size === 0) {
      const dateVal = document.getElementById('cal-ev-date')?.value;
      if (dateVal) _calWeeklyDays.add(parseLocalDate(dateVal).getDay());
      updateWeeklyDayUI();
    }
  });

  document.querySelectorAll('.cal-day-tog').forEach(btn => {
    btn.addEventListener('click', () => {
      const dow = Number(btn.dataset.dow);
      if (_calWeeklyDays.has(dow) && _calWeeklyDays.size > 1) {
        _calWeeklyDays.delete(dow);
      } else {
        _calWeeklyDays.add(dow);
      }
      updateWeeklyDayUI();
    });
  });

  // ── Scope dialog ──
  document.getElementById('cal-scope-overlay')?.addEventListener('click', closeScopeDialog);
  document.getElementById('cal-scope-cancel')?.addEventListener('click', closeScopeDialog);

  document.getElementById('cal-scope-this')?.addEventListener('click', () => {
    closeScopeDialog();
    if (_pendingAction === 'edit') {
      openEventForm(_pendingEv, 'this');
    } else if (_pendingAction === 'delete') {
      const occDate = _pendingEv._occDate || _calSelDate;
      doDeleteEvent(_pendingEv.id, occDate, _calSelDate);
    }
    _pendingAction = null; _pendingEv = null;
  });

  document.getElementById('cal-scope-all')?.addEventListener('click', () => {
    closeScopeDialog();
    if (_pendingAction === 'edit') {
      openEventForm(_pendingEv, 'all');
    } else if (_pendingAction === 'delete') {
      if (!confirm('Delete all events in this series?')) return;
      doDeleteEvent(_pendingEv.id, null, _calSelDate);
    }
    _pendingAction = null; _pendingEv = null;
  });

  // ── Colour swatches ──
  const swatchWrap = document.getElementById('cal-swatches');
  if (swatchWrap) {
    CAL_COLORS.forEach(c => {
      const btn = document.createElement('button');
      btn.className        = 'cal-swatch' + (c.hex === '#4285f4' ? ' active' : '');
      btn.type             = 'button';
      btn.title            = c.name;
      btn.dataset.color    = c.hex;
      btn.style.background = c.hex;
      btn.addEventListener('click', () => {
        _calColor = c.hex;
        document.querySelectorAll('.cal-swatch').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
      });
      swatchWrap.appendChild(btn);
    });
  }
}

// â”€â”€ Calendar Import â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const HOLIDAY_COUNTRIES = [
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' },
  { code: 'CN', name: 'China' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IN', name: 'India' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'MX', name: 'Mexico' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
];

async function initImportModal() {
  // Populate country dropdown
  const sel = document.getElementById('ci-country');
  if (sel) {
    HOLIDAY_COUNTRIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.code;
      opt.textContent = c.name;
      if (c.code === 'GB') opt.selected = true;
      sel.appendChild(opt);
    });
  }

  // Default year = current year
  const yearEl = document.getElementById('ci-year');
  if (yearEl) yearEl.value = new Date().getFullYear();

  // Bind open/close
  document.getElementById('cal-import-btn')?.addEventListener('click', () => openImportModal('holidays'));
  document.getElementById('cal-import-close')?.addEventListener('click', closeImportModal);
  document.getElementById('cal-import-overlay')?.addEventListener('click', closeImportModal);

  // Bind holiday import button
  document.getElementById('ci-holidays-btn')?.addEventListener('click', importHolidays);

  // Bind Google Calendar buttons
  document.getElementById('ci-gcal-sync-btn')?.addEventListener('click', syncGcal);
  document.getElementById('ci-gcal-disconnect-btn')?.addEventListener('click', disconnectGcal);

  // Check Google Calendar status
  await refreshGcalPanel();

  // Handle redirect back from OAuth
  const params = new URLSearchParams(window.location.search);
  if (params.has('gcal_connected')) {
    window.history.replaceState({}, '', window.location.pathname);
    setTimeout(() => openImportModal('gcal'), 400);
  } else if (params.has('gcal_error')) {
    window.history.replaceState({}, '', window.location.pathname);
  }
}

function openImportModal(tab) {
  switchImportTab(tab || 'holidays');
  document.getElementById('cal-import-overlay').classList.remove('hidden');
  document.getElementById('cal-import-modal').classList.remove('hidden');
}

function closeImportModal() {
  document.getElementById('cal-import-overlay').classList.add('hidden');
  document.getElementById('cal-import-modal').classList.add('hidden');
}

window.switchImportTab = function(tab) {
  document.getElementById('ci-panel-holidays').style.display = tab === 'holidays' ? '' : 'none';
  document.getElementById('ci-panel-gcal').style.display     = tab === 'gcal'     ? '' : 'none';
  document.getElementById('ci-tab-holidays').classList.toggle('active', tab === 'holidays');
  document.getElementById('ci-tab-gcal').classList.toggle('active', tab === 'gcal');
};

async function importHolidays() {
  const country  = document.getElementById('ci-country')?.value;
  const year     = document.getElementById('ci-year')?.value;
  const statusEl = document.getElementById('ci-holidays-status');
  const btn      = document.getElementById('ci-holidays-btn');
  if (!country || !year) return;

  btn.disabled = true;
  btn.textContent = 'Importingâ€¦';
  statusEl.textContent = '';
  statusEl.className = 'ci-status';

  try {
    const r = await fetch('/api/holidays/' + country + '/' + year);
    if (!r.ok) { const j = await r.json(); throw new Error(j.error || 'API error'); }
    const holidays = await r.json();

    if (!Array.isArray(holidays) || holidays.length === 0) {
      statusEl.textContent = 'No holidays found for this selection.';
      return;
    }

    // Build duplicate-check set from existing events
    const existing = await fetch('/api/events').then(r => r.json()).catch(() => []);
    const dupSet = new Set(
      existing.filter(e => e.source === 'holiday').map(e => e.title + '|' + e.date)
    );

    let imported = 0;
    for (const h of holidays) {
      const title = h.localName || h.name;
      if (dupSet.has(title + '|' + h.date)) continue;
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, date: h.date,
          all_day: true, start_time: null, end_time: null,
          color: '#34a853', recurrence: null, exceptions: [], source: 'holiday',
        }),
      });
      dupSet.add(title + '|' + h.date);
      imported++;
    }

    _calEvents = await fetch('/api/events').then(r => r.json()).catch(() => []);
    renderCal();

    if (imported > 0) {
      statusEl.textContent = 'Imported ' + imported + ' holiday' + (imported !== 1 ? 's' : '') + '.';
      statusEl.className = 'ci-status ci-status--ok';
    } else {
      statusEl.textContent = 'All holidays already imported.';
      statusEl.className = 'ci-status';
    }
  } catch (e) {
    statusEl.textContent = 'Error: ' + (e.message || 'Failed to fetch holidays.');
    statusEl.className = 'ci-status ci-status--err';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Import Holidays';
  }
}

async function refreshGcalPanel() {
  try {
    const r    = await fetch('/api/gcal/status').then(r => r.json());
    const conf = r.configured;
    const conn = r.connected;

    document.getElementById('ci-gcal-setup').style.display     = !conf           ? '' : 'none';
    document.getElementById('ci-gcal-connect').style.display   = conf && !conn   ? '' : 'none';
    document.getElementById('ci-gcal-connected').style.display = conf && conn    ? '' : 'none';

    if (conf && conn) {
      try {
        const cals = await fetch('/api/gcal/calendars').then(r => r.json());
        const sel  = document.getElementById('ci-gcal-calendar');
        if (sel && Array.isArray(cals)) {
          sel.innerHTML = '';
          cals.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.summary + (c.primary ? ' (primary)' : '');
            if (c.primary) opt.selected = true;
            sel.appendChild(opt);
          });
        }
      } catch {}
    }
  } catch {}
}

async function syncGcal() {
  const calId    = document.getElementById('ci-gcal-calendar')?.value || 'primary';
  const months   = parseInt(document.getElementById('ci-gcal-range')?.value || '3');
  const statusEl = document.getElementById('ci-gcal-status');
  const btn      = document.getElementById('ci-gcal-sync-btn');

  btn.disabled = true;
  btn.textContent = 'Syncingâ€¦';
  statusEl.textContent = '';
  statusEl.className = 'ci-status';

  try {
    const r    = await fetch('/api/gcal/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendar_id: calId, months }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Sync failed');

    _calEvents = await fetch('/api/events').then(r => r.json()).catch(() => []);
    renderCal();

    statusEl.textContent = 'Imported ' + data.imported + ' new event' + (data.imported !== 1 ? 's' : '')
      + ' (' + data.total_gcal + ' found in Google Calendar).';
    statusEl.className = 'ci-status ci-status--ok';
  } catch (e) {
    statusEl.textContent = 'Error: ' + (e.message || 'Sync failed.');
    statusEl.className = 'ci-status ci-status--err';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sync Events';
  }
}

async function disconnectGcal() {
  if (!confirm('Disconnect your Google Calendar? Imported events will not be removed.')) return;
  await fetch('/api/gcal/disconnect', { method: 'POST' });
  await refreshGcalPanel();
  const statusEl = document.getElementById('ci-gcal-status');
  if (statusEl) { statusEl.textContent = 'Disconnected.'; statusEl.className = 'ci-status'; }
}
