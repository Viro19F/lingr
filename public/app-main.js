/* ==========================================
   LINGER APP — Main JavaScript
   ========================================== */

const API = '';
const COLORS = ['#6C63FF','#FF6B6B','#4ECDC4','#FFE66D','#A8E6CF','#FF8A8A','#8B85FF','#F093FB','#F97316','#06B6D4'];

let allProfiles = [];
let swipeIndex = 0;
let currentMatchId = null;
let currentChatPartner = null;
let touchStartX = 0, touchStartY = 0, touchDeltaX = 0;
let isDragging = false;

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 30000);
  setGreeting();
  loadStats();
  loadDailyPrompt();
  loadAllProfiles();
  loadAppMatches();
  loadChatList();
  loadAppPrompts();

  // Keyboard support for chat
  document.getElementById('chatConvInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendChatMessage();
  });
});

// ---- CLOCK & GREETING ----
function updateClock() {
  const now = new Date();
  document.getElementById('statusTime').textContent =
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function setGreeting() {
  const h = new Date().getHours();
  let g = 'Good evening';
  if (h < 12) g = 'Good morning';
  else if (h < 18) g = 'Good afternoon';
  document.getElementById('greetingText').textContent = g;
}

// ---- VIEW SWITCHING ----
function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${name}`).classList.add('active');

  document.querySelectorAll('.bottom-nav__item').forEach(b => b.classList.remove('active'));
  const navBtn = document.querySelector(`.bottom-nav__item[data-view="${name}"]`);
  if (navBtn) navBtn.classList.add('active');

  if (name === 'discover' && allProfiles.length && !document.querySelector('.swipe-card')) {
    buildSwipeStack();
  }
}

// ---- STATS ----
async function loadStats() {
  try {
    const res = await fetch(`${API}/api/stats`);
    const s = await res.json();
    animateNumber('statUsers', s.users);
    animateNumber('statMatches', s.matches);
    animateNumber('statMessages', s.messages);
    animateNumber('statLangs', s.languages);
    document.getElementById('profileMatches').textContent = s.matches;
    document.getElementById('profileMessages').textContent = s.messages;
  } catch (e) {}
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  let current = 0;
  const step = Math.max(1, Math.floor(target / 20));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current;
  }, 30);
}

// ---- DAILY PROMPT ----
async function loadDailyPrompt() {
  try {
    const res = await fetch(`${API}/api/prompts/random`);
    const p = await res.json();
    const el = document.getElementById('dailyPrompt');
    el.querySelector('.daily-prompt__category').textContent = p.category;
    el.querySelector('.daily-prompt__text').textContent = `"${p.text_en}"`;
    el.dataset.text = p.text_en;
  } catch (e) {}
}

function copyDailyPrompt() {
  const text = document.getElementById('dailyPrompt').dataset.text;
  if (text) {
    navigator.clipboard.writeText(text);
    showToast('Prompt copied!');
  }
}

// ==========================================
// DISCOVER / SWIPE
// ==========================================
async function loadAllProfiles() {
  try {
    const res = await fetch(`${API}/api/profiles`);
    allProfiles = await res.json();
  } catch (e) {}
}

function buildSwipeStack() {
  const stack = document.getElementById('swipeStack');
  const empty = document.getElementById('swipeEmpty');
  stack.innerHTML = '';

  const remaining = allProfiles.slice(swipeIndex);
  if (!remaining.length) {
    stack.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  stack.style.display = 'block';
  empty.style.display = 'none';

  // Show top 3 cards (stacked)
  const cardsToShow = remaining.slice(0, 3).reverse();
  cardsToShow.forEach((p, i) => {
    const realIndex = cardsToShow.length - 1 - i;
    const card = createSwipeCard(p, realIndex);
    stack.appendChild(card);
  });

  setupSwipeGestures();
}

function createSwipeCard(profile, stackIndex) {
  const card = document.createElement('div');
  card.className = 'swipe-card';
  card.dataset.profileId = profile.id;
  const color = COLORS[profile.id % COLORS.length];
  const matchPct = 80 + Math.floor(Math.random() * 18);

  const scale = 1 - (stackIndex * 0.04);
  const yOff = stackIndex * 8;
  card.style.transform = `scale(${scale}) translateY(${yOff}px)`;
  card.style.zIndex = 10 - stackIndex;

  card.innerHTML = `
    <div class="swipe-card__bg" style="background:linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -40)} 100%);">
      ${profile.name.charAt(0)}
    </div>
    <div class="swipe-card__gradient"></div>
    <span class="swipe-card__level">${profile.level}</span>
    <span class="swipe-card__match">${matchPct}% match</span>
    <div class="swipe-label swipe-label--like">LIKE</div>
    <div class="swipe-label swipe-label--nope">NOPE</div>
    <div class="swipe-card__info">
      <div class="swipe-card__name">${profile.name}</div>
      <div class="swipe-card__langs">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg>
        ${profile.native_language} → ${profile.learning_language}
      </div>
      <div class="swipe-card__bio">${profile.bio || ''}</div>
      <div class="swipe-card__tags">
        ${(profile.interests || '').split(',').map(i => `<span>${i.trim()}</span>`).join('')}
      </div>
    </div>
  `;

  return card;
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

function setupSwipeGestures() {
  const topCard = document.querySelector('.swipe-card:last-child');
  if (!topCard) return;

  topCard.addEventListener('pointerdown', onPointerDown);
  topCard.addEventListener('pointermove', onPointerMove);
  topCard.addEventListener('pointerup', onPointerUp);
  topCard.addEventListener('pointercancel', onPointerUp);
}

function onPointerDown(e) {
  isDragging = true;
  touchStartX = e.clientX;
  touchStartY = e.clientY;
  this.classList.add('swiping');
  this.setPointerCapture(e.pointerId);
}

function onPointerMove(e) {
  if (!isDragging) return;
  touchDeltaX = e.clientX - touchStartX;
  const deltaY = e.clientY - touchStartY;
  const rotate = touchDeltaX * 0.08;

  this.style.transform = `translate(${touchDeltaX}px, ${deltaY * 0.3}px) rotate(${rotate}deg)`;

  // Show like/nope labels
  const likeLabel = this.querySelector('.swipe-label--like');
  const nopeLabel = this.querySelector('.swipe-label--nope');
  if (touchDeltaX > 30) {
    likeLabel.style.opacity = Math.min(1, (touchDeltaX - 30) / 80);
    nopeLabel.style.opacity = 0;
  } else if (touchDeltaX < -30) {
    nopeLabel.style.opacity = Math.min(1, (-touchDeltaX - 30) / 80);
    likeLabel.style.opacity = 0;
  } else {
    likeLabel.style.opacity = 0;
    nopeLabel.style.opacity = 0;
  }
}

function onPointerUp(e) {
  if (!isDragging) return;
  isDragging = false;
  this.classList.remove('swiping');

  const threshold = 100;
  if (touchDeltaX > threshold) {
    swipeAction('connect');
  } else if (touchDeltaX < -threshold) {
    swipeAction('skip');
  } else {
    // Snap back
    this.style.transform = 'scale(1) translateY(0)';
    const likeLabel = this.querySelector('.swipe-label--like');
    const nopeLabel = this.querySelector('.swipe-label--nope');
    if (likeLabel) likeLabel.style.opacity = 0;
    if (nopeLabel) nopeLabel.style.opacity = 0;
  }
  touchDeltaX = 0;
}

function swipeAction(action) {
  const topCard = document.querySelector('.swipe-card:last-child');
  if (!topCard) return;

  const profileId = parseInt(topCard.dataset.profileId);
  const profile = allProfiles.find(p => p.id === profileId);

  if (action === 'connect') {
    topCard.classList.add('exit-right');
    showToast(`Connected with ${profile?.name || 'someone'}!`);
    fetch(`${API}/api/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_a: 1, user_b: profileId })
    }).catch(() => {});
  } else if (action === 'skip') {
    topCard.classList.add('exit-left');
  } else if (action === 'superlike') {
    topCard.classList.add('exit-up');
    showToast(`Super liked ${profile?.name || 'someone'}!`);
    fetch(`${API}/api/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_a: 1, user_b: profileId })
    }).catch(() => {});
  }

  swipeIndex++;

  setTimeout(() => {
    topCard.remove();
    // Reposition remaining cards
    const remaining = document.querySelectorAll('.swipe-card');
    remaining.forEach((c, i) => {
      const ri = remaining.length - 1 - i;
      c.style.transform = `scale(${1 - ri * 0.04}) translateY(${ri * 8}px)`;
      c.style.zIndex = 10 - ri;
    });

    // Add new card at bottom if available
    const nextProfile = allProfiles[swipeIndex + 2];
    if (nextProfile) {
      const stack = document.getElementById('swipeStack');
      const newCard = createSwipeCard(nextProfile, 2);
      stack.insertBefore(newCard, stack.firstChild);
    }

    if (!document.querySelector('.swipe-card')) {
      document.getElementById('swipeStack').style.display = 'none';
      document.getElementById('swipeEmpty').style.display = 'block';
    } else {
      setupSwipeGestures();
    }
  }, 400);
}

function resetSwipe() {
  swipeIndex = 0;
  buildSwipeStack();
}

// ==========================================
// MATCHES
// ==========================================
async function loadAppMatches() {
  try {
    const res = await fetch(`${API}/api/matches/1`);
    const matches = await res.json();

    // New matches (horizontal bubbles)
    const accepted = matches.filter(m => m.status === 'accepted');
    const pending = matches.filter(m => m.status === 'pending');
    document.getElementById('matchCountBadge').textContent = accepted.length;

    const row = document.getElementById('newMatchesRow');
    row.innerHTML = accepted.map((m, i) => {
      const isA = m.user_a === 1;
      const name = isA ? m.user_b_name : m.user_a_name;
      const otherId = isA ? m.user_b : m.user_a;
      return `
        <div class="match-bubble" onclick="openChatWith(${m.id}, ${otherId}, '${name}')">
          <div class="match-bubble__avatar" style="background:${COLORS[(otherId) % COLORS.length]}">${name?.charAt(0) || '?'}</div>
          <span class="match-bubble__name">${name?.split(' ')[0] || 'Unknown'}</span>
        </div>
      `;
    }).join('');

    // All connections
    const list = document.getElementById('connectionsList');
    list.innerHTML = matches.map((m, i) => {
      const isA = m.user_a === 1;
      const name = isA ? m.user_b_name : m.user_a_name;
      const native = isA ? m.user_b_native : m.user_a_native;
      const learning = isA ? m.user_b_learning : m.user_a_learning;
      const otherId = isA ? m.user_b : m.user_a;
      return `
        <div class="connection-card" onclick="openChatWith(${m.id}, ${otherId}, '${name}')">
          <div class="connection-card__avatar" style="background:${COLORS[(otherId) % COLORS.length]}">${name?.charAt(0) || '?'}</div>
          <div class="connection-card__info">
            <div class="connection-card__name">${name || 'Unknown'}</div>
            <div class="connection-card__detail">${native} → ${learning}</div>
          </div>
          <span class="connection-card__status status--${m.status}">${m.status}</span>
        </div>
      `;
    }).join('');
  } catch (e) {}
}

// ==========================================
// CHAT
// ==========================================
async function loadChatList() {
  try {
    const res = await fetch(`${API}/api/matches/1`);
    const matches = await res.json();
    const accepted = matches.filter(m => m.status === 'accepted');

    const chatList = document.getElementById('chatList');
    chatList.innerHTML = accepted.map((m, i) => {
      const isA = m.user_a === 1;
      const name = isA ? m.user_b_name : m.user_a_name;
      const otherId = isA ? m.user_b : m.user_a;
      const online = i < 2;
      return `
        <div class="chat-list-item" onclick="openChatWith(${m.id}, ${otherId}, '${name}')">
          <div class="chat-list-item__avatar ${online ? 'online' : ''}" style="background:${COLORS[(otherId) % COLORS.length]}">${name?.charAt(0) || '?'}</div>
          <div class="chat-list-item__info">
            <div class="chat-list-item__name">
              <span>${name?.split(' ')[0] || 'Unknown'}</span>
              <span>${i === 0 ? '2m ago' : i === 1 ? '1h ago' : 'Yesterday'}</span>
            </div>
            <div class="chat-list-item__preview">Tap to start chatting...</div>
          </div>
          ${i === 0 ? '<div class="chat-list-item__unread">2</div>' : ''}
        </div>
      `;
    }).join('');

    if (!accepted.length) {
      chatList.innerHTML = '<div style="text-align:center;padding:3rem 1rem;color:var(--text-muted);"><p>No conversations yet. Discover people to start chatting!</p></div>';
    }
  } catch (e) {}
}

async function openChatWith(matchId, otherId, name) {
  currentMatchId = matchId;
  currentChatPartner = { id: otherId, name };

  // Switch to chat view
  switchView('chat');

  // Show conversation panel
  document.getElementById('chatListView').style.display = 'none';
  const conv = document.getElementById('chatConversation');
  conv.style.display = 'flex';

  // Set header
  document.getElementById('chatConvAvatar').textContent = name?.charAt(0) || '?';
  document.getElementById('chatConvAvatar').style.background = COLORS[otherId % COLORS.length];
  document.getElementById('chatConvName').textContent = name?.split(' ')[0] || 'Unknown';

  // Load messages
  try {
    const res = await fetch(`${API}/api/messages/${matchId}`);
    const messages = await res.json();
    const container = document.getElementById('chatConvMessages');

    container.innerHTML = messages.map(m => `
      <div class="msg ${m.sender_id === 1 ? 'msg--self' : 'msg--other'}">
        ${m.sender_id !== 1 ? `<div class="msg__sender">${m.sender_name}</div>` : ''}
        ${m.content}
      </div>
    `).join('');

    if (!messages.length) {
      container.innerHTML = `
        <div class="msg msg--prompt">Start a conversation! Tap the star to get a prompt.</div>
      `;
    }

    container.scrollTop = container.scrollHeight;
  } catch (e) {}

  document.getElementById('chatConvInput').focus();
}

function closeChatConversation() {
  document.getElementById('chatConversation').style.display = 'none';
  document.getElementById('chatListView').style.display = 'block';
  currentMatchId = null;
  currentChatPartner = null;
}

async function sendChatMessage() {
  const input = document.getElementById('chatConvInput');
  if (!input.value.trim() || !currentMatchId) return;

  const content = input.value.trim();
  input.value = '';

  // Optimistic UI
  const container = document.getElementById('chatConvMessages');
  const msgEl = document.createElement('div');
  msgEl.className = 'msg msg--self';
  msgEl.textContent = content;
  container.appendChild(msgEl);
  container.scrollTop = container.scrollHeight;

  try {
    await fetch(`${API}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match_id: currentMatchId, sender_id: 1, content, msg_type: 'text' })
    });
  } catch (e) {}

  // Simulate reply after 1.5s
  setTimeout(() => {
    const replies = [
      'Haha that\'s great!',
      'I totally agree!',
      'Tell me more about that!',
      'That sounds amazing!',
      'We should practice together sometime!',
      'Interesting! I never thought of it that way.',
      'Jaja si, es verdad!',
      'Cool! What else do you like?'
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    const replyEl = document.createElement('div');
    replyEl.className = 'msg msg--other';
    replyEl.innerHTML = `<div class="msg__sender">${currentChatPartner?.name || 'User'}</div>${reply}`;
    container.appendChild(replyEl);
    container.scrollTop = container.scrollHeight;
  }, 1200 + Math.random() * 1500);
}

async function insertPrompt() {
  try {
    const res = await fetch(`${API}/api/prompts/random`);
    const p = await res.json();

    // Insert as a prompt bubble
    const container = document.getElementById('chatConvMessages');
    const promptEl = document.createElement('div');
    promptEl.className = 'msg msg--prompt';
    promptEl.textContent = p.text_en;
    container.appendChild(promptEl);
    container.scrollTop = container.scrollHeight;

    // Also put in input
    document.getElementById('chatConvInput').value = p.text_en;
    document.getElementById('chatConvInput').focus();
  } catch (e) {}
}

// ==========================================
// PROMPTS
// ==========================================
async function loadAppPrompts(category) {
  try {
    const url = category && category !== 'all'
      ? `${API}/api/prompts?category=${category}`
      : `${API}/api/prompts`;
    const res = await fetch(url);
    const prompts = await res.json();
    renderAppPrompts(prompts);
  } catch (e) {}
}

function renderAppPrompts(prompts) {
  const list = document.getElementById('appPromptsList');
  list.innerHTML = prompts.map(p => `
    <div class="app-prompt-card" onclick="copyAppPrompt('${p.text_en.replace(/'/g, "\\'")}')">
      <div class="app-prompt-card__cat">${p.category}</div>
      <div class="app-prompt-card__text">"${p.text_en}"</div>
      ${p.text_es ? `<div class="app-prompt-card__es">"${p.text_es}"</div>` : ''}
      <div class="app-prompt-card__footer">
        <span class="app-prompt-card__diff diff--${p.difficulty}">${p.difficulty}</span>
        <span class="app-prompt-card__copy">Tap to copy</span>
      </div>
    </div>
  `).join('');
}

function filterAppPrompts(category, btn) {
  document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadAppPrompts(category);
}

function copyAppPrompt(text) {
  navigator.clipboard.writeText(text);
  showToast('Prompt copied!');
}

// ==========================================
// MODALS
// ==========================================
function showNotifications() {
  document.getElementById('notifModal').classList.add('open');
}

function showFilters() {
  document.getElementById('filterModal').classList.add('open');
}

function applyFilters() {
  document.getElementById('filterModal').classList.remove('open');
  showToast('Filters applied!');
  // Re-shuffle for demo
  allProfiles.sort(() => Math.random() - 0.5);
  swipeIndex = 0;
  buildSwipeStack();
}

// ==========================================
// TOAST
// ==========================================
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}
