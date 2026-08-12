/**
 * Cloud Alpacas Fan App — Dummy Data
 * Values match docs/data/SAMPLE_DATA.md in the Salesforce project.
 * If a value is missing there, add it to SAMPLE_DATA.md first.
 */

const DATA = {
  /* ── Current Fan (logged-in user for demo) ── */
  currentFan: {
    id: 'fan-001',
    name: '이루키',
    phone: '010-1234-5678',
    email: 'iruki@example.com',
    acquisitionChannel: 'SNS',
    favoritePlayer: 'player-moon',
    currentSegment: 'Active Fan',
    engagementLevel: 'Medium',
    fanValueTier: 'Standard',
    avatarUrl: 'assets/images/my-profile-avatar.png',
    consent: { email: true, sms: true, push: true, kakao: false },
  },

  /* ── Players ── */
  players: [
    { id: 'player-moon',   name: '문태양', number: 1,  position: '투수',  photo: 'assets/images/player-moontaeyang.png' },
    { id: 'player-kang',   name: '강도윤', number: 22, position: '포수',  photo: 'assets/images/player-default.png' },
    { id: 'player-lee',    name: '이서준', number: 5,  position: '내야수', photo: 'assets/images/player-default.png' },
    { id: 'player-park',   name: '박현우', number: 10, position: '외야수', photo: 'assets/images/player-default.png' },
  ],

  /* ── Games (Season 2026) ── */
  games: [
    { id: 'game-001', date: '2026-05-02', weekday: '토', time: '17:00', home: 'Cloud Alpacas', away: 'Blue Tigers', stadium: 'Cloud Alpacas Park' },
    { id: 'game-002', date: '2026-05-09', weekday: '토', time: '17:00', home: 'Cloud Alpacas', away: 'Red Sharks', stadium: 'Cloud Alpacas Park' },
    { id: 'game-003', date: '2026-05-16', weekday: '토', time: '17:00', home: 'Cloud Alpacas', away: 'Green Dragons', stadium: 'Cloud Alpacas Park' },
    { id: 'game-004', date: '2026-05-23', weekday: '토', time: '14:00', home: 'Cloud Alpacas', away: 'Yellow Lions', stadium: 'Cloud Alpacas Park' },
    { id: 'game-005', date: '2026-05-30', weekday: '토', time: '17:00', home: 'Cloud Alpacas', away: 'Blue Tigers', stadium: 'Cloud Alpacas Park' },
  ],

  /* ── Products — Tickets ── */
  tickets: [
    { id: 'ticket-1st',      name: '1루 내야석',   price: 18000, image: 'assets/images/ticket-first.png',    category: 'Ticket' },
    { id: 'ticket-3rd',      name: '3루 내야석',   price: 18000, image: 'assets/images/ticket-third.png',    category: 'Ticket' },
    { id: 'ticket-outfield', name: '외야석',       price: 12000, image: 'assets/images/ticket-outfield.png', category: 'Ticket' },
    { id: 'ticket-premium',  name: '프리미엄석',    price: 35000, image: 'assets/images/ticket-premium.png',  category: 'Ticket' },
  ],

  /* ── Products — Membership ── */
  memberships: [
    { id: 'mem-standard', name: 'Standard 멤버십', price: 30000,  image: 'assets/images/membership-standard.png', category: 'Membership', tier: 'Standard' },
    { id: 'mem-premium',  name: 'Premium 멤버십',  price: 80000,  image: 'assets/images/membership-premium.png',  category: 'Membership', tier: 'Premium' },
    { id: 'mem-vip',      name: 'VIP 멤버십',     price: 150000, image: 'assets/images/membership-vip.png',      category: 'Membership', tier: 'VIP' },
  ],

  /* ── Products — Season Pass ── */
  seasonPasses: [
    { id: 'season-standard', name: 'Standard 시즌권', price: 500000,  image: 'assets/images/season-standard.png', category: 'Season Pass', tier: 'Standard' },
    { id: 'season-vip',      name: 'VIP 시즌권',     price: 1200000, image: 'assets/images/season-vip.png',      category: 'Season Pass', tier: 'VIP' },
  ],

  /* ── Products — Goods ── */
  goods: [
    { id: 'goods-home-jersey',  name: '홈 유니폼',       price: 89000,  image: 'assets/images/goods-home-jersey.png',  category: '의류',    channel: '온라인', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'goods-away-jersey',  name: '어웨이 유니폼',    price: 89000,  image: 'assets/images/goods-away-jersey.png',  category: '의류',    channel: '온라인', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'goods-jacket',       name: '점퍼',            price: 129000, image: 'assets/images/goods-jacket.png',       category: '의류',    channel: '온라인', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'goods-cap',          name: '모자',            price: 32000,  image: 'assets/images/goods-cap.png',          category: '의류',    channel: '온라인' },
    { id: 'goods-towel',        name: '응원 타올',       price: 15000,  image: 'assets/images/goods-towel.png',        category: '응원용품', channel: '구장' },
    { id: 'goods-fan',          name: '응원 부채',       price: 8000,   image: 'assets/images/goods-fan.png',          category: '응원용품', channel: '구장' },
    { id: 'goods-plush',        name: '알파카 인형',     price: 25000,  image: 'assets/images/goods-plush.png',        category: '기타',    channel: '온라인' },
    { id: 'goods-mug',          name: '머그컵',          price: 18000,  image: 'assets/images/goods-mug.png',          category: '기타',    channel: '온라인' },
    { id: 'goods-tumbler',      name: '텀블러',          price: 28000,  image: 'assets/images/goods-tumbler.png',      category: '기타',    channel: '온라인' },
    { id: 'goods-photocard',    name: '포토카드 세트',    price: 12000,  image: 'assets/images/goods-photocard.png',    category: '기타',    channel: '구장' },
    { id: 'goods-keyring',      name: '키링',            price: 15000,  image: 'assets/images/goods-keyring.png',      category: '기타',    channel: '구장' },
    { id: 'goods-keycap',       name: '키캡',            price: 12000,  image: 'assets/images/goods-keycap.png',       category: '기타',    channel: '구장' },
    { id: 'goods-griptok',      name: '그립톡',          price: 10000,  image: 'assets/images/goods-griptok.png',      category: '기타',    channel: '구장' },
  ],

  goodsCategories: ['전체', '의류', '응원용품', '기타'],

  /* ── Orders (demo purchase history) ── */
  orders: [
    { id: 'order-001', type: 'Ticket Purchase',         productName: '1루 내야석',    price: 18000,  date: '2026-05-01', status: 'Paid', channel: '앱', image: 'assets/images/ticket-first.png' },
    { id: 'order-002', type: 'Goods Purchase',           productName: '홈 유니폼',     price: 89000,  date: '2026-05-15', status: 'Paid', channel: '온라인', image: 'assets/images/goods-home-jersey.png' },
    { id: 'order-003', type: 'Ticket Purchase',         productName: '프리미엄석',     price: 35000,  date: '2026-05-20', status: 'Paid', channel: '앱', image: 'assets/images/ticket-premium.png' },
  ],

  /* ── Fan Stats (My page) ── */
  fanStats: {
    membership: 'Standard',
    seasonPass: '-',
    totalTickets: 3,
    totalAttendance: 3,
  },

  /* ── Notifications ── */
  notifications: [
    { id: 'noti-001', title: '환영합니다!', desc: 'Cloud Alpacas에 오신 것을 환영합니다, 이루키님!', date: '2026-04-20', channel: 'Email', icon: '🎉' },
    { id: 'noti-002', title: '첫 직관 가이드', desc: '경기장 위치, 주차, 먹거리 정보를 확인하세요.', date: '2026-05-01', channel: 'Push', icon: '⚾' },
    { id: 'noti-003', title: '문태양 유니폼 할인', desc: '최애 선수 문태양의 유니폼 10% 할인 쿠폰이 발급되었습니다.', date: '2026-05-16', channel: 'Push', icon: '👕' },
  ],

  /* ── Benefits ── */
  benefits: [
    { id: 'ben-001', type: 'Discount', title: '문태양 유니폼 10% 할인', status: 'Issued', issuedDate: '2026-05-16', expirationDate: '2026-06-16', recommendation: 'Favorite Player Campaign', discountPercent: 10 },
    { id: 'ben-002', type: 'Early Access', title: '멤버십 가입자 선예매권', status: 'Used', issuedDate: '2026-05-20', usedDate: '2026-05-22', expirationDate: '2026-06-30', recommendation: null },
  ],

  /* ── Engagement Signals (tracked automatically) ── */
  engagementSignals: [
    { type: 'App Open',    source: 'Fan App',  date: '2026-04-20' },
    { type: 'Video View',  source: 'Instagram', player: 'player-moon', date: '2026-04-18' },
    { type: 'SNS Click',   source: 'Instagram', player: 'player-moon', date: '2026-04-15' },
  ],
};
