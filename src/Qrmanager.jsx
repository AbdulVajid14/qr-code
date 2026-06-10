import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const GOOGLE_CLIENT_ID =
  "1096395453159-rebbv6i2q2dlalpanldpm5d8cj8gl9g4.apps.googleusercontent.com";

// ─── Types config ─────────────────────────────────────────────────────────────
const QR_TYPES = [
  { id: "website", label: "Website", icon: "🌐" },
  { id: "contact", label: "Contact Card", icon: "👤" },
  { id: "email", label: "Email", icon: "✉️" },
  { id: "maps", label: "Maps", icon: "📍" },
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

const defaultWebsite = { destination: "" };
const defaultEmail = { email_to: "", email_subject: "", email_body: "" };
const defaultMaps = { maps_link: "", maps_label: "" };
const defaultContact = {
  first_name: "",
  last_name: "",
  phone_personal: "",
  phone_work: "",
  email: "",
  website: "",
  location: "",
  maps_link: "",
  blood_group: "",
  organization: "",
  job_title: "",
  birthday: "",
  notes: "",
};

// ─── Auth helper ──────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("qr_token");
}
function setToken(t) {
  localStorage.setItem("qr_token", t);
}
function clearToken() {
  localStorage.removeItem("qr_token");
}

function authAxios() {
  const token = getToken();
  return axios.create({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// ─── Field helpers ────────────────────────────────────────────────────────────
function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mono = false,
  textarea = false,
}) {
  const baseClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white text-gray-900 outline-none transition-all focus:border-black focus:ring-2 focus:ring-black/8 box-border";
  const monoClass = mono ? "font-mono text-[12px]" : "";
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[11px] font-semibold text-gray-500 tracking-wide">
          {label}
        </label>
      )}
      {textarea ? (
        <textarea
          className={`${baseClass} ${monoClass} resize-y leading-relaxed`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <input
          className={`${baseClass} ${monoClass}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
        />
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[11px] font-semibold text-gray-500 tracking-wide">
          {label}
        </label>
      )}
      <select
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white text-gray-900 outline-none transition-all focus:border-black focus:ring-2 focus:ring-black/8 box-border appearance-auto"
        value={value}
        onChange={onChange}
      >
        <option value="">— select —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function WebsiteForm({ data, onChange }) {
  return (
    <Input
      label="Destination URL"
      value={data.destination}
      mono
      placeholder="https://example.com"
      onChange={(e) => onChange({ ...data, destination: e.target.value })}
    />
  );
}

function EmailForm({ data, onChange }) {
  return (
    <>
      <Input
        label="To (email address)"
        value={data.email_to}
        placeholder="someone@example.com"
        type="email"
        onChange={(e) => onChange({ ...data, email_to: e.target.value })}
      />
      <Input
        label="Subject"
        value={data.email_subject}
        placeholder="Hello!"
        onChange={(e) => onChange({ ...data, email_subject: e.target.value })}
      />
      <Input
        label="Body (optional)"
        value={data.email_body}
        placeholder="Pre-filled message body…"
        textarea
        onChange={(e) => onChange({ ...data, email_body: e.target.value })}
      />
    </>
  );
}

function MapsForm({ data, onChange }) {
  return (
    <>
      <Input
        label="Google Maps Link"
        value={data.maps_link}
        mono
        placeholder="https://maps.google.com/?q=..."
        onChange={(e) => onChange({ ...data, maps_link: e.target.value })}
      />
      <Input
        label="Location Label (optional)"
        value={data.maps_label}
        placeholder="e.g. Our Office"
        onChange={(e) => onChange({ ...data, maps_label: e.target.value })}
      />
    </>
  );
}

function ContactForm({ data, onChange }) {
  const f = (field) => (e) => onChange({ ...data, [field]: e.target.value });
  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        <Input
          label="First Name *"
          value={data.first_name}
          placeholder="John"
          onChange={f("first_name")}
        />
        <Input
          label="Last Name"
          value={data.last_name}
          placeholder="Doe"
          onChange={f("last_name")}
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Input
          label="Organization"
          value={data.organization}
          placeholder="Acme Corp"
          onChange={f("organization")}
        />
        <Input
          label="Job Title"
          value={data.job_title}
          placeholder="Manager"
          onChange={f("job_title")}
        />
      </div>
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1 mb-[-4px] pt-1.5 border-t border-gray-100">
        📞 Phone Numbers
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <Input
          label="Personal Mobile"
          value={data.phone_personal}
          placeholder="+91 98765 43210"
          type="tel"
          onChange={f("phone_personal")}
        />
        <Input
          label="Work / Office"
          value={data.phone_work}
          placeholder="+91 98765 00000"
          type="tel"
          onChange={f("phone_work")}
        />
      </div>
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1 mb-[-4px] pt-1.5 border-t border-gray-100">
        📧 Online
      </p>
      <Input
        label="Email Address"
        value={data.email}
        placeholder="john@example.com"
        type="email"
        onChange={f("email")}
      />
      <Input
        label="Website"
        value={data.website}
        mono
        placeholder="https://johndoe.com"
        onChange={f("website")}
      />
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1 mb-[-4px] pt-1.5 border-t border-gray-100">
        📍 Location
      </p>
      <Input
        label="Full Address"
        value={data.location}
        placeholder="123 Street, City, State, PIN"
        onChange={f("location")}
      />
      <Input
        label="Google Maps Link"
        value={data.maps_link}
        mono
        placeholder="https://maps.google.com/?q=..."
        onChange={f("maps_link")}
      />
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1 mb-[-4px] pt-1.5 border-t border-gray-100">
        🩸 Personal Info
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <Select
          label="Blood Group"
          value={data.blood_group}
          options={BLOOD_GROUPS}
          onChange={f("blood_group")}
        />
        <Input
          label="Birthday"
          value={data.birthday}
          type="date"
          onChange={f("birthday")}
        />
      </div>
      <Input
        label="Notes"
        value={data.notes}
        placeholder="Any additional info…"
        textarea
        onChange={f("notes")}
      />
    </>
  );
}

function MiniQR({ qrKey, libReady }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!libReady || !ref.current || !window.QRCode) return;
    ref.current.innerHTML = "";
    try {
      new window.QRCode(ref.current, {
        text: `${API}/qr/${qrKey}`,
        width: 34,
        height: 34,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    } catch {
      /* silent */
    }
  }, [qrKey, libReady]);

  return (
    <div
      ref={ref}
      className="w-[34px] h-[34px] rounded-lg overflow-hidden shrink-0 bg-white border border-gray-200 flex items-center justify-center leading-[0]"
    />
  );
}

function TypeTab({ type, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-2 px-1 border-[1.5px] rounded-lg text-base cursor-pointer transition-all ${active ? "border-black bg-gray-100 text-black font-bold" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
    >
      <span>{type.icon}</span>
      <span className="text-[10px] font-medium">{type.label}</span>
    </button>
  );
}

function EditPanel({ selected, onUpdate, loading, error }) {
  const [formType, setFormType] = useState(selected.type || "website");
  const [website, setWebsite] = useState({
    destination: selected.destination || "",
  });
  const [email, setEmail] = useState({
    email_to: selected.email_to || "",
    email_subject: selected.email_subject || "",
    email_body: selected.email_body || "",
  });
  const [maps, setMaps] = useState({
    maps_link: selected.maps_link || "",
    maps_label: selected.maps_label || "",
  });
  const [contact, setContact] = useState({
    first_name: selected.contact?.first_name || "",
    last_name: selected.contact?.last_name || "",
    phone_personal: selected.contact?.phone_personal || "",
    phone_work: selected.contact?.phone_work || "",
    email: selected.contact?.email || "",
    website: selected.contact?.website || "",
    location: selected.contact?.location || "",
    maps_link: selected.contact?.maps_link || "",
    blood_group: selected.contact?.blood_group || "",
    organization: selected.contact?.organization || "",
    job_title: selected.contact?.job_title || "",
    birthday: selected.contact?.birthday || "",
    notes: selected.contact?.notes || "",
  });

  function buildPayload() {
    switch (formType) {
      case "website":
        return { type: "website", ...website };
      case "email":
        return { type: "email", ...email };
      case "maps":
        return { type: "maps", ...maps };
      case "contact":
        return { type: "contact", contact };
    }
  }

  return (
    <div className="flex flex-col gap-3.5">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest m-0">
        Update QR Type & Data
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {QR_TYPES.map((t) => (
          <TypeTab
            key={t.id}
            type={t}
            active={formType === t.id}
            onClick={() => setFormType(t.id)}
          />
        ))}
      </div>
      <div className="flex flex-col gap-2.5">
        {formType === "website" && (
          <WebsiteForm data={website} onChange={setWebsite} />
        )}
        {formType === "email" && <EmailForm data={email} onChange={setEmail} />}
        {formType === "maps" && <MapsForm data={maps} onChange={setMaps} />}
        {formType === "contact" && (
          <ContactForm data={contact} onChange={setContact} />
        )}
      </div>
      {error && (
        <p className="text-[12px] text-red-600 m-0 px-2.5 py-1.5 bg-red-50 rounded-md border border-red-200">
          {error}
        </p>
      )}
      <button
        className="w-full py-2.5 bg-black text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={() => onUpdate(buildPayload())}
        disabled={loading}
      >
        {loading ? "Updating…" : "↻ Update QR Code"}
      </button>
    </div>
  );
}

// ─── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (!window.google || !btnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: onLogin,
    });
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
    });
  }, []);

  // Load GSI script
  useEffect(() => {
    if (window.google) return;
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => {
      if (!btnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: onLogin,
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
      });
    };
    document.head.appendChild(s);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <header className="bg-black text-white px-6 h-[52px] flex items-center gap-3 shrink-0">
        <span className="font-bold text-[15px] tracking-tight">
          ▦ Shopora QR Generator
        </span>
      </header>
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-5 w-[340px] shadow-sm">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white text-2xl">
            ▦
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-gray-900 m-0">
              Welcome to Shopora QR
            </p>
            <p className="text-[13px] text-gray-400 mt-1 m-0">
              Sign in to manage your QR codes
            </p>
          </div>
          <div ref={btnRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function QRManager() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [qrList, setQrList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("website");
  const [newWebsite, setNewWebsite] = useState({ ...defaultWebsite });
  const [newEmail, setNewEmail] = useState({ ...defaultEmail });
  const [newMaps, setNewMaps] = useState({ ...defaultMaps });
  const [newContact, setNewContact] = useState({ ...defaultContact });
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [createError, setCreateError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [libReady, setLibReady] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const canvasRef = useRef(null);

  // ── Restore session ──────────────────────────────────────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }
    axios
      .get(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch(() => clearToken())
      .finally(() => setAuthLoading(false));
  }, []);

  // ── Google login callback ────────────────────────────────────────────────────
  async function handleGoogleResponse({ credential }) {
    try {
      const res = await axios.post(`${API}/api/auth/google`, { credential });
      setToken(res.data.token);
      setUser(res.data.user);
    } catch {
      showToast("Login failed");
    }
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    setQrList([]);
    setSelected(null);
  }

  // ── QR lib ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (window.QRCode) {
      setLibReady(true);
      return;
    }
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    s.async = true;
    s.onload = () => setLibReady(true);
    document.head.appendChild(s);
  }, []);

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
    } catch {
      /* silent */
    }
  }, [selected, libReady]);

  async function fetchAll() {
    try {
      const res = await authAxios().get(`${API}/api/qr`);
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
      setQrList(data);
    } catch {
      showToast("Failed to load QR codes");
      setQrList([]);
    }
  }

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  function buildCreatePayload() {
    switch (newType) {
      case "website":
        return { name: newName.trim(), type: "website", ...newWebsite };
      case "email":
        return { name: newName.trim(), type: "email", ...newEmail };
      case "maps":
        return { name: newName.trim(), type: "maps", ...newMaps };
      case "contact":
        return { name: newName.trim(), type: "contact", contact: newContact };
    }
  }

  async function handleCreate() {
    setCreateError("");
    if (!newName.trim()) {
      setCreateError("Enter a name.");
      return;
    }
    if (newType === "website" && !newWebsite.destination.trim()) {
      setCreateError("Enter a destination URL.");
      return;
    }
    if (newType === "email" && !newEmail.email_to.trim()) {
      setCreateError("Enter an email address.");
      return;
    }
    if (newType === "maps" && !newMaps.maps_link.trim()) {
      setCreateError("Enter a Maps link.");
      return;
    }
    if (newType === "contact" && !newContact.first_name.trim()) {
      setCreateError("Enter a first name.");
      return;
    }

    setLoading(true);
    try {
      await authAxios().post(`${API}/api/qr`, buildCreatePayload());
      showToast("QR created ✓");
      setNewName("");
      setNewWebsite({ ...defaultWebsite });
      setNewEmail({ ...defaultEmail });
      setNewMaps({ ...defaultMaps });
      setNewContact({ ...defaultContact });
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
      await authAxios().put(`${API}/api/qr/${selected.qr_key}`, payload);
      await fetchAll();
      showToast("QR updated ✓");
      setSelected((prev) => ({ ...prev, ...payload }));
    } catch {
      setUpdateError("Failed to update.");
    } finally {
      setUpdateLoading(false);
    }
  }

  async function handleDelete() {
    if (!selected || !confirm(`Delete "${selected.name}"?`)) return;
    try {
      await authAxios().delete(`${API}/api/qr/${selected.qr_key}`);
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

  // ─── Render guards ────────────────────────────────────────────────────────────
  if (authLoading)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400 text-[13px]">Loading…</p>
      </div>
    );

  if (!user) return <LoginScreen onLogin={handleGoogleResponse} />;

  // ─── Create form ──────────────────────────────────────────────────────────────
  function renderCreateForm() {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex flex-col gap-2.5">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest m-0">
          New QR Code
        </p>
        <Input
          label="Name"
          value={newName}
          placeholder="e.g. My Portfolio"
          onChange={(e) => setNewName(e.target.value)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-500 tracking-wide">
            Type
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {QR_TYPES.map((t) => (
              <TypeTab
                key={t.id}
                type={t}
                active={newType === t.id}
                onClick={() => setNewType(t.id)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {newType === "website" && (
            <WebsiteForm data={newWebsite} onChange={setNewWebsite} />
          )}
          {newType === "email" && (
            <EmailForm data={newEmail} onChange={setNewEmail} />
          )}
          {newType === "maps" && (
            <MapsForm data={newMaps} onChange={setNewMaps} />
          )}
          {newType === "contact" && (
            <ContactForm data={newContact} onChange={setNewContact} />
          )}
        </div>
        {createError && (
          <p className="text-[12px] text-red-600 m-0 px-2.5 py-1.5 bg-red-50 rounded-md border border-red-200">
            {createError}
          </p>
        )}
        <div className="flex gap-2">
          <button
            className="flex-1 py-2.5 bg-white text-black border-[1.5px] border-black rounded-lg text-[13px] font-semibold cursor-pointer transition-colors hover:bg-gray-100"
            onClick={() => setShowCreate(false)}
          >
            Cancel
          </button>
          <button
            className="flex-[2] py-2.5 bg-black text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Creating…" : "+ Generate QR"}
          </button>
        </div>
      </div>
    );
  }

  function renderPreview() {
    if (!selected) {
      return (
        <div className="text-center max-w-[280px] mt-28">
          <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center text-[32px] text-gray-300 mx-auto mb-4">
            ▦
          </div>
          <p className="text-base font-semibold text-gray-500 mb-1.5 m-0">
            Select a QR code
          </p>
          <p className="text-[13px] text-gray-400 leading-relaxed m-0">
            Pick one from the list to preview and update it
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-[400px]">
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <span className="text-base font-bold text-gray-900">
            {selected.name}
          </span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black text-white tracking-wider">
            {typeIcon(selected.type)} {typeLabel(selected.type)}
          </span>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-center gap-3 w-full box-border shadow-sm">
          <div ref={canvasRef} className="leading-[0]" />
          <p className="text-[11px] text-gray-400 font-mono text-center break-all m-0">
            {API}/qr/{selected.qr_key}
          </p>
        </div>
        <div className="flex gap-2 w-full">
          <button
            className="flex-1 py-2.5 bg-white text-black border-[1.5px] border-black rounded-lg text-[13px] font-semibold cursor-pointer transition-colors hover:bg-gray-100"
            onClick={downloadPng}
          >
            ↓ Download PNG
          </button>
          <button
            className="flex-1 py-2.5 bg-white text-red-600 border-[1.5px] border-red-600 rounded-lg text-[13px] font-semibold cursor-pointer transition-colors hover:bg-red-50"
            onClick={handleDelete}
          >
            🗑 Delete
          </button>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2.5 w-full box-border">
          <EditPanel
            key={selected.qr_key}
            selected={selected}
            onUpdate={handleUpdate}
            loading={updateLoading}
            error={updateError}
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 w-full box-border">
          <p className="text-[11px] font-bold text-gray-900 mb-1 uppercase tracking-wider m-0">
            How Shopora QR works
          </p>
          <p className="text-[12px] text-gray-500 leading-relaxed m-0">
            The printed QR always points to{" "}
            <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[11px]">
              {API}/qr/{selected.qr_key}
            </code>
            , which redirects to your destination. Update the data above anytime
            — no reprinting needed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-2.5 rounded-full text-[13px] font-semibold z-50 pointer-events-none shadow-xl">
          {toast}
        </div>
      )}

      <header className="bg-black text-white px-6 h-[52px] flex items-center gap-3 shrink-0">
        <span className="font-bold text-[15px] tracking-tight flex-1">
          ▦ Shopora QR Generator
        </span>
        <div className="flex items-center gap-2.5">
          {user.avatar && (
            <img src={user.avatar} alt="" className="w-7 h-7 rounded-full" />
          )}
          <span className="text-[13px] text-gray-300">{user.name}</span>
          <button
            onClick={handleLogout}
            className="text-[12px] text-gray-400 hover:text-white transition-colors px-2 py-1 rounded border border-gray-700 hover:border-gray-500"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[340px] shrink-0 bg-white border-r border-gray-200 p-4 overflow-y-auto flex flex-col gap-3.5">
          {showCreate ? (
            renderCreateForm()
          ) : (
            <button
              className="w-full py-2.5 bg-black text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => setShowCreate(true)}
            >
              + New QR Code
            </button>
          )}
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest m-0 flex items-center gap-1.5">
              All QR Codes{" "}
              {qrList.length > 0 && (
                <span className="bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {qrList.length}
                </span>
              )}
            </p>
            {qrList.length === 0 ? (
              <p className="text-[13px] text-gray-300 text-center py-5">
                No QR codes yet.
              </p>
            ) : (
              qrList.map((entry) => (
                <div
                  key={entry.qr_key}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${selected?.qr_key === entry.qr_key ? "border-[1.5px] border-black bg-gray-50" : "border border-gray-200 bg-white hover:bg-gray-50"}`}
                  onClick={() => {
                    setSelected(entry);
                    setUpdateError("");
                  }}
                >
                  <MiniQR qrKey={entry.qr_key} libReady={libReady} />

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 m-0 truncate">
                      {entry.name}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 m-0 truncate">
                      {typeLabel(entry.type)}
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-300 shrink-0">
                    {entry.createdAt ? timeAgo(entry.createdAt) : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex-1 flex items-start justify-center px-8 pt-8 pb-16 bg-gray-100 overflow-y-auto">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
}
