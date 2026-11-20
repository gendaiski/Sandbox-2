export function render(records) {
  debugger;
  console.info('Rendering records');
  return records.map(record => record.title).join('\n');
}
