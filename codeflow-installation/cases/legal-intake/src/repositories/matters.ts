import { database } from '../data/database';
export async function saveMatter(input) {
  return database.insert(input);
}
export function findMatter(id) {
  return database.get(id);
}
