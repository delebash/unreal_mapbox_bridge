if(!self.define){let e,s={};const i=(i,r)=>(i=new URL(i+".js",r).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(r,n)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(s[a])return;let o={};const c=e=>i(e,a),l={module:{uri:a},exports:o,require:c};s[a]=Promise.all(r.map((e=>l[e]||c(e)))).then((e=>(n(...e),o)))}}define(["./workbox-6cd28afd"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/Error404.5f19a17c.js",revision:null},{url:"assets/Index.0fb8faaa.js",revision:null},{url:"assets/index.405397e5.js",revision:null},{url:"assets/index.4710012f.css",revision:null},{url:"assets/MainLayout.0a2a3ab6.js",revision:null},{url:"assets/MainLayout.fc89fb63.css",revision:null},{url:"assets/vendor.8cb234a5.js",revision:null},{url:"index.html",revision:"c48ba51605afeabbe8d9a13e36c45685"},{url:"vips.js",revision:"0390f51f622981feaaaa45d19ed2a087"},{url:"vips.worker.js",revision:"ebc9b60fd6ca4285ec1cac4b25d24016"},{url:"favicon.png",revision:"d29a3e3e5d5ac8452e4d9996587d8daa"},{url:"favicon.ico",revision:"caba475cc133f3ebf70e50ee36222bc5"},{url:"robots.txt",revision:"987497bfb623e1059632e5a607d56454"},{url:"apple-touch-icon.png",revision:"97c3a3218787fe8c594c928b505bd7ed"},{url:"thirtytwo-9-82-180.png",revision:"0e60cbae3011d6ec5499786b124682a2"},{url:"vips.js",revision:"0390f51f622981feaaaa45d19ed2a087"},{url:"vips.wasm",revision:"684fcf732358d66c2c5bfd9043748081"},{url:"vips.worker.js",revision:"ebc9b60fd6ca4285ec1cac4b25d24016"},{url:"pwa-192x192.png",revision:"d54338d5c554eebae9cfbfff3102029e"},{url:"pwa-512x512.png",revision:"c1ede6bcd447817588c8dab897ead4d3"},{url:"manifest.webmanifest",revision:"b4589ac1f9247b06faa032458afe7e6b"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
