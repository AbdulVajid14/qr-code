import { useState, useEffect, useRef } from "react";

const TYPE_CONFIG = {
  url:      { label: "Website URL",  placeholder: "https://yourwebsite.com", hint: "Include https://",         prefix: "" },
  email:    { label: "Email",        placeholder: "you@email.com",           hint: "Opens mail app on scan",   prefix: "mailto:" },
  phone:    { label: "Phone",        placeholder: "+91 98765 43210",         hint: "Include country code",     prefix: "tel:" },
  whatsapp: { label: "WhatsApp",     placeholder: "+91 98765 43210",         hint: "Number with country code", prefix: "https://wa.me/" },
  text:     { label: "Plain Text",   placeholder: "Name, title, company…",   hint: "Any text to encode",       prefix: "" },
};

const COLORS = [
  { value: "#111827", label: "Ink",     tw: "bg-gray-900" },
  { value: "#1e40af", label: "Navy",    tw: "bg-blue-800" },
  { value: "#166534", label: "Forest",  tw: "bg-green-800" },
  { value: "#6d28d9", label: "Violet",  tw: "bg-violet-700" },
  { value: "#9f1239", label: "Crimson", tw: "bg-rose-900" },
];

const SIZES = [
  { value: 160, label: "S" },
  { value: 200, label: "M" },
  { value: 240, label: "L" },
];

function buildQrData(type, raw) {
  if (!raw.trim()) return null;
  const cfg = TYPE_CONFIG[type];
  if (type === "whatsapp") return cfg.prefix + raw.replace(/[\s\-()]/g, "");
  if (type === "phone")    return cfg.prefix + raw.replace(/\s/g, "");
  return cfg.prefix + raw.trim();
}

export default function QRCodeGenerator() {
  const [type,        setType]        = useState("url");
  const [input,       setInput]       = useState("");
  const [color,       setColor]       = useState(COLORS[0].value);
  const [size,        setSize]        = useState(200);
  const [qrData,      setQrData]      = useState(null);
  const [error,       setError]       = useState("");
  const [generated,   setGenerated]   = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [libReady,    setLibReady]    = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.QRCode) { setLibReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    s.async = true;
    s.onload = () => setLibReady(true);
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(s); } catch {} };
  }, []);

  useEffect(() => {
    if (!qrData || !libReady) return;
    const container = canvasRef.current;
    if (!container || !window.QRCode) return;
    container.innerHTML = "";
    try {
      new window.QRCode(container, {
        text: qrData,
        width: size,
        height: size,
        colorDark: color,
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.H,
      });
    } catch {
      setError("Failed to render QR code. Try a shorter input.");
    }
  }, [qrData, color, size, libReady]);

  function generate() {
    setError("");
    const data = buildQrData(type, input);
    if (!data) { setError("Please enter a value first."); return; }
    setQrData(data);
    setGenerated(true);
  }

  function downloadPng() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    setDownloading(true);
    setTimeout(() => {
      const a = document.createElement("a");
      a.download = "qrcode.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
      setDownloading(false);
    }, 100);
  }

  function downloadSvg() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><image width="${size}" height="${size}" xlink:href="${dataUrl}"/></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.download = "qrcode.svg";
    a.href = URL.createObjectURL(blob);
    a.click();
  }

  const cfg = TYPE_CONFIG[type];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="flex-none border-b border-stone-200 bg-white px-6 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-stone-900 flex items-center justify-center flex-none">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h3v3h-3v-3zm4 0h3v3h-3v-3zm-4 4h3v3h-3v-3zm4 0h3v3h-3v-3z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-stone-900 leading-none">QR Code Generator</h1>
          <p className="text-xs text-stone-400 mt-0.5">For visiting cards &amp; print</p>
        </div>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
          Static · Print-safe
        </span>
      </header>

      {/* Body: two-column on lg+ */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ── LEFT PANEL: Controls ── */}
        <div className="flex-none lg:w-96 border-b lg:border-b-0 lg:border-r border-stone-200 bg-white overflow-y-auto p-5 space-y-5">

          {/* Type tabs */}
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Type</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => { setType(key); setInput(""); setGenerated(false); setQrData(null); setError(""); }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 font-medium
                    ${type === key
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-700"
                    }`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="text-xs font-medium text-stone-400 uppercase tracking-widest block mb-2">
              {cfg.label}
            </label>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generate()}
              placeholder={cfg.placeholder}
              className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg bg-stone-50 text-stone-900 placeholder-stone-300
                         focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
            />
            <p className="text-xs text-stone-400 mt-1.5">{cfg.hint}</p>
          </div>

          {/* Color */}
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Color</p>
            <div className="flex items-center gap-2">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-full border-2 transition-all duration-150 ${c.tw}
                    ${color === c.value ? "ring-2 ring-offset-2 ring-stone-700 scale-110" : "border-transparent hover:scale-110"}`}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Size</p>
            <div className="flex gap-2">
              {SIZES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSize(s.value)}
                  className={`px-5 py-1.5 text-sm rounded-full border font-medium transition-all duration-150
                    ${size === s.value
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-700"
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
              <svg className="w-4 h-4 text-red-500 flex-none mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
              </svg>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Generate */}
          <button
            onClick={generate}
            className="w-full py-2.5 text-sm font-semibold rounded-lg border-2 border-stone-900 text-stone-900 bg-white
                       hover:bg-stone-900 hover:text-white transition-all duration-200 active:scale-[0.98]"
          >
            Generate QR Code
          </button>
        </div>

        {/* ── RIGHT PANEL: Preview ── */}
        <div className="flex-1 flex items-center justify-center p-6 bg-stone-50 overflow-hidden">
          {!generated ? (
            /* Empty state */
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-stone-300 flex items-center justify-center">
                <svg className="w-12 h-12 text-stone-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h3v3h-3v-3zm4 0h3v3h-3v-3zm-4 4h3v3h-3v-3zm4 0h3v3h-3v-3z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-stone-500">Your QR code will appear here</p>
                <p className="text-xs text-stone-400 mt-1">Fill in the details and click Generate</p>
              </div>
            </div>
          ) : (
            /* QR output */
            <div className="flex flex-col items-center gap-5 w-full max-w-xs">
              {/* QR card */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col items-center gap-3 w-full">
                <div ref={canvasRef} className="leading-none" />
                <p className="text-xs text-stone-400 break-all text-center leading-relaxed max-w-full">
                  {qrData}
                </p>
              </div>

              {/* Download buttons */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={downloadPng}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg
                             bg-stone-900 text-white hover:bg-stone-700 transition-all duration-150 active:scale-[0.98]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 21h14"/>
                  </svg>
                  {downloading ? "Saving…" : "PNG"}
                </button>
                <button
                  onClick={downloadSvg}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg
                             bg-white text-stone-700 border border-stone-200 hover:bg-stone-100 transition-all duration-150 active:scale-[0.98]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 21h14"/>
                  </svg>
                  SVG
                </button>
              </div>

              {/* Notice */}
              <div className="flex items-start gap-2.5 px-3.5 py-3 bg-emerald-50 border border-emerald-200 rounded-xl w-full">
                <svg className="w-4 h-4 text-emerald-600 flex-none mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
                </svg>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  <strong>Static &amp; permanent</strong> — safe to print on visiting cards. Works as long as your link stays active.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}