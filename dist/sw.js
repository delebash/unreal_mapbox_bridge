if(!self.define){let e,s={};const i=(i,r)=>(i=new URL(i+".js",r).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(r,n)=>{const d=e||("document"in self?document.currentScript.src:"")||location.href;if(s[d])return;let o={};const a=e=>i(e,d),l={module:{uri:d},exports:o,require:a};s[d]=Promise.all(r.map((e=>l[e]||a(e)))).then((e=>(n(...e),o)))}}define(["./workbox-6cd28afd"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/Error404.2aa01539.js",revision:null},{url:"assets/index.2c0cb200.js",revision:null},{url:"assets/index.4710012f.css",revision:null},{url:"assets/Index.7884df2a.js",revision:null},{url:"assets/MainLayout.044b08e9.css",revision:null},{url:"assets/MainLayout.d4ca2d9d.js",revision:null},{url:"assets/vendor.3463095c.js",revision:null},{url:"gdal.js",revision:"de047f281219dee7445ed612b8e5049f"},{url:"gdalWorker.js",revision:"fb462bbe0a5b13cb8eb4d04b95db5e86"},{url:"index.html",revision:"d83761b0ac75af2c1dc9e38cf89d1c94"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"favicon.png",revision:"d29a3e3e5d5ac8452e4d9996587d8daa"},{url:"favicon.ico",revision:"caba475cc133f3ebf70e50ee36222bc5"},{url:"robots.txt",revision:"987497bfb623e1059632e5a607d56454"},{url:"apple-touch-icon.png",revision:"97c3a3218787fe8c594c928b505bd7ed"},{url:"thirtytwo-9-82-180.png",revision:"0e60cbae3011d6ec5499786b124682a2"},{url:"gdal.js",revision:"de047f281219dee7445ed612b8e5049f"},{url:"gdal.data",revision:"6100da6575aa84e60b4e293fd567f84f"},{url:"gdal.wasm",revision:"441a12b44d904db4d593e16b543ac1c1"},{url:"gdalWorker.js",revision:"fb462bbe0a5b13cb8eb4d04b95db5e86"},{url:"pwa-192x192.png",revision:"d54338d5c554eebae9cfbfff3102029e"},{url:"pwa-512x512.png",revision:"c1ede6bcd447817588c8dab897ead4d3"},{url:"manifest.webmanifest",revision:"b4589ac1f9247b06faa032458afe7e6b"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
