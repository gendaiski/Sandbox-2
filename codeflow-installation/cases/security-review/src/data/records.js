import { settings } from '../config/settings.js';
export function findRecords(limit) {
  return [{ id: 'demo-1', title: 'Fictional document', mode: settings.mode }].slice(0, limit);
}
