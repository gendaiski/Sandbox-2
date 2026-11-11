// Load the browser scripts into a Node context for unit tests.
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.join(__dirname, '..', 'src');
module.exports = function load(files) {
  for (const f of files) vm.runInThisContext(fs.readFileSync(path.join(SRC, f), 'utf8'), { filename: f });
  return globalThis.CG;
};
