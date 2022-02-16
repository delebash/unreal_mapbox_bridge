const express = require('express');
const app = express();
const port = 3000;
const open = require('open');

app.use(express.static(('dist'),
    {
        setHeaders: (res) => {
            // Required for SharedBufferArray to work which is necessary for wasm-vips
            res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
            //
        }
    }
))

app.listen(port, () => console.log(`http://localhost:${port}`));

openBrowser()
async function openBrowser(){
    await open(`http://localhost:${port}`)
}
