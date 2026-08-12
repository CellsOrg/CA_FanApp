/**
 * Cloud Alpacas Fan App — Utilities
 * Shared helper functions. Implement once, reuse everywhere.
 */

/** Format number as Korean won */
function formatPrice(n) {
  return n.toLocaleString('ko-KR') + '원';
}

/** Format date string (YYYY-MM-DD) to display */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateFull(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/** Format a jersey/jacket's size + marking-player choice as one display line */
function formatSizeMarking(size, markingPlayerId) {
  if (!size) return '';
  const markingName = markingPlayerId ? DATA.players.find(p => p.id === markingPlayerId)?.name : null;
  return `사이즈: ${size}${markingName ? ` · 마킹: ${markingName}` : ''}`;
}

/** Show a toast message */
function showToast(message, duration = 2000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.getElementById('app').appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

/** Navigate to a screen */
function navigateTo(screenId, pushHistory = true) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    target.scrollTop = 0;
  }

  // Refresh screens whose content can go stale between visits (new purchases, etc.)
  if (screenId === 'my-page') renderMyPageContent();

  // Update bottom nav active state
  const navScreens = { 'ticket': 'ticket', 'goods': 'goods', 'checkin': 'checkin', 'my-page': 'my-page', 'notifications': 'my-page', 'benefits': 'my-page' };
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navTarget = navScreens[screenId];
  if (navTarget) {
    document.querySelector(`.nav-item[data-screen="${navTarget}"]`)?.classList.add('active');
  }

  // Show/hide bottom nav
  const noNavScreens = ['splash', 'login', 'signup', 'favorite-player', 'purchase-confirm'];
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) {
    bottomNav.style.display = noNavScreens.includes(screenId) ? 'none' : 'flex';
  }

  if (pushHistory) {
    history.pushState({ screen: screenId }, '', `#${screenId}`);
  }

  // Track engagement signal
  trackEngagement('App Screen View', screenId);
}

/** Open modal */
function openModal(modalId) {
  document.getElementById(modalId)?.classList.add('active');
}

/** Close modal */
function closeModal(modalId) {
  document.getElementById(modalId)?.classList.remove('active');
}

/** Toggle chip selection within a group. Single-select by default; pass multiSelect=true to allow multiple. */
function initChipGroup(container, onChange, multiSelect = false) {
  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (multiSelect) {
        chip.classList.toggle('active');
      } else {
        container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      }
      if (onChange) onChange(chip.dataset.value);
    });
  });
}

/** Toggle checkbox */
function initCheckbox(el) {
  el.addEventListener('click', () => {
    el.classList.toggle('checked');
  });
}

/** Track Engagement Signal (→ Salesforce Engagement_Signal__c) */
function trackEngagement(type, source, playerId = null) {
  const signal = {
    type: type,
    source: source,
    player: playerId,
    date: new Date().toISOString(),
  };
  // In MVP: log to console. In production: POST to Salesforce API.
  console.log('[Engagement Signal]', signal);

  // Store locally for demo
  if (!window._engagementLog) window._engagementLog = [];
  window._engagementLog.push(signal);
}

/** Generate a simple QR-like SVG (placeholder) */
function generateQRPlaceholder() {
  // Simple grid pattern as QR placeholder
  let cells = '';
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      if (Math.random() > 0.5 || (i < 4 && j < 4) || (i < 4 && j > 10) || (i > 10 && j < 4)) {
        cells += `<rect x="${j * 10 + 5}" y="${i * 10 + 5}" width="9" height="9" fill="#111"/>`;
      }
    }
  }
  return `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">${cells}</svg>`;
}
