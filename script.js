// NO IMPORTS - Global Variables Used
const { useEffect, useMemo, useRef, useState } = React;

const firebaseConfig = {
  apiKey: 'AIzaSyC4UDj5L7f3LtBgNPaYHYuEwIz3LQRlL00',
  authDomain: 'world-star-55.firebaseapp.com',
  projectId: 'world-star-55',
  storageBucket: 'world-star-55.firebasestorage.app',
  messagingSenderId: '38030616846',
  appId: '1:38030616846:web:d898ccb3200fa36396cf5f',
  measurementId: 'G-S70DG1PH1N',
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const FV = firebase.firestore.FieldValue;
const col = (c) => db.collection(c);
const uDoc = (id) => col('users').doc(id);
const rDoc = (id) => col('voiceRooms').doc(id);
const errMsg = (e, fb = 'Unknown error') => (e instanceof Error ? e.message : fb);

const ADMIN_DISPLAY_ID = '461757881';
const OFFICIAL_DISPLAY_IDS = [ADMIN_DISPLAY_ID];
const isOfficialDisplayId = (id) => OFFICIAL_DISPLAY_IDS.includes(id);

const SEAT_SLOTS = [
  { index: 0, id: 'host', label: 'Host' }, { index: 1, id: 'side', label: 'Side' },
  { index: 2, id: 'a1', label: 'Seat 3' }, { index: 3, id: 'a2', label: 'Seat 4' },
  { index: 4, id: 'b1', label: 'Seat 5' }, { index: 5, id: 'b2', label: 'Seat 6' },
  { index: 6, id: 'c1', label: 'Seat 7' }, { index: 7, id: 'c2', label: 'Seat 8' },
  { index: 8, id: 'd1', label: 'Seat 9' }, { index: 9, id: 'd2', label: 'Seat 10' },
];

const SND = 'https://actions.google.com/sounds/v1/';
const DEFAULT_GIFTS = (
  'rose:🌹:Rose:10:float:cartoon/pop.ogg|heart:❤️:Heart:20:bounce:cartoon/clang_and_wobble.ogg|balloon:🎈:Balloon:30:float:cartoon/pop.ogg|mic:🎤:Mic:50:bounce:cartoon/clang_and_wobble.ogg|crown:👑:Crown:99:explode:alarms/beep_short.ogg|diamond:💎:Diamond:199:explode:alarms/beep_short.ogg|rocket:🚀:Rocket:520:slide:crowds/cheer.ogg|castle:🏰:Castle:999:slide:crowds/cheer.ogg'
).split('|').map((r) => { const [id, i, n, p, anim, snd] = r.split(':'); return { id, i, n, p: +p, anim, sound: SND + snd, type: 'emoji' }; });

const COUNTRIES = (
  'IN:India:🇮🇳|TR:Turkey:🇹🇷|US:United States:🇺🇸|GB:United Kingdom:🇬🇧|AE:UAE:🇦🇪|PK:Pakistan:🇵🇰|BD:Bangladesh:🇧🇩|SA:Saudi Arabia:🇸🇦|ID:Indonesia:🇮🇩|MY:Malaysia:🇲🇾|SG:Singapore:🇸🇬|PH:Philippines:🇵🇭|TH:Thailand:🇹🇭|VN:Vietnam:🇻🇳|CN:China:🇨🇳|JP:Japan:🇯🇵|KR:South Korea:🇰🇷|RU:Russia:🇷🇺|AU:Australia:🇦🇺|CA:Canada:🇨🇦|BR:Brazil:🇧🇷|MX:Mexico:🇲🇽|AR:Argentina:🇦🇷|FR:France:🇫🇷|DE:Germany:🇩🇪|IT:Italy:🇮🇹|ES:Spain:🇪🇸|NL:Netherlands:🇳🇱|CH:Switzerland:🇨🇭|SE:Sweden:🇸🇪|NO:Norway:🇳🇴|DK:Denmark:🇩🇰|FI:Finland:🇫🇮|ZA:South Africa:🇿🇦|EG:Egypt:🇪🇬|NG:Nigeria:🇳🇬|KE:Kenya:🇰🇪|NZ:New Zealand:🇳🇿|IE:Ireland:🇮🇪|PT:Portugal:🇵🇹|GR:Greece:🇬🇷|PL:Poland:🇵🇱|UA:Ukraine:🇺🇦|RO:Romania:🇷🇴|CZ:Czech Republic:🇨🇿|AT:Austria:🇦🇹|BE:Belgium:🇧🇪|IR:Iran:🇮🇷|IQ:Iraq:🇮🇶'
).split('|').map((row) => { const [code, name, flag] = row.split(':'); return { code, name, flag }; });

const PRICE_TAGS = [
  { id: 'none', name: 'None', icon: '🚫' }, { id: 'rose', name: 'Rose', icon: '🌹', price: 10 },
  { id: 'heart', name: 'Heart', icon: '❤️', price: 20 }, { id: 'crown', name: 'Crown', icon: '👑', price: 99 },
];

const VISITOR_PLANS = [
  { days: 3, price: 500, label: '3 Days Pass', subtitle: 'Basic Access', badge: null },
  { days: 7, price: 900, label: '7 Days Pass', subtitle: '1,166 Coins', badge: 'POPULAR' },
  { days: 30, price: 3750, label: '30 Days Pass', subtitle: '5,000 Coins', badge: 'BEST VALUE (25% OFF)' },
];
const QUICK_REACTIONS = ['👋 Hello!', '🔥 Vibe!', '👏 Amazing!', '😂 Haha!', '❤️ Love it!', '🎤 Sing!'];

// ============ TITLE SYSTEM ============
const TITLE_GLOW_STYLES = [
  { id: 'gold', name: 'Gold' }, { id: 'silver', name: 'Silver' }, { id: 'rainbow', name: 'Rainbow' },
  { id: 'neon-pink', name: 'Pink Neon' }, { id: 'neon-blue', name: 'Blue Neon' },
  { id: 'neon-green', name: 'Green Neon' }, { id: 'neon-purple', name: 'Purple Neon' },
  { id: 'fire', name: 'Fire' }, { id: 'ice', name: 'Ice' }, { id: 'toxic', name: 'Toxic' },
  { id: 'sunset', name: 'Sunset' }, { id: 'ocean', name: 'Ocean' }, { id: 'galaxy', name: 'Galaxy' },
  { id: 'lava', name: 'Lava' }, { id: 'candy', name: 'Candy' }, { id: 'royal', name: 'Royal' },
  { id: 'shadow', name: 'Shadow' }, { id: 'cyber', name: 'Cyberpunk' }, { id: 'aurora', name: 'Aurora' },
  { id: 'emerald', name: 'Emerald' },
];
for (let h = 0; h < 360; h += 4) TITLE_GLOW_STYLES.push({ id: `hue-${h}`, name: `Hue ${h}°` });

const TITLE_DURATIONS = [
  { id: '24h', label: '24 Hours', ms: 24 * 60 * 60 * 1000 },
  { id: '3d', label: '3 Days', ms: 3 * 24 * 60 * 60 * 1000 },
  { id: '7d', label: '7 Days', ms: 7 * 24 * 60 * 60 * 1000 },
  { id: '30d', label: '30 Days', ms: 30 * 24 * 60 * 60 * 1000 },
  { id: 'perm', label: 'Permanent', ms: null },
];

const TITLE_BASE_STYLES = {
  'gold': { color: '#ffd700', textShadow: '0 0 6px #ffd700, 0 0 12px #ffa500' },
  'silver': { color: '#e0e0e0', textShadow: '0 0 6px #c0c0c0, 0 0 12px #a0a0a0' },
  'rainbow': { backgroundImage: 'linear-gradient(90deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#9400d3)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' },
  'neon-pink': { color: '#ff4d9a', textShadow: '0 0 6px #ff4d9a, 0 0 14px #ff4d9a, 0 0 20px #ff4d9a' },
  'neon-blue': { color: '#00d4ff', textShadow: '0 0 6px #00d4ff, 0 0 14px #00d4ff' },
  'neon-green': { color: '#00ff88', textShadow: '0 0 6px #00ff88, 0 0 14px #00ff88' },
  'neon-purple': { color: '#b14dff', textShadow: '0 0 6px #b14dff, 0 0 14px #b14dff' },
  'fire': { color: '#ff6b00', textShadow: '0 0 8px #ff0000, 0 0 16px #ff6b00, 0 0 24px #ffd700' },
  'ice': { color: '#a0e9ff', textShadow: '0 0 8px #a0e9ff, 0 0 16px #ffffff' },
  'toxic': { color: '#b4ff00', textShadow: '0 0 8px #b4ff00, 0 0 16px #00ff00' },
  'sunset': { color: '#ff7b54', textShadow: '0 0 8px #ff7b54, 0 0 16px #ffb26b' },
  'ocean': { color: '#00bcd4', textShadow: '0 0 8px #00bcd4, 0 0 16px #0077be' },
  'galaxy': { color: '#c9b7ff', textShadow: '0 0 8px #8b5cf6, 0 0 16px #6d28d9, 0 0 24px #4c1d95' },
  'lava': { color: '#ff3300', textShadow: '0 0 8px #ff3300, 0 0 16px #ffaa00' },
  'candy': { color: '#ff9ecb', textShadow: '0 0 8px #ff9ecb, 0 0 16px #b3e5fc' },
  'royal': { color: '#7c3aed', textShadow: '0 0 8px #7c3aed, 0 0 16px #c084fc' },
  'shadow': { color: '#7a7a7a', textShadow: '0 0 2px #fff, 0 0 10px #333, 0 0 20px #000' },
  'cyber': { color: '#00fff0', textShadow: '0 0 6px #00fff0, 0 0 12px #ff00aa' },
  'aurora': { color: '#52ffb8', textShadow: '0 0 8px #52ffb8, 0 0 16px #52d9ff' },
  'emerald': { color: '#10b981', textShadow: '0 0 8px #10b981, 0 0 16px #059669' },
};
function getTitleStyleById(id) {
  if (TITLE_BASE_STYLES[id]) return TITLE_BASE_STYLES[id];
  if (typeof id === 'string' && id.startsWith('hue-')) {
    const h = parseInt(id.split('-')[1], 10) || 0;
    return { color: `hsl(${h}, 100%, 62%)`, textShadow: `0 0 8px hsl(${h}, 100%, 60%), 0 0 16px hsl(${h}, 100%, 50%)` };
  }
  return TITLE_BASE_STYLES.gold;
}
function getActiveTitles(titles, now = Date.now()) {
  return (titles || []).filter((t) => t.active !== false && (!t.expiresAt || t.expiresAt > now));
}
function isTitleExpired(t, now = Date.now()) { return Boolean(t.expiresAt && t.expiresAt <= now); }

// ============ HELPERS ============
function getGenderEmoji(gender) { if (gender === 'Female') return '♀️'; if (gender === 'Other') return '⚧️'; return '♂️'; }
function isVisitorPassActive(visitorExpiry, now = Date.now()) { return Boolean(visitorExpiry && now < visitorExpiry); }
function purchaseVisitorPass(params) {
  const now = params.now ?? Date.now();
  if (!params.isSuperAdmin && params.coins < params.price) return { ok: false, nextCoins: params.coins, visitorExpiry: 0, error: 'Not enough coins!' };
  const nextCoins = params.isSuperAdmin ? params.coins : params.coins - params.price;
  return { ok: true, nextCoins, visitorExpiry: now + params.days * 24 * 60 * 60 * 1000 };
}
function calculateGiftRewards(price, randomFactor = Math.random()) {
  const safePrice = Math.max(0, Number(price) || 0);
  const clampedRandom = Math.max(0, Math.min(1, randomFactor));
  return { charmsEarned: Math.floor(safePrice / 2), coinsEarned: Math.floor(safePrice * (clampedRandom * 0.65)) };
}
function checkRoomEntryAccess(room, userId, now = Date.now()) {
  if (room.blocked && room.blocked.includes(userId)) return { allowed: false, reason: 'You are blocked from this room.' };
  if (room.kicked && room.kicked[userId]) {
    const diff = now - room.kicked[userId];
    const cooldownMs = 10 * 60 * 1000;
    if (diff < cooldownMs) return { allowed: false, reason: `You are kicked! Try again in ${Math.ceil((cooldownMs - diff) / 60000)} mins.` };
  }
  return { allowed: true };
}
function joinMemberToRoom(activeMembers, user, ownerId) {
  if (activeMembers.some((m) => m.uid === user.uid)) return activeMembers;
  return [...activeMembers, { uid: user.uid, name: user.name, img: user.img, seatIndex: ownerId === user.uid ? 0 : null, lastSeen: Date.now() }];
}
function assignSeatToMember(activeMembers, userId, seatIndex) {
  if (activeMembers.some((m) => m.seatIndex === seatIndex && m.uid !== userId)) return activeMembers;
  return activeMembers.map((m) => (m.uid === userId ? { ...m, seatIndex } : m));
}
function liftMemberFromSeat(activeMembers, userId) { return activeMembers.map((m) => (m.uid === userId ? { ...m, seatIndex: null } : m)); }
function removeMemberOnLeave(activeMembers, leavingUserId, currentOwnerId) {
  const remaining = activeMembers.filter((u) => u.uid !== leavingUserId);
  if (remaining.length === 0) return { nextMembers: [], shouldDeleteRoom: true };
  if (currentOwnerId === leavingUserId) {
    const promoted = remaining[0];
    return { nextMembers: remaining.map((m) => (m.uid === promoted.uid ? { ...m, seatIndex: 0 } : m)), nextOwner: { ...promoted, seatIndex: 0 }, shouldDeleteRoom: false };
  }
  return { nextMembers: remaining, shouldDeleteRoom: false };
}
function getCharmBadgeInfo(charms) {
  if (charms >= 1000000) return { baseEmoji: '👑', level: 9, glowColor: 'rgba(255, 215, 0, 0.9)' };
  if (charms >= 500000) return { baseEmoji: '👑', level: 8, glowColor: 'rgba(255, 215, 0, 0.8)' };
  if (charms >= 300000) return { baseEmoji: '👑', level: 7, glowColor: 'rgba(255, 215, 0, 0.7)' };
  if (charms >= 160000) return { baseEmoji: '💎', level: 6, glowColor: 'rgba(56, 189, 248, 0.9)' };
  if (charms >= 80000) return { baseEmoji: '💎', level: 5, glowColor: 'rgba(56, 189, 248, 0.8)' };
  if (charms >= 30000) return { baseEmoji: '💎', level: 4, glowColor: 'rgba(56, 189, 248, 0.7)' };
  if (charms >= 12000) return { baseEmoji: '⭐', level: 3, glowColor: 'rgba(250, 204, 21, 0.8)' };
  if (charms >= 4000) return { baseEmoji: '⭐', level: 2, glowColor: 'rgba(250, 204, 21, 0.7)' };
  if (charms >= 1000) return { baseEmoji: '⭐', level: null, glowColor: 'rgba(255, 255, 255, 0.4)' };
  return { baseEmoji: '✨', level: null, glowColor: 'rgba(255, 255, 255, 0.4)' };
}
function canSendDirectMessage(messages, currentUserId, otherUserId, isCurrentOfficial = false) {
  if (isCurrentOfficial) return true;
  let lastTheirMsgIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].senderId === otherUserId) { lastTheirMsgIndex = i; break; }
  }
  return messages.slice(lastTheirMsgIndex + 1).filter((m) => m.senderId === currentUserId).length < 3;
}
function formatCountdown(secs) {
  const safe = Math.max(0, Math.floor(secs));
  const m = Math.floor(safe / 60), s = safe % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}
function toTimestampMillis(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value && typeof value === 'object' && typeof value.toMillis === 'function') return value.toMillis();
  return null;
}
function isUserOnline(user, now = Date.now(), staleThresholdMs = 2 * 60 * 1000) {
  if (!user || user.isOnline === false) return false;
  const lastSeenMs = toTimestampMillis(user.lastSeen);
  if (user.isOnline === true) return lastSeenMs === null ? true : now - lastSeenMs <= staleThresholdMs;
  return lastSeenMs !== null ? now - lastSeenMs <= staleThresholdMs : false;
}
function groupReceivedGifts(records) {
  const map = new Map();
  for (const rec of records) {
    const giftName = rec.giftName || 'Gift', giftIcon = rec.giftIcon || '🎁', giftType = rec.giftType || 'emoji';
    const key = `${giftName}__${giftIcon}`, count = Math.max(1, Number(rec.count) || 1), charms = Math.max(0, Number(rec.charms) || 0);
    let group = map.get(key);
    if (!group) { group = { key, giftName, giftIcon, giftType, totalCount: 0, totalCharms: 0, senders: [] }; map.set(key, group); }
    group.totalCount += count; group.totalCharms += charms;
    if (rec.senderUid) {
      const ex = group.senders.find((s) => s.uid === rec.senderUid);
      if (ex) { ex.count += count; if (!ex.img && rec.senderImg) ex.img = rec.senderImg; }
      else group.senders.push({ uid: rec.senderUid, name: rec.senderName || 'User', img: rec.senderImg || '', count });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalCharms - a.totalCharms || b.totalCount - a.totalCount);
}
function computeGuardList(records, profileUid) {
  const bySender = new Map();
  for (const rec of records) {
    if (!rec.senderUid || rec.senderUid === profileUid) continue;
    const charms = Math.max(0, Number(rec.charms) || 0), count = Math.max(1, Number(rec.count) || 1);
    const ex = bySender.get(rec.senderUid);
    if (ex) { ex.guardPoints += charms; ex.totalGifts += count; if (!ex.img && rec.senderImg) ex.img = rec.senderImg; }
    else bySender.set(rec.senderUid, { uid: rec.senderUid, name: rec.senderName || 'User', img: rec.senderImg || '', guardPoints: charms, totalGifts: count });
  }
  return Array.from(bySender.values()).sort((a, b) => b.guardPoints - a.guardPoints || b.totalGifts - a.totalGifts);
}

const C_INP_SM = 'w-full bg-black border border-white/15 rounded px-2 py-1.5 text-sm outline-none';
const C_INP_AD = 'flex-1 bg-black border border-white/15 rounded-lg px-3 py-2 text-sm text-white outline-none';
const C_CARD_ME = 'bg-[#151d2c] rounded-2xl overflow-hidden border border-gray-800 card-shadow';
const C_ADMIN_BOX = 'bg-white/5 border border-white/10 p-4 rounded-xl';
const C_MOD_OVL = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4';
const C_BTN_D = 'flex-1 bg-[#2a2a32] text-white py-2.5 rounded-xl font-bold text-sm';
const C_BTN_P = 'flex-1 bg-[#ff4d9a] text-white py-2.5 rounded-xl font-bold text-sm';
const C_BTN_S = 'flex-1 bg-slate-800 text-white py-2 rounded-xl font-bold text-sm';
const C_FORM_SCR = 'fixed inset-0 bg-[#000000] text-white flex flex-col max-w-[430px] mx-auto z-50 relative';
const C_FORM_HDR = 'flex items-center justify-center p-5 relative border-b border-white/10 shrink-0';
const C_FORM_FTR = 'absolute bottom-0 left-0 right-0 p-4 bg-[#000000] border-t border-white/10 z-10';
const C_LBL_XS = 'text-[10px] text-slate-400';
const C_BLK_INP = 'w-full bg-[#0b1120] text-white border border-gray-700 rounded-xl p-3 outline-none focus:border-pink-500';
const C_SH_BLK = 'w-full bg-black/60 text-white p-3 rounded-xl border border-[#333] outline-none mb-3 text-sm';
const C_ROW_B = 'w-full flex items-center justify-between p-4 border-b border-gray-800 cursor-pointer hover:bg-white/5 transition-colors text-left min-h-[54px]';
const C_ADM_INP = 'w-1/2 bg-black border border-white/15 rounded-lg px-3 py-2 text-sm text-white outline-none';

const Btn = ({ type = 'button', ...p }) => <button type={type} {...p} />;
const CloseX = ({ onClick, label = 'Close', cls = 'text-[#9aa3c7] text-lg font-bold px-1' }) => (
  <Btn onClick={onClick} aria-label={label} className={cls}>✕</Btn>
);
const Grabber = ({ light, cls = 'mb-4' }) => (
  <div className={`w-12 h-1.5 ${light ? 'bg-slate-300' : 'bg-gray-600'} rounded-full mx-auto ${cls}`} />
);
const SheetModal = ({ onClose, zClass = 'z-[300]', light = false, maxH = '', extraCls = '', children }) => (
  <div className={`fixed inset-0 ${light ? 'bg-black/50' : 'bg-black/80 backdrop-blur-sm'} ${zClass} flex items-end justify-center max-w-[430px] mx-auto`} onClick={onClose}>
    <div className={`${light ? 'bg-[#ffffff] text-[#1a1a2e] border-slate-200' : 'bg-[#151d2c] text-white border-gray-700'} w-full rounded-t-3xl p-5 shadow-2xl border-t slide-up ${maxH} ${extraCls}`} onClick={(e) => e.stopPropagation()}>{children}</div>
  </div>
);
const OnlineBadge = ({ online, light }) => (
  <span className={light ? `inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${online ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}` : `text-[11px] font-bold flex items-center gap-1 shrink-0 ${online ? 'text-emerald-400' : 'text-slate-400'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-slate-400'}`} /><span>{online ? 'Online' : 'Offline'}</span>
  </span>
);
const AvatarDot = ({ src, name, online, cls = 'w-10 h-10 rounded-full', border = 'border-[#0c0c10]', dotCls = 'w-3 h-3' }) => (
  <div className="relative shrink-0">
    <UserAvatar src={src} name={name} className={cls} />
    <span title={online ? 'Online' : 'Offline'} className={`${dotCls} absolute bottom-0 right-0 rounded-full border-2 ${border} ${online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
  </div>
);
const CharmIcon = ({ charms, size = 'text-lg' }) => {
  const { baseEmoji, level, glowColor } = getCharmBadgeInfo(charms || 0);
  return (
    <div className="relative inline-flex items-center justify-center">
      <span className={`${size} z-0`} style={{ filter: `drop-shadow(0px 0px 6px ${glowColor}) drop-shadow(0px 0px 2px ${glowColor})` }}>{baseEmoji}</span>
      {level && <span className="absolute bottom-0 right-0 text-[10px] font-black text-white z-10" style={{ textShadow: '0px 1px 2px #000, 0px 0px 3px #000, 0px 0px 4px #000' }}>{level}</span>}
    </div>
  );
};
const UserAvatar = ({ src, name = 'U', className = 'w-10 h-10 rounded-full', onClick }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div onClick={onClick} className={`${className} flex items-center justify-center font-extrabold text-black select-none`} style={{ background: 'radial-gradient(circle at 40% 32%, var(--color-ice), var(--color-rose) 72%)' }}>
        {(name?.trim()?.charAt(0) || 'U').toUpperCase()}
      </div>
    );
  }
  return <img src={src} alt={name} referrerPolicy="no-referrer" onError={() => setFailed(true)} onClick={onClick} className={`${className} object-cover`} />;
};
const BannerCover = ({ src, alt = 'Profile banner', className = 'w-full h-full object-cover' }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className="w-full h-full" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(126, 231, 255, 0.35), transparent 55%), radial-gradient(circle at 80% 70%, rgba(255, 77, 154, 0.35), transparent 55%), linear-gradient(135deg, #10111a 0%, #1d1b2b 100%)' }} />;
  }
  return <img src={src} alt={alt} referrerPolicy="no-referrer" onError={() => setFailed(true)} className={className} />;
};
const CoinIcon = ({ small }) => (
  <svg width={small ? 12 : 14} height={small ? 12 : 14} viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="7" fill="var(--color-gold)" />
    <path d="M8 4.2 9 7h2.8L10 8.7l.8 2.6L8 9.8 5.2 11.3 6 8.7 4.2 7H7Z" fill="#8a6410" />
  </svg>
);
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5.5v13M5.5 12h13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
const PulseWave = () => <svg className="pulse" viewBox="0 0 48 20" aria-hidden="true"><path d="M1 10 H12 L16 10 L19 3 L24 17 L28 7 L31 10 H47" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" /></svg>;
const SpeakerIcon = ({ muted }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3.5 9.2h3.2L11 5.6v12.8l-4.3-3.6H3.5V9.2Z" fill="currentColor" />
    {muted ? <path d="M15 9l5 6M20 9l-5 6" fill="none" stroke="var(--color-gift)" strokeWidth="2" strokeLinecap="round" /> : <path d="M15 8.2a5 5 0 0 1 0 7.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
  </svg>
);
const MicIcon = ({ muted }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
    <path d="M6.5 11a5.5 5.5 0 0 0 11 0M12 16.5V20M8.5 20h7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    {muted && <path d="M4 4l16 16" stroke="var(--color-gift)" strokeWidth="2.1" strokeLinecap="round" />}
  </svg>
);
const SmileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="9" cy="10.2" r="1" fill="currentColor" /><circle cx="15" cy="10.2" r="1" fill="currentColor" />
    <path d="M8.4 13.4c1 1.8 2.2 2.6 3.6 2.6s2.6-.8 3.6-2.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const GiftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32 24c-1-9-14-12-16-4 3.4 2 8.6 3.6 16 4Z" fill="var(--color-gold)" />
    <path d="M32 24c1-9 14-12 16-4-3.4 2-8.6 3.6-16 4Z" fill="var(--color-gold-lite)" />
    <rect x="10" y="24" width="44" height="10" rx="2" fill="var(--color-rose)" />
    <rect x="12" y="32" width="40" height="22" rx="3" fill="var(--color-gift)" />
    <rect x="28" y="24" width="8" height="30" fill="var(--color-gold)" />
  </svg>
);
const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2" y="2" width="8.2" height="8.2" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <rect x="13.8" y="2" width="8.2" height="8.2" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <rect x="2" y="13.8" width="8.2" height="8.2" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <rect x="13.8" y="13.8" width="8.2" height="8.2" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);
const ChevronIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;

// ============ TITLE BADGE COMPONENT ============
const TitleBadge = ({ title, size = 'sm' }) => {
  if (!title) return null;
  const style = getTitleStyleById(title.glowStyle);
  const isImg = title.emoji && (title.emoji.startsWith('http') || title.emoji.startsWith('data:'));
  const szCls = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const imgSz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <span className={`title-badge inline-flex items-center gap-0.5 font-extrabold ${szCls} px-1.5 py-0.5 rounded-md bg-black/40 border border-white/10`} style={style}>
      {isImg ? <img src={title.emoji} alt="" className={`inline-block ${imgSz} object-contain`} /> : title.emoji ? <span>{title.emoji}</span> : null}
      <span>{title.text}</span>
    </span>
  );
};

// ============ IMAGE UTIL ============
const compressImage = (file, maxWidth = 300) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = String(event.target?.result || '');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = maxWidth;
      canvas.height = img.height * (maxWidth / img.width);
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  };
});

const ImageCropModal = ({ file, aspectRatio = 1, outputWidth = 400, title = 'Crop Image', onCrop, onCancel, onError }) => {
  const imgRef = useRef(null);
  const cropperRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cropperReady, setCropperReady] = useState(false);
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    if (!imageLoaded || !imgRef.current) return;
    const c = new Cropper(imgRef.current, { aspectRatio, viewMode: 1, dragMode: 'move', autoCropArea: 0.85, restore: false, guides: true, center: true, highlight: false, cropBoxMovable: true, cropBoxResizable: true, toggleDragModeOnDblclick: false });
    cropperRef.current = c;
    setCropperReady(true);
    return () => { try { c.destroy(); } catch {} };
  }, [imageLoaded, aspectRatio]);
  const handleCrop = async () => {
    const c = cropperRef.current;
    if (!c) return;
    try {
      const canvas = c.getCroppedCanvas({ width: outputWidth, height: Math.round(outputWidth / aspectRatio) });
      if (!canvas) { onError?.('Crop selection unavailable.'); return; }
      onCrop(canvas.toDataURL('image/jpeg', 0.7));
    } catch (e) { onError?.(`Crop failed: ${errMsg(e)}`); }
  };
  return (
    <div className="fixed inset-0 z-[7000] bg-black flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-slate-800 shrink-0">
        <Btn onClick={onCancel} aria-label="Cancel crop" className="text-white text-2xl font-bold px-2">✕</Btn>
        <h3 className="text-white font-bold text-base">{title}</h3>
        <Btn onClick={handleCrop} disabled={!cropperReady} className="bg-[var(--color-rose)] text-white px-5 py-1.5 rounded-full font-bold text-sm disabled:opacity-50">Done</Btn>
      </div>
      <div className="flex-1 w-full relative bg-black overflow-hidden flex items-center justify-center" style={{ minHeight: 0 }}>
        {imageUrl && <img ref={imgRef} src={imageUrl} alt="Crop preview" onLoad={() => setImageLoaded(true)} style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }} />}
      </div>
      <div className="p-4 text-center text-slate-400 text-xs shrink-0">{cropperReady ? 'Pinch to zoom · Drag to move' : 'Loading...'}</div>
    </div>
  );
};

const DailyTaskModal = ({ onClose, onClaimCoins }) => {
  const [timeLeft, setTimeLeft] = useState(7 * 60 + 18);
  const [isClaimed, setIsClaimed] = useState(false);
  const [tasks, setTasks] = useState({ follow: false, gift: false });
  const [notice, setNotice] = useState(null);
  useEffect(() => {
    if (isClaimed) return;
    const interval = setInterval(() => { setTimeLeft((prev) => { if (prev <= 0) { clearInterval(interval); return 0; } return prev - 1; }); }, 1000);
    return () => clearInterval(interval);
  }, [isClaimed]);
  const completeTask = (type) => {
    if (tasks[type]) return;
    setTasks((prev) => ({ ...prev, [type]: true }));
    setTimeLeft((prev) => Math.max(0, prev - 60));
  };
  const claimTreasure = () => { if (timeLeft > 0 || isClaimed) return; setIsClaimed(true); onClaimCoins?.(500); setNotice('Treasure Box opened! You received 500 Coins.'); };
  return (
    <div className="fixed inset-0 z-[2000] bg-black/75 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-[430px] bg-[#0c0c10] border-t border-[#333] rounded-t-3xl p-5 text-white max-h-[85vh] overflow-y-auto no-scrollbar pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <h2 className="text-xl font-extrabold text-center mb-1">Daily Task</h2>
        <p className="text-center text-[#9aa3c7] text-xs mb-5">Spend time in the Voice Room to unlock the Treasure Box</p>
        {notice && <div className="mb-4 p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-bold text-center">{notice}</div>}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <div className="flex flex-col items-center opacity-40"><div className="text-3xl mb-1 grayscale">📦</div><span className="text-[10px]">Claimed</span></div>
          <div className="flex flex-col items-center opacity-40"><div className="text-3xl mb-1 grayscale">📦</div><span className="text-[10px]">Claimed</span></div>
          <Btn className="flex flex-col items-center cursor-pointer" onClick={claimTreasure}>
            <div className={`text-3xl mb-1 ${timeLeft === 0 ? 'animate-bounce' : ''}`}>{timeLeft === 0 ? '🎁' : '📦'}</div>
            <span className={`text-[10px] font-bold tabular-nums ${timeLeft === 0 ? 'text-[#f5c542]' : 'text-[#7ee7ff]'}`}>{isClaimed ? 'Claimed' : timeLeft === 0 ? 'Claim' : formatCountdown(timeLeft)}</span>
          </Btn>
          <div className="flex flex-col items-center"><div className="text-3xl mb-1">🎁</div><span className="text-[10px] text-[#ff4d9a] font-bold">VIP Only</span></div>
        </div>
        <p className="text-xs text-[#9aa3c7] mb-3">Each completed task reduces the treasure countdown by 1 minute.</p>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center border-t border-white/10 pt-3"><span className="text-sm font-bold">Follow a Voice Room</span><Btn onClick={() => completeTask('follow')} className={`px-4 py-1.5 rounded-full text-xs font-bold ${tasks.follow ? 'border border-slate-600 text-slate-500' : 'border border-[#7ee7ff] text-[#7ee7ff]'}`}>{tasks.follow ? 'Done' : 'Go'}</Btn></div>
          <div className="flex justify-between items-center border-t border-white/10 pt-3"><span className="text-sm font-bold">Send Gift Once</span><Btn onClick={() => completeTask('gift')} className={`px-4 py-1.5 rounded-full text-xs font-bold ${tasks.gift ? 'border border-slate-600 text-slate-500' : 'border border-[#7ee7ff] text-[#7ee7ff]'}`}>{tasks.gift ? 'Done' : 'Go'}</Btn></div>
        </div>
        <Btn onClick={onClose} className="w-full bg-white/10 text-white mt-5 py-3 rounded-xl font-bold hover:bg-white/15">Close</Btn>
      </div>
    </div>
  );
};

const DraggableAdminBtn = ({ onClick }) => {
  const [pos, setPos] = useState({ x: typeof window !== 'undefined' ? window.innerWidth - 80 : 300, y: typeof window !== 'undefined' ? window.innerHeight - 150 : 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const handleStart = (e) => { setIsDragging(true); const cx = 'touches' in e ? e.touches[0].clientX : e.clientX; const cy = 'touches' in e ? e.touches[0].clientY : e.clientY; setOffset({ x: cx - pos.x, y: cy - pos.y }); };
  const handleMove = (e) => { if (!isDragging) return; const cx = 'touches' in e ? e.touches[0].clientX : e.clientX; const cy = 'touches' in e ? e.touches[0].clientY : e.clientY; setPos({ x: cx - offset.x, y: cy - offset.y }); };
  const handleEnd = () => setIsDragging(false);
  return (
    <Btn aria-label="Open Super Admin Dashboard" className="fixed z-[100] w-14 h-14 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(255,215,0,0.6)] border-2 border-yellow-200 cursor-grab active:cursor-grabbing touch-none"
      style={{ left: pos.x, top: pos.y, transition: isDragging ? 'none' : 'all 0.2s' }}
      onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
      onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
      onClick={() => { if (!isDragging) onClick(); }}>👑</Btn>
  );
};

// ============ TITLE MANAGER (ADMIN) ============
const TitleManagerAdmin = ({ onNotice }) => {
  const [templates, setTemplates] = useState([]);
  const [newTitle, setNewTitle] = useState({ text: '', emoji: '', glowStyle: 'gold' });
  const [targetDisplayId, setTargetDisplayId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [duration, setDuration] = useState('7d');
  const [busy, setBusy] = useState(false);
  const [loadedUser, setLoadedUser] = useState(null);
  const [loadedTitles, setLoadedTitles] = useState([]);

  useEffect(() => {
    const unsub = db.collection('settings').doc('titleTemplates').onSnapshot((doc) => { setTemplates(doc.exists ? (doc.data().list || []) : []); });
    return () => unsub();
  }, []);

  const saveTemplates = async (list) => { await db.collection('settings').doc('titleTemplates').set({ list }); };
  const createTemplate = async () => {
    if (!newTitle.text.trim()) return onNotice('Enter title text');
    const tpl = { id: `t-${Date.now()}`, text: newTitle.text.trim().slice(0, 20), emoji: newTitle.emoji.trim(), glowStyle: newTitle.glowStyle || 'gold', createdAt: Date.now() };
    await saveTemplates([...templates, tpl]);
    setNewTitle({ text: '', emoji: '', glowStyle: 'gold' });
    onNotice('Title template created!');
  };
  const deleteTemplate = async (id) => { await saveTemplates(templates.filter((t) => t.id !== id)); onNotice('Template deleted'); };
  const loadUser = async () => {
    if (!targetDisplayId.trim()) return onNotice('Enter user display ID');
    setBusy(true);
    try {
      const snap = await db.collection('users').where('displayId', '==', targetDisplayId.trim()).limit(1).get();
      if (snap.empty) { setBusy(false); return onNotice('User not found'); }
      const doc = snap.docs[0];
      setLoadedUser({ uid: doc.id, ...doc.data() });
      setLoadedTitles(doc.data().titles || []);
    } catch (e) { onNotice(`Error: ${errMsg(e)}`); }
    setBusy(false);
  };
  const giveTitle = async () => {
    if (!loadedUser) return onNotice('Load a user first');
    if (!selectedTemplateId) return onNotice('Select a template');
    const tpl = templates.find((t) => t.id === selectedTemplateId);
    if (!tpl) return onNotice('Template not found');
    setBusy(true);
    try {
      const dur = TITLE_DURATIONS.find((d) => d.id === duration);
      const expiresAt = dur.ms ? Date.now() + dur.ms : null;
      const newTitleOnUser = { id: `ut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, templateId: tpl.id, text: tpl.text, emoji: tpl.emoji, glowStyle: tpl.glowStyle, expiresAt, active: true, grantedAt: Date.now() };
      const updated = [...(loadedTitles || []), newTitleOnUser];
      await uDoc(loadedUser.uid).update({ titles: updated });
      setLoadedTitles(updated);
      onNotice(`Title "${tpl.text}" granted!`);
      setSelectedTemplateId(null);
    } catch (e) { onNotice(`Error: ${errMsg(e)}`); }
    setBusy(false);
  };
  const revokeSingle = async (titleId) => {
    if (!loadedUser) return;
    try { const updated = (loadedTitles || []).filter((t) => t.id !== titleId); await uDoc(loadedUser.uid).update({ titles: updated }); setLoadedTitles(updated); onNotice('Title revoked'); }
    catch (e) { onNotice(`Error: ${errMsg(e)}`); }
  };
  const revokeAll = async () => {
    if (!loadedUser) return;
    try { await uDoc(loadedUser.uid).update({ titles: [] }); setLoadedTitles([]); onNotice('All titles revoked'); }
    catch (e) { onNotice(`Error: ${errMsg(e)}`); }
  };
  const toggleAdminBadge = async () => {
    if (!loadedUser) return onNotice('Load a user first');
    try { const next = loadedUser.showAdminBadge === false ? true : false; await uDoc(loadedUser.uid).update({ showAdminBadge: next }); setLoadedUser({ ...loadedUser, showAdminBadge: next }); onNotice(next ? 'Admin badge shown' : 'Admin badge hidden'); }
    catch (e) { onNotice(`Error: ${errMsg(e)}`); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#0c0c10] p-4 rounded-xl border border-white/10">
        <h3 className="font-bold mb-3 text-yellow-500">✨ Create Title Template</h3>
        <input type="text" placeholder="Title text (max 20)" maxLength={20} value={newTitle.text} onChange={(e) => setNewTitle({ ...newTitle, text: e.target.value })} className={C_INP_SM + ' mb-2'} />
        <input type="text" placeholder="Emoji or image URL (optional)" maxLength={400} value={newTitle.emoji} onChange={(e) => setNewTitle({ ...newTitle, emoji: e.target.value })} className={C_INP_SM + ' mb-2'} />
        <div className="flex items-center justify-between mb-1.5">
          <label className={C_LBL_XS}>Glow Style ({TITLE_GLOW_STYLES.length} available)</label>
          <span className="text-[10px] text-yellow-500 font-bold">{TITLE_GLOW_STYLES.find((g) => g.id === newTitle.glowStyle)?.name}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto mb-3 p-1 bg-black/40 rounded-lg">
          {TITLE_GLOW_STYLES.map((g) => (
            <Btn key={g.id} onClick={() => setNewTitle({ ...newTitle, glowStyle: g.id })} className={`text-[9px] py-1.5 rounded border font-bold ${newTitle.glowStyle === g.id ? 'border-pink-500 bg-pink-500/20 text-white' : 'border-white/10 text-slate-400'}`} style={newTitle.glowStyle === g.id ? getTitleStyleById(g.id) : {}}>{g.name}</Btn>
          ))}
        </div>
        <div className="bg-black/40 p-2 rounded-lg mb-3 flex items-center justify-center min-h-[36px]">
          <TitleBadge title={{ text: newTitle.text || 'Preview', emoji: newTitle.emoji, glowStyle: newTitle.glowStyle }} size="md" />
        </div>
        <Btn onClick={createTemplate} className="w-full bg-green-600 py-2 rounded-lg font-bold text-sm">+ Create Template</Btn>
      </div>

      <div className="bg-[#0c0c10] p-4 rounded-xl border border-white/10">
        <h3 className="font-bold mb-3">📋 Templates ({templates.length})</h3>
        {templates.length === 0 ? <p className="text-xs text-gray-500">No templates yet.</p> : (
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {templates.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-2 bg-black/30 rounded">
                <TitleBadge title={t} size="md" />
                <Btn onClick={() => deleteTemplate(t.id)} className="text-red-500 text-xs px-2 py-1">✕</Btn>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#0c0c10] p-4 rounded-xl border border-white/10">
        <h3 className="font-bold mb-3">🎁 Give / Revoke Titles</h3>
        <input type="text" placeholder="User display ID" value={targetDisplayId} onChange={(e) => setTargetDisplayId(e.target.value)} className={C_INP_SM + ' mb-2'} />
        <Btn onClick={loadUser} disabled={busy} className="w-full bg-blue-600 py-2 rounded-lg font-bold text-sm mb-3">{busy ? 'Loading...' : 'Load User'}</Btn>
        {loadedUser && (
          <>
            <div className="bg-black/30 p-2 rounded-lg mb-2 text-xs text-slate-300">
              <span className="font-bold text-white">{loadedUser.displayName}</span> · ID {loadedUser.displayId} {loadedUser.isAdmin && <span className="ml-1 text-purple-400">(Admin)</span>}
            </div>
            <select value={selectedTemplateId || ''} onChange={(e) => setSelectedTemplateId(e.target.value || null)} className={C_INP_SM + ' mb-2'}>
              <option value="">Select template...</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.text}</option>)}
            </select>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className={C_INP_SM + ' mb-2'}>
              {TITLE_DURATIONS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
            <Btn onClick={giveTitle} disabled={busy || !selectedTemplateId} className="w-full bg-pink-500 disabled:bg-gray-600 py-2 rounded-lg font-bold text-sm mb-2">Give Title</Btn>
            <Btn onClick={toggleAdminBadge} className="w-full bg-purple-600 py-2 rounded-lg font-bold text-sm mb-3">{loadedUser.showAdminBadge === false ? '👁️ Show Admin Badge' : '🙈 Hide Admin Badge'}</Btn>
            <div className="border-t border-white/10 pt-2">
              <p className="text-[11px] text-slate-400 mb-1">Current Titles ({loadedTitles.length})</p>
              {loadedTitles.length === 0 ? <p className="text-[11px] text-gray-500">None</p> : loadedTitles.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-1.5 bg-black/30 rounded mb-1">
                  <div className="flex items-center gap-1 flex-wrap"><TitleBadge title={t} />{t.expiresAt && <span className="text-[9px] text-gray-500">{new Date(t.expiresAt).toLocaleDateString()}</span>}</div>
                  <Btn onClick={() => revokeSingle(t.id)} className="text-red-400 text-[10px] px-1.5 py-0.5">Revoke</Btn>
                </div>
              ))}
              {loadedTitles.length > 0 && <Btn onClick={revokeAll} className="w-full bg-red-700 py-1.5 rounded text-xs font-bold mt-2">Revoke ALL</Btn>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ============ ADMIN DASHBOARD ============
const AdminDashboard = ({ onClose, onNotice }) => {
  const [activeMenu, setActiveMenu] = useState('gifts');
  const [currentGifts, setCurrentGifts] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  useEffect(() => {
    const unsub = db.collection('settings').doc('gifts').onSnapshot((doc) => {
      if (doc.exists && doc.data()?.list) setCurrentGifts(doc.data().list);
      else setCurrentGifts(DEFAULT_GIFTS);
    });
    return () => unsub();
  }, []);
  const handleSaveGifts = async () => {
    try { await db.collection('settings').doc('gifts').set({ list: currentGifts }); onNotice('Gifts updated!'); }
    catch (e) { onNotice(`Error: ${errMsg(e)}`); }
  };
  const handleFileUpload = async (e, idx, fileType) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return onNotice('Please select a file.');
    if (file.size > 5 * 1024 * 1024) return onNotice('File must be under 5MB.');
    setUploadingMedia(true);
    try {
      const snapshot = await storage.ref(`gifts/${Date.now()}_${file.name}`).put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      const n = [...currentGifts];
      n[idx] = { ...n[idx], [fileType]: downloadURL };
      if (fileType === 'i') n[idx].type = file.type.startsWith('video') ? 'video' : 'image';
      setCurrentGifts(n);
      onNotice('File uploaded!');
    } catch (err) { onNotice(`Upload failed: ${errMsg(err)}`); }
    setUploadingMedia(false);
  };
  return (
    <div className="fixed inset-0 bg-black z-[5000] flex flex-col text-white">
      <div className="flex justify-between items-center p-4 border-b border-white/10 shrink-0">
        <h1 className="text-xl font-bold text-yellow-500">👑 Super Admin Dashboard</h1>
        <Btn onClick={onClose} className="text-2xl font-bold text-slate-400 hover:text-white">×</Btn>
      </div>
      <div className="flex gap-2 p-4 border-b border-white/10 shrink-0">
        <Btn onClick={() => setActiveMenu('gifts')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${activeMenu === 'gifts' ? 'bg-[var(--color-rose)]' : 'bg-[#0c0c10]'}`}>🎁 Gifts</Btn>
        <Btn onClick={() => setActiveMenu('titles')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${activeMenu === 'titles' ? 'bg-[var(--color-rose)]' : 'bg-[#0c0c10]'}`}>👑 Titles</Btn>
        <Btn onClick={() => setActiveMenu('users')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${activeMenu === 'users' ? 'bg-[var(--color-rose)]' : 'bg-[#0c0c10]'}`}>👥 Users</Btn>
      </div>
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {activeMenu === 'gifts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-slate-400">Add Emoji, Image, Video &amp; Sound</p>
              <Btn onClick={() => setCurrentGifts([...currentGifts, { i: '🎁', n: 'New Gift', p: 100, anim: 'float', sound: '', type: 'emoji' }])} className="bg-green-600 px-3 py-1.5 rounded text-sm font-bold shadow-md">+ Add</Btn>
            </div>
            {currentGifts.map((g, idx) => (
              <div key={idx} className="bg-[#0c0c10] p-3 rounded-xl border border-white/10 space-y-3 relative">
                <Btn onClick={() => setCurrentGifts(currentGifts.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 font-bold text-lg z-10">×</Btn>
                <div className="flex gap-2 pr-6">
                  <div className="w-20"><label className={C_LBL_XS}>Preview</label><div className="w-full h-12 bg-black border border-white/15 rounded flex items-center justify-center text-2xl relative overflow-hidden">{g.type === 'image' ? <img src={g.i} alt={g.n} className="w-full h-full object-contain" /> : g.type === 'video' ? <video src={g.i} className="w-full h-full object-contain" /> : g.i}</div></div>
                  <div className="flex-1"><label className={C_LBL_XS}>Name</label><input type="text" value={g.n} onChange={(e) => { const n = [...currentGifts]; n[idx] = { ...n[idx], n: e.target.value }; setCurrentGifts(n); }} className={C_INP_SM} /></div>
                  <div className="w-16"><label className={C_LBL_XS}>Price</label><input type="number" value={g.p} onChange={(e) => { const n = [...currentGifts]; n[idx] = { ...n[idx], p: Number(e.target.value) }; setCurrentGifts(n); }} className={C_INP_SM} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={C_LBL_XS}>Change Emoji</label><input type="text" value={g.type === 'emoji' ? g.i : ''} placeholder="e.g. 🌹" onChange={(e) => { const n = [...currentGifts]; n[idx] = { ...n[idx], i: e.target.value, type: 'emoji' }; setCurrentGifts(n); }} className={C_INP_SM} /></div>
                  <div><label className={C_LBL_XS}>Upload Img/Vid</label><input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, idx, 'i')} className="w-full text-xs text-slate-400" /></div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1"><label className={C_LBL_XS}>Animation</label><select value={g.anim || 'float'} onChange={(e) => { const n = [...currentGifts]; n[idx] = { ...n[idx], anim: e.target.value }; setCurrentGifts(n); }} className={C_INP_SM}><option value="float">Float Up</option><option value="bounce">Bounce</option><option value="explode">Explode</option><option value="slide">Slide</option></select></div>
                  <div className="flex-1"><label className={C_LBL_XS}>Upload Sound</label><input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, idx, 'sound')} className="w-full text-xs text-slate-400" /></div>
                </div>
              </div>
            ))}
            <Btn onClick={handleSaveGifts} disabled={uploadingMedia} className="w-full bg-[var(--color-rose)] py-3 rounded-xl font-bold mt-4 shadow-lg disabled:opacity-50">{uploadingMedia ? 'Uploading...' : 'Save All Gifts'}</Btn>
          </div>
        )}
        {activeMenu === 'titles' && <TitleManagerAdmin onNotice={onNotice} />}
        {activeMenu === 'users' && (
          <div className="text-center text-slate-400 mt-10 p-5 bg-[#0c0c10] rounded-xl border border-white/10">
            <p className="text-lg font-bold mb-2 text-white">User Management</p>
            <p className="text-sm">Go to a user's Profile and click ⋮ for full controls.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const HomeTab = ({ userProfile, setActiveTab, openProfile, onNotice }) => {
  const isAdmin = isOfficialDisplayId(userProfile?.displayId);
  const comingSoon = () => onNotice('Under Maintenance! Coming soon.');
  return (
    <div className="pb-4">
      <div className="p-4 flex justify-between items-center">
        <Btn onClick={() => openProfile(userProfile)} className="flex items-center gap-3 text-left">
          <UserAvatar src={userProfile?.photoURL} name={userProfile?.displayName} className="w-12 h-12 rounded-full border-2 border-[var(--color-rose)]" />
          <div><p className="text-[11px] text-slate-400 font-semibold">Welcome back,</p><h2 className="font-bold text-lg text-white leading-tight">{userProfile?.displayName}</h2></div>
        </Btn>
        <Btn onClick={comingSoon} className="bg-[#0c0c10] border border-yellow-500/50 rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <span className="text-yellow-500 text-base">🪙</span><span className="font-bold text-sm text-white tabular-nums">{isAdmin ? '∞' : userProfile?.coins || 0}</span><span className="text-yellow-500 font-bold">+</span>
        </Btn>
      </div>
      <div className="px-4 mb-6">
        <Btn onClick={comingSoon} className="w-full text-left h-36 bg-gradient-to-r from-[#1c1028] via-[#4a1942] to-[#ff4d9a] rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden shadow-lg">
          <div className="absolute -right-4 -bottom-6 text-9xl opacity-20">🎉</div>
          <h2 className="text-white font-black text-2xl mb-1">World Star Event</h2>
          <p className="text-pink-100 text-xs mb-3">Join now and win exciting rewards!</p>
          <span className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full w-fit">Join Now</span>
        </Btn>
      </div>
      <div className="px-4 grid grid-cols-4 gap-3 mb-8">
        <Btn onClick={comingSoon} className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-2xl bg-[#0c0c10] border border-white/10 flex items-center justify-center text-2xl">👑</div><span className="text-[11px] font-semibold text-slate-300">Ranking</span></Btn>
        <Btn onClick={comingSoon} className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-2xl bg-[#0c0c10] border border-white/10 flex items-center justify-center text-2xl">📋</div><span className="text-[11px] font-semibold text-slate-300">Tasks</span></Btn>
        <Btn onClick={() => setActiveTab('voice')} className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-2xl bg-[#0c0c10] border border-white/10 flex items-center justify-center text-2xl">🎤</div><span className="text-[11px] font-semibold text-slate-300">Rooms</span></Btn>
        <Btn onClick={() => setActiveTab('chats')} className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-2xl bg-[#0c0c10] border border-white/10 flex items-center justify-center text-2xl">👥</div><span className="text-[11px] font-semibold text-slate-300">Friends</span></Btn>
      </div>
      <div className="px-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-white text-base">Trending Rooms</h3>
          <Btn onClick={() => setActiveTab('voice')} className="text-xs text-[var(--color-rose)] font-semibold">See All</Btn>
        </div>
        <div className="flex flex-col gap-3">
          <Btn onClick={() => setActiveTab('voice')} className="w-full text-left bg-[#0c0c10] p-3 rounded-xl border border-white/10 flex items-center gap-3 hover:bg-white/5"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-xl">🎵</div><div className="flex-1"><p className="font-bold text-sm text-white">Music Lovers</p><p className="text-xs text-green-400">Live Voice Room</p></div><span className="bg-[var(--color-rose)]/20 text-[var(--color-rose)] border border-[var(--color-rose)]/40 text-xs font-bold px-3 py-1.5 rounded-full">Join</span></Btn>
          <Btn onClick={() => setActiveTab('voice')} className="w-full text-left bg-[#0c0c10] p-3 rounded-xl border border-white/10 flex items-center gap-3 hover:bg-white/5"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl">🎮</div><div className="flex-1"><p className="font-bold text-sm text-white">Gaming Squad</p><p className="text-xs text-green-400">Live Voice Room</p></div><span className="bg-[var(--color-rose)]/20 text-[var(--color-rose)] border border-[var(--color-rose)]/40 text-xs font-bold px-3 py-1.5 rounded-full">Join</span></Btn>
        </div>
      </div>
    </div>
  );
};

const LoginScreen = ({ onNotice }) => {
  const [loading, setLoading] = useState(false);
  const [iconLoaded, setIconLoaded] = useState(false);
  const [iconFailed, setIconFailed] = useState(false);
  const loginWith = async (provider) => {
    if (provider === 'Google') {
      if (loading) return;
      setLoading(true);
      try { const result = await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); onNotice(`✅ Welcome, ${result.user?.displayName || 'Star'}!`); }
      catch (e) { onNotice(`❌ ${errMsg(e, 'Login failed.')}`); }
      finally { setLoading(false); }
      return;
    }
    onNotice(`🚧 ${provider} Login is Coming Soon! Please use Google Login.`);
  };
  return (
    <div className="fixed inset-0 bg-[#f1f5f9] flex justify-center overflow-hidden" style={{ colorScheme: 'light' }}>
      <div className="relative w-full max-w-[450px] bg-white text-[#1a1a2e] h-[100dvh] flex flex-col overflow-hidden sm:shadow-2xl">
        <Btn onClick={() => onNotice('🚧 Help page coming soon...')} className="absolute top-4 right-4 text-sm text-[#666] font-medium px-3 py-2 min-h-[44px] flex items-center">Help</Btn>
        <div className="flex-1 flex flex-col items-center justify-center pt-14 pb-5 px-6">
          <div className="relative w-[110px] h-[110px] rounded-[28px] shadow-[0_8px_25px_rgba(0,0,0,0.15)] mb-5 overflow-hidden bg-gradient-to-br from-[#ff4d9a] via-[#a855f7] to-[#3b82f6] flex items-center justify-center shrink-0">
            {(!iconLoaded || iconFailed) && <span className="text-5xl select-none">⭐</span>}
            {!iconFailed && <img src="https://i.postimg.cc/YCG2BX3t/World-star.png" alt="World Star" referrerPolicy="no-referrer" onLoad={() => setIconLoaded(true)} onError={() => setIconFailed(true)} className={`absolute inset-0 w-full h-full object-cover transition-opacity ${iconLoaded ? 'opacity-100' : 'opacity-0'}`} />}
          </div>
          <h1 className="text-[32px] font-extrabold text-[#1a1a2e] tracking-tight mb-2">World Star</h1>
          <p className="text-[16px] text-[#555]">Party Game &amp; Voice Chat</p>
        </div>
        <div className="px-[25px] pt-5 pb-8 flex flex-col gap-[15px]">
          <Btn onClick={() => loginWith('Google')} disabled={loading} className="w-full py-[15px] px-4 rounded-[30px] border border-[#e0e0e0] bg-white text-[16px] font-semibold text-[#1a1a2e] flex items-center justify-center gap-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:scale-[0.98] disabled:opacity-60 min-h-[52px]">
            <svg className="w-[22px] h-[22px] shrink-0" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>
            <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
          </Btn>
          <Btn onClick={() => loginWith('Facebook')} className="relative w-full py-[15px] px-4 rounded-[30px] border border-[#e0e0e0] bg-white text-[16px] font-semibold text-[#1a1a2e] flex items-center justify-center gap-2.5 active:scale-[0.98] min-h-[52px]">
            <span className="absolute -top-2 right-5 bg-[#e0f7fa] text-[#00bcd4] text-[10px] px-2 py-0.5 rounded-[10px] border border-[#b2ebf2] font-bold">Last Sign</span>
            <svg className="w-[22px] h-[22px] shrink-0" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            <span>Sign in with Facebook</span>
          </Btn>
          <div className="flex justify-center gap-[25px] mt-[10px]">
            <Btn onClick={() => loginWith('Phone')} title="Login with Phone" className="w-[50px] h-[50px] rounded-full bg-[#f5f5f5] flex items-center justify-center active:scale-95"><svg className="w-6 h-6 fill-[#333]" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg></Btn>
            <Btn onClick={() => loginWith('X')} title="Login with X" className="w-[50px] h-[50px] rounded-full bg-[#f5f5f5] flex items-center justify-center active:scale-95"><svg className="w-6 h-6 fill-[#333]" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></Btn>
            <Btn onClick={() => loginWith('QR Code')} title="Scan QR" className="w-[50px] h-[50px] rounded-full bg-[#f5f5f5] flex items-center justify-center active:scale-95"><svg className="w-6 h-6 fill-[#333]" viewBox="0 0 24 24"><path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 15h6v6H3v-6zm2 2v2h2v-2H5zm10-2h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm-4-4h2v2h-2v-2z" /></svg></Btn>
          </div>
        </div>
        <div className="text-center text-[11px] text-[#888] px-[30px] pb-5 leading-[1.5]">
          Login means you agree to <Btn onClick={() => onNotice('🚧 Terms Coming Soon!')} className="text-[#1a1a2e] font-semibold underline">Terms</Btn> and <Btn onClick={() => onNotice('🚧 Privacy Coming Soon!')} className="text-[#1a1a2e] font-semibold underline">Privacy</Btn>
        </div>
      </div>
    </div>
  );
};

const VoiceRoomTab = ({ user, userProfile, onJoinRoom, onNotice }) => {
  const [rooms, setRooms] = useState([]);
  const [currentTab, setCurrentTab] = useState('All');
  const [currentCat, setCurrentCat] = useState('All');
  const [subView, setSubView] = useState('list');
  const [passwordPromptRoom, setPasswordPromptRoom] = useState(null);
  const [enteredPass, setEnteredPass] = useState('');
  useEffect(() => {
    const unsub = db.collection('voiceRooms').orderBy('createdAt', 'desc').onSnapshot((snap) => { setRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); });
    return () => unsub();
  }, []);
  const filteredRooms = rooms.filter((r) => (currentCat === 'All' ? true : r.tag === currentCat));
  const handleJoinClick = (room) => {
    if (room.hasPassword && room.password) { setPasswordPromptRoom(room); setEnteredPass(''); return; }
    onJoinRoom(room.id);
  };
  if (subView === 'create') return <CreateRoomForm user={user} userProfile={userProfile} onClose={() => setSubView('list')} onAdvanced={() => setSubView('advanced')} onJoin={onJoinRoom} onNotice={onNotice} />;
  if (subView === 'advanced') return <AdvancedRoomForm user={user} userProfile={userProfile} onClose={() => setSubView('create')} onJoin={onJoinRoom} onNotice={onNotice} />;
  return (
    <div className="pb-4">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex gap-5 items-baseline">
          {['Related', 'All', 'Popular'].map((tab) => (<Btn key={tab} onClick={() => setCurrentTab(tab)} className={`cursor-pointer transition-all ${currentTab === tab ? 'text-2xl font-extrabold text-white' : 'text-sm text-slate-400 font-semibold'}`}>{tab}</Btn>))}
        </div>
        <div className="flex gap-3 items-center">
          <Btn onClick={() => onNotice('Room search coming soon.')} className="text-xl text-slate-300 w-10 h-10 flex items-center justify-center">🔍</Btn>
          <Btn onClick={() => setSubView('create')} className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-blue-500/30 flex items-center gap-1 text-sm"><span>+</span> Create</Btn>
        </div>
      </div>
      <Btn onClick={() => onNotice('Hot Room coming soon.')} className="w-[calc(100%-2.5rem)] text-left mx-5 mb-5 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-purple-500/20 block">
        <h2 className="text-yellow-300 text-3xl font-black italic mb-2 drop-shadow-md">HOT ROOM</h2><p className="text-white text-xs bg-white/20 inline-block px-3 py-1 rounded-full">View ranking ▶</p>
      </Btn>
      <div className="flex gap-5 px-5 pb-3 overflow-x-auto no-scrollbar border-b border-slate-800">
        {['All', 'Friends', 'PK', 'Music', 'Video', 'Game'].map((cat) => (<Btn key={cat} onClick={() => setCurrentCat(cat)} className="relative pb-2 whitespace-nowrap"><span className={`text-sm font-semibold ${currentCat === cat ? 'text-white' : 'text-slate-400'}`}>{cat}</span>{currentCat === cat && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-1 bg-blue-500 rounded-full" />}</Btn>))}
      </div>
      <div className="flex flex-col">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">No rooms active right now.<br /><Btn className="text-blue-400 font-bold mt-2 inline-block text-lg" onClick={() => setSubView('create')}>+ Create a Room</Btn></div>
        ) : filteredRooms.map((room) => {
          let tagClass = 'text-orange-500 bg-orange-500/10';
          if (room.tag === 'Music') tagClass = 'text-blue-500 bg-blue-500/10';
          if (room.tag === 'Game') tagClass = 'text-yellow-500 bg-yellow-500/10';
          if (room.tag === 'PK') tagClass = 'text-red-500 bg-red-500/10';
          if (room.tag === 'Chats') tagClass = 'text-green-500 bg-green-500/10';
          return (
            <Btn key={room.id} onClick={() => handleJoinClick(room)} className="w-full text-left flex items-center px-5 py-4 border-b border-slate-800 hover:bg-slate-800/50">
              <div className="relative mr-4 shrink-0"><UserAvatar src={room.ownerImg} name={room.ownerName} className="w-14 h-14 rounded-2xl shadow-md" />{room.hasPassword && <span className="absolute -top-2 -right-2 text-sm bg-black/80 rounded-full p-1 border border-slate-600">🔒</span>}</div>
              <div className="flex-1 min-w-0"><div className="text-base font-semibold text-white mb-1 truncate">{room.title}</div><div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tagClass}`}>{room.tag}</span><span className="text-xs text-slate-400 flex items-center gap-1 tabular-nums">👥 {room.activeMembers?.length || 1}</span></div><div className="text-xs text-slate-500 mt-1 truncate">Host: {room.ownerName}</div></div>
            </Btn>
          );
        })}
      </div>
      {passwordPromptRoom && (
        <div className={C_MOD_OVL}>
          <div className="bg-[#0c0c10] p-5 rounded-2xl w-full max-w-xs border border-white/15">
            <h3 className="text-base font-bold text-white mb-2">Enter Room Password</h3>
            <p className="text-xs text-slate-400 mb-3 truncate">{passwordPromptRoom.title}</p>
            <input type="password" placeholder="Password" value={enteredPass} onChange={(e) => setEnteredPass(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm mb-3 outline-none" />
            <div className="flex gap-2"><Btn onClick={() => setPasswordPromptRoom(null)} className={C_BTN_S}>Cancel</Btn><Btn onClick={() => { if (enteredPass !== passwordPromptRoom.password) { onNotice('Incorrect Password!'); return; } const id = passwordPromptRoom.id; setPasswordPromptRoom(null); onJoinRoom(id); }} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold text-sm">Join</Btn></div>
          </div>
        </div>
      )}
    </div>
  );
};

const CreateRoomForm = ({ user, userProfile, onClose, onAdvanced, onJoin, onNotice }) => {
  const [title, setTitle] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedMode, setSelectedMode] = useState('Normal');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(false);
  const modes = [{ name: 'Normal', icon: '💼', soon: false }, { name: 'Acquaint', icon: '💕', soon: false }, { name: 'Auction', icon: '🔨', soon: true }, { name: 'Video', icon: '📺', soon: true }, { name: 'Games', icon: '🎮', soon: true }];
  const tags = ['Friends', 'Music', 'Game', 'Chats'];
  const handleCreate = async () => {
    if (title.trim().length < 3) return onNotice('Title must be at least 3 characters.');
    if (hasPassword && password.trim().length < 3) return onNotice('Password must be at least 3 characters.');
    if (modes.find((m) => m.name === selectedMode)?.soon) return onNotice(`${selectedMode} mode is coming soon!`);
    setLoading(true);
    try {
      const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
      const newRoom = await db.collection('voiceRooms').add({ title: title.trim(), tag: selectedTag || 'Chats', roomCode, hasPassword, password: hasPassword ? password.trim() : null, ownerId: user.uid, ownerName: userProfile.displayName, ownerImg: userProfile.photoURL, createdAt: FV.serverTimestamp(), activeMembers: [], kicked: {}, blocked: [], mutedUsers: [] });
      onJoin(newRoom.id);
    } catch (err) { onNotice(`Error: ${errMsg(err)}`); }
    setLoading(false);
  };
  return (
    <div className={C_FORM_SCR}>
      <div className={C_FORM_HDR}><Btn onClick={onClose} className="absolute left-5 text-2xl text-slate-400">✕</Btn><h1 className="text-lg font-bold text-white">Create Voice Room</h1></div>
      <div className="p-5 flex-1 overflow-y-auto pb-28">
        <input type="text" placeholder="Enter room title" maxLength={25} className="w-full bg-[#0c0c10] border border-white/15 rounded-xl p-4 text-white outline-none focus:border-blue-500 mb-6" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex justify-between items-center mb-2"><span className="text-white font-medium">Password Lock</span>
          <label className="relative inline-block w-12 h-6 cursor-pointer"><input type="checkbox" className="opacity-0 w-0 h-0" checked={hasPassword} onChange={() => setHasPassword(!hasPassword)} /><span className={`absolute top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${hasPassword ? 'bg-blue-500' : 'bg-slate-600'}`}><span className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform ${hasPassword ? 'translate-x-6' : ''}`} /></span></label>
        </div>
        {hasPassword && <input type="text" placeholder="Enter Room Password" maxLength={15} className="w-full bg-[#0c0c10] border border-blue-500 rounded-xl p-3 text-white outline-none mb-6" value={password} onChange={(e) => setPassword(e.target.value)} />}
        <div className="text-sm text-slate-400 mb-3 mt-4">Room mode</div>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {modes.map((mode) => (<Btn key={mode.name} onClick={() => setSelectedMode(mode.name)} className={`relative border rounded-xl p-3 text-center ${selectedMode === mode.name ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 text-slate-400'}`}>{mode.soon && <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">NEW</span>}<div className="text-lg mb-1">{mode.icon}</div><div className="text-xs font-semibold">{mode.name}</div></Btn>))}
        </div>
        <div className="text-sm text-slate-400 mb-3">Select Room Tag</div>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-8">{tags.map((tag) => (<Btn key={tag} onClick={() => setSelectedTag(tag)} className={`px-5 py-2 rounded-full text-sm whitespace-nowrap border ${selectedTag === tag ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 text-slate-400'}`}>{tag}</Btn>))}</div>
        <Btn onClick={onAdvanced} className="w-full text-center text-yellow-500 font-semibold py-2 mb-8">Create Advanced Voice Room &gt;</Btn>
      </div>
      <div className={C_FORM_FTR}><Btn onClick={handleCreate} disabled={loading} className="w-full bg-blue-600 text-white font-bold text-lg py-3.5 rounded-full shadow-lg">{loading ? 'Creating...' : 'Create Room'}</Btn></div>
    </div>
  );
};

const AdvancedRoomForm = ({ user, userProfile, onClose, onJoin, onNotice }) => {
  const [title, setTitle] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTag, setSelectedTag] = useState('Friends');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const ids = ['1001', '2005', '8888', '5201', '9999'];
  const tags = ['Friends', 'Music', 'Game', 'Chats'];
  const cost = 1999;
  const isAdmin = isOfficialDisplayId(userProfile?.displayId);
  const requestCreate = () => {
    if (title.trim().length < 3 || !selectedId) return onNotice('Select ID and title (min 3 chars)!');
    if (!isAdmin && (userProfile.coins || 0) < cost) return onNotice('Insufficient balance! Need 1,999 coins.');
    setConfirmOpen(true);
  };
  const handleConfirmCreate = async () => {
    setConfirmOpen(false);
    try {
      if (!isAdmin) await uDoc(user.uid).update({ coins: FV.increment(-cost) });
      const newRoom = await db.collection('voiceRooms').add({ title: title.trim(), tag: selectedTag, roomCode: selectedId, isAdvanced: true, ownerId: user.uid, ownerName: userProfile.displayName, ownerImg: userProfile.photoURL, createdAt: FV.serverTimestamp(), activeMembers: [], kicked: {}, blocked: [], mutedUsers: [] });
      onJoin(newRoom.id);
    } catch (err) { onNotice(`Error: ${errMsg(err)}`); }
  };
  return (
    <div className={C_FORM_SCR}>
      <div className={C_FORM_HDR}><Btn onClick={onClose} className="absolute left-5 text-2xl text-slate-400">✕</Btn><h1 className="text-lg font-bold text-yellow-500">Advanced Room</h1></div>
      <div className="p-5 flex-1 overflow-y-auto pb-28">
        <div className="text-sm font-bold text-white mb-3">Select Room ID (Permanent)</div>
        <div className="grid grid-cols-3 gap-2 mb-6">{ids.map((id) => (<Btn key={id} onClick={() => setSelectedId(id)} className={`border-2 rounded-xl p-3 text-center font-bold text-lg ${selectedId === id ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-slate-700 text-slate-400'}`}>{id}</Btn>))}</div>
        <div className="text-sm font-bold text-white mb-3 mt-6">Room Title</div>
        <input type="text" placeholder="Enter room title" className="w-full bg-[#0c0c10] border border-white/15 rounded-xl p-4 text-white outline-none focus:border-yellow-500 mb-6" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="text-sm font-bold text-white mb-3">Room Tag</div>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-8">{tags.map((tag) => (<Btn key={tag} onClick={() => setSelectedTag(tag)} className={`px-5 py-2 rounded-full text-sm whitespace-nowrap border ${selectedTag === tag ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-slate-700 text-slate-400'}`}>{tag}</Btn>))}</div>
      </div>
      <div className={C_FORM_FTR}><Btn onClick={requestCreate} className="w-full bg-yellow-500 text-black font-bold text-lg py-3.5 rounded-full shadow-lg">Create for 🪙 1,999</Btn></div>
      {confirmOpen && (
        <div className={C_MOD_OVL}><div className="bg-[#0c0c10] p-5 rounded-2xl w-full max-w-xs border border-white/15 text-center">
          <h3 className="text-base font-bold text-white mb-2">Confirm Creation</h3><p className="text-sm text-slate-300 mb-4">Create Permanent Room ID {selectedId} for 🪙 1,999?</p>
          <div className="flex gap-2"><Btn onClick={() => setConfirmOpen(false)} className={C_BTN_S}>Cancel</Btn><Btn onClick={handleConfirmCreate} className="flex-1 bg-yellow-500 text-black py-2 rounded-xl font-bold text-sm">Confirm</Btn></div>
        </div></div>
      )}
    </div>
  );
};

const ChatsTab = ({ user, userProfile, openProfile, setCurrentChat, onNotice, demoMode, demoFriends, demoRequests, onDemoAcceptRequest }) => {
  const [friends, setFriends] = useState(demoFriends || []);
  const [requests, setRequests] = useState(demoRequests || []);
  const [loading, setLoading] = useState(!demoMode);
  const [showSearch, setShowSearch] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchError, setSearchError] = useState('');
  const [acceptedIds, setAcceptedIds] = useState([]);
  useEffect(() => {
    if (demoMode) { setFriends(demoFriends || []); setRequests((demoRequests || []).filter((r) => !acceptedIds.includes(r.uid))); setLoading(false); return; }
    const unsub = db.collection('users').onSnapshot((snap) => {
      const friendsList = []; const reqList = [];
      snap.forEach((doc) => {
        const data = { uid: doc.id, ...doc.data() };
        if (userProfile?.friends?.includes(doc.id) || acceptedIds.includes(doc.id)) friendsList.push(data);
        if (userProfile?.requests?.includes(doc.id) && !acceptedIds.includes(doc.id)) reqList.push(data);
      });
      setFriends(friendsList); setRequests(reqList); setLoading(false);
    });
    return () => unsub();
  }, [demoMode, demoFriends, demoRequests, userProfile, acceptedIds]);
  const acceptRequest = async (reqUser) => {
    const requesterId = reqUser.uid;
    setAcceptedIds((prev) => (prev.includes(requesterId) ? prev : [...prev, requesterId]));
    setRequests((prev) => prev.filter((r) => r.uid !== requesterId));
    setFriends((prev) => (prev.some((f) => f.uid === requesterId) ? prev : [reqUser, ...prev]));
    onNotice?.(`Accepted ${reqUser.displayName}'s request!`);
    if (demoMode) { onDemoAcceptRequest?.(requesterId); return; }
    try {
      await Promise.all([uDoc(user.uid).update({ friends: FV.arrayUnion(requesterId), requests: FV.arrayRemove(requesterId) }), uDoc(requesterId).update({ friends: FV.arrayUnion(user.uid), sentRequests: FV.arrayRemove(user.uid) })]);
    } catch (err) {
      setAcceptedIds((prev) => prev.filter((id) => id !== requesterId));
      setRequests((prev) => (prev.some((r) => r.uid === requesterId) ? prev : [reqUser, ...prev]));
      setFriends((prev) => prev.filter((f) => f.uid !== requesterId));
      onNotice?.(`Failed: ${errMsg(err, 'Network error')}`);
    }
  };
  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setSearchError('');
    if (demoMode) {
      const match = [...(demoFriends || []), ...(demoRequests || [])].find((u) => u.displayId === searchId.trim());
      if (match) { setShowSearch(false); setSearchId(''); openProfile(match); } else setSearchError('User not found!');
      return;
    }
    try {
      const snap = await db.collection('users').where('displayId', '==', searchId.trim()).get();
      if (!snap.empty) { setShowSearch(false); setSearchId(''); openProfile({ uid: snap.docs[0].id, ...snap.docs[0].data() }); }
      else setSearchError('User not found!');
    } catch { setSearchError('Error searching.'); }
  };
  const openChat = (u) => setCurrentChat({ chatId: [user.uid, u.uid].sort().join('_'), otherUser: u });
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-white">Chats</h1>
        <Btn onClick={() => setShowSearch(true)} className="bg-[var(--color-rose)] px-3.5 py-2 rounded-full text-sm font-bold flex items-center gap-1 text-white min-h-[40px]">🔍 Add Friend</Btn>
      </div>
      {showSearch && (
        <div className={C_MOD_OVL}><div className="bg-[#0c0c10] p-6 rounded-2xl w-full max-w-sm border border-white/15">
          <h3 className="text-lg font-bold text-white mb-4">Search by ID</h3>
          <input type="text" placeholder="Enter 9-digit ID" className="w-full bg-black border border-slate-700 rounded-lg px-4 py-3 text-white mb-2 outline-none focus:border-[var(--color-rose)]" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
          {searchError && <p className="text-red-400 text-xs mb-2">{searchError}</p>}
          <div className="flex gap-2 mt-2"><Btn onClick={() => setShowSearch(false)} className="flex-1 bg-slate-800 text-white py-2.5 rounded-lg font-bold">Cancel</Btn><Btn onClick={handleSearch} className="flex-1 bg-[var(--color-rose)] text-white py-2.5 rounded-lg font-bold">Search</Btn></div>
        </div></div>
      )}
      {requests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-yellow-400 mb-2">Friend Requests ({requests.length})</h3>
          {requests.map((req) => {
            const online = isUserOnline(req);
            return (
              <div key={req.uid} className="bg-[#0c0c10] p-3 rounded-xl flex items-center justify-between mb-2 border border-white/10">
                <Btn onClick={() => openProfile(req)} className="flex items-center gap-3 text-left min-w-0 flex-1">
                  <AvatarDot src={req.photoURL} name={req.displayName} online={online} />
                  <div className="min-w-0"><p className="font-bold text-sm text-white truncate">{req.displayName}</p><p className="text-[11px] flex items-center gap-1 text-slate-400"><span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-slate-400'}`} /><span>{online ? 'Online' : 'Offline'}</span></p></div>
                </Btn>
                <Btn onClick={() => acceptRequest(req)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-full min-h-[36px] shrink-0">Accept</Btn>
              </div>
            );
          })}
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-400 mb-2">Messages</h3>
      {loading ? <p className="text-center mt-4 text-white">Loading...</p> : friends.length === 0 ? (
        <p className="text-center text-slate-400 mt-4 text-sm">No friends yet. Search ID to add friends.</p>
      ) : (
        <ul className="space-y-3">
          {friends.map((u) => {
            const online = isUserOnline(u);
            const activeTitles = getActiveTitles(u.titles);
            return (
              <li key={u.uid}>
                <div className="w-full p-3 bg-[#0c0c10] rounded-xl flex items-center gap-3 border border-white/10 hover:bg-white/5">
                  <Btn onClick={() => openProfile(u)} className="relative shrink-0"><AvatarDot src={u.photoURL} name={u.displayName} online={online} cls="w-12 h-12 rounded-full" dotCls="w-3.5 h-3.5" /></Btn>
                  <Btn onClick={() => openChat(u)} className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-white flex items-center gap-1.5 truncate"><span className="truncate">{u.displayName}</span>{isOfficialDisplayId(u.displayId) && <span className="star-official-badge text-[8px] px-1.5 py-0.5 rounded shrink-0">⭐ Star</span>}{u.isAdmin && !isOfficialDisplayId(u.displayId) && u.showAdminBadge !== false && <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[8px] px-1.5 py-0.5 rounded shrink-0">Admin</span>}</p>
                      <OnlineBadge online={online} />
                    </div>
                    {activeTitles.length > 0 && <div className="flex flex-wrap gap-1 mt-0.5">{activeTitles.slice(0, 2).map((t) => <TitleBadge key={t.id} title={t} />)}</div>}
                    <p className="text-xs text-slate-400 mt-0.5">ID: {u.displayId}</p>
                  </Btn>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const ChatRoom = ({ chatData, user, userProfile, onBack, openProfile, onNotice, demoMode }) => {
  const { chatId, otherUser } = chatData;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const online = isUserOnline(otherUser);
  const isOfficial = isOfficialDisplayId(userProfile?.displayId);
  useEffect(() => {
    if (demoMode) { setMessages([{ id: 'demo-m1', type: 'text', text: 'Hey! Welcome to World Star.', senderId: otherUser.uid }]); return; }
    const unsub = db.collection('chats').doc(chatId).collection('messages').orderBy('createdAt', 'asc').onSnapshot((snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
    return () => unsub();
  }, [chatId, demoMode, otherUser.uid]);
  const isBlocked = !isOfficial && !canSendDirectMessage(messages, user.uid, otherUser.uid);
  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || isBlocked || uploading) return;
    const t = text; setText('');
    if (demoMode) { setMessages((prev) => [...prev, { id: `dm-${Date.now()}`, text: t, type: 'text', senderId: user.uid }]); return; }
    try { await db.collection('chats').doc(chatId).collection('messages').add({ text: t, type: 'text', senderId: user.uid, createdAt: FV.serverTimestamp() }); }
    catch (err) { onNotice(`Send failed: ${errMsg(err)}`); setText(t); }
  };
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file || isBlocked) return;
    setUploading(true);
    try {
      const base64 = await compressImage(file, 600);
      if (demoMode) { setMessages((prev) => [...prev, { id: `dm-${Date.now()}`, image: base64, type: 'image', senderId: user.uid }]); setUploading(false); return; }
      await db.collection('chats').doc(chatId).collection('messages').add({ image: base64, type: 'image', senderId: user.uid, createdAt: FV.serverTimestamp() });
    } catch { onNotice('Error uploading image.'); }
    setUploading(false);
  };
  const handleRecall = async () => {
    if (!selectedMsg || selectedMsg.senderId !== user.uid) return;
    if (demoMode) { setMessages((prev) => prev.filter((m) => m.id !== selectedMsg.id)); setSelectedMsg(null); return; }
    try { await db.collection('chats').doc(chatId).collection('messages').doc(selectedMsg.id).delete(); setSelectedMsg(null); onNotice('Message recalled.'); }
    catch { onNotice('Failed to recall.'); }
  };
  return (
    <div className="fixed inset-0 z-[2000] flex flex-col bg-black text-white max-w-[430px] mx-auto">
      <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#0c0c10] shrink-0 shadow-md">
        <Btn onClick={onBack} className="text-white text-2xl font-bold px-2">←</Btn>
        <Btn className="flex items-center gap-2.5 text-left" onClick={() => openProfile(otherUser)}>
          <AvatarDot src={otherUser?.photoURL} name={otherUser?.displayName} online={online} cls="w-10 h-10 rounded-full border border-slate-600" />
          <div><p className="font-bold text-white text-base leading-tight flex items-center gap-2">{otherUser?.displayName}{!isOfficialDisplayId(otherUser?.displayId) && <CharmIcon charms={otherUser?.charms || 0} size="text-sm" />}</p><OnlineBadge online={online} /></div>
        </Btn>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-20">
        {messages.map((m) => {
          const isMe = m.senderId === user.uid;
          return (
            <div key={m.id} onClick={() => setSelectedMsg(m)} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-1.5 text-[15px] shadow-md cursor-pointer ${isMe ? 'bg-[#ff4d9a] text-white rounded-2xl rounded-br-sm' : 'bg-[#1a1a22] text-slate-200 rounded-2xl rounded-bl-sm border border-white/10'}`}>
                {m.type === 'image' ? <img src={m.image} alt="Shared" className="rounded-xl max-h-60 object-cover" /> : <span className="px-2 py-1 block">{m.text}</span>}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {isBlocked ? (
        <div className="p-4 bg-red-500/10 border-t border-red-500/30 text-center shrink-0"><p className="text-red-400 text-sm font-bold">Message limit reached (3). Wait for a reply.</p></div>
      ) : (
        <form onSubmit={send} className="p-3 bg-[#0c0c10] border-t border-white/10 flex gap-2 shrink-0">
          <Btn onClick={() => fileInputRef.current?.click()} className="bg-[#1a1a22] text-white w-11 h-11 rounded-full flex items-center justify-center border border-white/10 shrink-0">📷</Btn>
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
          <input className="flex-1 bg-black border border-white/15 rounded-full px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-rose)]" placeholder={uploading ? 'Uploading...' : 'Type a message...'} value={text} onChange={(e) => setText(e.target.value)} disabled={uploading} />
          <Btn type="submit" className="bg-[var(--color-rose)] text-white w-11 h-11 rounded-full font-bold flex items-center justify-center shrink-0">➤</Btn>
        </form>
      )}
      {selectedMsg && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4" onClick={() => setSelectedMsg(null)}>
          <div className="bg-[#1a1a22] rounded-2xl p-5 w-full max-w-xs border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-bold mb-4 text-center">Message Options</h3>
            {selectedMsg.senderId === user.uid ? <Btn onClick={handleRecall} className="w-full bg-red-500 text-white py-3 rounded-xl font-bold mb-2">Recall Message</Btn> : <p className="text-slate-400 text-center text-sm mb-4">You can only recall your own messages.</p>}
            <Btn onClick={() => setSelectedMsg(null)} className="w-full bg-slate-700 text-white py-2 rounded-xl font-bold">Cancel</Btn>
          </div>
        </div>
      )}
    </div>
  );
};

const MicSeat = ({ label, seatedUser, isMine, isOwnerSeat, isLive, isMutedInRoom, onTake, onLongPressStart, onLongPressEnd }) => {
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => { setImgFailed(false); }, [seatedUser?.img]);
  const showImg = Boolean(seatedUser?.img && !imgFailed);
  const displayName = isMine ? 'You' : seatedUser?.name;
  return (
    <div className="seat-col">
      <Btn className={`seat ${isLive ? 'is-live' : ''} ${isOwnerSeat && !isLive ? 'is-owner' : ''}`} onClick={onTake} onMouseDown={seatedUser ? onLongPressStart : undefined} onMouseUp={onLongPressEnd} onMouseLeave={onLongPressEnd} onTouchStart={seatedUser ? onLongPressStart : undefined} onTouchEnd={onLongPressEnd}>
        {seatedUser ? (showImg ? <img src={seatedUser.img} alt={displayName || 'Speaker'} referrerPolicy="no-referrer" onError={() => setImgFailed(true)} className="w-full h-full rounded-full object-cover" /> : <span className="you-face">{(seatedUser.name || 'Y').charAt(0).toUpperCase()}</span>) : <PlusIcon />}
        {seatedUser && isOwnerSeat && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs leading-none drop-shadow">👑</span>}
        {seatedUser && isMutedInRoom && <span className="absolute -top-1 -right-1 text-[10px] bg-[#ff2a45] text-white rounded-full px-1 py-0.5 leading-none shadow">🔇</span>}
      </Btn>
      {seatedUser && <div className="seat-name">{displayName}</div>}
    </div>
  );
};

const playGiftSound = (url) => {
  if (!url) return;
  try { const audio = new Audio(url); audio.volume = 0.5; audio.play().catch(() => {}); } catch {}
};

// ============ FIXED ROOM INTERFACE ============
const RoomInterface = ({ roomId, user, userProfile, onMinimize, onLeave, onViewProfile, demoMode = false, onUpdateLocalCoins, onUpdateLocalCharms, onDemoGiftReceived }) => {
  const [roomData, setRoomData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [giftTargetUser, setGiftTargetUser] = useState(null);
  const [selectedGift, setSelectedGift] = useState(null);
  const [availableGifts, setAvailableGifts] = useState(DEFAULT_GIFTS);
  const [giftAnim, setGiftAnim] = useState(null);
  const [giftNotifications, setGiftNotifications] = useState([]);
  const [showDailyTask, setShowDailyTask] = useState(false);
  const [announcementText, setAnnouncementText] = useState('Welcome to the voice room. Keep the vibe positive.');
  const [announcementDraft, setAnnouncementDraft] = useState('');
  const [newSongTitle, setNewSongTitle] = useState('');
  const [liveCoins, setLiveCoins] = useState(Number(userProfile.coins) || 0);
  const [toast, setToast] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendingGift, setSendingGift] = useState(false);

  const lastGiftIdRef = useRef(null);
  const giftAnimTimerRef = useRef(null);
  const chatEndRef = useRef(null);
  const longPressTimer = useRef(null);
  const micStreamRef = useRef(null);
  const lastRoomSigRef = useRef('');
  const joinedAtRef = useRef(Date.now());
  const onLeaveRef = useRef(onLeave);
  const inputTextRef = useRef('');
  const notifIdRef = useRef(0);

  const isAdmin = isOfficialDisplayId(userProfile?.displayId);
  const isOwner = user?.uid === roomData?.ownerId;
  const myMember = roomData?.activeMembers?.find((m) => m.uid === user?.uid);
  const isSeated = Boolean(myMember && myMember.seatIndex !== null && myMember.seatIndex !== undefined);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 2600); };

  const pushGiftNotif = (data) => {
    notifIdRef.current += 1;
    const id = `gn-${Date.now()}-${notifIdRef.current}`;
    setGiftNotifications((prev) => [{ id, ...data }, ...prev].slice(0, 4));
    setTimeout(() => { setGiftNotifications((prev) => prev.filter((n) => n.id !== id)); }, 5500);
  };

  useEffect(() => { onLeaveRef.current = onLeave; }, [onLeave]);
  useEffect(() => { setLiveCoins(Number(userProfile.coins) || 0); }, [userProfile.coins]);
  useEffect(() => { inputTextRef.current = inputText; }, [inputText]);

  useEffect(() => {
    let active = true;
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        micStreamRef.current = stream;
      }).catch(() => {});
    }
    return () => { active = false; if (micStreamRef.current) { micStreamRef.current.getTracks().forEach((t) => t.stop()); micStreamRef.current = null; } };
  }, []);
  useEffect(() => {
    const stream = micStreamRef.current;
    if (!stream) return;
    const shouldEnable = isSeated && !isMuted && !Boolean(roomData?.mutedUsers?.includes(user.uid));
    stream.getAudioTracks().forEach((track) => { track.enabled = shouldEnable; });
  }, [isSeated, isMuted, roomData?.mutedUsers, user.uid]);
  useEffect(() => { document.querySelectorAll('audio').forEach((el) => { el.muted = isSpeakerMuted; }); }, [isSpeakerMuted]);

  useEffect(() => {
    if (demoMode) {
      setRoomData({
        id: roomId, title: "Zelda's chill lounge", tag: 'Chats', roomCode: '520188',
        ownerId: user.uid, ownerName: userProfile.displayName, ownerImg: userProfile.photoURL,
        activeMembers: [
          { uid: 'u1', name: 'Rahul', img: '', seatIndex: 2, lastSeen: Date.now() },
          { uid: 'u2', name: 'Sonia', img: '', seatIndex: 5, lastSeen: Date.now() },
          { uid: user.uid, name: userProfile.displayName, img: userProfile.photoURL, seatIndex: null, lastSeen: Date.now() }
        ],
        kicked: {}, blocked: [], mutedUsers: []
      });
      setMessages([
        { id: 'sys-1', isSystem: true, text: 'Welcome to the voice room.', createdAt: Date.now() - 60000 },
        { id: 'msg-1', senderId: 'u1', senderName: 'Rahul', text: 'Hey everyone, grab a mic seat!', createdAt: Date.now() - 30000 },
        { id: 'msg-2', senderId: 'u2', senderName: 'Sonia', text: 'Sound check is live.', createdAt: Date.now() - 20000 }
      ]);
      return;
    }
    const unsubGifts = db.collection('settings').doc('gifts').onSnapshot((doc) => {
      if (doc.exists && Array.isArray(doc.data()?.list) && doc.data().list.length > 0) setAvailableGifts(doc.data().list);
      else setAvailableGifts(DEFAULT_GIFTS);
    });
    const unsubMyCoins = uDoc(user.uid).onSnapshot((doc) => { if (doc.exists) setLiveCoins(Number(doc.data()?.coins) || 0); });
    return () => { unsubGifts(); unsubMyCoins(); };
  }, [demoMode, roomId, user.uid, userProfile.displayName, userProfile.photoURL]);

  useEffect(() => {
    if (demoMode) return;
    const roomRef = rDoc(roomId);
    let joined = false, active = true;
    joinedAtRef.current = Date.now();
    (async () => {
      try {
        const doc = await roomRef.get();
        if (!active) return;
        if (!doc.exists) { onLeaveRef.current(); return; }
        const data = doc.data();
        const access = checkRoomEntryAccess(data, user.uid);
        if (!access.allowed) { notify(access.reason || 'Access denied'); setTimeout(onLeaveRef.current, 900); return; }
        const updatedMembers = joinMemberToRoom(data.activeMembers || [], { uid: user.uid, name: userProfile.displayName, img: userProfile.photoURL }, data.ownerId);
        const updates = { activeMembers: updatedMembers, [`kicked.${user.uid}`]: FV.delete() };
        if (!data.ownerId) { updates.ownerId = user.uid; updates.ownerName = userProfile.displayName; updates.ownerImg = userProfile.photoURL; }
        await roomRef.update(updates);
        joined = true;
      } catch (err) { console.error('Error joining room:', err); }
    })();

    const unsubRoom = roomRef.onSnapshot((doc) => {
      if (!doc.exists) { onLeaveRef.current(); return; }
      const data = { id: doc.id, ...doc.data() };
      if (data.blocked && data.blocked.includes(user.uid)) { onLeaveRef.current(); return; }
      const sig = JSON.stringify({
        m: (data.activeMembers || []).map((x) => `${x.uid}:${x.seatIndex}:${x.name}`).join('|'),
        a: data.announcement || '', s: data.currentSong || '',
        mu: data.mutedUsers || [], o: data.ownerId || '',
      });
      const giftChanged = data.latestGift && data.latestGift.animId !== lastGiftIdRef.current;
      if (sig === lastRoomSigRef.current && !giftChanged) return;
      lastRoomSigRef.current = sig;
      setRoomData(data);
      if (data.announcement) setAnnouncementText(data.announcement);
      if (giftChanged) {
        lastGiftIdRef.current = data.latestGift.animId;
        const g = data.latestGift;
        setGiftAnim(g);
        playGiftSound(g.sound);
        pushGiftNotif({
          giftName: g.giftName || g.n || 'Gift',
          giftIcon: g.giftIcon || g.i || '🎁',
          giftType: g.giftType || g.type || 'emoji',
          senderName: g.senderName || 'Someone',
          receiverName: g.receiverName || 'User',
          charms: Number(g.charms) || 0,
          coins: Number(g.coins) || 0,
        });
        if (giftAnimTimerRef.current) clearTimeout(giftAnimTimerRef.current);
        giftAnimTimerRef.current = setTimeout(() => setGiftAnim(null), 3500);
      }
    });

    const unsubMsg = roomRef.collection('messages').orderBy('createdAt', 'asc').onSnapshot(
      (snap) => { setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); },
      (err) => console.warn('messages subscription:', err)
    );

    return () => {
      active = false; unsubRoom(); unsubMsg();
      if (giftAnimTimerRef.current) clearTimeout(giftAnimTimerRef.current);
      if (joined) {
        roomRef.get().then((doc) => {
          if (!doc.exists) return;
          const data = doc.data();
          const res = removeMemberOnLeave(data.activeMembers || [], user.uid, data.ownerId);
          if (res.shouldDeleteRoom) return roomRef.delete();
          const updates = { activeMembers: res.nextMembers };
          if (res.nextOwner) { updates.ownerId = res.nextOwner.uid; updates.ownerName = res.nextOwner.name; updates.ownerImg = res.nextOwner.img; }
          return roomRef.update(updates);
        }).catch(() => {});
      }
    };
  }, [demoMode, roomId, user.uid, userProfile.displayName, userProfile.photoURL]);

  useEffect(() => {
    if (demoMode) return;
    const hb = setInterval(() => {
      db.runTransaction(async (tx) => {
        const ref = rDoc(roomId);
        const doc = await tx.get(ref);
        if (!doc.exists) return;
        const data = doc.data();
        const members = data.activeMembers || [];
        if (!members.some((m) => m.uid === user.uid)) return;
        const updated = members.map((m) => (m.uid === user.uid ? { ...m, lastSeen: Date.now() } : m));
        tx.update(ref, { activeMembers: updated });
      }).catch(() => {});
    }, 25000);
    const cleanup = setInterval(() => {
      db.runTransaction(async (tx) => {
        const ref = rDoc(roomId);
        const doc = await tx.get(ref);
        if (!doc.exists) return;
        const data = doc.data();
        const now = Date.now();
        const members = data.activeMembers || [];
        const staleUids = members.filter((m) => m.uid !== user.uid && (now - (m.lastSeen || 0)) >= 90000).map((m) => m.uid);
        if (staleUids.length === 0) return;
        let current = members;
        let ownerUid = data.ownerId, ownerName = data.ownerName, ownerImg = data.ownerImg;
        for (const uid of staleUids) {
          const res = removeMemberOnLeave(current, uid, ownerUid);
          if (res.shouldDeleteRoom) { tx.delete(ref); return; }
          current = res.nextMembers;
          if (res.nextOwner) { ownerUid = res.nextOwner.uid; ownerName = res.nextOwner.name; ownerImg = res.nextOwner.img; }
        }
        tx.update(ref, { activeMembers: current, ownerId: ownerUid, ownerName, ownerImg });
      }).catch(() => {});
    }, 40000);
    return () => { clearInterval(hb); clearInterval(cleanup); };
  }, [roomId, user.uid, demoMode]);

  useEffect(() => {
    if (demoMode) return;
    const handler = () => {
      rDoc(roomId).get().then((doc) => {
        if (!doc.exists) return;
        const data = doc.data();
        const res = removeMemberOnLeave(data.activeMembers || [], user.uid, data.ownerId);
        if (res.shouldDeleteRoom) return rDoc(roomId).delete();
        const updates = { activeMembers: res.nextMembers };
        if (res.nextOwner) { updates.ownerId = res.nextOwner.uid; updates.ownerName = res.nextOwner.name; updates.ownerImg = res.nextOwner.img; }
        return rDoc(roomId).update(updates);
      }).catch(() => {});
    };
    window.addEventListener('pagehide', handler);
    window.addEventListener('beforeunload', handler);
    return () => { window.removeEventListener('pagehide', handler); window.removeEventListener('beforeunload', handler); };
  }, [roomId, user.uid, demoMode]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages]);

  const seatedUsers = useMemo(() => {
    const arr = Array(10).fill(null);
    (roomData?.activeMembers || []).forEach((m) => {
      if (m.seatIndex !== null && m.seatIndex !== undefined && m.seatIndex >= 0 && m.seatIndex < 10) arr[m.seatIndex] = m;
    });
    return arr;
  }, [roomData?.activeMembers]);

  const visibleMessages = useMemo(() => {
    if (demoMode) return messages;
    const cutoff = joinedAtRef.current - 5000;
    return messages.filter((msg) => {
      if (!msg.createdAt) return true;
      const ms = toTimestampMillis(msg.createdAt);
      return ms === null || ms >= cutoff;
    });
  }, [messages, demoMode]);

  const pushSystemLocal = async (text) => {
    if (demoMode) { setMessages((prev) => [...prev, { id: `sys-${Date.now()}-${Math.random()}`, isSystem: true, text, createdAt: Date.now() }]); return; }
    await rDoc(roomId).collection('messages').add({ text, isSystem: true, createdAt: FV.serverTimestamp() });
  };

  const handleSeatClick = async (seatIndex, seatedUser) => {
    if (!roomData) return;
    if (seatedUser) { setSelectedUser(seatedUser); setSheet('profile'); return; }
    if (myMember && myMember.seatIndex !== null && myMember.seatIndex !== undefined) { notify('You are already seated!'); return; }
    const updatedMembers = assignSeatToMember(roomData.activeMembers || [], user.uid, seatIndex);
    if (demoMode) { setRoomData({ ...roomData, activeMembers: updatedMembers }); return; }
    await rDoc(roomId).update({ activeMembers: updatedMembers });
  };
  const liftUpSeat = async (uid) => {
    if (!roomData) return;
    const updatedMembers = liftMemberFromSeat(roomData.activeMembers || [], uid);
    setSheet(null);
    if (demoMode) { setRoomData({ ...roomData, activeMembers: updatedMembers }); return; }
    await rDoc(roomId).update({ activeMembers: updatedMembers });
  };
  const kickUser = async (uid) => {
    if (!roomData) return;
    setSheet(null);
    if (demoMode) {
      const target = roomData.activeMembers.find((m) => m.uid === uid);
      setRoomData({ ...roomData, activeMembers: roomData.activeMembers.filter((m) => m.uid !== uid), kicked: { ...(roomData.kicked || {}), [uid]: Date.now() } });
      if (target) pushSystemLocal(`${target.name} was kicked.`);
      return;
    }
    await rDoc(roomId).update({ [`kicked.${uid}`]: Date.now() });
    const doc = await rDoc(roomId).get();
    await rDoc(roomId).update({ activeMembers: (doc.data()?.activeMembers || []).filter((u) => u.uid !== uid) });
  };
  const blockUser = async (uid) => {
    if (!roomData) return;
    setSheet(null);
    if (demoMode) { setRoomData({ ...roomData, activeMembers: roomData.activeMembers.filter((m) => m.uid !== uid), blocked: [...(roomData.blocked || []), uid] }); notify('User blocked.'); return; }
    await rDoc(roomId).update({ blocked: FV.arrayUnion(uid) });
    await kickUser(uid); notify('User blocked.');
  };
  const toggleMute = async (uid) => {
    if (!roomData) return;
    const isCurrentlyMuted = roomData.mutedUsers?.includes(uid);
    setSheet(null);
    if (demoMode) { setRoomData({ ...roomData, mutedUsers: isCurrentlyMuted ? (roomData.mutedUsers || []).filter((id) => id !== uid) : [...(roomData.mutedUsers || []), uid] }); notify(isCurrentlyMuted ? 'Unmuted.' : 'Muted.'); return; }
    await rDoc(roomId).update({ mutedUsers: isCurrentlyMuted ? FV.arrayRemove(uid) : FV.arrayUnion(uid) });
    notify(isCurrentlyMuted ? 'Unmuted.' : 'Muted.');
  };
  const handlePressStart = (name) => { longPressTimer.current = setTimeout(() => setInputText((prev) => `${prev}@${name} `), 600); };
  const handlePressEnd = () => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } };
  const handleMicClick = () => { if (!isSeated) { notify('Take a mic seat first!'); return; } setIsMuted((m) => !m); };

  const sendMsg = async (customText) => {
    const payload = String(customText ?? inputTextRef.current ?? '').trim();
    if (!payload || sending) return;
    if (!customText) setInputText('');
    const displayName = userProfile.displayName || 'User';
    if (demoMode) { setMessages((prev) => [...prev, { id: `msg-${Date.now()}-${Math.random()}`, text: payload, senderId: user.uid, senderName: displayName, createdAt: Date.now() }]); return; }
    setSending(true);
    try {
      await rDoc(roomId).collection('messages').add({ text: payload, senderId: user.uid, senderName: displayName, createdAt: FV.serverTimestamp() });
    } catch (err) {
      console.error('sendMsg error:', err);
      notify(`Send failed: ${errMsg(err)}`);
      if (!customText) setInputText(payload);
    } finally { setSending(false); }
  };

  const openGiftSheet = (target) => {
    if (target) setGiftTargetUser(target);
    else if (!giftTargetUser && roomData?.activeMembers?.length) setGiftTargetUser(roomData.activeMembers.find((m) => m.uid !== user.uid) || roomData.activeMembers[0]);
    setSheet('gift');
  };

  const sendGift = async (giftToSend) => {
    const gift = giftToSend || selectedGift;
    const target = giftTargetUser || roomData?.activeMembers?.find((m) => m.uid !== user.uid) || roomData?.activeMembers?.[0] || null;
    if (!gift) return notify('Select a gift!');
    if (!target) return notify('Select a user!');
    if (sendingGift) return;
    if (!isAdmin && liveCoins < gift.p) return notify('Not enough coins.');
    setSendingGift(true);
    try {
      const isSelfGift = target.uid === user.uid;
      const { charmsEarned, coinsEarned } = calculateGiftRewards(gift.p);
      const giftRecord = { giftId: gift.id || 'custom', giftName: gift.n, giftIcon: gift.i, giftType: gift.type || 'emoji' };
      const senderName = userProfile.displayName || 'Someone';
      const receiverName = target.name || 'User';

      if (demoMode) {
        if (!isAdmin) { const nextCoins = Math.max(0, liveCoins - gift.p); setLiveCoins(nextCoins); onUpdateLocalCoins?.(nextCoins); }
        onDemoGiftReceived?.(target.uid, { id: `dg-${Date.now()}`, ...giftRecord, count: 1, charms: charmsEarned, senderUid: user.uid, senderName, senderImg: userProfile.photoURL || '', createdAt: Date.now() });
        setGiftAnim(gift);
        playGiftSound(gift.sound);
        pushGiftNotif({ giftName: gift.n, giftIcon: gift.i, giftType: gift.type || 'emoji', senderName, receiverName, charms: charmsEarned, coins: coinsEarned });
        if (giftAnimTimerRef.current) clearTimeout(giftAnimTimerRef.current);
        giftAnimTimerRef.current = setTimeout(() => setGiftAnim(null), 3500);
      } else {
        const targetRef = uDoc(target.uid);
        if (!isAdmin) await uDoc(user.uid).update({ coins: FV.increment(-gift.p) });
        await targetRef.collection('receivedGifts').add({ ...giftRecord, count: 1, charms: charmsEarned, senderUid: user.uid, senderName, senderImg: userProfile.photoURL || '', createdAt: FV.serverTimestamp() });
        await targetRef.update({ charms: FV.increment(charmsEarned), coins: FV.increment(coinsEarned) });
        const animId = Date.now();
        await rDoc(roomId).update({
          latestGift: {
            animId, n: gift.n, i: gift.i, type: gift.type || 'emoji',
            giftName: gift.n, giftIcon: gift.i, giftType: gift.type || 'emoji',
            anim: gift.anim || 'float', sound: gift.sound || '',
            senderName, receiverName,
            charms: charmsEarned, coins: coinsEarned,
            senderUid: user.uid, receiverUid: target.uid,
          }
        });
      }
      await pushSystemLocal(`${senderName} sent ${gift.n} to ${isSelfGift ? 'themselves' : receiverName}. +${charmsEarned}✨ +${coinsEarned}🪙`);
      setSheet(null);
      setSelectedGift(null);
    } catch (error) {
      console.error('sendGift error:', error);
      notify(`Gift failed: ${errMsg(error)}`);
    } finally { setSendingGift(false); }
  };

  if (!roomData) return <div className="room flex items-center justify-center text-white font-bold">Joining Room...</div>;

  const renderSeat = (index, label) => {
    const seatedUser = seatedUsers[index];
    const isMine = Boolean(seatedUser && seatedUser.uid === user.uid);
    const isMutedInRoom = Boolean(seatedUser && roomData.mutedUsers?.includes(seatedUser.uid));
    const isOwnerSeat = Boolean(seatedUser && seatedUser.uid === roomData.ownerId);
    const isLive = Boolean(seatedUser && ((isMine && !isMuted && !isMutedInRoom) || (!isMine && !isMutedInRoom)));
    return <MicSeat key={index} seatIndex={index} label={label} seatedUser={seatedUser} isMine={isMine} isOwnerSeat={isOwnerSeat} isLive={isLive} isMutedInRoom={isMutedInRoom} onTake={() => handleSeatClick(index, seatedUser)} onLongPressStart={() => seatedUser && handlePressStart(seatedUser.name)} onLongPressEnd={handlePressEnd} />;
  };
  const joinFirstEmptySeat = () => { const emptyIdx = seatedUsers.findIndex((s) => s === null); if (emptyIdx === -1) { notify('All mic seats occupied.'); return; } handleSeatClick(emptyIdx, null); };

  return (
    <main className="room" data-testid="voice-room">
      <header className="topbar">
        <Btn className="icon-btn" onClick={() => onMinimize({ title: roomData.title })}><ChevronIcon /></Btn>
        <div className="brand"><p className="room-title">{roomData.title}</p><span className="text-[11px] font-bold text-[#f5c542] whitespace-nowrap shrink-0">ID {roomData.roomCode}</span></div>
        <div className="tools"><Btn className="count-pill" onClick={() => setSheet(sheet === 'members' ? null : 'members')}><span>👤</span><span>{roomData.activeMembers?.length || 1}</span></Btn></div>
      </header>
      {toast && <div className="mx-3 mb-1 px-3 py-2 rounded-xl bg-[#2a2a32] border border-white/15 text-xs font-bold text-white text-center z-40">{toast}</div>}

      {/* GIFT NOTIFICATION CARDS — LEFT SIDE */}
      <div className="fixed left-2 top-20 z-[9997] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: '230px' }}>
        {giftNotifications.map((n) => (
          <div key={n.id} className="gift-notification-card">
            <div className="gift-notification-icon">
              {n.giftType === 'image' ? <img src={n.giftIcon} alt={n.giftName} className="w-7 h-7 object-contain" /> : n.giftType === 'video' ? <video src={n.giftIcon} className="w-7 h-7 object-contain" autoPlay loop muted playsInline /> : <span className="text-2xl">{n.giftIcon}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-extrabold text-white truncate leading-tight">{n.giftName}</p>
              <p className="text-[9px] text-slate-300 truncate leading-tight">{n.senderName} → {n.receiverName}</p>
              <p className="text-[10px] font-bold leading-tight mt-0.5">
                <span className="text-amber-400">+{n.charms}✨</span>
                <span className="text-yellow-400 ml-1">+{n.coins}🪙</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="stage">
        <div className="board">
          <div className="seat-row">{renderSeat(0, 'Host Seat')}<PulseWave />{renderSeat(1, 'Co-Host Seat')}</div>
          <div className="seat-row"><div className="seat-pair">{renderSeat(2, 'Seat 3')}<PulseWave />{renderSeat(3, 'Seat 4')}</div><div className="seat-pair">{renderSeat(4, 'Seat 5')}<PulseWave />{renderSeat(5, 'Seat 6')}</div></div>
          <div className="seat-row"><div className="seat-pair">{renderSeat(6, 'Seat 7')}<PulseWave />{renderSeat(7, 'Seat 8')}</div><div className="seat-pair">{renderSeat(8, 'Seat 9')}<PulseWave />{renderSeat(9, 'Seat 10')}</div></div>
        </div>
        <div className="chat no-scrollbar">
          <div className="mt-auto" />
          <p className="line-system"><span>📢 <span className="font-extrabold text-[#f5c542]">Announcement: </span>{announcementText}</span></p>
          {roomData.currentSong && <p className="line-system"><span>🎵 <span className="font-extrabold text-[#7ee7ff]">Now Playing: </span>{roomData.currentSong}</span></p>}
          {visibleMessages.map((msg) => msg.isSystem ? (
            <p className="line-system" key={msg.id}><span>📢 <span className="font-extrabold">System: </span>{msg.text}</span></p>
          ) : (
            <p className="line-chat" key={msg.id}><span className="text-[#ff4d9a] mr-1.5">{msg.senderName}:</span>{msg.text}</p>
          ))}
          <div ref={chatEndRef} />
        </div>
        {sheet && (
          <div className="sheet-backdrop" onClick={() => setSheet(null)}>
            {sheet === 'gift' && (
              <section className="sheet" onClick={(e) => e.stopPropagation()}>
                <div className="grabber" />
                <div className="flex justify-between items-center mb-2.5">
                  <h2 className="sheet-title m-0">Gifts</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[#f5c542] font-extrabold text-sm flex items-center gap-1 tabular-nums"><CoinIcon />{isAdmin ? '∞' : liveCoins}</span>
                    <CloseX onClick={() => setSheet(null)} />
                  </div>
                </div>
                <div className="flex overflow-x-auto gap-3 mb-3 no-scrollbar p-2 bg-white/5 rounded-xl">
                  {roomData.activeMembers?.map((m) => (
                    <Btn key={m.uid} onClick={() => setGiftTargetUser(m)} className="flex flex-col items-center min-w-[52px] shrink-0">
                      <div className={`rounded-full p-0.5 border-2 ${giftTargetUser?.uid === m.uid ? 'border-[#ff4d9a]' : 'border-transparent'}`}><UserAvatar src={m.img} name={m.name} className="w-9 h-9 rounded-full" /></div>
                      <span className="text-[10px] text-[#f7f8ff] font-bold mt-1 truncate w-12 text-center">{m.uid === user.uid ? 'You' : m.name}</span>
                    </Btn>
                  ))}
                </div>
                <div className="gift-grid">
                  {availableGifts.map((gift, idx) => (
                    <Btn className={`gift-cell ${selectedGift?.n === gift.n ? 'is-selected' : ''}`} key={gift.id || `${gift.n}-${idx}`} onClick={() => setSelectedGift(gift)}>
                      <span className="text-2xl h-8 flex items-center justify-center">{gift.type === 'image' ? <img src={gift.i} alt={gift.n} className="w-7 h-7 object-contain" /> : gift.type === 'video' ? <video src={gift.i} className="w-7 h-7 object-contain" /> : gift.i}</span>
                      <span className="gift-name">{gift.n}</span>
                      <span className="gift-price"><CoinIcon small />{gift.p}</span>
                    </Btn>
                  ))}
                </div>
                <Btn disabled={!selectedGift || sendingGift} onClick={() => selectedGift && sendGift(selectedGift)} className="w-full mt-3 bg-[#ff4d9a] disabled:bg-[#2a2a32] disabled:text-slate-400 text-white py-3 rounded-xl font-extrabold text-sm min-h-[44px]">
                  {sendingGift ? 'Sending...' : selectedGift ? `Send ${selectedGift.n} to ${giftTargetUser?.uid === user.uid ? 'Yourself' : giftTargetUser?.name || 'Member'}` : 'Select a Gift'}
                </Btn>
              </section>
            )}
            {sheet === 'profile' && selectedUser && (
              <section className="sheet" onClick={(e) => e.stopPropagation()}>
                <div className="grabber" />
                <div className="flex justify-between items-center mb-2"><h2 className="sheet-title m-0">{selectedUser.uid === user.uid ? 'Your Seat' : `${selectedUser.name}'s Profile`}</h2><CloseX onClick={() => setSheet(null)} /></div>
                <div className="flex flex-col items-center gap-2 pb-2">
                  <UserAvatar src={selectedUser.img} name={selectedUser.name} className="w-[70px] h-[70px] rounded-full border-2 border-[#7ee7ff]" />
                  <p className="font-extrabold text-base text-[#f7f8ff]">{selectedUser.name}{selectedUser.uid === roomData.ownerId && <span className="ml-1.5 text-xs text-[#f5c542]">👑 Host</span>}</p>
                  {selectedUser.uid !== user.uid ? (
                    <div className="w-full flex flex-col gap-2 mt-2">
                      <div className="flex gap-2 w-full">
                        <Btn className="flex-1 bg-[#2a2a32] py-2.5 rounded-lg text-white font-bold text-sm" onClick={() => { setSheet(null); onViewProfile(selectedUser); }}>View Profile</Btn>
                        <Btn className="flex-1 bg-[#ff4d9a] py-2.5 rounded-lg text-white font-bold text-sm" onClick={() => openGiftSheet(selectedUser)}>Gift</Btn>
                      </div>
                      {!demoMode && !userProfile.friends?.includes(selectedUser.uid) && (
                        <Btn className="w-full bg-blue-600 py-2.5 rounded-lg text-white font-bold text-sm" onClick={async () => {
                          await uDoc(user.uid).update({ sentRequests: FV.arrayUnion(selectedUser.uid) });
                          await uDoc(selectedUser.uid).update({ requests: FV.arrayUnion(user.uid) });
                          notify('Friend Request Sent!'); setSheet(null);
                        }}>Add Friend</Btn>
                      )}
                      {(isOwner || isAdmin) && (
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <Btn className="bg-amber-600 py-2 rounded-lg text-white font-bold text-xs" onClick={() => toggleMute(selectedUser.uid)}>{roomData.mutedUsers?.includes(selectedUser.uid) ? 'Unmute' : 'Mute'}</Btn>
                          <Btn className="bg-orange-600 py-2 rounded-lg text-white font-bold text-xs" onClick={() => kickUser(selectedUser.uid)}>Kick</Btn>
                          <Btn className="bg-[#ff2a45] py-2 rounded-lg text-white font-bold text-xs" onClick={() => blockUser(selectedUser.uid)}>Block</Btn>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full flex flex-col gap-2 mt-2">
                      {isSeated && selectedUser.uid !== roomData.ownerId && <Btn className="w-full bg-amber-600 py-2.5 rounded-lg text-white font-bold text-sm" onClick={() => liftUpSeat(user.uid)}>Lift Up (Leave Mic)</Btn>}
                      <Btn className="w-full bg-[#2a2a32] py-2.5 rounded-lg text-white font-bold text-sm" onClick={() => { setSheet(null); onViewProfile(selectedUser); }}>View Profile</Btn>
                    </div>
                  )}
                </div>
              </section>
            )}
            {sheet === 'more' && (
              <section className="sheet" onClick={(e) => e.stopPropagation()}>
                <div className="grabber" /><h2 className="sheet-title">More</h2>
                <div className="flex flex-col">
                  <Btn className="py-3.5 border-b border-[#2a2a32] text-left text-white font-bold text-sm" onClick={() => { if (isSeated) liftUpSeat(user.uid); else { setSheet(null); joinFirstEmptySeat(); } }}>{isSeated ? 'Leave mic' : 'Join mic'}</Btn>
                  <Btn className="py-3.5 border-b border-[#2a2a32] text-left text-white font-bold text-sm" onClick={() => { setSheet(null); setShowDailyTask(true); }}>Daily Task</Btn>
                  <Btn className="py-3.5 border-b border-[#2a2a32] text-left text-white font-bold text-sm" onClick={() => { setAnnouncementDraft(announcementText); setSheet('announcement'); }}>Room Announcement</Btn>
                  <Btn className="py-3.5 border-b border-[#2a2a32] text-left text-white font-bold text-sm" onClick={() => setSheet('song')}>Play Music</Btn>
                  <Btn className="py-3.5 border-b border-[#2a2a32] text-left text-white font-bold text-sm" onClick={() => { pushSystemLocal('Report sent.'); setSheet(null); }}>Report</Btn>
                  <Btn className="py-3.5 text-left text-[#ff2a45] font-bold text-sm" onClick={() => { setSheet(null); onLeave(); }}>Exit Room</Btn>
                </div>
              </section>
            )}
            {sheet === 'members' && (
              <section className="sheet" onClick={(e) => e.stopPropagation()}>
                <div className="grabber" />
                <div className="flex justify-between items-center mb-3"><h2 className="sheet-title m-0">Members ({roomData.activeMembers?.length || 0})</h2><CloseX onClick={() => setSheet(null)} /></div>
                <div className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto no-scrollbar">
                  {roomData.activeMembers?.map((m) => (
                    <div key={m.uid} className="flex items-center justify-between py-1">
                      <Btn onClick={() => { setSelectedUser(m); setSheet('profile'); }} className="flex items-center gap-2.5 text-left">
                        <UserAvatar src={m.img} name={m.name} className="w-9 h-9 rounded-full" />
                        <span className="text-sm font-bold text-white">{m.uid === user.uid ? 'You' : m.name}</span>
                        {m.uid === roomData.ownerId && <span className="text-xs text-[#f5c542]">👑</span>}
                      </Btn>
                      {(isOwner || isAdmin) && m.uid !== user.uid && (
                        <div className="flex items-center gap-1.5">
                          <Btn onClick={() => toggleMute(m.uid)} className="px-2.5 py-1 rounded-lg bg-[#2a2a32] text-xs font-bold text-white">{roomData.mutedUsers?.includes(m.uid) ? 'Unmute' : 'Mute'}</Btn>
                          <Btn onClick={() => kickUser(m.uid)} className="px-2.5 py-1 rounded-lg bg-[#ff2a45]/80 text-xs font-bold text-white">Kick</Btn>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {sheet === 'emoji' && (
              <section className="sheet" onClick={(e) => e.stopPropagation()}>
                <div className="grabber" /><h2 className="sheet-title">Quick Reactions</h2>
                <div className="grid grid-cols-3 gap-2">{QUICK_REACTIONS.map((reaction) => (<Btn key={reaction} onClick={() => { sendMsg(reaction); setSheet(null); }} className="py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white">{reaction}</Btn>))}</div>
              </section>
            )}
            {sheet === 'announcement' && (
              <section className="sheet" onClick={(e) => e.stopPropagation()}>
                <div className="grabber" /><h2 className="sheet-title">Edit Announcement</h2>
                <textarea className={C_SH_BLK} rows={3} maxLength={300} value={announcementDraft} onChange={(e) => setAnnouncementDraft(e.target.value)} />
                <div className="flex gap-2"><Btn onClick={() => setSheet(null)} className={C_BTN_D}>Cancel</Btn><Btn onClick={async () => { const next = announcementDraft.trim() || 'Welcome to the voice room.'; setAnnouncementText(next); setSheet(null); if (!demoMode) await rDoc(roomId).update({ announcement: next }); notify('Announcement updated!'); }} className={C_BTN_P}>Save</Btn></div>
              </section>
            )}
            {sheet === 'song' && (
              <section className="sheet" onClick={(e) => e.stopPropagation()}>
                <div className="grabber" /><h2 className="sheet-title">Play Song</h2>
                <input type="text" placeholder="Enter song name..." className={C_SH_BLK} value={newSongTitle} onChange={(e) => setNewSongTitle(e.target.value)} />
                <div className="flex gap-2"><Btn onClick={() => setSheet(null)} className={C_BTN_D}>Cancel</Btn><Btn onClick={async () => { if (!newSongTitle.trim()) return; const song = newSongTitle.trim(); setNewSongTitle(''); setSheet(null); if (demoMode) { setRoomData({ ...roomData, currentSong: song }); return; } await rDoc(roomId).update({ currentSong: song }); }} className={C_BTN_P}>Play</Btn></div>
              </section>
            )}
          </div>
        )}
      </div>
      <form className="dock" onSubmit={(e) => { e.preventDefault(); sendMsg(); }}>
        <Btn className="dock-btn" onClick={() => { setIsSpeakerMuted((prev) => !prev); notify(isSpeakerMuted ? 'Speaker enabled' : 'Speaker muted'); }}><SpeakerIcon muted={isSpeakerMuted} /></Btn>
        <Btn className="dock-btn" onClick={handleMicClick}><MicIcon muted={isMuted || !isSeated} /></Btn>
        <input className="dock-input" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={sending ? 'Sending...' : 'Type...'} disabled={sending} />
        <Btn className="dock-btn" onClick={() => setSheet(sheet === 'emoji' ? null : 'emoji')}><SmileIcon /></Btn>
        <Btn className="dock-btn" onClick={() => (sheet === 'gift' ? setSheet(null) : openGiftSheet())}><GiftIcon /></Btn>
        <Btn className="dock-btn" onClick={() => setSheet(sheet === 'more' ? null : 'more')}><MoreIcon /></Btn>
      </form>
      {showDailyTask && (<DailyTaskModal onClose={() => setShowDailyTask(false)} onClaimCoins={async (amount) => { if (demoMode) { const next = liveCoins + amount; setLiveCoins(next); onUpdateLocalCoins?.(next); return; } await uDoc(user.uid).update({ coins: FV.increment(amount) }); }} />)}
      {giftAnim && (
        <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
          <div className={`gift-anim-${giftAnim.anim || 'float'} flex items-center justify-center gift-anim-media`}>
            {(() => {
              const type = giftAnim.type || giftAnim.giftType || 'emoji';
              const src = giftAnim.i || giftAnim.giftIcon;
              if (type === 'image') return <img src={src} alt="" />;
              if (type === 'video') return <video src={src} autoPlay loop muted playsInline />;
              return <span>{src}</span>;
            })()}
          </div>
        </div>
      )}
    </main>
  );
};

const Row = ({ icon, label, value, onClick }) => (
  <Btn onClick={onClick} className="w-full flex items-center justify-between p-4 border-b border-gray-800/50 last:border-none hover:bg-white/5 text-left min-h-[56px]">
    <div className="flex items-center gap-3 min-w-0"><span className="text-lg text-gray-400 w-6 text-center shrink-0">{icon}</span><span className="text-[15px] text-gray-200 whitespace-nowrap">{label}</span></div>
    <div className="flex items-center gap-2 min-w-0 ml-2">{typeof value === 'string' ? <span className="text-sm text-gray-400 truncate max-w-[170px]">{value}</span> : value}<span className="text-gray-600 text-lg shrink-0">›</span></div>
  </Btn>
);
const MenuItem = ({ icon, title, onClick }) => (
  <Btn onClick={onClick} className="w-full flex items-center justify-between p-4 border-b border-gray-800 last:border-none hover:bg-white/5 text-left min-h-[54px]">
    <div className="flex items-center gap-4"><span className="text-xl text-gray-400">{icon}</span><span className="text-[15px] text-gray-200">{title}</span></div><span className="text-gray-600 text-lg">›</span>
  </Btn>
);
const QuickIcon = ({ icon, label, onClick }) => (
  <Btn onClick={onClick} className="flex flex-col items-center gap-1 min-w-[64px] min-h-[52px] justify-center active:scale-95">
    <div className="text-3xl drop-shadow-md">{icon}</div><span className="text-[11px] font-semibold text-gray-300 whitespace-nowrap">{label}</span>
  </Btn>
);

const ProfileTab = ({ user, userProfile, setUserProfile, setView, onNotice, demoMode }) => {
  const [subView, setSubView] = useState('me');
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null);
  const [tempInput, setTempInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cropTarget, setCropTarget] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const dpInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const isSuperAdmin = isOfficialDisplayId(userProfile?.displayId);
  const gender = userProfile?.gender || 'Male';
  const country = userProfile?.country || COUNTRIES[0];
  const priceTag = userProfile?.priceTag || PRICE_TAGS[0];
  const isVisitorUnlocked = isVisitorPassActive(userProfile?.visitorExpiry);
  const activeTitles = getActiveTitles(userProfile?.titles);
  const showComingSoon = (label) => onNotice(`🚧 ${label} Coming Soon!`);

  useEffect(() => {
    if (!user || demoMode) return;
    const unsub = db.collection('profileViews').where('visitedUid', '==', user.uid).limit(100).onSnapshot((snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (toTimestampMillis(b.timestamp) || 0) - (toTimestampMillis(a.timestamp) || 0));
      const seen = new Set();
      const unique = list.filter((v) => { if (!v.visitorUid || seen.has(v.visitorUid)) return false; seen.add(v.visitorUid); return true; });
      setVisitors(unique.slice(0, 20));
    }, (err) => { console.warn('profileViews query:', err); });
    return () => unsub();
  }, [user, demoMode]);

  const persistProfilePatch = async (patch, successNotice) => {
    setSaving(true);
    try { if (!demoMode) await uDoc(user.uid).update(patch); setUserProfile({ ...userProfile, ...patch }); if (successNotice) onNotice(successNotice); }
    catch (err) { onNotice(`Save failed: ${errMsg(err)}`); }
    finally { setSaving(false); }
  };
  const handleLogout = async () => {
    if (!demoMode) { await uDoc(user.uid).update({ isOnline: false, lastSeen: Date.now() }).catch(() => {}); await auth.signOut(); }
    setShowSettingsModal(false); setView('login');
  };
  const handleDpPick = (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) setCropTarget({ file: f, type: 'dp' }); };
  const handleBannerPick = (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) setCropTarget({ file: f, type: 'banner' }); };
  const handleCropDone = async (base64) => {
    const type = cropTarget?.type; setCropTarget(null);
    if (!type) return;
    try {
      if (type === 'dp') { setUploading(true); if (!demoMode) await uDoc(user.uid).update({ photoURL: base64 }); setUserProfile({ ...userProfile, photoURL: base64 }); setUploading(false); onNotice('Avatar updated!'); }
      else { setBannerUploading(true); if (!demoMode) await uDoc(user.uid).update({ bannerURL: base64 }); setUserProfile({ ...userProfile, bannerURL: base64 }); setBannerUploading(false); onNotice('Banner updated!'); }
    } catch (err) { onNotice(`Save failed: ${errMsg(err)}`); setUploading(false); setBannerUploading(false); }
  };
  const handleVisitorClick = () => { if (isVisitorUnlocked) setShowVisitorModal(true); else setShowPlansModal(true); };
  const buyVisitorPass = async (days, price) => {
    const result = purchaseVisitorPass({ coins: userProfile.coins || 0, isSuperAdmin, days, price });
    if (!result.ok) { onNotice(result.error || 'Not enough coins!'); return; }
    try {
      if (!demoMode) {
        const updatePayload = { visitorExpiry: result.visitorExpiry };
        if (!isSuperAdmin) updatePayload.coins = FV.increment(-price);
        await uDoc(user.uid).update(updatePayload);
      }
      setUserProfile({ ...userProfile, coins: result.nextCoins, visitorExpiry: result.visitorExpiry });
      setShowPlansModal(false); setShowVisitorModal(true); onNotice(`Visitor Pass unlocked for ${days} days!`);
    } catch (err) { onNotice(`Purchase failed: ${errMsg(err)}`); }
  };
  const handleBirthday = () => {
    if (!userProfile?.birthday) { setTempInput(''); setActiveSheet('birthday'); }
    else onNotice('Birthday cannot be changed once set.');
  };
  const saveSheetValue = async (field) => {
    const cleaned = tempInput.trim();
    if (field === 'nickname' && !cleaned) { onNotice('Nickname cannot be empty.'); return; }
    if (field === 'nickname') await persistProfilePatch({ displayName: cleaned }, 'Nickname updated!');
    else await persistProfilePatch({ bio: cleaned }, 'Signature updated!');
    setActiveSheet(null); setTempInput('');
  };
  const toggleTitleActive = async (titleId) => {
    const newTitles = (userProfile.titles || []).map((t) => (t.id === titleId ? { ...t, active: !t.active } : t));
    await persistProfilePatch({ titles: newTitles }, 'Title visibility updated');
  };
  const recentCount = visitors.filter((v) => Date.now() - (toTimestampMillis(v.timestamp) || 0) < 86400000).length;
  const totalCount = visitors.length;

  return (
    <div className="w-full h-full bg-[#0b1120] text-white flex flex-col relative overflow-hidden">
      <input type="file" accept="image/*" ref={bannerInputRef} className="hidden" onChange={handleBannerPick} />
      <input type="file" accept="image/*" ref={dpInputRef} className="hidden" onChange={handleDpPick} />
      {subView === 'me' && (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
          <div className="relative h-64 shrink-0">
            <div className="absolute inset-0 opacity-35 blur-sm overflow-hidden"><BannerCover src={userProfile.bannerURL} /></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#0b1120]/50 to-[#0b1120]" />
            <Btn onClick={handleLogout} className="absolute top-3 right-3 z-20 bg-black/50 hover:bg-red-600/80 text-white text-xs font-bold px-3.5 py-2 rounded-full border border-white/15 min-h-[36px]">Logout</Btn>
            <Btn onClick={() => setSubView('edit')} className="absolute top-11 left-5 right-4 flex items-center gap-4 text-left z-10">
              <div className="w-20 h-20 rounded-2xl border-2 border-gray-600 shadow-lg overflow-hidden bg-gray-800 card-shadow shrink-0"><UserAvatar src={userProfile.photoURL} name={userProfile.displayName} className="w-full h-full object-cover" /></div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-extrabold text-white flex items-center gap-1.5 flex-wrap leading-tight"><span className="truncate max-w-[165px]">{userProfile.displayName}</span><span className="text-xl">{getGenderEmoji(gender)}</span>{isSuperAdmin && <span className="star-official-badge text-[10px] px-2 py-0.5 rounded">⭐ Official</span>}</h1>
                <div className="flex items-center gap-2 mt-1.5"><span className="text-xs font-bold text-gray-300 tabular-nums">Lv.{userProfile.level || 1}</span><div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-orange-500 w-1/3" /></div><span className="text-[11px] font-bold text-yellow-400 tabular-nums">{isSuperAdmin ? '∞' : userProfile.coins || 0} 🪙</span></div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-300"><span>{country.flag} {country.name}</span>{!isSuperAdmin && <span className="text-amber-300 flex items-center gap-1 tabular-nums">· <CharmIcon charms={userProfile.charms} size="text-xs" /> {userProfile.charms || 0}</span>}</div>
                {activeTitles.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{activeTitles.map((t) => <TitleBadge key={t.id} title={t} />)}</div>}
              </div>
              <span className="text-gray-400 text-2xl font-bold pr-1 shrink-0">›</span>
            </Btn>
            <div className="absolute bottom-3 left-0 right-0 flex justify-around px-2 z-10">
              <QuickIcon icon="💎" label="VIP Center" onClick={() => showComingSoon('VIP Center')} />
              <QuickIcon icon="🛍️" label="Shop" onClick={() => showComingSoon('Shop')} />
              <QuickIcon icon="📺" label="PLAY Show" onClick={() => showComingSoon('PLAY Show')} />
              <QuickIcon icon="🏠" label="My Home" onClick={() => showComingSoon('My Home')} />
            </div>
          </div>
          <div className={`mt-2 mx-3 ${C_CARD_ME}`}>
            <MenuItem icon="📸" title="Moments" onClick={() => showComingSoon('Moments')} />
            <MenuItem icon="📊" title="Stats" onClick={() => showComingSoon('Stats')} />
            <Btn onClick={handleVisitorClick} className={C_ROW_B}>
              <div className="flex items-center gap-4"><span className="text-xl text-gray-400">👁️</span><span className="text-[15px] text-gray-200">Visitors</span></div>
              <div className="flex items-center gap-2">{isVisitorUnlocked ? <span className="text-sm text-green-400 font-semibold">Recent ({recentCount})</span> : <span className="text-sm text-orange-400 font-semibold animate-pulse">Total ({totalCount})</span>}<span className="text-gray-600 text-lg">›</span></div>
            </Btn>
            <MenuItem icon="👤" title="Invite Friends" onClick={() => showComingSoon('Invite Friends')} />
            <MenuItem icon="⭐" title="Badge" onClick={() => showComingSoon('Badge')} />
            <MenuItem icon="📝" title="Contributions" onClick={() => showComingSoon('Contributions')} />
          </div>
          <div className={`mx-3 mt-3 ${C_CARD_ME}`}>
            <Btn onClick={() => showComingSoon('Language')} className={C_ROW_B}><div className="flex items-center gap-4"><span className="text-xl text-gray-400">🌐</span><span className="text-[15px] text-gray-200">Language</span></div><div className="flex items-center gap-2"><span className="text-sm text-gray-400">English</span><span className="text-gray-600 text-lg">›</span></div></Btn>
            <MenuItem icon="🛡️" title="Parental control mode" onClick={() => showComingSoon('Parental Control')} />
            <MenuItem icon="❓" title="Help Center" onClick={() => showComingSoon('Help Center')} />
            <MenuItem icon="🔒" title="Security Center" onClick={() => showComingSoon('Security Center')} />
          </div>
          <div className={`mx-3 mt-3 ${C_CARD_ME}`}><MenuItem icon="⚙️" title="Settings" onClick={() => setShowSettingsModal(true)} /></div>
        </div>
      )}
      {subView === 'edit' && (
        <div className="fixed inset-0 max-w-[430px] mx-auto bg-[#0b1120] z-[200] flex flex-col">
          <div className="flex items-center p-3 border-b border-gray-800 bg-[#0b1120]/90 z-10 shrink-0 sticky top-0">
            <Btn onClick={() => setSubView('me')} className="text-3xl font-light text-gray-400 px-3 min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-white">‹</Btn>
            <h1 className="text-xl font-bold ml-1 text-white">Edit Profile</h1>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar pb-10 pt-4 px-3 space-y-4">
            <div onClick={() => bannerInputRef.current?.click()} className="relative w-full h-32 rounded-2xl overflow-hidden border border-gray-800 card-shadow cursor-pointer group">
              <BannerCover src={userProfile.bannerURL} />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white text-xs font-bold bg-black/60 px-4 py-2 rounded-full border border-white/20">{bannerUploading ? 'Uploading...' : 'Change Banner'}</span></div>
            </div>
            <div className={C_CARD_ME}>
              <Row icon="🖼️" label="Avatar" value={<div className="flex items-center gap-2">{uploading && <span className="text-xs text-pink-400 animate-pulse">Uploading...</span>}<UserAvatar src={userProfile.photoURL} name={userProfile.displayName} className="w-10 h-10 rounded-full border border-gray-600 object-cover" /></div>} onClick={() => dpInputRef.current?.click()} />
              <Row icon="👤" label="Nickname" value={userProfile.displayName} onClick={() => { setTempInput(userProfile.displayName || ''); setActiveSheet('nickname'); }} />
              <Row icon="#️⃣" label="User ID" value={userProfile.displayId} onClick={() => { navigator.clipboard?.writeText(userProfile.displayId); onNotice('UID Copied!'); }} />
              <Row icon="🔲" label="QR Code Contact Card" value="" onClick={() => showComingSoon('QR Code')} />
            </div>
            <div className={C_CARD_ME}>
              <Row icon="⚧" label="Gender" value={`${getGenderEmoji(gender)} ${gender}`} onClick={() => setActiveSheet('gender')} />
              <Row icon="🎂" label="Birthday" value={userProfile.birthday || 'Not Set'} onClick={handleBirthday} />
              <Row icon="🌍" label="Region" value={`${country.flag} ${country.name}`} onClick={() => setActiveSheet('country')} />
              <Row icon="✍️" label="Signature" value={userProfile.bio || 'Write something...'} onClick={() => { setTempInput(userProfile.bio || ''); setActiveSheet('signature'); }} />
            </div>
            <div className={C_CARD_ME}>
              <Row icon="🏷️" label="Price Tag" value={priceTag.id === 'none' ? 'None' : `${priceTag.icon} ${priceTag.name} (${priceTag.price} Coins)`} onClick={() => setActiveSheet('price')} />
              <Row icon="🎖️" label="Badge" value="Coming Soon" onClick={() => showComingSoon('Badges')} />
              <Row icon="⭐" label="Level" value={`Lv.${userProfile.level || 1}`} onClick={() => onNotice('Level based on activity.')} />
            </div>
            <div className={C_CARD_ME}>
              <div className="p-4">
                <h3 className="text-sm font-bold text-white mb-1">👑 My Titles</h3>
                <p className="text-[11px] text-gray-500 mb-3">Titles are given by Official accounts only.</p>
                {(() => {
                  const myTitles = (userProfile.titles || []).filter((t) => !isTitleExpired(t));
                  if (myTitles.length === 0) return <p className="text-xs text-gray-500 py-2">No titles yet.</p>;
                  return (
                    <div className="flex flex-col gap-2">
                      {myTitles.map((t) => (
                        <div key={t.id} className="flex items-center justify-between gap-2 bg-black/30 p-2 rounded-lg">
                          <div className="flex items-center gap-1.5 flex-wrap min-w-0"><TitleBadge title={t} size="md" />{t.expiresAt && <span className="text-[10px] text-gray-500">{new Date(t.expiresAt).toLocaleDateString()}</span>}</div>
                          <Btn onClick={() => toggleTitleActive(t.id)} className={`px-2.5 py-1 rounded text-xs font-bold shrink-0 ${t.active !== false ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{t.active !== false ? 'ON' : 'OFF'}</Btn>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
      {showPlansModal && (
        <SheetModal onClose={() => setShowPlansModal(false)} extraCls="p-6 pb-10 border-pink-500/30">
          <Grabber cls="mb-6" /><h2 className="text-2xl font-extrabold text-center text-white mb-1">Visitor Book</h2>
          <p className="text-center text-gray-400 text-sm mb-6">Unlock to see who viewed your profile</p>
          <div className="flex flex-col gap-4">
            {VISITOR_PLANS.map((plan) => {
              const isPopular = plan.badge === 'POPULAR', isBest = plan.badge?.includes('BEST VALUE');
              return (
                <div key={plan.days} className={`flex justify-between items-center p-4 rounded-xl border relative ${isPopular ? 'bg-gradient-to-r from-pink-900/40 to-[#0b1120] border-pink-500/50' : isBest ? 'bg-gradient-to-r from-yellow-900/30 to-[#0b1120] border-yellow-500/50' : 'bg-[#0b1120] border-gray-700'}`}>
                  {plan.badge && <span className={`absolute -top-3 left-4 text-[10px] font-bold px-2 py-0.5 rounded-full ${isBest ? 'bg-yellow-500 text-black' : 'bg-pink-500 text-white'}`}>{plan.badge}</span>}
                  <div><h3 className="text-lg font-bold text-white">{plan.label}</h3><p className="text-xs text-gray-500">{plan.subtitle}</p></div>
                  <Btn onClick={() => buyVisitorPass(plan.days, plan.price)} className={`px-5 py-2 rounded-lg font-bold text-sm tabular-nums min-h-[40px] ${isPopular ? 'bg-pink-500 text-white' : isBest ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'}`}>🪙 {plan.price.toLocaleString()}</Btn>
                </div>
              );
            })}
          </div>
          <Btn onClick={() => setShowPlansModal(false)} className="w-full bg-gray-800 text-gray-300 font-bold py-3 rounded-xl mt-6 min-h-[44px]">Cancel</Btn>
        </SheetModal>
      )}
      {showVisitorModal && (
        <SheetModal onClose={() => setShowVisitorModal(false)} maxH="max-h-[80vh] overflow-y-auto no-scrollbar pb-10">
          <Grabber />
          <div className="flex justify-between items-center mb-6">
            <div><h2 className="text-xl font-bold text-white">Profile Visitors</h2>{userProfile.visitorExpiry && <p className="text-[11px] text-gray-400 mt-0.5">Expires {new Date(userProfile.visitorExpiry).toLocaleDateString()}</p>}</div>
            <span className="text-xs text-green-400 bg-green-400/10 px-2.5 py-1 rounded-md border border-green-400/20 font-semibold">Unlocked</span>
          </div>
          <div className="flex flex-col gap-3">
            {visitors.length === 0 ? <p className="text-center text-gray-400 py-4 text-sm">No visitors yet.</p> : visitors.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-[#0b1120] rounded-xl border border-gray-800">
                <div className="flex items-center gap-3"><UserAvatar src={v.visitorImg} name={v.visitorName} className="w-12 h-12 rounded-full border border-gray-700" /><div><p className="font-bold text-[15px] text-white">{v.visitorName}</p><p className="text-xs text-gray-500">{toTimestampMillis(v.timestamp) ? new Date(toTimestampMillis(v.timestamp)).toLocaleString() : 'Just now'}</p></div></div>
                <Btn onClick={() => onNotice(`Viewing ${v.visitorName}'s profile coming soon!`)} className="bg-pink-500/10 text-pink-400 px-4 py-1.5 rounded-full font-bold text-xs border border-pink-500/20 min-h-[36px]">View</Btn>
              </div>
            ))}
          </div>
          <Btn onClick={() => setShowVisitorModal(false)} className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl mt-6 min-h-[44px]">Close</Btn>
        </SheetModal>
      )}
      {showSettingsModal && (
        <SheetModal onClose={() => setShowSettingsModal(false)} extraCls="pb-8">
          <Grabber /><h2 className="text-lg font-bold text-white mb-4">Settings</h2>
          <div className="bg-[#0b1120] rounded-2xl border border-gray-800 overflow-hidden mb-4">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center text-sm"><span className="text-gray-400">Email</span><span className="text-gray-200 font-semibold truncate max-w-[200px]">{user.email || userProfile.email || 'Guest'}</span></div>
            <Btn onClick={() => showComingSoon('Notifications')} className="w-full p-4 border-b border-gray-800 flex justify-between items-center text-sm text-left hover:bg-white/5"><span className="text-gray-200">Notifications</span><span className="text-gray-500">›</span></Btn>
            <Btn onClick={() => showComingSoon('Privacy')} className="w-full p-4 flex justify-between items-center text-sm text-left hover:bg-white/5"><span className="text-gray-200">Privacy &amp; Blocked List</span><span className="text-gray-500">›</span></Btn>
          </div>
          <Btn onClick={handleLogout} className="w-full bg-red-600/90 text-white font-bold py-3.5 rounded-xl min-h-[48px]">Logout</Btn>
          <Btn onClick={() => setShowSettingsModal(false)} className="w-full bg-gray-800 text-gray-300 font-bold py-3 rounded-xl mt-2 min-h-[44px]">Close</Btn>
        </SheetModal>
      )}
      {(activeSheet === 'nickname' || activeSheet === 'signature') && (
        <SheetModal zClass="z-[400]" onClose={() => { setActiveSheet(null); setTempInput(''); }}>
          <h2 className="text-lg font-bold mb-4 text-white">{activeSheet === 'nickname' ? 'Edit Nickname' : 'Edit Signature'}</h2>
          <textarea value={tempInput} onChange={(e) => setTempInput(e.target.value)} className={C_BLK_INP} rows={activeSheet === 'signature' ? 3 : 1} maxLength={activeSheet === 'nickname' ? 15 : 50} />
          <Btn disabled={saving} onClick={() => saveSheetValue(activeSheet)} className="w-full bg-pink-500 text-white font-bold py-3 rounded-xl mt-4 min-h-[44px] disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</Btn>
          <Btn onClick={() => { setActiveSheet(null); setTempInput(''); }} className="w-full bg-gray-800 text-gray-300 font-bold py-3 rounded-xl mt-2 min-h-[44px]">Cancel</Btn>
        </SheetModal>
      )}
      {activeSheet === 'gender' && (
        <SheetModal zClass="z-[400]" onClose={() => setActiveSheet(null)}>
          <h2 className="text-lg font-bold mb-4 text-white">Select Gender</h2>
          {['Male', 'Female', 'Other'].map((g) => (<Btn key={g} onClick={() => { persistProfilePatch({ gender: g }, 'Gender updated!'); setActiveSheet(null); }} className="w-full flex items-center gap-3 p-4 border-b border-gray-800 text-white text-lg font-semibold hover:bg-white/5 min-h-[56px]"><span className="text-xl">{getGenderEmoji(g)}</span> {g}</Btn>))}
          <Btn onClick={() => setActiveSheet(null)} className="w-full bg-gray-800 text-gray-300 font-bold py-3 rounded-xl mt-4 min-h-[44px]">Cancel</Btn>
        </SheetModal>
      )}
      {activeSheet === 'country' && (
        <SheetModal zClass="z-[400]" maxH="max-h-[75vh] overflow-y-auto no-scrollbar" onClose={() => setActiveSheet(null)}>
          <h2 className="text-lg font-bold mb-4 text-white sticky top-0 bg-[#151d2c] py-1">Select Region</h2>
          {COUNTRIES.map((c) => (<Btn key={c.code} onClick={() => { persistProfilePatch({ country: c }, `Region set to ${c.name}`); setActiveSheet(null); }} className="w-full text-left p-4 border-b border-gray-800 text-white text-base font-semibold hover:bg-white/5 flex items-center justify-between min-h-[52px]"><span>{c.flag} {c.name}</span>{country.code === c.code && <span className="text-pink-400 text-sm font-bold">✓</span>}</Btn>))}
          <Btn onClick={() => setActiveSheet(null)} className="w-full bg-gray-800 text-gray-300 font-bold py-3 rounded-xl mt-4 min-h-[44px]">Cancel</Btn>
        </SheetModal>
      )}
      {activeSheet === 'price' && (
        <SheetModal zClass="z-[400]" onClose={() => setActiveSheet(null)}>
          <h2 className="text-lg font-bold mb-2 text-white">Set Price Tag</h2>
          <p className="text-sm text-gray-400 mb-4">People must send this gift to message you.</p>
          {PRICE_TAGS.map((p) => (<Btn key={p.id} onClick={() => { persistProfilePatch({ priceTag: p }, 'Price Tag updated!'); setActiveSheet(null); }} className="w-full flex justify-between items-center p-4 border-b border-gray-800 hover:bg-white/5 min-h-[56px]"><span className="text-white text-lg font-semibold">{p.icon} {p.name}</span>{p.price && <span className="text-yellow-500 font-bold tabular-nums">🪙 {p.price}</span>}</Btn>))}
          <Btn onClick={() => setActiveSheet(null)} className="w-full bg-gray-800 text-gray-300 font-bold py-3 rounded-xl mt-4 min-h-[44px]">Cancel</Btn>
        </SheetModal>
      )}
      {activeSheet === 'birthday' && (
        <SheetModal zClass="z-[400]" onClose={() => { setActiveSheet(null); setTempInput(''); }}>
          <h2 className="text-lg font-bold mb-2 text-white">Set Birthday</h2>
          <p className="text-sm text-gray-400 mb-4">Once set, cannot be changed.</p>
          <input type="date" value={tempInput} className={C_BLK_INP} onChange={(e) => setTempInput(e.target.value)} />
          <Btn onClick={() => { persistProfilePatch({ birthday: tempInput || '2008-01-01' }, 'Birthday saved!'); setActiveSheet(null); setTempInput(''); }} className="w-full bg-pink-500 text-white font-bold py-3 rounded-xl mt-4 min-h-[44px]">Confirm</Btn>
          <Btn onClick={() => { setActiveSheet(null); setTempInput(''); }} className="w-full bg-gray-800 text-gray-300 font-bold py-3 rounded-xl mt-2 min-h-[44px]">Cancel</Btn>
        </SheetModal>
      )}
      {cropTarget && (<ImageCropModal file={cropTarget.file} aspectRatio={cropTarget.type === 'dp' ? 1 : 16 / 9} outputWidth={cropTarget.type === 'dp' ? 400 : 1000} title={cropTarget.type === 'dp' ? 'Crop Profile Picture' : 'Crop Banner'} onCrop={handleCropDone} onCancel={() => setCropTarget(null)} onError={onNotice} />)}
    </div>
  );
};

const UserProfileView = ({ targetUser, currentUser, currentProfile, onBack, setCurrentChat, onNotice, onSelectProfile, demoMode, demoReceivedGifts, demoUsersMap }) => {
  const buildInitialUser = () => {
    const res = demoMode && demoUsersMap?.[targetUser.uid] ? demoUsersMap[targetUser.uid] : null;
    return {
      uid: targetUser.uid, displayName: res?.displayName || targetUser.displayName || targetUser.name || 'User',
      photoURL: res?.photoURL || targetUser.photoURL || targetUser.img || '', bannerURL: res?.bannerURL || targetUser.bannerURL || '',
      email: res?.email || targetUser.email || '', bio: res?.bio || targetUser.bio || 'Hey there!',
      displayId: res?.displayId || targetUser.displayId || '000000000', level: res?.level || targetUser.level || 1,
      charms: Number(res?.charms ?? targetUser.charms) || 0, coins: Number(res?.coins ?? targetUser.coins) || 0,
      friends: res?.friends || targetUser.friends || [], requests: res?.requests || targetUser.requests || [], sentRequests: res?.sentRequests || targetUser.sentRequests || [],
      isBanned: Boolean(res?.isBanned ?? targetUser.isBanned), banExpiresAt: res?.banExpiresAt || targetUser.banExpiresAt || null,
      isAdmin: Boolean(res?.isAdmin ?? targetUser.isAdmin), adminPermissions: res?.adminPermissions || targetUser.adminPermissions || [],
      gender: res?.gender || targetUser.gender || 'Male', country: res?.country || targetUser.country || COUNTRIES[0],
      isOnline: res?.isOnline ?? targetUser.isOnline, lastSeen: res?.lastSeen ?? targetUser.lastSeen,
      titles: res?.titles || targetUser.titles || [],
      showAdminBadge: res?.showAdminBadge ?? targetUser.showAdminBadge ?? true,
    };
  };
  const [fullUserData, setFullUserData] = useState(buildInitialUser);
  const [receivedGifts, setReceivedGifts] = useState(demoReceivedGifts || []);
  const [showGiftWallModal, setShowGiftWallModal] = useState(false);
  const [showAllGuardsModal, setShowAllGuardsModal] = useState(false);
  const [loading, setLoading] = useState(!demoMode);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [charmInput, setCharmInput] = useState('');
  const [coinInput, setCoinInput] = useState('');
  const [banDuration, setBanDuration] = useState('');
  const [banUnit, setBanUnit] = useState('60000');
  const isMe = fullUserData.uid === currentUser.uid;

  useEffect(() => {
    setFullUserData(buildInitialUser());
    if (demoMode) { setReceivedGifts(demoReceivedGifts || []); setLoading(false); return; }
    setLoading(true);
    const unsubUser = uDoc(targetUser.uid).onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        setFullUserData({ uid: doc.id, ...data, coins: Number(data.coins) || 0, charms: Number(data.charms) || 0 });
      }
      setLoading(false);
    }, () => setLoading(false));
    const unsubGifts = uDoc(targetUser.uid).collection('receivedGifts').orderBy('createdAt', 'desc').onSnapshot((snap) => { setReceivedGifts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); }, () => {});
    return () => { unsubUser(); unsubGifts(); };
  }, [demoMode, demoReceivedGifts, demoUsersMap, targetUser]);

  useEffect(() => {
    if (demoMode || isMe || !currentUser?.uid || !targetUser?.uid || targetUser.uid === currentUser.uid) return;
    try {
      const key = `viewed_${targetUser.uid}`;
      const last = parseInt(localStorage.getItem(key) || '0', 10);
      if (Date.now() - last < 3600000) return;
      localStorage.setItem(key, String(Date.now()));
    } catch {}
    db.collection('profileViews').add({ visitedUid: targetUser.uid, visitorUid: currentUser.uid, visitorName: currentProfile.displayName || 'User', visitorImg: currentProfile.photoURL || '', timestamp: FV.serverTimestamp() }).catch((e) => console.log('view record:', e));
  }, [targetUser?.uid, currentUser?.uid, demoMode, isMe, currentProfile?.displayName, currentProfile?.photoURL]);

  if (loading) return <div className="h-full flex items-center justify-center bg-white text-[#1a1a2e] font-bold">Loading Profile...</div>;
  const user = fullUserData;
  const isFriend = currentProfile?.friends?.includes(user.uid);
  const requestSent = currentProfile?.sentRequests?.includes(user.uid);
  const isTargetOfficial = isOfficialDisplayId(user.displayId);
  const isViewerOfficial = isOfficialDisplayId(currentProfile?.displayId);
  const targetCountry = user.country || COUNTRIES[0];
  const online = isUserOnline(user);
  const groupedGifts = groupReceivedGifts(receivedGifts);
  const guardList = computeGuardList(receivedGifts, user.uid);
  const totalGiftsCount = receivedGifts.reduce((sum, g) => sum + (Number(g.count) || 1), 0);
  const totalCharmsFromGifts = receivedGifts.reduce((sum, g) => sum + (Number(g.charms) || 0), 0);
  const displayTotalCharms = Math.max(Number(user.charms) || 0, totalCharmsFromGifts);
  const activeTitles = getActiveTitles(user.titles);
  const openSenderProfile = (sender) => { setShowGiftWallModal(false); setShowAllGuardsModal(false); onSelectProfile?.({ uid: sender.uid, displayName: sender.name, photoURL: sender.img || '' }); };

  const amISuperAdmin = isOfficialDisplayId(currentProfile?.displayId);
  const amIAdmin = amISuperAdmin || currentProfile?.isAdmin;
  const myPermissions = currentProfile?.adminPermissions || [];
  const canManageCharms = amISuperAdmin || myPermissions.includes('manage_charms');
  const canSendCoins = amISuperAdmin || myPermissions.includes('send_coins');
  const canBan = amISuperAdmin || myPermissions.includes('ban_users');
  const canManageAdmins = amISuperAdmin || myPermissions.includes('manage_admins');

  const sendRequest = async () => {
    if (demoMode) { onNotice('Friend Request Sent!'); onBack(); return; }
    await uDoc(currentUser.uid).update({ sentRequests: FV.arrayUnion(user.uid) });
    await uDoc(user.uid).update({ requests: FV.arrayUnion(currentUser.uid) });
    onNotice('Friend Request Sent!'); onBack();
  };
  const handleModifyCharms = async (action) => {
    const val = parseInt(charmInput, 10);
    if (isNaN(val) || val <= 0) return onNotice('Enter valid positive number');
    try { await uDoc(user.uid).update({ charms: FV.increment(action === 'add' ? val : -val) }); onNotice(`${action === 'add' ? 'Added' : 'Removed'} ${val} charms!`); setCharmInput(''); }
    catch (e) { onNotice(`Error: ${errMsg(e)}`); }
  };
  const handleSendCoins = async () => {
    const val = parseInt(coinInput, 10);
    if (isNaN(val) || val <= 0) return onNotice('Enter valid positive number');
    try { await uDoc(user.uid).update({ coins: FV.increment(val) }); onNotice(`Sent ${val} coins!`); setCoinInput(''); }
    catch (e) { onNotice(`Error: ${errMsg(e)}`); }
  };
  const handleTemporaryBan = async () => {
    const duration = parseInt(banDuration, 10);
    if (isNaN(duration) || duration <= 0) return onNotice('Enter valid duration');
    try { await uDoc(user.uid).update({ isBanned: true, banExpiresAt: Date.now() + duration * parseInt(banUnit, 10) }); onNotice('Banned temporarily!'); setBanDuration(''); }
    catch (e) { onNotice(`Error: ${errMsg(e)}`); }
  };
  const handlePermanentBan = async () => { try { await uDoc(user.uid).update({ isBanned: true, banExpiresAt: null }); onNotice('Permanently banned!'); } catch (e) { onNotice(`Error: ${errMsg(e)}`); } };
  const handleUnban = async () => { try { await uDoc(user.uid).update({ isBanned: false, banExpiresAt: null }); onNotice('Unbanned!'); } catch (e) { onNotice(`Error: ${errMsg(e)}`); } };
  const handleMakeAdmin = async () => {
    const perms = [];
    if (document.getElementById('p_charm')?.checked) perms.push('manage_charms');
    if (document.getElementById('p_coins')?.checked) perms.push('send_coins');
    if (document.getElementById('p_ban')?.checked) perms.push('ban_users');
    if (document.getElementById('p_admin')?.checked) perms.push('manage_admins');
    if (perms.length === 0) return onNotice('Select at least one permission');
    try { await uDoc(user.uid).update({ isAdmin: true, adminPermissions: perms }); onNotice('Admin granted!'); } catch (e) { onNotice(`Error: ${errMsg(e)}`); }
  };
  const handleRemoveAdmin = async () => { try { await uDoc(user.uid).update({ isAdmin: false, adminPermissions: [] }); onNotice('Admin revoked!'); } catch (e) { onNotice(`Error: ${errMsg(e)}`); } };
  const toggleAdminBadge = async () => {
    try { const next = user.showAdminBadge === false ? true : false; await uDoc(user.uid).update({ showAdminBadge: next }); onNotice(next ? 'Admin badge shown' : 'Admin badge hidden'); }
    catch (e) { onNotice(`Error: ${errMsg(e)}`); }
  };
  const openChat = () => setCurrentChat({ chatId: [currentUser.uid, user.uid].sort().join('_'), otherUser: user });

  return (
    <div className="fixed inset-0 bg-white max-w-[430px] mx-auto text-[#1a1a2e] flex flex-col" style={{ colorScheme: 'light' }}>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative bg-white">
        <div className="h-56 bg-slate-200 relative shrink-0">
          <BannerCover src={user.bannerURL} />
          <Btn onClick={onBack} className="absolute top-4 left-4 text-white bg-black/50 hover:bg-black/70 w-10 h-10 flex items-center justify-center rounded-full font-bold z-50 backdrop-blur-sm">←</Btn>
          {amIAdmin && !isMe && !demoMode && <Btn onClick={() => setShowAdminMenu(true)} className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 w-10 h-10 flex items-center justify-center rounded-full font-bold text-2xl shadow-lg z-50 backdrop-blur-sm">⋮</Btn>}
        </div>
        <div className="bg-white rounded-t-3xl -mt-6 relative px-4 pt-4 pb-6 min-h-[50vh]">
          <div className="flex items-end justify-between mb-3">
            <UserAvatar src={user.photoURL} name={user.displayName} className="w-24 h-24 rounded-full border-4 border-white -mt-14 shadow-md bg-slate-100" />
            <OnlineBadge online={online} light />
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h2 className="text-2xl font-extrabold text-[#1a1a2e] flex items-center gap-1.5">{user.displayName} <span className="text-xl">{getGenderEmoji(user.gender)}</span></h2>
            {isTargetOfficial && <span className="star-official-badge px-2 py-0.5 rounded text-xs font-bold">⭐ Star Official</span>}
            {user.isAdmin && !isTargetOfficial && user.showAdminBadge !== false && <span className="bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-xs font-bold">Admin</span>}
            {user.isBanned && <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded text-xs font-bold">Banned</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-pink-50 text-pink-600 border border-pink-200 text-xs font-bold px-2.5 py-0.5 rounded-full tabular-nums">Lv.{user.level || 1}</span>
            {!isTargetOfficial && <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 tabular-nums"><CharmIcon charms={displayTotalCharms} size="text-sm" /> {displayTotalCharms}</span>}
            <span className="ml-auto text-sm font-semibold text-slate-600">{targetCountry.flag} {targetCountry.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3 bg-[#f8f9fa] border border-slate-200 w-fit px-3 py-1 rounded-lg">
            <span className="font-semibold tabular-nums">ID: {user.displayId}</span>
            <Btn onClick={() => { navigator.clipboard?.writeText(user.displayId); onNotice('ID Copied!'); }} className="hover:text-[#1a1a2e] font-bold" aria-label="Copy ID">📋</Btn>
          </div>
          {activeTitles.length > 0 && (<div className="flex flex-wrap gap-1.5 mb-4">{activeTitles.map((t) => <TitleBadge key={t.id} title={t} size="md" />)}</div>)}
          <div className="mb-4 bg-[#f8f9fa] border border-slate-200 rounded-2xl p-4">
            <h3 className="font-bold text-sm text-[#1a1a2e] mb-1">Bio</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{user.bio || 'This user is mysterious.'}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Btn onClick={() => onNotice('🚧 Tags Coming Soon!')} className="bg-[#f8f9fa] hover:bg-slate-100 border border-slate-200 rounded-2xl p-3.5 text-left min-h-[68px]"><div className="flex items-center justify-between mb-1"><span className="text-sm font-extrabold text-[#1a1a2e]">🏷️ Tags</span><span className="text-slate-400 text-base font-bold">›</span></div><p className="text-xs text-slate-500">Tap to view badges</p></Btn>
            <Btn onClick={() => onNotice('🚧 Advanced Rooms Coming Soon!')} className="bg-[#f8f9fa] hover:bg-slate-100 border border-slate-200 rounded-2xl p-3.5 text-left min-h-[68px]"><div className="flex items-center justify-between mb-1"><span className="text-sm font-extrabold text-[#1a1a2e]">🎙️ Advanced Rooms</span><span className="text-slate-400 text-base font-bold">›</span></div><p className="text-xs text-slate-500">Owned VIP voice rooms</p></Btn>
          </div>
          <Btn onClick={() => setShowGiftWallModal(true)} className="w-full bg-[#f8f9fa] hover:bg-slate-100 border border-slate-200 rounded-2xl p-4 mb-4 text-left">
            <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><span className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-xl">🎁</span><div><h3 className="font-extrabold text-base text-[#1a1a2e] leading-tight">Gift Wall</h3><p className="text-xs text-slate-500">Tap to view received gifts</p></div></div><span className="text-slate-400 text-xl font-bold">›</span></div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200"><div><p className="text-[11px] font-semibold text-slate-500">Total Charms</p><p className="text-lg font-extrabold text-amber-600 tabular-nums">✨ {displayTotalCharms}</p></div><div><p className="text-[11px] font-semibold text-slate-500">Total Gifts</p><p className="text-lg font-extrabold text-[#1a1a2e] tabular-nums">🎁 {totalGiftsCount}</p></div></div>
          </Btn>
          <div className="bg-[#f8f9fa] border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3"><div><h3 className="font-extrabold text-base text-[#1a1a2e]">🛡️ Guard List</h3><p className="text-xs text-slate-500">1 Charm received = 1 Guard Point</p></div><Btn onClick={() => setShowAllGuardsModal(true)} className="text-xs font-bold text-[#ff4d9a] px-2 py-1 min-h-[36px]">View All ›</Btn></div>
            {guardList.length === 0 ? <p className="text-xs text-slate-500 py-3 text-center">No guards yet.</p> : (
              <div className="space-y-2.5">
                {guardList.slice(0, 3).map((guard, index) => {
                  const rankBadge = index === 0 ? '👑' : index === 1 ? '🥈' : '🥉';
                  const rankStyle = index === 0 ? 'bg-amber-50 border-amber-300 text-amber-900' : index === 1 ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-orange-50 border-orange-200 text-orange-900';
                  return (<Btn key={guard.uid} onClick={() => openSenderProfile(guard)} className={`w-full flex items-center justify-between p-3 rounded-xl border text-left ${rankStyle}`}><div className="flex items-center gap-3 min-w-0"><span className="text-xl w-6 text-center shrink-0">{rankBadge}</span><UserAvatar src={guard.img} name={guard.name} className="w-10 h-10 rounded-full border border-white shadow-sm shrink-0" /><div className="min-w-0"><p className="font-bold text-sm truncate">{guard.name}</p><p className="text-[11px] opacity-75">Rank #{index + 1}</p></div></div><span className="text-xs font-extrabold tabular-nums shrink-0 ml-2">{guard.guardPoints} pts</span></Btn>);
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 p-3 flex gap-2 z-50">
        {isMe ? (
          <Btn onClick={() => onNotice('Gift coming soon!')} className="flex-1 bg-[var(--color-rose)] text-white rounded-full py-3 font-bold shadow-sm min-h-[44px]">🎁 Gift</Btn>
        ) : (
          <>
            {isViewerOfficial && <Btn onClick={openChat} className="flex-1 bg-[var(--color-rose)] text-white rounded-full py-3 font-bold shadow-sm min-h-[44px]">💬 Message</Btn>}
            {!isViewerOfficial && !isFriend && !requestSent && <Btn onClick={sendRequest} className="flex-1 bg-blue-600 text-white rounded-full py-3 font-bold shadow-sm min-h-[44px]">➕ Add Friend</Btn>}
            {!isViewerOfficial && requestSent && <Btn disabled className="flex-1 bg-slate-200 text-slate-500 rounded-full py-3 font-bold min-h-[44px]">Request Sent</Btn>}
            {!isViewerOfficial && isFriend && <Btn onClick={openChat} className="flex-1 bg-[var(--color-rose)] text-white rounded-full py-3 font-bold shadow-sm min-h-[44px]">💬 Message</Btn>}
          </>
        )}
      </div>
      {showGiftWallModal && (
        <SheetModal light zClass="z-[3500]" maxH="max-h-[80vh] overflow-y-auto no-scrollbar pb-8" onClose={() => setShowGiftWallModal(false)}>
          <Grabber light />
          <div className="flex justify-between items-center mb-4"><div><h3 className="text-lg font-extrabold text-[#1a1a2e]">🎁 Gift Wall</h3><p className="text-xs text-slate-500">{totalGiftsCount} Gifts · {displayTotalCharms} Charms</p></div><Btn onClick={() => setShowGiftWallModal(false)} className="text-slate-500 text-2xl font-bold px-2">×</Btn></div>
          {groupedGifts.length === 0 ? <p className="text-center text-slate-500 text-sm py-8">No gifts received yet.</p> : (
            <div className="grid grid-cols-2 gap-3">
              {groupedGifts.map((group) => (
                <div key={group.key} className="bg-[#f8f9fa] border border-slate-200 rounded-2xl p-3 flex flex-col justify-between gap-2">
                  <div className="flex items-center gap-2.5"><span className="text-2xl shrink-0">{group.giftType === 'image' ? <img src={group.giftIcon} alt={group.giftName} className="w-8 h-8 object-contain" /> : group.giftIcon}</span><div className="min-w-0"><p className="font-extrabold text-sm text-[#1a1a2e] truncate">{group.giftName} × {group.totalCount}</p><p className="text-[11px] font-semibold text-amber-600 tabular-nums">+{group.totalCharms} Charms</p></div></div>
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 overflow-x-auto no-scrollbar"><span className="text-[10px] font-semibold text-slate-500 shrink-0">From:</span>{group.senders.map((sender) => (<Btn key={sender.uid} onClick={() => openSenderProfile(sender)} className="relative shrink-0 rounded-full"><UserAvatar src={sender.img} name={sender.name} className="w-7 h-7 rounded-full border border-slate-300" /></Btn>))}</div>
                </div>
              ))}
            </div>
          )}
        </SheetModal>
      )}
      {showAllGuardsModal && (
        <SheetModal light zClass="z-[3500]" maxH="max-h-[80vh] overflow-y-auto no-scrollbar pb-8" onClose={() => setShowAllGuardsModal(false)}>
          <Grabber light />
          <div className="flex justify-between items-center mb-4"><div><h3 className="text-lg font-extrabold text-[#1a1a2e]">🛡️ Full Guard List</h3><p className="text-xs text-slate-500">1 Charm received = 1 Guard Point</p></div><Btn onClick={() => setShowAllGuardsModal(false)} className="text-slate-500 text-2xl font-bold px-2">×</Btn></div>
          {guardList.length === 0 ? <p className="text-center text-slate-500 text-sm py-8">No supporters yet.</p> : (
            <div className="space-y-2.5">
              {guardList.map((guard, index) => (
                <Btn key={guard.uid} onClick={() => openSenderProfile(guard)} className="w-full flex items-center justify-between p-3 rounded-xl bg-[#f8f9fa] border border-slate-200 hover:bg-slate-100 text-left">
                  <div className="flex items-center gap-3 min-w-0"><span className="text-sm font-extrabold text-slate-500 w-6 text-center tabular-nums">{index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span><UserAvatar src={guard.img} name={guard.name} className="w-10 h-10 rounded-full border border-slate-300 shrink-0" /><div className="min-w-0"><p className="font-bold text-sm text-[#1a1a2e] truncate">{guard.name}</p><p className="text-[11px] text-slate-500 tabular-nums">{guard.totalGifts} gifts sent</p></div></div>
                  <span className="text-xs font-extrabold text-amber-600 tabular-nums shrink-0">{guard.guardPoints} Pts</span>
                </Btn>
              ))}
            </div>
          )}
        </SheetModal>
      )}
      {showAdminMenu && (
        <div className="fixed inset-0 bg-black/80 z-[4000] flex items-center justify-center p-4">
          <div className="bg-[#0c0c10] border border-white/15 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh] shadow-2xl text-white">
            <div className="bg-black p-4 flex justify-between items-center border-b border-white/10"><h3 className="font-bold text-lg">⚙️ Admin Controls</h3><Btn onClick={() => setShowAdminMenu(false)} className="text-2xl font-bold leading-none">×</Btn></div>
            <div className="p-4 overflow-y-auto no-scrollbar space-y-5">
              {canManageCharms && (<div className={C_ADMIN_BOX}><h4 className="font-bold text-sm mb-3">✨ Manage Charms</h4><div className="flex gap-2"><input type="number" placeholder="Amount" className={C_INP_AD} value={charmInput} onChange={(e) => setCharmInput(e.target.value)} /><Btn onClick={() => handleModifyCharms('add')} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-bold">+ Add</Btn><Btn onClick={() => handleModifyCharms('remove')} className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold">- Remove</Btn></div></div>)}
              {canSendCoins && (<div className={C_ADMIN_BOX}><h4 className="font-bold text-sm mb-3">🪙 Send Coins</h4><div className="flex gap-2"><input type="number" placeholder="Amount" className={C_INP_AD} value={coinInput} onChange={(e) => setCoinInput(e.target.value)} /><Btn onClick={handleSendCoins} className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold">Send</Btn></div></div>)}
              {canBan && (<div className={C_ADMIN_BOX}><h4 className="font-bold text-sm mb-3">🚫 Ban Controls</h4>{user.isBanned ? (<div className="space-y-2"><p className="text-xs text-red-300 font-bold bg-red-500/20 p-2 rounded-lg">Status: Banned {user.banExpiresAt ? `(Until: ${new Date(user.banExpiresAt).toLocaleString()})` : '(Permanent)'}</p><Btn onClick={handleUnban} className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-sm">Unban User</Btn></div>) : (<div className="space-y-3"><div className="flex gap-2"><input type="number" placeholder="Time" className={C_ADM_INP} value={banDuration} onChange={(e) => setBanDuration(e.target.value)} /><select className="w-1/2 bg-black border border-white/15 rounded-lg px-2 py-2 text-sm text-white" value={banUnit} onChange={(e) => setBanUnit(e.target.value)}><option value="60000">Minutes</option><option value="3600000">Hours</option><option value="86400000">Days</option></select></div><div className="flex gap-2"><Btn onClick={handleTemporaryBan} className="flex-1 bg-orange-600 text-white py-2 rounded-lg text-sm font-bold">Temp Ban</Btn><Btn onClick={handlePermanentBan} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-bold">Perm Ban</Btn></div></div>)}</div>)}
              {canManageAdmins && !isMe && (
                <div className={C_ADMIN_BOX}>
                  <h4 className="font-bold text-sm mb-3">👑 Admin Access</h4>
                  {user.isAdmin && !isTargetOfficial ? (
                    <div className="space-y-2"><p className="text-xs text-green-300 font-bold bg-green-500/20 p-2 rounded-lg">This user is Admin</p><p className="text-[11px] text-slate-300"><strong>Perms:</strong> {user.adminPermissions?.join(', ') || 'None'}</p><Btn onClick={handleRemoveAdmin} className="w-full bg-red-500/20 text-red-300 py-2 rounded-lg font-bold text-sm mt-2">Revoke Admin</Btn></div>
                  ) : !user.isAdmin ? (
                    <div className="space-y-3"><div className="flex flex-col gap-1.5 text-sm"><label className="flex items-center gap-2"><input type="checkbox" id="p_charm" defaultChecked /> Manage Charms</label><label className="flex items-center gap-2"><input type="checkbox" id="p_coins" defaultChecked /> Send Coins</label><label className="flex items-center gap-2"><input type="checkbox" id="p_ban" defaultChecked /> Ban Users</label><label className="flex items-center gap-2"><input type="checkbox" id="p_admin" /> Manage Admins</label></div><Btn onClick={handleMakeAdmin} className="w-full bg-[var(--color-rose)] text-white py-2 rounded-lg font-bold text-sm mt-2">Grant Admin</Btn></div>
                  ) : null}
                  <div className="border-t border-white/10 mt-3 pt-3"><h4 className="font-bold text-sm mb-2">🎭 Admin Badge</h4><Btn onClick={toggleAdminBadge} className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold text-sm">{user.showAdminBadge === false ? '👁️ Show Badge' : '🙈 Hide Badge'}</Btn></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, errorInfo: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, errorInfo: error.toString() }; }
  render() { if (this.state.hasError) return <div className="p-5 bg-red-950 text-red-200 h-full font-mono"><h1>App Error:</h1><p>{this.state.errorInfo}</p></div>; return this.props.children; }
}

const NavBtn = ({ icon, label, active, onClick, color }) => (
  <Btn onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? color || 'text-[var(--color-rose)]' : 'text-slate-500'}`}>
    <span className="text-xl">{icon}</span><span className="text-[10px] font-bold">{label}</span>
  </Btn>
);

const NOW_REF = Date.now();
const DEMO_PROFILE = {
  uid: 'demo-me', displayName: 'You', photoURL: '', bannerURL: '', email: 'guest@worldstar.local',
  bio: 'Enjoying the voice room.', displayId: '100200300', level: 5, charms: 1200, coins: 1200,
  friends: ['u1', 'u2'], requests: ['u3'], sentRequests: [], isBanned: false, banExpiresAt: null,
  isAdmin: false, adminPermissions: [], gender: 'Male', birthday: null,
  country: { code: 'IN', name: 'India', flag: '🇮🇳' }, priceTag: { id: 'none', name: 'None', icon: '🚫' },
  visitorExpiry: null, isOnline: true, lastSeen: NOW_REF, titles: [], showAdminBadge: true,
};
const DEMO_DIRECTORY_USERS = [
  { uid: 'u1', displayName: 'Rahul', photoURL: '', bannerURL: '', email: 'rahul@worldstar.local', bio: 'Always hosting chill music rooms!', displayId: '882104912', level: 12, charms: 680, coins: 500, friends: ['demo-me'], requests: [], sentRequests: [], isBanned: false, banExpiresAt: null, isAdmin: false, adminPermissions: [], gender: 'Male', country: { code: 'IN', name: 'India', flag: '🇮🇳' }, isOnline: true, lastSeen: NOW_REF, titles: [{ id: 'demo-t1', text: 'Legend', emoji: '🔥', glowStyle: 'fire', active: true, expiresAt: null }], showAdminBadge: true },
  { uid: 'u2', displayName: 'Sonia', photoURL: '', bannerURL: '', email: 'sonia@worldstar.local', bio: 'Singer & late night host ✨', displayId: '774920183', level: 15, charms: 2150, coins: 940, friends: ['demo-me'], requests: [], sentRequests: [], isBanned: false, banExpiresAt: null, isAdmin: false, adminPermissions: [], gender: 'Female', country: { code: 'AE', name: 'UAE', flag: '🇦🇪' }, isOnline: false, lastSeen: NOW_REF - 10 * 60000, titles: [{ id: 'demo-t2', text: 'Queen', emoji: '👑', glowStyle: 'gold', active: true, expiresAt: null }, { id: 'demo-t3', text: 'VIP', emoji: '💎', glowStyle: 'neon-blue', active: true, expiresAt: null }], showAdminBadge: true },
  { uid: 'u3', displayName: 'Maya', photoURL: '', bannerURL: '', email: 'maya@worldstar.local', bio: 'New to World Star!', displayId: '551903442', level: 6, charms: 340, coins: 420, friends: [], requests: [], sentRequests: ['demo-me'], isBanned: false, banExpiresAt: null, isAdmin: false, adminPermissions: [], gender: 'Female', country: { code: 'US', name: 'USA', flag: '🇺🇸' }, isOnline: true, lastSeen: NOW_REF, titles: [], showAdminBadge: true },
  { uid: 'u4', displayName: 'Kabir', photoURL: '', bannerURL: '', email: 'kabir@worldstar.local', bio: 'Top gifter', displayId: '339104218', level: 19, charms: 900, coins: 3500, friends: [], requests: [], sentRequests: [], isBanned: false, banExpiresAt: null, isAdmin: false, adminPermissions: [], gender: 'Male', country: { code: 'GB', name: 'UK', flag: '🇬🇧' }, isOnline: false, lastSeen: NOW_REF - 25 * 60000, titles: [], showAdminBadge: true },
];
const INITIAL_DEMO_GIFTS = {
  u2: [
    { id: 'dg-1', giftId: '2', giftName: 'Crown', giftIcon: '👑', giftType: 'emoji', charms: 1000, count: 1, senderUid: 'u4', senderName: 'Kabir', senderImg: '', createdAt: NOW_REF - 300000 },
    { id: 'dg-2', giftId: '1', giftName: 'Rose', giftIcon: '🌹', giftType: 'emoji', charms: 10, count: 10, senderUid: 'u1', senderName: 'Rahul', senderImg: '', createdAt: NOW_REF - 200000 },
    { id: 'dg-3', giftId: '3', giftName: 'Heart', giftIcon: '💖', giftType: 'emoji', charms: 50, count: 1, senderUid: 'u3', senderName: 'Maya', senderImg: '', createdAt: NOW_REF - 100000 },
  ],
  u1: [{ id: 'dg-5', giftId: '3', giftName: 'Heart', giftIcon: '💖', giftType: 'emoji', charms: 50, count: 2, senderUid: 'u2', senderName: 'Sonia', senderImg: '', createdAt: NOW_REF - 150000 }],
};

function WorldStarApp() {
  const isAutostartDemo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('autostart') === '1';
  const [user, setUser] = useState(isAutostartDemo ? { uid: DEMO_PROFILE.uid, email: DEMO_PROFILE.email } : null);
  const [userProfile, setUserProfile] = useState(isAutostartDemo ? DEMO_PROFILE : null);
  const [loading, setLoading] = useState(!isAutostartDemo);
  const [view, setView] = useState(isAutostartDemo ? 'app' : 'login');
  const [activeTab, setActiveTab] = useState(isAutostartDemo ? 'voice' : 'home');
  const [currentRoomId, setCurrentRoomId] = useState(isAutostartDemo ? 'demo-room' : null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [globalNotice, setGlobalNotice] = useState(null);
  const [demoGiftsByUid, setDemoGiftsByUid] = useState(INITIAL_DEMO_GIFTS);

  const demoUsersMap = useMemo(() => { const map = {}; DEMO_DIRECTORY_USERS.forEach((u) => { map[u.uid] = u; }); if (userProfile) map[userProfile.uid] = userProfile; return map; }, [userProfile]);
  const demoFriends = useMemo(() => (userProfile?.friends || []).map((fid) => demoUsersMap[fid]).filter(Boolean), [demoUsersMap, userProfile?.friends]);
  const demoRequests = useMemo(() => (userProfile?.requests || []).map((rid) => demoUsersMap[rid]).filter(Boolean), [demoUsersMap, userProfile?.requests]);
  const showNotice = (msg) => { setGlobalNotice(msg); setTimeout(() => setGlobalNotice((prev) => (prev === msg ? null : prev)), 2800); };

  useEffect(() => {
    if (isAutostartDemo) return;
    const unsub = auth.onAuthStateChanged(async (u) => {
      try {
        if (u) {
          setUser(u);
          const docRef = uDoc(u.uid);
          const doc = await docRef.get();
          const now = Date.now();
          if (!doc.exists) {
            const officialUids = [];
            for (const oid of OFFICIAL_DISPLAY_IDS) {
              try { const snap = await db.collection('users').where('displayId', '==', oid).limit(1).get(); if (!snap.empty && snap.docs[0].id !== u.uid) officialUids.push(snap.docs[0].id); } catch {}
            }
            const newData = {
              displayName: u.displayName?.substring(0, 15) || 'User', photoURL: u.photoURL || '', bannerURL: '',
              email: u.email || '', bio: 'Hey there!', uid: u.uid, displayId: Math.floor(100000000 + Math.random() * 900000000).toString(),
              level: 1, charms: 0, coins: 0, friends: officialUids, requests: [], sentRequests: [],
              isBanned: false, banExpiresAt: null, isAdmin: false, adminPermissions: [], gender: 'Male', birthday: null,
              country: { code: 'IN', name: 'India', flag: '🇮🇳' }, priceTag: { id: 'none', name: 'None', icon: '🚫' },
              visitorExpiry: null, isOnline: true, lastSeen: now, titles: [], showAdminBadge: true,
            };
            await docRef.set({ ...newData, createdAt: FV.serverTimestamp() });
            setUserProfile(newData);
          } else {
            const data = doc.data();
            const patch = { isOnline: true, lastSeen: now };
            if (data.isBanned && data.banExpiresAt && now > data.banExpiresAt) { patch.isBanned = false; patch.banExpiresAt = null; data.isBanned = false; data.banExpiresAt = null; }
            try {
              const officialUids = [];
              for (const oid of OFFICIAL_DISPLAY_IDS) {
                const snap = await db.collection('users').where('displayId', '==', oid).limit(1).get();
                if (!snap.empty && snap.docs[0].id !== u.uid) officialUids.push(snap.docs[0].id);
              }
              const missing = officialUids.filter((id) => !(data.friends || []).includes(id));
              if (missing.length > 0) { patch.friends = FV.arrayUnion(...missing); data.friends = [...(data.friends || []), ...missing]; }
            } catch {}
            const now2 = Date.now();
            const validTitles = (data.titles || []).filter((t) => !t.expiresAt || t.expiresAt > now2);
            if (validTitles.length !== (data.titles || []).length) { patch.titles = validTitles; data.titles = validTitles; }
            await docRef.update(patch).catch(() => {});
            setUserProfile({ ...data, isOnline: true, lastSeen: now, coins: Number(data.coins) || 0, charms: Number(data.charms) || 0, titles: validTitles });
          }
          setView('app');
        } else {
          setUser(null); setUserProfile(null); setView('login');
          setCurrentRoomId(null); setCurrentChat(null); setViewingProfile(null); setIsMinimized(false); setRoomDetails(null);
        }
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, [isAutostartDemo]);

  useEffect(() => {
    if (isAutostartDemo || !user?.uid) return;
    const setPresence = (online) => { uDoc(user.uid).update({ isOnline: online, lastSeen: Date.now() }).catch(() => {}); };
    setPresence(true);
    const heartbeat = window.setInterval(() => { if (document.visibilityState === 'visible') setPresence(true); }, 45000);
    const handleVisibility = () => setPresence(document.visibilityState === 'visible');
    const handleUnload = () => setPresence(false);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleUnload);
    return () => { window.clearInterval(heartbeat); document.removeEventListener('visibilitychange', handleVisibility); window.removeEventListener('beforeunload', handleUnload); };
  }, [isAutostartDemo, user?.uid]);

  if (loading) return <div className="h-full flex items-center justify-center bg-black text-[var(--color-rose)] font-bold text-xl">Loading...</div>;
  if (view === 'login') {
    return (
      <>
        {globalNotice && <div role="status" className="fixed top-4 left-1/2 -translate-x-1/2 z-[9000] px-4 py-2 rounded-xl bg-[#1a1a2e] border border-black/10 text-white text-xs font-bold shadow-xl max-w-[380px] text-center">{globalNotice}</div>}
        <LoginScreen onNotice={showNotice} />
      </>
    );
  }
  if (view === 'app' && (!userProfile || !user)) return <div className="h-full flex items-center justify-center bg-black text-[var(--color-rose)] font-bold text-xl">Setting up...</div>;
  if (userProfile?.isBanned) {
    let banMessage = 'You are permanently banned.';
    if (userProfile.banExpiresAt) {
      const timeLeft = userProfile.banExpiresAt - Date.now();
      if (timeLeft > 0) { const hours = Math.floor(timeLeft / (1000 * 60 * 60)), mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)); banMessage = `Banned. Time remaining: ${hours > 0 ? hours + 'h ' : ''}${mins}m`; }
    }
    return (
      <div className="h-full flex flex-col items-center justify-center bg-black text-white p-6 text-center">
        <div className="text-6xl mb-4">🚫</div><h1 className="text-2xl font-bold text-red-500 mb-2">Account Suspended</h1>
        <p className="text-slate-300 mb-6">{banMessage}</p>
        <Btn onClick={() => auth.signOut()} className="bg-[var(--color-rose)] px-6 py-2 rounded-full font-bold">Logout</Btn>
      </div>
    );
  }
  return (
    <>
      {globalNotice && <div role="status" className="fixed top-4 left-1/2 -translate-x-1/2 z-[9000] px-4 py-2 rounded-xl bg-[#2a2a32] border border-white/20 text-white text-xs font-bold shadow-xl">{globalNotice}</div>}
      {currentRoomId && user && userProfile && (
        <div className={isMinimized ? 'hidden' : 'block w-full h-full'}>
          <RoomInterface roomId={currentRoomId} user={user} userProfile={userProfile} demoMode={isAutostartDemo}
            onUpdateLocalCoins={(coins) => setUserProfile((prev) => (prev ? { ...prev, coins } : prev))}
            onUpdateLocalCharms={(charms) => setUserProfile((prev) => (prev ? { ...prev, charms } : prev))}
            onDemoGiftReceived={(targetUid, record) => setDemoGiftsByUid((prev) => ({ ...prev, [targetUid]: [record, ...(prev[targetUid] || [])] }))}
            onMinimize={(details) => { setRoomDetails(details); setIsMinimized(true); }}
            onLeave={() => { setCurrentRoomId(null); setIsMinimized(false); setRoomDetails(null); }}
            onViewProfile={(target) => setViewingProfile(target)}
          />
        </div>
      )}
      {(!currentRoomId || isMinimized) && user && userProfile && (
        <div className="fixed inset-0 bg-black text-white flex flex-col max-w-[430px] mx-auto h-[100dvh]">
          <div className="flex-1 overflow-y-auto no-scrollbar pb-2">
            {activeTab === 'home' && <HomeTab user={user} userProfile={userProfile} setActiveTab={setActiveTab} openProfile={(p) => setViewingProfile(p)} onNotice={showNotice} />}
            {activeTab === 'voice' && <VoiceRoomTab user={user} userProfile={userProfile} onJoinRoom={(id) => { setCurrentRoomId(id); setIsMinimized(false); }} onNotice={showNotice} />}
            {activeTab === 'chats' && (
              <ChatsTab user={user} userProfile={userProfile} openProfile={(p) => setViewingProfile(p)} setCurrentChat={setCurrentChat} onNotice={showNotice}
                demoMode={isAutostartDemo} demoFriends={demoFriends} demoRequests={demoRequests}
                onDemoAcceptRequest={(requesterId) => setUserProfile((prev) => prev ? { ...prev, friends: prev.friends.includes(requesterId) ? prev.friends : [requesterId, ...prev.friends], requests: prev.requests.filter((id) => id !== requesterId) } : prev)}
              />
            )}
            {activeTab === 'me' && <ProfileTab user={user} userProfile={userProfile} setUserProfile={setUserProfile} setView={setView} onNotice={showNotice} demoMode={isAutostartDemo} />}
          </div>
          {isMinimized && roomDetails && (
            <div className="absolute bottom-20 left-4 right-4 bg-[#0c0c10] border border-[var(--color-rose)] text-white p-3 rounded-xl flex justify-between items-center z-50 shadow-lg">
              <Btn onClick={() => setIsMinimized(false)} className="font-bold flex-1 text-left text-sm truncate">Live Room: {roomDetails.title}</Btn>
              <Btn onClick={() => { setCurrentRoomId(null); setIsMinimized(false); setRoomDetails(null); }} className="bg-[#ff2a45] w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ml-2">✕</Btn>
            </div>
          )}
          <nav className="w-full h-16 bg-[#0c0c10] border-t border-white/10 flex justify-around items-center px-2 z-50 shrink-0">
            <NavBtn icon="🎮" label="World" active={activeTab === 'home'} onClick={() => setActiveTab('home')} color="text-[#7ee7ff]" />
            <NavBtn icon="🎤" label="Voice" active={activeTab === 'voice'} onClick={() => setActiveTab('voice')} />
            <NavBtn icon="💬" label="Chats" active={activeTab === 'chats'} onClick={() => setActiveTab('chats')} />
            <NavBtn icon="🧭" label="Discover" active={false} onClick={() => showNotice('Under Maintenance!')} />
            <NavBtn icon="👤" label="Me" active={activeTab === 'me'} onClick={() => setActiveTab('me')} />
          </nav>
          {isOfficialDisplayId(userProfile?.displayId) && !showAdminDashboard && <DraggableAdminBtn onClick={() => setShowAdminDashboard(true)} />}
        </div>
      )}
      {currentChat && user && <ChatRoom chatData={currentChat} user={user} userProfile={userProfile} onBack={() => setCurrentChat(null)} openProfile={(p) => setViewingProfile(p)} onNotice={showNotice} demoMode={isAutostartDemo} />}
      {viewingProfile && user && userProfile && (
        <div className="fixed inset-0 z-[3000] bg-white">
          <UserProfileView targetUser={viewingProfile} currentUser={user} currentProfile={userProfile} onBack={() => setViewingProfile(null)} setCurrentChat={setCurrentChat} onNotice={showNotice}
            onSelectProfile={(p) => setViewingProfile(p)} demoMode={isAutostartDemo} demoReceivedGifts={demoGiftsByUid[viewingProfile.uid] || []} demoUsersMap={demoUsersMap} />
        </div>
      )}
      {showAdminDashboard && <AdminDashboard onClose={() => setShowAdminDashboard(false)} onNotice={showNotice} />}
    </>
  );
}

function App() { return <ErrorBoundary><WorldStarApp /></ErrorBoundary>; }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
