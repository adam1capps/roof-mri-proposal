import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import twilio from "twilio";
import pool from "../db.js";
import { seedDemoData, clearDemoData } from "../demoData.js";

const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "warranty-mgmt-dev-secret-change-in-prod";
const TOKEN_EXPIRY = "7d";

// Google OAuth config
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || "http://localhost:5173";
const API_URL = process.env.API_URL || "http://localhost:4000";
const GOOGLE_REDIRECT_URI = `${API_URL}/api/auth/google/callback`;

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

function mapUser(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    companyName: row.company_name,
    companyType: row.company_type,
    jobTitle: row.job_title,
    emailVerified: row.email_verified,
    phoneVerified: row.phone_verified,
    authProvider: row.auth_provider,
    createdAt: row.created_at,
  };
}

// ── POST /api/auth/register — email + password signup ──
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, companyName, companyType, jobTitle } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "firstName, lastName, email, and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Check if email already exists
    const { rows: existing } = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const userId = `user-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const passwordHash = await bcrypt.hash(password, 12);
    const emailToken = crypto.randomBytes(32).toString("hex");
    const emailTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.query(
      `INSERT INTO users (id, first_name, last_name, email, password_hash, phone, company_name, company_type, job_title, email_token, email_token_expires)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [userId, firstName, lastName, email.toLowerCase(), passwordHash,
       phone || null, companyName || null, companyType || null, jobTitle || null,
       emailToken, emailTokenExpires]
    );

    // In production, send this via email service (SendGrid, SES, etc.)
    const verifyUrl = `${process.env.APP_URL || "http://localhost:5173"}/verify-email?token=${emailToken}`;
    console.log(`[AUTH] Email verification link for ${email}: ${verifyUrl}`);

    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    const token = generateToken(rows[0]);

    // Seed demo/placeholder data for the new user
    try {
      await seedDemoData(userId, companyName);
    } catch (seedErr) {
      console.error("[AUTH] Failed to seed demo data:", seedErr);
    }

    // In production, send verifyUrl via email (SendGrid, SES). Never expose it in the response.
    res.json({ success: true, token, user: mapUser(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/login — email + password login ──
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    if (rows.length === 0) return res.status(401).json({ error: "Invalid email or password" });

    const user = rows[0];

    if (!user.password_hash) {
      return res.status(401).json({ error: `This account uses ${user.auth_provider} sign-in` });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    const token = generateToken(user);
    res.json({ success: true, token, user: mapUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/verify-email?token=xxx — confirm email address ──
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token is required" });

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email_token = $1 AND email_token_expires > NOW()",
      [token]
    );

    if (rows.length === 0) return res.status(400).json({ error: "Invalid or expired verification token" });

    await pool.query(
      "UPDATE users SET email_verified = true, email_token = NULL, email_token_expires = NULL WHERE id = $1",
      [rows[0].id]
    );

    res.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/resend-verification — resend email verification ──
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });

    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });

    if (rows[0].email_verified) return res.json({ success: true, message: "Email already verified" });

    const emailToken = crypto.randomBytes(32).toString("hex");
    const emailTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      "UPDATE users SET email_token = $1, email_token_expires = $2 WHERE id = $3",
      [emailToken, emailTokenExpires, rows[0].id]
    );

    const verifyUrl = `${process.env.APP_URL || "http://localhost:5173"}/verify-email?token=${emailToken}`;
    console.log(`[AUTH] Resend verification for ${email}: ${verifyUrl}`);

    res.json({ success: true, message: "Verification email sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/send-phone-code — send 6-digit SMS code ──
router.post("/send-phone-code", async (req, res) => {
  try {
    const { userId, phone } = req.body;
    if (!userId || !phone) return res.status(400).json({ error: "userId and phone are required" });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
      "UPDATE users SET phone = $1, phone_code = $2, phone_code_expires = $3 WHERE id = $4",
      [phone, code, expires, userId]
    );

    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      await twilioClient.messages.create({
        body: `Your warranty app verification code is: ${code}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
    } else {
      console.log(`[AUTH] Phone verification code for ${phone}: ${code} (Twilio not configured)`);
    }

    res.json({ success: true, message: "Verification code sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/verify-phone — confirm 6-digit code ──
router.post("/verify-phone", async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ error: "userId and code are required" });

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND phone_code = $2 AND phone_code_expires > NOW()",
      [userId, code]
    );

    if (rows.length === 0) return res.status(400).json({ error: "Invalid or expired verification code" });

    await pool.query(
      "UPDATE users SET phone_verified = true, phone_code = NULL, phone_code_expires = NULL WHERE id = $1",
      [userId]
    );

    res.json({ success: true, message: "Phone verified successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Temporary store for OAuth state tokens (use Redis/DB in production at scale)
const pendingOAuthStates = new Map();

// ── GET /api/auth/google/status — diagnostic endpoint for Google OAuth config ──
router.get("/google/status", (req, res) => {
  res.json({
    configured: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
    hasClientId: !!GOOGLE_CLIENT_ID,
    hasClientSecret: !!GOOGLE_CLIENT_SECRET,
    redirectUri: GOOGLE_REDIRECT_URI,
    appUrl: APP_URL,
  });
});

// ── GET /api/auth/google — redirect to Google OAuth consent screen ──
router.get("/google", (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.redirect(`${APP_URL}?auth_error=${encodeURIComponent("Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Render environment variables.")}`);
  }
  if (!GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${APP_URL}?auth_error=${encodeURIComponent("Google OAuth is partially configured. Missing GOOGLE_CLIENT_SECRET.")}`);
  }

  const state = crypto.randomBytes(16).toString("hex");
  // Store state with expiry (10 minutes)
  pendingOAuthStates.set(state, Date.now() + 10 * 60 * 1000);

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// ── GET /api/auth/google/callback — exchange code for profile, issue JWT ──
router.get("/google/callback", async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(`${APP_URL}?auth_error=${encodeURIComponent(oauthError)}`);
    }
    if (!code) {
      return res.redirect(`${APP_URL}?auth_error=${encodeURIComponent("No authorization code received")}`);
    }

    // Validate OAuth state parameter to prevent CSRF
    const stateExpiry = pendingOAuthStates.get(state);
    pendingOAuthStates.delete(state);
    if (!state || !stateExpiry || Date.now() > stateExpiry) {
      return res.redirect(`${APP_URL}?auth_error=${encodeURIComponent("Invalid or expired OAuth session. Please try again.")}`);
    }

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();

    if (tokens.error) {
      console.error("[AUTH] Google token exchange error:", tokens.error, tokens.error_description);
      const msg = tokens.error === "unauthorized_client"
        ? "Google OAuth is not authorized. Please verify the redirect URI in Google Cloud Console matches: " + GOOGLE_REDIRECT_URI
        : (tokens.error_description || tokens.error);
      return res.redirect(`${APP_URL}?auth_error=${encodeURIComponent(msg)}`);
    }

    // Get user profile from Google
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();

    if (!profile.email) {
      return res.redirect(`${APP_URL}?auth_error=${encodeURIComponent("Could not retrieve email from Google")}`);
    }

    // Check if user exists by provider ID or email
    let { rows } = await pool.query(
      "SELECT * FROM users WHERE (auth_provider = 'google' AND provider_id = $1) OR email = $2",
      [profile.id, profile.email.toLowerCase()]
    );

    let user;
    if (rows.length > 0) {
      user = rows[0];
      if (!user.provider_id) {
        await pool.query(
          "UPDATE users SET auth_provider = 'google', provider_id = $1, email_verified = true WHERE id = $2",
          [profile.id, user.id]
        );
      }
      const refreshed = await pool.query("SELECT * FROM users WHERE id = $1", [user.id]);
      user = refreshed.rows[0];
    } else {
      const userId = `user-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
      await pool.query(
        `INSERT INTO users (id, first_name, last_name, email, auth_provider, provider_id, email_verified)
         VALUES ($1, $2, $3, $4, 'google', $5, true)`,
        [userId, profile.given_name || "", profile.family_name || "", profile.email.toLowerCase(), profile.id]
      );
      const created = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
      user = created.rows[0];

      // Seed demo data for new Google OAuth users
      try {
        await seedDemoData(userId, user.company_name);
      } catch (seedErr) {
        console.error("[AUTH] Failed to seed demo data for Google user:", seedErr);
      }
    }

    const token = generateToken(user);

    // Redirect back to the frontend with the JWT token
    res.redirect(`${APP_URL}?auth_token=${token}`);
  } catch (err) {
    console.error("[AUTH] Google OAuth callback error:", err);
    res.redirect(`${APP_URL}?auth_error=${encodeURIComponent("Authentication failed. Please try again.")}`);
  }
});

// ── POST /api/auth/forgot-password — request password reset ──
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });

    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);

    // Always return success to prevent email enumeration
    if (rows.length === 0) {
      return res.json({ success: true, message: "If an account exists, a reset link has been sent" });
    }

    const user = rows[0];

    // Don't allow password reset for SSO-only accounts
    if (user.auth_provider !== "local" && !user.password_hash) {
      return res.json({ success: true, message: "If an account exists, a reset link has been sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Use email_token columns for reset (repurpose for simplicity)
    await pool.query(
      "UPDATE users SET email_token = $1, email_token_expires = $2 WHERE id = $3",
      [resetToken, resetExpires, user.id]
    );

    const resetUrl = `${APP_URL}?reset_token=${resetToken}`;
    console.log(`[AUTH] Password reset link for ${email}: ${resetUrl}`);

    // In production: send this via email service (SendGrid, SES, etc.)
    // For now, log it to console. The link will work when clicked.

    res.json({ success: true, message: "If an account exists, a reset link has been sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/reset-password — set new password with reset token ──
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: "token and newPassword are required" });
    if (newPassword.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email_token = $1 AND email_token_expires > NOW()",
      [token]
    );

    if (rows.length === 0) return res.status(400).json({ error: "Invalid or expired reset token. Please request a new reset link." });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      "UPDATE users SET password_hash = $1, email_token = NULL, email_token_expires = NULL WHERE id = $2",
      [passwordHash, rows[0].id]
    );

    res.json({ success: true, message: "Password has been reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/sso — SSO login/register (Google or LinkedIn) ──
router.post("/sso", async (req, res) => {
  try {
    const { provider, providerId, firstName, lastName, email, phone } = req.body;
    if (!provider || !providerId || !email) {
      return res.status(400).json({ error: "provider, providerId, and email are required" });
    }

    // Check if user exists by provider ID or email
    let { rows } = await pool.query(
      "SELECT * FROM users WHERE (auth_provider = $1 AND provider_id = $2) OR email = $3",
      [provider, providerId, email.toLowerCase()]
    );

    let user;
    if (rows.length > 0) {
      user = rows[0];
      // Update provider info if signing in with SSO for first time on existing email account
      if (!user.provider_id) {
        await pool.query(
          "UPDATE users SET auth_provider = $1, provider_id = $2, email_verified = true WHERE id = $3",
          [provider, providerId, user.id]
        );
      }
      // Refresh
      const refreshed = await pool.query("SELECT * FROM users WHERE id = $1", [user.id]);
      user = refreshed.rows[0];
    } else {
      // Create new user via SSO
      const userId = `user-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
      await pool.query(
        `INSERT INTO users (id, first_name, last_name, email, auth_provider, provider_id, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [userId, firstName || "", lastName || "", email.toLowerCase(), provider, providerId]
      );
      const created = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
      user = created.rows[0];

      // Seed demo data for new SSO users
      try {
        await seedDemoData(userId, user.company_name);
      } catch (seedErr) {
        console.error("[AUTH] Failed to seed demo data for SSO user:", seedErr);
      }
    }

    const token = generateToken(user);
    res.json({ success: true, token, user: mapUser(user), isNew: !rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/me — get current user from JWT ──
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
    if (rows.length === 0) return res.status(401).json({ error: "User not found" });

    res.json({ user: mapUser(rows[0]) });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/auth/profile — update user profile ──
router.put("/profile", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    const { companyName, companyType, jobTitle, phone } = req.body;

    const fields = [];
    const params = [];
    let idx = 1;
    if (companyName !== undefined) { fields.push(`company_name = $${idx++}`); params.push(companyName); }
    if (companyType !== undefined) { fields.push(`company_type = $${idx++}`); params.push(companyType); }
    if (jobTitle !== undefined) { fields.push(`job_title = $${idx++}`); params.push(jobTitle); }
    if (phone !== undefined) { fields.push(`phone = $${idx++}`); params.push(phone); }

    if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

    params.push(decoded.id);
    await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = $${idx}`, params);

    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
    res.json({ success: true, user: mapUser(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/convert-to-examples — rename demo data to example labels ──
router.post("/convert-to-examples", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);

    // Rename demo owners to "Example: ..."
    await pool.query(
      `UPDATE owners SET name = 'Example Client: ' || name, is_demo = false WHERE user_id = $1 AND is_demo = true`,
      [decoded.id]
    );

    // Rename demo properties to "Example Property: ..."
    await pool.query(
      `UPDATE properties SET name = 'Example Property: ' || name WHERE owner_id IN (SELECT id FROM owners WHERE user_id = $1) AND name NOT LIKE 'Example Property:%'`,
      [decoded.id]
    );

    res.json({ success: true, message: "Demo data has been converted to labeled examples." });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/has-demo-data — check if user has demo data ──
router.get("/has-demo-data", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    const { rows } = await pool.query(
      "SELECT COUNT(*) AS count FROM owners WHERE user_id = $1 AND is_demo = true",
      [decoded.id]
    );
    res.json({ hasDemoData: parseInt(rows[0].count) > 0 });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/auth/demo-data — clear all placeholder data for the user ──
router.delete("/demo-data", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    await clearDemoData(decoded.id);
    res.json({ success: true, message: "All placeholder data has been cleared. You can now build your own client database." });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
