import{d as f,r as d,c as m,o as _,a as h,b as v,e as y,Q as g,N as E,D as L,P,f as $}from"./vendor.9778e53c.js";const w=function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const o of t.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function i(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerpolicy&&(t.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?t.credentials="include":e.crossorigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function r(e){if(e.ep)return;e.ep=!0;const t=i(e);fetch(e.href,t)}};w();var O=(n,s)=>{const i=n.__vccOpts||n;for(const[r,e]of s)i[r]=e;return i};window.installEvent="";const R=f({name:"App",setup(){return{data_path:""}},mounted(){window.addEventListener("beforeinstallprompt",async function(n){n.preventDefault(),window.installEvent=n})}});function A(n,s,i,r,e,t){const o=d("router-view");return _(),m(o)}var b=O(R,[["render",A]]);const k="modulepreload",a={},D="/",c=function(s,i){return!i||i.length===0?s():Promise.all(i.map(r=>{if(r=`${D}${r}`,r in a)return;a[r]=!0;const e=r.endsWith(".css"),t=e?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${r}"]${t}`))return;const o=document.createElement("link");if(o.rel=e?"stylesheet":k,e||(o.as="script",o.crossOrigin=""),o.href=r,document.head.appendChild(o),e)return new Promise((u,p)=>{o.addEventListener("load",u),o.addEventListener("error",p)})})).then(()=>s())},N=[{path:"/",component:()=>c(()=>import("./MainLayout.f19091d4.js"),["assets/MainLayout.f19091d4.js","assets/MainLayout.fc89fb63.css","assets/vendor.9778e53c.js"]),children:[{path:"",component:()=>c(()=>import("./Index.2d94ce7b.js"),["assets/Index.2d94ce7b.js","assets/vendor.9778e53c.js"])}]},{path:"/:catchAll(.*)*",component:()=>c(()=>import("./Error404.1222083f.js"),["assets/Error404.1222083f.js","assets/vendor.9778e53c.js"])}];var B=h(function(){return v({scrollBehavior:()=>({left:0,top:0}),routes:N,history:y({}.VUE_ROUTER_BASE)})});const C=B();function H(n){n.use(g,{config:{globalProperties:{}},plugins:{Notify:E,Dialog:L,Loading:P}}),n.use(C)}const l=$(b);H(l);l.mount("#app");export{O as _};