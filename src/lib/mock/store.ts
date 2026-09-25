import { buildSeed, type MockDb } from './seed'

const KEY = 'soundwave-admin:mock:v1'
let memory: MockDb | null = null

/** The demo "database" lives in this browser's localStorage. */
export function readDb(): MockDb {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as MockDb
    const fresh = buildSeed()
    writeDb(fresh)
    return fresh
  } catch {
    memory ??= buildSeed()
    return memory
  }
}

export function writeDb(db: MockDb): void {
  memory = db
  try {
    window.localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    // Keep the in-memory copy.
  }
}

export function resetDb(): void {
  writeDb(buildSeed())
}
