// Loading and App Init
function initApp() {
  setTimeout(() => {
    const loading = document.getElementById('loadingScreen');
    loading.classList.add('fade-out');
    setTimeout(() => {
      loading.style.display = 'none';
      document.getElementById('mainApp').classList.add('show');
    }, 300);
  }, 800);

  restoreSettingsAndState();
}

// Doughnut chart (canvas, no external deps)
function drawPortfolioChart(tokensUsd) {
  const canvas = document.getElementById('portfolioChart');
  const ctx = canvas.getContext('2d');
  const hasData = Array.isArray(tokensUsd) && tokensUsd.length > 0;
  const values = hasData ? tokensUsd.map(t => Math.max(0, Number(t.balanceUSD) || 0)) : [40, 25, 20, 15];
  const labels = hasData ? tokensUsd.map(t => t.symbol || 'Token') : ['auraBAL', '3CRV', 'USDC', 'Others'];
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6', '#f97316', '#6366f1'];

  const width = canvas.width;
  const height = canvas.height;
  const radius = Math.min(width, height) / 2 - 6;
  const centerX = width / 2 + 20;
  const centerY = height / 2;

  ctx.clearRect(0, 0, width, height);

  const total = values.reduce((a, b) => a + b, 0);
  let startAngle = -Math.PI / 2;
  for (let i = 0; i < values.length; i++) {
    const sliceAngle = (values[i] / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    startAngle += sliceAngle;
  }

  // Doughnut hole
  const holeRadius = radius * 0.55;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(centerX, centerY, holeRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--color-surface').trim() || '#ffffff';
  ctx.arc(centerX, centerY, holeRadius, 0, Math.PI * 2);
  ctx.fill();

  // simple legend on the left
  ctx.font = '10px system-ui, -apple-system, Segoe UI, Roboto';
  const textColor = getComputedStyle(document.body).getPropertyValue('--color-text').trim() || '#1e293b';
  labels.slice(0, 8).forEach((label, i) => {
    const y = 10 + i * 14;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(6, y, 8, 8);
    ctx.fillStyle = textColor;
    ctx.fillText(label, 18, y + 8);
  });
}

// AURA API helpers
async function fetchAuraBalances(address, apiKey) {
  const url = new URL('https://aura.adex.network/api/portfolio/balances');
  url.searchParams.set('address', address);
  if (apiKey) url.searchParams.set('apiKey', apiKey);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Balances HTTP ${res.status}`);
  return res.json();
}

async function fetchAuraStrategies(address, apiKey) {
  const url = new URL('https://aura.adex.network/api/portfolio/strategies');
  url.searchParams.set('address', address);
  if (apiKey) url.searchParams.set('apiKey', apiKey);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Strategies HTTP ${res.status}`);
  return res.json();
}

function updateFromAura(address) {
  const apiKey = undefined; // optional: add in settings later
  // balances => update chart and assets
  fetchAuraBalances(address, apiKey).then((balances) => {
    try { console.log('[AURA] Balances response:', balances); } catch (_) {}
    const tokens = (balances?.portfolio || []).flatMap(np => Array.isArray(np?.tokens) ? np.tokens : []);
    const topTokens = tokens
      .filter(t => typeof t.balanceUSD === 'number')
      .sort((a, b) => b.balanceUSD - a.balanceUSD)
      .slice(0, 8);
    drawPortfolioChart(topTokens);
    renderAssets(tokens);
  }).catch(() => {
    drawPortfolioChart();
  });

  // strategies => update strategy list
  renderStrategiesLoading();
  fetchAuraStrategies(address, apiKey).then((strategies) => {
    try { console.log('[AURA] Strategies response:', strategies); } catch (_) {}
    renderStrategies(strategies);
  }).catch(() => {
    renderStrategiesError();
  });
}

function renderStrategies(strategiesResponse) {
  const container = document.getElementById('strategyContent');
  if (!container) return;
  const items = strategiesResponse?.strategies?.[0]?.response;
  if (!Array.isArray(items) || items.length === 0) return;
  container.innerHTML = items.map((it) => {
    const risk = (it?.risk || '').toLowerCase();
    const riskClass = risk ? `risk-${risk}` : '';
    const actions = Array.isArray(it?.actions) ? it.actions : [];
    const actionsHtml = actions.map((a) => {
      const apy = a?.apy || 'N/A';
      const platforms = (a?.platforms || []).map(p => p.name).filter(Boolean);
      const networks = (a?.networks || []);
      const operations = (a?.operations || []);
      const desc = a?.description || '';
      return `
        <div class="strategy-action">
          <div class="row"><span class="label">APY</span><span class="chip chip-apy">${apy}</span></div>
          ${platforms.length ? `<div class="row"><span class="label">Platforms</span><span class="chips">${platforms.map(pl => `<span class=\"chip chip-platform\">${pl}</span>`).join('')}</span></div>` : ''}
          ${networks.length ? `<div class="row"><span class="label">Networks</span><span class="chips">${networks.map(nw => `<span class=\"chip chip-network\">${nw}</span>`).join('')}</span></div>` : ''}
          ${operations.length ? `<div class="row"><span class="label">Operations</span><span class="chips">${operations.map(op => `<span class=\"chip chip-operation\">${op}</span>`).join('')}</span></div>` : ''}
        </div>
        ${desc ? `<div class=\"strategy-note\"><span class=\"label\">Note</span><span class=\"text\">${desc}</span></div>` : ''}`;
    }).join('');
    return `
      <div class="strategy-card">
        <div class="strategy-header">
          <span class="strategy-name">${it?.name || 'Strategy'}</span>
          ${risk ? `<span class="strategy-risk ${riskClass}">${it.risk}</span>` : ''}
        </div>
        <div class="strategy-actions">${actionsHtml}</div>
      </div>`;
  }).join('');
}

function renderStrategiesLoading() {
  const container = document.getElementById('strategyContent');
  if (!container) return;
  container.innerHTML = `
    <div class="strategy-card skeleton" style="height:64px;"></div>
    <div class="strategy-card skeleton" style="height:64px;"></div>
    <div class="strategy-card skeleton" style="height:64px;"></div>
  `;
}

function renderStrategiesError() {
  const container = document.getElementById('strategyContent');
  if (!container) return;
  container.innerHTML = `
    <div class="strategy-card">
      <div class="strategy-header">
        <span class="strategy-name">Failed to load strategies</span>
        <span class="strategy-risk risk-high">error</span>
      </div>
      <div class="strategy-actions">Please try again later.</div>
    </div>
  `;
}

function renderAssets(tokens) {
  const container = document.getElementById('assetsContent');
  if (!container) return;
  if (!Array.isArray(tokens) || tokens.length === 0) return;
  const sorted = tokens
    .filter(t => typeof t.balanceUSD === 'number')
    .sort((a, b) => b.balanceUSD - a.balanceUSD)
    .slice(0, 20);
  container.innerHTML = sorted.map((t) => (
    `<div class="asset-item">
      <div class="asset-info">
        <div class="asset-icon">${(t.symbol || '?').slice(0,2)}</div>
        <div class="asset-details">
          <h4>${t.symbol || 'Token'}</h4>
          <p>${t.network || ''}</p>
        </div>
      </div>
      <div class="asset-value">
        <div class="asset-amount">${Number(t.balance).toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
        <div class="asset-usd">$${Number(t.balanceUSD).toLocaleString()}</div>
      </div>
    </div>`
  )).join('');
}

// Tabs
function setupTabs() {
  const strategyTab = document.getElementById('strategyTab');
  const assetsTab = document.getElementById('assetsTab');
  const strategyContent = document.getElementById('strategyContent');
  const assetsContent = document.getElementById('assetsContent');

  strategyTab.addEventListener('click', () => {
    strategyTab.classList.add('active');
    assetsTab.classList.remove('active');
    strategyContent.classList.remove('hidden');
    assetsContent.classList.add('hidden');
  });

  assetsTab.addEventListener('click', () => {
    assetsTab.classList.add('active');
    strategyTab.classList.remove('active');
    assetsContent.classList.remove('hidden');
    strategyContent.classList.add('hidden');
  });
}

// Settings modal
function setupModal() {
  const settingsBtn = document.getElementById('settingsBtn');
  const modal = document.getElementById('settingsModal');
  const closeSettings = document.getElementById('closeSettings');

  settingsBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  closeSettings.addEventListener('click', () => modal.classList.add('hidden'));
}

// Wallets modal with list/select/remove/add
function setupWalletsModal() {
  const walletBtn = document.getElementById('walletBtn');
  const walletsModal = document.getElementById('walletsModal');
  const closeWallets = document.getElementById('closeWallets');
  const addWalletInput = document.getElementById('addWalletInput');
  const confirmAddWallet = document.getElementById('confirmAddWallet');
  const walletsList = document.getElementById('walletsList');
  if (!walletBtn || !walletsModal || !closeWallets || !addWalletInput || !confirmAddWallet || !walletsList) return;

  function openModal() {
    walletsModal.classList.remove('hidden');
    renderWalletsList();
    setTimeout(() => addWalletInput.focus(), 0);
  }
  function closeModal() {
    walletsModal.classList.add('hidden');
  }
  function renderWalletsList() {
    walletsList.innerHTML = state.wallets.map((addr, index) => (
      `<div class="wallets-list-item">
        <div class="left">
          <span class="wallet-address">${addr.slice(0, 10)}...${addr.slice(-6)}</span>
        </div>
        <div class="right">
          <button class="wallets-select" data-index="${index}">${state.activeWalletIndex === index ? 'Selected' : 'Select'}</button>
          <button class="wallets-remove" data-index="${index}">Remove</button>
        </div>
      </div>`
    )).join('');
    walletsList.querySelectorAll('.wallets-select').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.getAttribute('data-index'));
        state.activeWalletIndex = idx;
        persistState();
        renderWalletsList();
        const address = state.wallets[idx];
        if (address) updateFromAura(address);
      });
    });
    walletsList.querySelectorAll('.wallets-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.getAttribute('data-index'));
        state.wallets.splice(idx, 1);
        if (state.activeWalletIndex === idx) state.activeWalletIndex = undefined;
        if (typeof state.activeWalletIndex === 'number' && state.activeWalletIndex > idx) {
          state.activeWalletIndex -= 1;
        }
        persistState();
        renderWalletsList();
        renderWallets();
      });
    });
  }

  walletBtn.addEventListener('click', openModal);
  closeWallets.addEventListener('click', closeModal);
  addWalletInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter') confirmAddWallet.click();
  });
  confirmAddWallet.addEventListener('click', () => {
    const address = addWalletInput.value.trim();
    if (address && /^0x[a-fA-F0-9]{4,}$/.test(address)) {
      state.wallets.push(address);
      if (typeof state.activeWalletIndex !== 'number') state.activeWalletIndex = 0;
      addWalletInput.value = '';
      persistState();
      renderWalletsList();
      renderWallets();
      updateFromAura(address);
    }
  });
}

// Theme + Auto refresh + Wallets with chrome.storage
const state = {
  wallets: [],
  darkMode: false,
  autoRefresh: false,
  activeWalletIndex: undefined
};

function persistState() {
  if (!chrome?.storage?.local) return Promise.resolve();
  const toSave = {
    wallets: state.wallets,
    darkMode: state.darkMode,
    autoRefresh: state.autoRefresh,
    activeWalletIndex: state.activeWalletIndex
  };
  return new Promise(resolve => chrome.storage.local.set(toSave, resolve));
}

function restoreSettingsAndState() {
  if (!chrome?.storage?.local) return Promise.resolve();
  return new Promise(resolve => {
    chrome.storage.local.get(['wallets', 'darkMode', 'autoRefresh', 'activeWalletIndex'], (res) => {
      state.wallets = Array.isArray(res.wallets) ? res.wallets : [];
      state.darkMode = Boolean(res.darkMode);
      state.autoRefresh = Boolean(res.autoRefresh);
      state.activeWalletIndex = (typeof res.activeWalletIndex === 'number') ? res.activeWalletIndex : (state.wallets.length > 0 ? 0 : undefined);
      // apply
      document.body.classList.toggle('dark-mode', state.darkMode);
      document.getElementById('themeToggle').checked = state.darkMode;
      document.getElementById('autoRefresh').checked = state.autoRefresh;
      renderWallets();
      const address = (typeof state.activeWalletIndex === 'number') ? state.wallets[state.activeWalletIndex] : undefined;
      if (address) updateFromAura(address);
      resolve();
    });
  });
}

function setupSettingsBindings() {
  const themeToggle = document.getElementById('themeToggle');
  const autoRefresh = document.getElementById('autoRefresh');
  themeToggle.addEventListener('change', (e) => {
    state.darkMode = e.target.checked;
    document.body.classList.toggle('dark-mode', state.darkMode);
    persistState();
    // redraw chart for dark grid contrast
    drawPortfolioChart();
  });
  autoRefresh.addEventListener('change', (e) => {
    state.autoRefresh = e.target.checked;
    persistState();
  });
}

// Wallet management
function setupWallets() {
  // Managed via wallets modal
}

function renderWallets() {
  const container = document.getElementById('savedWallets');
  if (!container) return; // inline wallet list removed
}

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupModal();
  setupWalletsModal();
  setupSettingsBindings();
  setupWallets();
  initApp();
});


