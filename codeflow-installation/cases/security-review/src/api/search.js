import { settings } from '../config/settings.js';
import { findRecords } from '../data/records.js';
import { compileFilter } from '../utils/filters.js';
export function search(query) {
  console.log('Debug search request', query);
  const filter = compileFilter(query);
  return findRecords(settings.limit).filter(filter);
}
