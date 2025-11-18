
# SniperScout - Pro Trade Terminal

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-live-green.svg)
![Stack](https://img.shields.io/badge/stack-React_Node_SQLite-blueviolet.svg)

**SniperScout** is a real-time trading intelligence terminal designed to visualize high-probability setups based on specific algorithmic strategies. It combines a React frontend with a Node.js/SQLite backend to fetch live market data from CoinGecko, compute complex technical indicators (RSI, ADX, MACD) on the fly, and filter for "Burry Shorts" and "Penguin Divergence" setups.

## 🚀 Key Features

*   **Real-Time Data Feed**: Connects to CoinGecko's API via a custom Node.js proxy to fetch live price action and sparklines.
*   **Strategy Engine**:
    *   **Burry Short**: Identifies overbought exhaustion (RSI > 80, Fading MACD, Low ADX).
    *   **Penguin Long**: Detects bullish divergence (BTC dumping while Altcoin pumps).
    *   **Death Trap Detection**: Warns against shorting strong trends (High ADX).
*   **Visual Intelligence**:
    *   **Confluence Matrix**: A 5-point checklist for every trade signal.
    *   **Portfolio Heatmap**: Visualizes risk exposure and "Rekt" levels.
    *   **Signal Lights**: Green (Go), Yellow (Wait), Red (Danger) indicators in the watchlist.
    *   **Paper Trading Engine**: Simulate execution and track PnL with audio feedback.
*   **Backend & Database**:
    *   **Node/Express**: Handles API rate limiting and technical analysis calculations.
    *   **SQLite**: Stores signal history for pattern recognition and analytics.

## 🛠 Tech Stack

*   **Frontend**: React, Tailwind CSS, Lucide Icons.
*   **Backend**: Node.js, Express.
*   **Database**: SQLite3.
*   **Data Source**: CoinGecko Public API (Free Tier compliant).

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v16+)
*   npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/lalomorales22/sniper-scout.git
cd sniper-scout
```

### 2. Install Dependencies
Install dependencies for both the React client and the Node server:
```bash
npm install
```

### 3. Run the Application
To run the full stack (Backend Server + Frontend Client) concurrently:

```bash
npm run dev
```

*   **Frontend**: Accessible at `http://localhost:3000`
*   **Backend API**: Runs on `http://localhost:3001`

> **Note**: The server will create a `sniperscout.db` SQLite file automatically upon first launch.

## 📊 Strategies Explained

### A. Burry Overbought Exhaustion Short
Searches for assets that are statistically overextended but lacking trend strength.
*   **Criteria**:
    *   RSI > 80 (Extreme Overbought)
    *   MACD Histogram < Previous (Momentum Fading)
    *   ADX < 30 (Weak Trend - Prevents shorting parabolic moves)
    *   Stochastic > 90 (Peak)

### B. Penguin Divergence Long
Looks for relative strength in altcoins during Bitcoin weakness.
*   **Criteria**:
    *   BTC Price Change: -3% to -8% (Dumping)
    *   Altcoin Price Change: > +10% (Pumping)
    *   Divergence Angle: > 20% spread

### C. Danger Zones (Anti-Patterns)
The app visually warns you NOT to trade specific setups.
*   **The Death Trap**: Attempting to short an asset with RSI > 80 but ADX > 50. This indicates a strong parabolic trend where shorts get liquidated.

## 📂 Project Structure

```
sniper-scout/
├── src/
│   ├── components/    # UI Widgets (Matrix, Calculator, RiskMeter)
│   ├── services/      # Frontend logic & API fetchers
│   ├── types.ts       # TypeScript definitions
│   └── App.tsx        # Main Dashboard
├── server/
│   ├── database.js    # SQLite connection & queries
│   └── market.js      # Technical Analysis Engine & API handling
├── server.js          # Express Server Entry Point
└── README.md          # Documentation
```

## 🔒 Security & Architecture Disclosure

**Important:** This application is currently designed as a **locally hosted simulation tool**. Before deploying to a public server or using it for real-money trading, the following security improvements are required:

1.  **CORS Policy**: The current server uses `app.use(cors())`, which allows all origins. In production, restrict this to your specific frontend domain.
2.  **Input Validation**: Ensure all API parameters (e.g., `?limit=50`) are strictly validated as integers to prevent potential SQL injection vectors, although SQLite parameterized queries are currently used.
3.  **Rate Limiting**: Implement `express-rate-limit` on the backend to prevent abuse and ensure compliance with CoinGecko's API terms (currently 10-30 calls/min for free tier).
4.  **Environment Variables**: Move port numbers and API endpoints to a `.env` file.
5.  **HTTPS**: The application currently runs on HTTP. Use a reverse proxy (Nginx) or SSL certificates for production deployment.

## 🚧 Roadmap & Future Improvements

*   [ ] **Live Order Execution**: Connect to CEX (Binance/Bybit) APIs for real trade execution.
*   [ ] **User Authentication**: Add login capabilities to store User Profiles in the database.
*   [ ] **Advanced Backtesting**: Run the strategy engine against 30-day historical data to generate real win-rate metrics.
*   [ ] **Mobile Support**: Optimize the layout for mobile viewports (currently optimized for desktop terminals).
*   [ ] **WebSockets**: Replace HTTP polling with WebSockets for sub-second price updates.

## ⚠️ Disclaimer

This software is for educational and entertainment purposes only. The "signals" generated are based on historical technical analysis concepts and do not guarantee future performance. Cryptocurrency trading involves extreme risk. **Do not trade with money you cannot afford to lose.**

## 📄 License

This project is licensed under the MIT License.
