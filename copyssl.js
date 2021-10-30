const os = require('os')
const path = require('path')
const fs = require("fs-extra");

const PKG_NAME = 'vite-plugin-mkcert'
const srcDir = path.join(os.homedir(), `.${PKG_NAME}`) + '\\certs'

fs.copy(srcDir, 'sslcerts', (err) => {
    if (err) throw err;
    console.log('source was copied to destination');
})
