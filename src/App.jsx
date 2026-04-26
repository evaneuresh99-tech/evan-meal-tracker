import { useState, useEffect, useRef } from "react";

// ── Meal plan data ─────────────────────────────────────────────────
const MEALS = [
  { id: "bf", name: "Late Breakfast", ingredients: [
    { id: "toast",   name: "Toast Bread",       brand: "Fazer",        amount: 50,  unit: "g"     },
    { id: "avocado", name: "Avocado",            brand: null,           amount: 65,  unit: "g"     },
    { id: "egg",     name: "Eggs",               brand: null,           amount: 3,   unit: "pcs"   },
    { id: "romaine", name: "Romaine Lettuce",    brand: null,           amount: 28,  unit: "g"     },
    { id: "bacon",   name: "American Bacon",     brand: "Rakvere",      amount: 25,  unit: "g"     },
  ]},
  { id: "ln", name: "Lunch", ingredients: [
    { id: "couscous", name: "Couscous",          brand: "plain, raw",   amount: 75,  unit: "g"     },
    { id: "cf",       name: "Chicken Filet",     brand: "raw",          amount: 150, unit: "g"     },
    { id: "cp",       name: "Chickpeas",         brand: null,           amount: 50,  unit: "g"     },
    { id: "feta",     name: "Feta Cheese",       brand: "Baltais",      amount: 25,  unit: "g"     },
    { id: "corn",     name: "Sweet Corn",        brand: "Bonduelle",    amount: 20,  unit: "g"     },
    { id: "chilli",   name: "Sweet Chilli Sauce",brand: null,           amount: 15,  unit: "ml"    },
    { id: "pumpkin",  name: "Pumpkin Seeds",     brand: null,           amount: 10,  unit: "g"     },
  ]},
  { id: "pw", name: "Post Workout Snack", ingredients: [
    { id: "whey", name: "Gold Whey Protein",     brand: null,           amount: 1,   unit: "scoop" },
  ]},
  { id: "dn", name: "Dinner", ingredients: [
    { id: "potato",  name: "Potato",             brand: "raw",          amount: 300, unit: "g"     },
    { id: "ct",      name: "Chicken Drumsticks", brand: "2 drumsticks", amount: 170, unit: "g"     },
    { id: "yogurt",  name: "Greek Yogurt",       brand: "Baltais",      amount: 60,  unit: "g"     },
    { id: "onion",   name: "Onion",              brand: "0.5 cup",      amount: 80,  unit: "g"     },
  ]},
];

const INGS = MEALS.flatMap(m => m.ingredients);

// ── Design tokens ──────────────────────────────────────────────────
const T = {
  bg:         "#0A0A0A",
  surface:    "#111111",
  surface2:   "#191919",
  border:     "rgba(255,255,255,0.07)",
  border2:    "rgba(255,255,255,0.12)",
  text:       "#FFFFFF",
  muted:      "#606060",
  muted2:     "#888888",
  green:      "#00E676",
  greenGlow:  "rgba(0,230,118,0.25)",
  greenDim:   "rgba(0,230,118,0.08)",
  neonGreen:  "#00FF88",
  neonAmber:  "#FFB800",
  neonRed:    "#FF3355",
  neonBlue:   "#00CCFF",
  font:       "'Arial', 'Helvetica Neue', sans-serif",
};

// ── Helpers ────────────────────────────────────────────────────────
const fmt    = n  => Number.isInteger(n) ? n : parseFloat(n.toFixed(1));
const today  = () => new Date().toISOString().split("T")[0];
const fmtDate = d => { try { return new Date(d + "T12:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); } catch { return d; } };
const curMonth = () => today().slice(0, 7);

// ── Shared style helpers ───────────────────────────────────────────
const cardStyle = {
  background: T.surface, border: `1px solid ${T.border}`,
  borderRadius: 14, padding: "18px 20px", marginBottom: 12,
};

const pillStyle = (on) => ({
  padding: "6px 16px", borderRadius: 20,
  border: on ? "none" : `1px solid ${T.border2}`,
  background: on ? T.green : "transparent",
  color: on ? "#000" : T.muted2,
  fontSize: 13, fontFamily: T.font, cursor: "pointer", fontWeight: on ? 700 : 400,
  transition: "all 0.15s",
});

const inputStyle = {
  width: "100%", marginBottom: 10, padding: "10px 14px",
  background: T.surface2, border: `1px solid ${T.border2}`,
  borderRadius: 10, color: T.text, fontSize: 14, fontFamily: T.font,
  outline: "none",
};

const bigBtnStyle = (primary, disabled) => ({
  width: "100%", border: primary ? "none" : `1px solid ${T.border2}`,
  borderRadius: 10, padding: "11px 0", fontSize: 14, fontFamily: T.font,
  cursor: disabled ? "not-allowed" : "pointer", fontWeight: 700, marginBottom: 10,
  background: primary ? T.green : T.surface2,
  color: primary ? "#000" : T.muted2,
  opacity: disabled ? 0.4 : 1,
  boxShadow: primary && !disabled ? `0 0 16px ${T.greenGlow}` : "none",
  transition: "all 0.15s",
});

const sectionLabel = {
  fontSize: 11, color: T.muted, textTransform: "uppercase",
  letterSpacing: "0.08em", fontWeight: 700, marginBottom: 14,
  fontFamily: T.font,
};

const heading = (size = 15) => ({
  fontSize: size, fontWeight: 700, color: T.text, fontFamily: T.font,
});

// Neon badge factory
const neonBadge = (type) => {
  const map = {
    ok:     { color: T.neonGreen, shadow: "rgba(0,255,136,0.45)"  },
    low:    { color: T.neonAmber, shadow: "rgba(255,184,0,0.45)"  },
    out:    { color: T.neonRed,   shadow: "rgba(255,51,85,0.55)"  },
    info:   { color: T.neonBlue,  shadow: "rgba(0,204,255,0.4)"   },
    grey:   { color: T.muted2,    shadow: "transparent"            },
    scan:   { color: T.neonBlue,  shadow: "rgba(0,204,255,0.4)"   },
  };
  const { color, shadow } = map[type] || map.grey;
  return {
    fontSize: 11, padding: "3px 10px", borderRadius: 20,
    border: `1px solid ${color}`, color,
    background: `${color}18`,
    boxShadow: `0 0 8px ${shadow}`,
    whiteSpace: "nowrap", fontFamily: T.font, fontWeight: 700,
    letterSpacing: "0.03em",
  };
};

// ── Main app ───────────────────────────────────────────────────────
export default function App() {
  const [tab,         setTab]         = useState("grocery");
  const [days,        setDays]        = useState(7);
  const [customDays,  setCustomDays]  = useState(10);
  const [showCustom,  setShowCustom]  = useState(false);
  const [viewMode,    setViewMode]    = useState("all");
  const [checked,     setChecked]     = useState({});
  const [inv,         setInv]         = useState({});
  const [runs,        setRuns]        = useState([]);
  const [openForm,    setOpenForm]    = useState(null);
  const [addAmt,      setAddAmt]      = useState("");
  const [showLog,     setShowLog]     = useState(false);
  const [logForm,     setLogForm]     = useState({ date: today(), store: "", total: "", notes: "" });
  const [logItems,    setLogItems]    = useState([]);
  const [newItem,     setNewItem]     = useState({ name: "", price: "" });
  const [pendingInv,  setPendingInv]  = useState({});
  const [fromReceipt, setFromReceipt] = useState(false);
  const [scanning,    setScanning]    = useState(false);
  const [scanError,   setScanError]   = useState(false);
  const fileRef = useRef();
  const impRef  = useRef();

  // Storage (works in Claude.ai; on Vercel replaced by Supabase later)
  useEffect(() => {
    if (typeof window.storage === "undefined") return;
    window.storage.get("mp4inv").then(r  => { if (r?.value)  setInv(JSON.parse(r.value));  }).catch(() => {});
    window.storage.get("mp4runs").then(r => { if (r?.value)  setRuns(JSON.parse(r.value)); }).catch(() => {});
  }, []);
  useEffect(() => { if (typeof window.storage !== "undefined") window.storage.set("mp4inv",  JSON.stringify(inv)).catch(()  => {}); }, [inv]);
  useEffect(() => { if (typeof window.storage !== "undefined") window.storage.set("mp4runs", JSON.stringify(runs)).catch(() => {}); }, [runs]);

  const getStock   = id => inv[id] || 0;
  const getDaysLeft = id => { const i = INGS.find(x => x.id === id); if (!i?.amount) return 99; return Math.floor(getStock(id) / i.amount); };
  const lowItems   = INGS.filter(i => getDaysLeft(i.id) <= 2);

  // ── Grocery tab ──────────────────────────────────────────────────
  const IngRow = ({ ing }) => {
    const amt = fmt(ing.amount * days);
    const on  = !!checked[ing.id];
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
        <div
          onClick={() => setChecked(p => ({ ...p, [ing.id]: !p[ing.id] }))}
          style={{ width: 20, height: 20, minWidth: 20, borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, border: on ? "none" : `1px solid ${T.border2}`, background: on ? T.green : "transparent", color: on ? "#000" : "transparent", boxShadow: on ? `0 0 8px ${T.greenGlow}` : "none", transition: "all 0.15s" }}
        >✓</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontFamily: T.font, color: on ? T.muted : T.text, textDecoration: on ? "line-through" : "none" }}>{ing.name}</div>
          {ing.brand && <div style={{ fontSize: 11, color: T.muted, fontFamily: T.font }}>{ing.brand}</div>}
        </div>
        <div style={{ fontSize: 13, fontFamily: "monospace", color: T.green, whiteSpace: "nowrap", fontWeight: 700 }}>{amt} {ing.unit}</div>
      </div>
    );
  };

  const GroceryTab = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: T.muted, fontFamily: T.font }}>How many days?</span>
        <button onClick={() => setChecked({})} style={pillStyle(false)}>Clear checks</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {[1, 7, 14].map(n => (
          <button key={n} onClick={() => { setDays(n); setShowCustom(false); }} style={pillStyle(days === n && !showCustom)}>
            {n} day{n > 1 ? "s" : ""}
          </button>
        ))}
        <button onClick={() => setShowCustom(p => !p)} style={pillStyle(showCustom)}>Custom</button>
      </div>
      {showCustom && (
        <div style={{ marginBottom: 14, display: "flex", gap: 8, alignItems: "center" }}>
          <input type="number" min="1" max="90" value={customDays} onChange={e => setCustomDays(parseInt(e.target.value) || 1)} style={{ ...inputStyle, width: 90, marginBottom: 0 }} />
          <button onClick={() => setDays(customDays)} style={pillStyle(true)}>Apply</button>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setViewMode("all")}  style={pillStyle(viewMode === "all")}>All ingredients</button>
        <button onClick={() => setViewMode("meal")} style={pillStyle(viewMode === "meal")}>By meal</button>
      </div>
      {viewMode === "all" ? (
        <div style={cardStyle}>
          <div style={sectionLabel}>All ingredients — {days} day{days !== 1 ? "s" : ""}</div>
          {INGS.map(ing => <IngRow key={ing.id} ing={ing} />)}
        </div>
      ) : MEALS.map(m => (
        <div key={m.id} style={cardStyle}>
          <div style={sectionLabel}>{m.name}</div>
          {m.ingredients.map(ing => <IngRow key={ing.id} ing={ing} />)}
        </div>
      ))}
    </div>
  );

  // ── Inventory tab ────────────────────────────────────────────────
  const InvRow = ({ ing }) => {
    const s  = getStock(ing.id);
    const d  = getDaysLeft(ing.id);
    const bt = d === 0 ? "out" : d <= 2 ? "low" : "ok";
    const bl = d === 0 ? "Out of stock" : d >= 99 ? "Unlimited" : `${d} day${d !== 1 ? "s" : ""} left`;
    const pct = Math.min(100, ing.amount > 0 ? Math.round(s / (ing.amount * 7) * 100) : 100);
    const barColor = d === 0 ? T.neonRed : d <= 2 ? T.neonAmber : T.neonGreen;
    const isOpen = openForm === ing.id;
    return (
      <div style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div>
            <div style={heading(14)}>{ing.name}</div>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: T.font, marginTop: 2 }}>{ing.brand ? `${ing.brand} · ` : ""}{ing.amount} {ing.unit}/day</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={neonBadge(bt)}>{bl}</span>
            <span style={{ fontFamily: "monospace", fontSize: 13, color: T.green, minWidth: 60, textAlign: "right", fontWeight: 700 }}>{fmt(s)} {ing.unit}</span>
            <button onClick={() => { setOpenForm(isOpen ? null : ing.id); setAddAmt(""); }} style={{ ...neonBadge("grey"), cursor: "pointer", padding: "4px 12px", fontSize: 12 }}>+ Add</button>
          </div>
        </div>
        <div style={{ height: 3, background: T.border2, borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 2, boxShadow: `0 0 6px ${barColor}88`, transition: "width 0.4s" }} />
        </div>
        {isOpen && (
          <div style={{ background: T.surface2, border: `1px solid ${T.border2}`, borderRadius: 10, padding: 14, marginTop: 10 }}>
            <div style={{ fontSize: 12, color: T.muted, fontWeight: 700, fontFamily: T.font, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Add stock ({ing.unit})</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="number" min="0" step={ing.unit === "pcs" || ing.unit === "scoop" ? 1 : 50} placeholder="0" value={addAmt} onChange={e => setAddAmt(e.target.value)} style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
              <button onClick={() => { const v = parseFloat(addAmt); if (!v || v <= 0) return; setInv(p => ({ ...p, [ing.id]: (p[ing.id] || 0) + v })); setAddAmt(""); setOpenForm(null); }} style={pillStyle(true)}>Add</button>
              <button onClick={() => setOpenForm(null)} style={pillStyle(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const InventoryTab = () => (
    <div>
      {lowItems.length > 0 && (
        <div style={{ border: `1px solid ${T.neonAmber}`, borderRadius: 10, padding: "10px 16px", marginBottom: 14, fontSize: 13, color: T.neonAmber, background: "rgba(255,184,0,0.07)", fontFamily: T.font, boxShadow: `0 0 10px rgba(255,184,0,0.15)` }}>
          <strong>Low stock:</strong> {lowItems.map(i => i.name).join(", ")}
        </div>
      )}
      <div style={{ ...cardStyle, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={heading(14)}>Mark today as done</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 3, fontFamily: T.font }}>Subtracts one full day from all items</div>
          </div>
          <button
            onClick={() => setInv(p => { const n = { ...p }; INGS.forEach(i => { n[i.id] = Math.max(0, (n[i.id] || 0) - i.amount); }); return n; })}
            style={{ background: T.green, color: "#000", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontFamily: T.font, cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap", boxShadow: `0 0 14px ${T.greenGlow}` }}
          >Done for today</button>
        </div>
      </div>
      <div style={cardStyle}>
        <div style={sectionLabel}>Stock levels</div>
        {INGS.map(ing => <InvRow key={ing.id} ing={ing} />)}
      </div>
    </div>
  );

  // ── Receipt scan → auto-fills log form ───────────────────────────
  const handleReceipt = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = "";
    setScanning(true); setScanError(false);
    try {
      const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
      const prompt = `Parse this grocery receipt. It may be in Latvian.\n\nIngredients to match (fuzzy match by meaning):\n${INGS.map(i => `id:${i.id} | ${i.name} | unit:${i.unit}`).join("\n")}\n\nExtract ALL line items with prices. For matched ingredients include matched_id and matched_amount.\n\nReturn ONLY valid JSON, no markdown:\n{"store":null,"date":null,"total":null,"items":[{"receipt_name":"","price":0,"raw_qty":"","matched_id":null,"matched_amount":null,"matched_unit":null}]}`;

      // NOTE FOR VERCEL: Replace the fetch below with a call to your /api/scan endpoint
      // e.g. fetch('/api/scan', { method: 'POST', body: JSON.stringify({ image: b64, mimeType: file.type }) })
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: file.type, data: b64 } }, { type: "text", text: prompt }] }] }),
      });
      const data   = await resp.json();
      const txt    = data.content.filter(x => x.type === "text").map(x => x.text).join("");
      const parsed = JSON.parse(txt.replace(/```json|```/g, "").trim());

      setLogForm({ date: parsed.date || today(), store: parsed.store || "", total: parsed.total ? String(parsed.total) : "", notes: "" });
      setLogItems((parsed.items || []).map(it => ({ name: it.receipt_name, price: it.price || 0, matched_id: it.matched_id || null, matched_amount: it.matched_amount || null, matched_unit: it.matched_unit || null })));
      const updates = {};
      (parsed.items || []).forEach(it => { if (it.matched_id && it.matched_amount) updates[it.matched_id] = (updates[it.matched_id] || 0) + it.matched_amount; });
      setPendingInv(updates); setFromReceipt(true); setShowLog(true);
    } catch { setScanError(true); }
    setScanning(false);
  };

  const openManualLog = () => { setLogForm({ date: today(), store: "", total: "", notes: "" }); setLogItems([]); setPendingInv({}); setFromReceipt(false); setScanError(false); setShowLog(true); };
  const cancelLog     = () => { setShowLog(false); setFromReceipt(false); setPendingInv({}); setScanError(false); };

  const saveRun = () => {
    const tot = parseFloat(logForm.total); if (!tot || tot <= 0) return;
    if (Object.keys(pendingInv).length > 0) setInv(p => { const n = { ...p }; Object.entries(pendingInv).forEach(([id, amt]) => { n[id] = (n[id] || 0) + amt; }); return n; });
    setRuns(p => [{ id: Date.now() + "", date: logForm.date || today(), store: logForm.store || "Unknown store", total: tot, notes: logForm.notes, source: fromReceipt ? "receipt" : "manual", items: logItems.map(it => ({ name: it.name, price: it.price })) }, ...p]);
    cancelLog(); setNewItem({ name: "", price: "" });
  };

  const matchedNames = Object.keys(pendingInv).map(id => INGS.find(i => i.id === id)?.name).filter(Boolean);

  // ── Spending tab ─────────────────────────────────────────────────
  const monthTotal = runs.filter(r => r.date.startsWith(curMonth())).reduce((s, r) => s + r.total, 0);
  const allTotal   = runs.reduce((s, r) => s + r.total, 0);
  const avgRun     = runs.length ? allTotal / runs.length : 0;
  const itemMap    = {};
  runs.forEach(r => (r.items || []).forEach(it => { if (!itemMap[it.name]) itemMap[it.name] = { t: 0, c: 0 }; itemMap[it.name].t += it.price; itemMap[it.name].c++; }));
  const topItems   = Object.entries(itemMap).sort((a, b) => b[1].t - a[1].t).slice(0, 5);

  const SpendingTab = () => (
    <div>
      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10, marginBottom: 16 }}>
        {[["This month", `€${monthTotal.toFixed(2)}`], ["All time", `€${allTotal.toFixed(2)}`], ["Avg per run", `€${avgRun.toFixed(2)}`], ["Total runs", String(runs.length)]].map(([l, v]) => (
          <div key={l} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: T.font, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: T.green, fontFamily: "monospace" }}>{v}</div>
          </div>
        ))}
      </div>

      <button onClick={() => fileRef.current.click()} style={bigBtnStyle(true, scanning)} disabled={scanning}>
        {scanning ? "Scanning receipt..." : "Scan receipt — auto fills everything"}
      </button>
      <button onClick={openManualLog} style={bigBtnStyle(false, scanning)} disabled={scanning}>+ Log manually</button>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleReceipt} />

      {scanError && (
        <div style={{ border: `1px solid ${T.neonRed}`, borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 13, color: T.neonRed, background: "rgba(255,51,85,0.07)", fontFamily: T.font, boxShadow: `0 0 10px rgba(255,51,85,0.2)` }}>
          Could not read receipt. Try a clearer photo.
        </div>
      )}

      {/* Log form */}
      {showLog && (
        <div style={{ background: T.surface, border: `1px solid ${T.border2}`, borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ ...heading(13), textTransform: "uppercase", letterSpacing: "0.07em", color: T.muted }}>New grocery run</div>
            {fromReceipt && <span style={neonBadge("scan")}>auto-filled</span>}
            {fromReceipt && matchedNames.length > 0 && <span style={neonBadge("ok")}>{matchedNames.length} matched</span>}
          </div>

          {[["Date", "date", "date"], ["Store", "store", "text", "e.g. Rimi, Maxima"], ["Total (€)", "total", "number", "0.00"], ["Notes", "notes", "text", "Optional"]].map(([label, key, type, ph]) => (
            <div key={key}>
              <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, fontFamily: T.font, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
              <input type={type} placeholder={ph || ""} value={logForm[key]} onChange={e => setLogForm(p => ({ ...p, [key]: e.target.value }))} style={inputStyle} />
            </div>
          ))}

          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, fontFamily: T.font, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Items {logItems.length > 0 ? `(${logItems.length})` : "(optional)"}
          </div>

          {logItems.length > 0 && (
            <div style={{ marginBottom: 12, maxHeight: 200, overflowY: "auto", background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "4px 14px" }}>
              {logItems.map((it, i) => {
                const ing = it.matched_id ? INGS.find(x => x.id === it.matched_id) : null;
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < logItems.length - 1 ? `1px solid ${T.border}` : "none" }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                      <div style={{ fontSize: 13, color: T.text, fontFamily: T.font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</div>
                      {ing && <div style={{ fontSize: 11, color: T.neonGreen, fontFamily: T.font }}>→ {ing.name} +{fmt(it.matched_amount)} {it.matched_unit || ing.unit}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 13, color: T.green, fontWeight: 700 }}>€{it.price.toFixed(2)}</span>
                      <span onClick={() => { setLogItems(p => p.filter((_, j) => j !== i)); if (it.matched_id) setPendingInv(p => { const n = { ...p }; delete n[it.matched_id]; return n; }); }} style={{ cursor: "pointer", color: T.muted, fontSize: 16, lineHeight: 1 }}>✕</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <input type="text" placeholder="Add item" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} style={{ ...inputStyle, flex: 2, minWidth: 80, marginBottom: 0 }} />
            <input type="number" placeholder="€" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))} style={{ ...inputStyle, flex: 1, minWidth: 56, marginBottom: 0 }} />
            <button onClick={() => { const p = parseFloat(newItem.price); if (!newItem.name || !p) return; setLogItems(prev => [...prev, { name: newItem.name, price: p }]); setNewItem({ name: "", price: "" }); }} style={pillStyle(false)}>Add</button>
          </div>

          {fromReceipt && matchedNames.length > 0 && (
            <div style={{ fontSize: 12, color: T.neonGreen, background: "rgba(0,255,136,0.07)", border: `1px solid rgba(0,255,136,0.25)`, borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontFamily: T.font }}>
              On save, inventory will update: {matchedNames.join(", ")}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveRun} style={{ flex: 1, background: T.green, color: "#000", border: "none", borderRadius: 10, padding: 10, fontFamily: T.font, cursor: "pointer", fontWeight: 700, fontSize: 14, boxShadow: `0 0 14px ${T.greenGlow}` }}>Save</button>
            <button onClick={cancelLog} style={pillStyle(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* History */}
      {runs.length > 0 && (
        <div style={cardStyle}>
          <div style={sectionLabel}>Shopping history</div>
          {runs.slice(0, 15).map(r => (
            <div key={r.id} style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={neonBadge(r.source === "receipt" ? "scan" : "grey")}>{r.source === "receipt" ? "receipt scan" : "manual"}</span>
                  <span style={heading(14)}>{r.store || "Grocery run"}</span>
                </div>
                <span style={{ fontFamily: "monospace", fontSize: 17, fontWeight: 700, color: T.green, whiteSpace: "nowrap" }}>€{r.total.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: 12, color: T.muted, fontFamily: T.font }}>{fmtDate(r.date)}{r.notes ? ` · ${r.notes}` : ""}{r.items?.length ? ` · ${r.items.length} items` : ""}</div>
            </div>
          ))}
        </div>
      )}

      {/* Top items */}
      {topItems.length > 0 && (
        <div style={cardStyle}>
          <div style={sectionLabel}>Top items by spend</div>
          {topItems.map(([name, d]) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={heading(14)}>{name}</div>
                <div style={{ fontSize: 12, color: T.muted, fontFamily: T.font }}>{d.c} purchase{d.c !== 1 ? "s" : ""}</div>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 17, fontWeight: 700, color: T.green }}>€{d.t.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Backup */}
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16, marginTop: 8 }}>
        <div style={sectionLabel}>Data backup</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => { const a = document.createElement("a"); a.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ inv, runs, exported: today() }, null, 2)); a.download = `mp2-backup-${today()}.json`; a.click(); }} style={pillStyle(false)}>Export (JSON)</button>
          <button onClick={() => impRef.current.click()} style={pillStyle(false)}>Import (JSON)</button>
          <input ref={impRef} type="file" accept=".json" style={{ display: "none" }} onChange={e => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = ev => { try { const d = JSON.parse(ev.target.result); if (d.inv) setInv(d.inv); if (d.runs) setRuns(d.runs); } catch { alert("Could not read file."); } }; r.readAsText(file); e.target.value = ""; }} />
        </div>
      </div>
    </div>
  );

  // ── Shell ────────────────────────────────────────────────────────
  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.font, color: T.text, padding: "0 16px" }}>
      {/* Header */}
      <div style={{ padding: "24px 0 8px", borderBottom: `1px solid ${T.border}`, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: T.green, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>MP Nr.2 · Evan</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: "-0.3px" }}>Meal Plan Tracker</div>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
        {[["grocery", "Grocery"], ["inventory", "Inventory"], ["spending", "Spending"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "10px 4px", border: tab === id ? `1px solid ${T.green}` : `1px solid ${T.border2}`, borderRadius: 10, background: tab === id ? T.greenDim : "transparent", fontSize: 13, fontWeight: 700, cursor: "pointer", color: tab === id ? T.green : T.muted, fontFamily: T.font, textAlign: "center", boxShadow: tab === id ? `0 0 12px ${T.greenGlow}` : "none", transition: "all 0.15s" }}>{label}</button>
        ))}
      </div>

      {tab === "grocery"   && <GroceryTab />}
      {tab === "inventory" && <InventoryTab />}
      {tab === "spending"  && <SpendingTab />}
    </div>
  );
}