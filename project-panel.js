const grid = document.getElementById('panelGrid');
const empty = document.getElementById('panelEmpty');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const toast = document.getElementById('toast');

let opportunities = [];

// Fallback sample data so the panel still demos correctly before the
// PHP backend / database is wired up.
const FALLBACK = [
  {
    id: 1, title: 'Smart India Hackathon 2026', category: 'Hackathon',
    company: 'Ministry of Education', description: 'National hackathon for student teams to solve real government and industry problem statements.',
    registration_link: 'https://sih.gov.in', last_date: addDays(12), location: 'Offline', posted_by: 'Placement Cell',
  },
  {
    id: 2, title: 'Google Summer Internship', category: 'Internship',
    company: 'Google', description: 'A 12-week paid internship for pre-final year students across engineering and design roles.',
    registration_link: 'https://careers.google.com', last_date: addDays(5), location: 'Online', posted_by: 'Faculty Coordinator',
  },
  {
    id: 3, title: 'AWS Cloud Workshop', category: 'Workshop',
    company: 'Amazon Web Services', description: 'Hands-on session covering EC2, S3, and deploying your first cloud application.',
    registration_link: 'https://aws.amazon.com/events', last_date: addDays(2), location: 'Online', posted_by: 'Priya Sharma',
  },
];

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

async function loadOpportunities() {
  try {
    const res = await fetch('backend/list_opportunities.php');
    if (!res.ok) throw new Error('backend unavailable');
    const data = await res.json();
    opportunities = data.opportunities || [];
    if (opportunities.length === 0) opportunities = FALLBACK;
  } catch {
    opportunities = FALLBACK;
  }
  render();
}

function daysLeftLabel(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  const days = Math.ceil((target - today) / 86400000);
  if (days < 0) return 'Closed';
  if (days === 0) return 'Closes today';
  return days + 'd left';
}

function render() {
  const term = searchInput.value.trim().toLowerCase();
  const cat = categoryFilter.value;
  const sort = sortFilter.value;

  let list = opportunities.filter(o => {
    const matchesTerm = !term || o.title.toLowerCase().includes(term) || o.company.toLowerCase().includes(term);
    const matchesCat = !cat || o.category === cat;
    return matchesTerm && matchesCat;
  });

  list = list.slice().sort((a, b) => {
    if (sort === 'newest') return (b.id || 0) - (a.id || 0);
    return new Date(a.last_date) - new Date(b.last_date);
  });

  grid.innerHTML = '';
  empty.hidden = list.length !== 0;

  list.forEach(o => grid.appendChild(buildCard(o)));
}

function buildCard(o) {
  const card = document.createElement('article');
  card.className = 'opp-card';

  card.innerHTML = `
    <span class="chip category-chip">${escapeHtml(o.category)}</span>
    <h3>${escapeHtml(o.title)}</h3>
    <p class="opp-company">${escapeHtml(o.company)}</p>
    <p class="opp-desc">${escapeHtml(o.description)}</p>
    <div class="opp-meta">
      <span>${escapeHtml(o.location)}</span>
      <span>${daysLeftLabel(o.last_date)}</span>
    </div>
    <div class="opp-actions">
      <a class="apply-btn" href="${escapeAttr(o.registration_link)}" target="_blank" rel="noopener">Apply</a>
      <button class="share-btn" title="Share on X" data-share="x">${iconX}</button>
      <button class="share-btn" title="Share on Instagram" data-share="instagram">${iconInstagram}</button>
    </div>
  `;

  card.querySelector('[data-share="x"]').addEventListener('click', () => shareOnX(o));
  card.querySelector('[data-share="instagram"]').addEventListener('click', () => shareOnInstagram(o));

  return card;
}

function shareText(o) {
  return `${o.title} — ${o.category} by ${o.company}. Apply before ${o.last_date}.`;
}

function shareOnX(o) {
  const text = shareText(o);
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(o.registration_link)}`;
  window.open(url, '_blank', 'noopener');
}

function shareOnInstagram(o) {
  // Instagram has no public web intent for posting — the standard pattern
  // is to copy a ready-made caption and hand off to the Instagram app/site.
  const caption = `${shareText(o)}\n${o.registration_link}\n#CampusConnect #${o.category.replace(/\s+/g, '')}`;
  navigator.clipboard.writeText(caption).then(() => {
    showToast('Caption copied — paste it into your Instagram post');
    window.open('https://www.instagram.com', '_blank', 'noopener');
  }).catch(() => {
    showToast('Could not copy caption — copy it manually');
  });
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function escapeAttr(str) { return escapeHtml(str); }

const iconX = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.6 8.7L23.3 22H16.9l-5-6.6L6 22H2.9l8.1-9.3L1.2 2H7.8l4.5 6.1L18.9 2Zm-1.2 18h1.7L7.3 4H5.5l12.2 16Z"/></svg>`;
const iconInstagram = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>`;

searchInput.addEventListener('input', render);
categoryFilter.addEventListener('change', render);
sortFilter.addEventListener('change', render);

loadOpportunities();
