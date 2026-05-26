// // import { useState, useEffect, useRef } from "react";
// // import axios from "axios";

// // // ─── CONFIG ────────────────────────────────────────────────────────────────
// // const API = "http://localhost:5000";

// // const TYPE_CONFIG = {
// //   url:      { label: "Website URL",   placeholder: "https://yourwebsite.com", hint: "Include https://",         prefix: "",               icon: "🌐" },
// //   whatsapp: { label: "WhatsApp",      placeholder: "+91 98765 43210",         hint: "Number with country code", prefix: "https://wa.me/", icon: "💬" },
// //   email:    { label: "Email Address", placeholder: "you@email.com",           hint: "Opens mail app on scan",   prefix: "mailto:",        icon: "✉️" },
// //   phone:    { label: "Phone Number",  placeholder: "+91 98765 43210",         hint: "Include country code",     prefix: "tel:",           icon: "📞" },
// //   text:     { label: "Plain Text",    placeholder: "Any message or info…",    hint: "Any text to encode",       prefix: "",               icon: "📝" },
// // };

// // function buildDestination(type, raw) {
// //   if (!raw.trim()) return null;
// //   const cfg = TYPE_CONFIG[type];
// //   if (type === "whatsapp") return cfg.prefix + raw.replace(/[\s\-()]/g, "").replace(/^\+/, "");
// //   if (type === "phone")    return cfg.prefix + raw.replace(/\s/g, "");
// //   return cfg.prefix + raw.trim();
// // }

// // function timeAgo(ts) {
// //   const diff = Date.now() - new Date(ts).getTime();
// //   const m = Math.floor(diff / 60000);
// //   if (m < 1)  return "just now";
// //   if (m < 60) return `${m}m ago`;
// //   const h = Math.floor(m / 60);
// //   if (h < 24) return `${h}h ago`;
// //   return `${Math.floor(h / 24)}d ago`;
// // }

// // // ─── MAIN ───────────────────────────────────────────────────────────────────
// // export default function QRManager() {
// //   const [tab,         setTab]         = useState("editor");   // "editor" | "history"
// //   const [type,        setType]        = useState("url");
// //   const [name,        setName]        = useState("");
// //   const [input,       setInput]       = useState("");
// //   const [color,       setColor]       = useState("#0f172a");
// //   const [qrList,      setQrList]      = useState([]);
// //   const [activeQr,    setActiveQr]    = useState(null);  // full record from API
// //   const [editDest,    setEditDest]    = useState("");    // for inline update
// //   const [loading,     setLoading]     = useState(false);
// //   const [error,       setError]       = useState("");
// //   const [toast,       setToast]       = useState("");
// //   const [libReady,    setLibReady]    = useState(false);
// //   const [downloading, setDownloading] = useState(false);
// //   const canvasRef = useRef(null);

// //   // ── Load QRCode.js ──
// //   useEffect(() => {
// //     if (window.QRCode) { setLibReady(true); return; }
// //     const s = document.createElement("script");
// //     s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
// //     s.async = true;
// //     s.onload = () => setLibReady(true);
// //     document.head.appendChild(s);
// //   }, []);

// //   // ── Render QR into canvas ──
// //   useEffect(() => {
// //     if (!activeQr || !libReady || !canvasRef.current || !window.QRCode) return;
// //     canvasRef.current.innerHTML = "";
// //     try {
// //       new window.QRCode(canvasRef.current, {
// //         text:         activeQr.qr_url,
// //         width:        220,
// //         height:       220,
// //         colorDark:    color,
// //         colorLight:   "#ffffff",
// //         correctLevel: window.QRCode.CorrectLevel.H,
// //       });
// //     } catch {
// //       setError("Failed to render QR code.");
// //     }
// //   }, [activeQr, libReady, color]);

// //   // ── Fetch all QRs ──
// //   async function fetchAll() {
// //     try {
// //       const { data } = await axios.get(`${API}/api/qr`);
// //       setQrList(data);
// //     } catch {
// //       showToast("Failed to load QR codes");
// //     }
// //   }

// //   useEffect(() => { fetchAll(); }, []);

// //   function showToast(msg) {
// //     setToast(msg);
// //     setTimeout(() => setToast(""), 2400);
// //   }

// //   // ── Create new QR ──
// //   async function handleCreate() {
// //     setError("");
// //     const destination = buildDestination(type, input);
// //     if (!destination) { setError("Please enter a valid value."); return; }
// //     if (!name.trim())  { setError("Please enter a name for this QR code."); return; }
// //     setLoading(true);
// //     try {
// //       const { data } = await axios.post(`${API}/api/qr`, { name: name.trim(), destination });
// //       // data = { success, qrUrl }
// //       await fetchAll();
// //       // find newly created record
// //       const { data: all } = await axios.get(`${API}/api/qr`);
// //       setQrList(all);
// //       const newest = all.find(q => q.destination === destination && q.name === name.trim());
// //       if (newest) {
// //         setActiveQr({ ...newest, qr_url: data.qrUrl });
// //       }
// //       showToast("QR code created ✓");
// //       setName("");
// //       setInput("");
// //     } catch {
// //       setError("Failed to create QR code.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   // ── Update destination ──
// //   async function handleUpdate() {
// //     if (!activeQr) return;
// //     const newDest = editDest.trim();
// //     if (!newDest) { setError("Destination cannot be empty."); return; }
// //     setLoading(true);
// //     try {
// //       await axios.put(`${API}/api/qr/${activeQr.qr_key}`, { destination: newDest });
// //       setActiveQr(prev => ({ ...prev, destination: newDest }));
// //       setQrList(prev => prev.map(q => q.qr_key === activeQr.qr_key ? { ...q, destination: newDest } : q));
// //       showToast("Destination updated ✓");
// //     } catch {
// //       setError("Failed to update.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   function loadQr(entry) {
// //     setActiveQr({ ...entry, qr_url: `${API}/qr/${entry.qr_key}` });
// //     setEditDest(entry.destination);
// //     setTab("editor");
// //     setError("");
// //   }

// //   function downloadPng() {
// //     const canvas = canvasRef.current?.querySelector("canvas");
// //     if (!canvas) return;
// //     setDownloading(true);
// //     setTimeout(() => {
// //       const a = document.createElement("a");
// //       a.download = `qr-${activeQr?.qr_key ?? "code"}.png`;
// //       a.href = canvas.toDataURL("image/png");
// //       a.click();
// //       setDownloading(false);
// //     }, 100);
// //   }

// //   function copyLink() {
// //     if (!activeQr) return;
// //     navigator.clipboard?.writeText(activeQr.qr_url).then(() => showToast("Link copied!"));
// //   }

// //   const COLORS = ["#0f172a","#1e3a8a","#14532d","#581c87","#7c2d12","#b45309","#be123c"];

// //   // ─────────────────────────────────────────────────────────────────────────
// //   return (
// //     <div className="min-h-screen bg-zinc-50 font-sans flex flex-col">
// //       {/* Tailwind CDN (runtime) */}
// //       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/base.css" />

// //       {/* ── HEADER ── */}
// //       <header className="bg-slate-900 text-white px-6 h-13 flex items-center gap-3 shrink-0" style={{ height: 52 }}>
// //         <div className="w-7 h-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-sm">▦</div>
// //         <span className="font-semibold text-sm tracking-tight">QR Dynamic</span>
// //         <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 font-medium">
// //           Dynamic · Editable
// //         </span>
// //         <div className="ml-auto flex gap-1">
// //           {["editor","history"].map(v => (
// //             <button
// //               key={v}
// //               onClick={() => { setTab(v); if (v === "history") fetchAll(); }}
// //               className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
// //                 tab === v
// //                   ? "bg-white/10 border border-white/20 text-white"
// //                   : "text-white/50 hover:text-white/80"
// //               }`}
// //             >
// //               {v === "editor" ? "Editor" : `History${qrList.length ? ` (${qrList.length})` : ""}`}
// //             </button>
// //           ))}
// //         </div>
// //       </header>

// //       {/* ── TOAST ── */}
// //       {toast && (
// //         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-xl animate-bounce">
// //           {toast}
// //         </div>
// //       )}

// //       {/* ── HISTORY TAB ── */}
// //       {tab === "history" && (
// //         <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
// //           <p className="text-xs text-slate-400 mb-4">
// //             {qrList.length === 0
// //               ? "No QR codes yet. Create one from the Editor tab."
// //               : `${qrList.length} QR code${qrList.length > 1 ? "s" : ""} — click to load & edit`}
// //           </p>
// //           <div className="flex flex-col gap-2">
// //             {qrList.map(entry => (
// //               <div
// //                 key={entry.id ?? entry.qr_key}
// //                 onClick={() => loadQr(entry)}
// //                 className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:bg-slate-50 ${
// //                   activeQr?.qr_key === entry.qr_key
// //                     ? "border-slate-900 bg-slate-900/5 border-l-2"
// //                     : "border-slate-200 bg-white"
// //                 }`}
// //               >
// //                 <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-base shrink-0">
// //                   🔗
// //                 </div>
// //                 <div className="flex-1 min-w-0">
// //                   <p className="text-sm font-semibold text-slate-800 truncate">{entry.name}</p>
// //                   <p className="text-xs text-slate-400 truncate mt-0.5">{entry.destination}</p>
// //                 </div>
// //                 <div className="text-xs text-slate-400 shrink-0">
// //                   {entry.created_at ? timeAgo(entry.created_at) : ""}
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       )}

// //       {/* ── EDITOR TAB ── */}
// //       {tab === "editor" && (
// //         <div className="flex-1 flex overflow-hidden" style={{ flexWrap: "wrap" }}>

// //           {/* LEFT: Controls */}
// //           <div className="w-80 shrink-0 bg-white border-r border-slate-200 p-5 overflow-y-auto flex flex-col gap-5">

// //             {/* Type */}
// //             <div>
// //               <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Type</p>
// //               <div className="flex flex-wrap gap-1.5">
// //                 {Object.entries(TYPE_CONFIG).map(([key, val]) => (
// //                   <button
// //                     key={key}
// //                     onClick={() => { setType(key); setInput(""); setError(""); }}
// //                     className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
// //                       type === key
// //                         ? "bg-slate-900 text-white border-slate-900"
// //                         : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
// //                     }`}
// //                   >
// //                     <span>{val.icon}</span> {val.label}
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>

// //             {/* Name */}
// //             <div>
// //               <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">Name</label>
// //               <input
// //                 type="text"
// //                 value={name}
// //                 onChange={e => setName(e.target.value)}
// //                 placeholder="e.g. My Portfolio"
// //                 className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition"
// //               />
// //               <p className="text-xs text-slate-400 mt-1">A label to identify this QR code</p>
// //             </div>

// //             {/* Destination */}
// //             <div>
// //               <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">
// //                 {TYPE_CONFIG[type].label}
// //               </label>
// //               <input
// //                 type="text"
// //                 value={input}
// //                 onChange={e => setInput(e.target.value)}
// //                 onKeyDown={e => e.key === "Enter" && handleCreate()}
// //                 placeholder={TYPE_CONFIG[type].placeholder}
// //                 className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition"
// //               />
// //               <p className="text-xs text-slate-400 mt-1">{TYPE_CONFIG[type].hint}</p>
// //             </div>

// //             {/* Color */}
// //             <div>
// //               <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Color</p>
// //               <div className="flex gap-2">
// //                 {COLORS.map(c => (
// //                   <button
// //                     key={c}
// //                     onClick={() => setColor(c)}
// //                     className="w-6 h-6 rounded-full transition-transform hover:scale-110"
// //                     style={{
// //                       background: c,
// //                       outline: color === c ? `2px solid ${c}` : "none",
// //                       outlineOffset: 2,
// //                       border: `2px solid ${color === c ? "#0f172a" : "transparent"}`,
// //                     }}
// //                   />
// //                 ))}
// //               </div>
// //             </div>

// //             {/* Error */}
// //             {error && (
// //               <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
// //                 {error}
// //               </div>
// //             )}

// //             {/* Create button */}
// //             <div className="mt-auto">
// //               <button
// //                 onClick={handleCreate}
// //                 disabled={loading}
// //                 className="w-full py-2.5 text-sm font-semibold rounded-lg bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
// //               >
// //                 {loading ? "Creating…" : "Generate QR Code"}
// //               </button>
// //             </div>
// //           </div>

// //           {/* RIGHT: Preview */}
// //           <div className="flex-1 flex items-center justify-center p-8 bg-zinc-50 min-w-72">
// //             {!activeQr ? (
// //               <div className="text-center">
// //                 <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-4xl mx-auto mb-4">▦</div>
// //                 <p className="text-sm font-medium text-slate-500">Your QR code appears here</p>
// //                 <p className="text-xs text-slate-400 mt-1">Fill in the details and click Generate</p>
// //               </div>
// //             ) : (
// //               <div className="flex flex-col items-center gap-4 w-full max-w-xs">

// //                 {/* Label row */}
// //                 <div className="flex items-center gap-2">
// //                   <span className="text-sm font-semibold text-slate-800">{activeQr.name}</span>
// //                   <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-semibold">DYNAMIC</span>
// //                 </div>

// //                 {/* QR Card */}
// //                 <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col items-center gap-3 w-full shadow-sm">
// //                   <div ref={canvasRef} className="leading-none" />
// //                   <p className="text-xs text-slate-400 text-center break-all max-w-xs font-mono">
// //                     {activeQr.qr_url}
// //                   </p>
// //                 </div>

// //                 {/* Update destination */}
// //                 <div className="w-full bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
// //                   <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Update Destination</p>
// //                   <input
// //                     type="text"
// //                     value={editDest}
// //                     onChange={e => setEditDest(e.target.value)}
// //                     onKeyDown={e => e.key === "Enter" && handleUpdate()}
// //                     placeholder="New destination URL"
// //                     className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/20"
// //                   />
// //                   <button
// //                     onClick={handleUpdate}
// //                     disabled={loading}
// //                     className="w-full py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-50"
// //                   >
// //                     {loading ? "Updating…" : "↻ Update Destination"}
// //                   </button>
// //                 </div>

// //                 {/* Download / Copy */}
// //                 <div className="flex gap-2 w-full">
// //                   <button
// //                     onClick={downloadPng}
// //                     className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition flex items-center justify-center gap-1"
// //                   >
// //                     ↓ {downloading ? "Saving…" : "PNG"}
// //                   </button>
// //                   <button
// //                     onClick={copyLink}
// //                     className="flex-1 py-2 text-xs font-semibold rounded-lg bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 transition"
// //                   >
// //                     ⎘ Copy Link
// //                   </button>
// //                 </div>

// //                 {/* Info box */}
// //                 <div className="w-full p-3 bg-green-50 border border-green-100 rounded-xl">
// //                   <p className="text-xs font-semibold text-green-700 mb-1">How dynamic editing works</p>
// //                   <p className="text-xs text-green-700/80 leading-relaxed">
// //                     The printed QR code always points to <code className="font-mono bg-green-100 px-1 rounded">{API}/qr/{activeQr.qr_key}</code>,
// //                     which redirects to the destination. Change the destination anytime without reprinting.
// //                   </p>
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// import { useState, useEffect, useRef } from "react";
// import axios from "axios";

// const API = "http://localhost:5000";

// function timeAgo(ts) {
//   const diff = Date.now() - new Date(ts).getTime();
//   const m = Math.floor(diff / 60000);
//   if (m < 1)  return "just now";
//   if (m < 60) return `${m}m ago`;
//   const h = Math.floor(m / 60);
//   if (h < 24) return `${h}h ago`;
//   return `${Math.floor(h / 24)}d ago`;
// }

// export default function QRManager() {
//   const [qrList,   setQrList]   = useState([]);
//   const [selected, setSelected] = useState(null); // full record
//   const [editDest, setEditDest] = useState("");
//   const [loading,  setLoading]  = useState(false);
//   const [toast,    setToast]    = useState("");
//   const [error,    setError]    = useState("");
//   const [libReady, setLibReady] = useState(false);
//   const canvasRef = useRef(null);

//   /* ── load QRCode.js ── */
//   useEffect(() => {
//     if (window.QRCode) { setLibReady(true); return; }
//     const s = document.createElement("script");
//     s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
//     s.async = true;
//     s.onload = () => setLibReady(true);
//     document.head.appendChild(s);
//   }, []);

//   /* ── render QR ── */
//   useEffect(() => {
//     if (!selected || !libReady || !canvasRef.current || !window.QRCode) return;
//     canvasRef.current.innerHTML = "";
//     try {
//       new window.QRCode(canvasRef.current, {
//         text:         `${API}/qr/${selected.qr_key}`,
//         width:        200,
//         height:       200,
//         colorDark:    "#000000",
//         colorLight:   "#ffffff",
//         correctLevel: window.QRCode.CorrectLevel.H,
//       });
//     } catch {
//       setError("Failed to render QR.");
//     }
//   }, [selected, libReady]);

//   /* ── fetch list ── */
//   async function fetchAll() {
//     try {
//       const { data } = await axios.get(`${API}/api/qr`);
//       setQrList(data);
//     } catch {
//       showToast("Failed to load list");
//     }
//   }

//   useEffect(() => { fetchAll(); }, []);

//   function showToast(msg) {
//     setToast(msg);
//     setTimeout(() => setToast(""), 2500);
//   }

//   /* ── select a QR ── */
//   function selectQr(entry) {
//     setSelected(entry);
//     setEditDest(entry.destination);
//     setError("");
//   }

//   /* ── update destination ── */
//   async function handleUpdate() {
//     if (!selected) return;
//     const newDest = editDest.trim();
//     if (!newDest) { setError("Destination cannot be empty."); return; }
//     setLoading(true);
//     setError("");
//     try {
//       await axios.put(`${API}/api/qr/${selected.qr_key}`, { destination: newDest });
//       setSelected(prev => ({ ...prev, destination: newDest }));
//       setQrList(prev =>
//         prev.map(q => q.qr_key === selected.qr_key ? { ...q, destination: newDest } : q)
//       );
//       showToast("Updated successfully");
//     } catch {
//       setError("Failed to update.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   /* ── download PNG ── */
//   function downloadPng() {
//     const canvas = canvasRef.current?.querySelector("canvas");
//     if (!canvas) return;
//     const a = document.createElement("a");
//     a.download = `qr-${selected?.qr_key ?? "code"}.png`;
//     a.href = canvas.toDataURL("image/png");
//     a.click();
//   }

//   /* ─────────────────────────────────────── */
//   return (
//     <div style={{ fontFamily: "'IBM Plex Mono', monospace", minHeight: "100vh", background: "#f9f9f9", display: "flex", flexDirection: "column" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
//         * { box-sizing: border-box; margin: 0; padding: 0; }
//         ::-webkit-scrollbar { width: 4px; }
//         ::-webkit-scrollbar-track { background: #f0f0f0; }
//         ::-webkit-scrollbar-thumb { background: #000; border-radius: 2px; }
//         input:focus { outline: 2px solid #000 !important; outline-offset: 0; }
//         .qr-row { cursor: pointer; transition: background 0.12s; }
//         .qr-row:hover { background: #f0f0f0 !important; }
//         .btn-black { background: #000; color: #fff; border: none; cursor: pointer; font-family: inherit; font-weight: 600; transition: background 0.15s; }
//         .btn-black:hover:not(:disabled) { background: #222; }
//         .btn-black:disabled { opacity: 0.45; cursor: not-allowed; }
//         .btn-outline { background: #fff; color: #000; border: 1.5px solid #000; cursor: pointer; font-family: inherit; font-weight: 600; transition: background 0.15s; }
//         .btn-outline:hover { background: #f0f0f0; }
//       `}</style>

//       {/* TOAST */}
//       {toast && (
//         <div style={{
//           position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
//           background: "#000", color: "#fff", fontSize: 12, fontWeight: 600,
//           padding: "10px 20px", borderRadius: 999, zIndex: 100, letterSpacing: "0.04em",
//         }}>
//           {toast}
//         </div>
//       )}

//       {/* HEADER */}
//       <header style={{ background: "#000", color: "#fff", padding: "0 24px", height: 50, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
//         <span style={{ fontSize: 16 }}>▦</span>
//         <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.06em" }}>QR DYNAMIC</span>
//         <span style={{ marginLeft: "auto", fontSize: 10, color: "#888", letterSpacing: "0.08em" }}>
//           {qrList.length} CODE{qrList.length !== 1 ? "S" : ""}
//         </span>
//       </header>

//       {/* BODY */}
//       <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

//         {/* LEFT — list */}
//         <div style={{ width: 280, borderRight: "1.5px solid #e0e0e0", background: "#fff", display: "flex", flexDirection: "column", overflowY: "auto" }}>
//           <div style={{ padding: "12px 16px", borderBottom: "1px solid #e8e8e8", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "#888" }}>
//             ALL QR CODES
//           </div>
//           {qrList.length === 0 && (
//             <p style={{ padding: 20, fontSize: 11, color: "#aaa", textAlign: "center" }}>No QR codes found.</p>
//           )}
//           {qrList.map(entry => (
//             <div
//               key={entry.qr_key}
//               className="qr-row"
//               onClick={() => selectQr(entry)}
//               style={{
//                 padding: "12px 16px",
//                 borderBottom: "1px solid #f0f0f0",
//                 background: selected?.qr_key === entry.qr_key ? "#f5f5f5" : "#fff",
//                 borderLeft: selected?.qr_key === entry.qr_key ? "3px solid #000" : "3px solid transparent",
//               }}
//             >
//               <div style={{ fontSize: 12, fontWeight: 600, color: "#111", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                 {entry.name}
//               </div>
//               <div style={{ fontSize: 10, color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                 {entry.destination}
//               </div>
//               {entry.created_at && (
//                 <div style={{ fontSize: 10, color: "#bbb", marginTop: 4 }}>
//                   {timeAgo(entry.created_at)}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* RIGHT — detail / update */}
//         <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, background: "#f9f9f9", minWidth: 0 }}>
//           {!selected ? (
//             <div style={{ textAlign: "center" }}>
//               <div style={{ width: 72, height: 72, border: "2px dashed #ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px", borderRadius: 8 }}>
//                 ▦
//               </div>
//               <p style={{ fontSize: 12, color: "#aaa", letterSpacing: "0.04em" }}>Select a QR code from the list</p>
//             </div>
//           ) : (
//             <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 20 }}>

//               {/* Name badge */}
//               <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                 <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{selected.name}</span>
//                 <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", background: "#000", color: "#fff", padding: "2px 7px", borderRadius: 999 }}>DYNAMIC</span>
//               </div>

//               {/* QR preview */}
//               <div style={{ background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
//                 <div ref={canvasRef} />
//                 <p style={{ fontSize: 10, color: "#aaa", textAlign: "center", wordBreak: "break-all", fontFamily: "inherit" }}>
//                   {API}/qr/{selected.qr_key}
//                 </p>
//               </div>

//               {/* Update panel */}
//               <div style={{ background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
//                 <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#888" }}>UPDATE DESTINATION</p>
//                 <input
//                   type="text"
//                   value={editDest}
//                   onChange={e => setEditDest(e.target.value)}
//                   onKeyDown={e => e.key === "Enter" && handleUpdate()}
//                   placeholder="https://new-destination.com"
//                   style={{
//                     width: "100%", padding: "9px 12px", fontSize: 11,
//                     border: "1.5px solid #ddd", borderRadius: 6,
//                     fontFamily: "inherit", background: "#fafafa", color: "#111",
//                   }}
//                 />
//                 {error && (
//                   <p style={{ fontSize: 11, color: "#c00", fontWeight: 500 }}>{error}</p>
//                 )}
//                 <button
//                   className="btn-black"
//                   onClick={handleUpdate}
//                   disabled={loading}
//                   style={{ padding: "9px 0", fontSize: 11, borderRadius: 6, letterSpacing: "0.06em", width: "100%" }}
//                 >
//                   {loading ? "UPDATING…" : "↻  UPDATE URL"}
//                 </button>
//               </div>

//               {/* Download */}
//               <button
//                 className="btn-outline"
//                 onClick={downloadPng}
//                 style={{ padding: "9px 0", fontSize: 11, borderRadius: 6, letterSpacing: "0.06em", width: "100%" }}
//               >
//                 ↓  DOWNLOAD PNG
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = "http://192.168.1.4";

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function QRManager() {
  const [qrList,   setQrList]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [editDest, setEditDest] = useState("");
  const [newName,  setNewName]  = useState("");
  const [newDest,  setNewDest]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [toast,    setToast]    = useState("");
  const [error,    setError]    = useState("");
  const [libReady, setLibReady] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.QRCode) { setLibReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    s.async = true;
    s.onload = () => setLibReady(true);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!selected || !libReady || !canvasRef.current || !window.QRCode) return;
    canvasRef.current.innerHTML = "";
    try {
      new window.QRCode(canvasRef.current, {
        text:         `${API}/qr/${selected.qr_key}`,
        width:        200,
        height:       200,
        colorDark:    "#000000",
        colorLight:   "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.H,
      });
    } catch {
      setError("Failed to render QR.");
    }
  }, [selected, libReady]);

  async function fetchAll() {
    try {
      const { data } = await axios.get(`${API}/api/qr`);
      setQrList(data);
    } catch {
      showToast("Failed to load QR codes");
    }
  }

  useEffect(() => { fetchAll(); }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  function selectQr(entry) {
    setSelected(entry);
    setEditDest(entry.destination);
    setError("");
  }

  async function handleCreate() {
    setError("");
    if (!newName.trim()) { setError("Enter a name."); return; }
    if (!newDest.trim()) { setError("Enter a destination URL."); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/api/qr`, {
        name: newName.trim(),
        destination: newDest.trim(),
      });
      showToast("QR created ✓");
      setNewName("");
      setNewDest("");
      await fetchAll();
    } catch {
      setError("Failed to create QR code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!selected) return;
    if (!editDest.trim()) { setError("Destination cannot be empty."); return; }
    setLoading(true);
    try {
      await axios.put(`${API}/api/qr/${selected.qr_key}`, { destination: editDest.trim() });
      const updated = { ...selected, destination: editDest.trim() };
      setSelected(updated);
      setQrList(prev => prev.map(q => q.qr_key === selected.qr_key ? updated : q));
      showToast("URL updated ✓");
      setError("");
    } catch {
      setError("Failed to update.");
    } finally {
      setLoading(false);
    }
  }

  function downloadPng() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `qr-${selected?.qr_key ?? "code"}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {toast && <div style={styles.toast}>{toast}</div>}

      <header style={styles.header}>
        <span style={styles.logo}>▦ QR Dynamic</span>
        <span style={styles.badge}>Dynamic · Editable</span>
      </header>

      <div style={styles.body}>

        {/* LEFT — List + Create */}
        <div style={styles.sidebar}>

          <div style={styles.card}>
            <p style={styles.sectionLabel}>New QR Code</p>
            <input
              style={styles.input}
              placeholder="Name  (e.g. My Portfolio)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <input
              style={{ ...styles.input, fontFamily: "monospace", fontSize: 12 }}
              placeholder="Destination URL"
              value={newDest}
              onChange={e => setNewDest(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button
              style={styles.btnPrimary}
              onClick={handleCreate}
              disabled={loading}
              className="qr-btn"
            >
              {loading ? "Creating…" : "+ Generate QR"}
            </button>
          </div>

          <div style={styles.listWrap}>
            <p style={styles.sectionLabel}>
              All QR Codes {qrList.length > 0 && <span style={styles.count}>{qrList.length}</span>}
            </p>
            {qrList.length === 0 ? (
              <p style={styles.emptyText}>No QR codes yet.</p>
            ) : (
              qrList.map(entry => (
                <div
                  key={entry.qr_key}
                  style={{
                    ...styles.listItem,
                    ...(selected?.qr_key === entry.qr_key ? styles.listItemActive : {}),
                  }}
                  onClick={() => selectQr(entry)}
                  className="qr-list-item"
                >
                  <div style={styles.listIcon}>▦</div>
                  <div style={styles.listInfo}>
                    <p style={styles.listName}>{entry.name}</p>
                    <p style={styles.listDest}>{entry.destination}</p>
                  </div>
                  <span style={styles.listTime}>
                    {entry.created_at ? timeAgo(entry.created_at) : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT — Preview + Update */}
        <div style={styles.preview}>
          {!selected ? (
            <div style={styles.emptyPreview}>
              <div style={styles.emptyIcon}>▦</div>
              <p style={styles.emptyTitle}>Select a QR code</p>
              <p style={styles.emptyHint}>Pick one from the list to view and update its destination URL</p>
            </div>
          ) : (
            <div style={styles.previewInner}>

              <div style={styles.previewHeader}>
                <span style={styles.previewName}>{selected.name}</span>
                <span style={styles.dynBadge}>DYNAMIC</span>
              </div>

              <div style={styles.qrCard}>
                <div ref={canvasRef} style={{ lineHeight: 0 }} />
                <p style={styles.qrUrl}>{API}/qr/{selected.qr_key}</p>
              </div>

              <div style={styles.updateCard}>
                <p style={styles.sectionLabel}>Current Destination</p>
                <p style={styles.currentDest}>{selected.destination}</p>

                <p style={{ ...styles.sectionLabel, marginTop: 16 }}>Update Destination URL</p>
                <input
                  style={{ ...styles.input, fontFamily: "monospace", fontSize: 12 }}
                  value={editDest}
                  onChange={e => setEditDest(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleUpdate()}
                  placeholder="New destination URL"
                />
                {error && <p style={styles.error}>{error}</p>}
                <button
                  style={styles.btnPrimary}
                  onClick={handleUpdate}
                  disabled={loading}
                  className="qr-btn"
                >
                  {loading ? "Updating…" : "↻ Update URL"}
                </button>
              </div>

              <button
                style={styles.btnSecondary}
                onClick={downloadPng}
                className="qr-btn-sec"
              >
                ↓ Download PNG
              </button>

              <div style={styles.infoBox}>
                <p style={styles.infoTitle}>How it works</p>
                <p style={styles.infoText}>
                  The printed QR always points to{" "}
                  <code style={styles.code}>{API}/qr/{selected.qr_key}</code>, which
                  redirects to your destination. Update the URL above anytime — no
                  reprinting needed.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#f5f5f5",
    fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "#000",
    color: "#fff",
    padding: "0 24px",
    height: 52,
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  logo: { fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" },
  badge: {
    fontSize: 11,
    padding: "2px 10px",
    borderRadius: 99,
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#ccc",
    fontWeight: 500,
  },
  body: { flex: 1, display: "flex", overflow: "hidden" },
  sidebar: {
    width: 320,
    flexShrink: 0,
    background: "#fff",
    borderRight: "1px solid #e5e5e5",
    padding: 20,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  card: {
    background: "#fafafa",
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  count: {
    background: "#000",
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    padding: "1px 6px",
    borderRadius: 99,
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    fontSize: 13,
    background: "#fff",
    color: "#111",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  btnPrimary: {
    width: "100%",
    padding: "10px 0",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  btnSecondary: {
    width: "100%",
    padding: "10px 0",
    background: "#fff",
    color: "#000",
    border: "1.5px solid #000",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
    marginTop: 4,
  },
  error: {
    fontSize: 12,
    color: "#cc0000",
    margin: 0,
    padding: "6px 10px",
    background: "#fff0f0",
    borderRadius: 6,
    border: "1px solid #ffd0d0",
  },
  listWrap: { display: "flex", flexDirection: "column", gap: 6 },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e5e5",
    background: "#fff",
    cursor: "pointer",
    transition: "background 0.12s, border-color 0.12s",
  },
  listItemActive: { border: "1.5px solid #000", background: "#f7f7f7" },
  listIcon: {
    width: 34, height: 34, borderRadius: 8,
    background: "#000", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, flexShrink: 0,
  },
  listInfo: { flex: 1, minWidth: 0 },
  listName: {
    fontSize: 13, fontWeight: 600, color: "#111", margin: 0,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  listDest: {
    fontSize: 11, color: "#999", margin: "2px 0 0",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
    fontFamily: "monospace",
  },
  listTime: { fontSize: 11, color: "#bbb", flexShrink: 0 },
  emptyText: { fontSize: 13, color: "#bbb", textAlign: "center", padding: "20px 0" },
  preview: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    background: "#f5f5f5",
    overflowY: "auto",
  },
  emptyPreview: { textAlign: "center", maxWidth: 280 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 16,
    border: "2px dashed #ccc",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 32, color: "#ccc", margin: "0 auto 16px",
  },
  emptyTitle: { fontSize: 16, fontWeight: 600, color: "#555", margin: "0 0 6px" },
  emptyHint: { fontSize: 13, color: "#aaa", lineHeight: 1.5, margin: 0 },
  previewInner: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 16,
    width: "100%", maxWidth: 340,
  },
  previewHeader: { display: "flex", alignItems: "center", gap: 8 },
  previewName: { fontSize: 16, fontWeight: 700, color: "#111" },
  dynBadge: {
    fontSize: 10, fontWeight: 700,
    padding: "2px 8px", borderRadius: 99,
    background: "#000", color: "#fff", letterSpacing: "0.05em",
  },
  qrCard: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    padding: 20,
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 12,
    width: "100%",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  qrUrl: {
    fontSize: 11, color: "#aaa", fontFamily: "monospace",
    textAlign: "center", wordBreak: "break-all", margin: 0,
  },
  updateCard: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 12, padding: 16,
    width: "100%", display: "flex",
    flexDirection: "column", gap: 10,
    boxSizing: "border-box",
  },
  currentDest: {
    fontSize: 12, color: "#555", fontFamily: "monospace",
    background: "#f5f5f5", border: "1px solid #e5e5e5",
    borderRadius: 6, padding: "6px 10px",
    wordBreak: "break-all", margin: 0,
  },
  infoBox: {
    background: "#fff", border: "1px solid #e5e5e5",
    borderRadius: 12, padding: 14,
    width: "100%", boxSizing: "border-box",
  },
  infoTitle: {
    fontSize: 11, fontWeight: 700, color: "#111",
    margin: "0 0 4px",
    textTransform: "uppercase", letterSpacing: "0.06em",
  },
  infoText: { fontSize: 12, color: "#777", lineHeight: 1.6, margin: 0 },
  code: {
    fontFamily: "monospace", background: "#f0f0f0",
    padding: "1px 5px", borderRadius: 4, fontSize: 11,
  },
  toast: {
    position: "fixed", bottom: 24, left: "50%",
    transform: "translateX(-50%)",
    background: "#000", color: "#fff",
    padding: "10px 20px", borderRadius: 99,
    fontSize: 13, fontWeight: 600,
    zIndex: 1000, pointerEvents: "none",
    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
  },
};

const css = `
  .qr-btn:hover:not(:disabled) { opacity: 0.8; }
  .qr-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .qr-btn-sec:hover { background: #f0f0f0 !important; }
  .qr-list-item:hover { background: #fafafa !important; }
  input:focus { border-color: #000 !important; box-shadow: 0 0 0 2px rgba(0,0,0,0.08); }
`;