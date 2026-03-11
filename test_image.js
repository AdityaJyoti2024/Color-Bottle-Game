const fs = require('fs');
// read the first few bytes to verify it's a png
const buf = fs.readFileSync('assets/H_NC_BnW1.png');
console.log(buf.length + " bytes");
