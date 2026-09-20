/**
 * Mocha Practice — Minimalist Paper Trading Engine & Interactive Canvas Chart
 * Edge-to-Edge Full-Screen Edition with Stock Selector & Dynamic Graph Engine
 */

// 1. Initial State & Asset Definitions
const STARTING_BALANCE = 100000;

const ASSETS = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: 'B',
    color: '#f7931a',
    price: 5850000,
    basePrice: 5850000,
    change24h: 1.84,
    history: [5780000, 5795000, 5810000, 5805000, 5820000, 5835000, 5840000, 5850000],
    volatility: 0.008
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'E',
    color: '#627eea',
    price: 295000,
    basePrice: 295000,
    change24h: -0.62,
    history: [298000, 297500, 297000, 296200, 295500, 294800, 295200, 295000],
    volatility: 0.007
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'Nvidia Corp.',
    icon: 'N',
    color: '#76b900',
    price: 10800,
    basePrice: 10800,
    change24h: 3.45,
    history: [10400, 10480, 10520, 10600, 10680, 10720, 10760, 10800],
    volatility: 0.006
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    icon: 'T',
    color: '#e82127',
    price: 21500,
    basePrice: 21500,
    change24h: -1.25,
    history: [21900, 21850, 21780, 21650, 21700, 21600, 21550, 21500],
    volatility: 0.010
  },
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    icon: 'A',
    color: '#a2aaad',
    price: 18600,
    basePrice: 18600,
    change24h: 0.45,
    history: [18500, 18520, 18540, 18560, 18550, 18580, 18590, 18600],
    volatility: 0.004
  },
  RELIANCE: {
    symbol: 'RELIANCE',
    name: 'Reliance Ind.',
    icon: 'R',
    color: '#005b94',
    price: 2980,
    basePrice: 2980,
    change24h: 0.95,
    history: [2950, 2955, 2960, 2965, 2968, 2972, 2976, 2980],
    volatility: 0.005
  }
};

const INITIAL_BOTS = [
  { id: 'bot-1', name: 'AlphaQuant', baseReturn: 14.8, returnPct: 14.8, drift: 0.08, address: '0x1B82...3eC9', icon: 'AQ' },
  { id: 'bot-2', name: 'LeverageKing', baseReturn: 9.4, returnPct: 9.4, drift: 0.15, address: '0x7E31...A42d', icon: 'LK' },
  { id: 'bot-3', name: 'NiftyScalper', baseReturn: 4.6, returnPct: 4.6, drift: 0.04, address: '0x99A1...88cF', icon: 'NS' },
  { id: 'bot-4', name: 'DeltaNeutral', baseReturn: 1.2, returnPct: 1.2, drift: 0.02, address: '0x43b2...11d0', icon: 'DN' },
  { id: 'bot-5', name: 'SatoshiHodl', baseReturn: -2.8, returnPct: -2.8, drift: 0.10, address: '0x00F8...d991', icon: 'SH' },
  { id: 'bot-6', name: 'YoloTrader', baseReturn: -8.5, returnPct: -8.5, drift: 0.22, address: '0xDEAD...BEEF', icon: 'YT' }
];

let state = {
  cash: STARTING_BALANCE,
  positions: [],
  history: [],
  selectedAssetKey: 'BTC',
  selectedDirection: 'LONG',
  selectedLeverage: 5,
  selectedLeverage: 10,
  marginAmount: 10000,
  activeRightView: 'leaderboard', // 'leaderboard' or 'positions'
  activeGraphTarget: 'portfolio', // 'portfolio' or asset key ('BTC', 'ETH', etc.)
  bots: JSON.parse(JSON.stringify(INITIAL_BOTS)),
  portfolioHistory: [100000, 100000, 100200, 100500, 100400, 100800, 101200, 101859.48]
};

// 2. Formatting Helpers
function formatINR(val) {
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

function formatINRPrecise(val) {
  return '₹' + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(val) {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle-2';
  if (type === 'danger') iconName = 'alert-triangle';

  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4 toast-icon shrink-0"></i>
    <div class="flex-1">${message}</div>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// 3. Stock Selector Switcher
function setGraphTarget(target) {
  state.activeGraphTarget = target;

  // If a stock is selected, pre-set the trade modal target to that stock
  if (target !== 'portfolio') {
    state.selectedAssetKey = target;
    const selectAssetEl = document.getElementById('modal-select-asset');
    if (selectAssetEl) selectAssetEl.value = target;
  }

  // Update pill styles
  const pills = document.querySelectorAll('.asset-target-pill');
  pills.forEach(pill => {
    const pTarget = pill.getAttribute('data-target');
    if (pTarget === target) {
      pill.className = 'asset-target-pill px-3 py-1 rounded-xl text-xs font-bold transition-all border border-[#d4ff00] text-[#d4ff00] bg-[#d4ff00]/10 shrink-0';
    } else {
      pill.className = 'asset-target-pill px-3 py-1 rounded-xl text-xs font-semibold transition-all bg-[#1b1c24] border border-white/[0.06] text-zinc-400 hover:text-white shrink-0';
    }
  });

  updateMetricsUI();
  drawChart();
}

// 4. Interactive Canvas Chart (Dynamic for Portfolio & Individual Stocks)
function drawChart() {
  const canvas = document.getElementById('chart-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  if (rect.width === 0 || rect.height === 0) return;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);

  // A. Background Vertical Histogram Bars
  const barCount = Math.max(30, Math.floor(width / 11));
  const barWidth = 2;
  const gap = (width - barCount * barWidth) / (barCount - 1);

  for (let i = 0; i < barCount; i++) {
    const x = i * (barWidth + gap);
    const normX = i / barCount;
    const factor = Math.sin(normX * Math.PI * 3.5) * 0.35 + 0.55;
    const barHeight = Math.max(12, height * 0.65 * factor * ((i % 3 === 0) ? 0.9 : 0.6));
    const y = height - barHeight - 15;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.055)';
    ctx.fillRect(x, y, barWidth, barHeight);
  }

  // B. Data Buffer Selection (Portfolio vs Stock)
  const isPortfolio = state.activeGraphTarget === 'portfolio';
  const data = isPortfolio
    ? state.portfolioHistory
    : (ASSETS[state.activeGraphTarget] ? ASSETS[state.activeGraphTarget].history : state.portfolioHistory);

  if (!data || data.length < 2) return;

  const minVal = Math.min(...data) * 0.998;
  const maxVal = Math.max(...data) * 1.002;
  const range = (maxVal - minVal) || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 40) + 10;
    const y = height - 25 - ((val - minVal) / range) * (height - 65);
    return { x, y, val };
  });

  // Draw Spline Curve
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);

  // Line Style (Neon Lime)
  ctx.strokeStyle = '#d4ff00';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(212, 255, 0, 0.45)';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // C. Crosshair & Active Point
  const activePtIndex = Math.min(points.length - 2, Math.floor(points.length * 0.65));
  const activePt = points[activePtIndex] || last;

  // Vertical Dashed Crosshair Line
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.moveTo(activePt.x, 15);
  ctx.lineTo(activePt.x, height - 15);
  ctx.stroke();
  ctx.setLineDash([]);

  // Glowing Circle Marker on Line
  ctx.beginPath();
  ctx.arc(activePt.x, activePt.y, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#0d0e12';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#d4ff00';
  ctx.stroke();

  // Position Tooltip Pin with Contextual Value
  const tooltip = document.getElementById('chart-tooltip');
  const tooltipText = document.getElementById('chart-tooltip-text');
  if (tooltip && tooltipText) {
    tooltip.classList.remove('hidden');
    tooltip.style.left = `${activePt.x}px`;
    tooltip.style.top = `${activePt.y - 12}px`;

    if (isPortfolio) {
      const diff = activePt.val - STARTING_BALANCE;
      const sign = diff >= 0 ? '+' : '';
      tooltipText.textContent = `${sign}${formatINRPrecise(diff)}`;
    } else {
      tooltipText.textContent = formatINRPrecise(activePt.val);
    }
  }
}

// 5. Portfolio Calculations & Risk Score Calculation
function calculatePortfolioMetrics() {
  const investedMargin = state.positions.reduce((sum, p) => sum + p.margin, 0);
  const totalUnrealizedPnL = state.positions.reduce((sum, p) => sum + (p.unrealizedPnL || 0), 0);
  const totalRealizedPnL = state.history.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalPortfolioValue = state.cash + investedMargin + totalUnrealizedPnL;
  const totalReturnPct = ((totalPortfolioValue - STARTING_BALANCE) / STARTING_BALANCE) * 100;

  let riskScore = 15;
  if (state.positions.length > 0) {
    const avgLev = state.positions.reduce((sum, p) => sum + p.leverage, 0) / state.positions.length;
    const marginRatio = investedMargin / (totalPortfolioValue || 1);
    riskScore = Math.min(95, Math.round(15 + (avgLev * 3.5) + (marginRatio * 35)));
  }

  return {
    cash: state.cash,
    investedMargin,
    totalUnrealizedPnL,
    totalRealizedPnL,
    totalPortfolioValue,
    totalReturnPct,
    riskScore
  };
}

// 6. Update Metrics & Top Hero Display
function updateMetricsUI() {
  const m = calculatePortfolioMetrics();
  const isPortfolio = state.activeGraphTarget === 'portfolio';

  const heroLabel = document.getElementById('hero-display-label');
  const heroBal = document.getElementById('hero-wallet-value');
  const heroRetVal = document.getElementById('hero-return-val');
  const heroRetBadge = document.getElementById('hero-return-badge');

  if (isPortfolio) {
    if (heroLabel) heroLabel.textContent = 'Wallet Value';
    if (heroBal) heroBal.textContent = formatINRPrecise(m.totalPortfolioValue);
    if (heroRetVal && heroRetBadge) {
      heroRetVal.textContent = formatPercent(m.totalReturnPct);
      heroRetBadge.className = m.totalReturnPct >= 0
        ? 'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#d4ff00]'
        : 'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400';
    }
  } else {
    const asset = ASSETS[state.activeGraphTarget];
    if (asset) {
      if (heroLabel) heroLabel.textContent = `${asset.name} (${asset.symbol}) — Live Price`;
      if (heroBal) heroBal.textContent = formatINRPrecise(asset.price);
      if (heroRetVal && heroRetBadge) {
        heroRetVal.textContent = formatPercent(asset.change24h);
        heroRetBadge.className = asset.change24h >= 0
          ? 'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#d4ff00]'
          : 'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400';
      }
    }
  }

  // Metric 1: Realized PL
  const rPnl = document.getElementById('metric-realized-pnl');
  const rSub = document.getElementById('metric-realized-sub');
  if (rPnl && rSub) {
    const sign = m.totalRealizedPnL >= 0 ? '+' : '';
    rPnl.textContent = `${sign}${formatINRPrecise(m.totalRealizedPnL)}`;
    rPnl.className = `text-base sm:text-lg font-bold ${m.totalRealizedPnL >= 0 ? 'text-white' : 'text-rose-400'}`;
    rSub.textContent = `${state.history.length} trades closed`;
  }

  // Metric 2: Unrealized PL
  const uPnl = document.getElementById('metric-unrealized-pnl');
  const uSub = document.getElementById('metric-unrealized-sub');
  if (uPnl && uSub) {
    const sign = m.totalUnrealizedPnL >= 0 ? '+' : '';
    uPnl.textContent = `${sign}${formatINRPrecise(m.totalUnrealizedPnL)}`;
    uPnl.className = `text-base sm:text-lg font-bold ${m.totalUnrealizedPnL >= 0 ? 'text-white' : 'text-rose-400'}`;
    const unrlPct = m.investedMargin > 0 ? (m.totalUnrealizedPnL / m.investedMargin) * 100 : 0;
    uSub.textContent = `${formatPercent(unrlPct)} on margin`;
  }

  // Metric 3: Available Cash
  const aCash = document.getElementById('metric-available-cash');
  const aSub = document.getElementById('metric-cash-sub');
  if (aCash && aSub) {
    aCash.textContent = formatINR(m.cash);
    const uncommittedPct = Math.round((m.cash / (m.totalPortfolioValue || 1)) * 100);
    aSub.textContent = `${uncommittedPct}% Uncommitted`;
  }

  // Metric 4: Net Change & Rank
  const nChange = document.getElementById('metric-net-change');
  const rLabel = document.getElementById('metric-rank-label');
  if (nChange && rLabel) {
    nChange.textContent = formatPercent(m.totalReturnPct);
    nChange.className = `text-base sm:text-lg font-bold ${m.totalReturnPct >= 0 ? 'text-white' : 'text-rose-400'}`;
  }

  // Portfolio Risk Score Bar
  const riskBar = document.getElementById('risk-score-bar');
  const riskLabel = document.getElementById('risk-level-label');
  if (riskBar && riskLabel) {
    riskBar.style.width = `${m.riskScore}%`;
    if (m.riskScore < 35) {
      riskLabel.textContent = 'Low Risk (1x-2x)';
      riskBar.style.backgroundColor = '#d4ff00';
    } else if (m.riskScore < 70) {
      riskLabel.textContent = 'Moderate Risk (5x)';
      riskBar.style.backgroundColor = '#eab308';
    } else {
      riskLabel.textContent = 'High Risk (10x-20x)';
      riskBar.style.backgroundColor = '#ef4444';
    }
  }

  // Active positions counter in navbar
  const navPosBadge = document.getElementById('nav-pos-count');
  if (navPosBadge) navPosBadge.textContent = state.positions.length;
}

// 7. Right Section View Toggle
function setRightView(view) {
  state.activeRightView = view;
  const navLead = document.getElementById('nav-leaderboard');
  const navPos = document.getElementById('nav-positions');
  const title = document.getElementById('right-view-title');
  const subtitle = document.getElementById('right-view-subtitle');
  const status = document.getElementById('right-view-status');
  const btnShock = document.getElementById('btn-market-shock');

  if (view === 'leaderboard') {
    if (navLead) navLead.className = 'px-3.5 py-1.5 rounded-xl bg-zinc-800 text-white font-semibold transition-all';
    if (navPos) navPos.className = 'px-3.5 py-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all flex items-center gap-1.5';
    if (title) title.textContent = 'Leaderboard';
    if (subtitle) subtitle.textContent = 'Live simulated trader rankings';
    if (status) {
      status.textContent = 'Top 3 Unlock Perks';
      status.className = 'text-xs font-semibold text-[#d4ff00]';
    }
    if (btnShock) btnShock.classList.add('hidden');
  } else {
    if (navPos) navPos.className = 'px-3.5 py-1.5 rounded-xl bg-zinc-800 text-white font-semibold transition-all flex items-center gap-1.5';
    if (navLead) navLead.className = 'px-3.5 py-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all';
    if (title) title.textContent = 'Open Positions';
    if (subtitle) subtitle.textContent = `${state.positions.length} active leveraged trades`;
    if (status) {
      status.textContent = 'Live P&L Tracking';
      status.className = 'text-xs font-semibold text-zinc-400';
    }
    if (btnShock) btnShock.classList.remove('hidden');
  }

  renderTiles();
}

function renderTiles() {
  const container = document.getElementById('tiles-container');
  if (!container) return;

  container.innerHTML = '';

  if (state.activeRightView === 'positions') {
    if (state.positions.length === 0) {
      container.innerHTML = `
        <div class="col-span-1 sm:col-span-2 text-center py-10 bg-[#16171f] rounded-2xl border border-white/[0.05] p-6">
          <i data-lucide="layers" class="w-8 h-8 text-zinc-600 mx-auto mb-2"></i>
          <p class="text-xs text-zinc-400 font-medium">No active leveraged positions</p>
          <button onclick="openTradeModal()" class="mt-3 px-3.5 py-1.5 rounded-xl bg-[#d4ff00] text-black font-extrabold text-xs hover:bg-[#c2eb00] transition-colors">
            + Open Leveraged Trade
          </button>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    state.positions.forEach(pos => {
      const isPos = pos.unrealizedPnL >= 0;
      const isLong = pos.type === 'LONG';
      const asset = ASSETS[pos.asset];
      const curPrice = pos.currentPrice || asset.price;
      const liqPrice = pos.liquidationPrice;

      // Real-time Distance to Liquidation %
      let distanceToLiq = 0;
      if (isLong) {
        distanceToLiq = curPrice > 0 ? ((curPrice - liqPrice) / curPrice) * 100 : 0;
      } else {
        distanceToLiq = curPrice > 0 ? ((liqPrice - curPrice) / curPrice) * 100 : 0;
      }
      distanceToLiq = Math.max(0, distanceToLiq);

      // Remaining Margin Collateral Buffer (100% -> 0% at -90% loss threshold)
      const marginBufferPct = Math.max(0, Math.min(100, (1 + (pos.unrealizedPnL / (pos.margin * 0.9))) * 100));
      const isCritical = distanceToLiq < 2.5 || marginBufferPct < 30;
      const isWarning = !isCritical && (distanceToLiq < 5.0 || marginBufferPct < 60);

      let bufferColor = '#d4ff00';
      if (isCritical) bufferColor = '#ef4444';
      else if (isWarning) bufferColor = '#eab308';

      const tile = document.createElement('div');
      tile.className = `bg-[#171820] border rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-white/[0.14] transition-all ${
        isCritical ? 'border-rose-500/50 shadow-sm shadow-rose-500/20' : 'border-white/[0.06]'
      }`;

      tile.innerHTML = `
        <!-- Tier 1: Asset Info on Left, Close Action on Right -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0" style="background-color: ${asset.color}25; color: ${asset.color};">
              ${asset.icon || pos.asset[0]}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-xs text-white truncate">${pos.asset}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded font-black shrink-0 ${isLong ? 'bg-[#d4ff00]/15 text-[#d4ff00]' : 'bg-rose-500/15 text-rose-400'}">
                  ${pos.type} ${pos.leverage}x
                </span>
              </div>
              <span class="text-[10px] text-zinc-500 block leading-tight">${pos.time}</span>
            </div>
          </div>
          <button onclick="handleClosePosition('${pos.id}')" class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold transition-colors shrink-0">
            Close
          </button>
        </div>

        <!-- Tier 2: Core Financials (2-column split) -->
        <div class="grid grid-cols-2 gap-2 py-2 border-y border-white/[0.04]">
          <div>
            <span class="text-[10px] text-zinc-500 block">Unrealized P&L</span>
            <span class="text-xs font-bold ${isPos ? 'text-[#d4ff00]' : 'text-rose-400'} block truncate">
              ${isPos ? '+' : ''}${formatINRPrecise(pos.unrealizedPnL)}
            </span>
            <span class="text-[10px] font-semibold ${isPos ? 'text-[#d4ff00]/80' : 'text-rose-400/80'} block">
              ${formatPercent(pos.pnlPercent)}
            </span>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-zinc-500 block">Margin Locked</span>
            <span class="text-xs font-bold text-zinc-200 block truncate">${formatINR(pos.margin)}</span>
            <span class="text-[10px] text-zinc-500 block truncate">Liq: ${formatINR(liqPrice)}</span>
          </div>
        </div>

        <!-- Tier 3: Safety & Liquidation Buffer Bar -->
        <div class="space-y-1">
          <div class="flex justify-between items-center text-[10px]">
            <span class="text-zinc-400 font-medium">Margin Health</span>
            <span class="font-bold ${
              isCritical
                ? 'text-rose-400 animate-pulse'
                : isWarning
                ? 'text-amber-400'
                : 'text-[#d4ff00]'
            }">
              ${distanceToLiq.toFixed(1)}% to Liq
            </span>
          </div>
          <div class="w-full bg-[#0e0f14] h-1.5 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-300" style="width: ${marginBufferPct}%; background-color: ${bufferColor};"></div>
          </div>
        </div>
      `;
      container.appendChild(tile);
    });

  } else {
    // Leaderboard Tiles
    const m = calculatePortfolioMetrics();

    const participants = [
      {
        id: 'user',
        name: 'You (Trader)',
        returnPct: m.totalReturnPct,
        balance: m.totalPortfolioValue,
        address: '0xA7F3...B0fEa2',
        icon: 'YOU',
        isUser: true,
        action: 'Leveraged Margin'
      },
      ...state.bots.map(b => ({
        id: b.id,
        name: b.name,
        returnPct: b.returnPct,
        balance: STARTING_BALANCE * (1 + b.returnPct / 100),
        address: b.address,
        icon: b.icon,
        isUser: false,
        action: b.returnPct >= 0 ? 'Receive / Long' : 'Send / Short'
      }))
    ];

    participants.sort((a, b) => b.returnPct - a.returnPct);

    const userRank = participants.findIndex(p => p.isUser) + 1;
    const rLabel = document.getElementById('metric-rank-label');
    if (rLabel) rLabel.textContent = `Rank #${userRank} of ${participants.length}`;

    participants.slice(0, 6).forEach((player, index) => {
      const rank = index + 1;
      const isTop3 = rank <= 3;
      const isFirst = rank === 1;

      const tile = document.createElement('div');

      if (isFirst) {
        tile.className = 'bg-[#d4ff00] text-black rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-[#d4ff00]/25 transition-all select-none min-h-[110px]';
        tile.innerHTML = `
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-7 h-7 rounded-full bg-black/15 flex items-center justify-center font-black text-[10px] text-black shrink-0">
                ${player.icon}
              </div>
              <span class="font-extrabold text-xs text-black truncate">${player.name}</span>
            </div>
            <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-black/15 text-black shrink-0 tracking-wide">
              Perks
            </span>
          </div>

          <div class="mt-3 flex items-end justify-between">
            <div>
              <span class="text-sm font-black block leading-none">${formatPercent(player.returnPct)}</span>
              <span class="text-[10px] text-black/75 font-semibold block mt-1">Confirmed</span>
            </div>
            <span class="text-xs font-black text-black/90">${formatINR(player.balance)}</span>
          </div>
        `;
      } else {
        tile.className = `bg-[#171820] border rounded-2xl p-4 flex flex-col justify-between hover:border-white/[0.14] transition-all select-none min-h-[110px] ${
          player.isUser ? 'border-[#d4ff00]/60 ring-1 ring-[#d4ff00]/40' : 'border-white/[0.06]'
        }`;

        tile.innerHTML = `
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-7 h-7 rounded-full bg-zinc-800 border border-white/[0.06] flex items-center justify-center font-bold text-[10px] text-white shrink-0">
                ${player.icon}
              </div>
              <span class="font-bold text-xs ${player.isUser ? 'text-[#d4ff00]' : 'text-white'} truncate">
                ${player.name}
              </span>
            </div>

            ${
              isTop3
                ? `<span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30 shrink-0">
                    Perks
                  </span>`
                : `<span class="text-[11px] font-mono text-zinc-500 shrink-0">#${rank}</span>`
            }
          </div>

          <div class="mt-3 flex items-end justify-between">
            <div>
              <span class="text-xs font-bold ${player.returnPct >= 0 ? 'text-white' : 'text-rose-400'} block leading-none">
                ${formatPercent(player.returnPct)}
              </span>
              <span class="text-[10px] text-zinc-500 block mt-1">
                ${player.returnPct >= 0 ? 'Confirmed' : 'Pending'}
              </span>
            </div>
            <span class="text-xs text-zinc-400 font-medium">${formatINR(player.balance)}</span>
          </div>
        `;
      }

      container.appendChild(tile);
    });
  }

  lucide.createIcons();
}

// 8. Market Engine (Simulated Random Walk every 1.5s)
function updateMarket() {
  Object.keys(ASSETS).forEach(key => {
    const asset = ASSETS[key];
    const drift = (Math.random() - 0.495) * asset.volatility;
    const oldPrice = asset.price;
    const newPrice = Math.max(1, oldPrice * (1 + drift));
    asset.price = newPrice;
    asset.change24h = ((newPrice - asset.basePrice) / asset.basePrice) * 100;

    // Record stock price history
    asset.history.push(newPrice);
    if (asset.history.length > 25) {
      asset.history.shift();
    }
  });

  state.bots.forEach(b => {
    const noise = (Math.random() - 0.49) * b.drift;
    b.returnPct += noise;
  });

  evaluatePositions();

  const m = calculatePortfolioMetrics();
  state.portfolioHistory.push(m.totalPortfolioValue);
  if (state.portfolioHistory.length > 25) {
    state.portfolioHistory.shift();
  }

  drawChart();
  updateMetricsUI();
  renderTiles();
  updateModalSummary();
}

// 9. Positions Evaluation & Liquidation Engine
function evaluatePositions() {
  let hasLiq = false;

  state.positions = state.positions.filter(pos => {
    const asset = ASSETS[pos.asset];
    const currentPrice = asset.price;

    let delta = 0;
    if (pos.type === 'LONG') {
      delta = (currentPrice - pos.entryPrice) / pos.entryPrice;
    } else {
      delta = (pos.entryPrice - currentPrice) / pos.entryPrice;
    }

    pos.unrealizedPnL = pos.margin * pos.leverage * delta;
    pos.pnlPercent = (pos.unrealizedPnL / pos.margin) * 100;
    pos.currentPrice = currentPrice;

    if (pos.unrealizedPnL <= -pos.margin * 0.9) {
      hasLiq = true;
      const refund = Math.max(0, pos.margin + pos.unrealizedPnL);
      state.cash += refund;

      state.history.unshift({
        asset: pos.asset,
        type: pos.type,
        leverage: pos.leverage,
        margin: pos.margin,
        pnl: -pos.margin * 0.9,
        pnlPercent: -90,
        status: 'LIQUIDATED',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      showToast(`Position Liquidated: ${pos.leverage}x ${pos.type} on ${pos.asset} reached -90% margin threshold.`, 'danger');
      openLiquidationModal(pos);
      showToast(`Position Liquidated: ${pos.leverage}x ${pos.type} on ${pos.asset} wiped out (-90% margin).`, 'danger');
      return false;
    }
    return true;
  });

  if (hasLiq) {
    updateMetricsUI();
    renderTiles();
  }
}

// Liquidation Educational Modal Controls
function openLiquidationModal(pos) {
  const modal = document.getElementById('liquidation-modal');
  if (!modal) return;

  const levEl = document.getElementById('liq-modal-lev');
  const entryEl = document.getElementById('liq-modal-entry');
  const priceEl = document.getElementById('liq-modal-price');
  const lossEl = document.getElementById('liq-modal-loss');
  const subtitleEl = document.getElementById('liq-modal-subtitle');

  if (levEl) levEl.textContent = `${pos.leverage}x (${pos.type})`;
  if (entryEl) entryEl.textContent = formatINRPrecise(pos.entryPrice);
  if (priceEl) priceEl.textContent = formatINRPrecise(pos.currentPrice || pos.liquidationPrice);
  if (lossEl) lossEl.textContent = `-${formatINR(pos.margin * 0.9)}`;
  if (subtitleEl) subtitleEl.textContent = `${pos.asset} breached liquidation threshold`;

  modal.classList.remove('hidden');
}

function closeLiquidationModal() {
  const modal = document.getElementById('liquidation-modal');
  if (modal) modal.classList.add('hidden');
}

// Educational Market Shock Simulator (-3.5% sudden drop to test leverage)
function simulateMarketShock() {
  const targetKey = state.activeGraphTarget !== 'portfolio'
    ? state.activeGraphTarget
    : (state.positions.length > 0 ? state.positions[0].asset : 'BTC');
  const asset = ASSETS[targetKey];
  if (!asset) return;

  const shockPct = 0.035; // -3.5% sharp move
  const oldPrice = asset.price;
  asset.price = Math.max(1, oldPrice * (1 - shockPct));
  asset.change24h = ((asset.price - asset.basePrice) / asset.basePrice) * 100;
  asset.history.push(asset.price);
  if (asset.history.length > 25) asset.history.shift();

  showToast(`Market Shock: ${targetKey} fell 3.5% instantly`, 'danger');

  evaluatePositions();
  updateMetricsUI();
  drawChart();
  renderTiles();
  updateModalSummary();
}

// 10. Close Position Action
function handleClosePosition(id) {
  const idx = state.positions.findIndex(p => p.id === id);
  if (idx === -1) return;

  const pos = state.positions[idx];
  const pnl = pos.unrealizedPnL;
  const net = pos.margin + pnl;

  state.cash += Math.max(0, net);

  state.history.unshift({
    asset: pos.asset,
    type: pos.type,
    leverage: pos.leverage,
    margin: pos.margin,
    pnl: pnl,
    pnlPercent: pos.pnlPercent,
    status: 'CLOSED',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  state.positions.splice(idx, 1);

  if (pnl >= 0) {
    showToast(`Realized Profit: +${formatINR(pnl)} (+${pos.pnlPercent.toFixed(1)}%)`, 'success');
  } else {
    showToast(`Realized Loss: ${formatINR(pnl)} (${pos.pnlPercent.toFixed(1)}%)`, 'danger');
  }

  updateMetricsUI();
  renderTiles();
}

// 11. Leveraged Trade Modal Controls
function openTradeModal() {
  const modal = document.getElementById('trade-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.getElementById('modal-avail-cash').textContent = formatINR(state.cash);
    updateModalSummary();
  }
}

function closeTradeModal() {
  const modal = document.getElementById('trade-modal');
  if (modal) modal.classList.add('hidden');
}

function updateModalSummary() {
  const asset = ASSETS[state.selectedAssetKey];
  if (!asset) return;

  const margin = Number(document.getElementById('modal-input-margin').value) || 0;
  const lev = state.selectedLeverage;
  const curPrice = asset.price;

  const exposure = margin * lev;
  document.getElementById('modal-summary-exposure').textContent = formatINR(exposure);
  document.getElementById('modal-summary-price').textContent = formatINRPrecise(curPrice);
  const expEl = document.getElementById('modal-summary-exposure');
  if (expEl) expEl.textContent = formatINR(exposure);

  const priceEl = document.getElementById('modal-summary-price');
  if (priceEl) priceEl.textContent = formatINRPrecise(curPrice);

  let liq = 0;
  if (state.selectedDirection === 'LONG') {
    liq = curPrice * (1 - (0.9 / lev));
    liq = Math.max(0, curPrice * (1 - (0.9 / lev)));
  } else {
    liq = curPrice * (1 + (0.9 / lev));
  }
  document.getElementById('modal-summary-liq').textContent = formatINRPrecise(liq);
  const liqEl = document.getElementById('modal-summary-liq');
  if (liqEl) liqEl.textContent = formatINRPrecise(liq);

  // Dynamic sensitivity & threshold calculations
  const sensEl = document.getElementById('modal-sensitivity-text');
  if (sensEl) {
    sensEl.textContent = `1% Move = ${lev}% Margin Gain/Loss`;
  }
  const threshEl = document.getElementById('modal-threshold-text');
  if (threshEl) {
    const bufferPct = (90 / lev).toFixed(1);
    threshEl.textContent = `-${bufferPct}% Move Erases Margin`;
  }

  // Update submit button text
  const submitText = document.getElementById('modal-btn-submit-text');
  if (submitText) {
    submitText.textContent = `Execute ${lev}x ${state.selectedDirection} Position`;
  }

  const levLabel = document.getElementById('modal-leverage-label');
  if (levLabel) {
    levLabel.textContent = `${lev}x Leverage`;
  }
}

function executeModalOrder() {
  const margin = Number(document.getElementById('modal-input-margin').value);

  if (isNaN(margin) || margin < 100) {
    showToast('Minimum margin is ₹100', 'danger');
    return;
  }

  if (margin > state.cash) {
    showToast(`Insufficient balance! Available: ${formatINR(state.cash)}`, 'danger');
    return;
  }

  const asset = ASSETS[state.selectedAssetKey];
  const lev = state.selectedLeverage;
  const type = state.selectedDirection;
  const curPrice = asset.price;

  state.cash -= margin;

  let liq = 0;
  if (type === 'LONG') {
    liq = curPrice * (1 - (0.9 / lev));
    liq = Math.max(0, curPrice * (1 - (0.9 / lev)));
  } else {
    liq = curPrice * (1 + (0.9 / lev));
  }

  state.positions.unshift({
    id: 'pos-' + Date.now(),
    asset: state.selectedAssetKey,
    type,
    leverage: lev,
    margin,
    exposure: margin * lev,
    entryPrice: curPrice,
    liquidationPrice: liq,
    unrealizedPnL: 0,
    pnlPercent: 0,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  closeTradeModal();
  showToast(`Executed ${lev}x ${type} on ${state.selectedAssetKey} with ${formatINR(margin)} margin`, 'success');

  setRightView('positions');
  updateMetricsUI();
}

// 12. Reset Simulator
function handleResetSimulation() {
  state.cash = STARTING_BALANCE;
  state.positions = [];
  state.history = [];
  state.portfolioHistory = [100000, 100000, 100100, 100000];
  state.bots = JSON.parse(JSON.stringify(INITIAL_BOTS));
  state.activeGraphTarget = 'portfolio';
  state.selectedLeverage = 10;

  Object.keys(ASSETS).forEach(k => {
    ASSETS[k].price = ASSETS[k].basePrice;
    ASSETS[k].change24h = 0;
  });

  // Reset pill UI
  const pills = document.querySelectorAll('.asset-target-pill');
  pills.forEach(pill => {
    if (pill.getAttribute('data-target') === 'portfolio') {
      pill.className = 'asset-target-pill px-3 py-1 rounded-xl text-xs font-bold transition-all border border-[#d4ff00] text-[#d4ff00] bg-[#d4ff00]/10 shrink-0';
    } else {
      pill.className = 'asset-target-pill px-3 py-1 rounded-xl text-xs font-semibold transition-all bg-[#1b1c24] border border-white/[0.06] text-zinc-400 hover:text-white shrink-0';
    }
  });

  // Reset leverage buttons in modal to 10x
  const levBtns = document.querySelectorAll('.btn-modal-lev');
  levBtns.forEach(b => {
    if (b.getAttribute('data-lev') === '10') {
      b.className = 'btn-modal-lev py-2 rounded-xl bg-[#d4ff00] text-black border border-[#d4ff00] text-xs font-bold';
    } else {
      b.className = 'btn-modal-lev py-2 rounded-xl bg-[#1b1c24] border border-white/[0.06] text-xs font-bold text-zinc-300 hover:border-[#d4ff00]';
    }
  });

  updateMetricsUI();
  renderTiles();
  drawChart();
  showToast('Simulator reset to fresh ₹1,00,000 baseline.', 'info');
}

// 13. Initialization
document.addEventListener('DOMContentLoaded', () => {
  const selectAssetEl = document.getElementById('modal-select-asset');
  if (selectAssetEl) {
    selectAssetEl.innerHTML = Object.keys(ASSETS).map(key => {
      const a = ASSETS[key];
      return `<option value="${key}">${key} — ${a.name} (${formatINRPrecise(a.price)})</option>`;
    }).join('');

    selectAssetEl.addEventListener('change', (e) => {
      state.selectedAssetKey = e.target.value;
      updateModalSummary();
    });
  }

  const tabLong = document.getElementById('modal-tab-long');
  const tabShort = document.getElementById('modal-tab-short');
  const submitText = document.getElementById('modal-btn-submit-text');

  tabLong.addEventListener('click', () => {
    state.selectedDirection = 'LONG';
    tabLong.className = 'py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-[#d4ff00] text-black shadow-md shadow-[#d4ff00]/20';
    tabShort.className = 'py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-zinc-400 hover:text-white';
    submitText.textContent = 'Execute Long Position';
    updateModalSummary();
  });

  tabShort.addEventListener('click', () => {
    state.selectedDirection = 'SHORT';
    tabShort.className = 'py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-rose-500 text-white shadow-md shadow-rose-500/20';
    tabLong.className = 'py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-zinc-400 hover:text-white';
    submitText.textContent = 'Execute Short Position';
    updateModalSummary();
  });

  const levBtns = document.querySelectorAll('.btn-modal-lev');
  levBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lev = Number(btn.getAttribute('data-lev'));
      state.selectedLeverage = lev;

      levBtns.forEach(b => {
        b.className = 'btn-modal-lev py-2 rounded-xl bg-[#1b1c24] border border-white/[0.06] text-xs font-bold text-zinc-300 hover:border-[#d4ff00]';
      });

      btn.className = 'btn-modal-lev py-2 rounded-xl bg-[#d4ff00] text-black border border-[#d4ff00] text-xs font-bold';
      document.getElementById('modal-leverage-label').textContent = `${lev}x Leverage`;
      updateModalSummary();
    });
  });

  const pctBtns = document.querySelectorAll('.btn-modal-pct');
  pctBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const pct = Number(btn.getAttribute('data-pct'));
      const amt = Math.floor(state.cash * (pct / 100));
      document.getElementById('modal-input-margin').value = amt;
      updateModalSummary();
    });
  });

  document.getElementById('modal-input-margin').addEventListener('input', updateModalSummary);
  document.getElementById('btn-quick-reset').addEventListener('click', handleResetSimulation);

  const tfBtns = document.querySelectorAll('[data-tf]');
  tfBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tfBtns.forEach(b => b.className = 'px-2 py-0.5 rounded-md hover:text-white transition-colors text-zinc-400');
      btn.className = 'px-2 py-0.5 rounded-md border border-[#d4ff00] text-[#d4ff00] font-semibold bg-[#d4ff00]/10';
    });
  });

  window.addEventListener('resize', () => {
    drawChart();
  });

  setTimeout(drawChart, 100);
  updateMetricsUI();
  renderTiles();

  setInterval(updateMarket, 1500);
});
