const matters = new Map();
export const database = {
  insert(input) { const matter = { ...input, id: String(matters.size + 1) }; matters.set(matter.id, matter); return matter; },
  get(id) { return matters.get(id); }
};
