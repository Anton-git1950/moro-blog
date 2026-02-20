const POSTS = [
  {
    id: 'akcija-veljaca-01',
    title: 'Akcija: Sjeme povrća -20% (do kraja tjedna)',
    category: 'Akcije',
    date: '2026-02-18',
    excerpt:
      'Popust na odabrano sjeme povrća. Vrijedi do nedjelje ili do isteka zaliha.',
    content: `Akcija ide kratko i jasno:

• -20% na odabrano sjeme povrća
• Vrijedi do nedjelje (ili dok zalihe ne kažu “bye”)
• Ako treba preporuka za sortu — pitaj u dućanu 😄

Lokacija: Filipa Grabovca 72, Sinj`,
  },
  {
    id: 'novitet-gnojivo-02',
    title: 'Novitet: novo organsko gnojivo (top za vrt)',
    category: 'Noviteti',
    date: '2026-02-16',
    excerpt:
      'Stiglo novo organsko gnojivo — super za pripremu zemlje prije sezone.',
    content: `Stiglo novo organsko gnojivo.

Za koga je:
• vrtlari i mali OPG-ovi
• priprema zemlje prije sadnje
• ako želiš “čistu” priču bez kemijskog overkilla`,
  },
  {
    id: 'obavijest-radno',
    title: 'Obavijest: Subota radimo 08:00–13:00',
    category: 'Obavijesti',
    date: '2026-02-10',
    excerpt: 'Subotom smo do 13:00. Ako bude promjena, objavimo ovdje.',
    content: `Standardno subota: 08:00–13:00.

Ako bude izmjena (praznik, inventura…), objavimo u kategoriji “Obavijesti”.`,
  },
  {
    id: 'savjet-zalijevanje',
    title: 'Savjet: 3 greške kod zalijevanja koje ubiju biljku brže od mraza',
    category: 'Savjeti',
    date: '2026-02-05',
    excerpt: 'Previše vode, pogrešno vrijeme i loša drenaža — klasik.',
    content: `Tri greške koje viđamo stalno:

1) Previše vode (korijen se guši)
2) Zalijevanje u krivo vrijeme (jutro > večer)
3) Loša drenaža (ako voda stoji — problem)

Ako kažeš koja kultura, dam konkretnu preporuku.`,
  },
];

const state = {
  q: '',
  cat: 'all',
  sort: 'new',
  page: 1,
  perPage: 6,
  filtered: [],
};
const $ = (id) => document.getElementById(id);

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('hr-HR', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
}
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
function slugToHash(id) {
  return '#post/' + encodeURIComponent(id);
}
function setHashForHome() {
  history.pushState(null, '', '#');
}

function tagClass(cat) {
  if (cat === 'Akcije') return 'red';
  if (cat === 'Noviteti') return 'green';
  if (cat === 'Obavijesti') return 'red';
  return '';
}

/* ===== MODALS ===== */
let lastFocusEl = null;

function openModal(modalId) {
  const modal = $(modalId);
  if (!modal) return;
  lastFocusEl = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const closeBtn = modal.querySelector('[data-close]');
  if (closeBtn) closeBtn.focus();
}

function closeModal(modalId) {
  const modal = $(modalId);
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocusEl && typeof lastFocusEl.focus === 'function')
    lastFocusEl.focus();
}

function wireModals() {
  document.querySelectorAll('[data-close]').forEach((el) => {
    el.addEventListener('click', () =>
      closeModal(el.getAttribute('data-close')),
    );
  });

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = document.querySelector('.modal.open');
    if (open) closeModal(open.id);
  });
}

/* ===== BLOG ===== */
function applyFilters() {
  const q = state.q.trim().toLowerCase();
  let arr = POSTS.slice();

  if (state.cat !== 'all') arr = arr.filter((p) => p.category === state.cat);

  if (q) {
    arr = arr.filter((p) =>
      (p.title + ' ' + p.excerpt + ' ' + p.content + ' ' + p.category)
        .toLowerCase()
        .includes(q),
    );
  }

  if (state.sort === 'new') arr.sort((a, b) => b.date.localeCompare(a.date));
  else if (state.sort === 'old')
    arr.sort((a, b) => a.date.localeCompare(b.date));
  else arr.sort((a, b) => a.title.localeCompare(b.title, 'hr'));

  state.filtered = arr;
  const maxPage = Math.max(1, Math.ceil(arr.length / state.perPage));
  state.page = Math.min(state.page, maxPage);
  renderList();
}

function renderList() {
  $('mainTitle').textContent = 'Novosti';
  $('singleView').classList.remove('active');
  $('listView').classList.add('active');

  const total = state.filtered.length;
  $('countInfo').textContent = total ? `${total} objava` : '0 objava';

  const start = (state.page - 1) * state.perPage;
  const end = start + state.perPage;
  const pageItems = state.filtered.slice(start, end);

  const maxPage = Math.max(1, Math.ceil(total / state.perPage));
  $('pageInfo').textContent = `Stranica ${state.page} / ${maxPage}`;

  $('prevBtn').disabled = state.page <= 1;
  $('nextBtn').disabled = state.page >= maxPage;

  const container = $('posts');
  container.innerHTML = '';

  if (!pageItems.length) {
    container.innerHTML = `
      <div class="post" style="cursor:default;">
        <div class="meta"><span class="tag">Nema rezultata</span></div>
        <h4>Ništa ne matcha.</h4>
        <p>Probaj drugi pojam ili vrati kategoriju na “Sve”.</p>
      </div>
    `;
    return;
  }

  for (const p of pageItems) {
    container.innerHTML += `
      <div class="post" data-open="${escapeHtml(p.id)}">
        <div class="meta">
          <span class="tag ${tagClass(p.category)}">${escapeHtml(p.category)}</span>
          <span>•</span>
          <span>${escapeHtml(formatDate(p.date))}</span>
        </div>
        <h4>${escapeHtml(p.title)}</h4>
        <p>${escapeHtml(p.excerpt)}</p>
      </div>
    `;
  }

  container.querySelectorAll('[data-open]').forEach((el) => {
    el.addEventListener('click', () => openPost(el.getAttribute('data-open')));
  });
}

function openPost(id) {
  const post = POSTS.find((p) => p.id === id);
  if (!post) return;

  $('listView').classList.remove('active');
  $('singleView').classList.add('active');

  $('singleMeta').innerHTML = `
    <span class="tag ${tagClass(post.category)}">${escapeHtml(post.category)}</span>
    <span>•</span>
    <span>${escapeHtml(formatDate(post.date))}</span>
  `;
  $('singleTitle').textContent = post.title;
  $('singleContent').textContent = post.content;

  $('mainTitle').textContent = 'Objava';
  $('countInfo').textContent = '';

  history.pushState(null, '', slugToHash(post.id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() {
  $('singleView').classList.remove('active');
  $('listView').classList.add('active');
  setHashForHome();
  applyFilters();
  return false;
}

function handleRoute() {
  const hash = location.hash || '#';
  if (hash.startsWith('#post/')) {
    const id = decodeURIComponent(hash.replace('#post/', ''));
    openPost(id);
  } else {
    goHome();
  }
}

/* ===== INIT ===== */
function init() {
  $('year').textContent = new Date().getFullYear();
  wireModals();

  $('q').addEventListener('input', (e) => {
    state.q = e.target.value;
    state.page = 1;
    applyFilters();
  });
  $('cat').addEventListener('change', (e) => {
    state.cat = e.target.value;
    state.page = 1;
    applyFilters();
  });
  $('sort').addEventListener('change', (e) => {
    state.sort = e.target.value;
    state.page = 1;
    applyFilters();
  });

  $('prevBtn').addEventListener('click', () => {
    state.page = Math.max(1, state.page - 1);
    renderList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  $('nextBtn').addEventListener('click', () => {
    const maxPage = Math.max(
      1,
      Math.ceil(state.filtered.length / state.perPage),
    );
    state.page = Math.min(maxPage, state.page + 1);
    renderList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  $('backBtn').addEventListener('click', goHome);
  $('homeLink').addEventListener('click', (e) => {
    e.preventDefault();
    goHome();
  });
  $('navNews').addEventListener('click', goHome);
  $('btnLatest').addEventListener('click', () => {
    goHome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const openHoursAll = () => openModal('hoursModal');
  const openContactAll = () => openModal('contactModal');

  // top nav + hero
  $('openHours').addEventListener('click', openHoursAll);
  $('btnHours2').addEventListener('click', openHoursAll);
  $('openContact').addEventListener('click', openContactAll);
  $('btnContact2').addEventListener('click', openContactAll);

  // quick pills + sidebar
  $('quickHours').addEventListener('click', openHoursAll);
  $('openHoursSidebar').addEventListener('click', openHoursAll);
  $('quickContact').addEventListener('click', openContactAll);
  $('openContactSidebar').addEventListener('click', openContactAll);

  // sticky bar
  $('stickHours').addEventListener('click', openHoursAll);
  $('stickContact').addEventListener('click', openContactAll);

  // keyboard for quick pills
  ['quickHours', 'quickContact'].forEach((id) => {
    $(id).addEventListener('keypress', (e) => {
      if (e.key === 'Enter') $(id).click();
    });
  });

  state.filtered = POSTS.slice();
  applyFilters();
  handleRoute();

  window.addEventListener('popstate', handleRoute);
  window.addEventListener('hashchange', handleRoute);
}

document.addEventListener('DOMContentLoaded', init);
