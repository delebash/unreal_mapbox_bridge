import{d as f,r as d,c as m,o as _,a as h,b as v,e as y,Q as E,N as g,D as L,f as w}from"./vendor.238db0a9.js";const O=function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const o of t.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function i(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerpolicy&&(t.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?t.credentials="include":e.crossorigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function r(e){if(e.ep)return;e.ep=!0;const t=i(e);fetch(e.href,t)}};O();var R=(n,s)=>{const i=n.__vccOpts||n;for(const[r,e]of s)i[r]=e;return i};window.installEvent="";const $=f({name:"App",setup(){return{data_path:""}},mounted(){window.addEventListener("beforeinstallprompt",async function(n){n.preventDefault(),window.installEvent=n})}});function b(n,s,i,r,e,t){const o=d("router-view");return _(),m(o)}var A=R($,[["render",b]]);const P="modulepreload",a={},k="/",c=function(s,i){return!i||i.length===0?s():Promise.all(i.map(r=>{if(r=`${k}${r}`,r in a)return;a[r]=!0;const e=r.endsWith(".css"),t=e?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${r}"]${t}`))return;const o=document.createElement("link");if(o.rel=e?"stylesheet":P,e||(o.as="script",o.crossOrigin=""),o.href=r,document.head.appendChild(o),e)return new Promise((u,p)=>{o.addEventListener("load",u),o.addEventListener("error",p)})})).then(()=>s())},D=[{path:"/",component:()=>c(()=>import("./MainLayout.3452936c.js"),["assets/MainLayout.3452936c.js","assets/MainLayout.fc89fb63.css","assets/vendor.238db0a9.js"]),children:[{path:"",component:()=>c(()=>import("./Index.762b6302.js"),["assets/Index.762b6302.js","assets/vendor.238db0a9.js"])}]},{path:"/:catchAll(.*)*",component:()=>c(()=>import("./Error404.76f1ce07.js"),["assets/Error404.76f1ce07.js","assets/vendor.238db0a9.js"])}];var I=h(function(){return v({scrollBehavior:()=>({left:0,top:0}),routes:D,history:y({}.VUE_ROUTER_BASE)})});const N=I();function j(n){n.use(E,{config:{globalProperties:{}},plugins:{Notify:g,Dialog:L}}),n.use(N)}const l=w(A);j(l);l.mount("#app");export{R as _};