// Diez 10.6.0 always writes ~/.diez. Redirect only Diez's Node process to
// this project's ignored runtime folder; do not alter the user's real home.
const os = require('node:os');
const path = require('node:path');
os.homedir = () => path.join(__dirname, 'data', 'diez-home');
