/**
 * Cloud Alpacas Fan App — Shared Components
 * Render reusable UI once, load everywhere.
 */

/** ── Bottom Navigation ── */
function renderBottomNav() {
  return `
  <nav class="bottom-nav" id="bottom-nav" style="display:none;">
    <button class="nav-item" data-screen="ticket">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7l7-4 3 3-7 4-3-3z" stroke-linejoin="round"/><path d="M13 6l8-4-4 8-3-1-1-3z" stroke-linejoin="round"/></svg>
      <span>예매</span>
    </button>
    <button class="nav-item" data-screen="goods">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 01-8 0"/></svg>
      <span>굿즈</span>
    </button>
    <button class="nav-item" data-screen="checkin">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
      <span>입장</span>
    </button>
    <button class="nav-item" data-screen="my-page">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span>마이</span>
    </button>
  </nav>`;
}

function initBottomNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.screen));
  });
}

/** ── Back Button Header ── */
function renderPageHeader(title, backScreen) {
  return `
  <div class="page-header">
    <button class="back-btn" onclick="navigateTo('${backScreen}')">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <span class="page-title">${title}</span>
  </div>`;
}

/** ── Product Grid ── */
function renderProductGrid(products, thumbClass = 'product-thumb--wide', onSelect) {
  const gridId = 'grid-' + Math.random().toString(36).substr(2, 6);
  setTimeout(() => {
    document.querySelectorAll(`#${gridId} .product-card`).forEach(card => {
      card.addEventListener('click', () => {
        // Single select within this grid
        document.querySelectorAll(`#${gridId} .product-card`).forEach(c => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        if (onSelect) onSelect(card.dataset.id);
      });
    });
  }, 0);

  return `<div class="product-grid" id="${gridId}">
    ${products.map(p => `
      <div class="product-card" data-id="${p.id}">
        <div class="check-badge">✓</div>
        <img class="product-thumb ${thumbClass}" src="${p.image}" alt="${p.name}" onerror="this.style.background='var(--bg-elevated)'">
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-price">${formatPrice(p.price)}</div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

/** ── Segmented Tab ── */
function renderSegmentedTab(tabs, activeIndex, onSwitch) {
  const tabId = 'seg-' + Math.random().toString(36).substr(2, 6);
  setTimeout(() => {
    document.querySelectorAll(`#${tabId} .segmented-item`).forEach((item, i) => {
      item.addEventListener('click', () => {
        document.querySelectorAll(`#${tabId} .segmented-item`).forEach(t => t.classList.remove('active'));
        item.classList.add('active');
        if (onSwitch) onSwitch(i, item.dataset.value);
      });
    });
  }, 0);

  return `<div class="segmented" id="${tabId}">
    ${tabs.map((t, i) => `<button class="segmented-item ${i === activeIndex ? 'active' : ''}" data-value="${t}">${t}</button>`).join('')}
  </div>`;
}

/** ── Game List ── */
function renderGameList(games, onSelect) {
  const listId = 'games-' + Math.random().toString(36).substr(2, 6);
  setTimeout(() => {
    document.querySelectorAll(`#${listId} .game-card`).forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll(`#${listId} .game-card`).forEach(c => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        if (onSelect) onSelect(card.dataset.id);
      });
    });
  }, 0);

  return `<div class="game-list" id="${listId}">
    ${games.map(g => {
      const d = new Date(g.date);
      const month = d.getMonth() + 1;
      const day = d.getDate();
      return `
      <div class="game-card" data-id="${g.id}">
        <div class="game-date">
          <div class="month">${month}월</div>
          <div class="day">${day}</div>
          <div class="weekday">${g.weekday}</div>
        </div>
        <div class="game-details">
          <div class="game-matchup">${g.home} vs ${g.away}</div>
          <div class="game-meta">${g.time} · ${g.stadium}</div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

/** ── Purchase History Row ── */
function renderPurchaseRow(order) {
  const statusClass = order.status === 'Paid' ? 'paid' : order.status === 'Refunded' ? 'refunded' : 'pending';
  const statusText = order.status === 'Paid' ? '결제완료' : order.status === 'Refunded' ? '환불' : '대기';
  return `
  <div class="purchase-row">
    <img class="purchase-thumb" src="${order.image}" alt="" onerror="this.style.background='var(--bg-elevated)'">
    <div class="purchase-info">
      <div class="purchase-name">${order.productName}</div>
      <div class="purchase-meta">${formatDateFull(order.date)} · ${order.channel}</div>
    </div>
    <span class="purchase-status ${statusClass}">${statusText}</span>
  </div>`;
}

/** ── Notification Row ── */
function renderNotificationRow(noti) {
  return `
  <div class="list-row">
    <div class="list-row-icon">${noti.icon}</div>
    <div class="list-row-content">
      <div class="list-row-title">${noti.title}</div>
      <div class="list-row-desc">${noti.desc}</div>
    </div>
    <div class="list-row-time">${formatDate(noti.date)}</div>
  </div>`;
}

/** ── Benefit Card ── */
function renderBenefitCard(benefit) {
  const statusText = benefit.status === 'Issued' ? '사용 가능' : benefit.status === 'Used' ? '사용 완료' : '만료';
  const statusClass = benefit.status.toLowerCase();
  return `
  <div class="benefit-card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-sm);">
      <span class="benefit-badge ${statusClass}">${statusText}</span>
      <span class="text-caption">${formatDateFull(benefit.issuedDate)}</span>
    </div>
    <div style="font-weight:var(--font-weight-bold); margin-bottom:var(--space-xs);">${benefit.title}</div>
    <div class="text-caption">${benefit.recommendation ? benefit.recommendation : '일반 혜택'}</div>
    ${benefit.status === 'Issued' ? `
    <button class="btn btn-primary btn-sm" style="margin-top:var(--space-md);" onclick="useBenefit('${benefit.id}')">사용하기</button>
    ` : ''}
    ${benefit.expirationDate ? `<div class="text-caption" style="margin-top:var(--space-sm);">유효기간: ~${formatDateFull(benefit.expirationDate)}</div>` : ''}
  </div>`;
}

/** ── Checkout Footer Buttons (Ticket / Goods) ── */
function renderCheckoutButtons() {
  return `
  <div class="footer-cta-buttons">
    <button class="btn btn-secondary" onclick="addCurrentSelectionToCart()">장바구니에 담기</button>
    <button class="btn btn-primary" onclick="handleBuyNow()">바로 결제하기</button>
  </div>`;
}

/** ── Cart Icon (header, Ticket / Goods) ── */
function renderCartIconButton() {
  return `
  <button class="cart-icon-btn" onclick="goToCart()" title="장바구니">
    🛒<span class="cart-badge hidden">0</span>
  </button>`;
}

/** ── Cart Item Row (Cart page + cart checkout summary) ── */
function renderCartItemRow(item, editable) {
  const subtotal = item.product.price * item.quantity;
  return `
  <div class="cart-item-row" data-cart-id="${item.cartId}">
    <img class="cart-item-thumb" src="${item.product.image}" alt="${item.product.name}" onerror="this.style.background='var(--bg-elevated)'">
    <div class="cart-item-info">
      <div class="cart-item-name">${item.product.name}</div>
      ${item.game ? `<div class="text-caption">${item.game.home} vs ${item.game.away}</div>` : ''}
      ${item.size ? `<div class="text-caption">${formatSizeMarking(item.size, item.markingPlayer)}</div>` : ''}
      <div class="cart-item-price">${formatPrice(subtotal)}</div>
    </div>
    ${editable ? `
    <div class="cart-item-qty">
      <button class="qty-btn" onclick="changeCartItemQty('${item.cartId}', -1)">−</button>
      <span class="qty-value">${item.quantity}</span>
      <button class="qty-btn" onclick="changeCartItemQty('${item.cartId}', 1)">+</button>
    </div>
    <button class="cart-item-remove" onclick="removeCartItem('${item.cartId}')" title="삭제">✕</button>
    ` : `<div class="cart-item-qty-label">${item.quantity}개</div>`}
  </div>`;
}

/** ── Add-to-Cart Confirmation Modal ── */
function renderAddToCartModal() {
  return `
  <div class="modal-overlay" id="add-to-cart-modal">
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="cart-modal-body">
        <div class="cart-modal-icon">🛒</div>
        <div class="text-heading" style="text-align:center;">장바구니에 담았습니다</div>
        <div class="text-caption" id="cart-modal-product-name" style="text-align:center;margin-top:6px;"></div>
      </div>
      <div class="cart-modal-actions">
        <button class="btn btn-secondary" onclick="continueBrowsingFromModal()">더 둘러보기</button>
        <button class="btn btn-primary" onclick="goToCartFromModal()">장바구니 가기</button>
      </div>
    </div>
  </div>`;
}

/** ── Size / Marking-Player Modal (Jersey, Jacket) ── */
function renderSizeMarkingModal() {
  return `
  <div class="modal-overlay" id="size-marking-modal">
    <div class="modal-sheet" style="position:relative;">
      <button class="modal-close-btn" onclick="closeSizeMarkingModal()" aria-label="닫기">✕</button>
      <div class="modal-handle"></div>
      <div id="size-marking-modal-content"></div>
    </div>
  </div>`;
}
