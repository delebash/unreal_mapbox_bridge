const express = require('express');
const app = express();
const port = 3000;

// app.use((req, res, next) => {
//     res.append('Cross-Origin-Resource-Policy', 'same-origin');
//     res.append('Cross-Origin-Embedder-Policy', 'require-corp"');
//     res.append('Cross-Origin-Opener-Policy', 'same-origin');
//     next();
// });
app.use(express.static(('dist'),
    {
        setHeaders: (res) => {
            res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
        }
    }
))
// Setting up the public directory


app.listen(port, () => console.log(`http://localhost:${port}`));
