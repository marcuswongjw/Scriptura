// Feature module: network (Phase 2) — Community hub UI
import { auth, db } from './firebase.js?v=2.0.32';
import { collection, getDocs, onSnapshot, addDoc, query, orderBy, limit, doc, updateDoc, arrayUnion, arrayRemove } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { modules } from '../modules.js?v=2.0.32';
import { sanitizeHTML, debounce } from './utils.js?v=2.0.32';
import { showToast } from './toast.js?v=2.0.32';
import { el } from './dom.js?v=2.0.32';
import { state } from './state.js?v=2.0.32';
import { checkAdminNavVisibility, saveState, updateHeaderProfile } from './user.js?v=2.0.32';
import { notifyCommunityOfEvent, getNotificationPrefs, setNotificationPrefs } from './notifications.js?v=2.0.32';

/** Prefer stored country; default Singapore for untagged learners. */
export function effectiveCountry(userOrCode) {
  if (!userOrCode) return 'SG';
  if (typeof userOrCode === 'string') {
    return state.countryMetadata[userOrCode] ? userOrCode : 'SG';
  }
  const code = userOrCode.country;
  return code && state.countryMetadata[code] ? code : 'SG';
}

function countryMeta(code) {
  const c = effectiveCountry(code);
  return state.countryMetadata[c] || { name: 'Singapore', flag: '🇸🇬', region: 'Southeast Asia' };
}

function avatarUrl(u) {
  return u.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.uid || 'learner'}`;
}

function completedModuleCount(u) {
  return u.completedModules
    ? u.completedModules.filter(id => modules.some(m => m.id === id)).length
    : 0;
}

function groupUsersByCountry(users) {
  const groups = {};
  users.forEach(u => {
    const code = effectiveCountry(u);
    if (!groups[code]) groups[code] = [];
    groups[code].push(u);
  });
  // Singapore first, then others by count
  return Object.entries(groups).sort((a, b) => {
    if (a[0] === 'SG') return -1;
    if (b[0] === 'SG') return 1;
    return b[1].length - a[1].length;
  });
}

export async function initNetworkViewer() {
  if (!state.networkListenersAttached) {
    document.querySelector('.network-tabs')?.addEventListener('click', e => {
      const item = e.target.closest('.net-nav-item');
      if (item) switchNetworkTab(item.getAttribute('data-net-tab'));
    });

    document.getElementById('network-see-all-people')?.addEventListener('click', () => {
      state.peopleCountryFilter = 'all';
      switchNetworkTab('people');
    });

    if (el.peopleSearch) {
      el.peopleSearch.addEventListener('input', debounce(renderPeopleDirectory, 250));
    }

    if (el.createEventBtn) {
      el.createEventBtn.addEventListener('click', () => el.eventDialog.classList.remove('hidden'));
    }

    if (el.closeEventBtn) {
      el.closeEventBtn.addEventListener('click', () => el.eventDialog.classList.add('hidden'));
    }

    if (el.eventCreateForm) {
      el.eventCreateForm.addEventListener('submit', handleCreateEvent);
    }

    if (el.chatInputForm) {
      el.chatInputForm.addEventListener('submit', handleSendChatMessage);
    }

    state.networkListenersAttached = true;
  }

  // Default profile location when missing
  if (!state.userState.country || !state.countryMetadata[state.userState.country]) {
    state.userState.country = 'SG';
  }
  if (state.peopleCountryFilter == null) state.peopleCountryFilter = 'all';

  await fetchRegisteredUsers();
  updateNetworkView();
  switchNetworkTab(state.currentNetworkTab === 'map' ? 'hub' : (state.currentNetworkTab || 'hub'));
}

export async function fetchRegisteredUsers() {
  try {
    const querySnapshot = await getDocs(query(collection(db, 'users'), limit(100)));
    state.registeredUsers = [];
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      // Skip empty shell docs
      if (!data.email && !data.name && !data.photo) return;
      state.registeredUsers.push({
        uid: docSnap.id,
        ...data
      });
    });
    // Stable sort: name A–Z
    state.registeredUsers.sort((a, b) =>
      (a.name || a.email || '').localeCompare(b.name || b.email || '', undefined, { sensitivity: 'base' })
    );
  } catch (err) {
    console.error('Failed to fetch registered users:', err);
  }
}

export function updateNetworkView() {
  renderHubStats();
  renderYouCard();
  renderLocationCards();
  renderPeoplePreview();
  if (state.currentNetworkTab === 'people') {
    renderPeopleDirectory();
  }
}

function renderHubStats() {
  const totalEl = document.getElementById('network-total-count');
  const locEl = document.getElementById('network-location-count');
  const groups = groupUsersByCountry(state.registeredUsers);
  if (totalEl) totalEl.textContent = String(state.registeredUsers.length);
  if (locEl) locEl.textContent = String(groups.length);
}

function renderYouCard() {
  const card = document.getElementById('network-you-card');
  if (!card) return;
  const code = effectiveCountry(state.userState);
  const meta = countryMeta(code);
  const peers = state.registeredUsers.filter(u => effectiveCountry(u) === code).length;
  card.innerHTML = `
    <div class="you-card-inner">
      <div class="you-card-flag" aria-hidden="true">${meta.flag}</div>
      <div class="you-card-text">
        <p class="you-card-label">Your location</p>
        <h3 class="you-card-title">${sanitizeHTML(meta.name)}</h3>
        <p class="you-card-meta">${peers} learner${peers === 1 ? '' : 's'} nearby · ${sanitizeHTML(meta.region || '')}</p>
      </div>
      <button type="button" class="secondary-btn compact-btn" id="browse-my-location-btn">Browse</button>
    </div>
  `;
  card.querySelector('#browse-my-location-btn')?.addEventListener('click', () => {
    state.peopleCountryFilter = code;
    switchNetworkTab('people');
  });
}

function renderLocationCards() {
  const wrap = document.getElementById('network-location-cards');
  if (!wrap) return;
  const groups = groupUsersByCountry(state.registeredUsers);
  if (groups.length === 0) {
    wrap.innerHTML = `<div class="empty-state soft">No learners yet — invite a friend to join Scriptura.</div>`;
    return;
  }

  wrap.innerHTML = groups.map(([code, users]) => {
    const meta = countryMeta(code);
    const stack = users.slice(0, 4).map(u =>
      `<img class="avatar-stack-img" src="${avatarUrl(u)}" alt="" loading="lazy">`
    ).join('');
    const more = users.length > 4 ? `<span class="avatar-stack-more">+${users.length - 4}</span>` : '';
    const isYours = code === effectiveCountry(state.userState);
    return `
      <button type="button" class="location-card ${isYours ? 'is-yours' : ''}" data-country="${code}">
        <div class="location-card-top">
          <span class="location-flag">${meta.flag}</span>
          ${isYours ? '<span class="location-you-badge">You</span>' : ''}
        </div>
        <div class="location-card-name">${sanitizeHTML(meta.name)}</div>
        <div class="location-card-count">${users.length} learner${users.length === 1 ? '' : 's'}</div>
        <div class="avatar-stack">${stack}${more}</div>
      </button>
    `;
  }).join('');

  wrap.querySelectorAll('.location-card').forEach(btn => {
    btn.addEventListener('click', () => {
      state.peopleCountryFilter = btn.getAttribute('data-country');
      switchNetworkTab('people');
    });
  });
}

function renderPeoplePreview() {
  const row = document.getElementById('network-preview-people');
  if (!row) return;

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let list = state.registeredUsers.filter(u => {
    if (!u.lastActiveDate && !u.lastActiveAt) return true;
    const t = new Date(u.lastActiveAt || u.lastActiveDate).getTime();
    return !Number.isNaN(t) ? t >= weekAgo : true;
  }).slice(0, 8);

  if (list.length === 0) list = state.registeredUsers.slice(0, 8);

  if (list.length === 0) {
    row.innerHTML = `<div class="empty-state soft">No one to show yet.</div>`;
    return;
  }

  row.innerHTML = list.map(u => {
    const meta = countryMeta(u);
    return `
      <button type="button" class="person-chip" data-uid="${u.uid}">
        <img src="${avatarUrl(u)}" alt="" class="person-chip-avatar" loading="lazy">
        <span class="person-chip-name">${sanitizeHTML(u.name || 'Learner')}</span>
        <span class="person-chip-loc">${meta.flag}</span>
      </button>
    `;
  }).join('');

  row.querySelectorAll('.person-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.peopleCountryFilter = 'all';
      switchNetworkTab('people');
    });
  });
}

export function switchNetworkTab(tabId) {
  if (tabId === 'map') tabId = 'hub';
  state.currentNetworkTab = tabId;
  const navItems = document.querySelectorAll('.net-nav-item');
  const subviews = document.querySelectorAll('.net-subview');

  navItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-net-tab') === tabId);
  });
  subviews.forEach(view => {
    const shouldBeActive = view.id === `net-subview-${tabId}`;
    view.classList.toggle('active', shouldBeActive);
    view.classList.toggle('hidden', !shouldBeActive);
  });

  if (tabId === 'hub') {
    updateNetworkView();
  } else if (tabId === 'people') {
    renderPeopleFilterChips();
    renderPeopleDirectory();
  } else if (tabId === 'events') {
    loadEvents();
  } else if (tabId === 'messages') {
    loadChatMessages();
  }
}

function renderPeopleFilterChips() {
  const row = document.getElementById('people-filter-chips');
  if (!row) return;
  const groups = groupUsersByCountry(state.registeredUsers);
  const chips = [
    { id: 'all', label: 'All', flag: '' },
    ...groups.map(([code, users]) => ({
      id: code,
      label: `${countryMeta(code).flag} ${countryMeta(code).name}`,
      count: users.length
    }))
  ];

  row.innerHTML = chips.map(c => {
    const active = (state.peopleCountryFilter || 'all') === c.id;
    const count = c.count != null ? ` · ${c.count}` : '';
    return `<button type="button" class="filter-chip ${active ? 'active' : ''}" data-filter="${c.id}">${c.label}${count}</button>`;
  }).join('');

  row.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.peopleCountryFilter = btn.getAttribute('data-filter');
      renderPeopleFilterChips();
      renderPeopleDirectory();
    });
  });
}

export function renderPeopleDirectory() {
  if (!el.peopleGrid) return;
  el.peopleGrid.innerHTML = '';

  const searchQuery = el.peopleSearch ? el.peopleSearch.value.toLowerCase().trim() : '';
  const countryFilter = state.peopleCountryFilter || 'all';

  const filtered = state.registeredUsers.filter(u => {
    const code = effectiveCountry(u);
    const meta = countryMeta(code);
    if (countryFilter !== 'all' && code !== countryFilter) return false;

    const matchesSearch = !searchQuery ||
      (u.name && u.name.toLowerCase().includes(searchQuery)) ||
      (u.email && u.email.toLowerCase().includes(searchQuery)) ||
      (u.church && u.church.toLowerCase().includes(searchQuery)) ||
      (u.headline && u.headline.toLowerCase().includes(searchQuery)) ||
      (meta.name && meta.name.toLowerCase().includes(searchQuery));

    return matchesSearch;
  });

  const metaEl = document.getElementById('people-results-meta');
  if (metaEl) {
    metaEl.textContent = filtered.length === 0
      ? 'No matches'
      : `${filtered.length} learner${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    el.peopleGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon" aria-hidden="true">🔎</div>
        <p class="empty-state-title">No learners found</p>
        <p class="empty-state-text">Try another search or clear the location filter.</p>
        <button type="button" class="secondary-btn compact-btn" id="clear-people-filters">Clear filters</button>
      </div>`;
    document.getElementById('clear-people-filters')?.addEventListener('click', () => {
      state.peopleCountryFilter = 'all';
      if (el.peopleSearch) el.peopleSearch.value = '';
      renderPeopleFilterChips();
      renderPeopleDirectory();
    });
    return;
  }

  filtered.forEach(u => {
    const isSelf = u.uid === auth.currentUser?.uid;
    const meta = countryMeta(u);
    const modCount = completedModuleCount(u);
    const interestPills = (u.interests || '')
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 4)
      .map(tag => `<span class="interest-pill">${sanitizeHTML(tag)}</span>`)
      .join('');

    const socialLinkHtml = u.social ? `
      <a href="${sanitizeHTML(u.social)}" target="_blank" rel="noopener noreferrer" class="card-social-link">
        Contact
      </a>
    ` : '';

    const html = `
      <article class="user-card premium-user-card ${isSelf ? 'is-self' : ''}">
        <div class="user-card-header">
          <img class="card-avatar" src="${avatarUrl(u)}" alt="" loading="lazy">
          <div class="header-text-block">
            <div class="card-name">
              ${sanitizeHTML(u.name) || 'Learner'}
              ${isSelf ? '<span class="you-pill">You</span>' : ''}
            </div>
            <div class="card-headline">${sanitizeHTML(u.headline) || 'Scriptura learner'}</div>
          </div>
        </div>
        <div class="card-body-section">
          <div class="card-meta-line">
            <span class="card-country-tag">${meta.flag} ${sanitizeHTML(meta.name)}</span>
            ${u.church ? `<span class="card-church-inline">⛪ ${sanitizeHTML(u.church)}</span>` : ''}
          </div>
          ${u.goals ? `<div class="card-goals">${sanitizeHTML(u.goals)}</div>` : ''}
          ${interestPills ? `<div class="card-interests-wrapper">${interestPills}</div>` : ''}
        </div>
        <div class="card-footer-section">
          <div class="card-meta-row">
            <span class="card-badge">🔥 ${u.streak || 0}d</span>
            <span class="card-badge">📖 ${modCount}</span>
          </div>
          ${socialLinkHtml}
        </div>
      </article>
    `;
    el.peopleGrid.insertAdjacentHTML('beforeend', html);
  });
}

// Legacy no-ops kept if anything still calls old map APIs
export function renderMapClusters() {
  renderLocationCards();
}
export function renderDirectoryList() {
  renderLocationCards();
}

export function loadEvents() {
  if (state.unsubscribeEvents) state.unsubscribeEvents();

  const eventsCol = collection(db, 'events');
  state.unsubscribeEvents = onSnapshot(query(eventsCol, orderBy('time', 'asc')), (snapshot) => {
    el.eventsList.innerHTML = '';
    const events = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.title || docSnap.id === 'module_schedules') return;
      events.push({ id: docSnap.id, ...data });
    });

    if (events.length === 0) {
      el.eventsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" aria-hidden="true">📅</div>
          <p class="empty-state-title">No events yet</p>
          <p class="empty-state-text">Schedule a study night or fellowship so others can join.</p>
          <button type="button" class="primary-btn compact-btn" id="empty-schedule-event">Schedule event</button>
        </div>`;
      document.getElementById('empty-schedule-event')?.addEventListener('click', () => {
        el.eventDialog?.classList.remove('hidden');
      });
      return;
    }

    const myUid = auth.currentUser?.uid;

    events.forEach(ev => {
      let timeStr = 'TBD';
      try {
        timeStr = new Date(ev.time).toLocaleString([], {
          weekday: 'short', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      } catch (_) { /* keep TBD */ }
      const hostAvatar = ev.hostPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${ev.hostUid}`;
      const attendees = Array.isArray(ev.attendees) ? ev.attendees : [];
      const count = attendees.length;
      const joined = myUid && attendees.includes(myUid);
      const avatars = attendees.slice(0, 5).map(uid =>
        `<img class="rsvp-avatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=${uid}" alt="" title="Learner">`
      ).join('');
      const more = count > 5 ? `<span class="rsvp-more">+${count - 5}</span>` : '';

      const html = `
        <article class="event-card" data-event-id="${ev.id}">
          <div class="event-info">
            <span class="event-time-badge">${sanitizeHTML(timeStr)}</span>
            <h4 class="event-title">${sanitizeHTML(ev.title)}</h4>
            <p class="event-desc">${sanitizeHTML(ev.description || '')}</p>
            <div class="event-host">
              <img class="event-host-avatar" src="${hostAvatar}" alt="">
              <span>Hosted by ${sanitizeHTML(ev.hostName || 'Host')}</span>
            </div>
            <div class="event-rsvp-row">
              <div class="rsvp-avatars">${count ? avatars + more : '<span class="rsvp-empty">No RSVPs yet</span>'}</div>
              <span class="rsvp-count">${count} going</span>
            </div>
          </div>
          <div class="event-actions">
            <button type="button" class="primary-btn compact-btn join-event-btn ${joined ? 'is-joined' : ''}" data-event-id="${ev.id}" data-joined="${joined ? '1' : '0'}">
              ${joined ? 'Cancel RSVP' : "I'm interested"}
            </button>
          </div>
        </article>
      `;
      el.eventsList.insertAdjacentHTML('beforeend', html);
    });

    document.querySelectorAll('.join-event-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!auth.currentUser) return;
        const eventId = btn.dataset.eventId;
        const joined = btn.dataset.joined === '1';
        btn.disabled = true;
        try {
          const ref = doc(db, 'events', eventId);
          if (joined) {
            await updateDoc(ref, { attendees: arrayRemove(auth.currentUser.uid) });
            showToast('RSVP cancelled.', 'info');
          } else {
            await updateDoc(ref, { attendees: arrayUnion(auth.currentUser.uid) });
            showToast("You're on the list — see you there!", 'success');
          }
        } catch (err) {
          console.error('RSVP failed:', err);
          showToast('Could not update RSVP. Try again.', 'error');
          btn.disabled = false;
        }
      });
    });
  }, (err) => {
    console.error('Error loading events: ', err);
  });
}

export async function handleCreateEvent(e) {
  e.preventDefault();
  if (!auth.currentUser) return;

  const title = el.eventTitleInput.value;
  const description = el.eventDescInput.value;
  const time = el.eventTimeInput.value;

  try {
    const payload = {
      title,
      description,
      time,
      hostUid: auth.currentUser.uid,
      hostName: state.userState.name || auth.currentUser.displayName || 'Scriptura Learner',
      hostPhoto: state.userState.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${auth.currentUser.uid}`,
      attendees: [auth.currentUser.uid]
    };
    await addDoc(collection(db, 'events'), payload);

    el.eventCreateForm.reset();
    el.eventDialog.classList.add('hidden');
    showToast('Event scheduled!', 'success');
    notifyCommunityOfEvent(payload).catch(() => {});
  } catch (err) {
    console.error('Failed to create event:', err);
    showToast('Failed to schedule event. Please try again.', 'error');
  }
}

export function loadChatMessages() {
  if (state.unsubscribeChat) state.unsubscribeChat();

  const messagesCol = collection(db, 'messages');
  const q = query(messagesCol, orderBy('timestamp', 'asc'), limit(100));

  state.unsubscribeChat = onSnapshot(q, (snapshot) => {
    el.chatMessages.innerHTML = '';
    if (snapshot.empty) {
      el.chatMessages.innerHTML = `
        <div class="empty-state soft chat-empty">
          <p class="empty-state-title">Start the conversation</p>
          <p class="empty-state-text">Share a verse, prayer request, or word of encouragement.</p>
        </div>`;
      return;
    }

    snapshot.forEach(docSnap => {
      const msg = docSnap.data();
      const isSelf = msg.senderUid === auth.currentUser?.uid;
      const aUrl = msg.senderPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.senderUid}`;
      let timeStr = '';
      if (msg.timestamp) {
        try {
          timeStr = new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (ex) {
          timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }

      const html = `
        <div class="chat-msg ${isSelf ? 'self' : ''}">
          <img class="chat-msg-avatar" src="${aUrl}" alt="">
          <div class="chat-msg-content">
            <div class="chat-msg-header">
              <span class="chat-msg-author">${sanitizeHTML(msg.senderName || 'Anonymous')}</span>
              <span class="chat-msg-time">${timeStr}</span>
            </div>
            <div class="chat-msg-bubble">${sanitizeHTML(msg.text)}</div>
          </div>
        </div>
      `;
      el.chatMessages.insertAdjacentHTML('beforeend', html);
    });

    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
  }, (err) => {
    console.error('Error loading chat: ', err);
  });
}

export async function handleSendChatMessage(e) {
  e.preventDefault();
  if (!auth.currentUser) return;

  const text = el.chatMessageInput.value.trim();
  if (!text) return;

  el.chatMessageInput.value = '';

  try {
    await addDoc(collection(db, 'messages'), {
      text,
      senderUid: auth.currentUser.uid,
      senderName: state.userState.name || auth.currentUser.displayName || 'Scriptura Learner',
      senderPhoto: state.userState.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${auth.currentUser.uid}`,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Failed to send message:', err);
    showToast('Could not post message.', 'error');
  }
}

export function renderAvatarPresets() {
  if (!el.avatarPresetsContainer) return;
  el.avatarPresetsContainer.innerHTML = '';

  const uid = auth.currentUser ? auth.currentUser.uid.slice(0, 8) : 'scriptura';
  const presets = [
    { style: 'open-peeps', seed: uid },
    { style: 'open-peeps', seed: uid + '1' },
    { style: 'open-peeps', seed: uid + '2' },
    { style: 'big-smile', seed: uid },
    { style: 'big-smile', seed: uid + '1' },
    { style: 'adventurer', seed: uid },
    { style: 'adventurer', seed: uid + '1' },
    { style: 'fun-emoji', seed: uid },
    { style: 'lorelei', seed: uid },
    { style: 'avataaars', seed: uid },
  ];

  presets.forEach(({ style, seed }) => {
    const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    const wrapper = document.createElement('div');
    wrapper.className = 'avatar-preset-wrapper';
    const img = document.createElement('img');
    img.className = 'avatar-preset';
    img.src = url;
    img.alt = style;
    img.loading = 'lazy';

    if (state.userState.photo === url) {
      wrapper.classList.add('selected');
    }

    wrapper.addEventListener('click', () => {
      document.querySelectorAll('.avatar-preset-wrapper').forEach(p => p.classList.remove('selected'));
      wrapper.classList.add('selected');
      el.avatarPresetsContainer.dataset.selectedUrl = url;
      const preview = document.getElementById('profile-photo-preview');
      if (preview) {
        preview.src = url;
        preview.classList.remove('hidden');
        preview.dataset.dataUrl = '';
      }
    });

    wrapper.appendChild(img);
    el.avatarPresetsContainer.appendChild(wrapper);
  });
}

export function setupPhotoUpload() {
  const uploadInput = document.getElementById('profile-photo-upload');
  const preview = document.getElementById('profile-photo-preview');
  if (!uploadInput || !preview) return;
  if (uploadInput.dataset.wired) return;
  uploadInput.dataset.wired = '1';

  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 800 * 1024) {
      showToast('Please choose an image under 800KB.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.classList.remove('hidden');
      preview.dataset.dataUrl = reader.result;
      if (el.avatarPresetsContainer) el.avatarPresetsContainer.dataset.selectedUrl = '';
      document.querySelectorAll('.avatar-preset-wrapper').forEach(p => p.classList.remove('selected'));
    };
    reader.readAsDataURL(file);
  });

  // Collapsible avatar presets
  document.getElementById('profile-toggle-presets')?.addEventListener('click', () => {
    const panel = document.getElementById('avatar-presets-panel');
    const btn = document.getElementById('profile-toggle-presets');
    if (!panel) return;
    const open = panel.classList.toggle('hidden');
    // toggle returns true if class is now present (= hidden)
    if (btn) btn.textContent = panel.classList.contains('hidden') ? 'Or pick an avatar ▾' : 'Hide avatars ▴';
  });

  document.getElementById('profile-cancel-btn')?.addEventListener('click', () => {
    el.profileDialog?.classList.add('hidden');
  });
}

export function openProfileDialog() {
  if (!auth.currentUser) return;

  el.profileNameInput.value = state.userState.name || auth.currentUser.displayName || '';
  el.profileEmailInput.value = state.userState.email || auth.currentUser.email || '';
  el.profileChurchInput.value = state.userState.church || '';
  const countryCode = effectiveCountry(state.userState);
  if (el.profileCountrySelect) {
    // If stored country isn't in the short list, fall back to OTHER
    const hasOption = [...el.profileCountrySelect.options].some(o => o.value === countryCode);
    el.profileCountrySelect.value = hasOption ? countryCode : 'OTHER';
  }

  document.getElementById('profile-headline-input').value = state.userState.headline || '';
  document.getElementById('profile-goals-input').value = state.userState.goals || '';
  document.getElementById('profile-interests-input').value = state.userState.interests || '';
  document.getElementById('profile-social-input').value = state.userState.social || '';

  // Role is not self-editable (prevents lockouts). Use Admin → Learners to promote others.
  const roleSelect = document.getElementById('profile-role-select');
  const roleSection = document.getElementById('profile-role-section');
  if (roleSelect) {
    roleSelect.value = state.userState.role || 'user';
    roleSelect.disabled = true;
  }
  if (roleSection) roleSection.classList.add('hidden');

  const preview = document.getElementById('profile-photo-preview');
  if (preview) {
    const photo = state.userState.photo
      || auth.currentUser.photoURL
      || `https://api.dicebear.com/7.x/bottts/svg?seed=${auth.currentUser.uid}`;
    preview.src = photo;
    preview.classList.remove('hidden');
    preview.dataset.dataUrl = state.userState.photo?.startsWith('data:image') ? state.userState.photo : '';
  }
  const uploadInput = document.getElementById('profile-photo-upload');
  if (uploadInput) uploadInput.value = '';
  if (el.avatarPresetsContainer) el.avatarPresetsContainer.dataset.selectedUrl = '';

  const presetsPanel = document.getElementById('avatar-presets-panel');
  if (presetsPanel) presetsPanel.classList.add('hidden');
  const togglePresets = document.getElementById('profile-toggle-presets');
  if (togglePresets) togglePresets.textContent = 'Or pick an avatar ▾';

  const prefs = getNotificationPrefs();
  const pd = document.getElementById('pref-daily-reminder');
  const pe = document.getElementById('pref-event-alerts');
  const pr = document.getElementById('pref-reflection-alerts');
  if (pd) pd.checked = prefs.dailyReminder !== false;
  if (pe) pe.checked = prefs.eventAlerts !== false;
  if (pr) pr.checked = prefs.reflectionAlerts !== false;

  renderAvatarPresets();
  el.profileDialog.classList.remove('hidden');
  // Focus first field for keyboard users
  setTimeout(() => el.profileNameInput?.focus(), 50);
}

export async function handleProfileSave(e) {
  e.preventDefault();
  if (!auth.currentUser) return;

  const newName = el.profileNameInput.value;
  const newEmail = el.profileEmailInput.value;
  const newChurch = el.profileChurchInput.value;
  const newCountry = el.profileCountrySelect.value || 'SG';

  const newHeadline = document.getElementById('profile-headline-input').value;
  const newGoals = document.getElementById('profile-goals-input').value;
  const newInterests = document.getElementById('profile-interests-input').value;
  const newSocial = document.getElementById('profile-social-input').value;
  const roleSelect = document.getElementById('profile-role-select');
  const newRole = roleSelect?.value || state.userState.role || 'user';

  const preview = document.getElementById('profile-photo-preview');
  const uploadedDataUrl = preview?.dataset.dataUrl;
  const selectedPresetUrl = el.avatarPresetsContainer?.dataset.selectedUrl;
  let newPhoto = state.userState.photo;
  if (uploadedDataUrl) {
    newPhoto = uploadedDataUrl;
  } else if (selectedPresetUrl) {
    newPhoto = selectedPresetUrl;
  }

  state.userState.name = newName;
  state.userState.email = newEmail;
  state.userState.church = newChurch;
  state.userState.country = newCountry;
  state.userState.photo = newPhoto;

  state.userState.headline = newHeadline;
  state.userState.goals = newGoals;
  state.userState.interests = newInterests;
  state.userState.social = newSocial;

  // Never change role from profile self-save (use Admin dashboard to promote others).
  // Local role is refreshed from cloud on next load.

  const pd = document.getElementById('pref-daily-reminder');
  const pe = document.getElementById('pref-event-alerts');
  const pr = document.getElementById('pref-reflection-alerts');
  await setNotificationPrefs({
    dailyReminder: pd ? pd.checked : true,
    eventAlerts: pe ? pe.checked : true,
    reflectionAlerts: pr ? pr.checked : true
  });

  await saveState();
  updateHeaderProfile();
  checkAdminNavVisibility();
  el.profileDialog.classList.add('hidden');
  showToast('Profile updated', 'success');

  await fetchRegisteredUsers();
  updateNetworkView();
}
