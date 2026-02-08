import{j as e,r as d,p as le,f as ie,u as oe,q as ce,s as me,t as H,v as xe,w as ue}from"./index-DZruhiV_.js";import{d as l}from"./dayjs.min-7h3eaHmg.js";import{P as ge}from"./PageHeader-D4m0aPrs.js";function I(){return l().add(30,"day").startOf("day")}const be=t=>!!t&&l(t).endOf("day").isBefore(l()),he=t=>{if(!t)return null;const s=l(t).diff(l(),"day");return s<0?null:`Vacating in ${s} day${s!==1?"s":""}`},N=(t,s="DD MMM YYYY")=>l(t).isValid()?l(t).format(s):"—",J=t=>l(t).isValid()?l(t).format("MMM ’YY"):"—";function pe(t,s){if(!t)return[];const a=l(t);if(!a.isValid())return[];const c=s?l(s):l().add(1,"month");if(!c.isValid())return[];const n=[];let i=a.startOf("month"),x=0;for(;c.diff(i,"month")>=0&&x<36;)n.push({key:i.format("YYYY-MM"),from:i.startOf("month").toISOString(),to:i.endOf("month").toISOString(),label:i.format("MMM YYYY"),isFirst:x===0}),i=i.add(1,"month"),x++;return n}function fe(t,s){const a=l();return l(t.from).isAfter(a,"month")?{label:"Upcoming",tone:"gray"}:s?.status==="PAID"?{label:"Paid",tone:"green"}:s?.status==="PARTIALLY_PAID"?{label:"Partially Paid",tone:"amber"}:s?s.pending>0?{label:"Partially Paid",tone:"amber"}:{label:"Paid",tone:"green"}:{label:"Due",tone:"red"}}const C=({label:t,value:s})=>e.jsxs("div",{className:"flex items-start justify-between gap-4 py-1.5",children:[e.jsx("div",{className:"text-sm text-gray-600",children:t}),e.jsx("div",{className:"text-sm font-medium text-gray-900 text-right",children:s??"—"})]});function ve({bed:t,current:s,totals:a,statusLabel:c,statusClasses:n,isVacated:i,onCreateTenant:x,onQuickAssign:k,onOpenVacateEdit:v}){return e.jsx("div",{className:"rounded-2xl border bg-white p-6 shadow-sm relative col-span-1 xl:col-span-2 min-w-0",children:e.jsxs("div",{className:"grid grid-cols-[auto,1fr] md:flex md:items-start gap-4",children:[e.jsx("div",{className:"flex-none h-14 w-14 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-lg font-semibold shrink-0",children:(t?.bedName||"B").split(" ").map(y=>y[0]).slice(0,2).join("").toUpperCase()}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("div",{className:"grid grid-cols-[1fr,auto] gap-3 items-start",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsxs("div",{className:"text-lg font-semibold truncate",children:[`Bed ${t.bedName}`," / ",t.roomName," / ",t.floorName]}),e.jsx("div",{className:"text-xs text-gray-500 mt-0.5 truncate",children:s?s.mobileNumber??"":"No tenant assigned"})]}),s&&e.jsxs("div",{className:"flex flex-col items-end gap-1",children:[e.jsx("span",{className:`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${n}`,children:i?"Vacated":c}),!i&&s?.end&&e.jsx("span",{className:"inline-flex px-2 py-0.5 rounded text-[11px] bg-yellow-100 text-yellow-800 border border-yellow-200",children:he(s.end)}),!i&&e.jsx("button",{type:"button",onClick:v,className:"mt-1 px-3 py-1.5 rounded-lg border text-xs font-medium text-indigo-700 hover:bg-indigo-50 whitespace-nowrap",children:s?.end?"Update Vacating Date":"Set Vacating Date"})]})]}),s?e.jsxs("div",{className:"mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"rounded-lg border bg-gradient-to-br from-indigo-50 to-white p-3 border-indigo-100",children:[e.jsx("div",{className:"text-xs font-semibold mb-2 text-indigo-700",children:"Contact"}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(C,{label:"Email",value:s.email?e.jsx("a",{href:`mailto:${s.email}`,className:"text-sm text-indigo-700 hover:underline break-all",children:s.email}):"—"}),e.jsx(C,{label:"Phone",value:s.mobileNumber??"—"}),e.jsx(C,{label:"Vehicle",value:s.vehicleNumber??"—"}),e.jsx(C,{label:"Parent",value:s.parentNumber??"—"})]})]}),e.jsxs("div",{className:"rounded-lg border bg-gradient-to-br from-amber-50 to-white p-3 border-amber-100",children:[e.jsx("div",{className:"text-xs font-semibold mb-2 text-amber-700",children:"Financial"}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(C,{label:"Monthly Rent",value:`₹${s?.monthlyRent??0}`}),e.jsx(C,{label:"Deposit",value:s.advance?`₹${s.advance}`:"—"}),e.jsx(C,{label:"Pending",value:`₹${a.pending??0}`})]})]}),e.jsxs("div",{className:"sm:col-span-2 lg:col-span-1 rounded-lg border bg-gradient-to-br from-blue-50 to-white p-3 border-blue-100",children:[e.jsx("div",{className:"text-xs font-semibold mb-2 text-blue-700",children:"Details"}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(C,{label:"Date of Join",value:N(s.start)}),e.jsx(C,{label:"Expected Vacate",value:N(s.end)}),e.jsx(C,{label:"Age",value:s.age??"—"}),e.jsx(C,{label:"Qualification",value:s.qualification??"—"}),e.jsx(C,{label:"Works at",value:s.company??"—"})]})]})]}):e.jsxs("div",{className:"mt-4 rounded-xl border border-dashed p-5 text-sm text-gray-600",children:[e.jsx("div",{children:"No one is currently assigned to this bed."}),e.jsx("div",{className:"mt-4 flex flex-col sm:flex-row gap-2",children:e.jsx("button",{onClick:k,className:"px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 w-full sm:w-auto",children:"Quick assign"})})]})]})]})})}function ye({open:t,tenants:s,selectedTenant:a,onSelectTenant:c,onClose:n,onAssign:i}){return t?e.jsxs("div",{className:"fixed inset-0 z-50 flex items-center justify-center",children:[e.jsx("div",{className:"absolute inset-0 bg-black/30",onClick:n}),e.jsxs("div",{className:"relative w-full max-w-md rounded-2xl bg-white shadow-xl p-4",children:[e.jsx("h3",{className:"font-semibold mb-3",children:"Quick Assign Tenant"}),e.jsxs("div",{className:"max-h-64 overflow-auto space-y-2",children:[s.length===0&&e.jsx("div",{className:"text-sm text-gray-500",children:"No tenants found"}),s.map(x=>e.jsxs("button",{onClick:()=>c(x),className:`w-full text-left px-3 py-2 rounded border ${a?.id===x.id?"bg-indigo-50 border-indigo-400":"hover:bg-gray-50"}`,children:[e.jsx("div",{className:"font-medium",children:x.name}),e.jsx("div",{className:"text-xs text-gray-500",children:x.mobileNumber})]},x.id))]}),e.jsxs("div",{className:"mt-4 flex justify-end gap-2",children:[e.jsx("button",{className:"px-3 py-2 rounded border",onClick:n,children:"Cancel"}),e.jsx("button",{disabled:!a,className:"px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-50",onClick:i,children:"Assign"})]})]})]}):null}function je({open:t,defaultRent:s,onClose:a,onSave:c,initial:n}){const[i,x]=d.useState(n?.name??""),[k,v]=d.useState(n?.phone??""),[y,h]=d.useState(n?.email??""),[p,w]=d.useState(n?.start?l(n.start).format("YYYY-MM-DD"):l().format("YYYY-MM-DD")),[m,M]=d.useState(n?.rent??s??5e3),[j,Y]=d.useState(n?.deposit??""),[P,T]=d.useState(0),[b,B]=d.useState("Cash"),[F,V]=d.useState(n?.note??"");return d.useEffect(()=>{t&&(x(n?.name??""),v(n?.phone??""),h(n?.email??""),w(n?.start?l(n.start).format("YYYY-MM-DD"):l().format("YYYY-MM-DD")),M(n?.rent??s??5e3),Y(n?.deposit??""),T(0),B("Cash"),V(n?.note??""))},[t,n,s]),t?e.jsxs("div",{className:"fixed inset-0 z-50 flex items-center justify-center",children:[e.jsx("div",{className:"absolute inset-0 bg-black/30 backdrop-blur-sm",onClick:a}),e.jsxs("div",{className:"relative w-full max-w-md mx-4 rounded-2xl border bg-white shadow-xl",children:[e.jsxs("div",{className:"px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl",children:[e.jsx("div",{className:"text-lg font-semibold",children:"Assign tenant"}),e.jsx("div",{className:"text-xs text-gray-600",children:"Create tenant + record optional advance payment"})]}),e.jsxs("div",{className:"p-6 space-y-3",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Name"}),e.jsx("input",{value:i,onChange:g=>x(g.target.value),className:"mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"})]}),e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Phone"}),e.jsx("input",{value:k,onChange:g=>v(g.target.value),className:"mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Email"}),e.jsx("input",{value:y,onChange:g=>h(g.target.value),className:"mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"})]}),e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Start date"}),e.jsx("input",{type:"date",value:p,onChange:g=>w(g.target.value),className:"mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Monthly Rent"}),e.jsx("input",{type:"number",value:m,onChange:g=>M(Number(g.target.value||0)),className:"mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"})]}),e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Deposit"}),e.jsx("input",{type:"number",value:j,onChange:g=>Y(g.target.value),className:"mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"})]})]}),e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Advance payment (optional)"}),e.jsx("input",{type:"number",value:P,onChange:g=>T(Number(g.target.value||0)),className:"mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500",placeholder:"Amount paid today as advance"}),e.jsx("div",{className:"text-xs text-gray-500 mt-1",children:"Advance will be allocated starting from the tenant's first billing period."})]}),e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Payment mode"}),e.jsxs("select",{value:b,onChange:g=>B(g.target.value),className:"mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500",children:[e.jsx("option",{children:"Cash"}),e.jsx("option",{children:"UPI"}),e.jsx("option",{children:"Card"}),e.jsx("option",{children:"Bank Transfer"}),e.jsx("option",{children:"Other"})]})]}),e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Note (optional)"}),e.jsx("textarea",{value:F,onChange:g=>V(g.target.value),rows:2,className:"mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"})]}),e.jsxs("div",{className:"flex items-center justify-end gap-2 pt-2",children:[e.jsx("button",{onClick:a,className:"px-4 py-2 rounded-lg border hover:bg-gray-50",children:"Cancel"}),e.jsx("button",{onClick:()=>{if(!i){alert("Please enter tenant name");return}const g={name:i.trim(),phone:k.trim()||void 0,email:y.trim()||void 0,start:l(p).startOf("day").toISOString(),rent:Number(m)||s||5e3,deposit:j?Number(j):void 0,note:F||void 0};c({tenant:g,advanceAmount:Number(P)||0,mode:b})},className:"px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700",children:"Assign"})]})]})]})]}):null}function Ne({open:t,period:s,defaultRent:a,existingAdvance:c,onClose:n,onSave:i}){const[k,v]=d.useState("Cash"),[y,h]=d.useState(a||1e4),[p,w]=d.useState(a||1e4),[m,M]=d.useState(""),[j,Y]=d.useState(1e3);if(d.useEffect(()=>{t&&(v("Cash"),h(a||1e4),w(a||1e4),c==null?Y(5e3):Y(c),M(""))},[t,a,c]),d.useEffect(()=>{if(!t||!s?.__existing)return;const b=s.__existing;v(b.modeOfPayment||"CASH"),h(b.rent??a),w(b.amountPaid??a),Y(c??5e3),M(b.remarks||"")},[t,s,a,c]),!t||!s)return null;const P=c==null,T=Math.max(0,(Number(y)||0)-(Number(p)||0));return e.jsxs("div",{className:"fixed inset-0 z-50 flex items-center justify-center",children:[e.jsx("div",{className:"absolute inset-0 bg-black/30 backdrop-blur-sm",onClick:n}),e.jsxs("div",{className:"relative w-full max-w-md mx-4 rounded-2xl border bg-white shadow-xl",children:[e.jsxs("div",{className:"px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl",children:[e.jsx("div",{className:"text-lg font-semibold",children:s.__existing?"Edit Payment":"Mark as Paid"}),e.jsxs("div",{className:"text-xs text-gray-600",children:[s.label," • ",N(s.from)," – ",N(s.to)]})]}),e.jsxs("div",{className:"p-6 space-y-4",children:[e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Payment Mode"}),e.jsxs("select",{value:k,onChange:b=>v(b.target.value),className:"mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500",children:[e.jsx("option",{children:"UPI"}),e.jsx("option",{children:"CASH"}),e.jsx("option",{children:"CARD"}),e.jsx("option",{children:"BANK_TRANSFER"}),e.jsx("option",{children:"OTHER"})]})]}),e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Advance (one time)"}),e.jsx("input",{type:"number",value:j,disabled:!P,onChange:b=>Y(b.target.value),className:`mt-1 w-full px-3 py-2 rounded-lg border outline-none 
                ${P?"focus:ring-2 focus:ring-indigo-500":"bg-gray-100 cursor-not-allowed"}`}),!P&&e.jsx("div",{className:"text-xs text-gray-500 mt-1",children:"Advance already collected"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Monthly Rent"}),e.jsx("input",{type:"number",value:y,onChange:b=>h(b.target.value),className:"mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"})]}),e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Amount Paid"}),e.jsx("input",{type:"number",value:p,onChange:b=>w(b.target.value),className:"mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"})]})]}),e.jsxs("div",{className:"rounded-lg bg-gray-50 border px-3 py-2 text-sm flex items-center justify-between",children:[e.jsx("div",{className:"text-gray-600",children:"Pending"}),e.jsxs("div",{className:`font-semibold ${T>0?"text-amber-700":"text-green-700"}`,children:["₹",T]})]}),e.jsxs("label",{className:"block text-sm",children:[e.jsx("span",{className:"font-medium text-gray-700",children:"Notes (optional)"}),e.jsx("textarea",{value:m,onChange:b=>M(b.target.value),rows:2,className:"mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500",placeholder:"Any remarks…"})]}),e.jsxs("div",{className:"flex justify-end gap-2 pt-2",children:[e.jsx("button",{onClick:n,className:"px-4 py-2 rounded-lg border hover:bg-gray-50",children:"Cancel"}),e.jsx("button",{onClick:()=>i({rentMonth:s.key,rent:Number(y)||0,paidAmount:Number(p)||0,advance:Number(j)||0,pending:Number(T)||0,modeOfPayment:k||"Cash",paidDate:new Date().toISOString().slice(0,10),remarks:m||null}),className:"px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700",children:"Save"})]})]})]})]})}function we({open:t,onClose:s,historyItem:a,paymentsForRange:c,defaultRent:n}){const[i,x]=d.useState(null),[k,v]=d.useState(!0),[y,h]=d.useState(null);d.useEffect(()=>{!t||!a?.tenantId||(v(!0),x(null),h(null),le(a.tenantId).then(m=>x(m)).catch(m=>{console.error(m),h("Failed to load tenant details")}).finally(()=>v(!1)))},[t,a?.tenantId]);const p=d.useMemo(()=>i?.rentResponse||[],[i]),w=d.useMemo(()=>{if(!p.length)return{paid:0,pending:0,refunded:0,charges:0};let m=0,M=0;for(const P of p)m+=Number(P.paidAmount)||0,M+=Number(P.pending)||0;const j=Number(p[0]?.refundAmount)||0,Y=Number(p[0]?.charges)||0;return{paid:m,pending:M,refunded:j,charges:Y}},[p]);return!t||!a?null:k?e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center",children:e.jsx("div",{className:"bg-white p-6 rounded-xl shadow",children:"Loading tenant details..."})}):y?e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center",children:e.jsxs("div",{className:"bg-white p-6 rounded-xl shadow max-w-sm text-center",children:[e.jsx("div",{className:"text-red-600 font-medium",children:"Unable to load tenant details"}),e.jsx("div",{className:"text-xs text-gray-500 mt-1",children:"Showing basic history information only."}),e.jsx("button",{onClick:s,className:"mt-4 px-4 py-2 rounded-lg border",children:"Close"})]})}):e.jsxs("div",{className:"fixed inset-0 z-50 flex items-center justify-center",children:[e.jsx("div",{className:"absolute inset-0 bg-black/30 backdrop-blur-sm",onClick:s}),e.jsxs("div",{className:"relative w-full max-w-3xl mx-4 rounded-2xl border bg-white shadow-xl",children:[e.jsxs("div",{className:"px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl",children:[e.jsx("div",{className:"text-lg font-semibold",children:"Tenant stay History"}),e.jsxs("div",{className:"text-xs text-gray-600",children:[i?.name??a.tenantName??"—"," • ",N(a.start)," — ",N(a.end)]})]}),e.jsxs("div",{className:"p-6 space-y-6",children:[e.jsxs("div",{className:"grid sm:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"rounded-xl border bg-gray-50 p-4",children:[e.jsx("div",{className:"text-sm text-gray-600",children:"Details"}),e.jsx("div",{className:"font-semibold",children:i?.name??a.tenantName??"—"}),e.jsx("div",{className:"font-semibold",children:i?.mobileNumber??a.tenantMobileNumber??"—"})]}),e.jsxs("div",{className:"rounded-xl border bg-gray-50 p-4",children:[e.jsx("div",{className:"text-sm text-gray-600",children:"Stay"}),e.jsxs("div",{className:"font-semibold",children:[N(a.start)," — ",N(a.end)]})]})]}),e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm",children:[e.jsxs("div",{className:"rounded-lg border px-3 py-2 bg-gray-50",children:[e.jsx("div",{className:"text-gray-600",children:"Total Paid"}),e.jsxs("div",{className:"font-semibold",children:["₹",w.paid]})]}),e.jsxs("div",{className:"rounded-lg border px-3 py-2 bg-gray-50",children:[e.jsx("div",{className:"text-gray-600",children:"Pending"}),e.jsxs("div",{className:"font-semibold",children:["₹",w.pending]})]}),e.jsxs("div",{className:"rounded-lg border px-3 py-2 bg-gray-50",children:[e.jsx("div",{className:"text-gray-600",children:"Refunded"}),e.jsxs("div",{className:"font-semibold",children:["₹",w.refunded]})]}),e.jsxs("div",{className:"rounded-lg border px-3 py-2 bg-gray-50",children:[e.jsx("div",{className:"text-gray-600",children:"Charges"}),e.jsxs("div",{className:"font-semibold",children:["₹",w.charges]})]})]}),p.length===0?e.jsx("div",{className:"rounded-xl border border-dashed p-4 text-sm text-gray-600",children:"No billing periods available for this stay."}):e.jsx("div",{className:"grid sm:grid-cols-2 lg:grid-cols-3 gap-3",children:p.map(m=>{const M=m.status==="PAID"?"bg-green-50 border-green-200 text-green-800":m.pending>0?"bg-amber-50 border-amber-200 text-amber-800":"bg-gray-50 border-gray-200 text-gray-700";return e.jsxs("div",{className:"rounded-xl border p-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("div",{className:"font-semibold",children:m.rentMonth}),e.jsx("div",{className:`px-2 py-0.5 rounded-lg text-xs border ${M}`,children:m.status})]}),e.jsxs("div",{className:"mt-1 text-xs text-gray-600",children:["Due: ",N(m.dueDate)," • Paid: ",N(m.paidDate)]}),e.jsxs("div",{className:"mt-2 text-xs",children:[e.jsxs("div",{children:["Rent: ₹",m.rentAmount]}),e.jsxs("div",{children:["Paid: ₹",m.paidAmount]}),m.pending>0&&e.jsxs("div",{className:"text-amber-700",children:["Pending: ₹",m.pending]}),e.jsx("div",{className:"text-gray-500",children:m.modeOfPayment})]})]},m.id)})}),e.jsx("div",{className:"flex justify-end",children:e.jsx("button",{onClick:s,className:"px-4 py-2 rounded-lg border hover:bg-gray-50",children:"Close"})})]})]})]})}function Me({open:t,title:s="Confirm",message:a="Are you sure?",confirmLabel:c="Confirm",cancelLabel:n="Cancel",onConfirm:i,onCancel:x}){return t?e.jsxs("div",{className:"fixed inset-0 z-50 flex items-center justify-center",children:[e.jsx("div",{className:"absolute inset-0 bg-black/30 backdrop-blur-sm",onClick:x}),e.jsxs("div",{className:"relative w-full max-w-md mx-4 rounded-2xl border bg-white shadow-xl",children:[e.jsx("div",{className:"px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl",children:e.jsx("div",{className:"text-lg font-semibold",children:s})}),e.jsx("div",{className:"p-6 text-sm text-gray-700",children:a}),e.jsxs("div",{className:"flex justify-end gap-2 px-6 pb-6",children:[e.jsx("button",{onClick:x,className:"px-4 py-2 rounded-lg border hover:bg-gray-50",children:n}),e.jsx("button",{onClick:i,className:"px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700",children:c})]})]})]}):null}function ke({snack:t}){if(!t)return null;const s=t.type==="error"?"bg-red-600":t.type==="info"?"bg-gray-800":"bg-emerald-600";return e.jsx("div",{className:`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg text-white shadow-lg ${s}`,role:"status","aria-live":"polite",children:t.text})}function Pe({open:t,tenant:s,onClose:a,onSave:c}){const[n,i]=d.useState(""),[x,k]=d.useState(!1),[v,y]=d.useState("");if(d.useEffect(()=>{t&&(s?.end?i(l(s.end).format("YYYY-MM-DD")):i(l(I()).format("YYYY-MM-DD")),k(!1),y(""))},[s,t]),!t)return null;const h=l(I()),p=l(n),w=!s?.end&&n&&p.isBefore(h,"day"),m=s?.end&&n&&p.isSame(l(),"day"),M=!w||x&&v.trim().length>=5;return e.jsxs("div",{className:"fixed inset-0 z-50 flex items-center justify-center",children:[e.jsx("div",{className:"absolute inset-0 bg-black/40",onClick:a}),e.jsxs("div",{className:"relative w-full max-w-md mx-4 rounded-2xl bg-white shadow-xl",children:[e.jsx("div",{className:"px-6 py-4 border-b",children:e.jsx("h3",{className:"text-lg font-semibold",children:s?.end?"Update Vacating Date":"Set Vacating Date"})}),e.jsxs("div",{className:"px-6 py-4 space-y-3",children:[s?.end&&e.jsxs("div",{className:"text-sm text-gray-600",children:["Current vacating date:"," ",e.jsx("strong",{children:N(s.end)})]}),e.jsx("label",{className:"block text-sm font-medium text-gray-700",children:"Vacating Date"}),e.jsx("input",{type:"date",value:n,min:s?.end?l().format("YYYY-MM-DD"):l(I()).format("YYYY-MM-DD"),onChange:j=>{i(j.target.value),k(!1),y("")},className:"w-full rounded-md border px-3 py-2 text-sm"}),m&&e.jsx("div",{className:"rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700",children:"You are marking current tenant is vacating today."}),w&&e.jsx("div",{className:"rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700",children:"Selected date is less than 30 days from today."}),w&&e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center gap-2 text-sm",children:[e.jsx("input",{type:"checkbox",checked:x,onChange:j=>k(j.target.checked),className:"h-4 w-4"}),"Allow early vacating (override)"]}),x&&e.jsxs(e.Fragment,{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700",children:"Reason for early vacating"}),e.jsx("textarea",{value:v,onChange:j=>y(j.target.value),rows:3,className:"w-full rounded-md border px-3 py-2 text-sm",placeholder:"Medical emergency, job relocation, etc."}),v.trim().length<5&&e.jsx("div",{className:"text-xs text-red-600",children:"Please enter a valid reason (minimum 5 characters)"})]})]})]}),e.jsxs("div",{className:"flex justify-end gap-2 px-6 py-4 border-t",children:[e.jsx("button",{onClick:a,className:"px-4 py-2 rounded-lg border text-sm hover:bg-gray-50",children:"Cancel"}),e.jsx("button",{disabled:!M,onClick:()=>c({vacatingDate:n,reason:x?v.trim():null}),className:`px-4 py-2 rounded-lg text-sm text-white
              ${M?"bg-indigo-600 hover:bg-indigo-700":"bg-gray-300 cursor-not-allowed"}`,children:"Save"})]})]})]})}function _(t){if(!t)return null;const s=t.tenantDetails;return s?.rentResponse?.slice()?.sort((a,c)=>c.rentMonth.localeCompare(a.rentMonth))[0],{...t,occupied:!!t.occupied,tenantDetails:s?{...s,start:s.dateOfJoining,end:s.dateOfVacate,mobileNumber:s.mobileNumber,company:s.workCompany}:null,bedHistory:Array.isArray(t.bedHistory)?t.bedHistory.map(a=>({...a,tenantName:a.tenantName||a.tenant?.name||a.name,start:a.startDate,end:a.endDate})):[]}}function Se(t=[]){const s={};return t.forEach(a=>{const c=l(a.rentMonth+"-01").format("YYYY-MM");s[c]={key:c,amountPaid:a.paidAmount,pending:(a.rentAmount??0)-(a.paidAmount??0),rent:a.rentAmount,modeOfPayment:a.modeOfPayment,paidAt:a.paidDate,status:a.status}}),s}function Ce({tenant:t,period:s,payment:a,bed:c}){const n=window.open("","_blank");if(!n)return;l(s.from).format("MMM YYYY");const i=`${t.name}_${l(s.from).format("MMM_YYYY")}.pdf`;n.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>${i}</title>
  <style>
    @page {
      size: A5;
      margin: 12mm;
    }

    body {
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 12px;
      color: #000;
    }

    .header {
      text-align: center;
      margin-bottom: 8px;
    }

    .header h1 {
      margin: 0;
      font-size: 18px;
      letter-spacing: 1px;
    }

    .header .sub {
      font-size: 11px;
      margin-top: 2px;
    }

    .receipt-title {
      text-align: center;
      font-weight: bold;
      margin: 8px 0;
      text-decoration: underline;
    }

    .row {
      display: flex;
      justify-content: space-between;
      margin: 6px 0;
    }

    .label {
      width: 35%;
    }

    .value {
      width: 65%;
      border-bottom: 1px dotted #000;
      padding-left: 4px;
    }

    .amount-box {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .rs-box {
      border: 2px solid #000;
      padding: 6px 12px;
      font-weight: bold;
      font-size: 14px;
    }

    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      font-size: 11px;
    }

    .signature {
      width: 45%;
      text-align: center;
      border-top: 1px solid #000;
      padding-top: 4px;
    }

    .footer {
      margin-top: 10px;
      font-size: 10px;
    }
  </style>
</head>

<body>

  <div class="header">
    <h1>BLISS MEN'S PG HOSTEL</h1>
    <div class="sub">
      Plot No. 220, Prasanth Hills, Raidurg, Khajaguda, Hyderabad - 500032<br/>
      Cell : 99666 08088
    </div>
  </div>

  <div class="receipt-title">RECEIPT</div>

  <div class="row">
    <div><strong>No:</strong> ${a.id?.slice(-4)||"—"}</div>
    <div><strong>Date:</strong> ${l(a.paidAt).format("DD-MM-YYYY")}</div>
  </div>

  <div class="row">
    <div class="label">Received From</div>
    <div class="value">${t.name}</div>
  </div>

  <div class="row"><span class="label">Room No</span>
  <span class="value">${c?.roomName||"-"} / Bed ${c?.bedName||"-"}</span>
</div>

  <div class="row">
    <div class="label">Valid From</div>
    <div class="value">${l(s.from).format("DD MMM YYYY")}</div>
  </div>

  <div class="row">
    <div class="label">Valid To</div>
    <div class="value">${l(s.to).format("DD MMM YYYY")}</div>
  </div>

  <div class="row">
    <div class="label">Rupees in words</div>
    <div class="value">${W(a.amountPaid)} only</div>
  </div>

  <div class="amount-box">
    <div class="rs-box">Rs. ${a.amountPaid}</div>
  </div>

  <div class="signatures">
    <div class="signature">Candidate's Signature</div>
    <div class="signature">Receiver's Signature</div>
  </div>

  <div class="footer">
    * Fees once paid is not refundable
  </div>

  <script>
    window.onload = () => {
      window.print()
      window.onafterprint = () => window.close()
    }
  <\/script>

</body>
</html>
  `),n.document.close()}function W(t){const s=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],a=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];return t===0?"Zero":t<20?s[t]:t<100?a[Math.floor(t/10)]+(t%10?" "+s[t%10]:""):t<1e3?s[Math.floor(t/100)]+" Hundred "+W(t%100):t.toString()}function Te(){const{bedId:t}=ie(),s=oe(),[a,c]=d.useState({}),[n,i]=d.useState(null),[x,k]=d.useState(!0),[v,y]=d.useState(!1),[h,p]=d.useState({}),[w,m]=d.useState([]),[M,j]=d.useState(null),[Y,P]=d.useState(!1),[T,b]=d.useState(!1),[B,F]=d.useState(null),[V,g]=d.useState(!1),[Z,X]=d.useState(null),[ee,K]=d.useState(!1),[Q,se]=d.useState(null),[te,q]=d.useState(null),O=(r,o="success")=>{q({text:r,type:o}),setTimeout(()=>q(null),2500)};d.useEffect(()=>{async function r(){k(!0);try{const o=await H(t),u=_(o);i(u),u?.tenantDetails?.rentResponse&&p(Se(u.tenantDetails.rentResponse))}finally{k(!1)}}r()},[t]),d.useEffect(()=>{n?.pgId&&ce(n.pgId).then(m).catch(()=>m([]))},[n?.pgId]);const f=n?.occupied?n.tenantDetails:null,G=be(f?.end),E=f?.monthlyRent,ae=f?.rentResponse?.[0]?.advance??null,L=d.useMemo(()=>f?.start?pe(f.start,f.end??void 0):[],[f?.start,f?.end]),R=d.useMemo(()=>{const r=l().add(1,"month").endOf("month");return L.filter(o=>!l(o.from).isAfter(r))},[L]),z=d.useMemo(()=>{let r=0,o=0,u=0;return L.forEach(S=>{const D=h[S.key];D?(o+=Number(D.amountPaid)||0,u+=Number(D.pending)||0):r+=f.monthlyRent}),{due:r,paid:o,pending:u}},[L,h,E]),U=d.useMemo(()=>[...n?.bedHistory||[]].sort((r,o)=>l(o.end||o.start).valueOf()-l(r.end||r.start).valueOf()),[n]);function ne(r){F({...r,__existing:h[r.key]}),g(!0)}function re(){const r=[["Bed","Tenant","Period","From","To","Status","Paid","Pending","Mode","Paid At"]];R.forEach($=>{const A=h[$.key];r.push([n.bedName,f?.name||"-",$.label,N($.from),N($.to),A?"Paid":"Unpaid",A?.amountPaid??0,A?.pending??E,A?.mode??"-",A?.paidAt?N(A.paidAt,"DD MMM YYYY, HH:mm"):"-"])});const o=r.map($=>$.map(A=>typeof A=="string"&&A.includes(",")?`"${A.replace(/"/g,'""')}"`:A).join(",")).join(`
`),u=new Blob([o],{type:"text/csv;charset=utf-8;"}),S=URL.createObjectURL(u),D=document.createElement("a");D.href=S,D.download=`payments_${n.bedName}.csv`,D.click(),URL.revokeObjectURL(S),O("CSV exported")}function de(){const r=window.open("","_blank");if(!r)return;const o=R.map(u=>{const S=h[u.key];return`
      <tr>
        <td>${u.label}</td>
        <td>${N(u.from)}</td>
        <td>${N(u.to)}</td>
        <td>${S?"Paid":"Unpaid"}</td>
        <td>${S?.amountPaid??E}</td>
        <td>${S?.pending??0}</td>
        <td>${S?.mode??"-"}</td>
      </tr>
    `}).join("");r.document.write(`
    <html>
      <head>
        <title>Payments - ${n.bedName}</title>
        <style>
          body { font: 14px system-ui; padding: 16px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 6px; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h3>Payments — ${n.bedName}</h3>
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Paid</th>
              <th>Pending</th>
              <th>Mode</th>
            </tr>
          </thead>
          <tbody>${o}</tbody>
        </table>
        <script>window.print()<\/script>
      </body>
    </html>
  `),r.document.close()}return x?e.jsx("div",{className:"p-6",children:"Loading…"}):n?e.jsxs("div",{className:"max-w-screen-2xl mx-auto px-4 py-6 space-y-8",children:[e.jsx(ge,{title:`Bed ${n.bedName}`,subtitle:`${n.floorName} • Room ${n.roomName}`}),e.jsxs("div",{className:"grid grid-cols-1 xl:grid-cols-2 gap-8 items-start",children:[e.jsx(ve,{bed:n,current:f,totals:z,statusLabel:n.occupied?"Occupied":"Available",statusClasses:n.occupied?"bg-red-50 text-red-800 border border-red-200":"bg-green-50 text-green-700 border border-green-200",isVacated:G,onCreateTenant:()=>b(!0),onQuickAssign:()=>P(!0),onOpenVacateEdit:()=>y(!0)}),e.jsx(Pe,{open:v,tenant:f,onClose:()=>y(!1),onSave:async({vacatingDate:r,reason:o})=>{try{await me(f.id,{vacatingDate:r,reason:o});const u=await H(t);i(_(u)),O("Vacating date updated")}catch{O("Failed to update vacating date","error")}finally{y(!1)}}}),e.jsxs("div",{className:"col-span-1 rounded-2xl border bg-white p-5 shadow-sm w-full min-w-0",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("h3",{className:"font-semibold",children:"Payments"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("span",{className:"text-xs text-gray-500",children:[R.length," period",R.length!==1?"s":""]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("button",{onClick:re,className:"px-2 py-1 rounded border text-xs hover:bg-gray-50",children:"CSV"}),e.jsx("button",{onClick:de,className:"px-2 py-1 rounded border text-xs hover:bg-gray-50",children:"Print"})]})]})]}),e.jsxs("div",{className:"mt-4 space-y-4",children:[e.jsx("div",{className:"rounded-lg border bg-gray-50 p-3 text-sm",children:e.jsxs("div",{className:"mt-2 flex justify-between text-xs text-gray-500",children:[e.jsxs("div",{children:["Paid: ",e.jsxs("span",{className:"font-medium text-gray-900",children:["₹",z.paid]})]}),e.jsxs("div",{children:["Pending:"," ",e.jsxs("span",{className:"font-medium text-amber-700",children:["₹",z.pending]})]})]})}),!f||R.length===0?e.jsx("div",{className:"rounded-2xl border border-dashed p-4 text-sm text-gray-600",children:"No periods to display."}):e.jsx("div",{className:"space-y-4",children:R.map(r=>{const o=h[r.key],u=fe(r,o);l(r.from).isSame(l(),"month");const S=l(r.from).isAfter(l(),"month"),D=u.tone==="green"?"bg-green-50 border-green-200 text-green-800":u.tone==="red"?"bg-red-50 border-red-200 text-red-800":u.tone==="amber"?"bg-amber-50 border-amber-200 text-amber-800":"bg-gray-50 border-gray-200 text-gray-700";return e.jsxs("div",{className:"rounded-xl border p-3 bg-white",children:[e.jsxs("div",{className:"flex justify-between gap-3",children:[e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("div",{className:"font-semibold truncate",children:r.label}),e.jsxs("div",{className:"text-xs text-gray-500",children:[N(r.from,"DD MMM")," – ",N(r.to,"DD MMM")]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("div",{className:`inline-flex px-2 py-0.5 rounded border text-xs ${D}`,children:u.label}),e.jsxs("div",{className:"mt-1 font-semibold",children:["Rent : ₹",o?o.amountPaid:f.monthlyRent,e.jsx("br",{}),"Payment Mode : ",o?o.modeOfPayment.replace("_"," "):"—",o?.pending>0&&e.jsxs("span",{className:"text-xs text-amber-700 ml-1",children:["(+₹",o.pending," pending)"]})]}),e.jsxs("div",{className:"mt-2 flex gap-2 justify-end",children:[G?e.jsx("span",{className:"text-xs text-gray-400 italic",children:"Payments locked"}):S?e.jsx("span",{className:"text-xs text-gray-400 italic",children:"Not payable yet"}):o?e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:()=>{Ce({tenant:f,period:r,payment:o,bed:n}),c($=>({...$,[r.key]:!0}))},className:"px-2 py-1 rounded border text-xs",children:"Print Slip"}),e.jsx("button",{onClick:()=>ne(r),className:"px-2 py-1 rounded border text-xs",children:"Edit"})]}):e.jsx("button",{onClick:()=>{F(r),g(!0)},className:`\r
                                mt-[2px]\r
                                px-3 py-1.5\r
                                rounded-lg border\r
                                text-xs font-medium text-indigo-700\r
                                hover:bg-indigo-50\r
                                whitespace-nowrap\r
                              `,children:"Mark As Paid"}),a[r.key]&&e.jsx("div",{className:"text-[11px] text-green-600 mt-1 text-right",children:"Slip Printed"})]})]})]}),r.isFirst&&f?.start&&l(f.start).date()!==1&&e.jsx("div",{className:"mt-2 text-[11px] bg-blue-50 border border-blue-200 text-blue-800 px-2 py-1 rounded inline-block",children:"Prorated"})]},r.key)})})]})]}),e.jsxs("div",{className:"rounded-2xl border bg-white p-5 shadow-sm",children:[e.jsxs("div",{className:"flex justify-between mb-3",children:[e.jsx("h3",{className:"font-semibold",children:"History"}),e.jsxs("span",{className:"text-xs text-gray-500",children:[U.length," records"]})]}),U.length===0?e.jsx("div",{className:"text-sm text-gray-500 border-dashed border p-4 rounded",children:"No history yet"}):e.jsx("ol",{className:"space-y-3",children:U.map((r,o)=>e.jsx("li",{className:"border rounded-lg p-3",children:e.jsxs("div",{className:"flex justify-between",children:[e.jsxs("div",{children:[e.jsx("div",{className:"font-medium",children:r.tenantName}),e.jsxs("div",{className:"text-xs text-gray-500",children:[J(r.start)," → ",r.end?J(r.end):"Ongoing"]})]}),e.jsx("button",{className:"text-xs border px-2 py-1 rounded",onClick:()=>{X(r),K(!0)},children:"View"})]})},o))})]})]}),e.jsx(ye,{open:Y,tenants:w,selectedTenant:M,onSelectTenant:j,onClose:()=>{P(!1),j(null)},onAssign:async()=>{try{await xe(n.id,M.id);const r=await H(t);i(_(r)),O("Tenant assigned successfully"),P(!1),j(null)}catch(r){const o=r?.response?.data?.message||"Tenant already assigned to another bed";O(o,"error")}}}),e.jsx(je,{open:T,defaultRent:E,onClose:()=>b(!1),onSave:()=>{O("Tenant assigned"),b(!1)}}),e.jsx(Ne,{open:V,period:B,defaultRent:E,existingAdvance:ae,onClose:()=>g(!1),onSave:async r=>{try{const o={rentMonth:r.rentMonth,rent:r.rent,paidAmount:r.paidAmount,advance:r.advance,pending:r.pending,modeOfPayment:r.modeOfPayment,paidDate:r.paidDate,remarks:r.remarks},u=await ue(f.id,o);O(u.message,"success");const S=await H(t);i(_(S)),g(!1)}catch(o){const u=o?.response?.data?.message||o?.response?.data?.error||o?.message||"Payment failed";O(u,"error")}}}),e.jsx(we,{open:ee,historyItem:Z,paymentsForRange:h,defaultRent:E,onClose:()=>K(!1)}),e.jsx(Me,{open:!!Q,...Q,onCancel:()=>se(null)}),e.jsx(ke,{snack:te})]}):e.jsxs("div",{className:"p-6",children:[e.jsx("div",{className:"font-semibold",children:"Bed not found"}),e.jsx("button",{onClick:()=>s(-1),className:"mt-3 border px-3 py-2 rounded",children:"Go Back"})]})}export{Te as default};
