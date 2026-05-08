const _raw = sessionStorage.getItem('matchResults');
if (!_raw) { window.location.href = '/quiz'; }

const CATEGORY_LABELS = {
  children_youth_families: 'Children, Youth & Families',
  senior_citizens: 'Senior Citizens',
  education: 'Education',
  social_health: 'Social Affairs & Health',
  arts_culture: 'Arts & Culture',
  environment_climate: 'Environment & Climate',
  sport_leisure: 'Sports & Leisure',
  development: 'Global Development',
};

const CATEGORY_COLOURS = {
  children_youth_families: 'bg-blue-100 text-blue-700',
  senior_citizens:         'bg-purple-100 text-purple-700',
  education:               'bg-indigo-100 text-indigo-700',
  social_health:           'bg-rose-100 text-rose-700',
  arts_culture:            'bg-orange-100 text-orange-700',
  environment_climate:     'bg-green-100 text-green-700',
  sport_leisure:           'bg-yellow-100 text-yellow-700',
  development:             'bg-teal-100 text-teal-700',
};

const LEGAL_LABELS = {
  association: 'Verein',
  foundation:  'Stiftung',
};

const GEO_LABELS = {
  liechtenstein: '🇱🇮 Liechtenstein',
  dach:          '🌐 DACH Region',
  international: '🌍 International',
};

const RANK_BADGES = [
  { label: '#1 Match', cls: 'badge-1' },
  { label: '#2 Match', cls: 'badge-2' },
  { label: '#3 Match', cls: 'badge-3' },
  { label: '#4 Match', cls: 'bg-gray-100 text-gray-600' },
  { label: '#5 Match', cls: 'bg-gray-100 text-gray-600' },
];

function circleOffset(pct) {
  const circumference = 2 * Math.PI * 40; // r=40
  return circumference * (1 - pct / 100);
}

function renderCard(result, index) {
  const { ngo, match_percentage, match_reasons } = result;
  const badge = RANK_BADGES[index] || RANK_BADGES[4];
  const catLabel = CATEGORY_LABELS[ngo.category] || ngo.category;
  const catColour = CATEGORY_COLOURS[ngo.category] || 'bg-gray-100 text-gray-600';
  const offset = circleOffset(match_percentage).toFixed(1);
  const circumference = (2 * Math.PI * 40).toFixed(1);
  const legalLabel = LEGAL_LABELS[ngo.legal_form] || ngo.legal_form;
  const geoLabel = GEO_LABELS[ngo.geographic_scope] || ngo.geographic_scope;
  const isTop = index === 0;

  const reasonsHtml = match_reasons.slice(0, 4).map(r =>
    `<li class="flex items-start gap-2 text-sm text-gray-600">
      <svg class="w-4 h-4 text-gm-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <span>${r}</span>
    </li>`
  ).join('');

  const websiteBtn = ngo.website
    ? `<a href="${ngo.website}" target="_blank" rel="noopener" class="text-sm text-gm-600 hover:text-gm-700 font-medium flex items-center gap-1">
        Website
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
      </a>`
    : '';

  return `
    <div class="match-card bg-white rounded-2xl shadow-sm border ${isTop ? 'border-gold' : 'border-gm-100'} overflow-hidden mb-6">
      ${isTop ? '<div class="h-1 bg-gradient-to-r from-gold to-amber-400"></div>' : ''}
      <div class="p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row gap-6">

          <!-- Score circle -->
          <div class="flex-shrink-0 flex flex-col items-center">
            <svg width="96" height="96" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#d8f0e3" stroke-width="8"/>
              <circle cx="50" cy="50" r="40" fill="none"
                stroke="${isTop ? '#c9983a' : '#2d6a4f'}" stroke-width="8"
                stroke-linecap="round"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}"
                transform="rotate(-90 50 50)"
                class="ring-animate"/>
              <text x="50" y="46" text-anchor="middle" font-size="18" font-weight="700" fill="${isTop ? '#c9983a' : '#1e5239'}" font-family="Inter,sans-serif">${match_percentage}%</text>
              <text x="50" y="60" text-anchor="middle" font-size="10" fill="#64748b" font-family="Inter,sans-serif">match</text>
            </svg>
            <span class="${badge.cls} text-xs font-bold px-3 py-1 rounded-full mt-2 ${index < 3 ? 'text-white' : ''}">${badge.label}</span>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="${catColour} text-xs font-semibold px-2.5 py-0.5 rounded-full">${catLabel}</span>
              <span class="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-0.5 rounded-full">${legalLabel}</span>
              <span class="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-0.5 rounded-full">${geoLabel}</span>
            </div>

            <h3 class="text-xl font-bold text-gm-800 mb-2">${ngo.name}</h3>
            <p class="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">${ngo.description}</p>

            <ul class="space-y-1.5 mb-5">${reasonsHtml}</ul>

            <div class="flex flex-wrap items-center gap-4">
              <a href="${ngo.profile_url}" target="_blank" rel="noopener"
                 class="bg-gm-600 hover:bg-gm-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5">
                View Profile on gemeinnuetzig.li
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
              ${websiteBtn}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function render() {
  const results = JSON.parse(_raw);
  if (!results || results.length === 0) {
    document.getElementById('resultsContainer').innerHTML =
      '<p class="text-center text-gray-500 py-12">No matches found. Please try different answers.</p>';
    return;
  }
  document.getElementById('resultsContainer').innerHTML =
    results.map((r, i) => renderCard(r, i)).join('');
}

render();
