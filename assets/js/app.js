/**
 * Cloud Alpacas Fan App — Main Application
 * Screen rendering, state management, initialization.
 */

/* ══════════════════════════════════════════════════════════════
   APP STATE
   ══════════════════════════════════════════════════════════════ */
const APP = {
  selectedGame: null,
  selectedProduct: null,
  selectedQuantity: 1,
  purchaseType: null, // 'Ticket Purchase' | 'Goods Purchase' | 'Membership Enrollment' | 'Season Pass'
  purchaseMode: "direct", // 'direct' (single item) | 'cart' (checkout from cart)
  ticketTab: 0, // 0=티켓, 1=멤버십, 2=시즌권
  goodsChannel: 0, // 0=온라인, 1=구장
  goodsCategory: "전체",
  signupData: {
    name: "",
    phone: "",
    channel: [],
    consent: {
      terms: false,
      privacy: false,
      email: false,
      sms: false,
      push: false,
      kakao: false,
    },
  },
  selectedPlayer: null,
  cart: [], // { cartId, purchaseType, product, game, quantity, size, markingPlayer }
  addToCartOrigin: null, // 'ticket' | 'goods' — which page the last "장바구니에 담기" happened from
  selectedPaymentMethod: "card", // 'card' | 'simple' | 'transfer'
  appliedCoupon: null, // Benefit__c id
  selectedSize: null, // for direct-purchase jersey/jacket
  selectedMarkingPlayer: null, // Contact id or null — for direct-purchase jersey/jacket
  pendingCartAction: null, // 'buyNow' | 'addToCart' — deferred while the size/marking modal is open
};

/* ══════════════════════════════════════════════════════════════
   SCREEN RENDERERS
   ══════════════════════════════════════════════════════════════ */

function renderSplash() {
  return `
  <div class="screen no-nav" id="splash">
    <img class="splash-img" src="assets/images/splash-bg.png" alt="Cloud Alpacas"
         onerror="this.parentElement.style.background='var(--color-primary)'"
         style="width:100%;height:100dvh;object-fit:cover;animation:splashZoom 2s ease-in-out;cursor:pointer;"
         onclick="navigateTo('login')">
  </div>`;
}

function renderLogin() {
  return `
  <div class="screen no-nav" id="login">
    <div class="login-glow"></div>
    <div style="position:relative;z-index:1;">
      <img src="assets/images/login-logo.png" alt="Cloud Alpacas" class="avatar" style="width:120px;height:120px;"
           onerror="this.style.background='var(--color-primary)';this.style.borderRadius='50%'">
      <div class="text-title" style="margin-top:20px;text-align:center;">Cloud Alpacas</div>
      <div class="text-subtitle" style="margin-top:10px;text-align:center;">다시 만나서 반가워요!<br>휴대폰 번호로 <span class="text-primary" style="font-weight:700;">간편하게</span> 로그인하세요.</div>
    </div>
    <div class="card card-lg" style="position:relative;z-index:1;margin-top:28px;">
      <label class="field-label">휴대폰 번호</label>
      <input type="tel" class="field-input" placeholder="010-0000-0000" id="login-phone">
      <div class="checkbox-row checked" style="margin-top:18px;" onclick="this.classList.toggle('checked')">
        <div class="checkbox-box"><span class="check-icon">✓</span></div>
        <div class="text-caption">자동 로그인</div>
      </div>
    </div>
    <div class="spacer"></div>
    <button class="btn btn-primary" style="position:relative;z-index:1;" onclick="handleLogin()">로그인</button>
    <div style="position:relative;z-index:1;text-align:center;margin-top:18px;font-size:13px;color:var(--text-secondary);cursor:pointer;" onclick="navigateTo('signup')">
      처음이신가요? <span class="text-primary" style="font-weight:700;">회원가입</span>
    </div>
  </div>`;
}

function renderSignup() {
  return `
  <div class="screen no-nav" id="signup" style="overflow:auto;padding:56px 24px 28px;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="cursor:pointer;" onclick="navigateTo('login')"><path d="M15 6l-6 6 6 6" stroke="var(--text)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>

    <div class="text-heading" style="font-size:26px;margin-top:18px;">회원가입</div>
    <div class="text-caption" style="margin-top:6px;">간단한 정보만 입력해주세요.</div>

    <!-- Benefits -->
    <div style="display:flex;flex-direction:column;gap:18px;margin-top:26px;">
      <div class="signup-benefit-row">
        <div class="signup-benefit-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 10l7-4 3 3-7 4-3-3z" stroke="#FC4E00" stroke-width="1.6" stroke-linejoin="round"/><path d="M13 9l8-4-4 8-3-1-1-3z" stroke="#FC4E00" stroke-width="1.6" stroke-linejoin="round"/></svg></div>
        <div><div class="text-body" style="font-weight:700;">티켓 예매 &amp; 입장</div><div class="text-caption" style="margin-top:2px;">빠르고 간편한 티켓 예매와 입장</div></div>
      </div>
      <div class="signup-benefit-row">
        <div class="signup-benefit-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 8h16v4H4V8z" stroke="#FC4E00" stroke-width="1.6" stroke-linejoin="round"/><path d="M5 12v6a1 1 0 001 1h12a1 1 0 001-1v-6M12 8v9" stroke="#FC4E00" stroke-width="1.6"/></svg></div>
        <div><div class="text-body" style="font-weight:700;">멤버십 &amp; 혜택</div><div class="text-caption" style="margin-top:2px;">멤버십 전용 혜택과 이벤트 제공</div></div>
      </div>
      <div class="signup-benefit-row">
        <div class="signup-benefit-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 4v16M6 5h10l-2 3 2 3H6" stroke="#FC4E00" stroke-width="1.6" stroke-linejoin="round"/></svg></div>
        <div><div class="text-body" style="font-weight:700;">경기 정보 &amp; 알림</div><div class="text-caption" style="margin-top:2px;">실시간 경기 정보와 맞춤 알림</div></div>
      </div>
    </div>

    <!-- Form -->
    <div style="margin-top:28px;display:flex;flex-direction:column;gap:16px;">
      <div>
        <label class="field-label">이름</label>
        <input type="text" class="field-input" placeholder="이름을 입력하세요" id="signup-name">
      </div>
      <div>
        <label class="field-label">휴대폰 번호</label>
        <input type="tel" class="field-input" placeholder="010-0000-0000" id="signup-phone">
      </div>
    </div>

    <!-- Acquisition Channel -->
    <div style="margin-top:24px;">
      <label class="field-label">어떻게 Cloud Alpacas를 알게 되셨나요?</label>
      <div class="chip-group" id="signup-channel-chips" style="margin-top:8px;">
        <button class="chip" data-value="Instagram">Instagram</button>
        <button class="chip" data-value="카카오톡">카카오톡</button>
        <button class="chip" data-value="지인 추천">지인 추천</button>
        <button class="chip" data-value="검색">검색</button>
        <button class="chip" data-value="오프라인">오프라인</button>
        <button class="chip" data-value="직접입력">직접입력</button>
      </div>
    </div>

    <!-- Marketing Consent (NEW — #9) -->
    <div class="consent-section">
      <div class="text-body" style="font-weight:700;margin-bottom:var(--space-md);">약관 동의</div>
      <div class="checkbox-row consent-all" onclick="toggleAllConsent(this)">
        <div class="checkbox-box"><span class="check-icon">✓</span></div>
        <div class="text-body" style="font-weight:700;">전체 동의</div>
      </div>

      <div class="text-label" style="margin-top:var(--space-md);">필수</div>
      <div class="checkbox-row" data-consent="terms" data-required="true" onclick="toggleConsent(this)">
        <div class="checkbox-box"><span class="check-icon">✓</span></div>
        <div class="text-caption">[필수] 서비스 이용약관 동의</div>
      </div>
      <div class="checkbox-row" data-consent="privacy" data-required="true" onclick="toggleConsent(this)">
        <div class="checkbox-box"><span class="check-icon">✓</span></div>
        <div class="text-caption">[필수] 개인정보 수집 및 이용 동의</div>
      </div>

      <div class="text-label" style="margin-top:var(--space-md);">선택</div>
      <div class="checkbox-row" data-consent="email" onclick="toggleConsent(this)">
        <div class="checkbox-box"><span class="check-icon">✓</span></div>
        <div class="text-caption">[선택] 이메일 수신 동의</div>
      </div>
      <div class="checkbox-row" data-consent="sms" onclick="toggleConsent(this)">
        <div class="checkbox-box"><span class="check-icon">✓</span></div>
        <div class="text-caption">[선택] SMS 수신 동의</div>
      </div>
      <div class="checkbox-row" data-consent="push" onclick="toggleConsent(this)">
        <div class="checkbox-box"><span class="check-icon">✓</span></div>
        <div class="text-caption">[선택] 앱 푸시 수신 동의</div>
      </div>
      <div class="checkbox-row" data-consent="kakao" onclick="toggleConsent(this)">
        <div class="checkbox-box"><span class="check-icon">✓</span></div>
        <div class="text-caption">[선택] 카카오 알림톡 수신 동의</div>
      </div>
    </div>

    <button class="btn btn-primary" style="margin-top:28px;" onclick="handleSignup()">회원가입</button>
  </div>`;
}

function renderFavoritePlayer() {
  const positions = ["전체", "투수", "포수", "내야수", "외야수"];
  return `
  <div class="screen no-nav" id="favorite-player" style="overflow:auto;padding-top:16px;">
    ${renderPageHeader("제일 응원하는 선수는?", "signup")}
    <div class="text-caption" style="padding:0 24px;margin-bottom:16px;">응원하는 선수를 선택하면 맞춤 소식을 받을 수 있어요.</div>

    <div class="player-search">
      <input type="text" class="field-input" placeholder="선수 이름 검색" id="player-search-input" oninput="filterPlayers()">
    </div>

    <div class="player-filters">
      <div class="chip-group" id="player-position-chips">
        ${positions.map((p, i) => `<button class="chip ${i === 0 ? "active" : ""}" data-value="${p}">${p}</button>`).join("")}
      </div>
    </div>

    <div class="player-card-grid" id="player-grid"></div>

    <div style="padding:0 24px 32px;">
      <button class="btn btn-primary" onclick="handleSelectPlayer()">선택 완료</button>
    </div>
  </div>`;
}

function renderTicketPage() {
  return `
  <div class="screen" id="ticket" style="overflow:auto;padding-top:16px;">
    <div class="section-title-row">
      <div class="section-title">예매</div>
      ${renderCartIconButton()}
    </div>

    <div style="padding:0 var(--space-2xl);margin-bottom:var(--space-lg);">
      ${renderSegmentedTab(["티켓", "멤버십", "시즌권"], 0, handleTicketTabSwitch)}
    </div>

    <div id="ticket-tab-content"></div>

    <div class="footer-cta hidden" id="ticket-footer-cta">
      ${renderCheckoutButtons()}
    </div>
  </div>`;
}

function renderGoodsPage() {
  return `
  <div class="screen" id="goods" style="overflow:auto;padding-top:16px;">
    <div class="section-title-row">
      <div class="section-title">굿즈</div>
      ${renderCartIconButton()}
    </div>

    <div style="padding:0 var(--space-2xl);margin-bottom:var(--space-md);">
      ${renderSegmentedTab(["온라인 스토어", "구장 굿즈샵"], 0, handleGoodsChannelSwitch)}
    </div>

    <div class="text-tab-row" id="goods-category-tabs"></div>

    <div id="goods-grid-content"></div>

    <div class="footer-cta hidden" id="goods-footer-cta">
      ${renderCheckoutButtons()}
    </div>
  </div>`;
}

function renderCheckinPage() {
  const fan = DATA.currentFan;
  const nextGame = DATA.games[0];
  return `
  <div class="screen" id="checkin" style="overflow:auto;padding-top:16px;">
    <div class="section-title">입장</div>

    <div class="checkin-ticket-card">
      <img class="checkin-ticket-thumb" src="assets/images/checkin-match.png" alt=""
           onerror="this.style.background='var(--bg-elevated)'">
      <div>
        <div style="font-weight:var(--font-weight-bold);">${nextGame.home} vs ${nextGame.away}</div>
        <div class="text-caption">${formatDateFull(nextGame.date)} ${nextGame.time}</div>
        <div class="text-caption">${nextGame.stadium}</div>
      </div>
    </div>

    <div class="card" style="margin:var(--space-lg) var(--space-2xl);text-align:center;">
      <div class="text-caption" style="margin-bottom:var(--space-md);">QR 코드를 게이트에 보여주세요</div>
      <div class="qr-container" id="qr-display">${generateQRPlaceholder()}</div>
      <div class="text-caption" style="margin-top:var(--space-md);">입장권: 1루 내야석 A구역</div>
    </div>

    <div class="footer-cta">
      <button class="btn btn-primary" onclick="handleCheckin()">입장 확인</button>
    </div>
  </div>`;
}

function renderMyPage() {
  const fan = DATA.currentFan;
  return `
  <div class="screen" id="my-page" style="overflow:auto;padding-top:16px;">
    <!-- Profile Row -->
    <div class="my-profile-row">
      <img class="my-avatar" src="${fan.avatarUrl}" alt="" onerror="this.style.background='var(--bg-elevated)'">
      <div class="my-profile-info">
        <div class="my-profile-name">${fan.name}</div>
        <div class="my-profile-phone">${fan.phone}</div>
      </div>
      <div class="my-actions">
        <button class="my-action-btn" onclick="toggleTheme()" title="테마 변경">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        </button>
        <button class="my-action-btn" onclick="handleLogout()" title="로그아웃">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        </button>
      </div>
    </div>

    <!-- Favorite Player Banner -->
    <div class="my-fav-player-banner">
      <img class="fav-player-img" src="assets/images/player-moontaeyang.png" alt="" onerror="this.style.background='var(--bg-elevated)'">
      <div>
        <div class="fav-player-label">MY PLAYER</div>
        <div class="fav-player-name">문태양 #1</div>
      </div>
    </div>

    <!-- Quick Links (Notifications / Benefits) — NEW -->
    <div style="display:flex;gap:var(--space-md);padding:0 var(--space-2xl);margin-bottom:var(--space-lg);">
      <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="navigateTo('notifications')">
        🔔 알림 <span class="text-primary" style="font-weight:700;">${DATA.notifications.length}</span>
      </button>
      <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="navigateTo('benefits')">
        🎁 혜택 <span class="text-primary" style="font-weight:700;">${DATA.benefits.filter((b) => b.status === "Issued").length}</span>
      </button>
    </div>

    <!-- Stat Grid -->
    <div style="padding:0 var(--space-2xl);margin-bottom:var(--space-xl);">
      <div class="stat-grid" id="my-stat-grid"></div>
    </div>

    <!-- Recent Purchases -->
    <div class="section-title">최근 구매</div>
    <div style="padding:0 var(--space-2xl);" id="my-purchases-list"></div>

    <div style="height:40px;"></div>
  </div>`;
}

function renderMyPageContent() {
  const stats = DATA.fanStats;

  const statGrid = document.getElementById("my-stat-grid");
  if (statGrid) {
    statGrid.innerHTML = `
      <div class="stat-card">
        <div class="text-caption">멤버십</div>
        <div class="stat-value" style="color:var(--color-primary);">${stats.membership}</div>
      </div>
      <div class="stat-card">
        <div class="text-caption">시즌권</div>
        <div class="stat-value">${stats.seasonPass}</div>
      </div>
      <div class="stat-card">
        <div class="text-caption">티켓</div>
        <div class="stat-value">${stats.totalTickets}</div>
        <div class="stat-label">구매</div>
      </div>
      <div class="stat-card">
        <div class="text-caption">관람</div>
        <div class="stat-value">${stats.totalAttendance}</div>
        <div class="stat-label">회</div>
      </div>
    `;
  }

  const purchasesList = document.getElementById("my-purchases-list");
  if (purchasesList) {
    purchasesList.innerHTML =
      DATA.orders.length > 0
        ? DATA.orders.map((o) => renderPurchaseRow(o)).join("")
        : '<div class="empty-state"><p>아직 구매 내역이 없습니다.</p></div>';
  }
}

function renderNotificationsPage() {
  return `
  <div class="screen" id="notifications" style="overflow:auto;padding-top:16px;">
    ${renderPageHeader("알림", "my-page")}
    <div class="notification-list">
      ${
        DATA.notifications.length > 0
          ? DATA.notifications.map((n) => renderNotificationRow(n)).join("")
          : '<div class="empty-state"><p>아직 알림이 없습니다.</p></div>'
      }
    </div>
  </div>`;
}

function renderBenefitsPage() {
  return `
  <div class="screen" id="benefits" style="overflow:auto;padding-top:16px;">
    ${renderPageHeader("내 혜택", "my-page")}
    <div class="benefits-list">
      ${
        DATA.benefits.length > 0
          ? DATA.benefits.map((b) => renderBenefitCard(b)).join("")
          : '<div class="empty-state"><p>아직 받은 혜택이 없습니다.</p></div>'
      }
    </div>
  </div>`;
}

function renderPurchaseConfirm() {
  return `
  <div class="screen no-nav" id="purchase-confirm" style="overflow:auto;padding-top:16px;">
    <div class="page-header">
      <button class="back-btn" onclick="handlePurchaseConfirmBack()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="page-title">결제 확인</span>
    </div>
    <div id="purchase-confirm-content"></div>
  </div>`;
}

function renderCartPage() {
  return `
  <div class="screen" id="cart" style="overflow:auto;padding-top:16px;">
    ${renderPageHeader("장바구니", "ticket")}
    <div id="cart-content"></div>
  </div>`;
}

/* ══════════════════════════════════════════════════════════════
   EVENT HANDLERS
   ══════════════════════════════════════════════════════════════ */

function handleLogin() {
  trackEngagement("Login", "Fan App");
  navigateTo("ticket");
  showToast("환영합니다, 이루키님! 🎉");
}

async function handleSignup() {
  const name = document.getElementById("signup-name")?.value;
  const phone = document.getElementById("signup-phone")?.value;
  if (!name || !phone) {
    showToast("이름과 휴대폰 번호를 입력해주세요.");
    return;
  }

  const requiredRows = document.querySelectorAll(
    '.checkbox-row[data-consent][data-required="true"]',
  );
  const allRequiredChecked = [...requiredRows].every((row) =>
    row.classList.contains("checked"),
  );
  if (!allRequiredChecked) {
    showToast("필수 항목에 동의해주세요.");
    return;
  }

  // Collect consent data → Salesforce Person Account fields
  const consentRows = document.querySelectorAll(".checkbox-row[data-consent]");
  consentRows.forEach((row) => {
    const key = row.dataset.consent;
    APP.signupData.consent[key] = row.classList.contains("checked");
  });

  APP.signupData.name = name;
  APP.signupData.phone = phone;

  const activeChips = document.querySelectorAll(
    "#signup-channel-chips .chip.active",
  );
  APP.signupData.channel = [...activeChips].map((chip) => chip.dataset.value);

  const result = await callSalesforceApi("signup", {
    name: APP.signupData.name,
    phone: APP.signupData.phone,
    channel: APP.signupData.channel,
    consent: APP.signupData.consent,
  });
  if (result.success) {
    APP.currentFanId = result.accountId;
    saveFanId(result.accountId);
  } else {
    console.warn("[Signup] Salesforce sync skipped:", result.error);
  }
  trackEngagement("Signup", "Fan App");
  navigateTo("favorite-player");
}

function toggleConsent(el) {
  el.classList.toggle("checked");
  // Update "all" checkbox
  const allChecked = [
    ...document.querySelectorAll(".checkbox-row[data-consent]"),
  ].every((r) => r.classList.contains("checked"));
  const allCheckbox = document.querySelector(".consent-all");
  if (allCheckbox) allCheckbox.classList.toggle("checked", allChecked);
}

function toggleAllConsent(el) {
  el.classList.toggle("checked");
  const isChecked = el.classList.contains("checked");
  document.querySelectorAll(".checkbox-row[data-consent]").forEach((r) => {
    r.classList.toggle("checked", isChecked);
  });
}

function filterPlayers() {
  const search =
    document.getElementById("player-search-input")?.value.toLowerCase() || "";
  const activePos =
    document.querySelector("#player-position-chips .chip.active")?.dataset
      .value || "전체";
  renderPlayerGrid(search, activePos);
}

function renderPlayerGrid(search = "", position = "전체") {
  let filtered = DATA.players;
  if (position !== "전체")
    filtered = filtered.filter((p) => p.position === position);
  if (search)
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(search));

  const grid = document.getElementById("player-grid");
  if (!grid) return;

  const noneCard = `
    <div class="player-card player-card-none ${APP.selectedPlayer === "none" ? "is-selected" : ""}" data-id="none" onclick="selectPlayer('none')">
      <div class="check-badge">✓</div>
      <div class="player-none-icon">?</div>
      <div class="player-info">
        <div class="player-name">아직 없음</div>
      </div>
    </div>`;

  grid.innerHTML =
    noneCard +
    filtered
      .map(
        (p) => `
    <div class="player-card ${APP.selectedPlayer === p.id ? "is-selected" : ""}" data-id="${p.id}" onclick="selectPlayer('${p.id}')">
      <div class="check-badge">✓</div>
      <img class="player-photo" src="${p.photo}" alt="${p.name}" onerror="this.style.background='var(--bg-elevated)'">
      <div class="player-info">
        <div class="player-name">${p.name}</div>
        <div class="player-number">#${p.number}</div>
        <div class="player-position">${p.position}</div>
      </div>
    </div>
  `,
      )
      .join("");
}

function selectPlayer(id) {
  APP.selectedPlayer = APP.selectedPlayer === id ? null : id;
  renderPlayerGrid(
    document.getElementById("player-search-input")?.value.toLowerCase() || "",
    document.querySelector("#player-position-chips .chip.active")?.dataset
      .value || "전체",
  );
}

async function handleSelectPlayer() {
  if (!APP.selectedPlayer) {
    showToast("선수를 선택해주세요.");
    return;
  }

  if (APP.selectedPlayer === "none") {
    const result = await callSalesforceApi("favorite-player", {
      fanId: APP.currentFanId,
      playerId: null,
    });
    if (!result.success) {
      console.warn("[FavoritePlayer] Salesforce sync skipped:", result.error);
    }
    trackEngagement("Favorite Player Selected", "Fan App", null);
    navigateTo("ticket");
    showToast("나중에 언제든 선택할 수 있어요!");
    return;
  }

  const player = DATA.players.find((p) => p.id === APP.selectedPlayer);
  const result = await callSalesforceApi("favorite-player", {
    fanId: APP.currentFanId,
    playerId: APP.selectedPlayer,
  });
  if (!result.success) {
    console.warn("[FavoritePlayer] Salesforce sync skipped:", result.error);
  }
  trackEngagement("Favorite Player Selected", "Fan App", APP.selectedPlayer);
  navigateTo("ticket");
  showToast(`${player.name} 선수를 응원합니다! ⚾`);
}

/* ── Ticket Tab ── */
function handleTicketTabSwitch(index, value) {
  APP.ticketTab = index;
  APP.selectedProduct = null;
  APP.selectedGame = null;
  document.getElementById("ticket-footer-cta")?.classList.add("hidden");
  renderTicketTabContent();
}

function renderTicketTabContent() {
  const container = document.getElementById("ticket-tab-content");
  if (!container) return;

  if (APP.ticketTab === 0) {
    // Ticket — Game Select (NEW #10) + Seat Select
    container.innerHTML = `
      <div class="section-title" style="font-size:var(--font-size-base);">경기 선택</div>
      ${renderGameList(DATA.games, (gameId) => {
        APP.selectedGame = gameId;
        checkTicketReady();
      })}
      <div class="section-title" style="font-size:var(--font-size-base);margin-top:var(--space-lg);">좌석 선택</div>
      ${renderProductGrid(DATA.tickets, "product-thumb--wide", (id) => {
        APP.selectedProduct = id;
        APP.purchaseType = "Ticket Purchase";
        checkTicketReady();
      })}
    `;
  } else if (APP.ticketTab === 1) {
    container.innerHTML = `
      <div class="match-hero" style="background-image:url('assets/images/membership-hero-bg.png');background-color:var(--bg-elevated);">
        <div class="match-hero-overlay"></div>
        <div class="match-hero-content"><div class="match-teams">MEMBERSHIP</div><div class="match-info">Cloud Alpacas 멤버십</div></div>
      </div>
      ${renderProductGrid(DATA.memberships, "product-thumb--wide", (id) => {
        APP.selectedProduct = id;
        APP.purchaseType = "Membership Enrollment";
        showFooterCta("ticket-footer-cta");
      })}
    `;
  } else {
    container.innerHTML = `
      <div class="match-hero" style="background-image:url('assets/images/season-hero-bg.png');background-color:var(--bg-elevated);">
        <div class="match-hero-overlay"></div>
        <div class="match-hero-content"><div class="match-teams">SEASON PASS</div><div class="match-info">2026 시즌권</div></div>
      </div>
      ${renderProductGrid(DATA.seasonPasses, "product-thumb--wide", (id) => {
        APP.selectedProduct = id;
        APP.purchaseType = "Season Pass";
        showFooterCta("ticket-footer-cta");
      })}
    `;
  }
}

function checkTicketReady() {
  if (APP.ticketTab === 0 && APP.selectedGame && APP.selectedProduct) {
    showFooterCta("ticket-footer-cta");
  }
}

function showFooterCta(id) {
  document.getElementById(id)?.classList.remove("hidden");
}

function handleBuyNow() {
  if (!APP.purchaseType || !APP.selectedProduct) {
    showToast("상품을 선택해주세요.");
    return;
  }
  const { product } = findSelectedProductAndGame(
    APP.purchaseType,
    APP.selectedProduct,
    APP.selectedGame,
  );
  if (requiresSizeAndMarking(product)) {
    APP.pendingCartAction = "buyNow";
    openSizeMarkingModal(product);
    return;
  }
  APP.selectedSize = null;
  APP.selectedMarkingPlayer = null;
  proceedBuyNow();
}

function proceedBuyNow() {
  APP.purchaseMode = "direct";
  APP.selectedQuantity = 1;
  APP.selectedPaymentMethod = "card";
  APP.appliedCoupon = null;
  navigateTo("purchase-confirm");
  renderPurchaseConfirmContent();
}

function findSelectedProductAndGame(purchaseType, productId, gameId) {
  let product, game;
  if (purchaseType === "Ticket Purchase") {
    product = DATA.tickets.find((t) => t.id === productId);
    game = DATA.games.find((g) => g.id === gameId);
  } else if (purchaseType === "Membership Enrollment") {
    product = DATA.memberships.find((m) => m.id === productId);
  } else if (purchaseType === "Season Pass") {
    product = DATA.seasonPasses.find((s) => s.id === productId);
  } else if (purchaseType === "Goods Purchase") {
    product = DATA.goods.find((g) => g.id === productId);
  }
  return { product, game };
}

/* ── Cart ── */
function addCurrentSelectionToCart() {
  const { product, game } = findSelectedProductAndGame(
    APP.purchaseType,
    APP.selectedProduct,
    APP.selectedGame,
  );
  if (!product) {
    showToast("상품을 선택해주세요.");
    return;
  }

  if (requiresSizeAndMarking(product)) {
    APP.pendingCartAction = "addToCart";
    openSizeMarkingModal(product);
    return;
  }
  proceedAddToCart(product, game, null, null);
}

function proceedAddToCart(product, game, size, markingPlayer) {
  APP.cart.push({
    cartId: "cart-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    purchaseType: APP.purchaseType,
    product,
    game: game || null,
    quantity: 1,
    size: size || null,
    markingPlayer: markingPlayer || null,
  });
  trackEngagement("Add to Cart", APP.purchaseType, null);
  updateCartBadges();

  const goodsOrigin = APP.purchaseType === "Goods Purchase";
  APP.addToCartOrigin = goodsOrigin ? "goods" : "ticket";
  APP.selectedProduct = null;
  APP.selectedGame = null;
  APP.purchaseType = null;
  if (goodsOrigin) {
    document.getElementById("goods-footer-cta")?.classList.add("hidden");
    renderGoodsGrid();
  } else {
    document.getElementById("ticket-footer-cta")?.classList.add("hidden");
    renderTicketTabContent();
  }

  showAddToCartModal(product);
}

/* ── Size / Marking (Jersey, Jacket) ── */
function requiresSizeAndMarking(product) {
  return !!(product && product.sizes);
}

function openSizeMarkingModal(product) {
  const container = document.getElementById("size-marking-modal-content");
  if (!container) return;

  container.innerHTML = `
    <div class="text-heading" style="margin-bottom:var(--space-lg);">${product.name} 옵션 선택</div>
    <label class="field-label">사이즈</label>
    <div class="chip-group" id="size-chip-group" style="margin-bottom:var(--space-lg);">
      ${product.sizes.map((s) => `<button class="chip" data-value="${s}">${s}</button>`).join("")}
    </div>
    <label class="field-label">마킹할 선수 (선택)</label>
    <div class="chip-group" id="marking-chip-group" style="margin-bottom:var(--space-xl);">
      <button class="chip active" data-value="none">마킹 없음</button>
      ${DATA.players.map((p) => `<button class="chip" data-value="${p.id}">${p.name}</button>`).join("")}
    </div>
    <button class="btn btn-primary" onclick="confirmSizeMarking()">선택 완료</button>
  `;
  initChipGroup(document.getElementById("size-chip-group"));
  initChipGroup(document.getElementById("marking-chip-group"));

  openModal("size-marking-modal");
}

function confirmSizeMarking() {
  const sizeChip = document.querySelector("#size-chip-group .chip.active");
  if (!sizeChip) {
    showToast("사이즈를 선택해주세요.");
    return;
  }
  const size = sizeChip.dataset.value;
  const markingChip = document.querySelector(
    "#marking-chip-group .chip.active",
  );
  const markingPlayer =
    markingChip && markingChip.dataset.value !== "none"
      ? markingChip.dataset.value
      : null;

  const { product, game } = findSelectedProductAndGame(
    APP.purchaseType,
    APP.selectedProduct,
    APP.selectedGame,
  );
  const pendingAction = APP.pendingCartAction;
  APP.pendingCartAction = null;
  closeModal("size-marking-modal");

  if (pendingAction === "addToCart") {
    proceedAddToCart(product, game, size, markingPlayer);
  } else {
    APP.selectedSize = size;
    APP.selectedMarkingPlayer = markingPlayer;
    proceedBuyNow();
  }
}

function closeSizeMarkingModal() {
  APP.pendingCartAction = null;
  closeModal("size-marking-modal");

  // back to the goods page's default (unselected) state
  APP.selectedProduct = null;
  APP.purchaseType = null;
  document.getElementById("goods-footer-cta")?.classList.add("hidden");
  renderGoodsGrid();
}

function showAddToCartModal(product) {
  const nameEl = document.getElementById("cart-modal-product-name");
  if (nameEl) nameEl.textContent = product.name;
  openModal("add-to-cart-modal");
}

function goToCart() {
  navigateTo("cart");
  renderCartPageContent();
}

function goToCartFromModal() {
  closeModal("add-to-cart-modal");
  goToCart();
}

function continueBrowsingFromModal() {
  closeModal("add-to-cart-modal");
  if (APP.addToCartOrigin === "goods") {
    navigateTo("goods");
  } else {
    resetTicketTabToDefault();
    navigateTo("ticket");
  }
}

function resetTicketTabToDefault() {
  APP.ticketTab = 0;
  const seg = document.querySelector("#ticket .segmented");
  if (seg) {
    seg
      .querySelectorAll(".segmented-item")
      .forEach((item, i) => item.classList.toggle("active", i === 0));
  }
  document.getElementById("ticket-footer-cta")?.classList.add("hidden");
  renderTicketTabContent();
}

function updateCartBadges() {
  const count = APP.cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-badge").forEach((b) => {
    b.textContent = count;
    b.classList.toggle("hidden", count === 0);
  });
}

function changeCartItemQty(cartId, delta) {
  const item = APP.cart.find((i) => i.cartId === cartId);
  if (!item) return;
  item.quantity = Math.max(1, Math.min(10, item.quantity + delta));
  updateCartBadges();
  renderCartPageContent();
}

function removeCartItem(cartId) {
  APP.cart = APP.cart.filter((i) => i.cartId !== cartId);
  updateCartBadges();
  renderCartPageContent();
}

function renderCartPageContent() {
  const container = document.getElementById("cart-content");
  if (!container) return;

  if (APP.cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>장바구니가 비어있습니다.</p>
      </div>
      <div style="padding:0 var(--space-2xl);">
        <button class="btn btn-secondary" onclick="navigateTo('ticket')">예매하러 가기</button>
      </div>
    `;
    return;
  }

  const subtotal = APP.cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  container.innerHTML = `
    <div class="cart-item-list">
      ${APP.cart.map((item) => renderCartItemRow(item, true)).join("")}
    </div>
    <div class="cart-summary">
      <div class="order-line total"><span>합계</span><span>${formatPrice(subtotal)}</span></div>
    </div>
    <div style="padding:var(--space-xl) var(--space-2xl) var(--space-4xl);">
      <button class="btn btn-primary" onclick="handleCartCheckout()">결제하기</button>
    </div>
  `;
}

function handleCartCheckout() {
  if (APP.cart.length === 0) {
    showToast("장바구니가 비어있습니다.");
    return;
  }
  APP.purchaseMode = "cart";
  APP.selectedPaymentMethod = "card";
  APP.appliedCoupon = null;
  navigateTo("purchase-confirm");
  renderPurchaseConfirmContent();
}

/* ── Purchase Confirm (NEW #12) ── */
function getCouponDiscount(subtotal) {
  if (!APP.appliedCoupon) return 0;
  const coupon = DATA.benefits.find((b) => b.id === APP.appliedCoupon);
  if (!coupon || !coupon.discountPercent) return 0;
  return Math.round((subtotal * coupon.discountPercent) / 100);
}

function renderPaymentAndCouponSection() {
  const methods = [
    { id: "card", label: "💳 카드 결제" },
    { id: "simple", label: "⚡ 간편결제" },
    { id: "transfer", label: "🏦 계좌이체" },
  ];
  return `
    <div class="payment-section">
      <label class="field-label">결제 수단</label>
      <div class="payment-method-list">
        ${methods.map((m) => `<button class="payment-method-item ${APP.selectedPaymentMethod === m.id ? "active" : ""}" onclick="selectPaymentMethod('${m.id}')">${m.label}</button>`).join("")}
      </div>
    </div>
    <div class="coupon-section">
      <label class="field-label">쿠폰</label>
      ${renderCouponControl()}
    </div>
  `;
}

function renderCouponControl() {
  if (APP.appliedCoupon) {
    const coupon = DATA.benefits.find((b) => b.id === APP.appliedCoupon);
    return `
      <div class="coupon-applied-row">
        <span>${coupon.title} 적용됨</span>
        <button class="coupon-remove-btn" onclick="removeCoupon()">취소</button>
      </div>`;
  }

  const available = DATA.benefits.filter(
    (b) => b.status === "Issued" && b.discountPercent,
  );
  if (available.length === 0) {
    return `<div class="text-caption">사용 가능한 쿠폰이 없습니다.</div>`;
  }
  return `
    <button class="btn btn-secondary btn-sm" onclick="toggleCouponList()">쿠폰 적용하기</button>
    <div class="coupon-list hidden" id="coupon-list">
      ${available
        .map(
          (c) => `
        <div class="coupon-list-item" onclick="applyCoupon('${c.id}')">
          <span>${c.title}</span>
          <span class="text-primary" style="font-weight:700;">적용</span>
        </div>`,
        )
        .join("")}
    </div>
  `;
}

function toggleCouponList() {
  document.getElementById("coupon-list")?.classList.toggle("hidden");
}

function applyCoupon(couponId) {
  APP.appliedCoupon = couponId;
  renderPurchaseConfirmContent();
}

function removeCoupon() {
  APP.appliedCoupon = null;
  renderPurchaseConfirmContent();
}

function selectPaymentMethod(methodId) {
  APP.selectedPaymentMethod = methodId;
  renderPurchaseConfirmContent();
}

function renderPurchaseConfirmContent() {
  const container = document.getElementById("purchase-confirm-content");
  if (!container) return;

  if (APP.purchaseMode === "cart") {
    renderCartCheckoutContent(container);
  } else {
    renderDirectCheckoutContent(container);
  }
}

function renderDirectCheckoutContent(container) {
  const { product, game } = findSelectedProductAndGame(
    APP.purchaseType,
    APP.selectedProduct,
    APP.selectedGame,
  );
  if (!product) {
    container.innerHTML =
      '<div class="empty-state"><p>상품을 선택해주세요.</p></div>';
    return;
  }

  const unitPrice = product.price;
  const subtotal = unitPrice * APP.selectedQuantity;
  const discount = getCouponDiscount(subtotal);
  const total = subtotal - discount;

  container.innerHTML = `
    <div style="padding:var(--space-2xl);text-align:center;">
      <img src="${product.image}" style="width:120px;border-radius:var(--radius-md);margin-bottom:var(--space-lg);" onerror="this.style.background='var(--bg-elevated)'">
      <div class="text-heading">${product.name}</div>
      ${game ? `<div class="text-caption" style="margin-top:var(--space-sm);">${game.home} vs ${game.away} · ${formatDateFull(game.date)} ${game.time}</div>` : ""}
      ${APP.selectedSize ? `<div class="text-caption" style="margin-top:var(--space-sm);">${formatSizeMarking(APP.selectedSize, APP.selectedMarkingPlayer)}</div>` : ""}
    </div>

    <!-- Quantity Selector -->
    <div class="quantity-selector">
      <button class="qty-btn" onclick="changeQty(-1)">−</button>
      <div class="qty-value" id="qty-display">${APP.selectedQuantity}</div>
      <button class="qty-btn" onclick="changeQty(1)">+</button>
    </div>

    <div style="padding:0 var(--space-2xl);">
      ${renderPaymentAndCouponSection()}
    </div>

    <!-- Order Summary -->
    <div class="order-summary">
      <div class="order-line"><span>${product.name}</span><span>${formatPrice(unitPrice)}</span></div>
      <div class="order-line"><span>수량</span><span id="qty-summary">${APP.selectedQuantity}매</span></div>
      ${discount > 0 ? `<div class="order-line"><span>쿠폰 할인</span><span class="text-primary">-${formatPrice(discount)}</span></div>` : ""}
      <div class="order-line total"><span>총 결제금액</span><span id="total-price">${formatPrice(total)}</span></div>
    </div>

    <div style="padding:var(--space-xl) var(--space-2xl);">
      <button class="btn btn-primary" onclick="confirmPurchase()">결제하기</button>
    </div>
  `;
}

function renderCartCheckoutContent(container) {
  if (APP.cart.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><p>장바구니가 비어있습니다.</p></div>';
    return;
  }

  const subtotal = APP.cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const discount = getCouponDiscount(subtotal);
  const total = subtotal - discount;

  container.innerHTML = `
    <div class="cart-item-list" style="padding-top:var(--space-lg);">
      ${APP.cart.map((item) => renderCartItemRow(item, false)).join("")}
    </div>

    <div style="padding:0 var(--space-2xl);">
      ${renderPaymentAndCouponSection()}
    </div>

    <div class="order-summary">
      <div class="order-line"><span>상품 금액</span><span>${formatPrice(subtotal)}</span></div>
      ${discount > 0 ? `<div class="order-line"><span>쿠폰 할인</span><span class="text-primary">-${formatPrice(discount)}</span></div>` : ""}
      <div class="order-line total"><span>총 결제금액</span><span>${formatPrice(total)}</span></div>
    </div>

    <div style="padding:var(--space-xl) var(--space-2xl);">
      <button class="btn btn-primary" onclick="confirmPurchase()">결제하기</button>
    </div>
  `;
}

function changeQty(delta) {
  APP.selectedQuantity = Math.max(
    1,
    Math.min(10, APP.selectedQuantity + delta),
  );
  renderPurchaseConfirmContent();
}

function confirmPurchase() {
  if (APP.purchaseMode === "cart") {
    confirmCartPurchase();
  } else {
    confirmDirectPurchase();
  }
}

function logOrder(
  purchaseType,
  product,
  game,
  quantity,
  paymentMethod,
  chargedAmount,
  size,
  markingPlayer,
) {
  // → Salesforce Order + OrderItem
  const orderData = {
    fan: DATA.currentFan.id,
    orderType: purchaseType,
    product: product,
    game: game || null,
    quantity: quantity,
    totalAmount: chargedAmount,
    paymentStatus: "Paid",
    paymentMethod: paymentMethod,
    size: size || null,
    markingPlayer: markingPlayer || null,
    orderDate: new Date().toISOString(),
  };
  console.log("[Purchase → Order/OrderItem]", orderData);

  DATA.orders.unshift({
    id: "order-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    type: purchaseType,
    productName: product.name,
    price: chargedAmount,
    date: new Date().toISOString().split("T")[0],
    status: "Paid",
    channel: "앱",
    image: product.image,
  });
  DATA.fanStats.totalTickets +=
    purchaseType === "Ticket Purchase" ? quantity : 0;
  if (purchaseType === "Membership Enrollment")
    DATA.fanStats.membership = product.tier || product.name;
  if (purchaseType === "Season Pass")
    DATA.fanStats.seasonPass = product.tier || product.name;
}

function consumeAppliedCoupon() {
  if (!APP.appliedCoupon) return;
  markBenefitUsed(APP.appliedCoupon);
  APP.appliedCoupon = null;
}

function confirmDirectPurchase() {
  const { product, game } = findSelectedProductAndGame(
    APP.purchaseType,
    APP.selectedProduct,
    APP.selectedGame,
  );
  if (!product) return;

  const subtotal = product.price * APP.selectedQuantity;
  const discount = getCouponDiscount(subtotal);
  logOrder(
    APP.purchaseType,
    product,
    game,
    APP.selectedQuantity,
    APP.selectedPaymentMethod,
    subtotal - discount,
    APP.selectedSize,
    APP.selectedMarkingPlayer,
  );
  trackEngagement("Purchase", `${APP.purchaseType}`, null);
  consumeAppliedCoupon();

  const purchaseType = APP.purchaseType;
  APP.selectedQuantity = 1;
  APP.selectedProduct = null;
  APP.selectedGame = null;
  APP.purchaseType = null;
  APP.purchaseMode = "direct";
  APP.selectedSize = null;
  APP.selectedMarkingPlayer = null;

  if (purchaseType === "Goods Purchase") {
    document.getElementById("goods-footer-cta")?.classList.add("hidden");
    navigateTo("goods");
    renderGoodsGrid();
  } else {
    document.getElementById("ticket-footer-cta")?.classList.add("hidden");
    navigateTo("ticket");
    renderTicketTabContent();
  }
  showToast("결제가 완료되었습니다! ✅");
}

function confirmCartPurchase() {
  if (APP.cart.length === 0) return;

  const subtotal = APP.cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const discount = getCouponDiscount(subtotal);

  APP.cart.forEach((item) => {
    const lineSubtotal = item.product.price * item.quantity;
    const lineDiscount =
      subtotal > 0 ? Math.round((discount * lineSubtotal) / subtotal) : 0;
    logOrder(
      item.purchaseType,
      item.product,
      item.game,
      item.quantity,
      APP.selectedPaymentMethod,
      lineSubtotal - lineDiscount,
      item.size,
      item.markingPlayer,
    );
  });
  trackEngagement("Purchase", "Cart Checkout", null);
  consumeAppliedCoupon();

  APP.cart = [];
  APP.purchaseMode = "direct";
  updateCartBadges();

  document.getElementById("ticket-footer-cta")?.classList.add("hidden");
  document.getElementById("goods-footer-cta")?.classList.add("hidden");
  navigateTo("ticket");
  renderTicketTabContent();
  showToast("결제가 완료되었습니다! ✅");
}

function handlePurchaseConfirmBack() {
  if (APP.purchaseMode === "cart") {
    goToCart();
    return;
  }
  if (APP.purchaseType === "Goods Purchase") {
    navigateTo("goods");
    return;
  }
  navigateTo("ticket");
}

/* ── Goods ── */
function handleGoodsChannelSwitch(index) {
  APP.goodsChannel = index;
  APP.goodsCategory = "전체";
  renderGoodsCategoryTabs();
  renderGoodsGrid();
}

function renderGoodsCategoryTabs() {
  const container = document.getElementById("goods-category-tabs");
  if (!container) return;
  container.innerHTML = DATA.goodsCategories
    .map(
      (c) =>
        `<button class="text-tab-item ${c === APP.goodsCategory ? "active" : ""}" data-value="${c}" onclick="switchGoodsCategory('${c}')">${c}</button>`,
    )
    .join("");
}

function switchGoodsCategory(cat) {
  APP.goodsCategory = cat;
  document
    .querySelectorAll(".text-tab-item")
    .forEach((t) => t.classList.toggle("active", t.dataset.value === cat));
  renderGoodsGrid();
}

function renderGoodsGrid() {
  const container = document.getElementById("goods-grid-content");
  if (!container) return;

  const channelFilter = APP.goodsChannel === 0 ? "온라인" : "구장";
  let filtered = DATA.goods.filter((g) => g.channel === channelFilter);
  if (APP.goodsCategory !== "전체")
    filtered = filtered.filter((g) => g.category === APP.goodsCategory);

  container.innerHTML = renderProductGrid(
    filtered,
    "product-thumb--tall",
    (id) => {
      APP.selectedProduct = id;
      APP.purchaseType = "Goods Purchase";
      showFooterCta("goods-footer-cta");
    },
  );
}

/* ── Check-in ── */
async function handleCheckin() {
  const result = await callSalesforceApi("checkin", {
    fanId: APP.currentFanId,
    gameId: DATA.games[0].id,
    gate: "Gate A",
    section: "1루",
    row: "A",
    seatNumber: "12",
  });
  if (!result.success) {
    console.warn("[Checkin] Salesforce sync skipped:", result.error);
  }
  trackEngagement("Check-in", "Fan App");

  DATA.fanStats.totalAttendance += 1;
  showToast("입장이 확인되었습니다! ⚾");
}

/* ── Benefits ── */
function markBenefitUsed(benefitId) {
  const benefit = DATA.benefits.find((b) => b.id === benefitId);
  if (!benefit) return;
  benefit.status = "Used";
  benefit.usedDate = new Date().toISOString().split("T")[0];
  console.log("[Benefit Use → Benefit__c Status: Used]", benefit);
}

function useBenefit(benefitId) {
  markBenefitUsed(benefitId);
  document.querySelector(".benefits-list").innerHTML = DATA.benefits
    .map((b) => renderBenefitCard(b))
    .join("");
  showToast("혜택이 사용되었습니다! 🎉");
}

/* ── Theme ── */
function toggleTheme() {
  const app = document.getElementById("app");
  const current = app.getAttribute("data-theme");
  app.setAttribute("data-theme", current === "light" ? "dark" : "light");
}

function handleLogout() {
  navigateTo("login");
  showToast("로그아웃 되었습니다.");
}

/* ══════════════════════════════════════════════════════════════
   APP INITIALIZATION
   ══════════════════════════════════════════════════════════════ */

function initApp() {
  const app = document.getElementById("app");
  app.setAttribute("data-theme", "dark");

  // Render all screens
  app.innerHTML = `
    ${renderSplash()}
    ${renderLogin()}
    ${renderSignup()}
    ${renderFavoritePlayer()}
    ${renderTicketPage()}
    ${renderGoodsPage()}
    ${renderCheckinPage()}
    ${renderMyPage()}
    ${renderNotificationsPage()}
    ${renderBenefitsPage()}
    ${renderPurchaseConfirm()}
    ${renderCartPage()}
    ${renderAddToCartModal()}
    ${renderSizeMarkingModal()}
    ${renderBottomNav()}
  `;

  // Init bottom nav
  initBottomNav();

  // Init signup channel chips
  setTimeout(() => {
    const channelChips = document.getElementById("signup-channel-chips");
    if (channelChips) initChipGroup(channelChips, null, true);

    const posChips = document.getElementById("player-position-chips");
    if (posChips) initChipGroup(posChips, () => filterPlayers());

    renderPlayerGrid();
    renderTicketTabContent();
    renderGoodsCategoryTabs();
    renderGoodsGrid();
    renderCartPageContent();
    updateCartBadges();
    renderMyPageContent();
  }, 0);

  // Start at splash, auto-advance (only if the user hasn't already navigated away)
  navigateTo("splash", false);
  setTimeout(() => {
    if (document.getElementById("splash")?.classList.contains("active"))
      navigateTo("login");
  }, 2200);

  // Handle browser back
  window.addEventListener("popstate", (e) => {
    if (e.state?.screen) navigateTo(e.state.screen, false);
  });

  // Track app open
  APP.currentFanId = loadFanId();
  if (APP.currentFanId) {
    callSalesforceApi("engagement", {
      fanId: APP.currentFanId,
      type: "App Open",
      source: "Fan App",
    }).then((result) => {
      if (!result.success)
        console.warn("[Engagement] Salesforce sync skipped:", result.error);
    });
  }
  trackEngagement("App Open", "Fan App");
}

// Go!
document.addEventListener("DOMContentLoaded", initApp);
