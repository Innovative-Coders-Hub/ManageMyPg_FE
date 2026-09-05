const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/LandingPage-BaupQ32s.js","assets/vendor-utils-R8GiF9xn.js","assets/vendor-react-B_N831O-.js","assets/SEO-DCK-Oyvs.js","assets/vendor-pdf-BGIzMpvL.js","assets/SignInPage-XkUyrQ9s.js","assets/ownerAuth-Bz3vDeb4.js","assets/SignUpPage-GQr4ReN_.js","assets/Login-DpBxI-XX.js","assets/OwnerProfile-BkeJ4GJK.js","assets/CustomDropdown-DldqRGEx.js","assets/ProfileImageCropper-6ze6ecIW.js","assets/AdminLogin-BwMatAmU.js","assets/adminAuth-B5EmYCWk.js","assets/AdminDashboard-BQpj_soc.js","assets/dayjs.min-CQaoxcNf.js","assets/useDebounce-QWCVNFjb.js","assets/AdminOwnersList-BVdIzE5v.js","assets/AdminOwnerDetails-BQ7s-1ro.js","assets/AdminHeader-Da3dGk3m.js","assets/Home-xWSCaC-Q.js","assets/MyPgs-Dn69oE4C.js","assets/PgDetail-c6S8W0Tr.js","assets/PageHeader-uvJQjIGc.js","assets/bed_availabe-CIhA0fS9.js","assets/bed_reserved-6tNUx5Jh.js","assets/TenantRegistration-i4hRlOjk.js","assets/BedDetail-B-G8Mgr0.js","assets/PaymentModal-D5aCVEIp.js","assets/Reports-XbmI_DME.js","assets/Tenants-BQRsY0_E.js","assets/Offers-DTGBtrKy.js","assets/promotions-DpgEMxyx.js","assets/OwnerComplaints-DbsiazL_.js","assets/TenantDashboard-BvtPeBlM.js","assets/Sidebar-wPIWNLMn.js","assets/ConfirmModal-BPat1GLr.js","assets/TenantTransfer-Bv8TUTKU.js","assets/PrivacyPolicy-BCfmr0pd.js","assets/TermsAndConditions-DcR70Dn_.js","assets/TenantDetails-CDbiVHz4.js","assets/Bookings-30d7oQHz.js","assets/Workers-X0A-7DFG.js","assets/ManageRents-BVGJFyQI.js","assets/Expenses-CteFguWn.js","assets/vendor-charts-CQBQJzlw.js","assets/ForgotPasswordScreen-lCF8O5oi.js","assets/ChangePasswordScreen-AsjJg_7N.js"])))=>i.map(i=>d[i]);
import{a as ne,j as s}from"./vendor-utils-R8GiF9xn.js";import{c as le,u as R,a as i,d as W,e as ce,f as p,N as V,L as F,h as de,B as ue}from"./vendor-react-B_N831O-.js";import{_ as f}from"./vendor-pdf-BGIzMpvL.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))l(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&l(a)}).observe(document,{childList:!0,subtree:!0});function r(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function l(o){if(o.ep)return;o.ep=!0;const n=r(o);fetch(o.href,n)}})();var N={},J;function me(){if(J)return N;J=1;var e=le();return N.createRoot=e.createRoot,N.hydrateRoot=e.hydrateRoot,N}var pe=me();const Y="/managemypg",qt=e=>{if(!e)return null;if(e.startsWith("http"))return e;const t=Y.replace(/\/$/,""),r=e.startsWith("/")?e:`/${e}`;return`${t}${r}`},Z=ne.create({baseURL:Y});Z.interceptors.request.use(e=>{const t=localStorage.getItem("accessToken"),r=localStorage.getItem("tokenType")||"Bearer";return t&&(e.headers.Authorization=`${r} ${t}`),e});Z.interceptors.response.use(e=>e,e=>{const t=e.response?.status,r=e.config?.url||"",o=["/api/admin/login","/api/auth/login"].some(n=>r.includes(n));if((t===401||t===403)&&!o){const n=localStorage.getItem("isAdmin")==="true"||window.location.pathname.startsWith("/admin")||window.location.pathname.startsWith("/application/administrator");localStorage.clear(),window.location.href=n?"/application/administrator/login":"/manage/mypg/signin"}return Promise.reject(e)});function G({show:e=!1,message:t="Loading…"}){return e?s.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur",children:s.jsxs("div",{className:"flex flex-col items-center gap-3",children:[s.jsxs("svg",{className:"animate-spin h-10 w-10 text-indigo-600",viewBox:"0 0 24 24",children:[s.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4",fill:"none"}),s.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"})]}),s.jsx("div",{className:"text-sm text-gray-700",children:t})]})}):null}function fe({minVisible:e=300}={}){const{pathname:t,search:r}=R(),[l,o]=i.useState(!1),n=(d,g)=>{const m=new URLSearchParams(g);m.delete("q");const u=m.toString();return d+(u?"?"+u:"")},a=i.useRef(n(t,r)),c=i.useRef(null);return i.useEffect(()=>{const d=n(t,r);return d!==a.current&&(a.current=d,o(!0),clearTimeout(c.current),c.current=setTimeout(()=>o(!1),e)),()=>clearTimeout(c.current)},[t,r,e]),l}let ge={data:""},he=e=>{if(typeof window=="object"){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||ge},xe=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,ye=/\/\*[^]*?\*\/|  +/g,K=/\n+/g,L=(e,t)=>{let r="",l="",o="";for(let n in e){let a=e[n];n[0]=="@"?n[1]=="i"?r=n+" "+a+";":l+=n[1]=="f"?L(a,n):n+"{"+L(a,n[1]=="k"?"":t)+"}":typeof a=="object"?l+=L(a,t?t.replace(/([^,])+/g,c=>n.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,d=>/&/.test(d)?d.replace(/&/g,c):c?c+" "+d:d)):n):a!=null&&(n=n[1]=="-"?n:n.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=L.p?L.p(n,a):n+":"+a+";")}return r+(t&&o?t+"{"+o+"}":o)+l},O={},X=e=>{if(typeof e=="object"){let t="";for(let r in e)t+=r+X(e[r]);return t}return e},_e=(e,t,r,l,o)=>{let n=X(e),a=O[n]||(O[n]=(d=>{let g=0,m=11;for(;g<d.length;)m=101*m+d.charCodeAt(g++)>>>0;return"go"+m})(n));if(!O[a]){let d=n!==e?e:(g=>{let m,u,h=[{}];for(;m=xe.exec(g.replace(ye,""));)m[4]?h.shift():m[3]?(u=m[3].replace(K," ").trim(),h.unshift(h[0][u]=h[0][u]||{})):h[0][m[1]]=m[2].replace(K," ").trim();return h[0]})(e);O[a]=L(o?{["@keyframes "+a]:d}:d,r?"":"."+a)}let c=r&&O.g;return r&&(O.g=O[a]),((d,g,m,u)=>{u?g.data=g.data.replace(u,d):g.data.indexOf(d)===-1&&(g.data=m?d+g.data:g.data+d)})(O[a],t,l,c),a},ve=(e,t,r)=>e.reduce((l,o,n)=>{let a=t[n];if(a&&a.call){let c=a(r),d=c&&c.props&&c.props.className||/^go/.test(c)&&c;a=d?"."+d:c&&typeof c=="object"?c.props?"":L(c,""):c===!1?"":c}return l+o+(a??"")},"");function $(e){let t=this||{},r=e.call?e(t.p):e;return _e(r.unshift?r.raw?ve(r,[].slice.call(arguments,1),t.p):r.reduce((l,o)=>Object.assign(l,o&&o.call?o(t.p):o),{}):r,he(t.target),t.g,t.o,t.k)}let ee,B,H;$.bind({g:1});let b=$.bind({k:1});function je(e,t,r,l){L.p=t,ee=e,B=r,H=l}function I(e,t){let r=this||{};return function(){let l=arguments;function o(n,a){let c=Object.assign({},n),d=c.className||o.className;r.p=Object.assign({theme:B&&B()},c),r.o=/go\d/.test(d),c.className=$.apply(r,l)+(d?" "+d:"");let g=e;return e[0]&&(g=c.as||e,delete c.as),H&&g[0]&&H(c),ee(g,c)}return o}}var be=e=>typeof e=="function",k=(e,t)=>be(e)?e(t):e,we=(()=>{let e=0;return()=>(++e).toString()})(),te=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),Ee=20,U="default",se=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(a=>a.id===t.toast.id?{...a,...t.toast}:a)};case 2:let{toast:l}=t;return se(e,{type:e.toasts.find(a=>a.id===l.id)?1:0,toast:l});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(a=>a.id===o||o===void 0?{...a,dismissed:!0,visible:!1}:a)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(a=>a.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let n=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+n}))}}},S=[],re={toasts:[],pausedAt:void 0,settings:{toastLimit:Ee}},j={},ae=(e,t=U)=>{j[t]=se(j[t]||re,e),S.forEach(([r,l])=>{r===t&&l(j[t])})},oe=e=>Object.keys(j).forEach(t=>ae(e,t)),Oe=e=>Object.keys(j).find(t=>j[t].toasts.some(r=>r.id===e)),C=(e=U)=>t=>{ae(t,e)},Le={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},Ie=(e={},t=U)=>{let[r,l]=i.useState(j[t]||re),o=i.useRef(j[t]);i.useEffect(()=>(o.current!==j[t]&&l(j[t]),S.push([t,l]),()=>{let a=S.findIndex(([c])=>c===t);a>-1&&S.splice(a,1)}),[t]);let n=r.toasts.map(a=>{var c,d,g;return{...e,...e[a.type],...a,removeDelay:a.removeDelay||((c=e[a.type])==null?void 0:c.removeDelay)||e?.removeDelay,duration:a.duration||((d=e[a.type])==null?void 0:d.duration)||e?.duration||Le[a.type],style:{...e.style,...(g=e[a.type])==null?void 0:g.style,...a.style}}});return{...r,toasts:n}},Pe=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:r?.id||we()}),A=e=>(t,r)=>{let l=Pe(t,e,r);return C(l.toasterId||Oe(l.id))({type:2,toast:l}),l.id},y=(e,t)=>A("blank")(e,t);y.error=A("error");y.success=A("success");y.loading=A("loading");y.custom=A("custom");y.dismiss=(e,t)=>{let r={type:3,toastId:e};t?C(t)(r):oe(r)};y.dismissAll=e=>y.dismiss(void 0,e);y.remove=(e,t)=>{let r={type:4,toastId:e};t?C(t)(r):oe(r)};y.removeAll=e=>y.remove(void 0,e);y.promise=(e,t,r)=>{let l=y.loading(t.loading,{...r,...r?.loading});return typeof e=="function"&&(e=e()),e.then(o=>{let n=t.success?k(t.success,o):void 0;return n?y.success(n,{id:l,...r,...r?.success}):y.dismiss(l),o}).catch(o=>{let n=t.error?k(t.error,o):void 0;n?y.error(n,{id:l,...r,...r?.error}):y.dismiss(l)}),e};var Re=1e3,Te=(e,t="default")=>{let{toasts:r,pausedAt:l}=Ie(e,t),o=i.useRef(new Map).current,n=i.useCallback((u,h=Re)=>{if(o.has(u))return;let x=setTimeout(()=>{o.delete(u),a({type:4,toastId:u})},h);o.set(u,x)},[]);i.useEffect(()=>{if(l)return;let u=Date.now(),h=r.map(x=>{if(x.duration===1/0)return;let w=(x.duration||0)+x.pauseDuration-(u-x.createdAt);if(w<0){x.visible&&y.dismiss(x.id);return}return setTimeout(()=>y.dismiss(x.id,t),w)});return()=>{h.forEach(x=>x&&clearTimeout(x))}},[r,l,t]);let a=i.useCallback(C(t),[t]),c=i.useCallback(()=>{a({type:5,time:Date.now()})},[a]),d=i.useCallback((u,h)=>{a({type:1,toast:{id:u,height:h}})},[a]),g=i.useCallback(()=>{l&&a({type:6,time:Date.now()})},[l,a]),m=i.useCallback((u,h)=>{let{reverseOrder:x=!1,gutter:w=8,defaultPosition:T}=h||{},P=r.filter(v=>(v.position||T)===(u.position||T)&&v.height),D=P.findIndex(v=>v.id===u.id),E=P.filter((v,M)=>M<D&&v.visible).length;return P.filter(v=>v.visible).slice(...x?[E+1]:[0,E]).reduce((v,M)=>v+(M.height||0)+w,0)},[r]);return i.useEffect(()=>{r.forEach(u=>{if(u.dismissed)n(u.id,u.removeDelay);else{let h=o.get(u.id);h&&(clearTimeout(h),o.delete(u.id))}})},[r,n]),{toasts:r,handlers:{updateHeight:d,startPause:c,endPause:g,calculateOffset:m}}},Ae=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,De=b`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Ne=b`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,ze=I("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Ae} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${De} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${Ne} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,Se=b`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,ke=I("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${Se} 1s linear infinite;
`,Ve=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,$e=b`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,Ce=I("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Ve} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${$e} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Me=I("div")`
  position: absolute;
`,Fe=I("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,qe=b`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Be=I("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${qe} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,He=({toast:e})=>{let{icon:t,type:r,iconTheme:l}=e;return t!==void 0?typeof t=="string"?i.createElement(Be,null,t):t:r==="blank"?null:i.createElement(Fe,null,i.createElement(ke,{...l}),r!=="loading"&&i.createElement(Me,null,r==="error"?i.createElement(ze,{...l}):i.createElement(Ce,{...l})))},We=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,Ue=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,Je="0%{opacity:0;} 100%{opacity:1;}",Ge="0%{opacity:1;} 100%{opacity:0;}",Ke=I("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Qe=I("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Ye=(e,t)=>{let r=e.includes("top")?1:-1,[l,o]=te()?[Je,Ge]:[We(r),Ue(r)];return{animation:t?`${b(l)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${b(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},Ze=i.memo(({toast:e,position:t,style:r,children:l})=>{let o=e.height?Ye(e.position||t||"top-center",e.visible):{opacity:0},n=i.createElement(He,{toast:e}),a=i.createElement(Qe,{...e.ariaProps},k(e.message,e));return i.createElement(Ke,{className:e.className,style:{...o,...r,...e.style}},typeof l=="function"?l({icon:n,message:a}):i.createElement(i.Fragment,null,n,a))});je(i.createElement);var Xe=({id:e,className:t,style:r,onHeightUpdate:l,children:o})=>{let n=i.useCallback(a=>{if(a){let c=()=>{let d=a.getBoundingClientRect().height;l(e,d)};c(),new MutationObserver(c).observe(a,{subtree:!0,childList:!0,characterData:!0})}},[e,l]);return i.createElement("div",{ref:n,className:t,style:r},o)},et=(e,t)=>{let r=e.includes("top"),l=r?{top:0}:{bottom:0},o=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:te()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...l,...o}},tt=$`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,z=16,st=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:l,children:o,toasterId:n,containerStyle:a,containerClassName:c})=>{let{toasts:d,handlers:g}=Te(r,n);return i.createElement("div",{"data-rht-toaster":n||"",style:{position:"fixed",zIndex:9999,top:z,left:z,right:z,bottom:z,pointerEvents:"none",...a},className:c,onMouseEnter:g.startPause,onMouseLeave:g.endPause},d.map(m=>{let u=m.position||t,h=g.calculateOffset(m,{reverseOrder:e,gutter:l,defaultPosition:t}),x=et(u,h);return i.createElement(Xe,{id:m.id,key:m.id,onHeightUpdate:g.updateHeight,className:m.visible?tt:"",style:x},m.type==="custom"?k(m.message,m):o?o(m):i.createElement(Ze,{toast:m,position:u}))}))},Bt=y;const ie="/assets/managemypg-CPfFE9LQ.png",rt=i.lazy(()=>f(()=>import("./LandingPage-BaupQ32s.js"),__vite__mapDeps([0,1,2,3,4]))),at=i.lazy(()=>f(()=>import("./SignInPage-XkUyrQ9s.js"),__vite__mapDeps([5,1,2,3,6,4]))),ot=i.lazy(()=>f(()=>import("./SignUpPage-GQr4ReN_.js"),__vite__mapDeps([7,1,2,6,3,4]))),it=i.lazy(()=>f(()=>import("./Login-DpBxI-XX.js"),__vite__mapDeps([8,1,2,3]))),Q=i.lazy(()=>f(()=>import("./OwnerProfile-BkeJ4GJK.js"),__vite__mapDeps([9,1,2,3,10,6,11,4]))),nt=i.lazy(()=>f(()=>import("./AdminLogin-BwMatAmU.js"),__vite__mapDeps([12,1,2,13,3,4]))),lt=i.lazy(()=>f(()=>import("./AdminDashboard-BQpj_soc.js"),__vite__mapDeps([14,4,1,2,15,10,13,16,3]))),ct=i.lazy(()=>f(()=>import("./AdminOwnersList-BVdIzE5v.js"),__vite__mapDeps([17,1,2,15,10,13,16,3,4]))),dt=i.lazy(()=>f(()=>import("./AdminOwnerDetails-BQ7s-1ro.js"),__vite__mapDeps([18,1,2,15,6,3,4]))),ut=i.lazy(()=>f(()=>import("./AdminHeader-Da3dGk3m.js"),__vite__mapDeps([19,1,2,13,4]))),mt=i.lazy(()=>f(()=>import("./Home-xWSCaC-Q.js"),__vite__mapDeps([20,1,2,15,3,6,4]))),pt=i.lazy(()=>f(()=>import("./MyPgs-Dn69oE4C.js"),__vite__mapDeps([21,1,2,6,3,10,4]))),ft=i.lazy(()=>f(()=>import("./PgDetail-c6S8W0Tr.js"),__vite__mapDeps([22,1,2,15,23,3,6,24,25,10,4]))),gt=i.lazy(()=>f(()=>import("./TenantRegistration-i4hRlOjk.js"),__vite__mapDeps([26,1,2,15,3,6,11,4]))),ht=i.lazy(()=>f(()=>import("./BedDetail-B-G8Mgr0.js"),__vite__mapDeps([27,1,2,15,3,6,28,10,4]))),xt=i.lazy(()=>f(()=>import("./Reports-XbmI_DME.js"),__vite__mapDeps([29,1,2,4,15,10,3,6]))),yt=i.lazy(()=>f(()=>import("./Tenants-BQRsY0_E.js"),__vite__mapDeps([30,1,2,15,3,6,10,4]))),_t=i.lazy(()=>f(()=>import("./Offers-DTGBtrKy.js"),__vite__mapDeps([31,1,2,15,3,6,32,4]))),vt=i.lazy(()=>f(()=>import("./OwnerComplaints-DbsiazL_.js"),__vite__mapDeps([33,1,2,15,3,10,6,4]))),jt=i.lazy(()=>f(()=>import("./TenantDashboard-BvtPeBlM.js"),__vite__mapDeps([34,1,2,15,3,6,32,10,11,4]))),bt=i.lazy(()=>f(()=>import("./Sidebar-wPIWNLMn.js"),__vite__mapDeps([35,1,2,6,36,4]))),wt=i.lazy(()=>f(()=>import("./TenantTransfer-Bv8TUTKU.js"),__vite__mapDeps([37,1,2,3,23,6,10,24,4]))),Et=i.lazy(()=>f(()=>import("./PrivacyPolicy-BCfmr0pd.js"),__vite__mapDeps([38,1,2,3]))),Ot=i.lazy(()=>f(()=>import("./TermsAndConditions-DcR70Dn_.js"),__vite__mapDeps([39,1,2,3]))),Lt=i.lazy(()=>f(()=>import("./TenantDetails-CDbiVHz4.js"),__vite__mapDeps([40,1,2,15,3,6,28,10,4]))),It=i.lazy(()=>f(()=>import("./Bookings-30d7oQHz.js"),__vite__mapDeps([41,1,2,3,15,4,36,10,24,25,6]))),Pt=i.lazy(()=>f(()=>import("./Workers-X0A-7DFG.js"),__vite__mapDeps([42,1,2,15,3,6,10,36,4]))),Rt=i.lazy(()=>f(()=>import("./ManageRents-BVGJFyQI.js"),__vite__mapDeps([43,1,2,3,6,10,4]))),Tt=i.lazy(()=>f(()=>import("./Expenses-CteFguWn.js"),__vite__mapDeps([44,1,2,15,3,10,6,45,4]))),At=i.lazy(()=>f(()=>import("./ForgotPasswordScreen-lCF8O5oi.js"),__vite__mapDeps([46,1,2,6,3,4]))),Dt=i.lazy(()=>f(()=>import("./ChangePasswordScreen-AsjJg_7N.js"),__vite__mapDeps([47,1,2,6,3,4]))),Nt=(...e)=>e.filter(Boolean).join(" ");function zt(){const{pathname:e}=R();return e==="/"?s.jsx("header",{className:"sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md",children:s.jsxs("div",{className:"mx-auto max-w-7xl px-4 py-2 flex items-center justify-between",children:[s.jsx("div",{className:"flex items-center gap-3",children:s.jsxs(F,{to:"/",className:"flex items-center gap-2 group",children:[s.jsx("div",{className:"h-24 w-24 rounded-full bg-white border border-slate-100 p-0 shadow-sm group-hover:shadow-md transition-all overflow-hidden",children:s.jsx("img",{src:ie,alt:"ManageMyPg",className:"w-full h-full object-contain"})}),s.jsx("span",{className:"font-black text-2xl tracking-tighter text-slate-900",children:"ManageMyPg"})]})}),s.jsxs("div",{className:"hidden md:flex items-center gap-4",children:[s.jsx(F,{to:"/manage/mypg/signin",className:"text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors",children:"Sign In"}),s.jsx(F,{to:"/manage/mypg/signup",className:"px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all",children:"Join Now"})]})]})}):null}function St(){const{hash:e}=R();return W.useEffect(()=>{if(!e)return;const t=document.querySelector(e);t&&t.scrollIntoView({behavior:"smooth",block:"start"})},[e]),null}function kt(){const e=de();return s.jsx(rt,{onSignedIn:()=>e("/home",{replace:!0})})}function Vt(){const[e,t]=i.useState(()=>{try{return JSON.parse(localStorage.getItem("sidebar_collapsed"))??!1}catch{return!1}});i.useEffect(()=>{try{localStorage.setItem("sidebar_collapsed",JSON.stringify(e))}catch{}},[e]);const[r,l]=i.useState(!1),{pathname:o}=R(),n=typeof window<"u"&&localStorage.getItem("isAdmin")==="true",a=typeof window<"u"&&localStorage.getItem("isOwner")==="true",c=typeof window<"u"&&localStorage.getItem("isTenant")==="true",d=o.startsWith("/admin")||o.startsWith("/application/administrator"),m=["/","/manage/mypg/signin","/manage/mypg/signup","/forgot-password","/application/administrator/login","/privacy-policy","/terms-and-conditions"].includes(o)||o.startsWith("/mmp/register/")||c||d,u=!m&&o!=="/"&&!d,h=fe(),x=W.useRef(null);return i.useEffect(()=>{if(!a&&!c&&!n)return;let w,T=!1;x.current=()=>{clearTimeout(w),w=setTimeout(()=>{if(T)return;alert("Session expired due to inactivity");const E=localStorage.getItem("isAdmin")==="true";localStorage.clear(),window.location.href=E?"/application/administrator/login":"/manage/mypg/signin"},3600*1e3)};const P=()=>x.current?.(),D=["mousemove","keydown","click","scroll","touchstart"];return D.forEach(E=>window.addEventListener(E,P)),P(),()=>{T=!0,clearTimeout(w),D.forEach(E=>window.removeEventListener(E,P))}},[a,c,n]),s.jsxs(s.Fragment,{children:[s.jsx(st,{position:"top-right",reverseOrder:!1}),s.jsxs(i.Suspense,{fallback:s.jsx(G,{show:!0}),children:[d?n&&s.jsx(ut,{}):s.jsx(zt,{}),s.jsx(St,{}),s.jsx(G,{show:h}),s.jsxs("div",{className:"min-h-screen flex overflow-x-hidden w-full max-w-full",children:[!m&&s.jsx(bt,{collapsed:e,setCollapsed:t,mobileOpen:r,setMobileOpen:l}),s.jsxs("main",{className:Nt("flex-1 min-w-0 px-4 py-4 transition-all duration-300 relative overflow-x-hidden max-w-full",!m&&(e?"md:ml-16":"md:ml-52"),u&&"pt-24 md:pt-4"),children:[u&&s.jsxs("div",{className:"md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b px-4 py-2 flex items-center gap-3",children:[s.jsx("button",{onClick:()=>l(!0),className:"p-2 rounded-xl bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all active:scale-95","aria-label":"Open navigation",children:s.jsx("svg",{className:"h-6 w-6",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",children:s.jsx("path",{d:"M4 6h16M4 12h16M4 18h16"})})}),s.jsxs("div",{className:"flex items-center gap-2",children:[s.jsx("div",{className:"h-12 w-12 rounded-full bg-white border border-slate-100 p-0 shadow-sm overflow-hidden",children:s.jsx("img",{src:ie,alt:"Logo",className:"w-full h-full object-contain"})}),s.jsx("span",{className:"font-black text-slate-900 uppercase tracking-tighter text-lg",children:"ManageMyPg"})]})]}),s.jsxs(ce,{children:[s.jsx(p,{path:"/",element:s.jsx(kt,{})}),s.jsx(p,{path:"/manage/mypg/signin",element:s.jsx(at,{})}),s.jsx(p,{path:"/manage/mypg/signup",element:s.jsx(ot,{})}),s.jsx(p,{path:"/forgot-password",element:s.jsx(At,{})}),s.jsx(p,{path:"/change-password",element:s.jsx(_,{children:s.jsx(Dt,{})})}),s.jsx(p,{path:"/login",element:s.jsx(it,{})}),s.jsx(p,{path:"/application/administrator/login",element:s.jsx(nt,{})}),s.jsx(p,{path:"/admin/dashboard",element:s.jsx(q,{children:s.jsx(lt,{})})}),s.jsx(p,{path:"/admin/owners",element:s.jsx(q,{children:s.jsx(ct,{})})}),s.jsx(p,{path:"/admin/owner/:id",element:s.jsx(q,{children:s.jsx(dt,{})})}),s.jsx(p,{path:"/home",element:s.jsx(_,{children:s.jsx(mt,{})})}),s.jsx(p,{path:"/my-pgs",element:s.jsx(_,{children:s.jsx(pt,{})})}),s.jsx(p,{path:"/pg/:id",element:s.jsx(_,{children:s.jsx(ft,{})})}),s.jsx(p,{path:"/beds/:bedId",element:s.jsx(_,{children:s.jsx(ht,{})})}),s.jsx(p,{path:"/reports",element:s.jsx(_,{children:s.jsx(xt,{})})}),s.jsx(p,{path:"/offers",element:s.jsx(_,{children:s.jsx(_t,{})})}),s.jsx(p,{path:"/tenants",element:s.jsx(_,{children:s.jsx(yt,{})})}),s.jsx(p,{path:"/workers",element:s.jsx(_,{children:s.jsx(Pt,{})})}),s.jsx(p,{path:"/rents",element:s.jsx(_,{children:s.jsx(Rt,{})})}),s.jsx(p,{path:"/expenses",element:s.jsx(_,{children:s.jsx(Tt,{})})}),s.jsx(p,{path:"/bookings",element:s.jsx(_,{children:s.jsx(It,{})})}),s.jsx(p,{path:"/complaints",element:s.jsx(_,{children:s.jsx(vt,{})})}),s.jsx(p,{path:"/ownerProfile",element:s.jsx(_,{children:s.jsx(Q,{mode:"profile"})})}),s.jsx(p,{path:"/owner/onboarding",element:s.jsx(_,{children:s.jsx(Q,{mode:"onboarding"})})}),s.jsx(p,{path:"/mmp/register/:pgId",element:s.jsx(gt,{})}),s.jsx(p,{path:"/tenant/dashboard",element:s.jsx($t,{children:s.jsx(jt,{})})}),s.jsx(p,{path:"/tenant-transfer",element:s.jsx(_,{children:s.jsx(wt,{})})}),s.jsx(p,{path:"/privacy-policy",element:s.jsx(Et,{})}),s.jsx(p,{path:"/terms-and-conditions",element:s.jsx(Ot,{})}),s.jsx(p,{path:"/tenant/:tenantId",element:s.jsx(_,{children:s.jsx(Lt,{})})}),s.jsx(p,{path:"*",element:s.jsx(V,{to:"/",replace:!0})})]})]})]})]})]})}function q({children:e}){const{pathname:t}=R();return typeof window<"u"&&localStorage.getItem("isAdmin")==="true"?e:s.jsx(V,{to:"/application/administrator/login",state:{from:t},replace:!0})}function _({children:e}){const{pathname:t}=R();return typeof window<"u"&&localStorage.getItem("isOwner")==="true"?e:s.jsx(V,{to:"/manage/mypg/signin",state:{from:t},replace:!0})}function $t({children:e}){const{pathname:t}=R();return typeof window<"u"&&localStorage.getItem("isTenant")==="true"?e:s.jsx(V,{to:"/manage/mypg/signin",state:{from:t},replace:!0})}pe.createRoot(document.getElementById("root")).render(s.jsx(W.StrictMode,{children:s.jsx(ue,{children:s.jsx(Vt,{})})}));export{ie as L,Z as a,qt as g,y as n,Bt as z};
