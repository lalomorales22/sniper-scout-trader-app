const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'sniperscout.db');

let db;

const init = () => {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database.');
      createTables();
    }
  });
};

const createTables = () => {
  // Store every significant signal event
  db.run(`CREATE TABLE IF NOT EXISTS signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER,
    symbol TEXT,
    strategy TEXT,
    score INTEGER,
    price REAL,
    meta TEXT
  )`);

  // Store snapshots of price action for simple historical charting if needed
  db.run(`CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER,
    data_json TEXT
  )`);
};

const logSignal = (signal) => {
  if (!db) return;
  const { symbol, strategy, score, price, meta, timestamp } = signal;
  
  const query = `INSERT INTO signals (timestamp, symbol, strategy, score, price, meta) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(query, [timestamp, symbol, strategy, score, price, JSON.stringify(meta)], (err) => {
    if (err) console.error('Error saving signal:', err.message);
  });
};

const getRecentSignals = (limit, callback) => {
  if (!db) return callback(new Error('DB not initialized'));
  db.all(`SELECT * FROM signals ORDER BY timestamp DESC LIMIT ?`, [limit], callback);
};

module.exports = {
  init,
  logSignal,
  getRecentSignals
};