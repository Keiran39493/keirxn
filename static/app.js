// ── Helpers ────────────────────────────────────────────────────────
function slugTag(tag) {
  return tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function tagClass(tag) {
  const map = {
    'vegetarian':        'tag-vegetarian',
    'plant-based':       'tag-plant-based',
    'high protein':      'tag-high-protein',
    'quick':             'tag-quick',
    'breakfast':         'tag-breakfast',
    'good to freeze':    'tag-good-to-freeze',
    'batch cooking':     'tag-batch-cooking',
    'family friendly':   'tag-family-friendly',
    'good on the go':    'tag-good-on-the-go',
    'best for 2 servings': 'tag-best-for-2',
    'refuel meal':       'tag-refuel',
  };
  return map[tag.toLowerCase()] || 'tag-default';
}

function renderStars(rating) {
  if (!rating) return '';
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function parsedSteps(method) {
  return method
    .split(/(?=Step \d+:)/)
    .map(s => s.replace(/^Step \d+:\s*/i, '').trim())
    .filter(Boolean);
}

function timeLabel(mins) {
  if (!mins) return null;
  return mins >= 60
    ? `${Math.floor(mins/60)}h ${mins % 60 ? (mins % 60) + 'm' : ''}`.trim()
    : `${mins} min`;
}

// ── SVG icons ──────────────────────────────────────────────────────
const icons = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
  clock:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  star:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  back:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>`,
  users:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
};

// ── INDEX PAGE ─────────────────────────────────────────────────────
function initIndexPage() {
  const grid       = document.getElementById('recipe-grid');
  const searchEl   = document.getElementById('search');
  const countEl    = document.getElementById('result-count');
  const sortEl     = document.getElementById('sort-select');

  let activeType   = 'all';
  let activeTags   = new Set();
  let searchQuery  = '';
  let sortOrder    = 'name';

  // Build type filter buttons
  const typeRow = document.getElementById('type-filters');
  ['all', ...ALL_TYPES].forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (type === 'all' ? ' active' : '');
    btn.textContent = type === 'all' ? 'All meals' : type;
    btn.dataset.type = type;
    btn.addEventListener('click', () => {
      activeType = type;
      typeRow.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
    typeRow.appendChild(btn);
  });

  // Build tag filter buttons
  const tagRow = document.getElementById('tag-filters');
  ALL_TAGS.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = tag;
    btn.dataset.tag = tag;
    btn.addEventListener('click', () => {
      if (activeTags.has(tag)) {
        activeTags.delete(tag);
        btn.classList.remove('active');
      } else {
        activeTags.add(tag);
        btn.classList.add('active');
      }
      render();
    });
    tagRow.appendChild(btn);
  });

  // Search
  searchEl.addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase().trim();
    render();
  });

  // Sort
  sortEl.addEventListener('change', e => {
    sortOrder = e.target.value;
    render();
  });

  function filteredRecipes() {
    let list = [...RECIPES];

    if (activeType !== 'all') {
      list = list.filter(r => r.type === activeType);
    }
    if (activeTags.size > 0) {
      list = list.filter(r => [...activeTags].every(t => r.tags.includes(t)));
    }
    if (searchQuery) {
      list = list.filter(r =>
        r.name.toLowerCase().includes(searchQuery) ||
        r.tags.some(t => t.toLowerCase().includes(searchQuery)) ||
        r.ingredients.some(i => i.item.toLowerCase().includes(searchQuery))
      );
    }

    list.sort((a, b) => {
      if (sortOrder === 'name')    return a.name.localeCompare(b.name);
      if (sortOrder === 'rating')  return (b.rating || 0) - (a.rating || 0);
      if (sortOrder === 'time')    return (a.time || 999) - (b.time || 999);
      if (sortOrder === 'popular') return (b.numRatings || 0) - (a.numRatings || 0);
      return 0;
    });

    return list;
  }

  function renderCard(recipe) {
    const el = document.createElement('a');
    el.className = 'recipe-card';
    el.href = `recipe.html?id=${recipe.id}`;

    const timeLbl    = timeLabel(recipe.time);
    const ratingHTML = recipe.rating
      ? `<span class="card-meta-item">${icons.star}<span class="rating-stars">${recipe.rating}</span></span>`
      : '';
    const timeHTML = timeLbl
      ? `<span class="card-meta-item">${icons.clock}${timeLbl}</span>`
      : '';
    const tagsHTML = recipe.tags
      .map(t => `<span class="tag ${tagClass(t)}">${t}</span>`)
      .join('');

    el.innerHTML = `
      <div class="card-thumb" style="background:${recipe.gradient}">
        ${recipe.emoji}
        <span class="card-thumb-type">${recipe.type}</span>
      </div>
      <div class="card-body">
        <div class="card-name">${recipe.name}</div>
        <div class="card-meta">
          ${ratingHTML}
          ${timeHTML}
          ${recipe.numRatings ? `<span class="card-meta-item">${recipe.numRatings} reviews</span>` : ''}
        </div>
        ${tagsHTML ? `<div class="card-tags">${tagsHTML}</div>` : ''}
      </div>
    `;
    return el;
  }

  function render() {
    const list = filteredRecipes();
    grid.innerHTML = '';
    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No recipes found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>`;
    } else {
      list.forEach((r, i) => {
        const card = renderCard(r);
        card.style.animationDelay = `${Math.min(i * 30, 200)}ms`;
        grid.appendChild(card);
      });
    }
    countEl.textContent = `${list.length} recipe${list.length !== 1 ? 's' : ''}`;
  }

  render();
}

// ── RECIPE DETAIL PAGE ─────────────────────────────────────────────
function initRecipePage() {
  const params = new URLSearchParams(window.location.search);
  const id     = parseInt(params.get('id'), 10);
  const recipe = RECIPES.find(r => r.id === id);

  if (!recipe) {
    document.body.innerHTML = `<div style="text-align:center;padding:80px 24px"><h2>Recipe not found</h2><a href="index.html">← Back to recipes</a></div>`;
    return;
  }

  document.title = `${recipe.name} — keirxn`;

  const container = document.getElementById('recipe-container');

  const steps    = parsedSteps(recipe.method);
  const stepsHTML = steps.map((s, i) => `
    <div class="method-step">
      <div class="step-num">${i + 1}</div>
      <div class="step-text">${s}</div>
    </div>
  `).join('');

  const ingredientsHTML = recipe.ingredients.map(ing => `
    <div class="ingredient-row">
      <span class="ingredient-amount">${ing.amount || '—'}</span>
      <span class="ingredient-name">${ing.item}</span>
    </div>
  `).join('');

  const tagsHTML = recipe.tags
    .map(t => `<span class="tag ${tagClass(t)}">${t}</span>`)
    .join('');

  const timeLbl = timeLabel(recipe.time);

  container.innerHTML = `
    <div class="recipe-page">
      <a class="back-link" href="index.html">${icons.back} All recipes</a>

      <div class="recipe-hero" style="background:${recipe.gradient}">
        ${recipe.emoji}
      </div>

      <div class="recipe-header">
        <div class="recipe-type-pill">${recipe.type}</div>
        <h1 class="recipe-title">${recipe.name}</h1>

        <div class="recipe-stats">
          ${recipe.rating ? `
            <div class="recipe-stat">
              ${icons.star}
              <strong>${recipe.rating}</strong>
              <span>${recipe.numRatings ? `(${recipe.numRatings} reviews)` : ''}</span>
            </div>` : ''}
          ${timeLbl ? `
            <div class="recipe-stat">
              ${icons.clock}
              <strong>${timeLbl}</strong>
              <span>cook time</span>
            </div>` : ''}
          ${recipe.tags.includes('Best for 2 servings') ? `
            <div class="recipe-stat">
              ${icons.users}
              <strong>Serves 2</strong>
            </div>` : ''}
        </div>

        ${tagsHTML ? `<div class="recipe-tags">${tagsHTML}</div>` : ''}
      </div>

      <div class="recipe-content">
        <div class="ingredients-card">
          <p class="section-heading">Ingredients</p>
          ${ingredientsHTML}
        </div>
        <div class="method-card">
          <p class="section-heading">Method</p>
          ${stepsHTML}
        </div>
      </div>
    </div>
  `;
}

// ── Router ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('recipe-grid')) {
    // Inject search icon
    const iconSlot = document.getElementById('search-icon');
    if (iconSlot) iconSlot.innerHTML = icons.search;
    initIndexPage();
  } else if (document.getElementById('recipe-container')) {
    initRecipePage();
  }
});
