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
if (isAdmin) document.body.classList.add('ppg-admin');

// ===== CLOUDINARY =====
const CLOUD_NAME   = 'dsy1ynttp';
const UPLOAD_PRESET = 'eportfolio';

async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', 'eportfolio');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: 'POST', body: fd
  });
  if (!res.ok) throw new Error('Upload gagal');
  const data = await res.json();
  return data.secure_url;
}

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
document.getElementById('hamburger-btn').addEventListener('click', toggleMenu);
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
window.showTab = showTab;

// ===== MODAL =====
function openModal(id) { document.getElementById(id).classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow = ''; }
window.openModal = openModal;
window.closeModal = closeModal;
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

// Admin: input file dokumen langsung upload ke Cloudinary
function initDocAdmin() {
  for (let id = 1; id <= 4; id++) {
    const actions = document.getElementById('doc-actions-' + id);
    if (!actions) continue;
    const btn = document.createElement('button');
    btn.className = 'btn-doc btn-upload-trigger';
    btn.innerHTML = '� Upload Dokumen';
    btn.onclick = (function(i) {
      return () => {
        const inp = document.createElement('input');
        inp.type = 'file'; inp.accept = '.pdf,.doc,.docx,.ppt,.pptx';
        inp.onchange = async () => {
          const file = inp.files[0];
          if (!file) return;
          if (file.size > 20 * 1024 * 1024) { alert('❌ Maksimal 20MB'); return; }
          showToast('⏳ Mengupload dokumen...');
          try {
            const url = await uploadToCloudinary(file);
            await setDoc(doc(db, 'dokumen', String(i)), { name: file.name, url });
            setDocLink(String(i), file.name, url);
            showToast('✅ Dokumen berhasil diupload');
          } catch(e) { showToast('❌ Gagal: ' + e.message); }
        };
        inp.click();
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
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = async () => {
      const file = inp.files[0];
      if (!file) return;
      const caption = prompt('Keterangan foto:', item.querySelector('.galeri-overlay')?.textContent || '') || 'Dokumentasi PPL';
      showToast('⏳ Mengupload foto...');
      try {
        const url = await uploadToCloudinary(file);
        await setDoc(doc(db, 'galeri', String(id)), { url, caption, order: parseInt(id) });
        applyGaleriPhoto(item, url, caption);
        showToast('✅ Foto berhasil diupload');
      } catch(e) { showToast('❌ Gagal: ' + e.message); }
    };
    inp.click();
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
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true;
  inp.onchange = async () => {
    for (const file of Array.from(inp.files)) {
      const caption = prompt('Keterangan foto:', file.name.replace(/\.[^.]+$/, '')) || 'Dokumentasi PPL';
      const id = String(galeriNextId++);
      showToast('⏳ Mengupload foto...');
      try {
        const url = await uploadToCloudinary(file);
        await setDoc(doc(db, 'galeri', id), { url, caption, order: parseInt(id) });
        addGaleriItem(id, url, caption);
        showToast('✅ Foto ditambahkan');
      } catch(e) { showToast('❌ Gagal: ' + e.message); }
    }
  };
  inp.click();
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

// Expose ke window untuk onclick di HTML
window.handleDeleteDoc = handleDeleteDoc;
window.handleGaleriAdd = handleGaleriAdd;

// ===== PROFIL TABS =====
function switchProfilTab(id, btn) {
  document.querySelectorAll('.profil-tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.profil-tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}
window.switchProfilTab = switchProfilTab;

// ===== ID CARD DRAG + ELASTIC LANYARD =====
const card = document.getElementById('idCard');
const wrapper = card ? card.closest('.id-card-wrapper') : null;

if (card && wrapper) {
  // Ganti string statis dengan SVG canvas untuk tali elastis
  const stringEl = wrapper.querySelector('.id-card-string');
  if (stringEl) stringEl.style.display = 'none';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'lanyard-svg';
  svg.style.cssText = 'position:absolute;top:0;left:50%;transform:translateX(-50%);pointer-events:none;overflow:visible;z-index:0;';
  svg.setAttribute('width', '40');
  svg.setAttribute('height', '80');
  wrapper.style.position = 'relative';
  wrapper.insertBefore(svg, card);

  // Klip logam
  const clip = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
  clip.setAttribute('cx', '20'); clip.setAttribute('cy', '8');
  clip.setAttribute('rx', '8'); clip.setAttribute('ry', '6');
  clip.setAttribute('fill', 'none');
  clip.setAttribute('stroke', '#b0b0b0');
  clip.setAttribute('stroke-width', '3');
  svg.appendChild(clip);

  // Tali
  const rope = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  rope.setAttribute('stroke', '#e8789a');
  rope.setAttribute('stroke-width', '8');
  rope.setAttribute('stroke-linecap', 'round');
  rope.setAttribute('fill', 'none');
  rope.setAttribute('opacity', '0.85');
  svg.appendChild(rope);

  // Tali highlight
  const ropeHL = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  ropeHL.setAttribute('stroke', '#ffc0d4');
  ropeHL.setAttribute('stroke-width', '3');
  ropeHL.setAttribute('stroke-linecap', 'round');
  ropeHL.setAttribute('fill', 'none');
  ropeHL.setAttribute('opacity', '0.6');
  svg.appendChild(ropeHL);

  function updateRope(offsetY) {
    const h = Math.max(60, 60 + offsetY * 0.5);
    svg.setAttribute('height', h + 20);
    const d = `M 20 14 Q 20 ${h * 0.6} 20 ${h}`;
    rope.setAttribute('d', d);
    ropeHL.setAttribute('d', d);
  }

  updateRope(0);

  let isDragging = false, startX, startY, curX = 0, curY = 0;

  const onStart = (cx, cy) => {
    isDragging = true;
    startX = cx - curX;
    startY = cy - curY;
    card.classList.add('dragging');
    card.style.transition = '';
  };

  const onMove = (cx, cy) => {
    if (!isDragging) return;
    curX = cx - startX;
    curY = cy - startY;
    card.style.transform = `translate(${curX}px, ${curY}px) rotate(${curX * 0.04}deg)`;
    updateRope(Math.max(0, curY));
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('dragging');
    card.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    card.style.transform = 'translate(0,0) rotate(0deg)';
    curX = 0; curY = 0;

    // Animasi tali balik
    let t = 0;
    const animRope = setInterval(() => {
      t += 0.1;
      const bounce = Math.sin(t * Math.PI) * 20 * Math.exp(-t * 0.8);
      updateRope(Math.max(0, bounce));
      if (t > 3) { clearInterval(animRope); updateRope(0); }
    }, 16);

    setTimeout(() => card.style.transition = '', 600);
  };

  card.addEventListener('mousedown', e => onStart(e.clientX, e.clientY));
  card.addEventListener('touchstart', e => onStart(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  document.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
  document.addEventListener('touchmove', e => onMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);
}

// ===== HOBI FOTO =====
const hobiData = {
  '1': { nama: 'Running', emoji: '🏃‍♀️', desc: 'Running adalah cara saya menjaga kesehatan fisik dan mental. Berlari setiap pagi membantu saya memulai hari dengan semangat dan pikiran yang jernih — energi yang sangat saya butuhkan sebagai calon pendidik.' },
  '2': { nama: 'Menulis', emoji: '✍️', desc: 'Menulis adalah cara saya mengekspresikan pikiran dan perasaan. Dari jurnal harian hingga esai pendidikan, menulis membantu saya merefleksikan pengalaman belajar.' },
  '3': { nama: 'Menggambar', emoji: '🎨', desc: 'Menggambar melatih kreativitas dan kesabaran. Saya sering membuat ilustrasi sederhana untuk media pembelajaran yang lebih menarik bagi siswa.' },
  '4': { nama: 'Berkebun', emoji: '🌿', desc: 'Berkebun mengajarkan saya tentang kesabaran dan ketekunan. Merawat tanaman adalah metafora indah untuk mendidik — keduanya butuh perhatian dan kasih sayang.' },
  '5': { nama: 'Mendengarkan Musik', emoji: '🎵', desc: 'Musik adalah teman setia saat belajar dan bekerja. Saya percaya musik dapat menciptakan suasana belajar yang lebih nyaman dan menyenangkan.' },
  '6': { nama: 'Memasak', emoji: '🧁', desc: 'Memasak adalah seni yang mengajarkan kreativitas dan ketelitian. Seperti merancang pembelajaran, memasak butuh perencanaan yang matang dan sentuhan personal.' }
};

let currentHobiId = null;

async function loadHobiPhotos() {
  try {
    const snap = await getDocs(collection(db, 'hobi'));
    snap.forEach(d => {
      const { id, photos, coverUrl } = d.data();
      // Update cover di grid
      const item = document.querySelector(`.hobi-item[data-hobi-id="${id}"]`);
      if (item && coverUrl) {
        const wrap = item.querySelector('.hobi-photo-wrap');
        wrap.innerHTML = `<img src="${coverUrl}" alt="${hobiData[id]?.nama}" /><div class="hobi-upload-overlay">🔍</div>`;
      }
    });
  } catch(e) { console.log('Hobi load:', e.message); }
}

function openHobiModal(id) {
  currentHobiId = id;
  const data = hobiData[id];
  document.getElementById('hobi-modal-title').textContent = data.emoji + ' ' + data.nama;
  document.getElementById('hobi-modal-desc').textContent = data.desc;

  // Load 3 foto dari Firestore
  const gallery = document.getElementById('hobi-gallery');
  gallery.innerHTML = '';
  for (let slot = 1; slot <= 3; slot++) {
    const item = document.createElement('div');
    item.className = 'hobi-gallery-item';
    item.dataset.slot = slot;
    item.innerHTML = `<span class="hobi-gallery-placeholder">📷</span>${isAdmin ? '<div class="hobi-gallery-upload-hint">📎 Upload Foto</div>' : ''}`;
    if (isAdmin) {
      item.addEventListener('click', () => uploadHobiPhoto(id, slot, item));
    }
    gallery.appendChild(item);
  }

  // Load foto dari Firestore
  loadHobiGallery(id);
  openModal('modal-hobi');
}
window.openHobiModal = openHobiModal;

async function loadHobiGallery(id) {
  try {
    const snap = await getDocs(collection(db, `hobi_photos_${id}`));
    snap.forEach(d => {
      const { slot, url } = d.data();
      const item = document.querySelector(`#hobi-gallery [data-slot="${slot}"]`);
      if (item) {
        item.innerHTML = `<img src="${url}" alt="Hobi ${slot}" />${isAdmin ? '<div class="hobi-gallery-upload-hint">🔄 Ganti Foto</div>' : ''}`;
      }
    });
  } catch(e) {}
}

async function uploadHobiPhoto(hobiId, slot, itemEl) {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = async () => {
    const file = inp.files[0];
    if (!file) return;
    showToast('⏳ Mengupload foto...');
    try {
      const url = await uploadToCloudinary(file);
      await setDoc(doc(db, `hobi_photos_${hobiId}`, String(slot)), { slot, url });
      itemEl.innerHTML = `<img src="${url}" alt="Hobi ${slot}" /><div class="hobi-gallery-upload-hint">🔄 Ganti Foto</div>`;

      // Update cover jika slot 1
      if (slot === 1) {
        await setDoc(doc(db, 'hobi', hobiId), { id: hobiId, coverUrl: url });
        const gridItem = document.querySelector(`.hobi-item[data-hobi-id="${hobiId}"] .hobi-photo-wrap`);
        if (gridItem) gridItem.innerHTML = `<img src="${url}" alt="${hobiData[hobiId]?.nama}" /><div class="hobi-upload-overlay">🔍</div>`;
      }
      showToast('✅ Foto berhasil diupload');
    } catch(e) { showToast('❌ Gagal: ' + e.message); }
  };
  inp.click();
}

// ===== ID CARD GANTI FOTO (admin) =====
function initIdCardAdmin() {
  const card = document.getElementById('idCard');
  if (!card) return;

  // Tambah hint overlay
  const hint = document.createElement('div');
  hint.className = 'id-card-change-hint';
  hint.innerHTML = '📷 Ganti Foto';
  card.insertBefore(hint, card.firstChild);

  hint.addEventListener('click', async () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = async () => {
      const file = inp.files[0];
      if (!file) return;
      showToast('⏳ Mengupload foto...');
      try {
        const url = await uploadToCloudinary(file);
        await setDoc(doc(db, 'settings', 'idcard'), { photoUrl: url });
        document.getElementById('id-card-img').src = url;
        showToast('✅ Foto ID card diperbarui');
      } catch(e) { showToast('❌ Gagal: ' + e.message); }
    };
    inp.click();
  });
}

async function loadIdCardPhoto() {
  try {
    const snap = await getDocs(collection(db, 'settings'));
    snap.forEach(d => {
      if (d.id === 'idcard' && d.data().photoUrl) {
        const img = document.getElementById('id-card-img');
        if (img) img.src = d.data().photoUrl;
      }
    });
  } catch(e) {}
}

// Init
loadHobiPhotos();
loadIdCardPhoto();
if (isAdmin) initIdCardAdmin();

// ===== HOBI CLICK HANDLER =====
function hobiClick(id) {
  if (sessionStorage.getItem('ppg_admin') === 'true') {
    // Admin: langsung upload cover foto
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = async () => {
      const file = inp.files[0];
      if (!file) return;
      showToast('⏳ Mengupload foto hobi...');
      try {
        const url = await uploadToCloudinary(file);
        await setDoc(doc(db, 'hobi', id), { id, coverUrl: url });
        const wrap = document.querySelector(`.hobi-item[data-hobi-id="${id}"] .hobi-photo-wrap`);
        if (wrap) wrap.innerHTML = `<img src="${url}" alt="${hobiData[id]?.nama}" /><div class="hobi-upload-overlay">🔄 Ganti</div>`;
        showToast('✅ Foto hobi diupload');
      } catch(e) { showToast('❌ Gagal: ' + e.message); }
    };
    inp.click();
  } else {
    // Pengunjung: buka modal
    openHobiModal(id);
  }
}
window.hobiClick = hobiClick;
