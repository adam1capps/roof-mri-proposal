/**
 * API Client for Roof MRI Warranty Management App
 * Connects to the Express/PostgreSQL backend on Render.
 */

const API_URL = import.meta.env.VITE_API_URL || "/api";

function getAuthHeaders() {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...getAuthHeaders(), ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

/** Fetch full account hierarchy (owners → PMs, properties → roofs → warranties) */
export const fetchAccounts = () => request("/accounts");

/** Fetch the warranty options database (223 items) */
export const fetchWarrantyDb = () => request("/warranties");

/** Fetch pricing store (grouped by warranty ID) */
export const fetchPricingStore = () => request("/pricing");

/** Submit a new pricing entry */
export const submitPricing = (data) =>
  request("/pricing", { method: "POST", body: JSON.stringify(data) });

/** Fetch access logs */
export const fetchAccessLogs = () => request("/access-logs");

/** Fetch invoices */
export const fetchInvoices = () => request("/invoices");

/** Fetch inspections */
export const fetchInspections = () => request("/inspections");

/** Fetch claims with timelines */
export const fetchClaims = () => request("/claims");

/** Create a new owner (with optional nested properties/roofs) */
export const createOwner = (data) =>
  request("/accounts", { method: "POST", body: JSON.stringify(data) });

/** Add a property to an existing owner */
export const addProperty = (ownerId, data) =>
  request(`/accounts/${ownerId}/properties`, { method: "POST", body: JSON.stringify(data) });

/** File a new warranty claim */
export const createClaim = (data) =>
  request("/claims", { method: "POST", body: JSON.stringify(data) });

/** Update a claim's status */
export const updateClaimStatus = (id, status) =>
  request(`/claims/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });

/** Schedule a new inspection */
export const createInspection = (data) =>
  request("/inspections", { method: "POST", body: JSON.stringify(data) });

/** Update an inspection */
export const updateInspection = (id, data) =>
  request(`/inspections/${id}`, { method: "PUT", body: JSON.stringify(data) });

/** Log a new roof access entry */
export const createAccessLog = (data) =>
  request("/access-logs", { method: "POST", body: JSON.stringify(data) });

/** Create a new invoice */
export const createInvoice = (data) =>
  request("/invoices", { method: "POST", body: JSON.stringify(data) });

/** Update an invoice */
export const updateInvoice = (id, data) =>
  request(`/invoices/${id}`, { method: "PUT", body: JSON.stringify(data) });

// ── Auth API ──

/** Register with email + password */
export const register = (data) =>
  request("/auth/register", { method: "POST", body: JSON.stringify(data) });

/** Login with email + password */
export const login = (data) =>
  request("/auth/login", { method: "POST", body: JSON.stringify(data) });

/** Verify email with token */
export const verifyEmail = (token) => request(`/auth/verify-email?token=${token}`);

/** Resend email verification */
export const resendVerification = (email) =>
  request("/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) });

/** Send phone verification code */
export const sendPhoneCode = (userId, phone) =>
  request("/auth/send-phone-code", { method: "POST", body: JSON.stringify({ userId, phone }) });

/** Verify phone code */
export const verifyPhone = (userId, code) =>
  request("/auth/verify-phone", { method: "POST", body: JSON.stringify({ userId, code }) });

/** SSO login/register */
export const ssoAuth = (data) =>
  request("/auth/sso", { method: "POST", body: JSON.stringify(data) });

/** Get current user from token */
export const getMe = () => request("/auth/me");

/** Update user profile */
export const updateProfile = (data) =>
  request("/auth/profile", { method: "PUT", body: JSON.stringify(data) });

/** Request a password reset email */
export const requestPasswordReset = (email) =>
  request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });

/** Reset password with token */
export const resetPassword = (token, newPassword) =>
  request("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }) });

/** Convert demo data to labeled examples */
export const convertToExamples = () =>
  request("/auth/convert-to-examples", { method: "POST" });

/** Check if user has demo/placeholder data */
export const checkDemoData = () => request("/auth/has-demo-data");

/** Clear all demo/placeholder data */
export const clearDemoData = () =>
  request("/auth/demo-data", { method: "DELETE" });
