const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
const os = require("os");

// Store database outside the project to prevent Electronmon restarts
const dbDir = path.join(os.homedir(), "AppData", "Local", "PokerTracker");
const dbPath = path.join(dbDir, "database.db");

// Ensure the directory exists before creating the database
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log("Created database directory:", dbDir);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database", err.message);
    } else {
        console.log("Connected to SQLite database at:", dbPath);

        db.run(
            `CREATE TABLE IF NOT EXISTS poker_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                stakes TEXT NOT NULL,
                buy_in REAL NOT NULL,
                cash_out REAL NOT NULL,
                hours REAL NOT NULL,
                profit REAL GENERATED ALWAYS AS (cash_out - buy_in) STORED
            )`
        );        
    }
});

// Insert a session asynchronously
const insertSession = (date, stakes, buyIn, cashOut, hours, callback) => {
    process.nextTick(() => {
        db.run(
            `INSERT INTO poker_sessions (date, stakes, buy_in, cash_out, hours) VALUES (?, ?, ?, ?, ?)`,
            [date, stakes, buyIn, cashOut, hours],
            function (err) {
                if (err) {
                    return callback(err, null);
                }
                callback(null, { 
                    id: this.lastID, 
                    date, stakes, buyIn, cashOut, hours, 
                    profit: cashOut - buyIn 
                });
            }
        );        
    });
};

// Fetch all sessions asynchronously
const getSessions = (callback) => {
    process.nextTick(() => {
        db.all("SELECT * FROM poker_sessions ORDER BY id ASC", [], (err, rows) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, rows);
        });
    });
};

// Fetch aggregate data asynchronously
const getAggregateData = (callback) => {
    db.get(
        `SELECT COUNT(*) AS total_sessions,
                SUM(profit) AS total_profit,
                SUM(hours) AS total_hours,
                SUM(hours) * 30 AS total_hands
         FROM poker_sessions`,
        [],
        (err, row) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, row);
        }
    );
};

const deleteSession = (id, callback) => {
    db.run("DELETE FROM poker_sessions WHERE id = ?", [id], function (err) {
        if (err) {
            return callback(err);
        }
        callback(null);
    });
};

module.exports = { insertSession, getSessions, getAggregateData, deleteSession };
