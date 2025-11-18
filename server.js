const express = require('express');
const cors = require('cors');
const db = require('./server/database');
const market = require('./server/market');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize Database
db.init();

// Start Market Polling (Fetch every 60s to respect CoinGecko Free Tier)
console.log('Starting Market Engine...');
market.startPolling();

// API Routes

// 1. Get Latest Market Snapshot (All Coins + Signals)
app.get('/api/market-data', (req, res) => {
  const data = market.getLatestData();
  res.json(data);
});

// 2. Get Historical Signals (for analytics)
app.get('/api/signals/history', (req, res) => {
  const limit = req.query.limit || 50;
  db.getRecentSignals(limit, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 3. Get Server Status
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ONLINE', 
    lastUpdate: market.getLastUpdateTimestamp(),
    coinsTracked: market.getTrackedCount()
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 SNIPERSCOUT SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📡 Live Feed: Connected to CoinGecko`);
  console.log(`💾 Database: SQLite Ready`);
});