import { search } from './api/search.js';
import { render } from './ui/render.js';
export function start(query) { return render(search(query)); }
