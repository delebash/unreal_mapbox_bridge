if(!self.define){let e,i={};const s=(s,r)=>(s=new URL(s+".js",r).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(r,n)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(i[a])return;let o={};const d=e=>s(e,a),l={module:{uri:a},exports:o,require:d};i[a]=Promise.all(r.map((e=>l[e]||d(e)))).then((e=>(n(...e),o)))}}define(["./workbox-c1760cce"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/Error404.f9333cf0.js",revision:null},{url:"assets/Index.1f0d8676.js",revision:null},{url:"assets/index.4710012f.css",revision:null},{url:"assets/index.9e9f5d11.js",revision:null},{url:"assets/MainLayout.044b08e9.css",revision:null},{url:"assets/MainLayout.efe9ff22.js",revision:null},{url:"gdal.js",revision:"372444dfd1fa8a3e07803445a9462be6"},{url:"gdalWorker.js",revision:"170a2adb9003d976cb6443f9668ce645"},{url:"index.html",revision:"9144a0560b2c3643e8a1f136b9668b80"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"favicon.png",revision:"d29a3e3e5d5ac8452e4d9996587d8daa"},{url:"favicon.ico",revision:"caba475cc133f3ebf70e50ee36222bc5"},{url:"robots.txt",revision:"987497bfb623e1059632e5a607d56454"},{url:"apple-touch-icon.png",revision:"97c3a3218787fe8c594c928b505bd7ed"},{url:"thirtytwo-9-82-180.png",revision:"0e60cbae3011d6ec5499786b124682a2"},{url:"gdal.js",revision:"372444dfd1fa8a3e07803445a9462be6"},{url:"gdal.data",revision:"711185783aa1b2f0cd696fe8740776e5"},{url:"gdal.wasm",revision:"441a12b44d904db4d593e16b543ac1c1"},{url:"gdalWorker.js",revision:"170a2adb9003d976cb6443f9668ce645"},{url:"pwa-192x192.png",revision:"d54338d5c554eebae9cfbfff3102029e"},{url:"pwa-512x512.png",revision:"c1ede6bcd447817588c8dab897ead4d3"},{url:"manifest.webmanifest",revision:"b4589ac1f9247b06faa032458afe7e6b"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
