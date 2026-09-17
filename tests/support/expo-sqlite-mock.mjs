// Testlerde `expo-sqlite`'ın yerini alan node:sqlite tabanlı hafif bir uyarlayıcı.
// expo-sqlite'ın senkron API'sini (execSync/getFirstSync/getAllSync/runSync/withTransactionSync)
// node:sqlite'ın DatabaseSync API'sine eşler.
import { DatabaseSync } from 'node:sqlite';

class MockSQLiteDatabase {
  constructor() {
    this._db = new DatabaseSync(':memory:');
  }

  execSync(sql) {
    this._db.exec(sql);
  }

  getFirstSync(sql, params = []) {
    const stmt = this._db.prepare(sql);
    return stmt.get(...params) ?? null;
  }

  getAllSync(sql, params = []) {
    const stmt = this._db.prepare(sql);
    return stmt.all(...params);
  }

  runSync(sql, params = []) {
    const stmt = this._db.prepare(sql);
    return stmt.run(...params);
  }

  withTransactionSync(fn) {
    this._db.exec('BEGIN');
    try {
      fn();
      this._db.exec('COMMIT');
    } catch (err) {
      this._db.exec('ROLLBACK');
      throw err;
    }
  }

  close() {
    this._db.close();
  }
}

const instances = new Map();

export function openDatabaseSync(name) {
  if (!instances.has(name)) {
    instances.set(name, new MockSQLiteDatabase());
  }
  return instances.get(name);
}

// Test yardımcı fonksiyonu: modül seviyesindeki tekil db örneğini sıfırlar.
export function __resetMockDatabases() {
  for (const db of instances.values()) db.close();
  instances.clear();
}
