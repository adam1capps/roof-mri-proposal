import { fetchAccounts, fetchWarrantyDb, fetchPricingStore, submitPricing as submitPricingApi, fetchAccessLogs, fetchInvoices, fetchInspections, fetchClaims, createOwner, addProperty, createClaim, createInspection, createAccessLog, createInvoice, register, login, getMe, sendPhoneCode, verifyPhone, ssoAuth, checkDemoData, clearDemoData, requestPasswordReset, resetPassword, convertToExamples } from "./api";
import { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════════════
   ROOF WARRANTY MANAGEMENT APP — Roof MRI Branded
   Tabs: Accounts · Warranties · Access Log · Invoices · Inspections · Claims
   Design: Navy/Green/White — Poppins + Montserrat
   ═══════════════════════════════════════════════════════════════════ */

// ── COLORS ─────────────────────────────────────────────────────────
const C = {
  green: "#00bd70", greenDk: "#00a35f", greenLt: "#e6f9f0", greenBg: "#f0fdf4",
  navy: "#1e2c55", navyLt: "#2a3d6e", navyDk: "#151f3d",
  white: "#ffffff", g50: "#f8f9fb", g100: "#f0f2f5", g200: "#dde1e8",
  g400: "#9ba3b5", g600: "#5a6377", g800: "#2d3344",
  yellow: "#f59e0b", yellowBg: "#fef9e7", yellowBdr: "#fbbf24",
  red: "#ef4444", redBg: "#fef2f2", redBdr: "#fca5a5",
  blue: "#3b82f6", blueBg: "#eff6ff",
  orange: "#f97316", orangeBg: "#fff7ed",
  purple: "#8b5cf6", purpleBg: "#f5f3ff",
  shadow: "0 1px 3px rgba(30,44,85,0.06)",
  shadowLg: "0 4px 16px rgba(30,44,85,0.10)",
  shadowXl: "0 12px 40px rgba(30,44,85,0.18)",
};

// ── FONTS ──────────────────────────────────────────────────────────
const F = { head: "'Poppins', sans-serif", body: "'Montserrat', sans-serif" };

// ── ICONS (SVG) ────────────────────────────────────────────────────
const Ic = {
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  chevR: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  chevD: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  back: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  building: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><path d="M9 18h6v4H9z"/></svg>,
  shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  qr: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><line x1="21" y1="14" x2="21" y2="17"/><line x1="14" y1="21" x2="17" y2="21"/></svg>,
  dollar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  clip: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  cal: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  user: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  mail: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  phone: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  file: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  flag: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  zap: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  upload: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  target: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  layers: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  star: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  starEmpty: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  x: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};
// ── UTILITIES ──────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const fmtMoney = (a) => `$${a.toLocaleString()}`;
const daysTo = (d) => Math.ceil((new Date(d) - new Date()) / 864e5);
const pctUsed = (s, e) => {
  const a = new Date(s).getTime(), b = new Date(e).getTime();
  return Math.min(100, Math.max(0, ((Date.now() - a) / (b - a)) * 100));
};
const termYears = (s, e) => Math.round((new Date(e) - new Date(s)) / (365.25 * 864e5));

// (Data is now fetched from the API — see api.js)
// ── HELPERS ─────────────────────────────────────────────────────────
const allRoofs = (owners) => {
  const out = [];
  (owners || []).forEach(o => o.properties.forEach(p => p.roofs.forEach(r => out.push({ ...r, propName: p.name, propAddr: p.address, ownerName: o.name }))));
  return out;
};
const findRoof = (owners, id) => allRoofs(owners).find(r => r.id === id);

// ── BADGE ──────────────────────────────────────────────────────────
const badgeStyles = {
  active: { bg: C.greenLt, c: C.greenDk, dot: C.green },
  current: { bg: C.greenLt, c: C.greenDk, dot: C.green },
  completed: { bg: C.greenLt, c: C.greenDk, dot: C.green },
  approved: { bg: C.greenLt, c: C.greenDk, dot: C.green },
  paid: { bg: C.greenLt, c: C.greenDk, dot: C.green },
  warranty: { bg: C.blueBg, c: C.blue, dot: C.blue },
  "at-risk": { bg: C.yellowBg, c: "#b45309", dot: C.yellow },
  review: { bg: C.yellowBg, c: "#b45309", dot: C.yellow },
  "in-progress": { bg: C.blueBg, c: "#1d4ed8", dot: C.blue },
  scheduled: { bg: C.blueBg, c: "#1d4ed8", dot: C.blue },
  "expired-inspection": { bg: C.redBg, c: "#dc2626", dot: C.red },
  overdue: { bg: C.redBg, c: "#dc2626", dot: C.red },
  pending: { bg: C.g100, c: C.g600, dot: C.g400 },
};

const Badge = ({ status, label }) => {
  const s = badgeStyles[status] || badgeStyles.pending;
  const txt = label || status.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.c, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, fontFamily: F.head, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />{txt}
    </span>
  );
};

// ── KPI CARD ───────────────────────────────────────────────────────
const KPI = ({ label, value, icon, color, sub }) => (
  <div style={{ background: C.white, border: `1.5px solid ${C.g100}`, borderRadius: 14, padding: "18px 20px", boxShadow: C.shadow }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: F.head }}>{label}</span>
      <span style={{ color: color || C.green }}>{icon}</span>
    </div>
    <div style={{ fontSize: 24, fontWeight: 800, color: C.navy, fontFamily: F.head }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: C.g400, marginTop: 4, fontFamily: F.body }}>{sub}</div>}
  </div>
);

const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{ background: C.white, border: `1.5px solid ${C.g100}`, borderRadius: 14, padding: 20, boxShadow: C.shadow, cursor: onClick ? "pointer" : "default", transition: "all 0.15s ease", ...style }}>{children}</div>
);

const Btn = ({ children, primary, small, onClick, style: s }) => (
  <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: small ? "6px 12px" : "10px 18px", borderRadius: 10, background: primary ? C.green : C.white, border: primary ? "none" : `1.5px solid ${C.g200}`, color: primary ? C.white : C.navy, fontSize: small ? 12 : 13, fontWeight: 700, fontFamily: F.head, cursor: "pointer", transition: "all 0.15s ease", ...s }}>{children}</button>
);

const Info = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 10, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: F.head }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, fontFamily: F.body }}>{value}</div>
  </div>
);

const FormField = ({ label, value, onChange, placeholder, type = "text", required, options }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.g600, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F.head, marginBottom: 6 }}>{label}{required && <span style={{ color: C.red }}> *</span>}</label>
    {options ? (
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.g200}`, background: C.white, fontSize: 14, fontFamily: F.body, color: C.navy, outline: "none" }}>
        <option value="">{placeholder || "Select..."}</option>
        {options.map(o => typeof o === "object" ? <option key={o.value} value={o.value}>{o.label}</option> : <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.g200}`, background: C.white, fontSize: 14, fontFamily: F.body, color: C.navy, outline: "none", boxSizing: "border-box" }} />
    )}
  </div>
);

// ── CORPORATE BACKING TIERS ───────────────────────────────────────
const CORP_TIER = {
  "Sika Sarnafil": 5, "GAF": 5, "Carlisle": 5, "Carlisle (Henry)": 5,
  "Sherwin-Williams (UNIFLEX)": 5, "Polyglass (MAPEI)": 4,
  "Tropical (SOPREMA)": 4, "Firestone": 4, "Versico": 3,
  "GACO (Amrize)": 3, "American WeatherStar": 3, "APOC": 3,
  "KARNAK": 2, "Everest Systems": 2, "FAR (Fluid Applied Roofing)": 2,
};

// (Pricing data is now fetched from the API)

const getMedian = (arr) => {
  if (!arr || arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const getPricingSummary = (pricingStore, warrantyId) => {
  const data = pricingStore[warrantyId];
  if (!data) return { baseFee: null, psfFee: null, submissions: 0, sufficient: false };
  const activeBase = data.baseFee.filter(s => s.status === "active");
  const activePsf = data.psfFee.filter(s => s.status === "active");
  const count = Math.min(activeBase.length, activePsf.length);
  return {
    baseFee: count >= 3 ? getMedian(activeBase.map(s => s.amount)) : null,
    psfFee: count >= 3 ? getMedian(activePsf.map(s => s.amount)) : null,
    submissions: count,
    sufficient: count >= 3,
  };
};
const doSubmitPricing = async (pricingStore, setPricingStore, warrantyId, baseFee, psfFee) => {
  const now = new Date().toISOString();
  // Optimistic local update
  const newStore = { ...pricingStore };
  if (!newStore[warrantyId]) newStore[warrantyId] = { baseFee: [], psfFee: [] };
  if (baseFee > 0) newStore[warrantyId].baseFee.push({ amount: baseFee, submittedAt: now, status: "active" });
  if (psfFee > 0) newStore[warrantyId].psfFee.push({ amount: psfFee, submittedAt: now, status: "active" });
  setPricingStore(newStore);
  // Persist to API
  submitPricingApi({ warrantyId, baseFee, psfFee }).catch(err => console.warn("[API] Pricing submit error:", err));
};

// (WARRANTY_DB is now fetched from the API)

const Stars = ({ n, max = 10 }) => {
  const filled = Math.round(n / 2);
  return <span style={{ display: "inline-flex", gap: 2 }}>{[...Array(5)].map((_, i) => <span key={i} style={{ color: i < filled ? C.yellow : C.g200 }}>{i < filled ? Ic.star : Ic.starEmpty}</span>)}</span>;
};
// WarrantyAnalyzer – full 3-path wizard
function WarrantyAnalyzer({ open, onClose, WARRANTY_DB }) {
  const [path, setPath] = useState(null);
  const [step, setStep] = useState(0);
  const [propName, setPropName] = useState("");
  const [propAddr, setPropAddr] = useState("");
  const [propType, setPropType] = useState("Commercial");
  const [roofType, setRoofType] = useState("");
  const [roofAge, setRoofAge] = useState("");
  const [roofSqft, setRoofSqft] = useState("");
  const [roofMembrane, setRoofMembrane] = useState("");
  const [setupDone, setSetupDone] = useState(false);
  const [compIds, setCompIds] = useState([]);
  const [compFilter, setCompFilter] = useState("");
  const [recMembrane, setRecMembrane] = useState("");
  const [recBudget, setRecBudget] = useState("mid");
  const [recTerm, setRecTerm] = useState(15);
  const [recResults, setRecResults] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  // AI Warranty Assistant state
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiViewMode, setAiViewMode] = useState("concise");
  const [showSaved, setShowSaved] = useState(false);
  const [savedSpecs, setSavedSpecs] = useState(() => { try { return JSON.parse(localStorage.getItem("wai_saved") || "[]"); } catch { return []; } });
  const [aiInsights, setAiInsights] = useState(() => { try { return JSON.parse(localStorage.getItem("wai_insights") || '{"helpful":{},"queries":[]}'); } catch { return { helpful: {}, queries: [] }; } });
  const [aiTyping, setAiTyping] = useState(false);
  const [expandedAiCards, setExpandedAiCards] = useState({});
  const [showAllResults, setShowAllResults] = useState({});

  if (!open) return null;

  const toggleAiCard = (wId) => setExpandedAiCards(prev => ({ ...prev, [wId]: !prev[wId] }));
  const toggleShowAll = (msgId) => setShowAllResults(prev => ({ ...prev, [msgId]: !prev[msgId] }));

  const reset = () => { setPath(null); setStep(0); setPropName(""); setPropAddr(""); setPropType("Commercial"); setRoofType(""); setRoofAge(""); setRoofSqft(""); setRoofMembrane(""); setSetupDone(false); setCompIds([]); setCompFilter(""); setRecMembrane(""); setRecBudget("mid"); setRecTerm(15); setRecResults(null); setExpandedId(null); setAiMessages([]); setAiInput(""); setAiViewMode("concise"); setShowSaved(false); setAiTyping(false); setExpandedAiCards({}); setShowAllResults({}); };

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  // ── AI ASSISTANT ENGINE ────────────────────────────────────────
  const persistInsights = (next) => { setAiInsights(next); localStorage.setItem("wai_insights", JSON.stringify(next)); };
  const persistSaved = (next) => { setSavedSpecs(next); localStorage.setItem("wai_saved", JSON.stringify(next)); };

  const parseContractorQuery = (text) => {
    const lower = text.toLowerCase();
    const intent = { membranes: [], manufacturers: [], minTerm: null, budget: null, keywords: [], askingSpecs: false, askingInspection: false, askingStrengths: false };
    const membraneMap = { tpo: "TPO", pvc: "PVC", epdm: "EPDM", "mod bit": "Mod Bit", "modified bitumen": "Mod Bit", bur: "BUR", "built-up": "BUR", acrylic: "Acrylic", silicone: "Silicone", spf: "SPF", "spray foam": "SPF" };
    Object.entries(membraneMap).forEach(([k, v]) => { if (lower.includes(k) && !intent.membranes.includes(v)) intent.membranes.push(v); });
    const knownMfrs = [...new Set(WARRANTY_DB.map(w => w.manufacturer))];
    knownMfrs.forEach(m => { if (lower.includes(m.toLowerCase())) intent.manufacturers.push(m); });
    const termMatch = lower.match(/(\d+)\s*[-\s]?\s*(?:year|yr)/);
    if (termMatch) intent.minTerm = parseInt(termMatch[1]);
    if (/cheap|budget|economy|affordable|low.?cost/.test(lower)) intent.budget = "low";
    if (/premium|best|top|high.?end|deluxe/.test(lower)) intent.budget = "high";
    if (/spec|specification|requirement|need|install/.test(lower)) intent.askingSpecs = true;
    if (/inspect|maintenance|check/.test(lower)) intent.askingInspection = true;
    if (/strength|advantage|pro|benefit|good/.test(lower)) intent.askingStrengths = true;
    if (/weak|disadvantage|con|downside|bad|issue/.test(lower)) intent.askingStrengths = true;
    return intent;
  };

  const matchWarranties = (intent) => {
    let pool = [...WARRANTY_DB];
    if (intent.membranes.length) pool = pool.filter(w => (w.membranes || []).some(m => intent.membranes.includes(m)));
    if (intent.manufacturers.length) pool = pool.filter(w => intent.manufacturers.includes(w.manufacturer));
    if (intent.minTerm) pool = pool.filter(w => w.term >= intent.minTerm * 0.8);
    if (intent.budget === "low") pool = pool.filter(w => w.rating <= 7);
    if (intent.budget === "high") pool = pool.filter(w => w.rating >= 8);
    // Boost warranties that contractors found helpful
    const helpful = aiInsights.helpful || {};
    pool.sort((a, b) => {
      const ha = helpful[a.id] || 0, hb = helpful[b.id] || 0;
      if (hb !== ha) return hb - ha;
      return b.rating - a.rating;
    });
    return pool;
  };

  const generateAiResponse = (text, matches, intent) => {
    if (matches.length === 0) return "I couldn't find any warranties matching your criteria. Try broadening your search — for example, mention a membrane type (TPO, PVC, EPDM), a manufacturer, or a term length.";
    const memStr = intent.membranes.length ? intent.membranes.join("/") : "all membrane types";
    const mfrStr = intent.manufacturers.length ? intent.manufacturers.join(", ") : "";
    const termStr = intent.minTerm ? `${intent.minTerm}+ year` : "";
    let intro = `Found ${matches.length} warrant${matches.length > 1 ? "ies" : "y"} matching`;
    const parts = [];
    if (mfrStr) parts.push(mfrStr);
    parts.push(memStr);
    if (termStr) parts.push(termStr + " term");
    intro += " " + parts.join(" · ") + ".";
    if (matches.length > 5) intro += ` Showing top 5 of ${matches.length}.`;
    const helpful = aiInsights.helpful || {};
    const anyHelpful = matches.some(w => (helpful[w.id] || 0) >= 1);
    if (anyHelpful) intro += " Results include warranties other contractors have found helpful.";
    if (intent.askingSpecs) intro += " Here are the full specs:";
    else if (intent.askingInspection) intro += " Inspection details included below:";
    return intro;
  };

  const handleAiSend = (overrideText) => {
    const text = (overrideText || aiInput).trim();
    if (!text) return;
    const userMsg = { id: Date.now(), role: "user", text, ts: new Date().toISOString() };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput("");
    setAiTyping(true);
    // Track query
    const nextInsights = { ...aiInsights, queries: [...(aiInsights.queries || []), { q: text, ts: new Date().toISOString() }] };
    persistInsights(nextInsights);
    // Simulate processing delay
    setTimeout(() => {
      const intent = parseContractorQuery(text);
      const matches = matchWarranties(intent);
      const reply = generateAiResponse(text, matches, intent);
      const assistantMsg = { id: Date.now() + 1, role: "assistant", text: reply, warranties: matches, intent, ts: new Date().toISOString(), ratings: {} };
      setAiMessages(prev => [...prev, assistantMsg]);
      setAiTyping(false);
    }, 600 + Math.random() * 400);
  };

  const rateWarranty = (msgId, warrantyId, positive) => {
    setAiMessages(prev => prev.map(m => m.id === msgId ? { ...m, ratings: { ...(m.ratings || {}), [warrantyId]: positive } } : m));
    if (positive) {
      const next = { ...aiInsights, helpful: { ...(aiInsights.helpful || {}), [warrantyId]: ((aiInsights.helpful || {})[warrantyId] || 0) + 1 } };
      persistInsights(next);
    }
  };

  const saveSpecFromMsg = (msg) => {
    const entry = { id: Date.now(), query: aiMessages.find(m => m.role === "user" && m.id < msg.id)?.text || "Saved spec", warranties: msg.warranties || [], ts: new Date().toISOString() };
    const next = [entry, ...savedSpecs];
    persistSaved(next);
  };

  const deleteSavedSpec = (specId) => { persistSaved(savedSpecs.filter(s => s.id !== specId)); };

  const downloadSpecPdf = (warranties, title) => {
    const rows = warranties.map(w => `
      <div style="border:1px solid #ccc;border-radius:8px;padding:16px;margin-bottom:12px;page-break-inside:avoid">
        <h3 style="margin:0 0 4px;color:#0B1F3F">${w.manufacturer} | ${(w.membranes||[]).join(", ")} | ${w.term} Year</h3>
        <p style="margin:0 0 10px;color:#666;font-size:12px">${w.name}</p>
        <table style="width:100%;font-size:12px;border-collapse:collapse">
          <tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Rating</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">${w.rating}/10</td></tr>
          <tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>NDL</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">${w.ndl?"Yes":"No"}</td></tr>
          <tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Labor Covered</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">${w.laborCovered?"Yes":"No"}</td></tr>
          <tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Material Covered</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">${w.materialCovered?"Yes":"No"}</td></tr>
          <tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Consequential Damages</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">${w.consequential?"Yes":"No"}</td></tr>
          <tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Dollar Cap</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">${w.dollarCap||"N/A"}</td></tr>
          <tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Transferable</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">${w.transferable?"Yes":"No"}</td></tr>
          <tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Ponding Excluded</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">${w.pondingExcluded?"Yes":"No"}</td></tr>
          <tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Wind Limit</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">${w.windLimit||"Standard"}</td></tr>
          <tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Hail Coverage</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">${w.hailCoverage||"Standard"}</td></tr>
          ${w.thickness?'<tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Thickness</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">'+w.thickness+'</td></tr>':''}
          ${w.installationMethod?'<tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Install Method</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">'+w.installationMethod+'</td></tr>':''}
          <tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Inspection Freq</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">${w.inspFreq||"N/A"}</td></tr>
          <tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Inspected By</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">${w.inspBy||"N/A"}</td></tr>
          <tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Membranes</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">${(w.membranes||[]).join(", ")}</td></tr>
          <tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Category</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">${w.category}</td></tr>
          ${w.recoverEligible!=null?'<tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Re-cover Eligible</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">'+(w.recoverEligible?"Yes":"No")+'</td></tr>':''}
          ${w.warrantyFeePerSq?'<tr><td style="padding:4px 8px;border-bottom:1px solid #eee"><b>Warranty Fee</b></td><td style="padding:4px 8px;border-bottom:1px solid #eee">$'+w.warrantyFeePerSq+'/sq</td></tr>':''}
        </table>
        ${(w.strengths||[]).length ? '<p style="margin:8px 0 2px;font-weight:bold;color:#388e3c;font-size:12px">Strengths</p><ul style="margin:0;padding-left:18px;font-size:12px">' + w.strengths.map(s=>'<li>'+s+'</li>').join('') + '</ul>' : ''}
        ${(w.weaknesses||[]).length ? '<p style="margin:8px 0 2px;font-weight:bold;color:#d32f2f;font-size:12px">Weaknesses</p><ul style="margin:0;padding-left:18px;font-size:12px">' + w.weaknesses.map(s=>'<li>'+s+'</li>').join('') + '</ul>' : ''}
        ${w.bestFor ? '<p style="margin:8px 0 0;font-style:italic;font-size:12px;color:#666">Best for: '+w.bestFor+'</p>' : ''}
      </div>
    `).join("");
    const html = '<!DOCTYPE html><html><head><title>Warranty Spec Sheet</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:24px;color:#333}@media print{body{padding:12px}}</style></head><body><h1 style="color:#0B1F3F;font-size:20px;margin-bottom:4px">Warranty Spec Sheet</h1><p style="color:#666;font-size:13px;margin-bottom:20px">' + title + ' &mdash; Generated ' + new Date().toLocaleDateString() + '</p>' + rows + '<p style="text-align:center;color:#aaa;font-size:10px;margin-top:24px">Generated by RoofTracker Warranty Management</p></body></html>';
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  };

  const AI_SUGGESTIONS = [
    "I have a TPO roof — what's the best 20-year warranty?",
    "What are the inspection requirements for GAF warranties?",
    "Show me Carlisle PVC warranty specs",
    "Best budget-friendly EPDM warranty options?",
    "Which warranties cover consequential damages?",
    "Compare Sika Sarnafil vs Carlisle for PVC roofs",
  ];

  const WarrantyExpand = ({ w }) => (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.g200}` }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 6, marginBottom: 12 }}>
        {[
          ["Labor Covered", w.laborCovered, false],
          ["Material Covered", w.materialCovered, false],
          ["Consequential", w.consequential, false],
          ["Transferable", w.transferable, false],
          ["Ponding Excluded", w.pondingExcluded, true],
          ["NDL", w.ndl, false],
          ["Re-cover Eligible", w.recoverEligible, false],
        ].filter(([, val]) => val !== null && val !== undefined).map(([label, val, invert]) => (
          <div key={label} style={{ fontSize: 11, fontFamily: F.body, color: C.g600 }}>
            <span>{(invert ? !val : val) ? "✅" : "❌"}</span> {label}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, marginBottom: 12 }}>
        {[
          ["Dollar Cap", w.dollarCap || "N/A"],
          ["Wind Limit", w.windLimit || "Standard"],
          ["Inspection Freq", w.inspFreq || "N/A"],
          ["Inspected By", w.inspBy || "N/A"],
          ["Category", w.category],
          ["Membranes", (w.membranes || []).join(", ")],
          ["Thickness", w.thickness],
          ["Install Method", w.installationMethod],
          ["Hail Coverage", w.hailCoverage],
          ["Warranty Fee", w.warrantyFeePerSq ? `$${w.warrantyFeePerSq}/sq` : null],
          ["Product Lines", w.productLines],
        ].filter(([, val]) => val).map(([label, val]) => (
          <div key={label}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.g400, fontFamily: F.head, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 12, color: C.navy, fontFamily: F.body }}>{val}</div>
          </div>
        ))}
      </div>
      {(w.strengths || []).length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.green, fontFamily: F.head, marginBottom: 4 }}>Strengths</div>
          {w.strengths.map((s, i) => <div key={i} style={{ fontSize: 12, color: C.g600, fontFamily: F.body, marginBottom: 2, paddingLeft: 14, position: "relative" }}><span style={{ color: C.green, position: "absolute", left: 0 }}>✓</span> {s}</div>)}
        </div>
      )}
      {(w.weaknesses || []).length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.red, fontFamily: F.head, marginBottom: 4 }}>Weaknesses</div>
          {w.weaknesses.map((s, i) => <div key={i} style={{ fontSize: 12, color: C.g600, fontFamily: F.body, marginBottom: 2, paddingLeft: 14, position: "relative" }}><span style={{ color: C.red, position: "absolute", left: 0 }}>✕</span> {s}</div>)}
        </div>
      )}
      {w.bestFor && <div style={{ fontSize: 12, color: C.g600, fontFamily: F.body, fontStyle: "italic", marginTop: 4 }}>Best for: {w.bestFor}</div>}
      {w.notes && <div style={{ fontSize: 11, color: C.g500, fontFamily: F.body, marginTop: 6 }}>Note: {w.notes}</div>}
      {w.referenceUrl && <a href={w.referenceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: C.blue, fontFamily: F.body, marginTop: 4, display: "inline-block" }}>Manufacturer website →</a>}
    </div>
  );

  const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 };
  const modal = { background: C.white, borderRadius: 20, padding: 32, maxWidth: 820, width: "95vw", maxHeight: "90vh", overflowY: "auto", position: "relative" };
  const closeModal = () => { reset(); onClose(); };

  // ---- PATH SELECTION ----
  if (!path) return (
    <div style={overlay} onClick={closeModal}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: 0 }}>Warranty Analyzer</h2>
          <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.g400 }}>×</button>
        </div>
        <p style={{ fontSize: 14, color: C.g600, fontFamily: F.body, marginBottom: 28 }}>Select a workflow to begin analyzing warranty options for your properties.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { id: "setup", icon: Ic.accounts, title: "New Property Setup", desc: "Register a new property and configure roof sections for warranty tracking." },
            { id: "compare", icon: Ic.warranties, title: "Warranty Comparison", desc: "Compare up to 4 warranties side by side across key coverage dimensions." },
            { id: "recommend", icon: Ic.inspections, title: "Warranty Recommendation", desc: "Get AI-matched warranty suggestions based on roof profile and budget." },
            { id: "ai", icon: Ic.zap, title: "AI Spec Assistant", desc: "Ask questions in plain English. Get spec sheets, coverage details, and save answers for later." }
          ].map(p => (
            <button key={p.id} onClick={() => setPath(p.id)} style={{ background: C.white, border: "2px solid " + C.g200, borderRadius: 14, padding: 20, textAlign: "left", cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.background = C.g50; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.g200; e.currentTarget.style.background = C.white; }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{p.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: F.head, marginBottom: 6 }}>{p.title}</div>
              <div style={{ fontSize: 12, color: C.g600, fontFamily: F.body, lineHeight: 1.5 }}>{p.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ---- NEW PROPERTY SETUP ----
  if (path === "setup") {
    const setupSteps = ["Property Info", "Roof Details", "Confirm & Save"];
    const canNext = step === 0 ? propName && propAddr : step === 1 ? roofType && roofSqft && roofMembrane : true;

    if (setupDone) return (
      <div style={overlay} onClick={closeModal}>
        <div style={modal} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, fontFamily: F.head, marginBottom: 12 }}>Property Registered!</h2>
            <p style={{ fontSize: 14, color: C.g600, fontFamily: F.body, marginBottom: 8 }}><strong>{propName}</strong> at {propAddr}</p>
            <p style={{ fontSize: 13, color: C.g600, fontFamily: F.body, marginBottom: 24 }}>{roofType} roof · {Number(roofSqft).toLocaleString()} sq ft · {roofMembrane} membrane</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Btn onClick={() => { reset(); setPath("recommend"); }}>Get Warranty Recommendation</Btn>
              <Btn secondary onClick={closeModal}>Done</Btn>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div style={overlay} onClick={closeModal}>
        <div style={modal} onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: 0 }}>{Ic.accounts} New Property Setup</h2>
            <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.g400 }}>×</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {setupSteps.map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: 4, borderRadius: 2, background: i <= step ? C.green : C.g200, marginBottom: 6 }} />
                <span style={{ fontSize: 11, color: i <= step ? C.navy : C.g400, fontFamily: F.body, fontWeight: i === step ? 700 : 400 }}>{s}</span>
              </div>
            ))}
          </div>
          {step === 0 && (
            <div style={{ display: "grid", gap: 16 }}>
              <FormField label="Property Name" value={propName} onChange={setPropName} placeholder="e.g. Riverside Medical Center" />
              <FormField label="Street Address" value={propAddr} onChange={setPropAddr} placeholder="e.g. 123 Main St, Nashville TN" />
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.navy, fontFamily: F.body, marginBottom: 4 }}>Property Type</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Commercial", "Industrial", "Institutional", "Multi-Family"].map(t => (
                    <button key={t} onClick={() => setPropType(t)} style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid " + (propType === t ? C.green : C.g200), background: propType === t ? C.g50 : C.white, color: propType === t ? C.navy : C.g600, fontFamily: F.body, fontSize: 12, fontWeight: propType === t ? 700 : 400, cursor: "pointer" }}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 1 && (
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.navy, fontFamily: F.body, marginBottom: 4 }}>Roof System Type</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["Flat/Low-Slope", "Metal Standing Seam", "Built-Up (BUR)", "Modified Bitumen", "Green Roof", "Steep Slope"].map(t => (
                    <button key={t} onClick={() => setRoofType(t)} style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid " + (roofType === t ? C.green : C.g200), background: roofType === t ? C.g50 : C.white, color: roofType === t ? C.navy : C.g600, fontFamily: F.body, fontSize: 12, fontWeight: roofType === t ? 700 : 400, cursor: "pointer" }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <FormField label="Roof Age (years)" value={roofAge} onChange={setRoofAge} placeholder="e.g. 5" />
                <FormField label="Total Sq Footage" value={roofSqft} onChange={setRoofSqft} placeholder="e.g. 45000" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.navy, fontFamily: F.body, marginBottom: 4 }}>Primary Membrane</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["TPO", "EPDM", "PVC", "Acrylic", "Silicone", "Asphaltic", "Metal"].map(m => (
                    <button key={m} onClick={() => setRoofMembrane(m)} style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid " + (roofMembrane === m ? C.green : C.g200), background: roofMembrane === m ? C.g50 : C.white, color: roofMembrane === m ? C.navy : C.g600, fontFamily: F.body, fontSize: 12, fontWeight: roofMembrane === m ? 700 : 400, cursor: "pointer" }}>{m}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div style={{ background: C.g50, borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, fontFamily: F.head, marginBottom: 16 }}>Review Property Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13, fontFamily: F.body }}>
                <Info label="Property Name" value={propName} />
                <Info label="Address" value={propAddr} />
                <Info label="Property Type" value={propType} />
                <Info label="Roof System" value={roofType} />
                <Info label="Roof Age" value={roofAge ? roofAge + " years" : "Not specified"} />
                <Info label="Square Footage" value={roofSqft ? Number(roofSqft).toLocaleString() + " sq ft" : "Not specified"} />
                <Info label="Membrane" value={roofMembrane} />
              </div>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            <Btn secondary onClick={() => step === 0 ? setPath(null) : setStep(step - 1)}>{step === 0 ? "← Back to Menu" : "← Previous"}</Btn>
            {step < 2 ? (
              <Btn primary onClick={() => setStep(step + 1)} style={{ opacity: canNext ? 1 : 0.4, pointerEvents: canNext ? "auto" : "none" }}>Next →</Btn>
            ) : (
              <Btn primary onClick={() => setSetupDone(true)}>✅ Register Property</Btn>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- WARRANTY COMPARISON ----
  if (path === "compare") {
    const filtered = WARRANTY_DB.filter(w => !compFilter || w.name.toLowerCase().includes(compFilter.toLowerCase()) || (w.manufacturer || "").toLowerCase().includes(compFilter.toLowerCase()) || (w.membranes || []).some(m => m.toLowerCase().includes(compFilter.toLowerCase())));
    const selected = WARRANTY_DB.filter(w => compIds.includes(w.id));
    const toggleComp = (id) => setCompIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);

    return (
      <div style={overlay} onClick={closeModal}>
        <div style={{...modal, maxWidth: 960}} onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: 0 }}>{Ic.warranties} Warranty Comparison</h2>
            <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.g400 }}>×</button>
          </div>

          {step === 0 ? (
            <div>
              <p style={{ fontSize: 13, color: C.g600, fontFamily: F.body, marginBottom: 16 }}>Select up to 4 warranties to compare side by side.</p>
              <input value={compFilter} onChange={e => setCompFilter(e.target.value)} placeholder="Search warranties..." style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid " + C.g200, fontFamily: F.body, fontSize: 13, marginBottom: 16, boxSizing: "border-box" }} />
              <div style={{ maxHeight: 500, overflowY: "auto", display: "grid", gap: 8 }}>
                {filtered.map(w => (
                  <div key={w.id} style={{ borderRadius: 10, border: "1.5px solid " + (compIds.includes(w.id) ? C.green : expandedId === w.id ? C.blue : C.g200), background: compIds.includes(w.id) ? C.g50 : C.white, textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 12 }}>
                      <div onClick={(e) => { e.stopPropagation(); toggleComp(w.id); }} style={{ width: 20, height: 20, borderRadius: 4, border: "2px solid " + (compIds.includes(w.id) ? C.green : C.g300), background: compIds.includes(w.id) ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>{compIds.includes(w.id) ? "✓" : ""}</div>
                      <div onClick={() => toggleExpand(w.id)} style={{ flex: 1, cursor: "pointer" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, fontFamily: F.body }}>{w.manufacturer} | {(w.membranes||[]).join(", ")} | {w.term} Year</div>
                        <div style={{ fontSize: 11, color: C.g500, fontFamily: F.body }}>{w.name} · Rating: {w.rating}/10</div>
                      </div>
                      <div onClick={() => toggleExpand(w.id)} style={{ cursor: "pointer", color: C.g400, transform: expandedId === w.id ? "rotate(90deg)" : "none", transition: "transform 0.15s ease", flexShrink: 0 }}>{Ic.chevR}</div>
                    </div>
                    {expandedId === w.id && <div style={{ padding: "0 16px 14px" }}><WarrantyExpand w={w} /></div>}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                <Btn secondary onClick={() => setPath(null)}>← Back</Btn>
                <Btn primary onClick={() => setStep(1)} style={{ opacity: compIds.length >= 2 ? 1 : 0.4, pointerEvents: compIds.length >= 2 ? "auto" : "none" }}>Compare {compIds.length} Warranties →</Btn>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F.body, fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: C.g50 }}>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: C.navy, borderBottom: "2px solid " + C.g200 }}>Feature</th>
                      {selected.map(w => <th key={w.id} style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: C.navy, borderBottom: "2px solid " + C.g200, minWidth: 140 }}><div>{w.manufacturer} | {w.term}yr</div><div style={{ fontSize: 10, fontWeight: 400, color: C.g500 }}>{(w.membranes||[]).join(", ")}</div><div style={{ fontSize: 9, fontWeight: 400, color: C.g400 }}>{w.name}</div></th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Manufacturer", fn: w => w.manufacturer },
                      { label: "Term", fn: w => w.term + " years" },
                      { label: "Rating", fn: w => w.rating + "/10" },
                      { label: "NDL", fn: w => w.ndl ? "✅ Yes" : "❌ No" },
                      { label: "Labor Covered", fn: w => w.laborCovered ? "✅" : "❌" },
                      { label: "Material Covered", fn: w => w.materialCovered ? "✅" : "❌" },
                      { label: "Consequential", fn: w => w.consequential ? "✅" : "❌" },
                      { label: "Dollar Cap", fn: w => w.dollarCap || "N/A" },
                      { label: "Transferable", fn: w => w.transferable ? "✅" : "❌" },
                      { label: "Ponding Excluded", fn: w => w.pondingExcluded ? "⚠️ Yes" : "✅ No" },
                      { label: "Wind Limit", fn: w => w.windLimit || "Standard" },
                      { label: "Hail Coverage", fn: w => w.hailCoverage || "Standard" },
                      { label: "Thickness", fn: w => w.thickness || "N/A" },
                      { label: "Install Method", fn: w => w.installationMethod || "N/A" },
                      { label: "Inspection Freq", fn: w => w.inspFreq || "N/A" },
                      { label: "Inspected By", fn: w => w.inspBy || "N/A" },
                      { label: "Membranes", fn: w => (w.membranes || []).join(", ") },
                      { label: "Re-cover Eligible", fn: w => w.recoverEligible ? "✅ Yes" : w.recoverEligible === false ? "❌ No" : "N/A" },
                      { label: "Warranty Fee", fn: w => w.warrantyFeePerSq ? `$${w.warrantyFeePerSq}/sq` : "N/A" },
                      { label: "Best For", fn: w => w.bestFor || "N/A" },
                    ].map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? C.white : C.g50 }}>
                        <td style={{ padding: "8px 12px", fontWeight: 600, color: C.navy, borderBottom: "1px solid " + C.g100 }}>{row.label}</td>
                        {selected.map(w => <td key={w.id} style={{ padding: "8px 12px", textAlign: "center", color: C.g700, borderBottom: "1px solid " + C.g100 }}>{row.fn(w)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                <Btn secondary onClick={() => { setStep(0); setCompIds([]); }}>← Pick Different</Btn>
                <Btn secondary onClick={closeModal}>Done</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- WARRANTY RECOMMENDATION ----
  if (path === "recommend") {
    const membranes = [...new Set(WARRANTY_DB.flatMap(w => w.membranes || []))].sort();
    const getRecommendations = () => {
      let matches = WARRANTY_DB.filter(w => !recMembrane || (w.membranes || []).includes(recMembrane));
      if (recTerm) matches = matches.filter(w => w.term >= Number(recTerm) * 0.7);
      matches = matches.sort((a, b) => b.rating - a.rating).slice(0, 5);
      setRecResults(matches);
      setStep(1);
    };

    if (step === 0) return (
      <div style={overlay} onClick={closeModal}>
        <div style={modal} onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: 0 }}>{Ic.inspections} Warranty Recommendation</h2>
            <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.g400 }}>×</button>
          </div>
          <p style={{ fontSize: 13, color: C.g600, fontFamily: F.body, marginBottom: 20 }}>Tell us about your roof and we will match the best warranty options from our database of {WARRANTY_DB.length}+ warranties.</p>
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.navy, fontFamily: F.body, marginBottom: 6 }}>Primary Membrane Type</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {membranes.map(m => (
                  <button key={m} onClick={() => setRecMembrane(recMembrane === m ? "" : m)} style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid " + (recMembrane === m ? C.green : C.g200), background: recMembrane === m ? C.g50 : C.white, color: recMembrane === m ? C.navy : C.g600, fontFamily: F.body, fontSize: 12, fontWeight: recMembrane === m ? 700 : 400, cursor: "pointer" }}>{m}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.navy, fontFamily: F.body, marginBottom: 6 }}>Budget Range</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[["low", "💰 Economy"], ["mid", "⭐ Mid-Range"], ["high", "💎 Premium"]].map(([v, lbl]) => (
                  <button key={v} onClick={() => setRecBudget(v)} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid " + (recBudget === v ? C.green : C.g200), background: recBudget === v ? C.g50 : C.white, color: recBudget === v ? C.navy : C.g600, fontFamily: F.body, fontSize: 12, fontWeight: recBudget === v ? 700 : 400, cursor: "pointer", textAlign: "center" }}>{lbl}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.navy, fontFamily: F.body, marginBottom: 6 }}>Minimum Term (years): {recTerm}</label>
              <input type="range" min={5} max={30} step={5} value={recTerm} onChange={e => setRecTerm(Number(e.target.value))} style={{ width: "100%", accentColor: C.green }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.g400, fontFamily: F.body }}><span>5yr</span><span>10yr</span><span>15yr</span><span>20yr</span><span>25yr</span><span>30yr</span></div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            <Btn secondary onClick={() => setPath(null)}>← Back</Btn>
            <Btn primary onClick={getRecommendations}>Get Recommendations →</Btn>
          </div>
        </div>
      </div>
    );

    // Results view
    return (
      <div style={overlay} onClick={closeModal}>
        <div style={{...modal, maxWidth: 900}} onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: 0 }}>Top Warranty Matches</h2>
            <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.g400 }}>×</button>
          </div>
          <p style={{ fontSize: 13, color: C.g600, fontFamily: F.body, marginBottom: 20 }}>
            {recResults && recResults.length} warranties matched{recMembrane ? " for " + recMembrane + " membrane" : ""} with {recTerm}+ year term.
          </p>
          <div style={{ display: "grid", gap: 14 }}>
            {(recResults || []).map((w, i) => (
              <div key={w.id} onClick={() => toggleExpand(w.id)} style={{ border: "1.5px solid " + (i === 0 ? C.green : expandedId === w.id ? C.blue : C.g200), borderRadius: 14, padding: 18, background: i === 0 ? C.g50 : C.white, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      {i === 0 && <span style={{ background: C.green, color: C.white, padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: F.body }}>BEST MATCH</span>}
                      <span style={{ fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: F.head }}>{w.manufacturer} | {(w.membranes||[]).join(", ")} | {w.term} Year</span>
                    </div>
                    <span style={{ fontSize: 12, color: C.g500, fontFamily: F.body }}>{w.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ textAlign: "right" }}>
                      <Stars n={w.rating} />
                      <div style={{ fontSize: 11, color: C.g500, fontFamily: F.body }}>{w.rating}/10</div>
                    </div>
                    <div style={{ color: C.g400, transform: expandedId === w.id ? "rotate(90deg)" : "none", transition: "transform 0.15s ease" }}>{Ic.chevR}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: expandedId === w.id ? 0 : 10 }}>
                  {w.ndl && <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: F.body }}>NDL</span>}
                  {w.laborCovered && <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontFamily: F.body }}>Labor ✓</span>}
                  {w.materialCovered && <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontFamily: F.body }}>Material ✓</span>}
                  {w.transferable && <span style={{ background: "#e3f2fd", color: "#1565c0", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontFamily: F.body }}>Transferable</span>}
                  {w.consequential && <span style={{ background: "#fff3e0", color: "#e65100", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontFamily: F.body }}>Consequential</span>}
                  {!w.pondingExcluded && <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontFamily: F.body }}>Ponding OK</span>}
                </div>
                {expandedId === w.id ? (
                  <WarrantyExpand w={w} />
                ) : (
                  w.bestFor && <div style={{ fontSize: 12, color: C.g600, fontFamily: F.body, fontStyle: "italic" }}>Best for: {w.bestFor}</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <Btn secondary onClick={() => setStep(0)}>← Adjust Criteria</Btn>
            <Btn secondary onClick={closeModal}>Done</Btn>
          </div>
        </div>
      </div>
    );
  }

  // ---- AI SPEC ASSISTANT ----
  if (path === "ai") {
    const msgContainerRef = { current: null };
    const helpful = aiInsights.helpful || {};

    const ConciseCard = ({ w, msgId }) => {
      const isExp = expandedAiCards[w.id];
      return (
      <div style={{ border: `1.5px solid ${isExp ? C.green : C.g200}`, borderRadius: 10, padding: "10px 14px", marginBottom: 6, background: C.white, transition: "border-color .2s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span onClick={() => toggleAiCard(w.id)} style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: F.head, cursor: "pointer", borderBottom: "1px dashed " + C.g300 }} title="Click to expand">{w.manufacturer} | {(w.membranes||[]).join(", ")} | {w.term}yr</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span onClick={() => toggleAiCard(w.id)} style={{ fontSize: 11, color: C.g400, fontFamily: F.body, cursor: "pointer" }}>{isExp ? "See Less" : "See More"}</span>
            <span style={{ fontSize: 11, color: C.g500, fontFamily: F.body }}>{w.rating}/10</span>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
          {w.ndl && <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, fontFamily: F.body }}>NDL</span>}
          {w.laborCovered && <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "1px 6px", borderRadius: 4, fontSize: 9, fontFamily: F.body }}>Labor</span>}
          {w.materialCovered && <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "1px 6px", borderRadius: 4, fontSize: 9, fontFamily: F.body }}>Material</span>}
          {w.transferable && <span style={{ background: "#e3f2fd", color: "#1565c0", padding: "1px 6px", borderRadius: 4, fontSize: 9, fontFamily: F.body }}>Transferable</span>}
          {w.consequential && <span style={{ background: "#fff3e0", color: "#e65100", padding: "1px 6px", borderRadius: 4, fontSize: 9, fontFamily: F.body }}>Consequential</span>}
          {(helpful[w.id] || 0) >= 1 && <span style={{ background: "#fce4ec", color: "#c62828", padding: "1px 6px", borderRadius: 4, fontSize: 9, fontFamily: F.body }}>Contractor Favorite</span>}
        </div>
        {w.bestFor && <div style={{ fontSize: 11, color: C.g600, fontFamily: F.body, fontStyle: "italic" }}>Best for: {w.bestFor}</div>}
        {isExp && <WarrantyExpand w={w} />}
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <button onClick={(e) => { e.stopPropagation(); rateWarranty(msgId, w.id, true); }} style={{ background: "none", border: "1px solid " + C.g200, borderRadius: 6, padding: "2px 8px", cursor: "pointer", fontSize: 11 }} title="Helpful">👍</button>
          <button onClick={(e) => { e.stopPropagation(); rateWarranty(msgId, w.id, false); }} style={{ background: "none", border: "1px solid " + C.g200, borderRadius: 6, padding: "2px 8px", cursor: "pointer", fontSize: 11 }} title="Not helpful">👎</button>
        </div>
      </div>
    );
    };

    const ExpandedCard = ({ w, msgId }) => (
      <div style={{ border: `1.5px solid ${C.g200}`, borderRadius: 10, padding: "12px 16px", marginBottom: 8, background: C.white }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: F.head }}>{w.manufacturer} | {(w.membranes||[]).join(", ")} | {w.term} Year</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Stars n={w.rating} />
            <span style={{ fontSize: 11, color: C.g500, fontFamily: F.body }}>{w.rating}/10</span>
          </div>
        </div>
        <div style={{ fontSize: 11, color: C.g500, fontFamily: F.body, marginBottom: 8 }}>{w.name}</div>
        {(helpful[w.id] || 0) >= 1 && <div style={{ fontSize: 10, color: "#c62828", fontFamily: F.body, marginBottom: 8, fontWeight: 600 }}>Contractors found this helpful ({helpful[w.id]}x)</div>}
        <WarrantyExpand w={w} />
        <div style={{ display: "flex", gap: 6, marginTop: 8, borderTop: `1px solid ${C.g100}`, paddingTop: 8 }}>
          <button onClick={(e) => { e.stopPropagation(); rateWarranty(msgId, w.id, true); }} style={{ background: "none", border: "1px solid " + C.g200, borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 11 }}>👍 Helpful</button>
          <button onClick={(e) => { e.stopPropagation(); rateWarranty(msgId, w.id, false); }} style={{ background: "none", border: "1px solid " + C.g200, borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 11 }}>👎 Not useful</button>
        </div>
      </div>
    );

    return (
      <div style={overlay} onClick={closeModal}>
        <div style={{ ...modal, maxWidth: 900, display: "flex", flexDirection: "column", padding: 0 }} onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div style={{ padding: "20px 24px 0", borderBottom: `1px solid ${C.g100}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: 0 }}>{Ic.zap} AI Spec Assistant</h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.g400 }}>×</button>
            </div>
            <div style={{ display: "flex", gap: 0, marginBottom: 0 }}>
              <button onClick={() => setShowSaved(false)} style={{ padding: "8px 16px", fontSize: 12, fontWeight: 700, fontFamily: F.head, color: !showSaved ? C.navy : C.g400, background: "none", border: "none", borderBottom: !showSaved ? `2px solid ${C.green}` : "2px solid transparent", cursor: "pointer" }}>Chat</button>
              <button onClick={() => setShowSaved(true)} style={{ padding: "8px 16px", fontSize: 12, fontWeight: 700, fontFamily: F.head, color: showSaved ? C.navy : C.g400, background: "none", border: "none", borderBottom: showSaved ? `2px solid ${C.green}` : "2px solid transparent", cursor: "pointer" }}>Saved Specs ({savedSpecs.length})</button>
            </div>
          </div>

          {showSaved ? (
            /* ── SAVED SPECS LIBRARY ── */
            <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
              {savedSpecs.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: C.g400 }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{Ic.file}</div>
                  <div style={{ fontSize: 14, fontFamily: F.body }}>No saved specs yet. Chat with the assistant and save helpful results.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {savedSpecs.map(spec => (
                    <div key={spec.id} style={{ border: `1.5px solid ${C.g200}`, borderRadius: 12, padding: 16, background: C.white }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: F.head, marginBottom: 2 }}>{spec.query}</div>
                          <div style={{ fontSize: 11, color: C.g500, fontFamily: F.body }}>{spec.warranties.length} warrant{spec.warranties.length !== 1 ? "ies" : "y"} · Saved {new Date(spec.ts).toLocaleDateString()}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => downloadSpecPdf(spec.warranties, spec.query)} style={{ background: C.green, color: C.white, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: F.head }}>PDF</button>
                          <button onClick={() => deleteSavedSpec(spec.id)} style={{ background: "none", border: `1px solid ${C.g200}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", color: C.red }}>Delete</button>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {spec.warranties.map(w => (
                          <span key={w.id} style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 6, padding: "2px 8px", fontSize: 10, color: C.navy, fontFamily: F.body }}>{w.manufacturer} {w.term}yr {(w.membranes||[]).join("/")}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── CHAT INTERFACE ── */
            <>
              {/* View mode toggle + DB info */}
              <div style={{ padding: "10px 24px", borderBottom: `1px solid ${C.g100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: C.g400, fontFamily: F.body }}>Searching {WARRANTY_DB.length} warranties · {Object.keys(helpful).length > 0 ? Object.keys(helpful).length + " contractor-rated" : "Learning from your feedback"}</span>
                <div style={{ display: "flex", gap: 0, border: `1px solid ${C.g200}`, borderRadius: 6, overflow: "hidden" }}>
                  {[["concise", "Concise"], ["expanded", "Full Specs"]].map(([k, lbl]) => (
                    <button key={k} onClick={() => setAiViewMode(k)} style={{ padding: "4px 10px", fontSize: 10, fontWeight: 600, fontFamily: F.head, background: aiViewMode === k ? C.navy : C.white, color: aiViewMode === k ? C.white : C.g600, border: "none", cursor: "pointer" }}>{lbl}</button>
                  ))}
                </div>
              </div>

              {/* Messages area */}
              <div ref={el => { msgContainerRef.current = el; if (el) el.scrollTop = el.scrollHeight; }} style={{ flex: 1, overflowY: "auto", padding: 24, minHeight: 300, maxHeight: "calc(90vh - 260px)" }}>
                {aiMessages.length === 0 && !aiTyping && (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{Ic.zap}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: F.head, marginBottom: 4 }}>Ask me about warranty specs</div>
                    <div style={{ fontSize: 12, color: C.g500, fontFamily: F.body, marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>Describe your roof, mention a manufacturer, membrane, or term length. I will find matching warranties and show you the full specs.</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                      {AI_SUGGESTIONS.map((s, i) => (
                        <button key={i} onClick={() => handleAiSend(s)} style={{ padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${C.g200}`, background: C.white, color: C.navy, fontSize: 12, fontFamily: F.body, cursor: "pointer", textAlign: "left", maxWidth: 260, transition: "all .15s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.background = C.g50; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = C.g200; e.currentTarget.style.background = C.white; }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {aiMessages.map(msg => (
                  <div key={msg.id} style={{ marginBottom: 16 }}>
                    {msg.role === "user" ? (
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <div style={{ background: C.navy, color: C.white, padding: "10px 16px", borderRadius: "14px 14px 4px 14px", maxWidth: "75%", fontSize: 13, fontFamily: F.body, lineHeight: 1.5 }}>{msg.text}</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                          <span style={{ background: C.green, color: C.white, width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>AI</span>
                          <span style={{ fontSize: 11, color: C.g400, fontFamily: F.body }}>Spec Assistant</span>
                        </div>
                        <div style={{ background: C.g50, padding: "12px 16px", borderRadius: "4px 14px 14px 14px", maxWidth: "90%", fontSize: 13, fontFamily: F.body, lineHeight: 1.5, color: C.navy }}>
                          <div style={{ marginBottom: (msg.warranties || []).length > 0 ? 10 : 0 }}>{msg.text}</div>
                          {(msg.warranties || []).length > 0 && (() => {
                            const all = msg.warranties;
                            const isShowingAll = showAllResults[msg.id];
                            const visible = isShowingAll ? all : all.slice(0, 5);
                            const remaining = all.length - 5;
                            return (
                            <>
                              {visible.map(w => (
                                aiViewMode === "concise"
                                  ? <ConciseCard key={w.id} w={w} msgId={msg.id} />
                                  : <ExpandedCard key={w.id} w={w} msgId={msg.id} />
                              ))}
                              {remaining > 0 && (
                                <button onClick={() => toggleShowAll(msg.id)} style={{ width: "100%", padding: "8px 0", marginBottom: 6, background: C.g50, border: `1.5px dashed ${C.g300}`, borderRadius: 8, color: C.navy, fontSize: 12, fontWeight: 600, fontFamily: F.head, cursor: "pointer", transition: "all .15s" }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.color = C.green; }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.g300; e.currentTarget.style.color = C.navy; }}>
                                  {isShowingAll ? "Show Top 5 Only" : `Show All Results (${remaining} more)`}
                                </button>
                              )}
                              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                                <button onClick={() => saveSpecFromMsg(msg)} style={{ background: C.green, color: C.white, border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: F.head }}>Save These Specs</button>
                                <button onClick={() => downloadSpecPdf(msg.warranties, msg.text.slice(0, 60))} style={{ background: C.white, color: C.navy, border: `1px solid ${C.g200}`, borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: F.head }}>Download PDF</button>
                              </div>
                            </>
                            );
                          })()}
                          {/* Show feedback status */}
                          {msg.ratings && Object.keys(msg.ratings).length > 0 && (
                            <div style={{ marginTop: 6, fontSize: 10, color: C.g400, fontFamily: F.body }}>
                              {Object.values(msg.ratings).filter(Boolean).length > 0 && "Thanks for your feedback — this helps improve future results."}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {aiTyping && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                    <span style={{ background: C.green, color: C.white, width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>AI</span>
                    <div style={{ background: C.g50, padding: "10px 16px", borderRadius: "4px 14px 14px 14px", fontSize: 13, fontFamily: F.body, color: C.g400 }}>Searching warranty database...</div>
                  </div>
                )}
              </div>

              {/* Input area */}
              <div style={{ padding: "12px 24px 16px", borderTop: `1px solid ${C.g100}`, background: C.white }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiSend(); } }} placeholder='Try: "I have a TPO roof and need a 20-year warranty..."' style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.g200}`, fontFamily: F.body, fontSize: 13, outline: "none", color: C.navy }} />
                  <Btn primary onClick={() => handleAiSend()} style={{ opacity: aiInput.trim() ? 1 : 0.4 }}>Send</Btn>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: C.g400, fontFamily: F.body }}>Press Enter to send · Mention membrane, manufacturer, or term length</span>
                  <button onClick={() => setPath(null)} style={{ background: "none", border: "none", fontSize: 11, color: C.g400, cursor: "pointer", fontFamily: F.body }}>← Back to menu</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ══════════════════════════════════════════════════════════════════════
//  AUTH SCREEN — Signup / Login with SSO + Email
// ══════════════════════════════════════════════════════════════════════

const COMPANY_TYPES = ["Commercial Roofing", "Product Manufacturing", "Consulting", "Architect", "GC", "Other"];

function AuthScreen({ onAuth, oauthError: initialOauthError, initialResetToken }) {
  const [mode, setMode] = useState(initialResetToken ? "reset" : "signup"); // "signup" | "login" | "forgot" | "reset"
  const [step, setStep] = useState(0); // 0=credentials, 1=profile, 2=phone verify
  const [error, setError] = useState(initialOauthError || "");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [resetToken, setResetToken] = useState(initialResetToken || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [userId, setUserId] = useState(null);
  const [codeSent, setCodeSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const resetForm = () => {
    setFirstName(""); setLastName(""); setEmail(""); setPassword(""); setConfirmPassword("");
    setPhone(""); setCompanyName(""); setCompanyType(""); setJobTitle("");
    setPhoneCode(""); setUserId(null); setCodeSent(false); setPhoneVerified(false);
    setStep(0); setError("");
  };

  const handleRegister = async () => {
    setError("");
    if (!firstName || !lastName || !email || !password) { setError("Please fill in all required fields"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await register({ firstName, lastName, email, password, phone, companyName, companyType, jobTitle });
      localStorage.setItem("auth_token", res.token);
      setUserId(res.user.id);
      if (phone) {
        setStep(2); // go to phone verify
      } else {
        onAuth(res.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please enter email and password"); return; }
    setLoading(true);
    try {
      const res = await login({ email, password });
      localStorage.setItem("auth_token", res.token);
      onAuth(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(""); setSuccessMsg("");
    if (!email) { setError("Please enter your email address"); return; }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSuccessMsg("If an account exists with this email, a password reset link has been sent. Check your inbox.");
    } catch (err) {
      setSuccessMsg("If an account exists with this email, a password reset link has been sent. Check your inbox.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError(""); setSuccessMsg("");
    if (!newPassword) { setError("Please enter a new password"); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmNewPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await resetPassword(resetToken, newPassword);
      setSuccessMsg("Your password has been reset successfully. You can now sign in.");
      setTimeout(() => { setMode("login"); setSuccessMsg(""); setNewPassword(""); setConfirmNewPassword(""); }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async (provider) => {
    const apiUrl = import.meta.env.VITE_API_URL || "/api";
    if (provider === "google") {
      window.location.href = `${apiUrl}/auth/google`;
    } else {
      setError(`${provider} SSO is not yet configured. Use Google or email signup for now.`);
    }
  };

  const handleSendCode = async () => {
    if (!phone || !userId) return;
    setLoading(true);
    try {
      await sendPhoneCode(userId, phone);
      setCodeSent(true);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneCode || !userId) return;
    setLoading(true);
    try {
      await verifyPhone(userId, phoneCode);
      setPhoneVerified(true);
      setError("");
      // Brief delay then proceed
      setTimeout(() => {
        getMe().then(res => onAuth(res.user)).catch(() => onAuth({ id: userId }));
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // SSO buttons
  const SSOButton = ({ provider, icon, label, color }) => (
    <button onClick={() => handleSSO(provider)} style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      width: "100%", padding: "12px 16px", borderRadius: 10,
      border: `1.5px solid ${C.g200}`, background: C.white,
      fontSize: 14, fontWeight: 600, fontFamily: F.body, color: C.navy,
      cursor: "pointer", transition: "all 0.15s ease",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = C.g50; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.g200; e.currentTarget.style.background = C.white; }}
    >
      {icon}
      {label}
    </button>
  );

  const googleIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  const linkedInIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0077B5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );

  // ── PHONE VERIFICATION STEP ──
  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLt} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body }}>
        <div style={{ background: C.white, borderRadius: 20, padding: "40px 36px", maxWidth: 440, width: "95vw", boxShadow: C.shadowXl }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <span style={{ color: C.white, fontFamily: F.head, fontWeight: 800, fontSize: 18 }}>MRI</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: "0 0 6px" }}>Verify Your Phone</h2>
            <p style={{ fontSize: 13, color: C.g600, margin: 0 }}>We'll send a 6-digit code to <strong>{phone}</strong></p>
          </div>

          {phoneVerified ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.green, fontFamily: F.head }}>Phone Verified!</div>
              <div style={{ fontSize: 13, color: C.g600, marginTop: 6 }}>Redirecting to your dashboard...</div>
            </div>
          ) : !codeSent ? (
            <div>
              <FormField label="Cell Phone" value={phone} onChange={setPhone} placeholder="(555) 123-4567" required />
              {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{error}</div>}
              <button onClick={handleSendCode} disabled={loading || !phone} style={{
                width: "100%", padding: "12px 16px", borderRadius: 10,
                background: phone ? C.green : C.g200, border: "none",
                color: C.white, fontSize: 14, fontWeight: 700, fontFamily: F.head,
                cursor: phone ? "pointer" : "default", opacity: loading ? 0.6 : 1,
              }}>{loading ? "Sending..." : "Send Verification Code"}</button>
              <button onClick={() => { getMe().then(res => onAuth(res.user)).catch(() => onAuth({ id: userId })); }}
                style={{ display: "block", width: "100%", background: "none", border: "none", color: C.g400, fontSize: 13, marginTop: 12, cursor: "pointer", fontFamily: F.body }}>
                Skip for now →
              </button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.g600, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F.head, marginBottom: 6 }}>Verification Code<span style={{ color: C.red }}> *</span></label>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  {[0,1,2,3,4,5].map(i => (
                    <input key={i} maxLength={1} value={phoneCode[i] || ""}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val) {
                          const newCode = phoneCode.split("");
                          newCode[i] = val;
                          setPhoneCode(newCode.join(""));
                          // Auto-focus next
                          const next = e.target.nextElementSibling;
                          if (next) next.focus();
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === "Backspace" && !phoneCode[i]) {
                          const prev = e.target.previousElementSibling;
                          if (prev) prev.focus();
                        }
                      }}
                      style={{
                        width: 44, height: 52, textAlign: "center", fontSize: 22, fontWeight: 700,
                        borderRadius: 10, border: `2px solid ${phoneCode[i] ? C.green : C.g200}`,
                        fontFamily: F.head, color: C.navy, outline: "none",
                      }}
                    />
                  ))}
                </div>
              </div>
              {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 12, textAlign: "center" }}>{error}</div>}
              <button onClick={handleVerifyPhone} disabled={loading || phoneCode.length < 6} style={{
                width: "100%", padding: "12px 16px", borderRadius: 10,
                background: phoneCode.length === 6 ? C.green : C.g200, border: "none",
                color: C.white, fontSize: 14, fontWeight: 700, fontFamily: F.head,
                cursor: phoneCode.length === 6 ? "pointer" : "default", opacity: loading ? 0.6 : 1,
              }}>{loading ? "Verifying..." : "Verify Phone"}</button>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                <button onClick={handleSendCode} style={{ background: "none", border: "none", color: C.blue, fontSize: 13, cursor: "pointer", fontFamily: F.body }}>Resend code</button>
                <button onClick={() => { getMe().then(res => onAuth(res.user)).catch(() => onAuth({ id: userId })); }}
                  style={{ background: "none", border: "none", color: C.g400, fontSize: 13, cursor: "pointer", fontFamily: F.body }}>Skip for now →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SIGNUP STEP 1: PROFILE INFO ──
  if (mode === "signup" && step === 1) {
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLt} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body }}>
        <div style={{ background: C.white, borderRadius: 20, padding: "40px 36px", maxWidth: 480, width: "95vw", boxShadow: C.shadowXl }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <span style={{ color: C.white, fontFamily: F.head, fontWeight: 800, fontSize: 18 }}>MRI</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: "0 0 6px" }}>Complete Your Profile</h2>
            <p style={{ fontSize: 13, color: C.g600, margin: 0 }}>Tell us about yourself so we can personalize your experience</p>
          </div>

          {/* Step indicator */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {["Account", "Profile", "Verify"].map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: 4, borderRadius: 2, background: i <= step ? C.green : C.g200, marginBottom: 4 }} />
                <span style={{ fontSize: 10, color: i <= step ? C.navy : C.g400, fontFamily: F.body, fontWeight: i === step ? 700 : 400 }}>{s}</span>
              </div>
            ))}
          </div>

          <FormField label="Cell Phone" value={phone} onChange={setPhone} placeholder="(555) 123-4567" required />
          <FormField label="Company Name" value={companyName} onChange={setCompanyName} placeholder="e.g. Summit Roofing Co." required />
          <FormField label="Type of Company" value={companyType} onChange={setCompanyType} required options={COMPANY_TYPES} placeholder="Select company type..." />
          <FormField label="Job Title" value={jobTitle} onChange={setJobTitle} placeholder="e.g. Project Manager" required />

          {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{error}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setStep(0)} style={{
              flex: 1, padding: "12px 16px", borderRadius: 10,
              border: `1.5px solid ${C.g200}`, background: C.white,
              fontSize: 14, fontWeight: 600, fontFamily: F.head, color: C.navy, cursor: "pointer",
            }}>Back</button>
            <button onClick={handleRegister} disabled={loading} style={{
              flex: 2, padding: "12px 16px", borderRadius: 10,
              background: (firstName && lastName && email && password && phone && companyName && companyType && jobTitle) ? C.green : C.g200,
              border: "none", color: C.white, fontSize: 14, fontWeight: 700, fontFamily: F.head,
              cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1,
            }}>{loading ? "Creating Account..." : "Create Account"}</button>
          </div>
        </div>
      </div>
    );
  }

  // ── FORGOT PASSWORD SCREEN ──
  if (mode === "forgot") {
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLt} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body }}>
        <div style={{ background: C.white, borderRadius: 20, padding: "40px 36px", maxWidth: 440, width: "95vw", boxShadow: C.shadowXl }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <span style={{ color: C.white, fontFamily: F.head, fontWeight: 800, fontSize: 18 }}>MRI</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: "0 0 6px" }}>Reset Your Password</h2>
            <p style={{ fontSize: 13, color: C.g600, margin: 0 }}>Enter your email address and we'll send you a reset link</p>
          </div>

          <FormField label="Email" value={email} onChange={setEmail} placeholder="john@company.com" type="email" required />

          {error && <div style={{ background: C.redBg, border: `1px solid ${C.redBdr}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.red }}>{error}</div>}
          {successMsg && <div style={{ background: C.greenLt, border: `1px solid ${C.green}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.greenDk }}>{successMsg}</div>}

          <button onClick={handleForgotPassword} disabled={loading} style={{
            width: "100%", padding: "12px 16px", borderRadius: 10,
            background: email ? C.green : C.g200, border: "none",
            color: C.white, fontSize: 14, fontWeight: 700, fontFamily: F.head,
            cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1,
          }}>{loading ? "Sending..." : "Send Reset Link"}</button>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.g600 }}>
            <button onClick={() => { setError(""); setSuccessMsg(""); setMode("login"); }} style={{ background: "none", border: "none", color: C.green, fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: F.body }}>Back to Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  // ── RESET PASSWORD SCREEN ──
  if (mode === "reset") {
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLt} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body }}>
        <div style={{ background: C.white, borderRadius: 20, padding: "40px 36px", maxWidth: 440, width: "95vw", boxShadow: C.shadowXl }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <span style={{ color: C.white, fontFamily: F.head, fontWeight: 800, fontSize: 18 }}>MRI</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: "0 0 6px" }}>Set New Password</h2>
            <p style={{ fontSize: 13, color: C.g600, margin: 0 }}>Enter your new password below</p>
          </div>

          <FormField label="New Password" value={newPassword} onChange={setNewPassword} placeholder="Minimum 8 characters" type="password" required />
          <FormField label="Confirm New Password" value={confirmNewPassword} onChange={setConfirmNewPassword} placeholder="Re-enter your new password" type="password" required />

          {error && <div style={{ background: C.redBg, border: `1px solid ${C.redBdr}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.red }}>{error}</div>}
          {successMsg && <div style={{ background: C.greenLt, border: `1px solid ${C.green}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.greenDk }}>{successMsg}</div>}

          <button onClick={handleResetPassword} disabled={loading} style={{
            width: "100%", padding: "12px 16px", borderRadius: 10,
            background: (newPassword.length >= 8 && newPassword === confirmNewPassword) ? C.green : C.g200, border: "none",
            color: C.white, fontSize: 14, fontWeight: 700, fontFamily: F.head,
            cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1,
          }}>{loading ? "Resetting..." : "Reset Password"}</button>
        </div>
      </div>
    );
  }

  // ── MAIN SCREEN: SIGNUP / LOGIN ──
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLt} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body }}>
      <div style={{ background: C.white, borderRadius: 20, padding: "40px 36px", maxWidth: 440, width: "95vw", boxShadow: C.shadowXl }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <span style={{ color: C.white, fontFamily: F.head, fontWeight: 800, fontSize: 18 }}>MRI</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: "0 0 6px" }}>
            {mode === "signup" ? "Create Your Account" : "Welcome Back"}
          </h2>
          <p style={{ fontSize: 13, color: C.g600, margin: 0 }}>
            {mode === "signup" ? "Join the Roof MRI Warranty Management Platform" : "Sign in to your Warranty Manager"}
          </p>
        </div>

        {/* Step indicator for signup */}
        {mode === "signup" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {["Account", "Profile", "Verify"].map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: 4, borderRadius: 2, background: i <= step ? C.green : C.g200, marginBottom: 4 }} />
                <span style={{ fontSize: 10, color: i <= step ? C.navy : C.g400, fontFamily: F.body, fontWeight: i === step ? 700 : 400 }}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {/* SSO Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          <SSOButton provider="google" icon={googleIcon} label="Continue with Google" color="#4285F4" />
          <SSOButton provider="linkedin" icon={linkedInIcon} label="Continue with LinkedIn" color="#0077B5" />
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: C.g200 }} />
          <span style={{ fontSize: 12, color: C.g400, fontFamily: F.body }}>or</span>
          <div style={{ flex: 1, height: 1, background: C.g200 }} />
        </div>

        {/* Form Fields */}
        {mode === "signup" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="First Name" value={firstName} onChange={setFirstName} placeholder="John" required />
            <FormField label="Last Name" value={lastName} onChange={setLastName} placeholder="Smith" required />
          </div>
        )}

        <FormField label="Email" value={email} onChange={setEmail} placeholder="john@company.com" type="email" required />
        <FormField label="Password" value={password} onChange={setPassword} placeholder={mode === "signup" ? "Minimum 8 characters" : "Your password"} type="password" required />
        {mode === "signup" && (
          <FormField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter your password" type="password" required />
        )}

        {mode === "login" && (
          <div style={{ textAlign: "right", marginBottom: 12, marginTop: -8 }}>
            <button onClick={() => setMode("forgot")} style={{ background: "none", border: "none", color: C.green, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}>Forgot Password?</button>
          </div>
        )}

        {error && <div style={{ background: C.redBg, border: `1px solid ${C.redBdr}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.red }}>{error}</div>}

        {/* Submit Button */}
        {mode === "signup" ? (
          <button onClick={() => {
            if (!firstName || !lastName || !email || !password) { setError("Please fill in all required fields"); return; }
            if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
            if (password !== confirmPassword) { setError("Passwords do not match"); return; }
            setError("");
            setStep(1);
          }} style={{
            width: "100%", padding: "12px 16px", borderRadius: 10,
            background: (firstName && lastName && email && password.length >= 8 && password === confirmPassword) ? C.green : C.g200,
            border: "none", color: C.white, fontSize: 14, fontWeight: 700, fontFamily: F.head,
            cursor: (firstName && lastName && email && password.length >= 8 && password === confirmPassword) ? "pointer" : "default",
          }}>Continue</button>
        ) : (
          <button onClick={handleLogin} disabled={loading} style={{
            width: "100%", padding: "12px 16px", borderRadius: 10,
            background: (email && password) ? C.green : C.g200,
            border: "none", color: C.white, fontSize: 14, fontWeight: 700, fontFamily: F.head,
            cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1,
          }}>{loading ? "Signing In..." : "Sign In"}</button>
        )}

        {/* Toggle mode */}
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.g600 }}>
          {mode === "signup" ? (
            <span>Already have an account? <button onClick={() => { resetForm(); setMode("login"); }} style={{ background: "none", border: "none", color: C.green, fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: F.body }}>Sign In</button></span>
          ) : (
            <span>Don't have an account? <button onClick={() => { resetForm(); setMode("signup"); }} style={{ background: "none", border: "none", color: C.green, fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: F.body }}>Sign Up</button></span>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: C.g400 }}>
          A verification link will be sent to confirm your email address
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  MANAGEMENT MODALS — Create owners, claims, inspections, logs, invoices
// ══════════════════════════════════════════════════════════════════════

const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 };
const modalBox = { background: "#ffffff", borderRadius: 20, padding: 32, maxWidth: 600, width: "95vw", maxHeight: "90vh", overflowY: "auto", position: "relative" };
const modalTitle = { fontSize: 20, fontWeight: 800, color: "#1e2c55", fontFamily: "'Poppins', sans-serif", margin: 0 };
const modalClose = { background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9ba3b5" };

function AddOwnerModal({ open, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [propName, setPropName] = useState("");
  const [propAddr, setPropAddr] = useState("");
  const [roofSection, setRoofSection] = useState("");
  const [roofType, setRoofType] = useState("");
  const [roofSqft, setRoofSqft] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const reset = () => { setName(""); setContact(""); setEmail(""); setPhone(""); setPropName(""); setPropAddr(""); setRoofSection(""); setRoofType(""); setRoofSqft(""); };

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    try {
      const data = { name, contact, email, phone };
      if (propName) {
        const prop = { name: propName, address: propAddr };
        if (roofSection) {
          prop.roofs = [{ section: roofSection, type: roofType || null, sqFt: roofSqft ? parseInt(roofSqft) : null }];
        }
        data.properties = [prop];
      }
      await createOwner(data);
      reset();
      onSaved();
      onClose();
    } catch (err) {
      alert("Error creating owner: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={modalTitle}>Add New Owner</h2>
          <button onClick={onClose} style={modalClose}>×</button>
        </div>
        <FormField label="Owner Name" value={name} onChange={setName} placeholder="e.g. Riverside Properties LLC" required />
        <FormField label="Contact Person" value={contact} onChange={setContact} placeholder="e.g. John Smith" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Email" value={email} onChange={setEmail} placeholder="john@example.com" type="email" />
          <FormField label="Phone" value={phone} onChange={setPhone} placeholder="(555) 123-4567" />
        </div>
        <div style={{ borderTop: `1px solid ${C.g200}`, marginTop: 8, paddingTop: 16, marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: F.head, marginBottom: 12 }}>Property (optional)</div>
          <FormField label="Property Name" value={propName} onChange={setPropName} placeholder="e.g. Oakwood Business Park" />
          <FormField label="Address" value={propAddr} onChange={setPropAddr} placeholder="e.g. 123 Main St, Suite 200" />
        </div>
        {propName && <div style={{ borderTop: `1px solid ${C.g200}`, marginTop: 8, paddingTop: 16, marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: F.head, marginBottom: 12 }}>Roof Section (optional)</div>
          <FormField label="Section Name" value={roofSection} onChange={setRoofSection} placeholder="e.g. Main Building - Section A" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Roof Type" value={roofType} onChange={setRoofType} options={["TPO", "PVC", "EPDM", "Modified Bitumen", "BUR", "Metal", "Acrylic Coating", "Silicone Coating", "SPF"]} />
            <FormField label="Square Footage" value={roofSqft} onChange={setRoofSqft} placeholder="e.g. 25000" type="number" />
          </div>
        </div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn primary onClick={handleSave} style={{ opacity: (!name || saving) ? 0.5 : 1 }}>{saving ? "Saving..." : "Create Owner"}</Btn>
        </div>
      </div>
    </div>
  );
}

function FileClaimModal({ open, onClose, onSaved, OWNERS }) {
  const roofs = allRoofs(OWNERS);
  const [roofId, setRoofId] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const selectedRoof = roofs.find(r => r.id === roofId);

  const handleSave = async () => {
    if (!roofId || !manufacturer) return;
    setSaving(true);
    try {
      await createClaim({ roofId, manufacturer, amount: amount ? parseFloat(amount) : 0, description });
      setRoofId(""); setManufacturer(""); setAmount(""); setDescription("");
      onSaved();
      onClose();
    } catch (err) {
      alert("Error filing claim: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={modalTitle}>File Warranty Claim</h2>
          <button onClick={onClose} style={modalClose}>×</button>
        </div>
        <FormField label="Roof Section" value={roofId} onChange={(v) => { setRoofId(v); const r = roofs.find(r2 => r2.id === v); if (r) setManufacturer(r.warranty.manufacturer || ""); }} placeholder="Select roof..." required options={roofs.map(r => ({ value: r.id, label: `${r.section} — ${r.propName}` }))} />
        {selectedRoof && <div style={{ fontSize: 12, color: C.g600, marginTop: -12, marginBottom: 12 }}>{selectedRoof.section} · {selectedRoof.propName} · {selectedRoof.ownerName}</div>}
        <FormField label="Manufacturer" value={manufacturer} onChange={setManufacturer} placeholder="e.g. GAF" required />
        <FormField label="Claim Amount ($)" value={amount} onChange={setAmount} placeholder="e.g. 15000" type="number" />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.g600, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F.head, marginBottom: 6 }}>Description<span style={{ color: C.red }}> *</span></label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the issue or damage..." rows={3} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.g200}`, background: C.white, fontSize: 14, fontFamily: F.body, color: C.navy, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn primary onClick={handleSave} style={{ opacity: (!roofId || !manufacturer || saving) ? 0.5 : 1 }}>{saving ? "Filing..." : "File Claim"}</Btn>
        </div>
      </div>
    </div>
  );
}

function ScheduleInspectionModal({ open, onClose, onSaved, OWNERS }) {
  const roofs = allRoofs(OWNERS);
  const [roofId, setRoofId] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [inspector, setInspector] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const selectedRoof = roofs.find(r => r.id === roofId);

  const handleSave = async () => {
    if (!roofId || !date || !type) return;
    setSaving(true);
    try {
      await createInspection({ roofId, date, type, inspector, company, notes });
      setRoofId(""); setDate(""); setType(""); setInspector(""); setCompany(""); setNotes("");
      onSaved();
      onClose();
    } catch (err) {
      alert("Error scheduling inspection: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={modalTitle}>Schedule Inspection</h2>
          <button onClick={onClose} style={modalClose}>×</button>
        </div>
        <FormField label="Roof Section" value={roofId} onChange={setRoofId} placeholder="Select roof..." required options={roofs.map(r => ({ value: r.id, label: `${r.section} — ${r.propName}` }))} />
        {selectedRoof && <div style={{ fontSize: 12, color: C.g600, marginTop: -12, marginBottom: 12 }}>{selectedRoof.section} · {selectedRoof.propName}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Date" value={date} onChange={setDate} type="date" required />
          <FormField label="Inspection Type" value={type} onChange={setType} required options={["Annual Inspection", "Bi-Annual Inspection", "Warranty Required", "Post-Storm", "Moisture Survey", "Maintenance Check"]} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Inspector" value={inspector} onChange={setInspector} placeholder="e.g. Mike Johnson" />
          <FormField label="Company" value={company} onChange={setCompany} placeholder="e.g. Roof MRI" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.g600, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F.head, marginBottom: 6 }}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions or notes..." rows={2} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.g200}`, background: C.white, fontSize: 14, fontFamily: F.body, color: C.navy, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn primary onClick={handleSave} style={{ opacity: (!roofId || !date || !type || saving) ? 0.5 : 1 }}>{saving ? "Scheduling..." : "Schedule Inspection"}</Btn>
        </div>
      </div>
    </div>
  );
}

function LogAccessModal({ open, onClose, onSaved, OWNERS }) {
  const roofs = allRoofs(OWNERS);
  const [roofId, setRoofId] = useState("");
  const [person, setPerson] = useState("");
  const [company, setCompany] = useState("");
  const [purpose, setPurpose] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const selectedRoof = roofs.find(r => r.id === roofId);

  const handleSave = async () => {
    if (!roofId || !person) return;
    setSaving(true);
    try {
      await createAccessLog({ roofId, person, company, purpose, date, duration, notes });
      setRoofId(""); setPerson(""); setCompany(""); setPurpose(""); setDate(new Date().toISOString().split("T")[0]); setDuration(""); setNotes("");
      onSaved();
      onClose();
    } catch (err) {
      alert("Error logging access: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={modalTitle}>Log Roof Access</h2>
          <button onClick={onClose} style={modalClose}>×</button>
        </div>
        <FormField label="Roof Section" value={roofId} onChange={setRoofId} placeholder="Select roof..." required options={roofs.map(r => ({ value: r.id, label: `${r.section} — ${r.propName}` }))} />
        {selectedRoof && <div style={{ fontSize: 12, color: C.g600, marginTop: -12, marginBottom: 12 }}>{selectedRoof.section} · {selectedRoof.propName}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Person" value={person} onChange={setPerson} placeholder="e.g. Mike Johnson" required />
          <FormField label="Company" value={company} onChange={setCompany} placeholder="e.g. HVAC Solutions" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <FormField label="Purpose" value={purpose} onChange={setPurpose} options={["Inspection", "Repair", "HVAC Service", "Maintenance", "Warranty Evaluation", "Other"]} />
          <FormField label="Date" value={date} onChange={setDate} type="date" />
          <FormField label="Duration" value={duration} onChange={setDuration} placeholder="e.g. 2 hours" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.g600, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F.head, marginBottom: 6 }}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.g200}`, background: C.white, fontSize: 14, fontFamily: F.body, color: C.navy, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn primary onClick={handleSave} style={{ opacity: (!roofId || !person || saving) ? 0.5 : 1 }}>{saving ? "Saving..." : "Log Access"}</Btn>
        </div>
      </div>
    </div>
  );
}

function CreateInvoiceModal({ open, onClose, onSaved, OWNERS }) {
  const roofs = allRoofs(OWNERS);
  const [roofId, setRoofId] = useState("");
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [flagged, setFlagged] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const selectedRoof = roofs.find(r => r.id === roofId);

  const handleSave = async () => {
    if (!roofId || !vendor) return;
    setSaving(true);
    try {
      await createInvoice({ roofId, vendor, date, amount: amount ? parseFloat(amount) : 0, description, flagged, flagReason: flagged ? flagReason : null });
      setRoofId(""); setVendor(""); setDate(new Date().toISOString().split("T")[0]); setAmount(""); setDescription(""); setFlagged(false); setFlagReason("");
      onSaved();
      onClose();
    } catch (err) {
      alert("Error creating invoice: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={modalTitle}>Create Invoice</h2>
          <button onClick={onClose} style={modalClose}>×</button>
        </div>
        <FormField label="Roof Section" value={roofId} onChange={setRoofId} placeholder="Select roof..." required options={roofs.map(r => ({ value: r.id, label: `${r.section} — ${r.propName}` }))} />
        {selectedRoof && <div style={{ fontSize: 12, color: C.g600, marginTop: -12, marginBottom: 12 }}>{selectedRoof.section} · {selectedRoof.propName}</div>}
        <FormField label="Vendor" value={vendor} onChange={setVendor} placeholder="e.g. ABC Roofing Co." required />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Date" value={date} onChange={setDate} type="date" />
          <FormField label="Amount ($)" value={amount} onChange={setAmount} placeholder="e.g. 5000" type="number" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.g600, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F.head, marginBottom: 6 }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Invoice details..." rows={2} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.g200}`, background: C.white, fontSize: 14, fontFamily: F.body, color: C.navy, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: C.navy, fontFamily: F.body, cursor: "pointer" }}>
            <input type="checkbox" checked={flagged} onChange={e => setFlagged(e.target.checked)} style={{ width: 16, height: 16 }} />
            Flag for warranty review
          </label>
        </div>
        {flagged && <FormField label="Flag Reason" value={flagReason} onChange={setFlagReason} placeholder="e.g. Work may be covered under warranty" />}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn primary onClick={handleSave} style={{ opacity: (!roofId || !vendor || saving) ? 0.5 : 1 }}>{saving ? "Creating..." : "Create Invoice"}</Btn>
        </div>
      </div>
    </div>
  );
}

function Accounts({ OWNERS, CLAIMS, onAdd }) {
  const navigate = useNavigate();
  const onSelectRoof = (roofId) => navigate(`/warranties/${roofId}`);
  const [q, setQ] = useState("");
  const [exp, setExp] = useState({});
  const toggle = (id) => setExp(p => ({ ...p, [id]: !p[id] }));
  const owners = OWNERS || [];
  const allClaims = CLAIMS || [];
  const fil = q ? owners.filter(o => o.name.toLowerCase().includes(q.toLowerCase()) || o.properties.some(p => p.name.toLowerCase().includes(q.toLowerCase()))) : owners;
  const compDot = (c) => {
    const col = c === "current" ? C.green : c === "at-risk" ? C.yellow : C.red;
    return <span style={{ width: 8, height: 8, borderRadius: "50%", background: col, display: "inline-block" }} />;
  };

  // Compute rollup totals
  const getRoofIds = (props) => props.flatMap(p => p.roofs.map(r => r.id));
  const getRecovered = (roofIds) => allClaims.filter(c => roofIds.includes(c.roofId) && (c.status === "approved" || c.status === "completed")).reduce((s, c) => s + (c.amount || 0), 0);
  const getPending = (roofIds) => allClaims.filter(c => roofIds.includes(c.roofId) && (c.status === "in-progress" || c.status === "review" || c.status === "pending")).reduce((s, c) => s + (c.amount || 0), 0);

  const allRoofIds = owners.flatMap(o => getRoofIds(o.properties));
  const totalRecovered = getRecovered(allRoofIds);
  const totalPending = getPending(allRoofIds);

  return <div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
      <div><h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: 0 }}>Account Management</h2>
      <p style={{ fontSize: 13, color: C.g600, fontFamily: F.body, margin: "4px 0 0" }}>Manage owners, property managers, and building portfolios</p></div>
      <Btn primary onClick={onAdd}>{Ic.plus} Add Owner</Btn>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
      <KPI label="Owners" value={owners.length} icon={Ic.user} />
      <KPI label="Properties" value={owners.reduce((s,o)=>s+o.properties.length,0)} icon={Ic.building} color={C.navy} />
      <KPI label="Roof Sections" value={owners.reduce((s,o)=>s+o.properties.reduce((s2,p)=>s2+p.roofs.length,0),0)} icon={Ic.shield} />
      <KPI label="Total Recovered" value={totalRecovered > 0 ? fmtMoney(totalRecovered) : "$0"} icon={Ic.dollar} color={C.green} sub={totalPending > 0 ? `${fmtMoney(totalPending)} pending` : undefined} />
    </div>
    <div style={{ position: "relative", marginBottom: 20 }}>
      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.g400 }}>{Ic.search}</span>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search owners, PMs, or properties..." style={{ width: "100%", padding: "12px 12px 12px 42px", borderRadius: 10, border: `1.5px solid ${C.g200}`, background: C.white, fontSize: 14, fontFamily: F.body, color: C.navy, outline: "none", boxSizing: "border-box" }} />
    </div>
    {fil.map(ow => {
      const owRoofIds = getRoofIds(ow.properties);
      const owRecovered = getRecovered(owRoofIds);
      const owPending = getPending(owRoofIds);
      return <Card key={ow.id} style={{ marginBottom: 12 }}>
      <div onClick={() => toggle(ow.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${C.navy}10`, display: "flex", alignItems: "center", justifyContent: "center", color: C.navy }}>{Ic.building}</div>
          <div><div style={{ fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: F.head }}>{ow.name}</div>
          <div style={{ fontSize: 12, color: C.g400, fontFamily: F.body }}>{ow.contact} · {ow.properties.length} properties</div></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {(owRecovered > 0 || owPending > 0) && <div style={{ textAlign: "right" }}>
            {owRecovered > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: C.green, fontFamily: F.head }}>{fmtMoney(owRecovered)}</div>}
            {owPending > 0 && <div style={{ fontSize: 11, color: "#b45309", fontFamily: F.body }}>{fmtMoney(owPending)} pending</div>}
          </div>}
          <span style={{ color: C.g400 }}>{exp[ow.id] ? Ic.chevD : Ic.chevR}</span>
        </div>
      </div>
      {exp[ow.id] && <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.g100}` }}>
        {ow.properties.map(p => {
          const pRoofIds = p.roofs.map(r => r.id);
          const pRecovered = getRecovered(pRoofIds);
          const pPending = getPending(pRoofIds);
          return <div key={p.id} style={{ marginBottom: 8, padding: "10px 14px", borderRadius: 10, background: C.g50 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, fontFamily: F.body }}>{p.name}</div>
              <div style={{ fontSize: 11, color: C.g400, fontFamily: F.body }}>{p.address}</div>
            </div>
            {(pRecovered > 0 || pPending > 0) && <div style={{ textAlign: "right" }}>
              {pRecovered > 0 && <div style={{ fontSize: 12, fontWeight: 700, color: C.green, fontFamily: F.head }}>{fmtMoney(pRecovered)}</div>}
              {pPending > 0 && <div style={{ fontSize: 10, color: "#b45309", fontFamily: F.body }}>{fmtMoney(pPending)} pending</div>}
            </div>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {p.roofs.map(r => <span key={r.id} onClick={() => onSelectRoof(r.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, background: C.white, border: `1px solid ${C.g200}`, fontSize: 11, cursor: "pointer" }}>{compDot(r.warranty.compliance)} {r.section}</span>)}
          </div>
        </div>;
        })}
      </div>}
    </Card>;
    })}
  </div>;
}

// ── Collapsible Section ──
function CollapsibleSection({ title, icon, color, borderColor, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card style={{ marginBottom: 12, borderLeft: `4px solid ${borderColor || C.g200}`, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
        background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: color || C.navy, fontFamily: F.head }}>{title}</div>
          {count !== undefined && <span style={{ background: C.g100, borderRadius: 10, padding: "1px 8px", fontSize: 10, fontWeight: 600, color: C.g600, fontFamily: F.body }}>{count}</span>}
        </div>
        <span style={{ color: C.g400, transition: "transform 0.2s ease", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>{Ic.chevD}</span>
      </button>
      {open && <div style={{ marginTop: 12 }}>{children}</div>}
    </Card>
  );
}

function ComingSoonToast({ onClose }) {
  const items = ["Google Earth Leak Pinning", "AI Photo Analysis", "Repair Verification", "Damage Assessment"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: `linear-gradient(90deg, ${C.navy}, ${C.navyLt})`, marginBottom: 12, overflow: "hidden", position: "relative" }}>
      <span style={{ color: C.green, flexShrink: 0 }}>{Ic.zap}</span>
      <div style={{ flex: 1, overflow: "hidden", whiteSpace: "nowrap", maskImage: "linear-gradient(90deg, transparent 0%, black 5%, black 90%, transparent 100%)", WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 5%, black 90%, transparent 100%)" }}>
        <div style={{ display: "inline-block", animation: "comingSoonScroll 18s linear infinite", fontSize: 11, color: "rgba(255,255,255,0.8)", fontFamily: F.body }}>
          {items.map((t, i) => (
            <span key={i} style={{ marginRight: 32 }}>
              <span style={{ fontWeight: 700, color: C.green }}>Coming Soon</span>
              <span style={{ margin: "0 6px", color: "rgba(255,255,255,0.3)" }}>|</span>
              {t}
            </span>
          ))}
          {items.map((t, i) => (
            <span key={`dup-${i}`} style={{ marginRight: 32 }}>
              <span style={{ fontWeight: 700, color: C.green }}>Coming Soon</span>
              <span style={{ margin: "0 6px", color: "rgba(255,255,255,0.3)" }}>|</span>
              {t}
            </span>
          ))}
        </div>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", flexShrink: 0, padding: 2 }}>{Ic.x}</button>
      <style>{`@keyframes comingSoonScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

function WarrantyDetail({ OWNERS, pricingStore, setPricingStore, pricingLoading, CLAIMS }) {
  const { roofId } = useParams();
  const navigate = useNavigate();
  const selectedRoof = roofId;
  const [showComingSoon, setShowComingSoon] = useState(true);
  const r = findRoof(OWNERS, selectedRoof);
  if (!r) return null;
  const w = r.warranty;
  const p = pctUsed(w.start, w.end);
  const days = daysTo(w.nextInsp);
  const roofClaims = (CLAIMS || []).filter(c => c.roofId === selectedRoof);
  const activeClaims = roofClaims.filter(c => c.status === "in-progress" || c.status === "review" || c.status === "pending");
  const resolvedClaims = roofClaims.filter(c => c.status === "approved" || c.status === "completed" || c.status === "denied");
  const totalRecovered = roofClaims.filter(c => c.status === "approved" || c.status === "completed").reduce((s, c) => s + (c.amount || 0), 0);
  const pendingRecovery = roofClaims.filter(c => c.status === "in-progress" || c.status === "review" || c.status === "pending").reduce((s, c) => s + (c.amount || 0), 0);

  return <div>
    <button onClick={() => navigate("/warranties")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.green, fontSize: 13, fontWeight: 700, fontFamily: F.head, cursor: "pointer", marginBottom: 20, padding: 0 }}>{Ic.back} All Warranties</button>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: "0 0 4px" }}>{r.section}</h2>
      <div style={{ fontSize: 13, color: C.g600, fontFamily: F.body, marginBottom: 8 }}>{r.propName} · {r.propAddr}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.navy, fontFamily: F.head, marginBottom: 2 }}>{w.manufacturer} | {r.type} | {termYears(w.start, w.end)} Year</div>
      <div style={{ fontSize: 12, color: C.g400, fontFamily: F.body, marginBottom: 20 }}>{w.wType}</div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        <KPI label="Warranty Used" value={`${p.toFixed(0)}%`} icon={Ic.clock} color={p > 75 ? C.yellow : C.green} sub={`Expires ${fmtDate(w.end)}`} />
        <KPI label="Next Inspection" value={days > 0 ? `${days} days` : "OVERDUE"} icon={Ic.cal} color={days > 60 ? C.green : days > 0 ? C.yellow : C.red} sub={fmtDate(w.nextInsp)} />
        <KPI label="Active Claims" value={activeClaims.length} icon={Ic.file} color={activeClaims.length > 0 ? C.yellow : C.green} />
        <KPI label="Recovered" value={totalRecovered > 0 ? fmtMoney(totalRecovered) : "$0"} icon={Ic.dollar} color={C.green} />
      </div>

      {/* Collapsible Coverage */}
      <CollapsibleSection title="Coverage" icon={Ic.check} color={C.green} borderColor={C.green} count={w.coverage.length} defaultOpen={false}>
        {w.coverage.map((c,i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 13, color: C.g600, fontFamily: F.body }}><span style={{ color: C.green }}>{Ic.check}</span>{c}</div>)}
      </CollapsibleSection>

      {/* Collapsible Exclusions */}
      <CollapsibleSection title="Exclusions" color={C.red} borderColor={C.red} count={w.exclusions.length} defaultOpen={false}>
        {w.exclusions.map((e,i) => <div key={i} style={{ fontSize: 13, color: C.g600, fontFamily: F.body, marginBottom: 6 }}>✕ {e}</div>)}
      </CollapsibleSection>

      {/* Collapsible Requirements */}
      <CollapsibleSection title="Requirements" color="#b45309" borderColor={C.yellow} count={w.requirements.length} defaultOpen={false}>
        {w.requirements.map((r2,i) => <div key={i} style={{ fontSize: 13, color: C.g600, fontFamily: F.body, marginBottom: 6 }}>{Ic.alert} {r2}</div>)}
      </CollapsibleSection>

      {/* ════════════════════════════════════════════════════════════════
         WARRANTY CLAIMS — Linked to this specific roof
         ════════════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: 8, marginBottom: 24 }}>
        {showComingSoon && <ComingSoonToast onClose={() => setShowComingSoon(false)} />}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.blue}, #1d4ed8)`, display: "flex", alignItems: "center", justifyContent: "center", color: C.white }}>{Ic.file}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, fontFamily: F.head }}>Warranty Claims</div>
              <div style={{ fontSize: 11, color: C.g400, fontFamily: F.body }}>{roofClaims.length} claim{roofClaims.length !== 1 ? "s" : ""} filed against this warranty</div>
            </div>
          </div>
        </div>

        {roofClaims.length === 0 ? (
          <Card style={{ borderLeft: `4px solid ${C.g200}`, textAlign: "center", padding: "32px 20px" }}>
            <div style={{ color: C.g400, marginBottom: 8 }}>{Ic.shield}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: F.head, marginBottom: 4 }}>No Claims Filed</div>
            <div style={{ fontSize: 13, color: C.g400, fontFamily: F.body, marginBottom: 16 }}>This warranty has no claims on record. Claims filed from the Claims tab will appear here.</div>
          </Card>
        ) : (
          <>
            {/* Active Claims */}
            {activeClaims.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: F.head, marginBottom: 8 }}>Active Claims</div>
                {activeClaims.map(claim => (
                  <Card key={claim.id} style={{ marginBottom: 10, borderLeft: `4px solid ${C.yellow}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: F.head }}>{claim.manufacturer} Claim</div>
                        <div style={{ fontSize: 12, color: C.g400, marginTop: 2, fontFamily: F.body }}>{claim.desc}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: C.navy, fontFamily: F.head }}>{fmtMoney(claim.amount || 0)}</div>
                        <Badge status={claim.status} />
                      </div>
                    </div>

                    {/* Timeline */}
                    {claim.timeline && claim.timeline.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: F.head, marginBottom: 8 }}>Timeline</div>
                        <div style={{ paddingLeft: 20, borderLeft: `2px solid ${C.g200}` }}>
                          {claim.timeline.map((e, i) => (
                            <div key={i} style={{ position: "relative", paddingBottom: i < claim.timeline.length - 1 ? 12 : 0 }}>
                              <div style={{ position: "absolute", left: -25, top: 4, width: 10, height: 10, borderRadius: 5, background: i === claim.timeline.length - 1 ? C.green : C.white, border: `2px solid ${i === claim.timeline.length - 1 ? C.green : C.g200}` }} />
                              <div style={{ fontSize: 11, color: C.g400, marginBottom: 2 }}>{fmtDate(e.date)}</div>
                              <div style={{ fontSize: 12, color: C.navy, lineHeight: 1.4 }}>{e.event}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Resolved Claims */}
            {resolvedClaims.length > 0 && (
              <CollapsibleSection title="Resolved Claims" color={C.green} borderColor={C.green} count={resolvedClaims.length} defaultOpen={false}>
                {resolvedClaims.map(claim => (
                  <div key={claim.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.g100}` }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, fontFamily: F.head }}>{claim.manufacturer} — {claim.desc}</div>
                      <div style={{ fontSize: 11, color: C.g400, fontFamily: F.body, marginTop: 2 }}>Filed {fmtDate(claim.timeline?.[0]?.date)}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: claim.status === "approved" ? C.green : C.red, fontFamily: F.head }}>{fmtMoney(claim.amount || 0)}</div>
                      <Badge status={claim.status} />
                    </div>
                  </div>
                ))}
              </CollapsibleSection>
            )}
          </>
        )}

      </div>

      {/* ════════════════════════════════════════════════════════════════
         RECOVERY TRACKER — Amounts covered by others (warranty, tenant, etc.)
         Claim → Roof → Property → Owner → Account rollup
         ════════════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: 8 }}>
        <Card style={{ borderLeft: `4px solid ${C.green}`, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.green }}>{Ic.dollar}</span>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.green, fontFamily: F.head }}>Recovery Tracker</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: totalRecovered > 0 ? C.green : C.g400, fontFamily: F.head }}>{fmtMoney(totalRecovered)}</div>
          </div>
          <div style={{ fontSize: 12, color: C.g600, fontFamily: F.body, marginBottom: 16, lineHeight: 1.5 }}>
            Total amount covered by other responsible parties for this roof — manufacturer warranty claims, tenant back-billing, and third-party recoveries.
          </div>

          {/* Breakdown by responsible party */}
          {roofClaims.length > 0 ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: F.head, marginBottom: 10 }}>Recovery Breakdown</div>
              {roofClaims.filter(c => (c.amount || 0) > 0).map(claim => {
                const party = claim.status === "approved" ? "Manufacturer Warranty" : claim.status === "in-progress" ? "Pending Review" : claim.status === "denied" ? "Denied" : "Pending";
                const isApproved = claim.status === "approved" || claim.status === "completed";
                return (
                  <div key={claim.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", marginBottom: 6, borderRadius: 10, background: isApproved ? C.greenLt : C.g50, border: `1px solid ${isApproved ? C.green + "30" : C.g200}` }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, fontFamily: F.body }}>{claim.manufacturer} — {claim.desc}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        <Badge status={claim.status} />
                        <span style={{ fontSize: 11, color: C.g400, fontFamily: F.body }}>{party}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: isApproved ? C.green : C.g400, fontFamily: F.head }}>{fmtMoney(claim.amount || 0)}</div>
                  </div>
                );
              })}
              {roofClaims.filter(c => (c.amount || 0) > 0).length === 0 && (
                <div style={{ fontSize: 13, color: C.g400, fontFamily: F.body, textAlign: "center", padding: "12px 0" }}>No recovery amounts recorded yet.</div>
              )}

              {/* Totals row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: `2px solid ${C.g200}` }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, fontFamily: F.head }}>Total Recovered</div>
                  <div style={{ fontSize: 11, color: C.g400, fontFamily: F.body }}>{roofClaims.filter(c => c.status === "approved").length} approved of {roofClaims.length} total claims</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: totalRecovered > 0 ? C.green : C.g400, fontFamily: F.head }}>{fmtMoney(totalRecovered)}</div>
              </div>
              {pendingRecovery > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#b45309", fontFamily: F.body }}>Pending Recovery</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#b45309", fontFamily: F.head }}>{fmtMoney(pendingRecovery)}</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "12px 0", fontSize: 13, color: C.g400, fontFamily: F.body }}>
              No claims or recoveries recorded for this roof yet.
            </div>
          )}
        </Card>
      </div>
    </div>;
}

function Warranties({ OWNERS, pricingStore, setPricingStore, pricingLoading, CLAIMS }) {
  const navigate = useNavigate();
  const roofs = allRoofs(OWNERS);
  const allClaimsArr = CLAIMS || [];
  const dashRecovered = allClaimsArr.filter(c => c.status === "approved" || c.status === "completed").reduce((s, c) => s + (c.amount || 0), 0);
  const dashPending = allClaimsArr.filter(c => c.status === "in-progress" || c.status === "review" || c.status === "pending").reduce((s, c) => s + (c.amount || 0), 0);

  return <div>
    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: "0 0 4px" }}>Warranty Dashboard</h2>
    <p style={{ fontSize: 13, color: C.g600, fontFamily: F.body, margin: "0 0 20px" }}>Track coverage, compliance, and recovery across all warranties</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
      <KPI label="Total Roofs" value={roofs.length} icon={Ic.shield} />
      <KPI label="Active" value={roofs.filter(r=>r.warranty.status==="active").length} icon={Ic.check} />
      <KPI label="At Risk" value={roofs.filter(r=>r.warranty.compliance==="at-risk"||r.warranty.compliance==="expired-inspection").length} icon={Ic.alert} color={C.red} />
      <KPI label="Total Recovered" value={dashRecovered > 0 ? fmtMoney(dashRecovered) : "$0"} icon={Ic.dollar} color={C.green} sub={dashPending > 0 ? `${fmtMoney(dashPending)} pending` : undefined} />
    </div>
    {roofs.map(r => { const w=r.warranty; const p=pctUsed(w.start,w.end); const rc=(CLAIMS||[]).filter(c=>c.roofId===r.id); const roofRecovered=rc.filter(c=>c.status==="approved"||c.status==="completed").reduce((s,c)=>s+(c.amount||0),0); const roofPending=rc.filter(c=>c.status==="in-progress"||c.status==="review"||c.status==="pending").reduce((s,c)=>s+(c.amount||0),0); return <Card key={r.id} onClick={() => navigate(`/warranties/${r.id}`)} style={{ marginBottom: 12, cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div><div style={{ fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: F.head }}>{r.section}</div>
        <div style={{ fontSize: 12, color: C.g400, fontFamily: F.body, marginTop: 2 }}>{r.propName} · {r.ownerName}</div></div>
        <Badge status={w.compliance} />
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: F.head }}>{w.manufacturer} | {r.type} | {termYears(w.start, w.end)} Year</div>
        <div style={{ fontSize: 11, color: C.g400, fontFamily: F.body, marginTop: 2 }}>{w.wType} · {r.sqFt.toLocaleString()} sqft</div>
      </div>
      <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: C.g100, overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: "100%", borderRadius: 3, background: p > 75 ? C.yellow : C.green }} />
      </div>
      {(roofRecovered > 0 || roofPending > 0) && <div style={{ display: "flex", gap: 12, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.g100}` }}>
        {roofRecovered > 0 && <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: C.green, fontFamily: F.head }}>{Ic.dollar} {fmtMoney(roofRecovered)} recovered</div>}
        {roofPending > 0 && <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#b45309", fontFamily: F.head }}>{Ic.clock} {fmtMoney(roofPending)} pending</div>}
        <div style={{ fontSize: 11, color: C.g400, fontFamily: F.body }}>{rc.length} claim{rc.length!==1?"s":""}</div>
      </div>}
    </Card>; })}
  </div>;
}

function AccessLog({ ACCESS_LOGS, OWNERS, onAdd }) {
  return <div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
      <div><h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: 0 }}>Roof Access Log</h2>
      <p style={{ fontSize: 13, color: C.g600, fontFamily: F.body, margin: "4px 0 0" }}>QR-based tracking of everyone who goes on the roof</p></div>
      <Btn primary onClick={onAdd}>{Ic.plus} Log Access</Btn>
    </div>
    {(ACCESS_LOGS || []).map(log => { const r=findRoof(OWNERS, log.roofId); const isU=log.person==="Unknown"; return <Card key={log.id} style={{ marginBottom: 10, borderLeft: isU ? `4px solid ${C.red}` : `4px solid ${C.g200}` }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div><span style={{ fontSize: 14, fontWeight: 700, color: isU ? C.red : C.navy, fontFamily: F.head }}>{log.person}</span>
        {isU && <Badge status="overdue" label="Unauthorized" />}
        <div style={{ fontSize: 12, color: C.g400, fontFamily: F.body, marginTop: 2 }}>{log.company} · {log.purpose}</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{fmtDate(log.date)}</div><div style={{ fontSize: 11, color: C.g400 }}>{log.duration}</div></div>
      </div>
      {r && <div style={{ fontSize: 11, color: C.blue, fontWeight: 600, marginTop: 8 }}>{r.section} · {r.propName}</div>}
      {log.notes && <div style={{ fontSize: 12, color: C.g600, marginTop: 6, padding: "8px 12px", background: C.g50, borderRadius: 8 }}>{log.notes}</div>}
    </Card>; })}
  </div>;
}

function InvoicesTab({ INVOICES, OWNERS, onAdd }) {
  const invoices = INVOICES || [];
  const flagged = invoices.filter(i => i.flagged);
  const potentialRecovery = flagged.reduce((s, i) => s + i.amount, 0);
  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
      <div><h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: "0 0 4px" }}>Invoice Tracker</h2>
      <p style={{ fontSize: 13, color: C.g600, fontFamily: F.body, margin: 0 }}>Upload, tag, and flag invoices against warranty coverage</p></div>
      <Btn primary onClick={onAdd}>{Ic.plus} Create Invoice</Btn>
    </div>
    {potentialRecovery > 0 && <div style={{ background: C.yellowBg, border: `1.5px solid ${C.yellowBdr}`, borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ color: C.yellow }}>{Ic.alert}</span>
      <div><div style={{ fontSize: 14, fontWeight: 700, color: "#92400e", fontFamily: F.head }}>Potential Warranty Recovery: {fmtMoney(potentialRecovery)}</div>
      <div style={{ fontSize: 12, color: "#b45309" }}>{flagged.length} invoices flagged for review</div></div>
    </div>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
      <KPI label="Total Invoices" value={invoices.length} icon={Ic.file} />
      <KPI label="Flagged" value={flagged.length} icon={Ic.flag} color={C.yellow} />
      <KPI label="Potential Recovery" value={fmtMoney(potentialRecovery)} icon={Ic.dollar} color={C.green} />
    </div>
    {invoices.map(inv => { const r=findRoof(OWNERS, inv.roofId); return <Card key={inv.id} style={{ marginBottom: 10, borderLeft: inv.flagged ? `4px solid ${C.yellow}` : `4px solid ${C.g200}` }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div><div style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: F.head }}>{inv.vendor}</div>
        <div style={{ fontSize: 12, color: C.g400, marginTop: 2 }}>{inv.desc}</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 16, fontWeight: 800, color: C.navy, fontFamily: F.head }}>{inv.amount > 0 ? fmtMoney(inv.amount) : "—"}</div><Badge status={inv.status} /></div>
      </div>
      {r && <div style={{ fontSize: 11, color: C.blue, fontWeight: 600, marginTop: 8 }}>{r.section} · {r.propName}</div>}
      {inv.flagged && <div style={{ marginTop: 10, padding: "10px 14px", background: C.yellowBg, borderRadius: 8, border: `1px solid ${C.yellowBdr}`, display: "flex", gap: 8 }}>
        <span style={{ color: C.yellow }}>{Ic.flag}</span><span style={{ fontSize: 12, color: "#92400e" }}>{inv.flagReason}</span>
      </div>}
    </Card>; })}
  </div>;
}

function InspectionsTab({ INSPECTIONS, OWNERS, onAdd }) {
  const inspections = INSPECTIONS || [];
  const upcoming = inspections.filter(i => i.status === "scheduled" || i.status === "overdue");
  const completed = inspections.filter(i => i.status === "completed");
  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
      <div><h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: 0 }}>Inspection Manager</h2>
      <p style={{ fontSize: 13, color: C.g600, fontFamily: F.body, margin: "4px 0 0" }}>Schedule, track, and document warranty-required inspections</p></div>
      <Btn primary onClick={onAdd}>{Ic.plus} Schedule Inspection</Btn>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
      <KPI label="Upcoming" value={upcoming.length} icon={Ic.cal} color={C.blue} />
      <KPI label="Overdue" value={inspections.filter(i=>i.status==="overdue").length} icon={Ic.alert} color={C.red} />
      <KPI label="Completed" value={completed.length} icon={Ic.check} />
    </div>
    {upcoming.map(insp => { const r=findRoof(OWNERS, insp.roofId); const days=daysTo(insp.date); return <Card key={insp.id} style={{ marginBottom: 10, borderLeft: insp.status==="overdue" ? `4px solid ${C.red}` : `4px solid ${C.blue}` }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div><div style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: F.head }}>{insp.type}</div>
        {r && <div style={{ fontSize: 12, color: C.g400, marginTop: 2 }}>{r.section} · {r.propName}</div>}</div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 14, fontWeight: 700, color: days<0?C.red:C.navy }}>{days<0 ? `${Math.abs(days)} days overdue` : `${days} days`}</div><Badge status={insp.status} /></div>
      </div>
      <div style={{ fontSize: 12, color: C.g600, marginTop: 8 }}>{insp.notes}</div>
    </Card>; })}
    {completed.map(insp => { const r=findRoof(OWNERS, insp.roofId); return <Card key={insp.id} style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div><div style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: F.head }}>{insp.type}</div>
        {r && <div style={{ fontSize: 12, color: C.g400, marginTop: 2 }}>{r.section} · {r.propName}</div>}
        <div style={{ fontSize: 12, color: C.g600, marginTop: 4 }}>{insp.inspector} ({insp.company}) · {fmtDate(insp.date)}</div></div>
        <Badge status="completed" />
      </div>
      {insp.score && <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <span style={{ padding: "6px 14px", borderRadius: 8, background: insp.score>=90?C.greenLt:C.yellowBg, fontSize: 13, fontWeight: 700, color: insp.score>=90?C.greenDk:"#b45309" }}>Score: {insp.score}/100</span>
        {insp.photos>0 && <span style={{ padding: "6px 14px", borderRadius: 8, background: C.g100, fontSize: 12 }}>{insp.photos} photos</span>}
        {insp.moistureData && <span style={{ padding: "6px 14px", borderRadius: 8, background: C.greenLt, fontSize: 12, color: C.greenDk }}>MRI Data ✓</span>}
      </div>}
      <div style={{ fontSize: 12, color: C.g600, marginTop: 8 }}>{insp.notes}</div>
    </Card>; })}
  </div>;
}

function ClaimsTab({ CLAIMS, OWNERS, onAdd }) {
  const claims = CLAIMS || [];
  const recovered = claims.filter(c=>c.status==="approved").reduce((s,c)=>s+c.amount,0);
  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
      <div><h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: 0 }}>Warranty Claims</h2>
      <p style={{ fontSize: 13, color: C.g600, fontFamily: F.body, margin: "4px 0 0" }}>Initiate, track, and resolve manufacturer warranty claims</p></div>
      <Btn primary onClick={onAdd}>{Ic.plus} File Claim</Btn>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
      <KPI label="Total Claims" value={claims.length} icon={Ic.file} />
      <KPI label="In Progress" value={claims.filter(c=>c.status==="in-progress").length} icon={Ic.clock} color={C.blue} />
      <KPI label="Recovered" value={fmtMoney(recovered)} icon={Ic.dollar} color={C.green} />
    </div>
    {claims.map(claim => { const r=findRoof(OWNERS, claim.roofId); return <Card key={claim.id} style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div><div style={{ fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: F.head }}>{claim.manufacturer} Claim</div>
        <div style={{ fontSize: 12, color: C.g400, marginTop: 2 }}>{claim.desc}</div>
        {r && <div style={{ fontSize: 11, color: C.blue, fontWeight: 600, marginTop: 6 }}>{r.section} · {r.propName}</div>}</div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 18, fontWeight: 800, color: claim.status==="approved"?C.green:C.navy, fontFamily: F.head }}>{fmtMoney(claim.amount)}</div><Badge status={claim.status} /></div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: F.head, marginBottom: 8 }}>Timeline</div>
      <div style={{ paddingLeft: 20, borderLeft: `2px solid ${C.g200}` }}>
        {claim.timeline.map((e,i) => <div key={i} style={{ position: "relative", paddingBottom: i<claim.timeline.length-1?16:0 }}>
          <div style={{ position: "absolute", left: -25, top: 4, width: 12, height: 12, borderRadius: 6, background: i===claim.timeline.length-1?C.green:C.white, border: `2px solid ${i===claim.timeline.length-1?C.green:C.g200}` }} />
          <div style={{ fontSize: 11, color: C.g400, marginBottom: 2 }}>{fmtDate(e.date)}</div>
          <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.5 }}>{e.event}</div>
        </div>)}
      </div>
    </Card>; })}
  </div>;
}

// ══════════════════════════════════════════════════════════════════════
//  GUIDED TOUR — Interactive walkthrough for first-time users
// ══════════════════════════════════════════════════════════════════════

const TOUR_STEPS = [
  {
    title: "Welcome to Roof MRI Warranty Manager",
    description: "This platform helps you manage commercial roof warranties, track inspections, file claims, and protect your roofing investments. Let's take a quick tour to get you started!",
    position: "center",
    icon: Ic.shield,
  },
  {
    title: "Accounts Tab",
    description: "This is your client database. Here you'll manage building owners, their properties, and individual roof sections. Each roof can have warranties, inspections, and claims attached to it. Click '+ Add Owner' to start building your portfolio.",
    targetTab: "accounts",
    position: "below-tabs",
    icon: Ic.building,
  },
  {
    title: "Warranties Tab",
    description: "Browse and compare over 200+ manufacturer warranties from top brands like GAF, Carlisle, Sika Sarnafil, and more. Select a roof from your accounts to see its active warranties, coverage details, and expiration timelines.",
    targetTab: "warranties",
    position: "below-tabs",
    icon: Ic.shield,
  },
  {
    title: "Access Log",
    description: "Track every time someone accesses a roof. Log contractor visits, inspections, emergency access, and unauthorized entries. This creates an audit trail that's essential for warranty compliance.",
    targetTab: "access",
    position: "below-tabs",
    icon: Ic.qr,
  },
  {
    title: "Invoices",
    description: "Upload and manage roofing invoices. Flag invoices that may affect warranty coverage, track payments, and keep a complete financial record tied to each property and roof section.",
    targetTab: "invoices",
    position: "below-tabs",
    icon: Ic.dollar,
  },
  {
    title: "Inspections",
    description: "Schedule and track required warranty inspections. Many manufacturer warranties require periodic inspections to stay valid. This tab helps you never miss a deadline and keeps your warranties active.",
    targetTab: "inspections",
    position: "below-tabs",
    icon: Ic.cal,
  },
  {
    title: "Claims",
    description: "File and track warranty claims with manufacturers. Follow the full lifecycle from filing to resolution, with timeline tracking for every event. See exactly how much you've recovered for your clients.",
    targetTab: "claims",
    position: "below-tabs",
    icon: Ic.file,
  },
  {
    title: "Warranty Analyzer",
    description: "The green button in the bottom-right corner opens the Warranty Analyzer — a powerful tool that lets you compare warranties side-by-side, get AI-powered recommendations, and find the best coverage for any roof type.",
    position: "bottom-right",
    icon: Ic.zap,
  },
  {
    title: "Placeholder Data",
    description: "We've loaded sample data so you can see the platform in action. When you're ready to start with your own clients, use the yellow banner to clear the placeholder data — or keep it as reference examples.",
    position: "center",
    icon: Ic.layers,
  },
  {
    title: "You're All Set!",
    description: "You're ready to start managing warranties like a pro. If you ever need to see this tour again, click the '?' help button in the top navigation bar. Happy managing!",
    position: "center",
    icon: Ic.check,
  },
];

function GuidedTour({ open, onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const total = TOUR_STEPS.length;
  const current = TOUR_STEPS[step];

  const TAB_TO_PATH = { accounts: "/accounts", warranties: "/warranties", access: "/access", invoices: "/invoices", inspections: "/inspections", claims: "/claims" };

  useEffect(() => {
    if (open && current.targetTab) {
      navigate(TAB_TO_PATH[current.targetTab] || `/${current.targetTab}`);
    }
  }, [step, open]);

  if (!open) return null;

  const next = () => { if (step < total - 1) setStep(step + 1); else onClose(); };
  const prev = () => { if (step > 0) setStep(step - 1); };
  const skip = () => { onClose(); };

  // Position the tooltip based on step type
  const getTooltipStyle = () => {
    const base = {
      background: C.white, borderRadius: 20, padding: "32px 28px", maxWidth: 480, width: "90vw",
      boxShadow: "0 20px 60px rgba(30,44,85,0.25)", position: "relative", zIndex: 10001,
      animation: "tourFadeIn 0.3s ease",
    };
    if (current.position === "center") {
      return { ...base, margin: "auto" };
    }
    if (current.position === "below-tabs") {
      return { ...base, margin: "0 auto", marginTop: 120 };
    }
    if (current.position === "bottom-right") {
      return { ...base, position: "fixed", bottom: 90, right: 24, zIndex: 10001, margin: 0 };
    }
    return base;
  };

  return (
    <>
      <style>{`
        @keyframes tourFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes tourPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(0,189,112,0.4); } 50% { box-shadow: 0 0 0 12px rgba(0,189,112,0); } }
      `}</style>
      <div onClick={skip} style={{ position: "fixed", inset: 0, background: "rgba(30,44,85,0.65)", zIndex: 10000, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: current.position === "center" ? "20vh" : 0 }}>
        <div onClick={e => e.stopPropagation()} style={getTooltipStyle()}>
          {/* Step icon */}
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.green}, ${C.greenDk})`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: C.white, animation: "tourPulse 2s infinite" }}>
            {current.icon}
          </div>

          {/* Step indicator */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
            {TOUR_STEPS.map((_, i) => (
              <div key={i} style={{ width: i === step ? 24 : 8, height: 4, borderRadius: 2, background: i === step ? C.green : i < step ? C.greenLt : C.g200, transition: "all 0.3s ease" }} />
            ))}
          </div>

          {/* Content */}
          <h3 style={{ fontSize: 20, fontWeight: 800, color: C.navy, fontFamily: F.head, margin: "0 0 8px" }}>{current.title}</h3>
          <p style={{ fontSize: 14, color: C.g600, fontFamily: F.body, lineHeight: 1.7, margin: "0 0 24px" }}>{current.description}</p>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={skip} style={{ background: "none", border: "none", color: C.g400, fontSize: 13, cursor: "pointer", fontFamily: F.body, fontWeight: 500 }}>Skip Tour</button>
            <div style={{ display: "flex", gap: 8 }}>
              {step > 0 && (
                <button onClick={prev} style={{ padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${C.g200}`, background: C.white, fontSize: 13, fontWeight: 600, fontFamily: F.head, color: C.navy, cursor: "pointer" }}>Back</button>
              )}
              <button onClick={next} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: C.green, fontSize: 13, fontWeight: 700, fontFamily: F.head, color: C.white, cursor: "pointer" }}>
                {step === total - 1 ? "Get Started" : `Next (${step + 1}/${total})`}
              </button>
            </div>
          </div>

          {/* Step counter */}
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: C.g400, fontFamily: F.body }}>
            Step {step + 1} of {total}
          </div>
        </div>
      </div>
    </>
  );
}

const TABS = [
  { id: "accounts", label: "Accounts", icon: Ic.building },
  { id: "warranties", label: "Warranties", icon: Ic.shield },
  { id: "access", label: "Access Log", icon: Ic.qr },
  { id: "invoices", label: "Invoices", icon: Ic.dollar },
  { id: "inspections", label: "Inspections", icon: Ic.cal },
  { id: "claims", label: "Claims", icon: Ic.file },
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive current tab from URL path
  const pathSegment = location.pathname.split("/")[1] || "accounts";
  const TAB_IDS = ["accounts", "warranties", "access", "invoices", "inspections", "claims"];
  const tab = TAB_IDS.includes(pathSegment) ? pathSegment : "accounts";

  // ── Auth State ──
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [analyzerOpen, setAnalyzerOpen] = useState(false);

  // ── Tour State ──
  const [tourOpen, setTourOpen] = useState(false);

  // ── Modal State ──
  const [addOwnerOpen, setAddOwnerOpen] = useState(false);
  const [fileClaimOpen, setFileClaimOpen] = useState(false);
  const [scheduleInspOpen, setScheduleInspOpen] = useState(false);
  const [logAccessOpen, setLogAccessOpen] = useState(false);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);

  // ── API State ──
  const [owners, setOwners] = useState([]);
  const [warrantyDb, setWarrantyDb] = useState([]);
  const [pricingStore, setPricingStore] = useState({});
  const [pricingLoading, setPricingLoading] = useState(false);
  const [accessLogs, setAccessLogs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasDemoData, setHasDemoData] = useState(false);
  const [clearingDemo, setClearingDemo] = useState(false);
  // Set this to a YouTube/Vimeo embed URL when a walkthrough video is recorded
  const [videoUrl] = useState(""); // e.g. "https://www.youtube.com/embed/VIDEO_ID"

  // Check for existing auth token on mount, or handle OAuth callback
  const [oauthError, setOauthError] = useState("");
  const [passwordResetToken, setPasswordResetToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("auth_token");
    const oauthErr = params.get("auth_error");
    const resetTok = params.get("reset_token");

    // Clean up URL params from OAuth redirect or password reset
    if (oauthToken || oauthErr || resetTok) {
      navigate(window.location.pathname, { replace: true });
    }

    if (resetTok) {
      setPasswordResetToken(resetTok);
      setAuthChecked(true);
      return;
    }

    if (oauthErr) {
      setOauthError(oauthErr);
      setAuthChecked(true);
      return;
    }

    if (oauthToken) {
      localStorage.setItem("auth_token", oauthToken);
      getMe().then(res => { setUser(res.user); setAuthChecked(true); })
        .catch((err) => {
          console.error("[OAuth] getMe failed after Google login:", err);
          // Fallback: decode the JWT payload to get basic user info for the UI.
          // The token is still stored and will be verified server-side on each API call.
          try {
            const payload = JSON.parse(atob(oauthToken.split(".")[1]));
            setUser({ id: payload.id, email: payload.email, firstName: payload.firstName, lastName: payload.lastName });
            setAuthChecked(true);
          } catch (decodeErr) {
            localStorage.removeItem("auth_token");
            setOauthError("Login succeeded but failed to load your profile. Please try again.");
            setAuthChecked(true);
          }
        });
    } else {
      const token = localStorage.getItem("auth_token");
      if (token) {
        getMe().then(res => { setUser(res.user); setAuthChecked(true); })
          .catch(() => { localStorage.removeItem("auth_token"); setAuthChecked(true); });
      } else {
        setAuthChecked(true);
      }
    }
  }, []);

  const handleAuth = (userData) => {
    setUser(userData);
    // Show tour for first-time users
    if (!localStorage.getItem("tour_completed")) {
      setTimeout(() => setTourOpen(true), 800);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  const handleClearDemoData = async () => {
    if (!window.confirm("Are you sure you want to clear all placeholder data? This cannot be undone. Your real data (if any) will not be affected.")) return;
    setClearingDemo(true);
    try {
      await clearDemoData();
      setHasDemoData(false);
      await loadAll();
    } catch (err) {
      alert("Failed to clear demo data: " + err.message);
    } finally {
      setClearingDemo(false);
    }
  };

  const handleConvertToExamples = async () => {
    if (!window.confirm("This will rename all sample data to clearly labeled examples (e.g. 'Example Property: Riverside Medical Center'). Continue?")) return;
    setClearingDemo(true);
    try {
      await convertToExamples();
      setHasDemoData(false);
      await loadAll();
    } catch (err) {
      alert("Failed to convert to examples: " + err.message);
    } finally {
      setClearingDemo(false);
    }
  };

  const loadAll = useCallback(() => {
    return Promise.all([
      fetchAccounts().catch(() => []),
      fetchWarrantyDb().catch(() => []),
      fetchPricingStore().catch(() => ({})),
      fetchAccessLogs().catch(() => []),
      fetchInvoices().catch(() => []),
      fetchInspections().catch(() => []),
      fetchClaims().catch(() => []),
      checkDemoData().catch(() => ({ hasDemoData: false })),
    ]).then(([acc, wdb, pricing, logs, inv, insp, cl, demo]) => {
      setOwners(acc);
      setWarrantyDb(wdb);
      setPricingStore(pricing);
      setAccessLogs(logs);
      setInvoices(inv);
      setInspections(insp);
      setClaims(cl);
      setHasDemoData(demo.hasDemoData);
      setLoading(false);
    });
  }, []);

  useEffect(() => { if (user) loadAll(); }, [user, loadAll]);

  // Targeted refresh functions
  const refreshAccounts = useCallback(() => fetchAccounts().catch(() => []).then(setOwners), []);
  const refreshClaims = useCallback(() => fetchClaims().catch(() => []).then(setClaims), []);
  const refreshInspections = useCallback(() => fetchInspections().catch(() => []).then(setInspections), []);
  const refreshAccessLogs = useCallback(() => fetchAccessLogs().catch(() => []).then(setAccessLogs), []);
  const refreshInvoices = useCallback(() => fetchInvoices().catch(() => []).then(setInvoices), []);

  const onSelectRoof = (roofId) => { navigate(`/warranties/${roofId}`); };

  // ── Auth check loading ──
  if (!authChecked) return (
    <div style={{ minHeight: "100vh", background: C.g50, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <span style={{ color: C.white, fontFamily: F.head, fontWeight: 800, fontSize: 18 }}>MRI</span>
        </div>
        <div style={{ fontSize: 14, color: C.g600, fontFamily: F.body }}>Loading...</div>
      </div>
    </div>
  );

  // ── Show auth screen if not logged in ──
  if (!user) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <AuthScreen onAuth={handleAuth} oauthError={oauthError} initialResetToken={passwordResetToken} />
    </>
  );

  // ── Data loading ──
  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.g50, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.body }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <span style={{ color: C.white, fontFamily: F.head, fontWeight: 800, fontSize: 18 }}>MRI</span>
        </div>
        <div style={{ fontSize: 14, color: C.g600, fontFamily: F.body }}>Loading Warranty Manager...</div>
      </div>
    </div>
  );

  const displayName = user.companyName || `${user.firstName} ${user.lastName}`;

  return <div style={{ minHeight: "100vh", background: C.g50, fontFamily: F.body }}>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <WarrantyAnalyzer open={analyzerOpen} onClose={() => setAnalyzerOpen(false)} WARRANTY_DB={warrantyDb} />
    <GuidedTour open={tourOpen} onClose={() => { setTourOpen(false); localStorage.setItem("tour_completed", "true"); }} />
    <AddOwnerModal open={addOwnerOpen} onClose={() => setAddOwnerOpen(false)} onSaved={refreshAccounts} />
    <FileClaimModal open={fileClaimOpen} onClose={() => setFileClaimOpen(false)} onSaved={refreshClaims} OWNERS={owners} />
    <ScheduleInspectionModal open={scheduleInspOpen} onClose={() => setScheduleInspOpen(false)} onSaved={refreshInspections} OWNERS={owners} />
    <LogAccessModal open={logAccessOpen} onClose={() => setLogAccessOpen(false)} onSaved={refreshAccessLogs} OWNERS={owners} />
    <CreateInvoiceModal open={createInvoiceOpen} onClose={() => setCreateInvoiceOpen(false)} onSaved={refreshInvoices} OWNERS={owners} />
    <div style={{ background: C.navy, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: C.white, fontFamily: F.head, fontWeight: 800, fontSize: 14 }}>MRI</span>
        </div>
        <div><div style={{ fontSize: 14, fontWeight: 800, color: C.white, fontFamily: F.head }}>Warranty Manager</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: F.body }}>Roof MRI Certified Platform</div></div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{Ic.user} <span>{displayName}</span></div>
        <button onClick={() => setTourOpen(true)} title="Take a tour" style={{ background: "none", border: `1px solid rgba(255,255,255,0.2)`, borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: F.head, fontWeight: 700, cursor: "pointer" }}>?</button>
        <button onClick={handleLogout} style={{ background: "none", border: `1px solid rgba(255,255,255,0.2)`, borderRadius: 8, padding: "5px 12px", color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: F.body, cursor: "pointer" }}>Sign Out</button>
      </div>
    </div>
    <div style={{ background: C.white, borderBottom: `1.5px solid ${C.g100}`, display: "flex", overflowX: "auto", padding: "0 32px" }}>
      {TABS.map(t => <button key={t.id} onClick={() => { navigate(`/${t.id}`); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "14px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: tab===t.id?700:500, fontFamily: F.head, color: tab===t.id?C.green:C.g400, borderBottom: tab===t.id?`2.5px solid ${C.green}`:"2.5px solid transparent", whiteSpace: "nowrap" }}>{t.icon}{t.label}</button>)}
    </div>
    {hasDemoData && <div style={{ margin: "0 32px", marginTop: 16 }}>
      {/* Welcome banner with demo data options */}
      <div style={{ padding: "20px 24px", borderRadius: 14, background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLt} 100%)`, color: C.white, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 18, fontWeight: 800, fontFamily: F.head, marginBottom: 6 }}>Welcome to Your Warranty Manager</div>
            <div style={{ fontSize: 13, opacity: 0.8, fontFamily: F.body, lineHeight: 1.6 }}>
              We've loaded sample data so you can explore the platform. You have three options:
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontFamily: F.body }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: C.green, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Ic.check}</span>
                <span><strong>Take the Tour</strong> — Learn what each section does</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontFamily: F.body }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: C.blue, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Ic.layers}</span>
                <span><strong>Keep as Examples</strong> — Convert sample data to labeled examples</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontFamily: F.body }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: C.yellow, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Ic.x}</span>
                <span><strong>Clear Data</strong> — Start fresh with a blank slate</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => setTourOpen(true)} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: C.green, color: C.white, fontSize: 13, fontWeight: 700, fontFamily: F.head, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>{Ic.target} Take the Tour</button>
            <button onClick={handleConvertToExamples} disabled={clearingDemo} style={{ padding: "10px 20px", borderRadius: 10, border: `1.5px solid rgba(255,255,255,0.3)`, background: "transparent", color: C.white, fontSize: 13, fontWeight: 600, fontFamily: F.head, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>{Ic.layers} Keep as Examples</button>
            <button onClick={handleClearDemoData} disabled={clearingDemo} style={{ padding: "10px 20px", borderRadius: 10, border: `1.5px solid rgba(255,255,255,0.2)`, background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, fontFamily: F.head, cursor: clearingDemo ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", opacity: clearingDemo ? 0.6 : 1 }}>{clearingDemo ? "Clearing..." : "Clear All Data"}</button>
          </div>
        </div>
      </div>

      {/* Video walkthrough section */}
      {videoUrl && <div style={{ padding: "16px 20px", borderRadius: 12, background: C.white, border: `1.5px solid ${C.g200}`, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ color: C.blue }}>{Ic.target}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: F.head }}>Watch: Platform Walkthrough from the Developer</span>
        </div>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 10, overflow: "hidden", background: C.g100 }}>
          <iframe src={videoUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Platform Walkthrough" />
        </div>
      </div>}
    </div>}
    <div style={{ padding: "24px 32px" }}>
      <Routes>
        <Route path="/" element={<Accounts OWNERS={owners} CLAIMS={claims} onAdd={() => setAddOwnerOpen(true)} />} />
        <Route path="/accounts" element={<Accounts OWNERS={owners} CLAIMS={claims} onAdd={() => setAddOwnerOpen(true)} />} />
        <Route path="/warranties" element={<Warranties OWNERS={owners} pricingStore={pricingStore} setPricingStore={setPricingStore} pricingLoading={pricingLoading} CLAIMS={claims} />} />
        <Route path="/warranties/:roofId" element={<WarrantyDetail OWNERS={owners} pricingStore={pricingStore} setPricingStore={setPricingStore} pricingLoading={pricingLoading} CLAIMS={claims} />} />
        <Route path="/access" element={<AccessLog ACCESS_LOGS={accessLogs} OWNERS={owners} onAdd={() => setLogAccessOpen(true)} />} />
        <Route path="/invoices" element={<InvoicesTab INVOICES={invoices} OWNERS={owners} onAdd={() => setCreateInvoiceOpen(true)} />} />
        <Route path="/inspections" element={<InspectionsTab INSPECTIONS={inspections} OWNERS={owners} onAdd={() => setScheduleInspOpen(true)} />} />
        <Route path="/claims" element={<ClaimsTab CLAIMS={claims} OWNERS={owners} onAdd={() => setFileClaimOpen(true)} />} />
        <Route path="*" element={<Accounts OWNERS={owners} CLAIMS={claims} onAdd={() => setAddOwnerOpen(true)} />} />
      </Routes>
    </div>
    <button onClick={() => setAnalyzerOpen(true)} style={{ position: "fixed", bottom: 24, right: 24, display: "flex", alignItems: "center", gap: 8, padding: "14px 22px", borderRadius: 16, background: C.green, border: "none", color: C.white, fontSize: 13, fontWeight: 700, fontFamily: F.head, cursor: "pointer", boxShadow: `0 4px 20px ${C.green}50`, zIndex: 100 }}>{Ic.zap} Warranty Analyzer</button>
  </div>;
}
