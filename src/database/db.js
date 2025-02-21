const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(
            path.join(__dirname, 'masterkey.db'),
            (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                } else {
                    this.init();
                }
            }
        );
    }

    init() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                mental_product INTEGER NOT NULL,
                health INTEGER NOT NULL,
                time_efficiency INTEGER NOT NULL,
                creative_power INTEGER NOT NULL,
                concentration INTEGER NOT NULL,
                summary REAL NOT NULL
            )
        `);
    }

    async resetDatabase() {
        return new Promise((resolve, reject) => {
            this.db.run(`DROP TABLE IF EXISTS logs`, (err) => {
                if (err) {
                    reject(err);
                } else {
                    this.init();
                    resolve({ success: true });
                }
            });
        });
    }

    async savelog(logData) {
        return new Promise((resolve, reject) => {
            const { timestamp, mentalProduct, health, timeEfficiency, creativePower, concentration, summary } = logData;
            
            this.db.run(
                `INSERT INTO logs (timestamp, mental_product, health, time_efficiency, creative_power, concentration, summary)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [timestamp, mentalProduct, health, timeEfficiency, creativePower, concentration, summary],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    async getLogs(page = 1, limit = 10) {
        return new Promise((resolve, reject) => {
            const offset = (page - 1) * limit;
            this.db.all(
                `SELECT * FROM logs ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
                [limit, offset],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows.map(row => ({
                            id: row.id,
                            timestamp: row.timestamp,
                            mentalProduct: row.mental_product,
                            health: row.health,
                            timeEfficiency: row.time_efficiency,
                            creativePower: row.creative_power,
                            concentration: row.concentration,
                            summary: row.summary
                        })));
                    }
                }
            );
        });
    }

    async getLogsCount() {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT COUNT(*) as count FROM logs`,
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row.count);
                    }
                }
            );
        });
    }

    async updateLog(logData) {
        return new Promise((resolve, reject) => {
            const { id, mentalProduct, health, timeEfficiency, creativePower, concentration, summary } = logData;
            
            this.db.run(
                `UPDATE logs 
                 SET mental_product = ?, 
                     health = ?, 
                     time_efficiency = ?, 
                     creative_power = ?, 
                     concentration = ?,
                     summary = ?
                 WHERE id = ?`,
                [mentalProduct, health, timeEfficiency, creativePower, concentration, summary, id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ success: true });
                    }
                }
            );
        });
    }

    async getTodayLog() {
        return new Promise((resolve, reject) => {
            const today = new Date().toISOString().split('T')[0] + '%'; // Get today's date in YYYY-MM-DD format
            
            this.db.get(
                `SELECT * FROM logs WHERE timestamp LIKE ? ORDER BY timestamp DESC LIMIT 1`,
                [today],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (row) {
                            resolve({
                                id: row.id,
                                timestamp: row.timestamp,
                                mentalProduct: row.mental_product,
                                health: row.health,
                                timeEfficiency: row.time_efficiency,
                                creativePower: row.creative_power,
                                concentration: row.concentration,
                                summary: row.summary
                            });
                        } else {
                            resolve(null);
                        }
                    }
                }
            );
        });
    }

    async deleteLog(id) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `DELETE FROM logs WHERE id = ?`,
                [id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ success: true });
                    }
                }
            );
        });
    }

    close() {
        this.db.close();
    }
}

module.exports = new Database(); 