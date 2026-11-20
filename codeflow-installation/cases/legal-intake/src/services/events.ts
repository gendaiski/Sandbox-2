const listeners = new Map();
export function subscribe(event, handler) {
  listeners.set(event, [...(listeners.get(event) || []), handler]);
}
export function publish(event, data) {
  for (const handler of listeners.get(event) || []) handler(data);
}
