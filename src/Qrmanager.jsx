
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

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