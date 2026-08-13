import { defaults } from '../data/options.js'

const STATE_KEY = 'boombox-kids-phase2-state'
const SAVED_KEY = 'boombox-kids-phase2-saved'

const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
export const loadState = () => ({ ...defaults, ...read(STATE_KEY, {}) })
export const saveState = (state) => localStorage.setItem(STATE_KEY, JSON.stringify(state))
export const loadSaved = () => read(SAVED_KEY, [])
export const savePrompt = (output) => { const next = [{ ...output, id: crypto.randomUUID?.() || String(Date.now()), savedAt: new Date().toISOString() }, ...loadSaved()]; localStorage.setItem(SAVED_KEY, JSON.stringify(next)); return next }
export const deleteSaved = (id) => { const next = loadSaved().filter((item) => item.id !== id); localStorage.setItem(SAVED_KEY, JSON.stringify(next)); return next }
