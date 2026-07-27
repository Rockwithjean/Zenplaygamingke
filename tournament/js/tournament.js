/* ============================================================
   ZenPlay MK Championship 2026 – Shared Tournament JS
   ============================================================ */

'use strict';

// ── CONFIGURATION ──────────────────────────────────────────
const TK_CONFIG = {
  tournamentDate: new Date('2026-08-15T08:00:00+03:00'),
  maxPlayers: 64,
  registrationFee: 500,   // KES – admin can edit
  adminPassword: 'zenplay2026admin',
  currency: 'KES',
  paybillNumber: '000000',       // ← replace with real Paybill/Till
  accountInstruction: 'Use your Gamer Tag as the account name',
  socialLinks: {
    instagram: 'https://www.instagram.com/zenplaygamingke',
    tiktok: 'https://www.tiktok.com/@zenplaygamingke',
    whatsapp: 'https://wa.link/s3adrp'
  }
};

// ── LOCAL STORAGE KEYS ──────────────────────────────────────
const STORAGE = {
  players: 'tk_players',
  brackets: 'tk_brackets',
  champions: 'tk_champions',
  announcements: 'tk_announcements'
};

// ── STORAGE HELPERS ─────────────────────────────────────────
const TK = {
  getPlayers() {
    return JSON.parse(localStorage.getItem(STORAGE.players) || '[]');
  },
  savePlayers(data) {
    localStorage.setItem(STORAGE.players, JSON.stringify(data));
  },
  getBrackets() {
    return JSON.parse(localStorage.getItem(STORAGE.brackets) || 'null');
  },
  saveBrackets(data) {
    localStorage.setItem(STORAGE.brackets, JSON.stringify(data));
  },
  getChampions() {
    return JSON.parse(localStorage.getItem(STORAGE.champions) || '[]');
  },
  saveChampions(data) {
    localStorage.setItem(STORAGE.champions, JSON.stringify(data));
  },
  getAnnouncements() {
    return JSON.parse(localStorage.getItem(STORAGE.announcements) || '[]');
  },
  saveAnnouncements(data) {
    localStorage.setItem(STORAGE.announcements, JSON.stringify(data));
  },
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  },
  confirmedPlayers() {
    return TK.getPlayers().filter(p => p.status === 'confirmed');
  }
};

// ── PRELOADER ───────────────────────────────────────────────
function initPreloader() {
  const pre = document.getElementById('tk-preloader');
  if (!pre) return;
  window.addEventListener('load', () => {
    setTimeout(() => pre.classList.add('hidden'), 600);
  });
}

// ── STICKY NAV ───────────────────────────────────────────────
function initNav() {
  const nav = document.querySelector('.tk-nav');
  const hamburger = document.querySelector('.tk-hamburger');
  const mobileNav = document.querySelector('.tk-mobile-nav');
  const mobileClose = document.querySelector('.tk-mobile-nav-close');

  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 40
      ? '0 4px 30px rgba(0,0,0,0.5)'
      : 'none';
  });

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    if (mobileClose) {
      mobileClose.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    }
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Mark active link
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.tk-nav-links a, .tk-mobile-nav a').forEach(a => {
    if (a.getAttribute('href') === path || a.getAttribute('href') === './' + path) {
      a.classList.add('active');
    }
  });
}

// ── COUNTDOWN TIMER ─────────────────────────────────────────
function initCountdown() {
  const daysEl   = document.getElementById('tk-days');
  const hoursEl  = document.getElementById('tk-hours');
  const minsEl   = document.getElementById('tk-mins');
  const secsEl   = document.getElementById('tk-secs');
  if (!daysEl) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function update() {
    const now  = Date.now();
    const diff = TK_CONFIG.tournamentDate.getTime() - now;
    if (diff <= 0) {
      daysEl.textContent = hoursEl.textContent = minsEl.textContent = secsEl.textContent = '00';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);
    daysEl.textContent  = pad(d);
    hoursEl.textContent = pad(h);
    minsEl.textContent  = pad(m);
    secsEl.textContent  = pad(s);
  }
  update();
  setInterval(update, 1000);
}

// ── TOAST NOTIFICATIONS ─────────────────────────────────────
function initToasts() {
  if (!document.querySelector('.tk-toast-container')) {
    const el = document.createElement('div');
    el.className = 'tk-toast-container';
    document.body.appendChild(el);
  }
}

function showToast(msg, type = 'default', duration = 4000) {
  const container = document.querySelector('.tk-toast-container');
  if (!container) return;
  const icons = { success: '✅', error: '❌', warning: '⚠️', default: '🎮' };
  const toast = document.createElement('div');
  toast.className = `tk-toast ${type}`;
  toast.innerHTML = `
    <span class="tk-toast-icon">${icons[type] || icons.default}</span>
    <span class="tk-toast-msg">${msg}</span>
    <button class="tk-toast-close" aria-label="Close">✕</button>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  const remove = () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  };
  toast.querySelector('.tk-toast-close').addEventListener('click', remove);
  if (duration > 0) setTimeout(remove, duration);
}

// ── FAQ ACCORDION ────────────────────────────────────────────
function initFAQ() {
  document.querySelectorAll('.tk-faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.tk-faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ── SLOT COUNTER ─────────────────────────────────────────────
function updateSlotCounter() {
  const fill = document.getElementById('tk-slot-fill');
  const nums = document.getElementById('tk-slot-nums');
  if (!fill && !nums) return;
  const players = TK.getPlayers();
  const count = players.filter(p => p.status !== 'rejected').length;
  const pct = Math.min((count / TK_CONFIG.maxPlayers) * 100, 100);
  if (fill) fill.style.width = pct + '%';
  if (nums) nums.innerHTML = `${count} <span>/ ${TK_CONFIG.maxPlayers} Registered</span>`;
}

// ── REGISTRATION FORM ─────────────────────────────────────────
function initRegistrationForm() {
  const form = document.getElementById('tk-reg-form');
  if (!form) return;
  updateSlotCounter();

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const players = TK.getPlayers();
    const count   = players.filter(p => p.status !== 'rejected').length;
    if (count >= TK_CONFIG.maxPlayers) {
      showToast('Sorry, all slots are full!', 'error');
      return;
    }

    // Check duplicate gamer tag
    const tag = form.querySelector('#tk-gamertag').value.trim();
    if (players.some(p => p.gamerTag.toLowerCase() === tag.toLowerCase())) {
      showToast('This Gamer Tag is already registered!', 'error');
      return;
    }

    const player = {
      id: TK.generateId(),
      fullName:       form.querySelector('#tk-fullname').value.trim(),
      gamerTag:       tag,
      phone:          form.querySelector('#tk-phone').value.trim(),
      email:          form.querySelector('#tk-email')?.value.trim() || '',
      county:         form.querySelector('#tk-county').value.trim(),
      age:            form.querySelector('#tk-age').value,
      emergency:      form.querySelector('#tk-emergency')?.value.trim() || '',
      participated:   form.querySelector('#tk-participated').value,
      status:         'pending',  // pending → confirmed | rejected
      paymentCode:    '',
      registeredAt:   new Date().toISOString()
    };

    players.push(player);
    TK.savePlayers(players);

    showToast('Registration submitted! Proceeding to payment…', 'success');
    setTimeout(() => {
      window.location.href = `payment.html?tag=${encodeURIComponent(tag)}`;
    }, 1500);
  });
}

// ── FORM VALIDATION ──────────────────────────────────────────
function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(input => {
    const err = input.parentElement.querySelector('.tk-field-error') ||
                input.closest('.tk-form-group')?.querySelector('.tk-field-error');
    const clearError = () => {
      input.classList.remove('error');
      if (err) err.style.display = 'none';
    };
    const setError = (msg) => {
      input.classList.add('error');
      if (err) { err.textContent = msg; err.style.display = 'block'; }
      valid = false;
    };
    clearError();
    if (input.type === 'checkbox') {
      if (!input.checked) setError('You must agree to continue.');
    } else if (!input.value.trim()) {
      setError('This field is required.');
    } else if (input.type === 'tel' && !/^(\+?254|0)\d{9}$/.test(input.value.replace(/\s/g,''))) {
      setError('Enter a valid Kenyan phone number.');
    } else if (input.type === 'email' && input.value && !/\S+@\S+\.\S+/.test(input.value)) {
      setError('Enter a valid email address.');
    }
    input.addEventListener('input', clearError, { once: true });
  });
  return valid;
}

// ── PAYMENT PAGE ──────────────────────────────────────────────
function initPaymentPage() {
  const form = document.getElementById('tk-pay-form');
  if (!form) return;

  // Show fee
  const feeEl = document.getElementById('tk-fee-amount');
  if (feeEl) feeEl.textContent = `${TK_CONFIG.currency} ${TK_CONFIG.registrationFee.toLocaleString()}`;

  // Show paybill
  const pbEl = document.getElementById('tk-paybill');
  if (pbEl) pbEl.textContent = TK_CONFIG.paybillNumber;

  // Pre-fill gamer tag from URL
  const params = new URLSearchParams(window.location.search);
  const tag = params.get('tag');
  const tagEl = document.getElementById('tk-pay-tag');
  if (tagEl && tag) tagEl.textContent = tag;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const code  = form.querySelector('#tk-mpesa-code').value.trim().toUpperCase();
    const phone = form.querySelector('#tk-mpesa-phone').value.trim();

    if (tag) {
      const players = TK.getPlayers();
      const idx = players.findIndex(p => p.gamerTag.toLowerCase() === tag.toLowerCase());
      if (idx !== -1) {
        players[idx].paymentCode  = code;
        players[idx].paymentPhone = phone;
        players[idx].paidAt       = new Date().toISOString();
        TK.savePlayers(players);
      }
    }

    const confirm = document.getElementById('tk-pay-confirm');
    if (confirm) { confirm.classList.remove('tk-hidden'); form.classList.add('tk-hidden'); }
    showToast('Payment details submitted!', 'success', 6000);
  });
}

// ── PLAYERS PAGE ─────────────────────────────────────────────
function initPlayersPage() {
  const tbody = document.getElementById('tk-players-tbody');
  if (!tbody) return;
  const players = TK.confirmedPlayers();
  if (players.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-dim);padding:40px;">No confirmed players yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = players.map((p, i) => `
    <tr>
      <td style="color:var(--gold);font-family:'Orbitron',sans-serif;font-size:0.8rem;">${i + 1}</td>
      <td style="color:var(--text-primary);">${escHtml(p.fullName)}</td>
      <td><span class="tk-text-neon" style="font-family:'Rajdhani',sans-serif;font-weight:700;">${escHtml(p.gamerTag)}</span></td>
      <td><span class="tk-badge tk-badge-confirmed">✅ Confirmed</span></td>
    </tr>
  `).join('');

  const countEl = document.getElementById('tk-confirmed-count');
  if (countEl) countEl.textContent = players.length;
}

// ── BRACKETS PAGE ─────────────────────────────────────────────
function initBracketsPage() {
  const wrap = document.getElementById('tk-bracket-display');
  if (!wrap) return;
  const brackets = TK.getBrackets();
  if (!brackets || !brackets.rounds) {
    wrap.innerHTML = `<p style="color:var(--text-dim);text-align:center;padding:60px 0;">Brackets have not been generated yet. Check back soon!</p>`;
    return;
  }
  renderBrackets(wrap, brackets);
}

function renderBrackets(container, brackets) {
  const roundNames = ['Round of 32', 'Round of 16', 'Quarter Finals', 'Semi Finals', 'Grand Final'];
  let html = '<div class="tk-bracket">';
  brackets.rounds.forEach((round, ri) => {
    html += `<div class="tk-round">
      <div class="tk-round-title">${roundNames[ri] || 'Round ' + (ri+1)}</div>
      <div class="tk-round-matches">`;
    round.matches.forEach(match => {
      const p1 = match.player1 || 'TBD';
      const p2 = match.player2 || 'TBD';
      const w  = match.winner  || '';
      html += `<div class="tk-match" style="margin-bottom:${32 * Math.pow(2, ri)}px;">
        <div class="tk-match-player ${w === p1 ? 'winner' : ''}">${escHtml(p1)}<span class="tk-match-score">${match.score1 !== undefined ? match.score1 : ''}</span></div>
        <div class="tk-match-vs">VS</div>
        <div class="tk-match-player ${w === p2 ? 'winner' : ''}">${escHtml(p2)}<span class="tk-match-score">${match.score2 !== undefined ? match.score2 : ''}</span></div>
      </div>`;
    });
    html += '</div></div>';
    if (ri < brackets.rounds.length - 1) {
      html += '<div class="tk-connector" style="width:30px;"></div>';
    }
  });
  // Champion
  if (brackets.champion) {
    html += `<div class="tk-round">
      <div class="tk-round-title" style="color:var(--gold);">👑 Champion</div>
      <div class="tk-round-matches" style="display:flex;align-items:center;">
        <div class="tk-match-player winner" style="min-width:160px;background:rgba(212,175,55,0.15);border-color:var(--gold);">
          🏆 ${escHtml(brackets.champion)}
        </div>
      </div>
    </div>`;
  }
  html += '</div>';
  container.innerHTML = html;
}

// ── CHAMPIONS PAGE ────────────────────────────────────────────
function initChampionsPage() {
  const grid = document.getElementById('tk-champs-grid');
  if (!grid) return;
  const champs = TK.getChampions();
  if (champs.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-dim);text-align:center;grid-column:1/-1;padding:40px 0;">No champions recorded yet.</p>`;
    return;
  }
  grid.innerHTML = champs.map(c => `
    <div class="tk-champ-card">
      <div class="tk-champ-year-badge">${escHtml(c.year)}</div>
      <div class="tk-champ-photo">${c.photo ? `<img src="${escHtml(c.photo)}" alt="${escHtml(c.name)}">` : '🏆'}</div>
      <div class="tk-champ-name">${escHtml(c.name)}</div>
      <div class="tk-champ-tag">${escHtml(c.gamerTag || '')}</div>
      <div class="tk-champ-details">
        Character: <span>${escHtml(c.character || 'N/A')}</span><br>
        Score: <span>${escHtml(c.score || 'N/A')}</span>
      </div>
    </div>
  `).join('');
}

// ── QR CODE ───────────────────────────────────────────────────
function initQRCode(elementId, url) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (typeof QRCode === 'undefined') return;
  new QRCode(el, {
    text: url || window.location.href,
    width: 140, height: 140,
    colorDark: '#d4af37', colorLight: '#111111',
    correctLevel: QRCode.CorrectLevel.H
  });
}

// ── PARTICLES (hero) ──────────────────────────────────────────
function initParticles() {
  const container = document.querySelector('.tk-hero-particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'tk-particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 6}s;
      animation-duration: ${5 + Math.random() * 5}s;
      width: ${Math.random() > 0.5 ? 2 : 3}px;
      height: ${Math.random() > 0.5 ? 2 : 3}px;
      background: ${Math.random() > 0.6 ? 'var(--neon)' : 'var(--gold)'};
    `;
    container.appendChild(p);
  }
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────
function initAdmin() {
  const gate = document.getElementById('tk-admin-gate');
  const dashboard = document.getElementById('tk-admin-dashboard');
  if (!gate || !dashboard) return;

  const pwInput  = document.getElementById('tk-admin-pw');
  const pwBtn    = document.getElementById('tk-admin-pw-btn');

  function unlockAdmin() {
    const pw = pwInput ? pwInput.value : '';
    if (pw === TK_CONFIG.adminPassword) {
      gate.classList.add('tk-hidden');
      dashboard.classList.remove('tk-hidden');
      loadAdminData();
      showToast('Welcome to Admin Dashboard', 'success');
    } else {
      showToast('Incorrect password. Try again.', 'error');
      if (pwInput) { pwInput.value = ''; pwInput.focus(); }
    }
  }

  if (pwBtn) pwBtn.addEventListener('click', unlockAdmin);
  if (pwInput) pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') unlockAdmin(); });

  // Sidebar navigation
  document.querySelectorAll('.tk-admin-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.tk-admin-nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.tk-admin-tab').forEach(t => t.classList.remove('active'));
      item.classList.add('active');
      const tab = document.getElementById('tab-' + item.dataset.tab);
      if (tab) tab.classList.add('active');
    });
  });
}

function loadAdminData() {
  renderAdminStats();
  renderAdminRegistrations();
  renderAdminPayments();
  initAdminBrackets();
  renderAdminChampions();
}

function renderAdminStats() {
  const players = TK.getPlayers();
  const confirmed = players.filter(p => p.status === 'confirmed').length;
  const pending   = players.filter(p => p.status === 'pending').length;
  const rejected  = players.filter(p => p.status === 'rejected').length;

  setEl('stat-total',     players.length);
  setEl('stat-confirmed', confirmed);
  setEl('stat-pending',   pending);
  setEl('stat-rejected',  rejected);
  setEl('stat-slots',     TK_CONFIG.maxPlayers - players.filter(p => p.status !== 'rejected').length);
}

function renderAdminRegistrations() {
  const tbody = document.getElementById('admin-reg-tbody');
  if (!tbody) return;
  const players = TK.getPlayers();
  const search = (document.getElementById('admin-reg-search')?.value || '').toLowerCase();
  const filtered = players.filter(p =>
    p.fullName.toLowerCase().includes(search) ||
    p.gamerTag.toLowerCase().includes(search) ||
    p.phone.includes(search)
  );
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-dim);padding:30px;">No registrations found.</td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(p => `
    <tr data-id="${p.id}">
      <td style="color:var(--text-primary);font-weight:600;">${escHtml(p.fullName)}</td>
      <td><span class="tk-text-neon">${escHtml(p.gamerTag)}</span></td>
      <td>${escHtml(p.phone)}</td>
      <td>${escHtml(p.county || '')}</td>
      <td>${escHtml(p.age || '')}</td>
      <td><span class="tk-badge tk-badge-${p.status}">${p.status}</span></td>
      <td>${escHtml(p.paymentCode || '—')}</td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="tk-btn tk-btn-sm tk-btn-success" onclick="adminAction('confirm','${p.id}')">✅ Confirm</button>
          <button class="tk-btn tk-btn-sm tk-btn-danger"  onclick="adminAction('reject','${p.id}')">❌ Reject</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderAdminPayments() {
  const tbody = document.getElementById('admin-pay-tbody');
  if (!tbody) return;
  const players = TK.getPlayers().filter(p => p.paymentCode);
  if (players.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-dim);padding:30px;">No payment submissions yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = players.map(p => `
    <tr>
      <td style="color:var(--text-primary);">${escHtml(p.fullName)}</td>
      <td><span class="tk-text-neon">${escHtml(p.gamerTag)}</span></td>
      <td>${escHtml(p.paymentPhone || '')}</td>
      <td style="font-family:'Orbitron',sans-serif;color:var(--gold);font-size:0.85rem;">${escHtml(p.paymentCode)}</td>
      <td><span class="tk-badge tk-badge-${p.status}">${p.status}</span></td>
    </tr>
  `).join('');
}

function initAdminBrackets() {
  const genBtn = document.getElementById('admin-gen-brackets');
  const updateBtn = document.getElementById('admin-update-brackets');
  if (!genBtn) return;

  genBtn.addEventListener('click', () => {
    const confirmed = TK.confirmedPlayers();
    if (confirmed.length < 2) {
      showToast('Need at least 2 confirmed players to generate brackets.', 'warning');
      return;
    }
    const brackets = generateBrackets(confirmed.map(p => p.gamerTag));
    TK.saveBrackets(brackets);
    showToast('Brackets generated! 🎮', 'success');
    renderAdminBracketPreview();
  });
}

function generateBrackets(playerTags) {
  // Shuffle
  const tags = [...playerTags].sort(() => Math.random() - 0.5);
  // Pad to next power of 2
  let size = 2;
  while (size < tags.length) size *= 2;
  while (tags.length < size) tags.push('BYE');

  const rounds = [];
  let current = tags;

  while (current.length > 1) {
    const matches = [];
    for (let i = 0; i < current.length; i += 2) {
      matches.push({ player1: current[i], player2: current[i+1], winner: null });
    }
    rounds.push({ matches });
    // Next round placeholders
    current = matches.map(() => 'TBD');
  }

  return { rounds, champion: null, createdAt: new Date().toISOString() };
}

function renderAdminBracketPreview() {
  const prev = document.getElementById('admin-bracket-preview');
  if (!prev) return;
  const brackets = TK.getBrackets();
  if (!brackets) { prev.innerHTML = '<p style="color:var(--text-dim);">No brackets.</p>'; return; }
  const roundNames = ['R32', 'R16', 'QF', 'SF', 'Final'];
  prev.innerHTML = brackets.rounds.map((r, i) => `
    <div style="margin-bottom:16px;">
      <h4 style="color:var(--gold);font-size:0.85rem;margin-bottom:8px;">${roundNames[i] || 'R'+(i+1)}</h4>
      ${r.matches.map((m, mi) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <input class="tk-input" style="width:160px;padding:6px 10px;font-size:0.8rem;" value="${escHtml(m.player1||'')}" onchange="updateMatch(${i},${mi},'player1',this.value)">
          <span style="color:var(--text-dim);font-size:0.75rem;">vs</span>
          <input class="tk-input" style="width:160px;padding:6px 10px;font-size:0.8rem;" value="${escHtml(m.player2||'')}" onchange="updateMatch(${i},${mi},'player2',this.value)">
          <span style="color:var(--text-dim);font-size:0.75rem;">Winner:</span>
          <select class="tk-select" style="width:160px;padding:6px 10px;font-size:0.8rem;" onchange="updateMatch(${i},${mi},'winner',this.value)">
            <option value="">—</option>
            <option value="${escHtml(m.player1||'')}" ${m.winner===m.player1?'selected':''}>${escHtml(m.player1||'P1')}</option>
            <option value="${escHtml(m.player2||'')}" ${m.winner===m.player2?'selected':''}>${escHtml(m.player2||'P2')}</option>
          </select>
          <input class="tk-input" style="width:60px;padding:6px 8px;font-size:0.8rem;" placeholder="Sc1" value="${m.score1 !== undefined ? m.score1 : ''}" onchange="updateMatch(${i},${mi},'score1',this.value)">
          <span>–</span>
          <input class="tk-input" style="width:60px;padding:6px 8px;font-size:0.8rem;" placeholder="Sc2" value="${m.score2 !== undefined ? m.score2 : ''}" onchange="updateMatch(${i},${mi},'score2',this.value)">
        </div>
      `).join('')}
    </div>
  `).join('') + `
    <div style="margin-top:16px;">
      <label class="tk-label">Champion:</label>
      <input class="tk-input" id="admin-champion-input" style="max-width:240px;" value="${escHtml(brackets.champion||'')}" placeholder="Gamer Tag">
    </div>
    <button class="tk-btn tk-btn-gold tk-mt-2" id="admin-save-brackets">💾 Save Brackets</button>
  `;
  document.getElementById('admin-save-brackets')?.addEventListener('click', () => {
    const b = TK.getBrackets();
    b.champion = document.getElementById('admin-champion-input')?.value.trim() || null;
    TK.saveBrackets(b);
    showToast('Brackets saved!', 'success');
  });
}

function updateMatch(roundIndex, matchIndex, field, value) {
  const b = TK.getBrackets();
  if (!b || !b.rounds[roundIndex]) return;
  b.rounds[roundIndex].matches[matchIndex][field] = value;
  // Auto-advance winner to next round
  if (field === 'winner' && b.rounds[roundIndex + 1]) {
    const nextMatchIdx = Math.floor(matchIndex / 2);
    const isFirstPlayer = matchIndex % 2 === 0;
    if (b.rounds[roundIndex + 1].matches[nextMatchIdx]) {
      b.rounds[roundIndex + 1].matches[nextMatchIdx][isFirstPlayer ? 'player1' : 'player2'] = value;
    }
  }
  TK.saveBrackets(b);
}

function renderAdminChampions() {
  const tbody = document.getElementById('admin-champs-tbody');
  if (!tbody) return;
  const champs = TK.getChampions();
  tbody.innerHTML = champs.length === 0
    ? `<tr><td colspan="5" style="text-align:center;color:var(--text-dim);padding:30px;">No champions added yet.</td></tr>`
    : champs.map(c => `
      <tr>
        <td style="color:var(--gold);font-family:'Orbitron',sans-serif;">${escHtml(c.year)}</td>
        <td style="color:var(--text-primary);">${escHtml(c.name)}</td>
        <td><span class="tk-text-neon">${escHtml(c.gamerTag||'')}</span></td>
        <td>${escHtml(c.character||'')}</td>
        <td>${escHtml(c.score||'')}</td>
      </tr>
    `).join('');
}

// ── ADMIN ACTIONS (global, called from inline handlers) ───────
window.adminAction = function(action, id) {
  const players = TK.getPlayers();
  const idx = players.findIndex(p => p.id === id);
  if (idx === -1) return;
  if (action === 'confirm') players[idx].status = 'confirmed';
  if (action === 'reject')  players[idx].status = 'rejected';
  TK.savePlayers(players);
  renderAdminStats();
  renderAdminRegistrations();
  renderAdminPayments();
  showToast(`Player ${action === 'confirm' ? 'confirmed ✅' : 'rejected ❌'}`, action === 'confirm' ? 'success' : 'error');
};

window.updateMatch = updateMatch;

// ── ADD CHAMPION (from admin form) ────────────────────────────
function initAddChampionForm() {
  const form = document.getElementById('admin-champ-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const champs = TK.getChampions();
    champs.unshift({
      id:        TK.generateId(),
      year:      form.querySelector('#champ-year').value.trim(),
      name:      form.querySelector('#champ-name').value.trim(),
      gamerTag:  form.querySelector('#champ-tag').value.trim(),
      character: form.querySelector('#champ-char').value.trim(),
      score:     form.querySelector('#champ-score').value.trim(),
      photo:     ''
    });
    TK.saveChampions(champs);
    renderAdminChampions();
    form.reset();
    showToast('Champion added!', 'success');
  });
}

// ── CSV EXPORT ────────────────────────────────────────────────
function exportCSV() {
  const players = TK.getPlayers();
  const headers = ['Name','Gamer Tag','Phone','Email','County','Age','Status','Payment Code','Registered At'];
  const rows = players.map(p => [
    p.fullName, p.gamerTag, p.phone, p.email, p.county, p.age,
    p.status, p.paymentCode, new Date(p.registeredAt).toLocaleString()
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `zenplay-mk2026-registrations-${Date.now()}.csv`;
  a.click();
  showToast('CSV exported!', 'success');
}
window.exportCSV = exportCSV;

// ── ANNOUNCEMENTS ────────────────────────────────────────────
function initAnnouncements() {
  const aForm = document.getElementById('admin-announce-form');
  if (!aForm) return;
  renderAnnouncements();
  aForm.addEventListener('submit', e => {
    e.preventDefault();
    const msg = aForm.querySelector('#announce-msg').value.trim();
    if (!msg) return;
    const list = TK.getAnnouncements();
    list.unshift({ id: TK.generateId(), message: msg, date: new Date().toISOString() });
    TK.saveAnnouncements(list);
    aForm.reset();
    renderAnnouncements();
    showToast('Announcement published!', 'success');
  });
}

function renderAnnouncements() {
  const list = document.getElementById('admin-announce-list');
  if (!list) return;
  const items = TK.getAnnouncements();
  list.innerHTML = items.map(a => `
    <div style="background:var(--charcoal2);border-radius:6px;padding:14px 18px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
      <div>
        <p style="font-size:0.88rem;color:var(--text-primary);margin:0 0 4px;">${escHtml(a.message)}</p>
        <span style="font-size:0.72rem;color:var(--text-dim);">${new Date(a.date).toLocaleString()}</span>
      </div>
      <button class="tk-btn tk-btn-sm tk-btn-danger" onclick="deleteAnnouncement('${a.id}')">🗑</button>
    </div>
  `).join('') || '<p style="color:var(--text-dim);font-size:0.85rem;">No announcements.</p>';
}
window.deleteAnnouncement = function(id) {
  TK.saveAnnouncements(TK.getAnnouncements().filter(a => a.id !== id));
  renderAnnouncements();
};

// ── HOME PAGE ANNOUNCEMENTS ───────────────────────────────────
function renderHomeAnnouncements() {
  const wrap = document.getElementById('tk-announcements');
  if (!wrap) return;
  const items = TK.getAnnouncements();
  if (items.length === 0) { wrap.closest('section')?.remove(); return; }
  wrap.innerHTML = items.slice(0, 3).map(a => `
    <div class="tk-card" style="border-left:3px solid var(--gold);">
      <p style="color:var(--text-primary);font-size:0.9rem;">${escHtml(a.message)}</p>
      <span style="font-size:0.75rem;color:var(--text-dim);margin-top:6px;display:block;">${new Date(a.date).toLocaleString()}</span>
    </div>
  `).join('');
}

// ── REG SEARCH (admin) ────────────────────────────────────────
function initAdminSearch() {
  const s = document.getElementById('admin-reg-search');
  if (s) s.addEventListener('input', renderAdminRegistrations);
}

// ── UTILITY ───────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function setEl(id, val) {
  const el = document.getElementById(id); if (el) el.textContent = val;
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNav();
  initCountdown();
  initToasts();
  initFAQ();
  initParticles();
  initRegistrationForm();
  initPaymentPage();
  initPlayersPage();
  initBracketsPage();
  initChampionsPage();
  initAdmin();
  initAddChampionForm();
  initAnnouncements();
  initAdminSearch();
  renderHomeAnnouncements();

  // QR code for registration page (initialised from within the page)
  if (typeof window.TK_INIT_QR !== 'undefined') window.TK_INIT_QR();

  // Admin bracket preview
  if (document.getElementById('admin-bracket-preview')) renderAdminBracketPreview();
});
