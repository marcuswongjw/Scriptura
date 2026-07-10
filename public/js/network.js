// Feature module: network (Phase 2)
import { auth, db } from './firebase.js?v=2.0.13';
import { collection, getDocs, onSnapshot, addDoc, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { modules } from '../modules.js?v=2.0.13';
import { sanitizeHTML, debounce } from './utils.js?v=2.0.13';
import { showToast } from './toast.js?v=2.0.13';
import { el } from './dom.js?v=2.0.13';
import { state } from './state.js?v=2.0.13';
import { checkAdminNavVisibility, saveState, updateHeaderProfile } from './user.js?v=2.0.13';

export async function initNetworkViewer() {
  if (!state.networkListenersAttached) {
    // Use event delegation for network nav items so re-renders never duplicate listeners.
    document.querySelector('.network-sidebar')?.addEventListener('click', e => {
      const item = e.target.closest('.net-nav-item');
      if (item) switchNetworkTab(item.getAttribute('data-net-tab'));
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

  await fetchRegisteredUsers();
  updateNetworkView();
  switchNetworkTab('map');
}

export async function fetchRegisteredUsers() {
  try {
    const querySnapshot = await getDocs(query(collection(db, 'users'), limit(100)));
    state.registeredUsers = [];
    querySnapshot.forEach(docSnap => {
      state.registeredUsers.push({
        uid: docSnap.id,
        ...docSnap.data()
      });
    });
  } catch (err) {
    console.error('Failed to fetch registered users:', err);
  }
}

export function updateNetworkView() {
  const currentCountry = state.userState.country;
  
  const countEl = document.getElementById('regional-active-count');
  if (countEl) {
    const counts = {};
    state.registeredUsers.forEach(u => {
      if (u.country) {
        counts[u.country] = (counts[u.country] || 0) + 1;
      }
    });
    const countryCount = currentCountry ? (counts[currentCountry] || 0) : 0;
    countEl.textContent = countryCount.toLocaleString();
  }

  renderMapClusters();
  renderDirectoryList();
}

export function renderMapClusters() {
  const clusterGroup = document.getElementById('map-clusters');
  if (!clusterGroup) return;
  clusterGroup.innerHTML = '';
  
  const counts = {};
  state.registeredUsers.forEach(u => {
    if (u.country) {
      counts[u.country] = (counts[u.country] || 0) + 1;
    }
  });
  
  Object.keys(counts).forEach(countryCode => {
    const meta = state.countryMetadata[countryCode];
    if (!meta) return;
    const count = counts[countryCode];
    const isUserCountry = countryCode === state.userState.country;
    
    const r = 12 + Math.min(count, 10) * 2;
    
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `map-cluster ${isUserCountry ? 'active' : ''}`);
    g.setAttribute('data-country', countryCode);
    
    // Pulsing circle backdrop
    const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pulse.setAttribute('cx', meta.cx);
    pulse.setAttribute('cy', meta.cy);
    pulse.setAttribute('r', r);
    pulse.setAttribute('class', `map-cluster-pulse ${isUserCountry ? 'active-user' : ''}`);
    
    // Main interactive circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', meta.cx);
    circle.setAttribute('cy', meta.cy);
    circle.setAttribute('r', r);
    circle.setAttribute('class', `map-cluster-circle ${isUserCountry ? 'active-user' : ''}`);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', meta.cx);
    text.setAttribute('y', meta.cy);
    text.setAttribute('dy', '4');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'map-cluster-text');
    text.textContent = count;
    
    g.appendChild(pulse);
    g.appendChild(circle);
    g.appendChild(text);
    clusterGroup.appendChild(g);
    
    g.addEventListener('click', async () => {
      state.userState.country = countryCode;
      await saveState();
      await fetchRegisteredUsers();
      updateNetworkView();
    });
  });
}

export function renderDirectoryList() {
  const listEl = document.getElementById('network-directory-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  
  const counts = {};
  state.registeredUsers.forEach(u => {
    if (u.country) {
      counts[u.country] = (counts[u.country] || 0) + 1;
    }
  });
  
  Object.keys(counts).forEach(code => {
    const info = state.countryMetadata[code];
    if (!info) return;
    const count = counts[code];
    const isUserCountry = code === state.userState.country;
    
    const html = `
      <div class="directory-item ${isUserCountry ? 'active-user-country' : ''}" data-country-code="${code}">
        <div class="directory-country-name">
          <span class="directory-country-flag">${info.flag}</span>
          <span>${info.name} ${isUserCountry ? '(You)' : ''}</span>
        </div>
        <div class="directory-user-count">${count} registered</div>
      </div>
    `;
    listEl.insertAdjacentHTML('beforeend', html);
  });
  
  document.querySelectorAll('.directory-item').forEach(item => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); } });
    item.addEventListener('click', async () => {
      const code = item.getAttribute('data-country-code');
      state.userState.country = code;
      await saveState();
      await fetchRegisteredUsers();
      updateNetworkView();
    });
  });
}

export function switchNetworkTab(tabId) {
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
  
  if (tabId === 'people') {
    renderPeopleDirectory();
  } else if (tabId === 'events') {
    loadEvents();
  } else if (tabId === 'messages') {
    loadChatMessages();
  }
}

// Render Enriched People Profiles in Directory

export function renderPeopleDirectory() {
  if (!el.peopleGrid) return;
  el.peopleGrid.innerHTML = '';
  
  const searchQuery = el.peopleSearch ? el.peopleSearch.value.toLowerCase().trim() : '';
  
  const filtered = state.registeredUsers.filter(u => {
    const countryMeta = state.countryMetadata[u.country] || { name: '' };
    const matchesSearch = !searchQuery || 
      (u.name && u.name.toLowerCase().includes(searchQuery)) ||
      (u.church && u.church.toLowerCase().includes(searchQuery)) ||
      (u.headline && u.headline.toLowerCase().includes(searchQuery)) ||
      (countryMeta.name && countryMeta.name.toLowerCase().includes(searchQuery));
      
    return matchesSearch;
  });
  
  if (filtered.length === 0) {
    el.peopleGrid.innerHTML = `<div style="grid-column: 1/-1; padding: 3rem 1.5rem; color: var(--gray-400); text-align: center; background:#fff; border-radius:var(--r-lg);">No learners found matching filters.</div>`;
    return;
  }
  
  filtered.forEach(u => {
    const avatarUrl = u.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.uid}`;
    const countryMeta = state.countryMetadata[u.country] || { name: 'Unknown', flag: '🌍' };
    const modCount = u.completedModules
      ? u.completedModules.filter(id => modules.some(m => m.id === id)).length
      : 0;
    
    // Process Interests
    const interestPills = (u.interests || '')
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => `<span class="interest-pill">${sanitizeHTML(tag)}</span>`)
      .join('');

    const socialLinkHtml = u.social ? `
      <a href="${u.social}" target="_blank" rel="noopener noreferrer" class="card-social-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        <span>Contact</span>
      </a>
    ` : '';

    const html = `
      <div class="user-card premium-user-card">
        <div class="user-card-header">
          <img class="card-avatar" src="${avatarUrl}" alt="${u.name || 'Learner'}">
          <div class="header-text-block">
            <div class="card-name">${sanitizeHTML(u.name) || 'Anonymous Learner'}</div>
            <div class="card-headline">${sanitizeHTML(u.headline) || 'Scriptura Learner'}</div>
          </div>
        </div>
        <div class="card-body-section">
          <div class="card-church">⛪ ${sanitizeHTML(u.church) || 'Independent Fellowship'}</div>
          <span class="card-country-tag">${countryMeta.flag} ${countryMeta.name}</span>
          ${u.goals ? `<div class="card-goals"><strong>Goal:</strong> ${sanitizeHTML(u.goals)}</div>` : ''}
          ${interestPills ? `<div class="card-interests-wrapper">${interestPills}</div>` : ''}
        </div>
        <div class="card-footer-section">
          <div class="card-meta-row">
            <span class="card-badge">🔥 ${u.streak || 0}d streak</span>
            <span class="card-badge">📖 ${modCount} modules</span>
          </div>
          ${socialLinkHtml}
        </div>
      </div>
    `;
    el.peopleGrid.insertAdjacentHTML('beforeend', html);
  });
}

export function loadEvents() {
  if (state.unsubscribeEvents) state.unsubscribeEvents();
  
  const eventsCol = collection(db, 'events');
  state.unsubscribeEvents = onSnapshot(query(eventsCol, orderBy('time', 'asc')), (snapshot) => {
    el.eventsList.innerHTML = '';
    let events = [];
    snapshot.forEach(docSnap => {
      events.push({ id: docSnap.id, ...docSnap.data() });
    });
    
    if (events.length === 0) {
      el.eventsList.innerHTML = `<div style="padding: 2rem; color: var(--gray-400); text-align: center;">No study events scheduled. Click "Schedule Event" to create one!</div>`;
      return;
    }
    
    events.forEach(ev => {
      const timeStr = new Date(ev.time).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const hostAvatar = ev.hostPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${ev.hostUid}`;
      
      const html = `
        <div class="event-card">
          <div class="event-info">
            <span class="event-time-badge">${timeStr}</span>
            <div class="event-title">${ev.title}</div>
            <p class="event-desc">${ev.description}</p>
            <div class="event-host">
              <img class="event-host-avatar" src="${hostAvatar}" alt="Host">
              <span>Hosted by ${ev.hostName || 'Host'}</span>
            </div>
          </div>
          <div class="event-actions">
            <button class="primary-btn compact-btn join-event-btn" data-event-id="${ev.id}">RSVP / JOIN</button>
          </div>
        </div>
      `;
      el.eventsList.insertAdjacentHTML('beforeend', html);
    });
    
    document.querySelectorAll('.join-event-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast('You have successfully RSVPed to this study event! Check back closer to the time.', 'success');
      });
    });
  }, (err) => {
    console.error("Error loading events: ", err);
  });
}

export async function handleCreateEvent(e) {
  e.preventDefault();
  if (!auth.currentUser) return;
  
  const title = el.eventTitleInput.value;
  const description = el.eventDescInput.value;
  const time = el.eventTimeInput.value;
  
  try {
    await addDoc(collection(db, 'events'), {
      title,
      description,
      time,
      hostUid: auth.currentUser.uid,
      hostName: state.userState.name || auth.currentUser.displayName || 'Scriptura Learner',
      hostPhoto: state.userState.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${auth.currentUser.uid}`
    });
    
    el.eventCreateForm.reset();
    el.eventDialog.classList.add('hidden');
  } catch (err) {
    console.error('Failed to create event:', err);
    showToast('Failed to schedule event. Please try again.', 'error');
  }
}

export function loadChatMessages() {
  if (state.unsubscribeChat) state.unsubscribeChat();
  
  const messagesCol = collection(db, 'messages');
  const q = query(messagesCol, orderBy('timestamp', 'asc'));
  
  state.unsubscribeChat = onSnapshot(q, (snapshot) => {
    el.chatMessages.innerHTML = '';
    snapshot.forEach(docSnap => {
      const msg = docSnap.data();
      const isSelf = msg.senderUid === auth.currentUser?.uid;
      const avatarUrl = msg.senderPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.senderUid}`;
      let timeStr = 'Just now';
      if (msg.timestamp) {
        try {
          timeStr = new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (ex) {
          timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
      
      const html = `
        <div class="chat-msg ${isSelf ? 'self' : ''}">
          <img class="chat-msg-avatar" src="${avatarUrl}" alt="Avatar">
          <div class="chat-msg-content">
            <div class="chat-msg-header">
              <span class="chat-msg-author">${msg.senderName || 'Anonymous'}</span>
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
    console.error("Error loading chat: ", err);
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
  }
}

export function renderAvatarPresets() {
  if (!el.avatarPresetsContainer) return;
  el.avatarPresetsContainer.innerHTML = '';
  
  const uid = auth.currentUser ? auth.currentUser.uid.slice(0,8) : 'scriptura';
  const presets = [
    { style: 'open-peeps', seed: uid },
    { style: 'open-peeps', seed: uid + '1' },
    { style: 'open-peeps', seed: uid + '2' },
    { style: 'big-smile', seed: uid },
    { style: 'big-smile', seed: uid + '1' },
    { style: 'big-smile', seed: uid + '2' },
    { style: 'adventurer', seed: uid },
    { style: 'adventurer', seed: uid + '1' },
    { style: 'adventurer', seed: uid + '2' },
    { style: 'fun-emoji', seed: uid },
    { style: 'fun-emoji', seed: uid + '1' },
    { style: 'fun-emoji', seed: uid + '2' },
    { style: 'lorelei', seed: uid },
    { style: 'lorelei', seed: uid + '1' },
    { style: 'lorelei', seed: uid + '2' },
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
      wrapper.dataset.selectedUrl = url;
      el.avatarPresetsContainer.dataset.selectedUrl = url;
      const preview = document.getElementById('profile-photo-preview');
      if (preview) preview.classList.add('hidden');
    });
    
    wrapper.appendChild(img);
    el.avatarPresetsContainer.appendChild(wrapper);
  });
}

export function setupPhotoUpload() {
  const uploadInput = document.getElementById('profile-photo-upload');
  const preview = document.getElementById('profile-photo-preview');
  if (!uploadInput || !preview) return;
  
  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      preview.src = ev.target.result;
      preview.classList.remove('hidden');
      document.querySelectorAll('.avatar-preset-wrapper').forEach(p => p.classList.remove('selected'));
      el.avatarPresetsContainer.dataset.selectedUrl = '';
      preview.dataset.dataUrl = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function openProfileDialog() {
  if (!auth.currentUser) return;
  
  el.profileNameInput.value = state.userState.name || auth.currentUser.displayName || '';
  el.profileEmailInput.value = state.userState.email || auth.currentUser.email || '';
  el.profileChurchInput.value = state.userState.church || '';
  el.profileCountrySelect.value = state.userState.country || '';
  
  // Enriched fields
  document.getElementById('profile-headline-input').value = state.userState.headline || '';
  document.getElementById('profile-goals-input').value = state.userState.goals || '';
  document.getElementById('profile-interests-input').value = state.userState.interests || '';
  document.getElementById('profile-social-input').value = state.userState.social || '';
  const roleSelect = document.getElementById('profile-role-select');
  if (roleSelect) {
    roleSelect.value = state.userState.role || 'user';
    // Only allow admins to see/change role in the profile dialog.
    // Real authorization must still be enforced in Firestore rules.
    if (state.userState.role !== 'admin') {
      roleSelect.disabled = true;
      roleSelect.closest('.form-field')?.classList.add('hidden');
    } else {
      roleSelect.disabled = false;
      roleSelect.closest('.form-field')?.classList.remove('hidden');
    }
  }
  
  const preview = document.getElementById('profile-photo-preview');
  if (preview) {
    if (state.userState.photo && state.userState.photo.startsWith('data:image')) {
      preview.src = state.userState.photo;
      preview.classList.remove('hidden');
      preview.dataset.dataUrl = state.userState.photo;
    } else {
      preview.classList.add('hidden');
      preview.dataset.dataUrl = '';
    }
  }
  const uploadInput = document.getElementById('profile-photo-upload');
  if (uploadInput) uploadInput.value = '';
  
  renderAvatarPresets();
  el.profileDialog.classList.remove('hidden');
}

export async function handleProfileSave(e) {
  e.preventDefault();
  if (!auth.currentUser) return;
  
  const newName = el.profileNameInput.value;
  const newEmail = el.profileEmailInput.value;
  const newChurch = el.profileChurchInput.value;
  const newCountry = el.profileCountrySelect.value;
  
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
  // Prevent non-admin users from escalating their own role.
  // Admins may change their own role; Firestore rules are the real guard.
  if (state.userState.role === 'admin') {
    state.userState.role = (newRole === 'admin' || newRole === 'user') ? newRole : 'admin';
  } else {
    state.userState.role = 'user';
  }
  
  await saveState();
  updateHeaderProfile();
  checkAdminNavVisibility();
  el.profileDialog.classList.add('hidden');
  
  await fetchRegisteredUsers();
  updateNetworkView();
}

