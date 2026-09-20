# Architecture & System Design — Mocha Practice

## 1. System Overview
**Mocha Practice** is a high-performance, minimalist paper/fake trading simulator MVP designed for new traders to practice leveraged trading (1x–20x Long/Short) risk-free with a ₹1,00,000 demo balance.
**Mocha Practice** is a high-performance, minimalist paper/fake trading simulator MVP designed for new traders to practice leveraged trading (1x–50x Long/Short) risk-free with a ₹1,00,000 demo balance.

The application features:
- **Comprehensive Leverage & Liquidation Education**:
  - Full support for **1x, 2x, 5x, 10x, 20x, and 50x** leverage multipliers.
  - **Educational Volatility Sensitivity**: Real-time modal feedback demonstrating the amplification factor ($1\% \text{ price move} = \text{Leverage} \times 1\% \text{ margin gain/loss}$) and liquidation buffer ($-\frac{90\%}{\text{Leverage}}$ price drop threshold).
  - **Dynamic Liquidation Proximity & Health Meter**: Active positions show real-time percentage distance to liquidation (`X.X% to Liq`), color-coded margin buffer bars (green $\to$ amber $\to$ red), and pulsing warning rings when within critical risk thresholds (< 2.5%).
  - **Educational Liquidation Modal**: Detailed post-mortem modal explaining margin depletion mechanics, entry price, liquidation mark, and net loss.
  - **Simulate Market Shock (-3.5%)**: Stress-testing button enabling users to trigger an instantaneous 3.5% market drop to witness leverage risk in real time.
- **Pure Minimalist Typography & Zero Emojis**: Replaced all emojis and informal symbols with crisp letter monograms (`B`, `E`, `N`, `T`, `A`, `R`, `AQ`, `LK`), professional status badges (`Perks`, `Confirmed`), and sharp vector Lucide SVG icons.
- **Interactive Stock Selector & Dynamic Graph**: Users can switch between the overall **Portfolio equity curve** and individual live stock/crypto price graphs (**BTC**, **ETH**, **NVDA**, **TSLA**, **AAPL**, **RELIANCE**) directly on the main canvas.
- **Full-Screen 100vh Viewport**: Expansive, non-scrolling desktop trading terminal experience spanning 100% of viewport width and height (`100vw`, `100vh`).
- **Single Source of Navigation**: Top navigation bar exclusively manages all primary views (**Trade**, **Leaderboard**, **Positions**) and global actions (Reset).
- **Fintech Dark Aesthetic**: Matte carbon surfaces (`#08080a`, `#0d0e12`, `#131419`), hairline borders, and electric neon lime (`#d4ff00`) accents.

---

## 2. Technical Architecture & Component Hierarchy

```
+-----------------------------------------------------------------------------------------+
|                                Mocha Practice (100vh Minimum)                           |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  |                           Top Navigation Bar                                      |  |
|  |  - Brand Logo (mocha)         - [Trade] (Trigger Modal)                           |  |
|  |  - [Leaderboard] (View Tab)   - [Positions (N)] (View Tab)                        |  |
|  |  - Trader Monogram [T]        - Quick Reset (₹1,00,000)                           |  |
|  +-----------------------------------------------------------------------------------+  |
|                                                                                         |
|  +---------------------------------------+  +----------------------------------------+  |
|  |         LEFT COLUMN (flex-1)          |  |         RIGHT COLUMN (flex-1)          |  |
|  |                                       |  |                                        |  |
|  |  +---------------------------------+  |  |  +----------------------------------+  |  |
|  |  |   Hero Card (Dynamic Display)   |  |  |  |       Portfolio Risk Score       |  |  |
|  |  |  - Dynamic Headline (Wallet/Stk)|  |  |  |  - Segmented Neon Lime Progress  |  |  |
|  |  |  - Return / 24h Change Badge    |  |  |  |  - Dynamic Risk Classification    |  |  |
|  |  |  - Timeframe Filters (6m active)|  |  +----------------------------------+  |  |
|  |  |  - Asset Selector Pills:        |  |                                           |  |
|  |  |    [Port] [BTC] [ETH] [NVDA]... |  |  +----------------------------------+  |  |
|  |  |  - Dynamic Dual-Layer Canvas    |  |  |    De-Cluttered Card Grid (2-Col)|  |  |
|  |  |    * Volume Histogram Bars      |  |  |  - Leaderboard View (Top 6 Bots) |  |  |
|  |  |    * Neon Spline (Port/Stock)   |  |  |  - Positions View (3-Tier Cards):|  |  |
|  |  |    * Crosshair & Tooltip Pin    |  |  |    1. Header: Asset & Close Action |  |
|  |  +---------------------------------+  |  |    2. Financials: PnL & Margin Grid|  |
|  |                                       |  |    3. Health: Liq Distance & Bar  |  |
|  |  +---------------------------------+  |  |    * [Simulate Shock (-3.5%)]    |  |
|  |  |      4 Metric Cards Strip       |  |  +----------------------------------+  |  |
|  |  |  1. Realized PL                 |  |  +----------------------------------------+  |
|  |  |  2. Unrealized PL               |  |  |       Slide-Up Trade Modal             |  |
|  |  |  3. Available Cash              |  |  |  - 6 Mock Assets (BTC, ETH, ...)       |  |
|  |  |  4. Net Change & Rank           |  |  |  - Long/Short & 1x-50x Leverage        |  |
|  |  +---------------------------------+  |  |  - Volatility Sensitivity Explainer    |  |
|  +---------------------------------------+  |  - Liquidation Buffer Calculator       |  |
|                                             |  - Collateral Input & 25-100% Presets  |  |
|  +---------------------------------------+  +----------------------------------------+  |
|  |      Educational Liquidation Modal    |                                               |
|  |  - Post-mortem Analysis               |                                               |
|  |  - Loss Breakdown & Why It Happened   |                                               |
|  +---------------------------------------+-----------------------------------------------+
+-----------------------------------------------------------------------------------------+
```

---

## 3. Data Models & Schemas

### 3.1 Global State Model (`state`)
```typescript
interface AppState {
  cash: number;                  // Available uncommitted margin (starts at ₹1,00,000)
  positions: LeveragedPosition[];// Active open leveraged positions
  history: ClosedTrade[];        // History of settled trades (closed or liquidated)
  selectedAssetKey: string;      // Current active asset ('BTC', 'ETH', 'NVDA', etc.)
  selectedDirection: 'LONG' | 'SHORT';
  selectedLeverage: 1 | 2 | 5 | 10 | 20;
  selectedLeverage: 1 | 2 | 5 | 10 | 20 | 50;
  marginAmount: number;          // Collateral allocated for order
  activeRightView: 'leaderboard' | 'positions';
  activeGraphTarget: 'portfolio' | 'BTC' | 'ETH' | 'NVDA' | 'TSLA' | 'AAPL' | 'RELIANCE';
  bots: SimulatedBot[];          // Competitor bots for leaderboard (monograms AQ, LK, etc.)
  portfolioHistory: number[];    // Buffer of equity values driving canvas chart
}
```

### 3.2 Asset Specification
### 3.2 Leveraged Position Model
```typescript
interface Asset {
  symbol: string;               // e.g. "BTC", "NVDA"
  name: string;                 // e.g. "Bitcoin", "Nvidia Corp."
  icon: string;                 // Clean letter monogram ("B", "N", "T", etc.)
  color: string;
  price: number;
  basePrice: number;
  change24h: number;
  history: number[];            // Live price history buffer (up to 25 points)
  volatility: number;
interface LeveragedPosition {
  id: string;                    // Unique identifier e.g. "pos-172685..."
  asset: string;                 // Asset symbol ('BTC', 'ETH', etc.)
  type: 'LONG' | 'SHORT';
  leverage: number;              // 1x, 2x, 5x, 10x, 20x, 50x
  margin: number;                // Collateral locked in INR
  exposure: number;              // Total position size (margin * leverage)
  entryPrice: number;            // Asset execution price
  liquidationPrice: number;      // Calculated price threshold triggering liquidation
  unrealizedPnL: number;         // Live floating profit / loss
  pnlPercent: number;            // PnL relative to committed margin
  time: string;                  // Timestamp
}
```

---

## 4. Mathematical Engine & Formulas

### 4.1 Dual-Layer Dynamic Canvas Chart
1. **Background Volume Histogram**:
   - Drawn using vertical lines across dynamic canvas width with sinusoidal height modulation:
   $$H_i = H_{\text{max}} \times \left(0.55 + 0.35 \times \sin\left(\frac{i}{N} \cdot 3.5\pi\right)\right)$$
2. **Foreground Equity / Stock Price Spline**:
   - Data source switches dynamically:
     - When `activeGraphTarget === 'portfolio'`: renders `portfolioHistory` and tooltip displays net profit/loss.
     - When `activeGraphTarget === 'BTC' | ...`: renders the asset's live price history (`asset.history`) and tooltip displays actual live stock price in ₹.
   - Smooth quadratic Bezier spline interpolation with neon lime glow (`#d4ff00`).
   - Switches dynamically between `portfolioHistory` (net return PnL) and asset `history` (live spot price in ₹).
   - Rendered using quadratic Bezier curve smoothing with neon lime halo glow (`#d4ff00`).

### 4.2 Portfolio Risk Score Formula
The risk score meter ($0\% \text{ to } 100\%$) quantifies exposure dynamically:
$$\text{Risk Score} = \min\left(95,\, 15 + (\overline{\text{Leverage}} \times 3.5) + \left(\frac{\text{Margin}_{\text{active}}}{\text{Portfolio Value}} \times 35\right)\right)$$
- Uncommitted balance: **15% (Low Risk)**
- Moderate positions (2x–5x): **35%–65% (Moderate Risk)**
- High leverage positions (10x–20x): **75%–95% (High Risk)**
- Low Risk (1x–2x): **15%–35%**
- Moderate Risk (5x): **35%–70%**
- High Risk (10x–50x): **70%–95%**

### 4.3 Leveraged Trading & Liquidation Threshold
- **Long P&L**:
  $$\text{PnL}_{\text{Long}} = \text{Margin} \times \text{Leverage} \times \frac{P_{\text{current}} - P_{\text{entry}}}{P_{\text{entry}}}$$
- **Short P&L**:
  $$\text{PnL}_{\text{Short}} = \text{Margin} \times \text{Leverage} \times \frac{P_{\text{entry}} - P_{\text{current}}}{P_{\text{entry}}}$$
- **Liquidation**: Occurs when $\text{PnL} \le -0.90 \times \text{Margin}$.
### 4.3 Leveraged Trading, Sensitivity, & Liquidation
1. **Total Exposure**:
   $$\text{Exposure} = \text{Margin} \times \text{Leverage}$$
2. **Long Floating P&L**:
   $$\text{PnL}_{\text{Long}} = \text{Margin} \times \text{Leverage} \times \frac{P_{\text{current}} - P_{\text{entry}}}{P_{\text{entry}}}$$
3. **Short Floating P&L**:
   $$\text{PnL}_{\text{Short}} = \text{Margin} \times \text{Leverage} \times \frac{P_{\text{entry}} - P_{\text{current}}}{P_{\text{entry}}}$$
4. **Liquidation Threshold Price**:
   - Long: $P_{\text{liq}} = P_{\text{entry}} \times \left(1 - \frac{0.90}{\text{Leverage}}\right)$
   - Short: $P_{\text{liq}} = P_{\text{entry}} \times \left(1 + \frac{0.90}{\text{Leverage}}\right)$
5. **Distance to Liquidation %**:
   - Long: $\text{Distance} = \frac{P_{\text{current}} - P_{\text{liq}}}{P_{\text{current}}} \times 100$
   - Short: $\text{Distance} = \frac{P_{\text{liq}} - P_{\text{current}}}{P_{\text{current}}} \times 100$
6. **Margin Buffer Remaining %**:
   $$\text{Margin Buffer} = \max\left(0,\, \min\left(100,\, \left(1 + \frac{\text{Unrealized PnL}}{0.90 \times \text{Margin}}\right) \times 100\right)\right)$$
7. **Liquidation Rule**: Triggered when $\text{Unrealized PnL} \le -0.90 \times \text{Margin}$. When tripped, remaining $10\%$ margin buffer is credited to cash, the trade is archived, and the **Educational Liquidation Modal** displays the post-mortem analysis.

---

## 5. UI Layout & Navigation Architecture

### 5.1 Clean Typographic Design
- All emojis and pictorial icons have been replaced with professional typography:
  - Header trader avatar: Clean monogram `T`.
  - Stock icons: Monograms `B`, `E`, `N`, `T`, `A`, `R`.
  - Bot trader avatars: Monograms `AQ`, `LK`, `NS`, `DN`, `SH`, `YT`.
  - Top 3 perks badge: `Perks` text pill without star characters.
  - Toast alerts: Formal financial copy without emojis.

---

## 6. Execution Guidelines
- Under **Rule 1**, the agent will never autonomously start or run dev servers.
- The project can be run locally by the user:
  ```bash
  # Option 1: Static Serve
  npx serve .

  # Option 2: Python server
  python3 -m http.server 3000
  ```
  Or directly opening `index.html` in any web browser.
