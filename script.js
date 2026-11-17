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

const PRICE_TAGS = [ { id: 'none', name: 'None', icon: '🚫' }, { id: 'rose', name: 'Rose', icon: '🌹', price: 10 }, { id: 'heart', name: 'Heart', icon: '❤️', price: 20 }, { id: 'crown', name: 'Crown', icon: '👑', price: 99 } ];
const VISITOR_PLANS = [ { days: 3, price: 500, label: '3 Days Pass', subtitle: 'Basic Access', badge: null }, { days: 7, price: 900, label: '7 Days Pass', subtitle: '1,166 Coins', badge: 'POPULAR' }, { days: 30, price: 3750, label: '30 Days Pass', subtitle: '5,000 Coins', badge: 'BEST VALUE (25% OFF)' } ];
const QUICK_REACTIONS = ['👋 Hello!', '🔥 Vibe!', '👏 Amazing!', '😂 Haha!', '❤️ Love it!', '🎤 Sing!'];

function getGenderEmoji(gender) { if (gender === 'Female') return '♀️'; if (gender === 'Other') return '⚧️'; return '♂️'; }
function isVisitorPassActive(visitorExpiry, now = Date.now()) { return Boolean(visitorExpiry && now < visitorExpiry); }
function purchaseVisitorPass(params) {
  const now = params.now ?? Date.now();
  if (!params.isSuperAdmin && params.coins < params.price) return { ok: false, nextCoins: params.coins, visitorExpiry: 0, error: 'Not enough coins!' };
  const nextCoins = params.isSuperAdmin ? params.coins : params.coins - params.price;
  return { ok: true, nextCoins, visitorExpiry: now + params.days * 24 * 60 * 60 * 1000 };
}
function calculateGiftRewards(price, randomFactor = Math.random()) { const safePrice = Math.max(0, Number(price) || 0); const clampedRandom = Math.max(0, Math.min(1, randomFactor)); return { charmsEarned: Math.floor(safePrice / 2), coinsEarned: Math.floor(safePrice * (clampedRandom * 0.65)) }; }
function checkRoomEntryAccess(room, userId, now = Date.now()) {
  if (room.blocked && room.blocked.includes(userId)) return { allowed: false, reason: 'You are blocked from this room.' };
  if (room.kicked && room.kicked[userId]) { const diff = now - room.kicked[userId]; const cooldownMs = 10 * 60 * 1000; if (diff < cooldownMs) return { allowed: false, reason: `You are kicked! Try again in ${Math.ceil((cooldownMs - diff) / 60000)} mins.` }; }
  return { allowed: true };
}
function joinMemberToRoom(activeMembers, user, ownerId) { if (activeMembers.some((m) => m.uid === user.uid)) return activeMembers; return [...activeMembers, { uid: user.uid, name: user.name, img: user.img, seatIndex: ownerId === user.uid ? 0 : null }]; }
function assignSeatToMember(activeMembers, userId, seatIndex) { if (activeMembers.some((m) => m.seatIndex === seatIndex && m.uid !== userId)) return activeMembers; return activeMembers.map((m) => (m.uid === userId ? { ...m, seatIndex } : m)); }
function liftMemberFromSeat(activeMembers, userId) { return activeMembers.map((m) => (m.uid === userId ? { ...m, seatIndex: null } : m)); }
function removeMemberOnLeave(activeMembers, leavingUserId, currentOwnerId) {
  const remaining = activeMembers.filter((u) => u.uid !== leavingUserId);
  if (remaining.length === 0) return { nextMembers: [], shouldDeleteRoom: true };
  if (currentOwnerId === leavingUserId) { const promoted = remaining[0]; return { nextMembers: remaining.map((m) => (m.uid === promoted.uid ? { ...m, seatIndex: 0 } : m)), nextOwner: { ...promoted, seatIndex: 0 }, shouldDeleteRoom: false }; }
  return { nextMembers: remaining, shouldDeleteRoom: false };
}
function getCharmBadgeInfo(charms) {
  if (charms >= 1000000) return { baseEmoji: '👑', level: 9, glowColor: 'rgba(255, 215, 0, 0.9)' }; if (charms >= 500000) return { baseEmoji: '👑', level: 8, glowColor: 'rgba(255, 215, 0, 0.8)' }; if (charms >= 300000) return { baseEmoji: '👑', level: 7, glowColor: 'rgba(255, 215, 0, 0.7)' };
  if (charms >= 160000) return { baseEmoji: '💎', level: 6, glowColor: 'rgba(56, 189, 248, 0.9)' }; if (charms >= 80000) return { baseEmoji: '💎', level: 5, glowColor: 'rgba(56, 189, 248, 0.8)' }; if (charms >= 30000) return { baseEmoji: '💎', level: 4, glowColor: 'rgba(56, 189, 248, 0.7)' };
  if (charms >= 12000) return { baseEmoji: '⭐', level: 3, glowColor: 'rgba(250, 204, 21, 0.8)' }; if (charms >= 4000) return { baseEmoji: '⭐', level: 2, glowColor: 'rgba(250, 204, 21, 0.7)' }; if (charms >= 1000) return { baseEmoji: '⭐', level: null, glowColor: 'rgba(255, 255, 255, 0.4)' };
  return { baseEmoji: '✨', level: null, glowColor: 'rgba(255, 255, 255, 0.4)' };
}
function canSendDirectMessage(messages, currentUserId, otherUserId, isAdmin) {
  if (isAdmin) return true;
  let lastTheirMsgIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) { if (messages[i].senderId === otherUserId) { lastTheirMsgIndex = i; break; } }
  return messages.slice(lastTheirMsgIndex + 1).filter((m) => m.senderId === currentUserId).length < 3;
}
function formatCountdown(secs) { const safe = Math.max(0, Math.floor(secs)); const m = Math.floor(safe / 60), s = safe % 60; return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`; }
function toTimestampMillis(value) { if (typeof value === 'number' && Number.isFinite(value)) return value; if (value && typeof value === 'object' && typeof value.toMillis === 'function') return value.toMillis(); return null; }
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

// UI Constants
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
const CloseX = ({ onClick, label = 'Close', cls = 'text-[#9aa3c7] text-lg font-bold px-1' }) => ( <Btn onClick={onClick} aria-label={label} className={cls}>✕</Btn> );
const Grabber = ({ light, cls = 'mb-4' }) => ( <div className={`w-12 h-1.5 ${light ? 'bg-slate-300' : 'bg-gray-600'} rounded-full mx-auto ${cls}`} /> );
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
const CharmIcon = ({ charms, size = 'text-lg' }) => { const { baseEmoji, level, glowColor } = getCharmBadgeInfo(charms || 0); return ( <div className="relative inline-flex items-center justify-center"><span className={`${size} z-0`} style={{ filter: `drop-shadow(0px 0px 6px ${glowColor}) drop-shadow(0px 0px 2px ${glowColor})` }}>{baseEmoji}</span>{level && <span className="absolute bottom-0 right-0 text-[10px] font-black text-white z-10" style={{ textShadow: '0px 1px 2px #000, 0px 0px 3px #000, 0px 0px 4px #000' }}>{level}</span>}</div> ); };

const UserAvatar = ({ src, name = 'U', className = 'w-10 h-10 rounded-full', onClick }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return ( <div onClick={onClick} className={`${className} flex items-center justify-center font-extrabold text-black select-none`} style={{ background: 'radial-gradient(circle at 40% 32%, var(--color-ice), var(--color-rose) 72%)' }}>{(name?.trim()?.charAt(0) || 'U').toUpperCase()}</div> );
  return <img src={src} alt={name} referrerPolicy="no-referrer" onError={() => setFailed(true)} onClick={onClick} className={`${className} object-cover`} />;
};
const BannerCover = ({ src, alt = 'Profile banner', className = 'w-full h-full object-cover' }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className="w-full h-full" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(126, 231, 255, 0.35), transparent 55%), radial-gradient(circle at 80% 70%, rgba(255, 77, 154, 0.35), transparent 55%), linear-gradient(135deg, #10111a 0%, #1d1b2b 100%)' }} />;
  return <img src={src} alt={alt} referrerPolicy="no-referrer" onError={() => setFailed(true)} className={className} />;
};
const CoinIcon = ({ small }) => ( <svg width={small ? 12 : 14} height={small ? 12 : 14} viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="var(--color-gold)" /><path d="M8 4.2 9 7h2.8L10 8.7l.8 2.6L8 9.8 5.2 11.3 6 8.7 4.2 7H7Z" fill="#8a6410" /></svg> );
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5.5v13M5.5 12h13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
const PulseWave = () => <svg className="pulse" viewBox="0 0 48 20" aria-hidden="true"><path d="M1 10 H12 L16 10 L19 3 L24 17 L28 7 L31 10 H47" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" /></svg>;
const SpeakerIcon = ({ muted }) => ( <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.2h3.2L11 5.6v12.8l-4.3-3.6H3.5V9.2Z" fill="currentColor" />{muted ? <path d="M15 9l5 6M20 9l-5 6" fill="none" stroke="var(--color-gift)" strokeWidth="2" strokeLinecap="round" /> : <path d="M15 8.2a5 5 0 0 1 0 7.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}</svg> );
const MicIcon = ({ muted }) => ( <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" /><path d="M6.5 11a5.5 5.5 0 0 0 11 0M12 16.5V20M8.5 20h7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />{muted && <path d="M4 4l16 16" stroke="var(--color-gift)" strokeWidth="2.1" strokeLinecap="round" />}</svg> );
const SmileIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.7" /><circle cx="9" cy="10.2" r="1" fill="currentColor" /><circle cx="15" cy="10.2" r="1" fill="currentColor" /><path d="M8.4 13.4c1 1.8 2.2 2.6 3.6 2.6s2.6-.8 3.6-2.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg> );
const GiftIcon = () => ( <svg width="24" height="24" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 24c-1-9-14-12-16-4 3.4 2 8.6 3.6 16 4Z" fill="var(--color-gold)" /><path d="M32 24c1-9 14-12 16-4-3.4 2-8.6 3.6-16 4Z" fill="var(--color-gold-lite)" /><rect x="10" y="24" width="44" height="10" rx="2" fill="var(--color-rose)" /><rect x="12" y="32" width="40" height="22" rx="3" fill="var(--color-gift)" /><rect x="28" y="24" width="8" height="30" fill="var(--color-gold)" /></svg> );
const MoreIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="8.2" height="8.2" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" /><rect x="13.8" y="2" width="8.2" height="8.2" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" /><rect x="2" y="13.8" width="8.2" height="8.2" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" /><rect x="13.8" y="13.8" width="8.2" height="8.2" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" /></svg> );
const ChevronIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const compressImage = (file, maxWidth = 300) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = String(event.target?.result || '');
    img.onload = () => {
      const canvas = document.createElement('canvas'); canvas.width = maxWidth; canvas.height = img.height * (maxWidth / img.width);
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  };
});

const ImageCropModal = ({ file, aspectRatio = 1, outputWidth = 400, title = 'Crop Image', onCrop, onCancel, onError }) => {
  const imgRef = useRef(null); const cropperRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null); const [imageLoaded, setImageLoaded] = useState(false); const [cropperReady, setCropperReady] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file); setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!imageLoaded || !imgRef.current) return;
    const c = new Cropper(imgRef.current, { aspectRatio, viewMode: 1, dragMode: 'move', autoCropArea: 0.85, restore: false, guides: true, center: true, highlight: false, cropBoxMovable: true, cropBoxResizable: true, toggleDragModeOnDblclick: false });
    cropperRef.current = c; setCropperReady(true);
    return () => { try { c.destroy(); } catch {} };
  }, [imageLoaded, aspectRatio]);

  const handleCrop = async () => {
    const c = cropperRef.current; if (!c) return;
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
  const completeTask = (type) => { if (tasks[type]) return; setTasks((prev) => ({ ...prev, [type]: true })); setTimeLeft((prev) => Math.max(0, prev - 60)); };
  const claimTreasure = () => { if (timeLeft > 0 || isClaimed) return; setIsClaimed(true); onClaimCoins?.(500); setNotice('Treasure Box opened! You received 500 Coins.'); };
  return (
    <div className="fixed inset-0 z-[2000] bg-black/75 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-[430px] bg-[#0c0c10] border-t border-[#333] rounded-t-3xl p-5 text-white max-h-[85vh] overflow-y-auto no-scrollbar pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" /><h2 className="text-xl font-extrabold text-center mb-1">Daily Task</h2>
        <p className="text-center text-[#9aa3c7] text-xs mb-5">Spend time in the Voice Room to unlock the Treasure Box</p>
        {notice && <div className="mb-4 p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-bold text-center">{notice}</div>}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <div className="flex flex-col items-center opacity-40"><div className="text-3xl mb-1 grayscale">📦</div><span className="text-[10px]">Claimed</span></div>
          <div className="flex flex-col items-center opacity-40"><div className="text-3xl mb-1 grayscale">📦</div><span className="text-[10px]">Claimed</span></div>
          <Btn className="flex flex-col items-center cursor-pointer" onClick={claimTreasure}><div className={`text-3xl mb-1 ${timeLeft === 0 ? 'animate-bounce' : ''}`}>{timeLeft === 0 ? '🎁' : '📦'}</div><span className={`text-[10px] font-bold tabular-nums ${timeLeft === 0 ? 'text-[#f5c542]' : 'text-[#7ee7ff]'}`}>{isClaimed ? 'Claimed' : timeLeft === 0 ? 'Claim' : formatCountdown(timeLeft)}</span></Btn>
          <div className="flex flex-col items-center"><div className="text-3xl mb-1">🎁</div><span className="text-[10px] text-[#ff4d9a] font-bold">VIP Only</span></div>
          <div className="flex flex-col items-center opacity-40"><div className="text-3xl mb-1 grayscale">📦</div><span className="text-[10px]">Preparing</span></div>
          <div className="flex flex-col items-center opacity-40"><div className="text-3xl mb-1 grayscale">📦</div><span className="text-[10px]">Preparing</span></div>
          <div className="flex flex-col items-center opacity-40"><div className="text-3xl mb-1 grayscale">📦</div><span className="text-[10px]">Preparing</span></div>
          <div className="flex flex-col items-center"><div className="text-3xl mb-1">🎁</div><span className="text-[10px] text-[#ff4d9a] font-bold">VIP Only</span></div>
        </div>
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
  const handleStart = (e) => { setIsDragging(true); const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX; const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY; setOffset({ x: clientX - pos.x, y: clientY - pos.y }); };
  const handleMove = (e) => { if (!isDragging) return; const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX; const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY; setPos({ x: clientX - offset.x, y: clientY - offset.y }); };
  const handleEnd = () => setIsDragging(false);
  return ( <Btn aria-label="Open Super Admin Dashboard" className="fixed z-[100] w-14 h-14 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(255,215,0,0.6)] border-2 border-yellow-200 cursor-grab active:cursor-grabbing touch-none" style={{ left: pos.x, top: pos.y, transition: isDragging ? 'none' : 'all 0.2s' }} onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd} onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd} onClick={() => { if (!isDragging) onClick(); }}>👑</Btn> );
};

const AdminDashboard = ({ onClose, onNotice }) => {
  const [activeMenu, setActiveMenu] = useState('gifts');
  const [currentGifts, setCurrentGifts] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  
  // Titles state
  const [titles, setTitles] = useState([]);
  const [newTitle, setNewTitle] = useState({ text: '', color: '#ff4d9a', emoji: '👑' });
  const [assignUserId, setAssignUserId] = useState('');
  const [assignTitleId, setAssignTitleId] = useState('');
  const [assignDuration, setAssignDuration] = useState('permanent');

  useEffect(() => {
    const unsubGifts = db.collection('settings').doc('gifts').onSnapshot((doc) => {
      if (doc.exists && doc.data()?.list) setCurrentGifts(doc.data().list); else setCurrentGifts(DEFAULT_GIFTS);
    });
    const unsubTitles = db.collection('settings').doc('titles').onSnapshot((doc) => {
      if (doc.exists && doc.data()?.list) setTitles(doc.data().list); else setTitles([]);
    });
    return () => { unsubGifts(); unsubTitles(); };
  }, []);

  const handleSaveGifts = async () => { try { await db.collection('settings').doc('gifts').set({ list: currentGifts }); onNotice('Gifts updated!'); } catch (e) { onNotice(`Error: ${errMsg(e)}`); } };
  const handleSaveTitles = async (newList) => {
    try { await db.collection('settings').doc('titles').set({ list: newList }); setTitles(newList); onNotice('Titles updated!'); } catch (e) { onNotice(`Error: ${errMsg(e)}`); }
  };
  
  const handleFileUpload = async (e, idx, fileType) => {
    const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
    if (file.size > 5 * 1024 * 1024) return onNotice('File under 5MB.');
    setUploadingMedia(true);
    try {
      const snapshot = await storage.ref(`gifts/${Date.now()}_${file.name}`).put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      const n = [...currentGifts]; n[idx] = { ...n[idx], [fileType]: downloadURL };
      if (fileType === 'i') n[idx].type = file.type.startsWith('video') ? 'video' : 'image';
      setCurrentGifts(n); onNotice('File uploaded!');
    } catch (err) { onNotice(`Upload failed: ${errMsg(err)}`); }
    setUploadingMedia(false);
  };

  const createTitle = () => {
    if (!newTitle.text) return onNotice('Enter title text');
    const newList = [...titles, { id: Date.now().toString(), ...newTitle }];
    handleSaveTitles(newList);
    setNewTitle({ text: '', color: '#ff4d9a', emoji: '👑' });
  };

  const assignTitleToUser = async () => {
    if (!assignUserId || !assignTitleId) return onNotice('Enter User ID and select Title');
    try {
      const userSnap = await db.collection('users').where('displayId', '==', assignUserId).get();
      if (userSnap.empty) return onNotice('User not found!');
      const targetUid = userSnap.docs[0].id;
      const t = titles.find(x => x.id === assignTitleId);
      if (!t) return onNotice('Title not found!');

      let expiresAt = null;
      const now = Date.now();
      if (assignDuration === '1d') expiresAt = now + 86400000;
      else if (assignDuration === '3d') expiresAt = now + 3 * 86400000;
      else if (assignDuration === '7d') expiresAt = now + 7 * 86400000;
      else if (assignDuration === '30d') expiresAt = now + 30 * 86400000;

      const userRef = uDoc(targetUid);
      const doc = await userRef.get();
      const existing = doc.data()?.titles || [];
      const updatedTitles = [...existing.filter(x => x.id !== t.id), { ...t, expiresAt }];

      await userRef.update({ titles: updatedTitles });
      onNotice('Title assigned successfully!');
    } catch (e) { onNotice(`Error: ${errMsg(e)}`); }
  };

  return (
    <div className="fixed inset-0 bg-[#000000] z-[5000] flex flex-col text-white">
      <div className="flex justify-between items-center p-4 border-b border-white/10 shrink-0">
        <h1 className="text-xl font-bold text-yellow-500">👑 Admin Dashboard</h1>
        <Btn onClick={onClose} className="text-2xl font-bold text-slate-400 hover:text-white">×</Btn>
      </div>
      <div className="flex gap-2 p-4 border-b border-white/10 shrink-0 overflow-x-auto no-scrollbar">
        <Btn onClick={() => setActiveMenu('gifts')} className={`flex-1 py-2 px-4 whitespace-nowrap rounded-lg font-bold ${activeMenu === 'gifts' ? 'bg-[var(--color-rose)]' : 'bg-[#0c0c10]'}`}>🎁 Gifts</Btn>
        <Btn onClick={() => setActiveMenu('titles')} className={`flex-1 py-2 px-4 whitespace-nowrap rounded-lg font-bold ${activeMenu === 'titles' ? 'bg-[var(--color-rose)]' : 'bg-[#0c0c10]'}`}>🏷️ Titles</Btn>
      </div>
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {activeMenu === 'gifts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-slate-400">Manage Gifts</p>
              <Btn onClick={() => setCurrentGifts([...currentGifts, { i: '🎁', n: 'New', p: 100, anim: 'float', sound: '', type: 'emoji' }])} className="bg-green-600 px-3 py-1.5 rounded text-sm font-bold">+ Add</Btn>
            </div>
            {currentGifts.map((g, idx) => (
              <div key={idx} className="bg-[#0c0c10] p-3 rounded-xl border border-white/10 space-y-3 relative">
                <Btn onClick={() => setCurrentGifts(currentGifts.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 font-bold text-lg z-10">×</Btn>
                <div className="flex gap-2 pr-6">
                  <div className="w-20"><div className="w-full h-12 bg-black border border-white/15 rounded flex items-center justify-center text-2xl">{g.type === 'image' ? <img src={g.i} className="w-full h-full object-contain" /> : g.type === 'video' ? <video src={g.i} className="w-full h-full object-contain" /> : g.i}</div></div>
                  <div className="flex-1"><label className={C_LBL_XS}>Name</label><input type="text" value={g.n} onChange={(e) => { const n = [...currentGifts]; n[idx].n = e.target.value; setCurrentGifts(n); }} className={C_INP_SM} /></div>
                  <div className="w-16"><label className={C_LBL_XS}>Price</label><input type="number" value={g.p} onChange={(e) => { const n = [...currentGifts]; n[idx].p = Number(e.target.value); setCurrentGifts(n); }} className={C_INP_SM} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={C_LBL_XS}>Emoji</label><input type="text" value={g.type === 'emoji' ? g.i : ''} onChange={(e) => { const n = [...currentGifts]; n[idx].i = e.target.value; n[idx].type = 'emoji'; setCurrentGifts(n); }} className={C_INP_SM} /></div>
                  <div><label className={C_LBL_XS}>Upload</label><input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, idx, 'i')} className="w-full text-xs text-slate-400" /></div>
                </div>
              </div>
            ))}
            <Btn onClick={handleSaveGifts} disabled={uploadingMedia} className="w-full bg-[var(--color-rose)] py-3 rounded-xl font-bold mt-4 disabled:opacity-50">{uploadingMedia ? 'Uploading...' : 'Save Gifts'}</Btn>
          </div>
        )}
        {activeMenu === 'titles' && (
          <div className="space-y-6">
            <div className="bg-[#0c0c10] p-4 rounded-xl border border-white/10">
              <h3 className="font-bold mb-3">Create Custom Title</h3>
              <div className="flex gap-2 mb-3">
                <input type="text" placeholder="Emoji" value={newTitle.emoji} onChange={(e) => setNewTitle({...newTitle, emoji: e.target.value})} className="w-16 bg-black border border-white/15 rounded px-2 py-1.5 text-center text-sm" />
                <input type="text" placeholder="Title Text" value={newTitle.text} onChange={(e) => setNewTitle({...newTitle, text: e.target.value})} className="flex-1 bg-black border border-white/15 rounded px-2 py-1.5 text-sm" />
                <input type="color" value={newTitle.color} onChange={(e) => setNewTitle({...newTitle, color: e.target.value})} className="w-10 h-8 rounded bg-transparent" />
              </div>
              <Btn onClick={createTitle} className="w-full bg-green-600 py-2 rounded font-bold text-sm">+ Create Title</Btn>
            </div>

            <div className="bg-[#0c0c10] p-4 rounded-xl border border-white/10">
              <h3 className="font-bold mb-3">Assign Title to User</h3>
              <input type="text" placeholder="User ID" value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)} className="w-full bg-black border border-white/15 rounded px-2 py-1.5 text-sm mb-2" />
              <select value={assignTitleId} onChange={(e) => setAssignTitleId(e.target.value)} className="w-full bg-black border border-white/15 rounded px-2 py-1.5 text-sm mb-2">
                <option value="">Select Title</option>
                {titles.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.text}</option>)}
              </select>
              <select value={assignDuration} onChange={(e) => setAssignDuration(e.target.value)} className="w-full bg-black border border-white/15 rounded px-2 py-1.5 text-sm mb-3">
                <option value="permanent">Permanent</option><option value="1d">24 Hours</option><option value="3d">3 Days</option><option value="7d">7 Days</option><option value="30d">30 Days</option>
              </select>
              <Btn onClick={assignTitleToUser} className="w-full bg-blue-600 py-2 rounded font-bold text-sm">Assign Title</Btn>
            </div>

            <div>
              <h3 className="font-bold mb-2">Available Titles</h3>
              <div className="flex flex-wrap gap-2">
                {titles.map(t => (
                  <div key={t.id} className="bg-[#0c0c10] border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <span className="text-sm">{t.emoji} <span style={{ color: t.color }}>{t.text}</span></span>
                    <button onClick={() => handleSaveTitles(titles.filter(x => x.id !== t.id))} className="text-red-500 font-bold ml-2">×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HomeTab = ({ userProfile, setActiveTab, openProfile, onNotice }) => {
  const isAdmin = userProfile?.displayId === ADMIN_DISPLAY_ID;
  const comingSoon = () => onNotice('Under Maintenance!');
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
          <h2 className="text-white font-black text-2xl mb-1">World Star Event</h2><p className="text-pink-100 text-xs mb-3">Join now and win exciting rewards!</p><span className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full w-fit">Join Now</span>
        </Btn>
      </div>
      <div className="px-4 grid grid-cols-4 gap-3 mb-8">
        <Btn onClick={comingSoon} className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-2xl bg-[#0c0c10] border border-white/10 flex items-center justify-center text-2xl">👑</div><span className="text-[11px] font-semibold text-slate-300">Ranking</span></Btn>
        <Btn onClick={comingSoon} className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-2xl bg-[#0c0c10] border border-white/10 flex items-center justify-center text-2xl">📋</div><span className="text-[11px] font-semibold text-slate-300">Tasks</span></Btn>
        <Btn onClick={() => setActiveTab('voice')} className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-2xl bg-[#0c0c10] border border-white/10 flex items-center justify-center text-2xl">🎤</div><span className="text-[11px] font-semibold text-slate-300">Rooms</span></Btn>
        <Btn onClick={() => setActiveTab('chats')} className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-2xl bg-[#0c0c10] border border-white/10 flex items-center justify-center text-2xl">👥</div><span className="text-[11px] font-semibold text-slate-300">Friends</span></Btn>
      </div>
    </div>
  );
};

const LoginScreen = ({ onNotice }) => {
  const [loading, setLoading] = useState(false);
  const loginWith = async (provider) => {
    if (provider === 'Google') {
      if (loading) return; setLoading(true);
      try { const result = await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); onNotice(`✅ Welcome!`); } catch (e) { onNotice(`❌ ${errMsg(e)}`); } finally { setLoading(false); }
      return;
    }
    onNotice(`🚧 ${provider} Coming Soon!`);
  };
  return (
    <div className="fixed inset-0 bg-[#f1f5f9] flex justify-center overflow-hidden" style={{ colorScheme: 'light' }}>
      <div className="relative w-full max-w-[450px] bg-[#ffffff] text-[#1a1a2e] h-[100dvh] flex flex-col overflow-hidden sm:shadow-2xl">
        <div className="flex-1 flex flex-col items-center justify-center pt-14 pb-5 px-6">
          <div className="relative w-[110px] h-[110px] rounded-[28px] shadow-lg mb-5 overflow-hidden bg-gradient-to-br from-[#ff4d9a] via-[#a855f7] to-[#3b82f6] flex items-center justify-center shrink-0"><span className="text-5xl">⭐</span></div>
          <h1 className="text-[32px] font-extrabold text-[#1a1a2e] mb-2 leading-tight">World Star</h1><p className="text-[16px] text-[#555555]">Party Game &amp; Voice Chat</p>
        </div>
        <div className="px-[25px] pt-5 pb-8 flex flex-col gap-[15px]">
          <Btn onClick={() => loginWith('Google')} disabled={loading} className="w-full py-[15px] px-4 rounded-[30px] border border-[#e0e0e0] bg-[#ffffff] text-[16px] font-semibold flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98] disabled:opacity-60 min-h-[52px]">
            <svg className="w-[22px] h-[22px] shrink-0" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>
            <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
          </Btn>
        </div>
      </div>
    </div>
  );
};

const VoiceRoomTab = ({ user, userProfile, onJoinRoom, onNotice }) => {
  const [rooms, setRooms] = useState([]); const [subView, setSubView] = useState('list'); const [passwordPromptRoom, setPasswordPromptRoom] = useState(null); const [enteredPass, setEnteredPass] = useState('');
  useEffect(() => { const unsub = db.collection('voiceRooms').orderBy('createdAt', 'desc').onSnapshot((snap) => setRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() })))); return () => unsub(); }, []);
  const handleJoinClick = (room) => { if (room.hasPassword && room.password) { setPasswordPromptRoom(room); setEnteredPass(''); return; } onJoinRoom(room.id); };
  if (subView === 'create') return <CreateRoomForm user={user} userProfile={userProfile} onClose={() => setSubView('list')} onAdvanced={() => setSubView('advanced')} onJoin={onJoinRoom} onNotice={onNotice} />;
  if (subView === 'advanced') return <AdvancedRoomForm user={user} userProfile={userProfile} onClose={() => setSubView('create')} onJoin={onJoinRoom} onNotice={onNotice} />;
  return (
    <div className="pb-4">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h1 className="text-2xl font-extrabold text-white">Voice Rooms</h1>
        <Btn onClick={() => setSubView('create')} className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-blue-500/30 flex items-center gap-1 text-sm"><span>+</span> Create</Btn>
      </div>
      <div className="flex flex-col">
        {rooms.length === 0 ? <p className="text-center py-10 text-slate-400">No rooms active.</p> : rooms.map((room) => (
          <Btn key={room.id} onClick={() => handleJoinClick(room)} className="w-full text-left flex items-center px-5 py-4 border-b border-slate-800 hover:bg-slate-800/50">
            <div className="relative mr-4 shrink-0"><UserAvatar src={room.ownerImg} name={room.ownerName} className="w-14 h-14 rounded-2xl" />{room.hasPassword && <span className="absolute -top-2 -right-2 text-sm bg-black/80 rounded-full p-1 border border-slate-600">🔒</span>}</div>
            <div className="flex-1 min-w-0"><div className="text-base font-semibold text-white mb-1 truncate">{room.title}</div><div className="text-xs text-slate-400">👥 {room.activeMembers?.length || 1} • Host: {room.ownerName}</div></div>
          </Btn>
        ))}
      </div>
      {passwordPromptRoom && (
        <div className={C_MOD_OVL}><div className="bg-[#0c0c10] p-5 rounded-2xl w-full max-w-xs border border-white/15">
          <h3 className="text-base font-bold text-white mb-2">Password</h3>
          <input type="password" placeholder="Password" value={enteredPass} onChange={(e) => setEnteredPass(e.target.value)} className="w-full bg-black border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm mb-3 outline-none" />
          <div className="flex gap-2"><Btn onClick={() => setPasswordPromptRoom(null)} className={C_BTN_S}>Cancel</Btn><Btn onClick={() => { if (enteredPass !== passwordPromptRoom.password) { onNotice('Incorrect!'); return; } const id = passwordPromptRoom.id; setPasswordPromptRoom(null); onJoinRoom(id); }} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold text-sm">Join</Btn></div>
        </div></div>
      )}
    </div>
  );
};

const CreateRoomForm = ({ user, userProfile, onClose, onAdvanced, onJoin, onNotice }) => {
  const [title, setTitle] = useState(''); const [loading, setLoading] = useState(false);
  const handleCreate = async () => {
    if (title.trim().length < 3) return onNotice('Title min 3 chars.');
    setLoading(true);
    try {
      const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
      const newRoom = await db.collection('voiceRooms').add({ title: title.trim(), tag: 'Chats', roomCode, hasPassword: false, ownerId: user.uid, ownerName: userProfile.displayName, ownerImg: userProfile.photoURL, createdAt: FV.serverTimestamp(), activeMembers: [], kicked: {}, blocked: [], mutedUsers: [] });
      onJoin(newRoom.id);
    } catch (err) { onNotice(`Error: ${errMsg(err)}`); }
    setLoading(false);
  };
  return (
    <div className={C_FORM_SCR}>
      <div className={C_FORM_HDR}><Btn onClick={onClose} className="absolute left-5 text-2xl text-slate-400">✕</Btn><h1 className="text-lg font-bold">Create Room</h1></div>
      <div className="p-5 flex-1 overflow-y-auto pb-28">
        <input type="text" placeholder="Room title" className="w-full bg-[#0c0c10] border border-white/15 rounded-xl p-4 text-white outline-none mb-6" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className={C_FORM_FTR}><Btn onClick={handleCreate} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-full">{loading ? 'Creating...' : 'Create Room'}</Btn></div>
    </div>
  );
};

const AdvancedRoomForm = ({ user, userProfile, onClose, onJoin, onNotice }) => {
  const [title, setTitle] = useState(''); const [selectedId, setSelectedId] = useState(null);
  const ids = ['1001', '2005', '8888']; const cost = 1999; const isAdmin = userProfile?.displayId === ADMIN_DISPLAY_ID;
  const handleCreate = async () => {
    if (title.trim().length < 3 || !selectedId) return onNotice('Select ID and enter title.');
    try {
      if (!isAdmin) await uDoc(user.uid).update({ coins: FV.increment(-cost) });
      const newRoom = await db.collection('voiceRooms').add({ title: title.trim(), tag: 'VIP', roomCode: selectedId, isAdvanced: true, ownerId: user.uid, ownerName: userProfile.displayName, ownerImg: userProfile.photoURL, createdAt: FV.serverTimestamp(), activeMembers: [], kicked: {}, blocked: [], mutedUsers: [] });
      onJoin(newRoom.id);
    } catch (err) { onNotice(`Error: ${errMsg(err)}`); }
  };
  return (
    <div className={C_FORM_SCR}>
      <div className={C_FORM_HDR}><Btn onClick={onClose} className="absolute left-5 text-2xl text-slate-400">✕</Btn><h1 className="text-lg font-bold text-yellow-500">Advanced Room</h1></div>
      <div className="p-5 flex-1 overflow-y-auto pb-28">
        <div className="grid grid-cols-3 gap-2 mb-6">{ids.map(id => <Btn key={id} onClick={() => setSelectedId(id)} className={`border-2 rounded-xl p-3 font-bold ${selectedId === id ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 'border-slate-700 text-slate-400'}`}>{id}</Btn>)}</div>
        <input type="text" placeholder="Room title" className="w-full bg-[#0c0c10] border border-white/15 rounded-xl p-4 text-white outline-none" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className={C_FORM_FTR}><Btn onClick={handleCreate} className="w-full bg-yellow-500 text-black font-bold py-3.5 rounded-full">Create for 🪙 1,999</Btn></div>
    </div>
  );
};

const ChatsTab = ({ user, userProfile, openProfile, setCurrentChat, onNotice, demoMode, demoFriends, demoRequests, onDemoAcceptRequest }) => {
  const [friends, setFriends] = useState(demoFriends || []); const [requests, setRequests] = useState(demoRequests || []); const [loading, setLoading] = useState(!demoMode);
  useEffect(() => {
    if (demoMode) { setLoading(false); return; }
    const unsub = db.collection('users').onSnapshot((snap) => {
      const friendsList = []; const reqList = [];
      snap.forEach((doc) => {
        const data = { uid: doc.id, ...doc.data() };
        if (userProfile?.friends?.includes(doc.id)) friendsList.push(data);
        if (userProfile?.requests?.includes(doc.id)) reqList.push(data);
      });
      setFriends(friendsList); setRequests(reqList); setLoading(false);
    });
    return () => unsub();
  }, [demoMode, demoFriends, demoRequests, userProfile]);
  const acceptRequest = async (reqUser) => {
    try {
      await Promise.all([ uDoc(user.uid).update({ friends: FV.arrayUnion(reqUser.uid), requests: FV.arrayRemove(reqUser.uid) }), uDoc(reqUser.uid).update({ friends: FV.arrayUnion(user.uid), sentRequests: FV.arrayRemove(user.uid) }) ]);
      onNotice('Accepted!');
    } catch (err) { onNotice(`Failed!`); }
  };
  const openChat = (u) => setCurrentChat({ chatId: [user.uid, u.uid].sort().join('_'), otherUser: u });
  return (
    <div className="p-4">
      <h1 className="text-2xl font-extrabold text-white mb-6">Chats</h1>
      {requests.length > 0 && <div className="mb-6">
        <h3 className="text-sm font-bold text-yellow-400 mb-2">Requests ({requests.length})</h3>
        {requests.map(req => (
          <div key={req.uid} className="bg-[#0c0c10] p-3 rounded-xl flex items-center justify-between mb-2">
            <div className="flex items-center gap-3"><AvatarDot src={req.photoURL} name={req.displayName} online={isUserOnline(req)} /><p className="font-bold text-sm text-white">{req.displayName}</p></div>
            <Btn onClick={() => acceptRequest(req)} className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full">Accept</Btn>
          </div>
        ))}
      </div>}
      {loading ? <p className="text-center text-white">Loading...</p> : friends.length === 0 ? <p className="text-center text-slate-400">No friends yet.</p> : (
        <ul className="space-y-3">{friends.map((u) => (
          <li key={u.uid}><div className="w-full p-3 bg-[#0c0c10] rounded-xl flex items-center gap-3 border border-white/10">
            <Btn onClick={() => openProfile(u)} className="relative shrink-0"><AvatarDot src={u.photoURL} name={u.displayName} online={isUserOnline(u)} cls="w-12 h-12" dotCls="w-3.5 h-3.5" /></Btn>
            <Btn onClick={() => openChat(u)} className="flex-1 text-left"><p className="font-bold text-white">{u.displayName}</p><p className="text-xs text-slate-400">ID: {u.displayId}</p></Btn>
          </div></li>
        ))}</ul>
      )}
    </div>
  );
};

const ChatRoom = ({ chatData, user, onBack, openProfile, onNotice, demoMode, currentProfile }) => {
  const { chatId, otherUser } = chatData; const [messages, setMessages] = useState([]); const [text, setText] = useState(''); const bottomRef = useRef(null);
  useEffect(() => {
    if (demoMode) { setMessages([{ id: 'd1', type: 'text', text: 'Hey!', senderId: otherUser.uid }]); return; }
    const unsub = db.collection('chats').doc(chatId).collection('messages').orderBy('createdAt', 'asc').onSnapshot((snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
    return () => unsub();
  }, [chatId, demoMode, otherUser.uid]);
  const isAdmin = currentProfile?.displayId === ADMIN_DISPLAY_ID;
  const isBlocked = !canSendDirectMessage(messages, user.uid, otherUser.uid, isAdmin);
  const send = async (e) => {
    e.preventDefault(); if (!text.trim() || isBlocked) return; const t = text; setText('');
    await db.collection('chats').doc(chatId).collection('messages').add({ text: t, type: 'text', senderId: user.uid, createdAt: FV.serverTimestamp() });
  };
  return (
    <div className="fixed inset-0 z-[2000] flex flex-col bg-[#000000] text-white max-w-[430px] mx-auto">
      <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#0c0c10]">
        <Btn onClick={onBack} className="text-2xl font-bold px-2">←</Btn>
        <Btn onClick={() => openProfile(otherUser)}><p className="font-bold">{otherUser?.displayName}</p><OnlineBadge online={isUserOnline(otherUser)} /></Btn>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((m) => { const isMe = m.senderId === user.uid; return (
          <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[75%] p-2 text-[15px] ${isMe ? 'bg-[#ff4d9a] rounded-2xl rounded-br-sm' : 'bg-[#1a1a22] rounded-2xl rounded-bl-sm'}`}>{m.text}</div></div>
        ); })}<div ref={bottomRef} />
      </div>
      {isBlocked ? <div className="p-4 text-center text-red-400 text-sm">Message limit reached.</div> : (
        <form onSubmit={send} className="p-3 bg-[#0c0c10] border-t border-white/10 flex gap-2"><input className="flex-1 bg-black border border-white/15 rounded-full px-4 py-2.5 text-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type..." /><Btn type="submit" className="bg-[#ff4d9a] w-11 h-11 rounded-full font-bold">➤</Btn></form>
      )}
    </div>
  );
};

const MicSeat = ({ label, seatedUser, isMine, isOwnerSeat, isLive, isMutedInRoom, onTake, onLongPressStart, onLongPressEnd }) => {
  const displayName = isMine ? 'You' : seatedUser?.name;
  return (
    <div className="seat-col">
      <Btn aria-label={seatedUser ? `${displayName}` : `Take ${label}`} className={`seat ${isLive ? 'is-live' : ''} ${isOwnerSeat && !isLive ? 'is-owner' : ''}`} onClick={onTake} onMouseDown={seatedUser ? onLongPressStart : undefined} onMouseUp={onLongPressEnd} onMouseLeave={onLongPressEnd} onTouchStart={seatedUser ? onLongPressStart : undefined} onTouchEnd={onLongPressEnd}>
        {seatedUser ? (seatedUser.img ? <img src={seatedUser.img} className="w-full h-full rounded-full object-cover" /> : <span className="you-face">{(seatedUser.name || 'Y').charAt(0).toUpperCase()}</span>) : <PlusIcon />}
        {seatedUser && isOwnerSeat && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs drop-shadow">👑</span>}
      </Btn>
      {seatedUser && <div className="seat-name">{displayName}</div>}
    </div>
  );
};

const playGiftSound = (url) => { if (!url) return; try { const audio = new Audio(url); audio.volume = 0.5; audio.play().catch(() => {}); } catch {} };

const RoomInterface = ({ roomId, user, userProfile, onMinimize, onLeave, onViewProfile, demoMode = false, onUpdateLocalCoins, onDemoGiftReceived }) => {
  const [roomData, setRoomData] = useState(null); const [messages, setMessages] = useState([]); const [inputText, setInputText] = useState(''); const [sheet, setSheet] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); const [giftTargetUser, setGiftTargetUser] = useState(null); const [selectedGift, setSelectedGift] = useState(null);
  const [availableGifts, setAvailableGifts] = useState(DEFAULT_GIFTS); const [giftAnim, setGiftAnim] = useState(null); const [liveCoins, setLiveCoins] = useState(Number(userProfile.coins) || 0);
  const [joinedAt, setJoinedAt] = useState(Date.now()); const lastGiftIdRef = useRef(null); const chatEndRef = useRef(null); const isAdmin = userProfile?.displayId === ADMIN_DISPLAY_ID;
  
  // Ghosting fix
  useEffect(() => {
    const handleUnload = () => {
      if (demoMode || !roomId) return;
      rDoc(roomId).get().then((doc) => {
        if (!doc.exists) return;
        const data = doc.data();
        const res = removeMemberOnLeave(data.activeMembers || [], user.uid, data.ownerId);
        if (res.shouldDeleteRoom) return rDoc(roomId).delete();
        const updates = { activeMembers: res.nextMembers };
        if (res.nextOwner) { updates.ownerId = res.nextOwner.uid; updates.ownerName = res.nextOwner.name; }
        rDoc(roomId).update(updates);
      }).catch(()=>{});
    };
    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') handleUnload(); });
    return () => { window.removeEventListener('beforeunload', handleUnload); };
  }, [roomId, user.uid, demoMode]);

  useEffect(() => {
    if (demoMode) return;
    const roomRef = rDoc(roomId); let joined = false; setJoinedAt(Date.now());
    (async () => {
      const doc = await roomRef.get();
      if (!doc.exists) { onLeave(); return; }
      const data = doc.data();
      const access = checkRoomEntryAccess(data, user.uid);
      if (!access.allowed) { setTimeout(onLeave, 900); return; }
      const updatedMembers = joinMemberToRoom(data.activeMembers || [], { uid: user.uid, name: userProfile.displayName, img: userProfile.photoURL }, data.ownerId);
      await roomRef.update({ activeMembers: updatedMembers, [`kicked.${user.uid}`]: FV.delete() });
      joined = true;
    })();
    const unsubRoom = roomRef.onSnapshot((doc) => {
      if (!doc.exists) { onLeave(); return; }
      const data = { id: doc.id, ...doc.data() };
      if (data.blocked?.includes(user.uid)) { onLeave(); return; }
      setRoomData(data);
      if (data.latestGift && data.latestGift.animId !== lastGiftIdRef.current) {
        lastGiftIdRef.current = data.latestGift.animId;
        setGiftAnim(data.latestGift); playGiftSound(data.latestGift.sound);
        setTimeout(() => setGiftAnim(null), 3500);
      }
    });
    const unsubMsg = roomRef.collection('messages').orderBy('createdAt', 'asc').onSnapshot((snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => { unsubRoom(); unsubMsg(); if (joined) { /* cleanup on react unmount */ } };
  }, [roomId, user.uid, demoMode]);

  const sendGift = async (gift) => {
    const target = giftTargetUser || roomData?.activeMembers?.find((m) => m.uid !== user.uid) || roomData?.activeMembers?.[0];
    if (!gift || !target) return;
    if (!isAdmin && liveCoins < gift.p) return alert('Not enough coins!');
    const { charmsEarned, coinsEarned } = calculateGiftRewards(gift.p);
    const giftRecord = { giftId: gift.id, giftName: gift.n, giftIcon: gift.i, giftType: gift.type || 'emoji' };
    if (!isAdmin) await uDoc(user.uid).update({ coins: FV.increment(-gift.p) });
    await uDoc(target.uid).collection('receivedGifts').add({ ...giftRecord, count: 1, charms: charmsEarned, senderUid: user.uid, senderName: userProfile.displayName, senderImg: userProfile.photoURL || '', createdAt: FV.serverTimestamp() });
    await uDoc(target.uid).update({ charms: FV.increment(charmsEarned), coins: FV.increment(coinsEarned) });
    await rDoc(roomId).update({ latestGift: { ...gift, animId: Date.now(), senderName: userProfile.displayName } });
    setSheet(null);
  };

  if (!roomData) return <div className="room flex items-center justify-center text-white">Joining...</div>;
  const seatedUsers = Array(10).fill(null);
  roomData.activeMembers?.forEach((m) => { if (m.seatIndex !== null && m.seatIndex !== undefined && m.seatIndex >= 0 && m.seatIndex < 10) seatedUsers[m.seatIndex] = m; });
  const renderSeat = (index, label) => <MicSeat key={index} label={label} seatedUser={seatedUsers[index]} isMine={seatedUsers[index]?.uid === user.uid} isOwnerSeat={seatedUsers[index]?.uid === roomData.ownerId} isLive={!!seatedUsers[index]} isMutedInRoom={roomData.mutedUsers?.includes(seatedUsers[index]?.uid)} onTake={() => seatedUsers[index] ? (setSelectedUser(seatedUsers[index]), setSheet('profile')) : rDoc(roomId).update({ activeMembers: assignSeatToMember(roomData.activeMembers, user.uid, index) })} />;
  
  const visibleMessages = messages.filter(msg => !msg.createdAt || (toTimestampMillis(msg.createdAt) >= joinedAt));

  return (
    <main className="room">
      <header className="topbar">
        <Btn className="icon-btn" onClick={() => onMinimize({ title: roomData.title })}><ChevronIcon /></Btn>
        <div className="brand"><p className="room-title">{roomData.title}</p></div>
        <div className="tools"><Btn className="count-pill" onClick={() => setSheet(sheet === 'members' ? null : 'members')}>👤 {roomData.activeMembers?.length || 1}</Btn></div>
      </header>
      <div className="stage">
        <div className="board">
          <div className="seat-row">{renderSeat(0, 'Host')}<PulseWave />{renderSeat(1, 'Side')}</div>
          <div className="seat-row"><div className="seat-pair">{renderSeat(2, 'S3')}<PulseWave />{renderSeat(3, 'S4')}</div><div className="seat-pair">{renderSeat(4, 'S5')}<PulseWave />{renderSeat(5, 'S6')}</div></div>
          <div className="seat-row"><div className="seat-pair">{renderSeat(6, 'S7')}<PulseWave />{renderSeat(7, 'S8')}</div><div className="seat-pair">{renderSeat(8, 'S9')}<PulseWave />{renderSeat(9, 'S10')}</div></div>
        </div>
        <div className="chat no-scrollbar">
          {visibleMessages.map((msg) => <p className="line-chat" key={msg.id}><span className="text-[#ff4d9a] mr-1.5">{msg.senderName}:</span>{msg.text}</p>)}
          <div ref={chatEndRef} />
        </div>
      </div>
      <form className="dock" onSubmit={(e) => { e.preventDefault(); if(inputText.trim()) { rDoc(roomId).collection('messages').add({ text: inputText, senderId: user.uid, senderName: userProfile.displayName, createdAt: FV.serverTimestamp() }); setInputText(''); } }}>
        <input className="dock-input" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type..." />
        <Btn className="dock-btn" onClick={() => setSheet('gift')}><GiftIcon /></Btn>
      </form>
      {sheet === 'gift' && <div className="sheet-backdrop" onClick={() => setSheet(null)}><section className="sheet" onClick={e=>e.stopPropagation()}>
        <h2 className="sheet-title">Gifts</h2>
        <div className="gift-grid">{availableGifts.map((gift, idx) => <Btn key={idx} className={`gift-cell ${selectedGift?.n === gift.n ? 'is-selected' : ''}`} onClick={() => setSelectedGift(gift)}><span className="text-2xl">{gift.i}</span><span className="gift-name">{gift.n}</span></Btn>)}</div>
        <Btn disabled={!selectedGift} onClick={() => sendGift(selectedGift)} className="w-full mt-3 bg-[#ff4d9a] py-3 rounded-xl font-bold">Send</Btn>
      </section></div>}
      {giftAnim && <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center"><div className={`gift-anim-${giftAnim.anim || 'float'} flex items-center justify-center`}>{giftAnim.i}</div></div>}
    </main>
  );
};

const Row = ({ icon, label, value, onClick }) => ( <Btn onClick={onClick} className="w-full flex items-center justify-between p-4 border-b border-gray-800/50 text-left min-h-[56px]"><div className="flex items-center gap-3"><span className="text-lg text-gray-400 w-6 text-center">{icon}</span><span className="text-[15px] text-gray-200">{label}</span></div><div className="flex items-center gap-2">{value}<span className="text-gray-600 text-lg">›</span></div></Btn> );
const MenuItem = ({ icon, title, onClick }) => ( <Btn onClick={onClick} className="w-full flex items-center justify-between p-4 border-b border-gray-800 text-left min-h-[54px]"><div className="flex items-center gap-4"><span className="text-xl text-gray-400">{icon}</span><span className="text-[15px] text-gray-200">{title}</span></div><span className="text-gray-600 text-lg">›</span></Btn> );

const ProfileTab = ({ user, userProfile, setUserProfile, setView, onNotice, demoMode }) => {
  const [subView, setSubView] = useState('me'); const [showVisitorModal, setShowVisitorModal] = useState(false); const [activeSheet, setActiveSheet] = useState(null);
  const [tempInput, setTempInput] = useState(''); const [cropTarget, setCropTarget] = useState(null); const [visitors, setVisitors] = useState([]);
  const isSuperAdmin = userProfile?.displayId === ADMIN_DISPLAY_ID; const [availableTitles, setAvailableTitles] = useState([]);

  useEffect(() => { if (!user || demoMode) return; const unsub = db.collection('profileViews').where('visitedUid', '==', user.uid).onSnapshot(snap => { const list = snap.docs.map(d => ({ id: d.id, ...d.data() })); list.sort((a, b) => b.timestamp - a.timestamp); setVisitors(list.slice(0, 20)); }); return () => unsub(); }, [user, demoMode]);
  useEffect(() => { const unsub = db.collection('settings').doc('titles').onSnapshot(doc => { if(doc.exists) setAvailableTitles(doc.data().list || []); }); return () => unsub(); }, []);

  const handleCropDone = async (base64) => {
    const type = cropTarget?.type; setCropTarget(null); if (!type) return;
    if (type === 'dp') { await uDoc(user.uid).update({ photoURL: base64 }); setUserProfile({ ...userProfile, photoURL: base64 }); onNotice('Avatar updated!'); }
    else { await uDoc(user.uid).update({ bannerURL: base64 }); setUserProfile({ ...userProfile, bannerURL: base64 }); onNotice('Banner updated!'); }
  };

  const toggleTitle = async (tId) => {
    const currentActive = userProfile.activeTitles || [];
    const isActive = currentActive.includes(tId);
    const newActive = isActive ? currentActive.filter(id => id !== tId) : [...currentActive, tId];
    await uDoc(user.uid).update({ activeTitles: newActive });
    setUserProfile({ ...userProfile, activeTitles: newActive });
  };

  const renderTitles = () => {
    if (!userProfile.titles || !userProfile.activeTitles) return null;
    const now = Date.now();
    return userProfile.activeTitles.map(tId => {
      const t = userProfile.titles.find(x => x.id === tId);
      if (!t || (t.expiresAt && t.expiresAt < now)) return null;
      return <span key={t.id} className="text-[10px] font-bold px-1.5 py-0.5 rounded mr-1 inline-block mt-1" style={{ color: t.color, textShadow: `0 0 5px ${t.color}`, border: `1px solid ${t.color}` }}>{t.emoji} {t.text}</span>;
    });
  };

  const recentCount = visitors.filter(v => Date.now() - (v.timestamp || 0) < 86400000).length;

  return (
    <div className="w-full h-full bg-[#0b1120] text-white flex flex-col relative overflow-hidden">
      {subView === 'me' && (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
          <div className="relative h-64 shrink-0 bg-slate-800"><BannerCover src={userProfile.bannerURL} />
            <Btn onClick={() => setSubView('edit')} className="absolute top-11 left-5 right-4 flex items-center gap-4 text-left z-10">
              <div className="w-20 h-20 rounded-2xl border-2 border-gray-600 shadow-lg overflow-hidden bg-gray-800 shrink-0"><UserAvatar src={userProfile.photoURL} name={userProfile.displayName} className="w-full h-full object-cover" /></div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-extrabold text-white flex items-center gap-1.5 flex-wrap">{userProfile.displayName} {userProfile.isAdmin && userProfile.showAdminBadge !== false && <span className="bg-purple-500 text-white text-[9px] px-1.5 py-0.5 rounded">Admin</span>}</h1>
                <div className="flex flex-wrap mt-1">{renderTitles()}</div>
                <p className="text-[10px] text-gray-400 mt-1">ID: {userProfile.displayId}</p>
              </div>
            </Btn>
          </div>
          <div className={`mt-2 mx-3 ${C_CARD_ME}`}>
            <Btn onClick={() => setShowVisitorModal(true)} className={C_ROW_B}><span>👁️ Visitors</span><span className="text-green-400">Recent ({recentCount})</span></Btn>
            <MenuItem icon="🏷️" title="My Titles" onClick={() => setActiveSheet('my_titles')} />
            <MenuItem icon="⚙️" title="Settings" onClick={() => setActiveSheet('settings')} />
          </div>
        </div>
      )}
      {subView === 'edit' && (
        <div className="fixed inset-0 max-w-[430px] mx-auto bg-[#0b1120] z-[200] flex flex-col slide-in-right p-4">
          <Btn onClick={() => setSubView('me')} className="text-white text-xl font-bold mb-4">← Back</Btn>
          <div className={C_CARD_ME}><Row icon="👤" label="Nickname" value={userProfile.displayName} onClick={() => { setTempInput(userProfile.displayName || ''); setActiveSheet('nickname'); }} /></div>
        </div>
      )}
      {activeSheet === 'nickname' && (
        <SheetModal zClass="z-[400]" onClose={() => setActiveSheet(null)}>
          <h2 className="text-lg font-bold mb-4 text-white">Edit Nickname</h2>
          <input value={tempInput} onChange={(e) => setTempInput(e.target.value)} className={C_BLK_INP} maxLength={15} />
          <Btn onClick={async () => { await uDoc(user.uid).update({ displayName: tempInput }); setUserProfile({ ...userProfile, displayName: tempInput }); setActiveSheet(null); }} className="w-full bg-pink-500 font-bold py-3 rounded-xl mt-4">Save</Btn>
        </SheetModal>
      )}
      {activeSheet === 'my_titles' && (
        <SheetModal zClass="z-[400]" onClose={() => setActiveSheet(null)}>
          <h2 className="text-lg font-bold mb-4 text-white">My Titles</h2>
          {(!userProfile.titles || userProfile.titles.length === 0) ? <p className="text-slate-400 text-sm">You don't have any titles yet. Admin can assign you one.</p> : userProfile.titles.map(t => {
            const isExpired = t.expiresAt && t.expiresAt < Date.now();
            const isEquipped = userProfile.activeTitles?.includes(t.id);
            return (
              <div key={t.id} className="flex justify-between items-center p-3 border-b border-gray-800">
                <span style={{ color: t.color }} className={`font-bold ${isExpired ? 'opacity-50' : ''}`}>{t.emoji} {t.text} {isExpired && '(Expired)'}</span>
                {!isExpired && <input type="checkbox" checked={isEquipped} onChange={() => toggleTitle(t.id)} className="w-5 h-5 accent-pink-500" />}
              </div>
            );
          })}
          <Btn onClick={() => setActiveSheet(null)} className="w-full bg-gray-800 mt-4 py-3 rounded-xl font-bold">Close</Btn>
        </SheetModal>
      )}
      {showVisitorModal && (
        <SheetModal onClose={() => setShowVisitorModal(false)}>
          <h2 className="text-lg font-bold mb-4 text-white">Visitors</h2>
          {visitors.map(v => (
             <div key={v.id} className="flex items-center justify-between p-3 border-b border-gray-800">
                <div className="flex gap-3 items-center"><UserAvatar src={v.visitorImg} name={v.visitorName} className="w-10 h-10 rounded-full" /><p className="text-white">{v.visitorName}</p></div>
             </div>
          ))}
          <Btn onClick={() => setShowVisitorModal(false)} className="w-full bg-gray-800 mt-4 py-3 rounded-xl font-bold">Close</Btn>
        </SheetModal>
      )}
    </div>
  );
};

const UserProfileView = ({ targetUser, currentUser, currentProfile, onBack, setCurrentChat, onNotice, onSelectProfile, demoMode, demoUsersMap }) => {
  const [user, setUser] = useState(targetUser);
  useEffect(() => {
    if(demoMode) return;
    const unsub = uDoc(targetUser.uid).onSnapshot(doc => { if(doc.exists) setUser({ uid: doc.id, ...doc.data() }); });
    // Visitor tracking
    if (currentUser?.uid !== targetUser.uid) {
       db.collection('profileViews').add({ visitedUid: targetUser.uid, visitorUid: currentUser.uid, visitorName: currentProfile.displayName, visitorImg: currentProfile.photoURL || '', timestamp: Date.now() }).catch(()=>{});
    }
    return () => unsub();
  }, [targetUser.uid, currentUser.uid, demoMode]);

  const isMe = user.uid === currentUser.uid;
  const isFriend = currentProfile?.friends?.includes(user.uid);
  const requestSent = currentProfile?.sentRequests?.includes(user.uid);
  
  const renderTitles = () => {
    if (!user.titles || !user.activeTitles) return null;
    const now = Date.now();
    return user.activeTitles.map(tId => {
      const t = user.titles.find(x => x.id === tId);
      if (!t || (t.expiresAt && t.expiresAt < now)) return null;
      return <span key={t.id} className="text-[10px] font-bold px-1.5 py-0.5 rounded mr-1 inline-block mt-1" style={{ color: t.color, textShadow: `0 0 5px ${t.color}`, border: `1px solid ${t.color}` }}>{t.emoji} {t.text}</span>;
    });
  };

  return (
    <div className="fixed inset-0 bg-[#ffffff] max-w-[430px] mx-auto text-[#1a1a2e] flex flex-col">
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="h-56 bg-slate-200 relative"><BannerCover src={user.bannerURL} /><Btn onClick={onBack} className="absolute top-4 left-4 bg-black/50 text-white w-10 h-10 rounded-full font-bold">←</Btn></div>
        <div className="bg-[#ffffff] rounded-t-3xl -mt-6 relative px-4 pt-4">
          <UserAvatar src={user.photoURL} name={user.displayName} className="w-24 h-24 rounded-full border-4 border-[#ffffff] -mt-14 shadow-md" />
          <h2 className="text-2xl font-extrabold mt-2 flex items-center gap-2">{user.displayName} {user.isAdmin && user.showAdminBadge !== false && <span className="bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded">Admin</span>}</h2>
          <div className="flex flex-wrap mb-2">{renderTitles()}</div>
          <p className="text-sm font-semibold text-slate-600 mb-4 bg-slate-100 px-3 py-1 rounded-lg w-fit">ID: {user.displayId}</p>
        </div>
      </div>
      <div className="absolute bottom-0 w-full bg-[#ffffff] border-t p-3 flex gap-2">
        {isMe ? <Btn className="flex-1 bg-pink-500 text-white rounded-full py-3 font-bold">🎁 Gift</Btn> : (
          <>{!isFriend && !requestSent && <Btn onClick={async () => { await uDoc(currentUser.uid).update({ sentRequests: FV.arrayUnion(user.uid) }); await uDoc(user.uid).update({ requests: FV.arrayUnion(currentUser.uid) }); onBack(); }} className="flex-1 bg-blue-600 text-white rounded-full py-3 font-bold">➕ Add</Btn>}
          {isFriend && <Btn onClick={() => setCurrentChat({ chatId: [currentUser.uid, user.uid].sort().join('_'), otherUser: user })} className="flex-1 bg-pink-500 text-white rounded-full py-3 font-bold">💬 Message</Btn>}</>
        )}
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component { constructor(props) { super(props); this.state = { hasError: false, errorInfo: null }; } static getDerivedStateFromError(error) { return { hasError: true, errorInfo: error.toString() }; } render() { if (this.state.hasError) return <div className="p-5 bg-red-950 text-red-200 h-full font-mono"><h1>App Error:</h1><p>{this.state.errorInfo}</p></div>; return this.props.children; } }

const NavBtn = ({ icon, label, active, onClick }) => ( <Btn onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'text-[var(--color-rose)]' : 'text-slate-500'}`}><span className="text-xl">{icon}</span><span className="text-[10px] font-bold">{label}</span></Btn> );

const DEMO_PROFILE = { uid: 'demo-me', displayName: 'You', photoURL: '', bannerURL: '', email: 'guest@worldstar.local', bio: 'Enjoying.', displayId: '100200300', level: 5, charms: 1200, coins: 1200, friends: ['u1', 'u2'], requests: ['u3'], sentRequests: [], isBanned: false, banExpiresAt: null, isAdmin: false, adminPermissions: [], gender: 'Male', birthday: null, country: { code: 'IN', name: 'India', flag: '🇮🇳' }, priceTag: { id: 'none', name: 'None', icon: '🚫' }, visitorExpiry: null, isOnline: true, lastSeen: Date.now() };

function WorldStarApp() {
  const [user, setUser] = useState(null); const [userProfile, setUserProfile] = useState(null); const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login'); const [activeTab, setActiveTab] = useState('home'); const [currentRoomId, setCurrentRoomId] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false); const [roomDetails, setRoomDetails] = useState(null); const [currentChat, setCurrentChat] = useState(null); const [viewingProfile, setViewingProfile] = useState(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false); const [globalNotice, setGlobalNotice] = useState(null);

  const showNotice = (msg) => { setGlobalNotice(msg); setTimeout(() => setGlobalNotice(null), 2800); };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      try {
        if (u) {
          setUser(u);
          const docRef = uDoc(u.uid);
          const doc = await docRef.get();
          if (!doc.exists) {
            const adminSnap = await db.collection('users').where('displayId', '==', ADMIN_DISPLAY_ID).get();
            let defaultFriends = []; if (!adminSnap.empty) defaultFriends.push(adminSnap.docs[0].id);
            const newData = {
              displayName: u.displayName?.substring(0, 15) || 'User', photoURL: u.photoURL || '', bannerURL: '', email: u.email || '', bio: 'Hey there!', uid: u.uid, displayId: Math.floor(100000000 + Math.random() * 900000000).toString(),
              level: 1, charms: 0, coins: 0, friends: defaultFriends, requests: [], sentRequests: [], isBanned: false, banExpiresAt: null, isAdmin: false, adminPermissions: [], gender: 'Male', birthday: null,
              country: { code: 'IN', name: 'India', flag: '🇮🇳' }, priceTag: { id: 'none', name: 'None', icon: '🚫' }, visitorExpiry: null, isOnline: true, lastSeen: Date.now(), titles: [], activeTitles: [], showAdminBadge: true
            };
            await docRef.set({ ...newData, createdAt: FV.serverTimestamp() });
            setUserProfile(newData);
          } else {
            const data = doc.data();
            await docRef.update({ isOnline: true, lastSeen: Date.now() }).catch(() => {});
            setUserProfile({ ...data, isOnline: true, lastSeen: Date.now(), coins: Number(data.coins) || 0, charms: Number(data.charms) || 0 });
          }
          setView('app');
        } else { setUser(null); setUserProfile(null); setView('login'); }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center bg-[#000000] text-[var(--color-rose)] font-bold text-xl">Loading...</div>;
  if (view === 'login') return <><{globalNotice && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9000] px-4 py-2 rounded-xl bg-[#2a2a32] text-white text-xs font-bold shadow-xl">{globalNotice}</div>}<LoginScreen onNotice={showNotice} /></>;

  return (
    <>
      {globalNotice && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9000] px-4 py-2 rounded-xl bg-[#2a2a32] text-white text-xs font-bold shadow-xl">{globalNotice}</div>}
      {currentRoomId && user && userProfile && (
        <div className={isMinimized ? 'hidden' : 'block w-full h-full'}>
          <RoomInterface roomId={currentRoomId} user={user} userProfile={userProfile} onMinimize={(d) => { setRoomDetails(d); setIsMinimized(true); }} onLeave={() => { setCurrentRoomId(null); setIsMinimized(false); setRoomDetails(null); }} onViewProfile={(t) => setViewingProfile(t)} />
        </div>
      )}
      {(!currentRoomId || isMinimized) && user && userProfile && (
        <div className="fixed inset-0 bg-[#000000] text-white flex flex-col max-w-[430px] mx-auto h-[100dvh]">
          <div className="flex-1 overflow-y-auto pb-2">
            {activeTab === 'home' && <HomeTab user={user} userProfile={userProfile} setActiveTab={setActiveTab} openProfile={(p) => setViewingProfile(p)} onNotice={showNotice} />}
            {activeTab === 'voice' && <VoiceRoomTab user={user} userProfile={userProfile} onJoinRoom={(id) => { setCurrentRoomId(id); setIsMinimized(false); }} onNotice={showNotice} />}
            {activeTab === 'chats' && <ChatsTab user={user} userProfile={userProfile} openProfile={(p) => setViewingProfile(p)} setCurrentChat={setCurrentChat} onNotice={showNotice} />}
            {activeTab === 'me' && <ProfileTab user={user} userProfile={userProfile} setUserProfile={setUserProfile} setView={setView} onNotice={showNotice} />}
          </div>
          {isMinimized && roomDetails && (
            <div className="absolute bottom-20 left-4 right-4 bg-[#0c0c10] border border-[var(--color-rose)] text-white p-3 rounded-xl flex justify-between items-center z-50">
              <Btn onClick={() => setIsMinimized(false)} className="font-bold text-sm">Live Room: {roomDetails.title}</Btn>
              <Btn onClick={() => { setCurrentRoomId(null); setIsMinimized(false); }} className="bg-[#ff2a45] w-7 h-7 rounded-full font-bold text-xs">✕</Btn>
            </div>
          )}
          <nav className="w-full h-16 bg-[#0c0c10] border-t border-white/10 flex justify-around items-center px-2 z-50 shrink-0">
            <NavBtn icon="🎮" label="World" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <NavBtn icon="🎤" label="Voice" active={activeTab === 'voice'} onClick={() => setActiveTab('voice')} />
            <NavBtn icon="💬" label="Chats" active={activeTab === 'chats'} onClick={() => setActiveTab('chats')} />
            <NavBtn icon="👤" label="Me" active={activeTab === 'me'} onClick={() => setActiveTab('me')} />
          </nav>
          {userProfile?.displayId === ADMIN_DISPLAY_ID && !showAdminDashboard && <DraggableAdminBtn onClick={() => setShowAdminDashboard(true)} />}
        </div>
      )}
      {currentChat && user && <ChatRoom chatData={currentChat} user={user} currentProfile={userProfile} onBack={() => setCurrentChat(null)} openProfile={(p) => setViewingProfile(p)} onNotice={showNotice} />}
      {viewingProfile && user && userProfile && <div className="fixed inset-0 z-[3000]"><UserProfileView targetUser={viewingProfile} currentUser={user} currentProfile={userProfile} onBack={() => setViewingProfile(null)} setCurrentChat={setCurrentChat} onNotice={showNotice} onSelectProfile={(p) => setViewingProfile(p)} /></div>}
      {showAdminDashboard && <AdminDashboard onClose={() => setShowAdminDashboard(false)} onNotice={showNotice} />}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><WorldStarApp /></ErrorBoundary>);
