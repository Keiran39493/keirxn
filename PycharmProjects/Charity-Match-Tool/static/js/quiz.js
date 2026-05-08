// ─── Quiz step definitions ───────────────────────────────────────────────────

const STEPS = [
  {
    id: 'supporter_type',
    question: 'What type of supporter are you?',
    subtitle: 'This helps us understand your governance structure and giving approach.',
    type: 'single',
    options: [
      { value: 'individual_trustee', icon: '👤', label: 'Individual Trustee', desc: 'You serve personally as a trustee or board member' },
      { value: 'private_foundation', icon: '🏛️', label: 'Private Foundation', desc: 'A privately established charitable foundation' },
      { value: 'corporate_foundation', icon: '🏢', label: 'Corporate Foundation', desc: 'Established and funded by a corporation' },
      { value: 'family_foundation', icon: '👨‍👩‍👧', label: 'Family Foundation', desc: 'A family-operated philanthropic foundation' },
    ],
  },
  {
    id: 'sectors',
    question: 'Which sectors align with your values?',
    subtitle: 'Select all areas you wish to support. At least one required.',
    type: 'multi',
    minSelect: 1,
    options: [
      { value: 'children_youth_families', icon: '👶', label: 'Children & Youth', desc: 'Supporting young people and families' },
      { value: 'senior_citizens', icon: '🧓', label: 'Senior Citizens', desc: 'Care and inclusion for older adults' },
      { value: 'education', icon: '📚', label: 'Education', desc: 'Learning, training, and knowledge' },
      { value: 'social_health', icon: '❤️', label: 'Social & Health', desc: 'Social services and healthcare' },
      { value: 'arts_culture', icon: '🎨', label: 'Arts & Culture', desc: 'Creative expression and cultural heritage' },
      { value: 'environment_climate', icon: '🌿', label: 'Environment', desc: 'Nature, sustainability, and climate' },
      { value: 'sport_leisure', icon: '⚽', label: 'Sports & Leisure', desc: 'Physical activity and recreation' },
      { value: 'development', icon: '🌍', label: 'Global Development', desc: 'International aid and development cooperation' },
    ],
  },
  {
    id: 'engagement',
    question: 'How do you prefer to engage?',
    subtitle: 'Select all that apply.',
    type: 'multi',
    minSelect: 1,
    options: [
      { value: 'financial', icon: '💰', label: 'Financial Grants', desc: 'Providing direct funding or grants' },
      { value: 'governance', icon: '🏛️', label: 'Board Governance', desc: 'Active membership on the board of trustees' },
      { value: 'advisory', icon: '💡', label: 'Strategic Advisory', desc: 'Offering strategic guidance and advice' },
      { value: 'project', icon: '📋', label: 'Project Funding', desc: 'Targeted funding for specific initiatives' },
      { value: 'mentorship', icon: '🤝', label: 'Mentorship', desc: 'Capacity building and knowledge transfer' },
    ],
  },
  {
    id: 'support_scale',
    question: 'What is your annual support capacity?',
    subtitle: 'An estimate helps us match you with organisations of the right scale.',
    type: 'single',
    options: [
      { value: 'under_10k', icon: '💵', label: 'Under CHF 10,000', desc: 'Smaller contributions or in-kind support' },
      { value: '10k_50k', icon: '💴', label: 'CHF 10,000 – 50,000', desc: 'Meaningful support for smaller organisations' },
      { value: '50k_250k', icon: '💶', label: 'CHF 50,000 – 250,000', desc: 'Significant impact for mid-size NGOs' },
      { value: 'over_250k', icon: '💷', label: 'Over CHF 250,000', desc: 'Major philanthropic investment capacity' },
    ],
  },
  {
    id: 'geographic_focus',
    question: 'Where should the NGO primarily operate?',
    subtitle: 'Choose the geographic scope that best fits your philanthropic priorities.',
    type: 'single',
    options: [
      { value: 'liechtenstein', icon: '🇱🇮', label: 'Liechtenstein Only', desc: 'Focused exclusively within the Principality' },
      { value: 'dach', icon: '🌐', label: 'DACH Region', desc: 'Liechtenstein, Switzerland, Austria & Germany' },
      { value: 'international', icon: '🌍', label: 'International', desc: 'Global reach and impact beyond the region' },
    ],
  },
  {
    id: 'sdg_priorities',
    question: 'Which UN SDGs matter most to you?',
    subtitle: 'Select up to 3 Sustainable Development Goals that resonate with your mission.',
    type: 'multi',
    maxSelect: 3,
    minSelect: 0,
    options: [
      { value: 1,  icon: '🏠', label: 'No Poverty',          desc: 'SDG 1: End poverty in all its forms everywhere' },
      { value: 2,  icon: '🍽️', label: 'Zero Hunger',         desc: 'SDG 2: End hunger and achieve food security' },
      { value: 3,  icon: '❤️‍🩹', label: 'Good Health',        desc: 'SDG 3: Ensure health and well-being for all' },
      { value: 4,  icon: '📖', label: 'Quality Education',    desc: 'SDG 4: Inclusive and equitable education for all' },
      { value: 5,  icon: '⚖️', label: 'Gender Equality',      desc: 'SDG 5: Achieve gender equality and empowerment' },
      { value: 10, icon: '🤝', label: 'Reduced Inequalities', desc: 'SDG 10: Reduce inequality within and among countries' },
      { value: 11, icon: '🏙️', label: 'Sustainable Cities',   desc: 'SDG 11: Safe, inclusive, resilient communities' },
      { value: 13, icon: '🌡️', label: 'Climate Action',       desc: 'SDG 13: Combat climate change and its impacts' },
      { value: 14, icon: '🐠', label: 'Life Below Water',     desc: 'SDG 14: Conserve oceans and marine resources' },
      { value: 15, icon: '🌳', label: 'Life on Land',         desc: 'SDG 15: Protect and restore terrestrial ecosystems' },
      { value: 16, icon: '🕊️', label: 'Peace & Justice',      desc: 'SDG 16: Peaceful, just and inclusive societies' },
      { value: 17, icon: '🌐', label: 'Partnerships',         desc: 'SDG 17: Strengthen global partnerships for the goals' },
    ],
  },
  {
    id: 'org_maturity',
    question: 'What stage of organisation do you prefer to support?',
    subtitle: 'Different stages offer different opportunities and needs.',
    type: 'single',
    options: [
      { value: 'new',          icon: '🌱', label: 'Emerging',     desc: 'Founded less than 5 years ago — high growth potential' },
      { value: 'established',  icon: '🌳', label: 'Established',  desc: '5 to 20 years old — proven track record' },
      { value: 'long_standing',icon: '🏛️', label: 'Long-standing', desc: 'Over 20 years — deep-rooted community impact' },
      { value: 'no_preference',icon: '⭐', label: 'No Preference', desc: 'Open to supporting organisations at any stage' },
    ],
  },
  {
    id: 'legal_form_preference',
    question: 'Do you prefer a particular organisational structure?',
    subtitle: 'Associations (Verein) and foundations (Stiftung) have different governance models.',
    type: 'single',
    options: [
      { value: 'association', icon: '👥', label: 'Associations (Verein)', desc: 'Member-driven democratic organisations' },
      { value: 'foundation',  icon: '🏛️', label: 'Foundations (Stiftung)', desc: 'Foundation-governed with a board of trustees' },
      { value: 'both',        icon: '✅', label: 'No Preference', desc: 'Open to both organisational structures equally' },
    ],
  },
];

// ─── Card rendering helpers ──────────────────────────────────────────────────

function optValue(v) {
  return typeof v === 'number' ? v : `'${v}'`;
}

// Tile-style cards: large centered icon, used when a step has ≥5 options
function renderTileCards(step, selectedArr, atMax) {
  const cols = step.options.length <= 6
    ? 'grid-cols-2 sm:grid-cols-3'
    : 'grid-cols-2 sm:grid-cols-4';

  const cards = step.options.map(opt => {
    const isSelected = selectedArr.includes(opt.value);
    const isDisabled = atMax && !isSelected;
    return `
      <div class="tile-card bg-white rounded-2xl p-5 flex flex-col items-center text-center
                  ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled-max' : ''}"
           onclick="Quiz.select('${step.id}', ${optValue(opt.value)})">
        <div class="tile-check">
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <span class="text-4xl leading-none mb-3 mt-2">${opt.icon}</span>
        <span class="tile-label font-semibold text-sm text-gm-800 leading-tight mb-1.5">${opt.label}</span>
        <p class="tile-desc text-xs text-gray-500 leading-relaxed">${opt.desc}</p>
      </div>`;
  }).join('');

  return `<div class="grid ${cols} gap-3">${cards}</div>`;
}

// List-style cards: horizontal layout with icon on left, used for ≤4 options
function renderListCards(step, selectedArr, atMax) {
  const cards = step.options.map(opt => {
    const isSelected = selectedArr.includes(opt.value);
    const isDisabled = atMax && !isSelected;
    return `
      <div class="list-card bg-white rounded-2xl p-5
                  ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled-max' : ''}"
           onclick="Quiz.select('${step.id}', ${optValue(opt.value)})">
        <div class="flex items-start gap-4">
          <span class="text-3xl leading-none mt-0.5 flex-shrink-0">${opt.icon}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <span class="font-semibold text-sm text-gm-800 leading-tight">${opt.label}</span>
              <span class="list-check w-5 h-5 bg-gm-600 rounded-full items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1.5 leading-relaxed">${opt.desc}</p>
          </div>
        </div>
      </div>`;
  }).join('');

  return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${cards}</div>`;
}

// ─── Quiz state ───────────────────────────────────────────────────────────────

const Quiz = {
  step: 0,
  answers: {},

  init() {
    this.render();
  },

  currentStep() {
    return STEPS[this.step];
  },

  selectedFor(stepId) {
    return this.answers[stepId] ?? (STEPS.find(s => s.id === stepId)?.type === 'multi' ? [] : null);
  },

  select(stepId, value) {
    const step = STEPS.find(s => s.id === stepId);
    if (step.type === 'single') {
      this.answers[stepId] = value;
    } else {
      const arr = Array.isArray(this.answers[stepId]) ? [...this.answers[stepId]] : [];
      const idx = arr.indexOf(value);
      if (idx > -1) {
        arr.splice(idx, 1);
      } else {
        const max = step.maxSelect;
        if (max && arr.length >= max) return; // at cap
        arr.push(value);
      }
      this.answers[stepId] = arr;
    }
    this.render();
  },

  isValid() {
    const step = this.currentStep();
    const val = this.selectedFor(step.id);
    if (step.type === 'single') return val !== null;
    const min = step.minSelect ?? 0;
    return Array.isArray(val) && val.length >= min;
  },

  back() {
    if (this.step > 0) {
      this.step--;
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  async next() {
    if (!this.isValid()) return;
    if (this.step < STEPS.length - 1) {
      this.step++;
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await this.submit();
    }
  },

  renderProgress() {
    const total = STEPS.length;

    // Desktop: numbered step dots with connecting lines
    const desktopEl = document.getElementById('stepProgress');
    if (desktopEl) {
      let html = '';
      for (let i = 0; i < total; i++) {
        if (i > 0) {
          html += `<div class="step-line${i <= this.step ? ' done' : ''}"></div>`;
        }
        if (i < this.step) {
          html += `<div class="step-dot completed" title="Step ${i + 1}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          </div>`;
        } else if (i === this.step) {
          html += `<div class="step-dot active">${i + 1}</div>`;
        } else {
          html += `<div class="step-dot upcoming">${i + 1}</div>`;
        }
      }
      desktopEl.innerHTML = html;
    }

    // Mobile: simple bar + text
    const pct = Math.round(((this.step + 1) / total) * 100);
    const mobileFill = document.getElementById('progressFillMobile');
    const mobileCounter = document.getElementById('stepCounterMobile');
    const mobilePct = document.getElementById('stepPctMobile');
    if (mobileFill)    mobileFill.style.width = pct + '%';
    if (mobileCounter) mobileCounter.textContent = `Step ${this.step + 1} of ${total}`;
    if (mobilePct)     mobilePct.textContent = pct + '%';
  },

  render() {
    const step = this.currentStep();

    this.renderProgress();

    // Back button
    const backBtn = document.getElementById('backBtn');
    if (this.step > 0) backBtn.classList.remove('hidden');
    else backBtn.classList.add('hidden');

    // Next button label
    document.getElementById('nextBtnText').textContent =
      this.step === STEPS.length - 1 ? 'Find My Matches' : 'Continue';

    // Next button state
    document.getElementById('nextBtn').disabled = !this.isValid();

    // Resolve selections
    const selected = this.selectedFor(step.id);
    const selectedArr = Array.isArray(selected) ? selected : (selected != null ? [selected] : []);
    const atMax = step.maxSelect && selectedArr.length >= step.maxSelect;

    // Tile style for questions with many options (≥5); list style for ≤4
    const useTile = step.options.length >= 5;
    const cardsHtml = useTile
      ? renderTileCards(step, selectedArr, !!atMax)
      : renderListCards(step, selectedArr, !!atMax);

    const hint = step.maxSelect
      ? `<p class="text-xs text-gray-400 mt-4">Select up to ${step.maxSelect} · ${selectedArr.length} selected</p>`
      : step.type === 'multi'
        ? `<p class="text-xs text-gray-400 mt-4">${selectedArr.length} selected</p>`
        : '';

    document.getElementById('quizContainer').innerHTML = `
      <div class="step-enter">
        <div class="mb-8">
          <p class="text-xs text-gm-500 font-semibold uppercase tracking-widest mb-2">
            Step ${this.step + 1} of ${STEPS.length}
          </p>
          <h2 class="text-2xl sm:text-3xl font-bold text-gm-800 leading-snug mb-2">${step.question}</h2>
          <p class="text-sm text-gray-500">${step.subtitle}</p>
        </div>
        ${cardsHtml}
        ${hint}
      </div>`;
  },

  async submit() {
    const nextBtn = document.getElementById('nextBtn');
    document.getElementById('nextBtnText').textContent = 'Finding matches…';
    document.getElementById('nextSpinner').classList.remove('hidden');
    nextBtn.disabled = true;

    const payload = {
      supporter_type: this.answers['supporter_type'] || 'individual_trustee',
      sectors: this.answers['sectors'] || [],
      engagement: this.answers['engagement'] || [],
      support_scale: this.answers['support_scale'] || 'under_10k',
      geographic_focus: this.answers['geographic_focus'] || 'liechtenstein',
      sdg_priorities: (this.answers['sdg_priorities'] || []).map(Number),
      org_maturity: this.answers['org_maturity'] || 'no_preference',
      legal_form_preference: this.answers['legal_form_preference'] || 'both',
    };

    try {
      const resp = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('Matching failed. Please try again.');
      const results = await resp.json();
      sessionStorage.setItem('matchResults', JSON.stringify(results));
      window.location.href = '/results';
    } catch (err) {
      alert(err.message);
      document.getElementById('nextBtnText').textContent = 'Find My Matches';
      document.getElementById('nextSpinner').classList.add('hidden');
      nextBtn.disabled = false;
    }
  },
};

Quiz.init();
