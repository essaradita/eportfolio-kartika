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
const CLOUD_NAME    = 'dsy1ynttp';
const UPLOAD_PRESET = 'eportfolio';

async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', 'eportfolio');
  // file non-gambar (ppt, docx, pdf, dll) pakai resource_type raw
  const isImage = file.type.startsWith('image/');
  const resourceType = isImage ? 'image' : 'raw';
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, { method: 'POST', body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Upload gagal');
  }
  return (await res.json()).secure_url;
}

// ===== TYPEWRITER =====
const heroName = document.getElementById('hero-name');
let charIdx = 0, deleting = false;
const typeText = 'Wulandari, S.Sos';
function typeLoop() {
  if (!deleting) {
    charIdx++;
    heroName.innerHTML = 'Kartika<br><span>' + typeText.slice(0, charIdx) + '</span>';
    if (charIdx === typeText.length) { setTimeout(() => { deleting = true; typeLoop(); }, 2500); return; }
    setTimeout(typeLoop, 80);
  } else {
    charIdx--;
    heroName.innerHTML = 'Kartika<br><span>' + typeText.slice(0, charIdx) + '</span>';
    if (charIdx === 0) { deleting = false; setTimeout(typeLoop, 400); return; }
    setTimeout(typeLoop, 40);
  }
}
typeLoop();

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 10 ? '0 4px 24px rgba(200,150,180,0.18)' : '0 2px 16px rgba(200,150,180,0.1)';
});
function toggleMenu() { document.getElementById('navLinks').classList.toggle('open'); }
window.toggleMenu = toggleMenu;
document.getElementById('hamburger-btn').addEventListener('click', toggleMenu);
document.querySelectorAll('.nav-links a').forEach(l => l.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open')));

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 80) current = s.id; });
  navLinks.forEach(l => { l.classList.remove('active'); if (l.getAttribute('href') === '#' + current) l.classList.add('active'); });
});

// ===== SCROLL ANIMATION =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => { if (entry.isIntersecting) setTimeout(() => entry.target.classList.add('visible'), i * 80); });
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

function switchProfilTab(id, btn) {
  document.querySelectorAll('.profil-tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.profil-tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}
window.switchProfilTab = switchProfilTab;

// ===== MODAL =====
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
  if (id === 'modal-video') initVideo();
  if (id === 'modal-rpl') loadRplDocs();
}
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
toolbar.innerHTML = `<span>✏️ Mode Edit</span><button id="btn-save">💾 Simpan</button><button id="btn-cancel">✕ Batal</button>`;
document.body.appendChild(toolbar);

if (isAdmin) {
  const editBtn = document.createElement('button');
  editBtn.id = 'edit-toggle'; editBtn.innerHTML = '✏️';
  document.body.appendChild(editBtn);

  const logoutBtn = document.createElement('button');
  logoutBtn.id = 'logout-btn'; logoutBtn.innerHTML = '🚪';
  logoutBtn.onclick = () => { if (confirm('Keluar dari mode admin?')) { sessionStorage.removeItem('ppg_admin'); location.reload(); } };
  document.body.appendChild(logoutBtn);

  const EDITABLE = 'p, h1, h2, h3, h4, blockquote, cite, td, li, .hero-badge, .subtitle, .section-desc';
  function enableEdit() {
    editMode = true; toolbar.classList.add('visible'); editBtn.classList.add('active');
    document.querySelectorAll(EDITABLE).forEach(el => {
      if (el.closest('nav, footer, .siklus-tabs, .modal-overlay, #edit-toolbar')) return;
      el.setAttribute('contenteditable', 'true'); el.classList.add('editable-active');
    });
  }
  function disableEdit() {
    editMode = false; toolbar.classList.remove('visible'); editBtn.classList.remove('active');
    document.querySelectorAll('[contenteditable="true"]').forEach(el => { el.removeAttribute('contenteditable'); el.classList.remove('editable-active'); });
  }
  editBtn.addEventListener('click', () => editMode ? disableEdit() : enableEdit());
  document.getElementById('btn-save').addEventListener('click', disableEdit);
  document.getElementById('btn-cancel').addEventListener('click', disableEdit);
}

// ===== DOKUMEN =====
async function renderDocs() {
  try {
    const snap = await getDocs(collection(db, 'dokumen'));
    snap.forEach(d => setDocLink(d.id, d.data().name, d.data().url));
  } catch(e) {}
}

function setDocLink(id, name, url) {
  const actions = document.getElementById('doc-actions-' + id);
  if (!actions) return;
  const detailBtn = actions.querySelector('.btn-doc:not(.btn-doc-file):not(.btn-doc-del):not(.btn-upload-trigger)');
  const detailHTML = detailBtn ? detailBtn.outerHTML : '';
  const delBtn = isAdmin ? `<button class="btn-doc btn-doc-del" onclick="handleDeleteDoc('${id}')">🗑️</button>` : '';
  actions.innerHTML = detailHTML + delBtn;
  const modalView = document.getElementById('modal-doc-view-' + id);
  if (modalView) {
    modalView.innerHTML = `
      <div class="modal-doc-file-info"><span class="modal-doc-icon">📄</span><div class="modal-doc-filename">${name}</div></div>
      <div style="display:flex;gap:0.75rem;justify-content:center;margin-top:1.25rem;flex-wrap:wrap;">
        <a href="${url}" target="_blank" class="btn-doc" style="background:var(--lavender-light);color:#7b5ea7;">👁️ Buka Dokumen</a>
        <a href="${url}" download="${name}" class="btn-doc btn-doc-file">📥 Download</a>
      </div>`;
  }
}

function initDocAdmin() {
  for (let id = 1; id <= 4; id++) {
    const actions = document.getElementById('doc-actions-' + id);
    if (!actions) continue;
    const btn = document.createElement('button');
    btn.className = 'btn-doc btn-upload-trigger';
    btn.innerHTML = '📎 Upload';
    btn.onclick = (function(i) {
      return () => {
        const inp = document.createElement('input');
        inp.type = 'file'; inp.accept = '.pdf,.doc,.docx,.ppt,.pptx';
        inp.onchange = async () => {
          const file = inp.files[0]; if (!file) return;
          showToast('⏳ Mengupload...');
          try {
            const url = await uploadToCloudinary(file);
            await setDoc(doc(db, 'dokumen', String(i)), { name: file.name, url });
            setDocLink(String(i), file.name, url);
            showToast('✅ Dokumen diupload');
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
  actions.innerHTML = (detailBtn ? detailBtn.outerHTML : '') + `<span class="doc-empty-note">Belum ada dokumen</span>`;
  initDocAdmin();
  showToast('🗑️ Dihapus');
}
window.handleDeleteDoc = handleDeleteDoc;

// ===== GALERI =====
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
  } catch(e) {}
}

function applyGaleriPhoto(item, url, caption) {
  const id = item.dataset.galeriId;
  const canDelete = isAdmin && parseInt(id) >= 9;
  item.innerHTML = `<img src="${url}" alt="${caption}" /><div class="galeri-overlay">${caption}</div>${isAdmin ? `<div class="galeri-admin-btns"><button class="galeri-btn-change" title="Ganti foto">📷</button>${canDelete ? `<button class="galeri-btn-del" title="Hapus foto">🗑️</button>` : ''}</div>` : ''}`;
  if (isAdmin) {
    item.querySelector('.galeri-btn-change').addEventListener('click', e => { e.stopPropagation(); triggerGaleriUpload(item); });
    if (canDelete) item.querySelector('.galeri-btn-del').addEventListener('click', async e => {
      e.stopPropagation();
      if (!confirm('Hapus foto ini?')) return;
      await deleteDoc(doc(db, 'galeri', String(id)));
      item.remove(); showToast('🗑️ Foto dihapus');
    });
  }
}

function addGaleriItem(id, url, caption) {
  const grid = document.getElementById('galeri-grid');
  const div = document.createElement('div');
  div.className = 'galeri-item'; div.dataset.galeriId = id;
  div.innerHTML = `<img src="${url}" alt="${caption}" /><div class="galeri-overlay">${caption}</div>`;
  grid.appendChild(div);
  if (isAdmin) bindGaleriAdmin(div);
}

function triggerGaleriUpload(item) {
  const id = item.dataset.galeriId;
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = async () => {
    const file = inp.files[0]; if (!file) return;
    const caption = prompt('Keterangan foto:', item.querySelector('.galeri-overlay')?.textContent || '') || 'Dokumentasi PPL';
    showToast('⏳ Mengupload...');
    try {
      const url = await uploadToCloudinary(file);
      await setDoc(doc(db, 'galeri', String(id)), { url, caption, order: parseInt(id) });
      applyGaleriPhoto(item, url, caption);
      showToast('✅ Foto diupload');
    } catch(e) { showToast('❌ Gagal: ' + e.message); }
  };
  inp.click();
}

function bindGaleriAdmin(item) {
  const id = item.dataset.galeriId;
  item.style.cursor = 'pointer';
  // klik area kosong (emoji) → upload
  item.addEventListener('click', e => {
    if (e.target.closest('.galeri-admin-btns')) return;
    if (!item.querySelector('img')) triggerGaleriUpload(item);
  });
}

async function handleGaleriAdd() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true;
  inp.onchange = async () => {
    for (const file of Array.from(inp.files)) {
      const caption = prompt('Keterangan foto:', file.name.replace(/\.[^.]+$/, '')) || 'Dokumentasi PPL';
      const id = String(galeriNextId++);
      showToast('⏳ Mengupload...');
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
window.handleGaleriAdd = handleGaleriAdd;

function initGaleriAdmin() {
  document.getElementById('galeri-admin-bar').style.display = 'block';
  document.querySelectorAll('.galeri-item').forEach(item => bindGaleriAdmin(item));
  const addBtn = document.querySelector('#galeri-admin-bar .btn-primary');
  if (addBtn) { addBtn.onclick = handleGaleriAdd; addBtn.innerHTML = '➕ Tambah Foto'; }
}

// ===== ID CARD DRAG =====
const card = document.getElementById('idCard');
const wrapper = card ? card.closest('.id-card-wrapper') : null;
if (card && wrapper) {
  const stringEl = wrapper.querySelector('.id-card-string');
  if (stringEl) stringEl.style.display = 'none';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'lanyard-svg';
  svg.style.cssText = 'position:absolute;top:0;left:50%;transform:translateX(-50%);pointer-events:none;overflow:visible;z-index:0;';
  svg.setAttribute('width', '40'); svg.setAttribute('height', '80');
  wrapper.style.position = 'relative';
  wrapper.insertBefore(svg, card);
  const clip = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
  clip.setAttribute('cx','20'); clip.setAttribute('cy','8'); clip.setAttribute('rx','8'); clip.setAttribute('ry','6');
  clip.setAttribute('fill','none'); clip.setAttribute('stroke','#b0b0b0'); clip.setAttribute('stroke-width','3');
  svg.appendChild(clip);
  const rope = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  rope.setAttribute('stroke','#e8789a'); rope.setAttribute('stroke-width','8');
  rope.setAttribute('stroke-linecap','round'); rope.setAttribute('fill','none'); rope.setAttribute('opacity','0.85');
  svg.appendChild(rope);
  const ropeHL = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  ropeHL.setAttribute('stroke','#ffc0d4'); ropeHL.setAttribute('stroke-width','3');
  ropeHL.setAttribute('stroke-linecap','round'); ropeHL.setAttribute('fill','none'); ropeHL.setAttribute('opacity','0.6');
  svg.appendChild(ropeHL);
  function updateRope(offsetY) {
    const h = Math.max(60, 60 + offsetY * 0.5);
    svg.setAttribute('height', h + 20);
    const d = `M 20 14 Q 20 ${h * 0.6} 20 ${h}`;
    rope.setAttribute('d', d); ropeHL.setAttribute('d', d);
  }
  updateRope(0);
  let isDragging = false, startX, startY, curX = 0, curY = 0;
  const onStart = (cx, cy) => { isDragging = true; startX = cx - curX; startY = cy - curY; card.classList.add('dragging'); card.style.transition = ''; };
  const onMove = (cx, cy) => { if (!isDragging) return; curX = cx - startX; curY = cy - startY; card.style.transform = `translate(${curX}px,${curY}px) rotate(${curX*0.04}deg)`; updateRope(Math.max(0, curY)); };
  const onEnd = () => {
    if (!isDragging) return; isDragging = false; card.classList.remove('dragging');
    card.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    card.style.transform = 'translate(0,0) rotate(0deg)'; curX = 0; curY = 0;
    let t = 0;
    const anim = setInterval(() => { t += 0.1; updateRope(Math.max(0, Math.sin(t*Math.PI)*20*Math.exp(-t*0.8))); if (t > 3) { clearInterval(anim); updateRope(0); } }, 16);
    setTimeout(() => card.style.transition = '', 600);
  };
  card.addEventListener('mousedown', e => onStart(e.clientX, e.clientY));
  card.addEventListener('touchstart', e => onStart(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  document.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
  document.addEventListener('touchmove', e => onMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);
}

// ===== HOBI =====
const hobiData = {
  '1': { nama: 'Running',             emoji: '🏃‍♀️', desc: 'Running adalah cara saya menjaga kesehatan fisik dan mental. Berlari setiap pagi membantu saya memulai hari dengan semangat dan pikiran yang jernih.' },
  '2': { nama: 'Hiking',              emoji: '🥾',   desc: 'Hiking mengajarkan saya tentang ketekunan dan menikmati proses. Setiap pendakian adalah metafora perjalanan belajar — penuh tantangan, namun pemandangan di puncak selalu sepadan.' },
  '3': { nama: 'Gym',                 emoji: '💪',   desc: 'Gym adalah ruang saya melatih disiplin dan konsistensi. Tubuh yang sehat adalah modal utama seorang pendidik yang aktif dan bersemangat di depan kelas.' },
  '4': { nama: 'Berkebun',            emoji: '🌿',   desc: 'Berkebun mengajarkan kesabaran dan ketekunan. Merawat tanaman adalah metafora indah untuk mendidik — keduanya butuh perhatian, kasih sayang, dan waktu untuk tumbuh.' },
  '5': { nama: 'Mendengarkan Musik',  emoji: '🎵',   desc: 'Musik adalah teman setia saat belajar dan bekerja. Saya percaya musik dapat menciptakan suasana belajar yang lebih nyaman dan menyenangkan.' },
  '6': { nama: 'Memasak',             emoji: '🧁',   desc: 'Memasak adalah seni yang mengajarkan kreativitas dan ketelitian. Seperti merancang pembelajaran, memasak butuh perencanaan matang dan sentuhan personal.' }
};

async function loadHobiPhotos() {
  try {
    const snap = await getDocs(collection(db, 'hobi'));
    snap.forEach(d => {
      const item = document.querySelector(`.hobi-item[data-hobi-id="${d.id}"]`);
      if (item && d.data().coverUrl) {
        item.querySelector('.hobi-photo-wrap').innerHTML = `<img src="${d.data().coverUrl}" alt="${hobiData[d.id]?.nama}" /><div class="hobi-upload-overlay">🔍</div>`;
      }
    });
  } catch(e) {}
}

function hobiClick(id) { openHobiModal(id); }
window.hobiClick = hobiClick;

function openHobiModal(id) {
  const data = hobiData[id];
  document.getElementById('hobi-modal-title').textContent = data.emoji + ' ' + data.nama;
  document.getElementById('hobi-modal-desc').textContent = data.desc;
  const gallery = document.getElementById('hobi-gallery');
  gallery.innerHTML = '';
  for (let slot = 1; slot <= 3; slot++) {
    const item = document.createElement('div');
    item.className = 'hobi-gallery-item'; item.dataset.slot = slot;
    item.innerHTML = `<span class="hobi-gallery-placeholder">📷</span>${isAdmin ? '<div class="hobi-gallery-upload-hint">📎 Upload</div>' : ''}`;
    if (isAdmin) item.addEventListener('click', e => { e.stopPropagation(); uploadHobiPhoto(id, slot, item); });
    gallery.appendChild(item);
  }
  loadHobiGallery(id);
  openModal('modal-hobi');
}
window.openHobiModal = openHobiModal;

async function loadHobiGallery(id) {
  try {
    const snap = await getDocs(collection(db, `hobi_photos_${id}`));
    snap.forEach(d => {
      const item = document.querySelector(`#hobi-gallery [data-slot="${d.data().slot}"]`);
      if (item) item.innerHTML = `<img src="${d.data().url}" alt="Hobi" />${isAdmin ? '<div class="hobi-gallery-upload-hint">🔄 Ganti</div>' : ''}`;
    });
  } catch(e) {}
}

async function uploadHobiPhoto(hobiId, slot, itemEl) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = async () => {
    const file = inp.files[0]; if (!file) return;
    showToast('⏳ Mengupload...');
    try {
      const url = await uploadToCloudinary(file);
      await setDoc(doc(db, `hobi_photos_${hobiId}`, String(slot)), { slot, url });
      itemEl.innerHTML = `<img src="${url}" alt="Hobi" /><div class="hobi-gallery-upload-hint">🔄 Ganti</div>`;
      if (slot === 1) {
        await setDoc(doc(db, 'hobi', hobiId), { id: hobiId, coverUrl: url });
        const wrap = document.querySelector(`.hobi-item[data-hobi-id="${hobiId}"] .hobi-photo-wrap`);
        if (wrap) wrap.innerHTML = `<img src="${url}" alt="${hobiData[hobiId]?.nama}" /><div class="hobi-upload-overlay">🔍</div>`;
      }
      showToast('✅ Foto diupload');
    } catch(e) { showToast('❌ Gagal: ' + e.message); }
  };
  inp.click();
}

// ===== ID CARD FOTO =====
function initIdCardAdmin() {
  const c = document.getElementById('idCard'); if (!c) return;
  const hint = document.createElement('div'); hint.className = 'id-card-change-hint'; hint.innerHTML = '📷 Ganti Foto';
  c.insertBefore(hint, c.firstChild);
  hint.addEventListener('click', async () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = async () => {
      const file = inp.files[0]; if (!file) return;
      showToast('⏳ Mengupload...');
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

async function loadSettings() {
  try {
    const snap = await getDocs(collection(db, 'settings'));
    snap.forEach(d => {
      if (d.id === 'idcard' && d.data().photoUrl) { const img = document.getElementById('id-card-img'); if (img) img.src = d.data().photoUrl; }
      if (d.id === 'daerah_foto' && d.data().url) { const img = document.getElementById('daerah-img'); if (img) img.src = d.data().url; }
    });
  } catch(e) {}
  if (isAdmin) {
    const btn = document.getElementById('btn-upload-daerah');
    if (btn) btn.style.display = 'inline-block';
  }
}

async function uploadDaerahFoto() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = async () => {
    const file = inp.files[0]; if (!file) return;
    showToast('⏳ Mengupload...');
    try {
      const url = await uploadToCloudinary(file);
      await setDoc(doc(db, 'settings', 'daerah_foto'), { url });
      const img = document.getElementById('daerah-img'); if (img) img.src = url;
      showToast('✅ Foto daerah diperbarui');
    } catch(e) { showToast('❌ Gagal: ' + e.message); }
  };
  inp.click();
}
window.uploadDaerahFoto = uploadDaerahFoto;

// ===== VIDEO =====
function getYoutubeId(url) {
  const patterns = [/youtu\.be\/([^?&\s]+)/, /youtube\.com\/watch\?v=([^&\s]+)/, /youtube\.com\/embed\/([^?&\s]+)/, /youtube\.com\/shorts\/([^?&\s]+)/];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

async function initVideo() {
  const addBtn = document.getElementById('btn-add-video');
  const delBtn = document.getElementById('btn-del-video');
  if (isAdmin && addBtn) addBtn.style.display = 'inline-block';
  try {
    const snap = await getDocs(collection(db, 'settings'));
    snap.forEach(d => {
      if (d.id === 'video' && d.data().url) {
        const preview = document.getElementById('video-preview');
        const ytId = getYoutubeId(d.data().url);
        if (preview && ytId) preview.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}" allowfullscreen style="width:100%;aspect-ratio:16/9;border:none;border-radius:12px;display:block;"></iframe>`;
        if (isAdmin && delBtn) delBtn.style.display = 'inline-block';
        if (addBtn) addBtn.innerHTML = '🔄 Ganti Video';
      }
    });
  } catch(e) {}
}

async function addVideo() {
  const url = prompt('Paste link YouTube:\nhttps://youtu.be/xxxxx\nhttps://www.youtube.com/watch?v=xxxxx');
  if (!url) return;
  const title = prompt('Judul video:', 'Video Pembelajaran PPL') || 'Video Pembelajaran PPL';
  try {
    await setDoc(doc(db, 'settings', 'video'), { url, title });
    const ytId = getYoutubeId(url);
    const preview = document.getElementById('video-preview');
    if (preview && ytId) preview.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}" allowfullscreen style="width:100%;aspect-ratio:16/9;border:none;border-radius:12px;display:block;"></iframe>`;
    const delBtn = document.getElementById('btn-del-video'); if (delBtn) delBtn.style.display = 'inline-block';
    showToast('✅ Video ditambahkan');
  } catch(e) { showToast('❌ Gagal: ' + e.message); }
}

async function deleteVideo() {
  if (!confirm('Hapus video ini?')) return;
  await deleteDoc(doc(db, 'settings', 'video'));
  const preview = document.getElementById('video-preview');
  if (preview) preview.innerHTML = `<div class="video-empty"><span>▶️</span><p>Belum ada video</p></div>`;
  const delBtn = document.getElementById('btn-del-video'); if (delBtn) delBtn.style.display = 'none';
  showToast('🗑️ Video dihapus');
}
window.addVideo = addVideo;
window.deleteVideo = deleteVideo;

// ===== RPL DOCS =====
async function loadRplDocs() {
  try {
    const snap = await getDocs(collection(db, 'rpl_docs'));
    snap.forEach(d => setRplDoc(d.id, d.data().name, d.data().url));
  } catch(e) {}
  if (isAdmin) {
    for (let s = 1; s <= 3; s++) {
      const actions = document.getElementById('rpl-actions-' + s);
      if (actions && !actions.querySelector('.btn-upload-trigger')) {
        const btn = document.createElement('button');
        btn.className = 'btn-doc btn-upload-trigger'; btn.innerHTML = '📎 Upload';
        btn.onclick = (function(i){ return () => document.getElementById('rpl-upload-' + i).click(); })(s);
        actions.appendChild(btn);
      }
    }
  }
}

function setRplDoc(siklus, name, url) {
  const status = document.getElementById('rpl-status-' + siklus);
  const actions = document.getElementById('rpl-actions-' + siklus);
  if (status) status.innerHTML = `<span style="color:var(--text-mid);font-style:normal;">📄 ${name.length > 18 ? name.slice(0,18)+'...' : name}</span>`;
  if (!actions) return;
  const old = actions.querySelector('.btn-doc-file'); if (old) old.remove();
  const delOld = actions.querySelector('.btn-doc-del'); if (delOld) delOld.remove();
  const lihat = document.createElement('a');
  lihat.className = 'btn-doc btn-doc-file'; lihat.href = url; lihat.target = '_blank'; lihat.innerHTML = '👁️ Lihat';
  actions.appendChild(lihat);
  if (isAdmin) {
    const del = document.createElement('button');
    del.className = 'btn-doc btn-doc-del'; del.innerHTML = '🗑️';
    del.onclick = async () => {
      if (!confirm('Hapus dokumen siklus ' + siklus + '?')) return;
      await deleteDoc(doc(db, 'rpl_docs', String(siklus)));
      if (status) status.textContent = 'Belum ada dokumen';
      lihat.remove(); del.remove(); showToast('🗑️ Dihapus');
    };
    actions.appendChild(del);
  }
}

async function uploadRplDoc(input, siklus) {
  const file = input.files[0]; if (!file) return;
  showToast('⏳ Mengupload...');
  try {
    const url = await uploadToCloudinary(file);
    await setDoc(doc(db, 'rpl_docs', String(siklus)), { name: file.name, url });
    setRplDoc(String(siklus), file.name, url);
    showToast('✅ Dokumen Siklus ' + siklus + ' diupload');
  } catch(e) { showToast('❌ Gagal: ' + e.message); }
  input.value = '';
}
window.uploadRplDoc = uploadRplDoc;

// ===== INIT =====
renderDocs();
renderGaleri();
loadHobiPhotos();
loadSettings();
if (isAdmin) { initDocAdmin(); initGaleriAdmin(); initIdCardAdmin(); }

// ===== ANALISIS SUB-TAB =====
function switchAnalisisTab(id, btn) {
  const card = btn.closest('.analisis-siklus-card');
  card.querySelectorAll('.analisis-subtab-content').forEach(t => t.classList.remove('active'));
  card.querySelectorAll('.analisis-subtab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}
window.switchAnalisisTab = switchAnalisisTab;

// ===== MEDIA PEMBELAJARAN =====
async function loadMedia(siklus) {
  const grid = document.getElementById('media-grid-' + siklus);
  if (!grid) return;
  try {
    const snap = await getDocs(collection(db, 'media_' + siklus));
    snap.forEach(d => addMediaItem(grid, d.id, d.data().url, d.data().name, d.data().type, siklus));
  } catch(e) {}
  if (isAdmin) {
    const adminDiv = document.getElementById('media-admin-' + siklus);
    if (adminDiv) adminDiv.style.display = 'block';
  }
}

function addMediaItem(grid, id, url, name, type, siklus) {
  const div = document.createElement('div');
  div.className = 'media-item';
  const isImg = (type && type.startsWith('image')) || /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  const isDrive = type === 'drive';
  const isPdf = (type && type.includes('pdf')) || /\.pdf$/i.test(name);
  const isPpt = /\.(ppt|pptx)$/i.test(name);
  const icon = isDrive ? '📁' : isPdf ? '📄' : isPpt ? '📊' : '📁';
  const previewType = isDrive ? 'drive' : isPdf ? 'pdf' : 'office';

  if (isImg) {
    div.innerHTML = `
      <img src="${url}" alt="${name}" style="cursor:pointer" />
      <div class="media-item-name">${name}</div>
      <button class="media-item-del">✕</button>`;
    div.querySelector('img').addEventListener('click', () => openMediaPreview(url, name, 'image'));
  } else {
    div.innerHTML = `
      <div class="media-item-icon" style="cursor:pointer">${icon}</div>
      <div class="media-item-name">${name}</div>
      <button class="media-item-del">✕</button>`;
    div.querySelector('.media-item-icon').addEventListener('click', () => openMediaPreview(url, name, previewType));
  }
  div.querySelector('.media-item-del').addEventListener('click', () => deleteMedia(id, siklus, div));
  grid.appendChild(div);
}

// ===== MEDIA PREVIEW MODAL =====
function openMediaPreview(url, name, type) {
  let content = '';
  if (type === 'image') {
    content = `<img src="${url}" alt="${name}" style="width:100%;border-radius:10px;" />`;
  } else if (type === 'drive') {
    // Google Drive preview — langsung embed
    content = `
      <iframe src="${url}" style="width:100%;height:520px;border:none;border-radius:10px;" allowfullscreen></iframe>
      <div style="text-align:center;margin-top:0.75rem;">
        <a href="${url.replace('/preview','')}" target="_blank" class="btn-doc" style="background:var(--pink-light);color:var(--pink-dark);">↗️ Buka di Google Drive</a>
      </div>`;
  } else {
    // PDF, DOCX, PPT via Google Docs Viewer
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    content = `
      <iframe src="${viewerUrl}" style="width:100%;height:520px;border:none;border-radius:10px;" id="doc-preview-frame"></iframe>
      <div style="display:flex;gap:0.75rem;justify-content:center;margin-top:0.75rem;flex-wrap:wrap;">
        <button class="btn-doc" onclick="document.getElementById('doc-preview-frame').src=document.getElementById('doc-preview-frame').src" style="background:var(--lavender-light);color:#7b5ea7;">🔄 Refresh</button>
        <a href="${url}" target="_blank" class="btn-doc" style="background:var(--pink-light);color:var(--pink-dark);">↗️ Buka di tab baru</a>
      </div>`;
  }

  let modal = document.getElementById('modal-media-preview');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-media-preview';
    modal.className = 'modal-overlay';
    modal.innerHTML = `<div class="modal-box" style="max-width:700px;">
      <button class="modal-close" onclick="closeModal('modal-media-preview')">✕</button>
      <h3 id="media-preview-title"></h3>
      <div id="media-preview-body" style="margin-top:1rem;"></div>
    </div>`;
    modal.addEventListener('click', e => { if (e.target === modal) closeModal('modal-media-preview'); });
    document.body.appendChild(modal);
  }

  document.getElementById('media-preview-title').textContent = name;
  document.getElementById('media-preview-body').innerHTML = content;
  openModal('modal-media-preview');
}
window.openMediaPreview = openMediaPreview;

function uploadMedia(siklus) {
  document.getElementById('media-input-' + siklus).click();
}
window.uploadMedia = uploadMedia;

// ===== GOOGLE DRIVE LINK =====
function parseDriveUrl(url) {
  // Ekstrak file ID dari berbagai format URL Google Drive
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /docs\.google\.com\/(?:document|spreadsheets|presentation)\/d\/([^/]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getDrivePreviewUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

async function addMediaByLink(siklus) {
  const input = prompt('Paste link Google Drive:\n(pastikan sudah di-share "Anyone with link can view")');
  if (!input) return;
  const fileId = parseDriveUrl(input.trim());
  if (!fileId) { showToast('❌ Link tidak valid. Gunakan link Google Drive.'); return; }
  const name = prompt('Nama file:', 'Dokumen') || 'Dokumen';
  const previewUrl = getDrivePreviewUrl(fileId);
  const grid = document.getElementById('media-grid-' + siklus);
  if (!grid) return;
  try {
    const id = Date.now() + '_' + Math.random().toString(36).slice(2);
    await setDoc(doc(db, 'media_' + siklus, id), { url: previewUrl, name, type: 'drive' });
    addMediaItem(grid, id, previewUrl, name, 'drive', siklus);
    showToast('✅ ' + name + ' ditambahkan');
  } catch(e) { showToast('❌ Gagal: ' + e.message); }
}
window.addMediaByLink = addMediaByLink;

async function handleMediaUpload(input, siklus) {
  const grid = document.getElementById('media-grid-' + siklus);
  for (const file of Array.from(input.files)) {
    showToast('⏳ Mengupload ' + file.name + '...');
    try {
      const url = await uploadToCloudinary(file);
      const id = Date.now() + '_' + Math.random().toString(36).slice(2);
      await setDoc(doc(db, 'media_' + siklus, id), { url, name: file.name, type: file.type });
      addMediaItem(grid, id, url, file.name, file.type, siklus);
      showToast('✅ ' + file.name + ' diupload');
    } catch(e) { showToast('❌ Gagal: ' + e.message); }
  }
  input.value = '';
}
window.handleMediaUpload = handleMediaUpload;

async function deleteMedia(id, siklus, el) {
  if (!confirm('Hapus media ini?')) return;
  await deleteDoc(doc(db, 'media_' + siklus, id));
  el.remove();
  showToast('🗑️ Media dihapus');
}
window.deleteMedia = deleteMedia;

// ===== DOK SLOTS (foto dokumentasi per siklus) =====
function buildDokContainer(siklus) {
  const container = document.getElementById(siklus + '-dok-container');
  if (!container) return;
  container.innerHTML = `
    <div class="dok-grid">
      ${[1,2,3].map(n => `
        <div class="dok-slot" id="${siklus}-dok-${n}">
          <div class="dok-placeholder" ${isAdmin ? `onclick="uploadDokSlot('${siklus}',${n})"` : ''}>
            <span>📷</span><p>Foto ${n}</p>
          </div>
        </div>`).join('')}
    </div>
    ${isAdmin ? `<div class="media-upload-bar" style="margin-top:0.75rem;"><p style="font-size:0.75rem;color:var(--text-light);">Klik slot foto untuk upload</p></div>` : ''}
  `;
  loadDokSlots(siklus);
}

async function loadDokSlots(siklus) {
  try {
    const snap = await getDocs(collection(db, 'dok_' + siklus));
    snap.forEach(d => {
      const slot = document.getElementById(siklus + '-dok-' + d.data().slot);
      if (slot) slot.innerHTML = `<img src="${d.data().url}" alt="Dokumentasi" style="width:100%;height:100%;object-fit:cover;border-radius:10px;cursor:pointer" onclick="openMediaPreview('${d.data().url}','Dokumentasi','image')" />${isAdmin ? `<div class="hobi-gallery-upload-hint" onclick="uploadDokSlot('${siklus}',${d.data().slot})">🔄 Ganti</div>` : ''}`;
    });
  } catch(e) {}
}

async function uploadDokSlot(siklus, slot) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = async () => {
    const file = inp.files[0]; if (!file) return;
    showToast('⏳ Mengupload...');
    try {
      const url = await uploadToCloudinary(file);
      await setDoc(doc(db, 'dok_' + siklus, String(slot)), { slot, url });
      const slotEl = document.getElementById(siklus + '-dok-' + slot);
      if (slotEl) slotEl.innerHTML = `<img src="${url}" alt="Dokumentasi" style="width:100%;height:100%;object-fit:cover;border-radius:10px;cursor:pointer" onclick="openMediaPreview('${url}','Dokumentasi','image')" /><div class="hobi-gallery-upload-hint" onclick="uploadDokSlot('${siklus}',${slot})">🔄 Ganti</div>`;
      showToast('✅ Foto diupload');
    } catch(e) { showToast('❌ Gagal: ' + e.message); }
  };
  inp.click();
}
window.uploadDokSlot = uploadDokSlot;

// ===== VIDEO PER SIKLUS =====
async function loadSiklusVideo(siklus) {
  try {
    const snap = await getDocs(collection(db, 'settings'));
    snap.forEach(d => {
      if (d.id === 'video_' + siklus && d.data().url) {
        const preview = document.getElementById(siklus + '-vid-preview');
        const ytId = getYoutubeId(d.data().url);
        if (preview && ytId) preview.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}" allowfullscreen style="width:100%;aspect-ratio:16/9;border:none;border-radius:12px;display:block;"></iframe>`;
        const delBtn = document.getElementById(siklus + '-vid-del');
        if (isAdmin && delBtn) delBtn.style.display = 'inline-block';
        const addBtn = document.querySelector(`[onclick="addSiklusVideo('${siklus}')"]`);
        if (addBtn) addBtn.innerHTML = '🔄 Ganti Video';
      }
    });
  } catch(e) {}
}

async function addSiklusVideo(siklus) {
  const url = prompt('Paste link YouTube:\nhttps://youtu.be/xxxxx\nhttps://www.youtube.com/watch?v=xxxxx');
  if (!url) return;
  try {
    await setDoc(doc(db, 'settings', 'video_' + siklus), { url });
    const ytId = getYoutubeId(url);
    const preview = document.getElementById(siklus + '-vid-preview');
    if (preview && ytId) preview.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}" allowfullscreen style="width:100%;aspect-ratio:16/9;border:none;border-radius:12px;display:block;"></iframe>`;
    const delBtn = document.getElementById(siklus + '-vid-del');
    if (delBtn) delBtn.style.display = 'inline-block';
    showToast('✅ Video ditambahkan');
  } catch(e) { showToast('❌ Gagal: ' + e.message); }
}

async function deleteSiklusVideo(siklus) {
  if (!confirm('Hapus video ini?')) return;
  await deleteDoc(doc(db, 'settings', 'video_' + siklus));
  const preview = document.getElementById(siklus + '-vid-preview');
  if (preview) preview.innerHTML = `<div class="video-empty"><span>▶️</span><p>Belum ada video</p></div>`;
  const delBtn = document.getElementById(siklus + '-vid-del');
  if (delBtn) delBtn.style.display = 'none';
  showToast('🗑️ Video dihapus');
}
window.addSiklusVideo = addSiklusVideo;
window.deleteSiklusVideo = deleteSiklusVideo;

// Load media saat halaman load
['s1','s2','s3'].forEach(siklus => {
  // Media tab: PPT + File
  loadMedia(siklus + '-ppt');
  loadMedia(siklus + '-file');
  if (isAdmin) {
    ['ppt','file'].forEach(t => {
      const el = document.getElementById('media-admin-' + siklus + '-' + t);
      if (el) el.style.display = 'block';
    });
  }
  // Instrumen RPL, Instrumen Praktik, Penilaian Guru Pamong
  loadMedia(siklus + '-inst-rpl');
  loadMedia(siklus + '-inst-praktik');
  loadMedia(siklus + '-pamong');
  if (isAdmin) {
    ['inst-rpl','inst-praktik','pamong'].forEach(t => {
      const el = document.getElementById('media-admin-' + siklus + '-' + t);
      if (el) el.style.display = 'block';
    });
  }
  // Dokumentasi tab: foto slots + video
  buildDokContainer(siklus);
  loadSiklusVideo(siklus);
  if (isAdmin) {
    const vidAdmin = document.getElementById('media-admin-' + siklus + '-vid');
    if (vidAdmin) vidAdmin.style.display = 'block';
  }
});
