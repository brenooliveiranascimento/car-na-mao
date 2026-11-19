import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Local store that keeps the app usable without signal: cached server data plus an
 * outbox of field surveys waiting to be synced.
 */
const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, updated_at INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS surveys (
     id TEXT PRIMARY KEY NOT NULL,
     property_id TEXT NOT NULL,
     status TEXT NOT NULL CHECK (status IN ('recording', 'pending_sync', 'synced')),
     started_at TEXT NOT NULL,
     analysis TEXT,
     last_error TEXT
   );
   CREATE TABLE IF NOT EXISTS survey_points (
     survey_id TEXT NOT NULL REFERENCES surveys (id),
     latitude REAL NOT NULL,
     longitude REAL NOT NULL,
     accuracy REAL,
     timestamp INTEGER NOT NULL
   );
   CREATE INDEX IF NOT EXISTS survey_points_survey ON survey_points (survey_id);`,
];

export async function migrate(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  while (version < MIGRATIONS.length) {
    await db.execAsync(MIGRATIONS[version]);
    version += 1;
    await db.execAsync(`PRAGMA user_version = ${version}`);
  }
}

export async function readCache<T>(db: SQLiteDatabase, key: string): Promise<T | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM cache WHERE key = ?', key);
  return row ? (JSON.parse(row.value) as T) : null;
}

export async function writeCache(db: SQLiteDatabase, key: string, value: unknown) {
  await db.runAsync(
    'INSERT INTO cache (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
    key,
    JSON.stringify(value),
    Date.now(),
  );
}

/** Network first, cache as fallback: what the producer saw last time stays available offline. */
export async function fetchWithCache<T>(db: SQLiteDatabase, key: string, fetcher: () => Promise<T>): Promise<{ data: T; offline: boolean }> {
  try {
    const data = await fetcher();
    await writeCache(db, key, data);
    return { data, offline: false };
  } catch (error) {
    const cached = await readCache<T>(db, key);
    if (cached) return { data: cached, offline: true };
    throw error;
  }
}
