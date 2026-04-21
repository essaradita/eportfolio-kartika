// ===== FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, deleteDoc, collection }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAK82SvboCXeZoiCZru77RWxVtiGk0kPsY",
  authDomain: "eportfolio-kartika.firebaseapp.com",
  projectId: "eportfolio-kartika",
  storageBucket: "eportfolio-kartika.firebasestorage.app",
  messagingSenderId: "670542383458",
  appId: "1:670542383458:web:8b0062fe0158824e1f843b"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const isAdmin = sessionStorage.getItem('ppg_admin') === 'true';

// ===== TYPEWRITER =====
const heroName = document.getElementById('hero-name');
const part1 = 'Kartika ';
const part2 = 'Wulandari, S.Sos';
let i = 0;
function type() {
  if (i < part1.length + part2.length) {
    heroName.innerHTML = i < part1.length
      ? part1.slice(0, i + 1) + '<span></span>'
      : part1 + '<span>' + part2.slice(0, i - part1.length + 1) + '</span>';
    i++;
    setTimeout(type, i === 1 ? 400 : 80);
  } else {
    heroName.innerHTML = part1 + '<span>' + part2 + '<span class="cursor">|</span></span>';
  }
}
type();

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 10
    ? '0 4px 24px rgba(200,150,180,0.18)'
    : '0 2px 16px rgba(200,150,180,0.1)';
});

function toggleMenu() { document.getElementById('navLinks').classList.toggle('open'); }
document.querySelectorAll('.nav-links a').forEach(l =>
  l.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open'))
);

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 80) current = s.id; });
  navLinks.forEach(l => {
    l.classList.remove('active');
    if (l.getAttribute('href') === '#' + current) l.classList.add('active');
  });
});

// ===== SCROLL ANIMATION =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) setTimeout(() => entry.target.classList.add('visible'), i * 80);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ===== TABS =====
function showTab(id, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}

// ===== MODAL =====
function openModal(id) { document.getElementById(id).classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow = ''; }
document.querySelectorAll('.modal-overlay').forEach(o =>
  o.addEventListener('click', e => { if (e.target === o) { o.classList.remove('open'); document.body.style.overflow = ''; } })
);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open')); document.body.style.overflow = ''; }
});

// ===== TOAST =====
function showToast(msg) {
  let t = document.getElementById('ppg-toast');
  if (!t) { t = document.createElement('div'); t.id = 'ppg-toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== EDIT MODE =====
let editMode = false;
const toolbar = document.createElement('div');
toolbar.id = 'edit-toolbar';
toolbar.innerHTML = `<span id="edit-status">✏️ Mode Edit</span><button id="btn-save">💾 Simpan</button><button id="btn-cancel">✕ Batal</button>`;
document.body.appendChild(toolbar);

if (isAdmin) {
  const editBtn = document.createElement('button');
  editBtn.id = 'edit-toggle'; editBtn.title = 'Mode Edit'; editBtn.innerHTML = '✏️';
  document.body.appendChild(editBtn);

  const logoutBtn = document.createElement('button');
  logoutBtn.id = 'logout-btn'; logoutBtn.innerHTML = '🚪';
  logoutBtn.onclick = () => { if (confirm('Keluar dari mode admin?')) { sessionStorage.removeItem('ppg_admin'); location.reload(); } };
  document.body.appendChild(logoutBtn);

  const EDITABLE = 'p, h1, h2, h3, h4, blockquote, cite, td, li, .hero-badge, .subtitle, .section-desc, .tag';

  function enableEdit() {
    editMode = true; toolbar.classList.add('visible'); editBtn.classList.add('active');
    document.querySelectorAll(EDITABLE).forEach(el => {
      if (el.closest('nav, footer, .siklus-tabs, .lampiran-card button, .lampiran-card a, .modal-overlay, #edit-toolbar')) return;
      el.setAttribute('contenteditable', 'true'); el.classList.add('editable-active');
    });
  }

  function disableEdit() {
    editMode = false; toolbar.classList.remove('visible'); editBtn.classList.remove('active');
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      el.removeAttribute('contenteditable'); el.classList.remove('editable-active');
    });
  }

  editBtn.addEventListener('click', () => editMode ? disableEdit() : enableEdit());
  document.getElementById('btn-save').addEventListener('click', disableEdit);
  document.getElementById('btn-cancel').addEventListener('click', disableEdit);
}

// ===== DOKUMEN — FIRESTORE =====
async function renderDocs() {
  try {
    const snap = await getDocs(collection(db, 'dokumen'));
    snap.forEach(d => setDocLink(d.id, d.data().name, d.data().url));
  } catch(e) { console.log('Firestore belum aktif:', e.message); }
}

function setDocLink(id, name, url) {
  const actions = document.getElementById('doc-actions-' + id);
  if (!actions) return;
  const detailBtn = actions.querySelector('.btn-doc:not(.btn-doc-file):not(.btn-doc-del):not(.btn-upload-trigger)');
  const detailHTML = detailBtn ? detailBtn.outerHTML : '';
  const delBtn = isAdmin ? `<button class="btn-doc btn-doc-del" onclick="handleDeleteDoc('${id}')">🗑️</button>` : '';
  actions.innerHTML = detailHTML + `<a class="btn-doc btn-doc-file" href="${url}" target="_blank">📥 ${name}</a>` + delBtn;
}

// Admin: input URL dokumen (Google Drive / link apapun)
function initDocAdmin() {
  for (let id = 1; id <= 4; id++) {
    const actions = document.getElementById('doc-actions-' + id);
    if (!actions) continue;
    const btn = document.createElement('button');
    btn.className = 'btn-doc btn-upload-trigger';
    btn.innerHTML = '🔗 Tambah Link';
    btn.onclick = (function(i) {
      return async () => {
        const url = prompt('Paste link dokumen (Google Drive / PDF URL):');
        if (!url) return;
        const name = prompt('Nama dokumen:', 'Dokumen PPL') || 'Dokumen PPL';
        await setDoc(doc(db, 'dokumen', String(i)), { name, url });
        setDocLink(String(i), name, url);
        showToast('✅ Dokumen disimpan');
      };
    })(id);
    actions.appendChild(btn);
  }
}

async function handleDeleteDoc(id) {
  if (!confirm('Hapus dokumen ini?')) return;
  await deleteDoc(doc(db, 'dokumen', String(id)));
  const actions = document.getElementById('doc-actions-' + id);
  const detailBtn = actions.querySelector('.btn-doc:not(.btn-doc-file):not(.btn-doc-del):not(.btn-upload-trigger)');
  actions.innerHTML = (detailBtn ? detailBtn.outerHTML : '<span class="doc-empty-note">Belum ada dokumen</span>') +
    `<button class="btn-doc btn-upload-trigger" onclick="this.closest('.doc-actions').previousSibling">🔗 Tambah Link</button>`;
  showToast('🗑️ Dokumen dihapus');
  initDocAdmin();
}

// ===== GALERI — FIRESTORE + URL =====
let galeriNextId = 9;

async function renderGaleri() {
  try {
    const snap = await getDocs(collection(db, 'galeri'));
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    items.forEach(g => {
      const existing = document.querySelector(`.galeri-item[data-galeri-id="${g.id}"]`);
      if (existing) applyGaleriPhoto(existing, g.url, g.caption);
      else { addGaleriItem(g.id, g.url, g.caption); const n = parseInt(g.id); if (n >= galeriNextId) galeriNextId = n + 1; }
    });
  } catch(e) { console.log('Firestore belum aktif:', e.message); }
}

function applyGaleriPhoto(item, url, caption) {
  item.innerHTML = `<img src="${url}" alt="${caption}" /><div class="galeri-overlay">${caption}</div>`;
}

function addGaleriItem(id, url, caption) {
  const grid = document.getElementById('galeri-grid');
  const div = document.createElement('div');
  div.className = 'galeri-item'; div.dataset.galeriId = id;
  div.innerHTML = `<img src="${url}" alt="${caption}" /><div class="galeri-overlay">${caption}</div>`;
  grid.appendChild(div);
  if (isAdmin) bindGaleriAdmin(div);
}

function bindGaleriAdmin(item) {
  const id = item.dataset.galeriId;
  item.style.cursor = 'pointer';
  item.addEventListener('click', async () => {
    const url = prompt('Paste URL foto (Google Drive, Imgur, dll):\n\nTips Google Drive: klik kanan foto → Get link → ubah ke:\nhttps://drive.google.com/uc?id=FILE_ID');
    if (!url) return;
    const caption = prompt('Keterangan foto:', item.querySelector('.galeri-overlay')?.textContent || '') || 'Dokumentasi PPL';
    await setDoc(doc(db, 'galeri', String(id)), { url, caption, order: parseInt(id) });
    applyGaleriPhoto(item, url, caption);
    showToast('✅ Foto disimpan');
  });

  if (parseInt(id) >= 9) {
    item.addEventListener('contextmenu', async e => {
      e.preventDefault();
      if (!confirm('Hapus foto ini?')) return;
      await deleteDoc(doc(db, 'galeri', String(id)));
      item.remove();
      showToast('🗑️ Foto dihapus');
    });
  }
}

async function handleGaleriAdd() {
  const url = prompt('Paste URL foto:');
  if (!url) return;
  const caption = prompt('Keterangan foto:') || 'Dokumentasi PPL';
  const id = String(galeriNextId++);
  await setDoc(doc(db, 'galeri', id), { url, caption, order: parseInt(id) });
  addGaleriItem(id, url, caption);
  showToast('✅ Foto ditambahkan');
}

function initGaleriAdmin() {
  document.getElementById('galeri-admin-bar').style.display = 'block';
  document.querySelectorAll('.galeri-item').forEach(item => bindGaleriAdmin(item));
  // Ganti tombol tambah foto agar pakai URL
  const addBtn = document.querySelector('#galeri-admin-bar .btn-primary');
  if (addBtn) { addBtn.onclick = handleGaleriAdd; addBtn.innerHTML = '➕ Tambah Foto (URL)'; }
}

// ===== INIT =====
renderDocs();
renderGaleri();
if (isAdmin) { initDocAdmin(); initGaleriAdmin(); }
