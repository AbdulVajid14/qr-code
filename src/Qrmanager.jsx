// import { useState, useEffect, useRef } from "react";
// import axios from "axios";

// const API = import.meta.env.VITE_API_URL;

// function timeAgo(ts) {
//   const diff = Date.now() - new Date(ts).getTime();
//   const m = Math.floor(diff / 60000);
//   if (m < 1) return "just now";
//   if (m < 60) return `${m}m ago`;
//   const h = Math.floor(m / 60);
//   if (h < 24) return `${h}h ago`;
//   return `${Math.floor(h / 24)}d ago`;
// }

// export default function QRManager() {
//   const [qrList, setQrList] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [editDest, setEditDest] = useState("");
//   const [newName, setNewName] = useState("");
//   const [newDest, setNewDest] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState("");
//   const [error, setError] = useState("");
//   const [libReady, setLibReady] = useState(false);
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     if (window.QRCode) {
//       setLibReady(true);
//       return;
//     }
//     const s = document.createElement("script");
//     s.src =
//       "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
//     s.async = true;
//     s.onload = () => setLibReady(true);
//     document.head.appendChild(s);
//   }, []);

//   useEffect(() => {
//     if (!selected || !libReady || !canvasRef.current || !window.QRCode) return;
//     canvasRef.current.innerHTML = "";
//     try {
//       new window.QRCode(canvasRef.current, {
//         text: `${API}/qr/${selected.qr_key}`,
//         width: 200,
//         height: 200,
//         colorDark: "#000000",
//         colorLight: "#ffffff",
//         correctLevel: window.QRCode.CorrectLevel.H,
//       });
//     } catch {
//       setError("Failed to render QR.");
//     }
//   }, [selected, libReady]);

//   async function fetchAll() {
//     try {
//       const res = await axios.get(`${API}/api/qr`);

//       console.log(res.data);

//       if (Array.isArray(res.data)) {
//         setQrList(res.data);
//       } else if (Array.isArray(res.data.data)) {
//         setQrList(res.data.data);
//       } else {
//         setQrList([]);
//       }
//     } catch (err) {
//       console.log(err);
//       showToast("Failed to load QR codes");
//       setQrList([]);
//     }
//   }

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   function showToast(msg) {
//     setToast(msg);
//     setTimeout(() => setToast(""), 2400);
//   }

//   function selectQr(entry) {
//     setSelected(entry);
//     setEditDest(entry.destination);
//     setError("");
//   }

//   async function handleCreate() {
//     setError("");
//     if (!newName.trim()) {
//       setError("Enter a name.");
//       return;
//     }
//     if (!newDest.trim()) {
//       setError("Enter a destination URL.");
//       return;
//     }
//     setLoading(true);
//     try {
//       await axios.post(`${API}/api/qr`, {
//         name: newName.trim(),
//         destination: newDest.trim(),
//       });
//       showToast("QR created ✓");
//       setNewName("");
//       setNewDest("");
//       await fetchAll();
//     } catch {
//       setError("Failed to create QR code.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleUpdate() {
//     if (!selected) return;
//     if (!editDest.trim()) {
//       setError("Destination cannot be empty.");
//       return;
//     }
//     setLoading(true);
//     try {
//       await axios.put(`${API}/api/qr/${selected.qr_key}`, {
//         destination: editDest.trim(),
//       });
//       const updated = { ...selected, destination: editDest.trim() };
//       setSelected(updated);
//       setQrList((prev) =>
//         prev.map((q) => (q.qr_key === selected.qr_key ? updated : q)),
//       );
//       showToast("URL updated ✓");
//       setError("");
//     } catch {
//       setError("Failed to update.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function downloadPng() {
//     const canvas = canvasRef.current?.querySelector("canvas");
//     if (!canvas) return;
//     const a = document.createElement("a");
//     a.download = `qr-${selected?.qr_key ?? "code"}.png`;
//     a.href = canvas.toDataURL("image/png");
//     a.click();
//   }

//   return (
//     <div style={styles.root}>
//       <style>{css}</style>

//       {toast && <div style={styles.toast}>{toast}</div>}

//       {/* ✅ CHANGED: Product name updated to "Ektova Link" */}
//       <header style={styles.header}>
//         <span style={styles.logo}>▦ Ektova QR Generator</span>
//       </header>

//       <div style={styles.body}>
//         {/* LEFT — List + Create */}
//         <div style={styles.sidebar}>
//           <div style={styles.card}>
//             <p style={styles.sectionLabel}>New QR Code</p>
//             <input
//               style={styles.input}
//               placeholder="Name  (e.g. My Portfolio)"
//               value={newName}
//               onChange={(e) => setNewName(e.target.value)}
//             />
//             <input
//               style={{ ...styles.input, fontFamily: "monospace", fontSize: 12 }}
//               placeholder="Destination URL"
//               value={newDest}
//               onChange={(e) => setNewDest(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleCreate()}
//             />
//             {error && <p style={styles.error}>{error}</p>}
//             <button
//               style={styles.btnPrimary}
//               onClick={handleCreate}
//               disabled={loading}
//               className="qr-btn"
//             >
//               {loading ? "Creating…" : "+ Generate QR"}
//             </button>
//           </div>

//           <div style={styles.listWrap}>
//             <p style={styles.sectionLabel}>
//               All QR Codes{" "}
//               {qrList.length > 0 && (
//                 <span style={styles.count}>{qrList.length}</span>
//               )}
//             </p>
//             {qrList.length === 0 ? (
//               <p style={styles.emptyText}>No QR codes yet.</p>
//             ) : (
//               Array.isArray(qrList) &&
//               qrList.map((entry) => (
//                 <div
//                   key={entry.qr_key}
//                   style={{
//                     ...styles.listItem,
//                     ...(selected?.qr_key === entry.qr_key
//                       ? styles.listItemActive
//                       : {}),
//                   }}
//                   onClick={() => selectQr(entry)}
//                   className="qr-list-item"
//                 >
//                   <div style={styles.listIcon}>▦</div>
//                   <div style={styles.listInfo}>
//                     <p style={styles.listName}>{entry.name}</p>
//                     <p style={styles.listDest}>{entry.destination}</p>
//                   </div>
//                   <span style={styles.listTime}>
//                     {entry.created_at ? timeAgo(entry.created_at) : ""}
//                   </span>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* RIGHT — Preview + Update */}
//         <div style={styles.preview}>
//           {!selected ? (
//             <div style={styles.emptyPreview}>
//               <div style={styles.emptyIcon}>▦</div>
//               <p style={styles.emptyTitle}>Select a QR code</p>
//               <p style={styles.emptyHint}>
//                 Pick one from the list to view and update its destination URL
//               </p>
//             </div>
//           ) : (
//             <div style={styles.previewInner}>
//               <div style={styles.previewHeader}>
//                 <span style={styles.previewName}>{selected.name}</span>
//               </div>

//               <div style={styles.qrCard}>
//                 <div ref={canvasRef} style={{ lineHeight: 0 }} />
//                 <p style={styles.qrUrl}>
//                   {API}/qr/{selected.qr_key}
//                 </p>
//               </div>

//               <div style={styles.updateCard}>
//                 <p style={styles.sectionLabel}>Current Destination</p>
//                 <p style={styles.currentDest}>{selected.destination}</p>

//                 <p style={{ ...styles.sectionLabel, marginTop: 16 }}>
//                   Update Destination URL
//                 </p>
//                 <input
//                   style={{
//                     ...styles.input,
//                     fontFamily: "monospace",
//                     fontSize: 12,
//                   }}
//                   value={editDest}
//                   onChange={(e) => setEditDest(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
//                   placeholder="New destination URL"
//                 />
//                 {error && <p style={styles.error}>{error}</p>}
//                 <button
//                   style={styles.btnPrimary}
//                   onClick={handleUpdate}
//                   disabled={loading}
//                   className="qr-btn"
//                 >
//                   {loading ? "Updating…" : "↻ Update URL"}
//                 </button>
//               </div>

//               <button
//                 style={styles.btnSecondary}
//                 onClick={downloadPng}
//                 className="qr-btn-sec"
//               >
//                 ↓ Download PNG
//               </button>

//               <div style={styles.infoBox}>
//                 {/* ✅ CHANGED: Info box references "Ektova Link" instead of generic branding */}
//                 <p style={styles.infoTitle}>How Ektova Link works</p>
//                 <p style={styles.infoText}>
//                   The printed QR always points to{" "}
//                   <code style={styles.code}>
//                     {API}/qr/{selected.qr_key}
//                   </code>
//                   , which redirects to your destination. Update the URL above
//                   anytime — no reprinting needed.
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   root: {
//     minHeight: "100vh",
//     background: "#f5f5f5",
//     fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
//     display: "flex",
//     flexDirection: "column",
//   },
//   header: {
//     background: "#000",
//     color: "#fff",
//     padding: "0 24px",
//     height: 52,
//     display: "flex",
//     alignItems: "center",
//     gap: 12,
//     flexShrink: 0,
//   },
//   logo: { fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" },
//   badge: {
//     fontSize: 11,
//     padding: "2px 10px",
//     borderRadius: 99,
//     background: "rgba(255,255,255,0.1)",
//     border: "1px solid rgba(255,255,255,0.2)",
//     color: "#ccc",
//     fontWeight: 500,
//   },
//   body: { flex: 1, display: "flex", overflow: "hidden" },
//   sidebar: {
//     width: 320,
//     flexShrink: 0,
//     background: "#fff",
//     borderRight: "1px solid #e5e5e5",
//     padding: 20,
//     overflowY: "auto",
//     display: "flex",
//     flexDirection: "column",
//     gap: 20,
//   },
//   card: {
//     background: "#fafafa",
//     border: "1px solid #e5e5e5",
//     borderRadius: 12,
//     padding: 16,
//     display: "flex",
//     flexDirection: "column",
//     gap: 10,
//   },
//   sectionLabel: {
//     fontSize: 11,
//     fontWeight: 700,
//     color: "#888",
//     textTransform: "uppercase",
//     letterSpacing: "0.08em",
//     margin: 0,
//     display: "flex",
//     alignItems: "center",
//     gap: 6,
//   },
//   count: {
//     background: "#000",
//     color: "#fff",
//     fontSize: 10,
//     fontWeight: 700,
//     padding: "1px 6px",
//     borderRadius: 99,
//   },
//   input: {
//     width: "100%",
//     padding: "9px 12px",
//     border: "1px solid #e0e0e0",
//     borderRadius: 8,
//     fontSize: 13,
//     background: "#fff",
//     color: "#111",
//     outline: "none",
//     boxSizing: "border-box",
//     transition: "border-color 0.15s",
//   },
//   btnPrimary: {
//     width: "100%",
//     padding: "10px 0",
//     background: "#000",
//     color: "#fff",
//     border: "none",
//     borderRadius: 8,
//     fontSize: 13,
//     fontWeight: 600,
//     cursor: "pointer",
//     transition: "opacity 0.15s",
//   },
//   btnSecondary: {
//     width: "100%",
//     padding: "10px 0",
//     background: "#fff",
//     color: "#000",
//     border: "1.5px solid #000",
//     borderRadius: 8,
//     fontSize: 13,
//     fontWeight: 600,
//     cursor: "pointer",
//     transition: "background 0.15s",
//     marginTop: 4,
//   },
//   error: {
//     fontSize: 12,
//     color: "#cc0000",
//     margin: 0,
//     padding: "6px 10px",
//     background: "#fff0f0",
//     borderRadius: 6,
//     border: "1px solid #ffd0d0",
//   },
//   listWrap: { display: "flex", flexDirection: "column", gap: 6 },
//   listItem: {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     padding: "10px 12px",
//     borderRadius: 10,
//     border: "1px solid #e5e5e5",
//     background: "#fff",
//     cursor: "pointer",
//     transition: "background 0.12s, border-color 0.12s",
//   },
//   listItemActive: { border: "1.5px solid #000", background: "#f7f7f7" },
//   listIcon: {
//     width: 34,
//     height: 34,
//     borderRadius: 8,
//     background: "#000",
//     color: "#fff",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: 14,
//     flexShrink: 0,
//   },
//   listInfo: { flex: 1, minWidth: 0 },
//   listName: {
//     fontSize: 13,
//     fontWeight: 600,
//     color: "#111",
//     margin: 0,
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//   },
//   listDest: {
//     fontSize: 11,
//     color: "#999",
//     margin: "2px 0 0",
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//     fontFamily: "monospace",
//   },
//   listTime: { fontSize: 11, color: "#bbb", flexShrink: 0 },
//   emptyText: {
//     fontSize: 13,
//     color: "#bbb",
//     textAlign: "center",
//     padding: "20px 0",
//   },
//   preview: {
//     flex: 1,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 32,
//     background: "#f5f5f5",
//     overflowY: "auto",
//   },
//   emptyPreview: { textAlign: "center", maxWidth: 280 },
//   emptyIcon: {
//     width: 80,
//     height: 80,
//     borderRadius: 16,
//     border: "2px dashed #ccc",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: 32,
//     color: "#ccc",
//     margin: "0 auto 16px",
//   },
//   emptyTitle: {
//     fontSize: 16,
//     fontWeight: 600,
//     color: "#555",
//     margin: "0 0 6px",
//   },
//   emptyHint: { fontSize: 13, color: "#aaa", lineHeight: 1.5, margin: 0 },
//   previewInner: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     gap: 16,
//     width: "100%",
//     maxWidth: 340,
//   },
//   previewHeader: { display: "flex", alignItems: "center", gap: 8 },
//   previewName: { fontSize: 16, fontWeight: 700, color: "#111" },
//   dynBadge: {
//     fontSize: 10,
//     fontWeight: 700,
//     padding: "2px 8px",
//     borderRadius: 99,
//     background: "#000",
//     color: "#fff",
//     letterSpacing: "0.05em",
//   },
//   qrCard: {
//     background: "#fff",
//     border: "1px solid #e5e5e5",
//     borderRadius: 16,
//     padding: 20,
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     gap: 12,
//     width: "100%",
//     boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
//   },
//   qrUrl: {
//     fontSize: 11,
//     color: "#aaa",
//     fontFamily: "monospace",
//     textAlign: "center",
//     wordBreak: "break-all",
//     margin: 0,
//   },
//   updateCard: {
//     background: "#fff",
//     border: "1px solid #e5e5e5",
//     borderRadius: 12,
//     padding: 16,
//     width: "100%",
//     display: "flex",
//     flexDirection: "column",
//     gap: 10,
//     boxSizing: "border-box",
//   },
//   currentDest: {
//     fontSize: 12,
//     color: "#555",
//     fontFamily: "monospace",
//     background: "#f5f5f5",
//     border: "1px solid #e5e5e5",
//     borderRadius: 6,
//     padding: "6px 10px",
//     wordBreak: "break-all",
//     margin: 0,
//   },
//   infoBox: {
//     background: "#fff",
//     border: "1px solid #e5e5e5",
//     borderRadius: 12,
//     padding: 14,
//     width: "100%",
//     boxSizing: "border-box",
//   },
//   infoTitle: {
//     fontSize: 11,
//     fontWeight: 700,
//     color: "#111",
//     margin: "0 0 4px",
//     textTransform: "uppercase",
//     letterSpacing: "0.06em",
//   },
//   infoText: { fontSize: 12, color: "#777", lineHeight: 1.6, margin: 0 },
//   code: {
//     fontFamily: "monospace",
//     background: "#f0f0f0",
//     padding: "1px 5px",
//     borderRadius: 4,
//     fontSize: 11,
//   },
//   toast: {
//     position: "fixed",
//     bottom: 24,
//     left: "50%",
//     transform: "translateX(-50%)",
//     background: "#000",
//     color: "#fff",
//     padding: "10px 20px",
//     borderRadius: 99,
//     fontSize: 13,
//     fontWeight: 600,
//     zIndex: 1000,
//     pointerEvents: "none",
//     boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
//   },
// };

// const css = `
//   .qr-btn:hover:not(:disabled) { opacity: 0.8; }
//   .qr-btn:disabled { opacity: 0.45; cursor: not-allowed; }
//   .qr-btn-sec:hover { background: #f0f0f0 !important; }
//   .qr-list-item:hover { background: #fafafa !important; }
//   input:focus { border-color: #000 !important; box-shadow: 0 0 0 2px rgba(0,0,0,0.08); }
// `;
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ─── Types config ─────────────────────────────────────────────────────────────
const QR_TYPES = [
  { id: "website", label: "Website", icon: "🌐" },
  { id: "contact", label: "Contact Card", icon: "👤" },
  { id: "email",   label: "Email",   icon: "✉️" },
  { id: "maps",    label: "Maps",    icon: "📍" },
];

const BLOOD_GROUPS = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function typeIcon(type) {
  return QR_TYPES.find((t) => t.id === type)?.icon ?? "▦";
}
function typeLabel(type) {
  return QR_TYPES.find((t) => t.id === type)?.label ?? type;
}

// ─── Default form states ──────────────────────────────────────────────────────
const defaultWebsite = { destination: "" };
const defaultEmail   = { email_to: "", email_subject: "", email_body: "" };
const defaultMaps    = { maps_link: "", maps_label: "" };
const defaultContact = {
  first_name: "", last_name: "", phone_personal: "", phone_work: "",
  email: "", website: "", location: "", maps_link: "",
  blood_group: "", organization: "", job_title: "", birthday: "", notes: "",
};

// ─── Field helpers ────────────────────────────────────────────────────────────
function Input({ label, value, onChange, placeholder, type = "text", mono = false, textarea = false }) {
  const common = {
    style: { ...styles.input, ...(mono ? { fontFamily: "monospace", fontSize: 12 } : {}) },
    value,
    onChange,
    placeholder,
    type,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={styles.fieldLabel}>{label}</label>}
      {textarea
        ? <textarea {...common} rows={3} style={{ ...common.style, resize: "vertical", lineHeight: 1.5 }} />
        : <input {...common} className="qr-input" />}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={styles.fieldLabel}>{label}</label>}
      <select style={styles.input} value={value} onChange={onChange} className="qr-input">
        <option value="">— select —</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Type-specific forms ──────────────────────────────────────────────────────
function WebsiteForm({ data, onChange }) {
  return (
    <Input label="Destination URL" value={data.destination} mono
      placeholder="https://example.com"
      onChange={e => onChange({ ...data, destination: e.target.value })} />
  );
}

function EmailForm({ data, onChange }) {
  return (
    <>
      <Input label="To (email address)" value={data.email_to}
        placeholder="someone@example.com" type="email"
        onChange={e => onChange({ ...data, email_to: e.target.value })} />
      <Input label="Subject" value={data.email_subject}
        placeholder="Hello!"
        onChange={e => onChange({ ...data, email_subject: e.target.value })} />
      <Input label="Body (optional)" value={data.email_body}
        placeholder="Pre-filled message body…" textarea
        onChange={e => onChange({ ...data, email_body: e.target.value })} />
    </>
  );
}

function MapsForm({ data, onChange }) {
  return (
    <>
      <Input label="Google Maps Link" value={data.maps_link} mono
        placeholder="https://maps.google.com/?q=..."
        onChange={e => onChange({ ...data, maps_link: e.target.value })} />
      <Input label="Location Label (optional)" value={data.maps_label}
        placeholder="e.g. Our Office"
        onChange={e => onChange({ ...data, maps_label: e.target.value })} />
    </>
  );
}

function ContactForm({ data, onChange }) {
  const f = (field) => (e) => onChange({ ...data, [field]: e.target.value });
  return (
    <>
      <div style={styles.row2}>
        <Input label="First Name *" value={data.first_name} placeholder="John" onChange={f("first_name")} />
        <Input label="Last Name" value={data.last_name} placeholder="Doe" onChange={f("last_name")} />
      </div>
      <div style={styles.row2}>
        <Input label="Organization" value={data.organization} placeholder="Acme Corp" onChange={f("organization")} />
        <Input label="Job Title" value={data.job_title} placeholder="Manager" onChange={f("job_title")} />
      </div>

      <p style={styles.groupHeading}>📞 Phone Numbers</p>
      <div style={styles.row2}>
        <Input label="Personal Mobile" value={data.phone_personal} placeholder="+91 98765 43210" type="tel" onChange={f("phone_personal")} />
        <Input label="Work / Office" value={data.phone_work} placeholder="+91 98765 00000" type="tel" onChange={f("phone_work")} />
      </div>

      <p style={styles.groupHeading}>📧 Online</p>
      <Input label="Email Address" value={data.email} placeholder="john@example.com" type="email" onChange={f("email")} />
      <Input label="Website" value={data.website} mono placeholder="https://johndoe.com" onChange={f("website")} />

      <p style={styles.groupHeading}>📍 Location</p>
      <Input label="Full Address" value={data.location} placeholder="123 Street, City, State, PIN" onChange={f("location")} />
      <Input label="Google Maps Link" value={data.maps_link} mono placeholder="https://maps.google.com/?q=..." onChange={f("maps_link")} />

      <p style={styles.groupHeading}>🩸 Personal Info</p>
      <div style={styles.row2}>
        <Select label="Blood Group" value={data.blood_group} options={BLOOD_GROUPS} onChange={f("blood_group")} />
        <Input label="Birthday" value={data.birthday} type="date" onChange={f("birthday")} />
      </div>
      <Input label="Notes" value={data.notes} placeholder="Any additional info…" textarea onChange={f("notes")} />
    </>
  );
}

// ─── Edit panel (right side) ──────────────────────────────────────────────────
function EditPanel({ selected, onUpdate, loading, error }) {
  const [formType, setFormType]     = useState(selected.type || "website");
  const [website, setWebsite]       = useState({ destination: selected.destination || "" });
  const [email, setEmail]           = useState({
    email_to: selected.email_to || "",
    email_subject: selected.email_subject || "",
    email_body: selected.email_body || "",
  });
  const [maps, setMaps]             = useState({
    maps_link: selected.maps_link || "",
    maps_label: selected.maps_label || "",
  });
  const [contact, setContact]       = useState({
    first_name: selected.contact?.first_name || "",
    last_name:  selected.contact?.last_name  || "",
    phone_personal: selected.contact?.phone_personal || "",
    phone_work:     selected.contact?.phone_work     || "",
    email:          selected.contact?.email          || "",
    website:        selected.contact?.website        || "",
    location:       selected.contact?.location       || "",
    maps_link:      selected.contact?.maps_link      || "",
    blood_group:    selected.contact?.blood_group    || "",
    organization:   selected.contact?.organization   || "",
    job_title:      selected.contact?.job_title      || "",
    birthday:       selected.contact?.birthday       || "",
    notes:          selected.contact?.notes          || "",
  });

  function buildPayload() {
    switch (formType) {
      case "website": return { type: "website", ...website };
      case "email":   return { type: "email",   ...email };
      case "maps":    return { type: "maps",     ...maps };
      case "contact": return { type: "contact",  contact };
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={styles.sectionLabel}>Update QR Type & Data</p>

      {/* Type switcher */}
      <div style={styles.typeTabs}>
        {QR_TYPES.map((t) => (
          <button key={t.id}
            style={{ ...styles.typeTab, ...(formType === t.id ? styles.typeTabActive : {}) }}
            onClick={() => setFormType(t.id)}
            className="qr-type-tab"
          >
            <span>{t.icon}</span>
            <span style={{ fontSize: 11 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Dynamic form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {formType === "website" && <WebsiteForm data={website} onChange={setWebsite} />}
        {formType === "email"   && <EmailForm   data={email}   onChange={setEmail}   />}
        {formType === "maps"    && <MapsForm    data={maps}    onChange={setMaps}    />}
        {formType === "contact" && <ContactForm data={contact} onChange={setContact} />}
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button style={styles.btnPrimary} onClick={() => onUpdate(buildPayload())} disabled={loading} className="qr-btn">
        {loading ? "Updating…" : "↻ Update QR Code"}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function QRManager() {
  const [qrList, setQrList]     = useState([]);
  const [selected, setSelected] = useState(null);
  const [newName, setNewName]   = useState("");
  const [newType, setNewType]   = useState("website");
  const [newWebsite, setNewWebsite] = useState({ ...defaultWebsite });
  const [newEmail, setNewEmail]     = useState({ ...defaultEmail });
  const [newMaps, setNewMaps]       = useState({ ...defaultMaps });
  const [newContact, setNewContact] = useState({ ...defaultContact });
  const [loading, setLoading]   = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [toast, setToast]       = useState("");
  const [createError, setCreateError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [libReady, setLibReady] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const canvasRef = useRef(null);

  // Load QRCode.js
  useEffect(() => {
    if (window.QRCode) { setLibReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    s.async = true;
    s.onload = () => setLibReady(true);
    document.head.appendChild(s);
  }, []);

  // Render QR canvas
  useEffect(() => {
    if (!selected || !libReady || !canvasRef.current || !window.QRCode) return;
    canvasRef.current.innerHTML = "";
    try {
      new window.QRCode(canvasRef.current, {
        text: `${API}/qr/${selected.qr_key}`,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.H,
      });
    } catch { /* silent */ }
  }, [selected, libReady]);

  async function fetchAll() {
    try {
      const res = await axios.get(`${API}/api/qr`);
      const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      setQrList(data);
    } catch {
      showToast("Failed to load QR codes");
      setQrList([]);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  function buildCreatePayload() {
    switch (newType) {
      case "website": return { name: newName.trim(), type: "website", ...newWebsite };
      case "email":   return { name: newName.trim(), type: "email",   ...newEmail   };
      case "maps":    return { name: newName.trim(), type: "maps",    ...newMaps    };
      case "contact": return { name: newName.trim(), type: "contact", contact: newContact };
    }
  }

  async function handleCreate() {
    setCreateError("");
    if (!newName.trim()) { setCreateError("Enter a name."); return; }
    if (newType === "website" && !newWebsite.destination.trim()) { setCreateError("Enter a destination URL."); return; }
    if (newType === "email"   && !newEmail.email_to.trim())      { setCreateError("Enter an email address."); return; }
    if (newType === "maps"    && !newMaps.maps_link.trim())      { setCreateError("Enter a Maps link."); return; }
    if (newType === "contact" && !newContact.first_name.trim())  { setCreateError("Enter a first name."); return; }

    setLoading(true);
    try {
      await axios.post(`${API}/api/qr`, buildCreatePayload());
      showToast("QR created ✓");
      setNewName(""); setNewWebsite({ ...defaultWebsite }); setNewEmail({ ...defaultEmail });
      setNewMaps({ ...defaultMaps }); setNewContact({ ...defaultContact });
      setShowCreate(false);
      await fetchAll();
    } catch {
      setCreateError("Failed to create QR code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(payload) {
    if (!selected) return;
    setUpdateLoading(true);
    setUpdateError("");
    try {
      await axios.put(`${API}/api/qr/${selected.qr_key}`, payload);
      await fetchAll();
      showToast("QR updated ✓");
      // refresh selected
      setSelected((prev) => ({ ...prev, ...payload }));
    } catch {
      setUpdateError("Failed to update.");
    } finally {
      setUpdateLoading(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    if (!confirm(`Delete "${selected.name}"?`)) return;
    try {
      await axios.delete(`${API}/api/qr/${selected.qr_key}`);
      setSelected(null);
      showToast("QR deleted");
      await fetchAll();
    } catch {
      showToast("Failed to delete.");
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

  // ─── Sidebar new-QR form ────────────────────────────────────────────────────
  function renderCreateForm() {
    return (
      <div style={styles.card}>
        <p style={styles.sectionLabel}>New QR Code</p>

        <Input label="Name" value={newName} placeholder="e.g. My Portfolio"
          onChange={e => setNewName(e.target.value)} />

        {/* Type selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={styles.fieldLabel}>Type</label>
          <div style={styles.typeTabs}>
            {QR_TYPES.map((t) => (
              <button key={t.id}
                style={{ ...styles.typeTab, ...(newType === t.id ? styles.typeTabActive : {}) }}
                onClick={() => setNewType(t.id)}
                className="qr-type-tab"
              >
                <span>{t.icon}</span>
                <span style={{ fontSize: 10 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {newType === "website" && <WebsiteForm data={newWebsite} onChange={setNewWebsite} />}
          {newType === "email"   && <EmailForm   data={newEmail}   onChange={setNewEmail}   />}
          {newType === "maps"    && <MapsForm    data={newMaps}    onChange={setNewMaps}    />}
          {newType === "contact" && <ContactForm data={newContact} onChange={setNewContact} />}
        </div>

        {createError && <p style={styles.error}>{createError}</p>}

        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...styles.btnSecondary, flex: 1 }}
            onClick={() => setShowCreate(false)} className="qr-btn-sec">
            Cancel
          </button>
          <button style={{ ...styles.btnPrimary, flex: 2 }}
            onClick={handleCreate} disabled={loading} className="qr-btn">
            {loading ? "Creating…" : "+ Generate QR"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Right panel: preview + edit ───────────────────────────────────────────
  function renderPreview() {
    if (!selected) {
      return (
        <div style={styles.emptyPreview}>
          <div style={styles.emptyIcon}>▦</div>
          <p style={styles.emptyTitle}>Select a QR code</p>
          <p style={styles.emptyHint}>Pick one from the list to preview and update it</p>
        </div>
      );
    }

    return (
      <div style={styles.previewInner}>
        {/* Header */}
        <div style={styles.previewHeader}>
          <span style={styles.previewName}>{selected.name}</span>
          <span style={styles.typePill}>{typeIcon(selected.type)} {typeLabel(selected.type)}</span>
        </div>

        {/* QR card */}
        <div style={styles.qrCard}>
          <div ref={canvasRef} style={{ lineHeight: 0 }} />
          <p style={styles.qrUrl}>{API}/qr/{selected.qr_key}</p>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          <button style={{ ...styles.btnSecondary, flex: 1 }} onClick={downloadPng} className="qr-btn-sec">
            ↓ Download PNG
          </button>
          <button style={{ ...styles.btnDanger, flex: 1 }} onClick={handleDelete} className="qr-btn-danger">
            🗑 Delete
          </button>
        </div>

        {/* Edit form */}
        <div style={{ ...styles.updateCard, width: "100%", boxSizing: "border-box" }}>
          <EditPanel
            key={selected.qr_key}
            selected={selected}
            onUpdate={handleUpdate}
            loading={updateLoading}
            error={updateError}
          />
        </div>

        {/* Info box */}
        <div style={styles.infoBox}>
          <p style={styles.infoTitle}>How Ektova QR works</p>
          <p style={styles.infoText}>
            The printed QR always points to{" "}
            <code style={styles.code}>{API}/qr/{selected.qr_key}</code>,
            which redirects to your destination. Update the data above anytime — no reprinting needed.
          </p>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={styles.root}>
      <style>{css}</style>

      {toast && <div style={styles.toast}>{toast}</div>}

      <header style={styles.header}>
        <span style={styles.logo}>▦ Ektova QR Generator</span>
      </header>

      <div style={styles.body}>
        {/* LEFT sidebar */}
        <div style={styles.sidebar}>
          {showCreate ? (
            renderCreateForm()
          ) : (
            <button style={styles.btnPrimary} onClick={() => setShowCreate(true)} className="qr-btn">
              + New QR Code
            </button>
          )}

          <div style={styles.listWrap}>
            <p style={styles.sectionLabel}>
              All QR Codes{" "}
              {qrList.length > 0 && <span style={styles.count}>{qrList.length}</span>}
            </p>
            {qrList.length === 0 ? (
              <p style={styles.emptyText}>No QR codes yet.</p>
            ) : (
              qrList.map((entry) => (
                <div
                  key={entry.qr_key}
                  style={{
                    ...styles.listItem,
                    ...(selected?.qr_key === entry.qr_key ? styles.listItemActive : {}),
                  }}
                  onClick={() => { setSelected(entry); setUpdateError(""); }}
                  className="qr-list-item"
                >
                  <div style={styles.listIcon}>{typeIcon(entry.type)}</div>
                  <div style={styles.listInfo}>
                    <p style={styles.listName}>{entry.name}</p>
                    <p style={styles.listDest}>{typeLabel(entry.type)}</p>
                  </div>
                  <span style={styles.listTime}>
                    {entry.createdAt ? timeAgo(entry.createdAt) : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT preview */}
        <div style={styles.preview}>
          {renderPreview()}
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  body: { flex: 1, display: "flex", overflow: "hidden" },
  sidebar: {
    width: 340,
    flexShrink: 0,
    background: "#fff",
    borderRight: "1px solid #e5e5e5",
    padding: 16,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  card: {
    background: "#fafafa",
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 14,
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
  fieldLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#555",
    letterSpacing: "0.02em",
  },
  groupHeading: {
    fontSize: 11,
    fontWeight: 700,
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: "4px 0 -2px",
    paddingTop: 6,
    borderTop: "1px solid #eee",
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
    appearance: "auto",
  },
  typeTabs: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 6,
  },
  typeTab: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    padding: "8px 4px",
    border: "1.5px solid #e5e5e5",
    borderRadius: 8,
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.15s",
    fontSize: 16,
    color: "#555",
  },
  typeTabActive: {
    border: "1.5px solid #000",
    background: "#f0f0f0",
    color: "#000",
    fontWeight: 700,
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
  },
  btnDanger: {
    width: "100%",
    padding: "10px 0",
    background: "#fff",
    color: "#cc0000",
    border: "1.5px solid #cc0000",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
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
    width: 34,
    height: 34,
    borderRadius: 8,
    background: "#000",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    flexShrink: 0,
  },
  listInfo: { flex: 1, minWidth: 0 },
  listName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#111",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  listDest: {
    fontSize: 11,
    color: "#999",
    margin: "2px 0 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  listTime: { fontSize: 11, color: "#bbb", flexShrink: 0 },
  emptyText: {
    fontSize: 13,
    color: "#bbb",
    textAlign: "center",
    padding: "20px 0",
  },
  preview: {
    flex: 1,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "32px 32px 64px",
    background: "#f5f5f5",
    overflowY: "auto",
  },
  emptyPreview: { textAlign: "center", maxWidth: 280, marginTop: 120 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    border: "2px dashed #ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
    color: "#ccc",
    margin: "0 auto 16px",
  },
  emptyTitle: { fontSize: 16, fontWeight: 600, color: "#555", margin: "0 0 6px" },
  emptyHint: { fontSize: 13, color: "#aaa", lineHeight: 1.5, margin: 0 },
  previewInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    width: "100%",
    maxWidth: 400,
  },
  previewHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  previewName: { fontSize: 16, fontWeight: 700, color: "#111" },
  typePill: {
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 99,
    background: "#000",
    color: "#fff",
    letterSpacing: "0.04em",
  },
  qrCard: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    width: "100%",
    boxSizing: "border-box",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  qrUrl: {
    fontSize: 11,
    color: "#aaa",
    fontFamily: "monospace",
    textAlign: "center",
    wordBreak: "break-all",
    margin: 0,
  },
  updateCard: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  infoBox: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 14,
    width: "100%",
    boxSizing: "border-box",
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#111",
    margin: "0 0 4px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  infoText: { fontSize: 12, color: "#777", lineHeight: 1.6, margin: 0 },
  code: {
    fontFamily: "monospace",
    background: "#f0f0f0",
    padding: "1px 5px",
    borderRadius: 4,
    fontSize: 11,
  },
  toast: {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#000",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 99,
    fontSize: 13,
    fontWeight: 600,
    zIndex: 1000,
    pointerEvents: "none",
    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
  },
};

const css = `
  .qr-btn:hover:not(:disabled) { opacity: 0.8; }
  .qr-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .qr-btn-sec:hover { background: #f0f0f0 !important; }
  .qr-btn-danger:hover { background: #fff0f0 !important; }
  .qr-list-item:hover { background: #fafafa !important; }
  .qr-type-tab:hover:not([style*="border: 1.5px solid #000"]) { background: #f8f8f8 !important; }
  .qr-input:focus { border-color: #000 !important; box-shadow: 0 0 0 2px rgba(0,0,0,0.08); }
  textarea.qr-input { font-family: inherit; }
`;