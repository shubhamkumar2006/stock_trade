require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const connectDatabase = require("./config/database");

const { HoldingsModel } = require("./model/HoldingsModels");
const { PositionsModel } = require("./model/PositionsModel");
const User = require("./models/User");
const Session = require("./models/Session");
const PasswordReset = require("./models/PasswordReset");
const PhoneVerification = require("./models/PhoneVerification");
const Watchlist = require("./models/Watchlist");
const Order = require("./models/Order");

const PORT = Number(process.env.PORT || 3002);
const mongoUrl = process.env.MONGO_URL;
const isProduction = process.env.NODE_ENV === "production";
const cookieName = "singhtrades_session";
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;
const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: "20kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please wait and try again." },
});
const phoneVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => String(req.user._id),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many verification attempts. Please wait and try again." },
});

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function passwordHash(password, salt = crypto.randomBytes(16).toString("hex")) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) return reject(error);
      return resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

async function passwordMatches(password, storedHash) {
  const [salt, key] = String(storedHash || "").split(":");
  if (!salt || !key) return false;
  const candidate = await passwordHash(password, salt);
  const candidateKey = Buffer.from(candidate.split(":")[1], "hex");
  const expectedKey = Buffer.from(key, "hex");
  return candidateKey.length === expectedKey.length &&
    crypto.timingSafeEqual(candidateKey, expectedKey);
}

function setSessionCookie(res, token) {
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: sessionDurationMs,
  });
}

function clearSessionCookie(res) {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });
}

function readCookie(req, name) {
  const cookieHeader = req.headers.cookie || "";
  const cookie = cookieHeader.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

function requireAllowedOrigin(req, res, next) {
  const origin = req.get("origin");
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ message: "Request origin is not allowed." });
  }
  return next();
}

async function createSession(user, res) {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  await Session.create({
    userId: user._id,
    tokenHash: sha256(rawToken),
    expiresAt: new Date(Date.now() + sessionDurationMs),
  });
  setSessionCookie(res, rawToken);
}

async function requireSession(req, res, next) {
  try {
    const token = readCookie(req, cookieName);
    if (!token) return res.status(401).json({ message: "Please sign in to continue." });

    const session = await Session.findOne({
      tokenHash: sha256(token),
      expiresAt: { $gt: new Date() },
    });
    if (!session) {
      clearSessionCookie(res);
      return res.status(401).json({ message: "Your session expired. Please sign in again." });
    }

    const user = await User.findById(session.userId).select("fullName email phone phoneVerified role status");
    if (!user || user.status !== "active") {
      await Session.deleteOne({ _id: session._id });
      clearSessionCookie(res);
      return res.status(401).json({ message: "Your session is no longer valid." });
    }

    req.user = user;
    req.session = session;
    return next();
  } catch (error) {
    return next(error);
  }
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeIndianPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const nationalNumber = digits.length === 12 && digits.startsWith("91")
    ? digits.slice(2)
    : digits;
  return /^[6-9]\d{9}$/.test(nationalNumber) ? nationalNumber : null;
}

function publicUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || null,
    phoneVerified: Boolean(user.phoneVerified),
    role: user.role,
  };
}

const marketSnapshot = [
  { symbol: "NIFTY 50", value: 22450.35, changePercent: 0.42 },
  { symbol: "SENSEX", value: 73950.80, changePercent: 0.36 },
  { symbol: "RELIANCE", value: 1450.20, changePercent: -0.28 },
  { symbol: "INFY", value: 1518.75, changePercent: 0.81 },
  { symbol: "HDFCBANK", value: 1682.40, changePercent: 0.15 },
];

app.get("/api/health", (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  return res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "unavailable",
    database: databaseConnected ? "connected" : "disconnected",
  });
});

app.get("/api/market/overview", (_req, res) => {
  res.json({ label: "Simulated market data", simulated: true, instruments: marketSnapshot });
});

app.post("/api/auth/signup", authLimiter, requireAllowedOrigin, async (req, res, next) => {
  try {
    const fullName = String(req.body?.fullName || "").trim();
    const email = normalizeEmail(req.body?.email);
    const phone = req.body?.phone ? normalizeIndianPhone(req.body.phone) : null;
    const password = String(req.body?.password || "");

    if (fullName.length < 2 || fullName.length > 80) {
      return res.status(400).json({ message: "Enter your full name (2–80 characters)." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (req.body?.phone && !phone) {
      return res.status(400).json({ message: "Enter a valid Indian mobile number." });
    }
    if (password.length < 10 || password.length > 128 ||
      !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({
        message: "Password must be 10–128 characters and include uppercase, lowercase, and a number.",
      });
    }

    const passwordDigest = await passwordHash(password);
    const user = await User.create({
      fullName,
      email,
      phone: phone || undefined,
      passwordHash: passwordDigest,
    });
    await createSession(user, res);
    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "An account with those details already exists." });
    }
    return next(error);
  }
});

app.post("/api/auth/login", authLimiter, requireAllowedOrigin, async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");
    if (!email || !password || email.length > 254 || password.length > 128) {
      return res.status(400).json({ message: "Enter your email and password." });
    }

    const user = await User.findOne({ email }).select("+passwordHash");
    const validPassword = user && await passwordMatches(password, user.passwordHash);
    if (!validPassword || user.status !== "active") {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    await createSession(user, res);
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/auth/me", requireSession, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.post("/api/auth/logout", requireAllowedOrigin, async (req, res, next) => {
  try {
    const token = readCookie(req, cookieName);
    if (token) await Session.deleteOne({ tokenHash: sha256(token) });
    clearSessionCookie(res);
    return res.json({ message: "Signed out." });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/phone-otp/start", authLimiter, requireAllowedOrigin, requireSession, phoneVerificationLimiter, async (req, res) => {
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phone = normalizeIndianPhone(req.body?.phone || req.user.phone);

  if (!phone) return res.status(400).json({ message: "Enter a valid Indian mobile number." });
  if (!verifyServiceSid || !accountSid || !authToken) {
    return res.status(503).json({
      message: "SMS verification is unavailable. Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID in backend/.env, then restart the API.",
    });
  }

  const challenge = await PhoneVerification.findOneAndUpdate(
    { userId: req.user._id },
    {
      $set: {
        phone,
        attempts: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    },
    { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true },
  );
  try {
    const client = twilio(accountSid, authToken);
    await client.verify.v2.services(verifyServiceSid).verifications.create({
      to: `+91${phone}`,
      channel: "sms",
    });
    return res.json({ message: `Verification code sent to +91 ${phone}.` });
  } catch (error) {
    console.error("SMS verification start failed:", error.message);
    await PhoneVerification.deleteOne({ _id: challenge._id }).catch((cleanupError) => {
      console.error("SMS challenge cleanup failed:", cleanupError.message);
    });
    return res.status(502).json({ message: "The SMS provider could not send the verification code." });
  }
});

app.post("/api/auth/phone-otp/check", authLimiter, requireAllowedOrigin, requireSession, phoneVerificationLimiter, async (req, res, next) => {
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phone = normalizeIndianPhone(req.body?.phone || req.user.phone);
  const code = String(req.body?.code || "");

  if (!phone || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: "Enter a valid mobile number and 6-digit code." });
  }
  const activeChallenge = await PhoneVerification.findOne({
    userId: req.user._id,
    phone,
    expiresAt: { $gt: new Date() },
  });
  if (!activeChallenge) {
    return res.status(400).json({ message: "Verification code is invalid or expired. Request a new code." });
  }
  if (activeChallenge.attempts >= 5) {
    return res.status(429).json({ message: "Too many verification attempts. Request a new code later." });
  }
  if (!verifyServiceSid || !accountSid || !authToken) {
    return res.status(503).json({
      message: "SMS verification is unavailable. Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID in backend/.env, then restart the API.",
    });
  }

  const challenge = await PhoneVerification.findOneAndUpdate(
    {
      userId: req.user._id,
      phone,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: 5 },
    },
    { $inc: { attempts: 1 } },
    { returnDocument: "after" },
  );
  if (!challenge) {
    const existingChallenge = await PhoneVerification.findOne({ userId: req.user._id, phone });
    if (existingChallenge && existingChallenge.expiresAt > new Date() && existingChallenge.attempts >= 5) {
      return res.status(429).json({ message: "Too many verification attempts. Request a new code later." });
    }
    return res.status(400).json({ message: "Verification code is invalid or expired. Request a new code." });
  }

  let result;
  try {
    const client = twilio(accountSid, authToken);
    result = await client.verify.v2.services(verifyServiceSid).verificationChecks.create({
      to: `+91${phone}`,
      code,
    });
  } catch (error) {
    console.error("SMS verification check failed:", error.message);
    return res.status(502).json({ message: "The SMS provider could not verify that code." });
  }

  if (result.status !== "approved") {
    return res.status(challenge.attempts >= 5 ? 429 : 400).json({
      message: challenge.attempts >= 5
        ? "Too many verification attempts. Request a new code later."
        : "Verification code is incorrect or expired.",
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { phone, phoneVerified: true },
      { returnDocument: "after", runValidators: true },
    ).select("fullName email phone phoneVerified role status");
    await PhoneVerification.deleteOne({ _id: challenge._id });
    return res.json({ user: publicUser(user), message: "Mobile number verified." });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "This mobile number is already associated with an account." });
    }
    return next(error);
  }
});

app.post("/api/auth/forgot-password", authLimiter, requireAllowedOrigin, async (req, res, next) => {
  const response = { message: "If that account exists, password reset instructions will be sent." };
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM;
  if (!smtpHost || !smtpUser || !smtpPassword || !smtpFrom) {
    return res.status(503).json({
      message: "Password recovery email is unavailable. Configure SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM in backend/.env, then restart the API.",
    });
  }
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    return res.status(503).json({ message: "Password recovery email is unavailable because SMTP_PORT is invalid." });
  }

  const email = normalizeEmail(req.body?.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.json(response);

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: smtpUser, pass: smtpPassword },
    });
    try {
      await transporter.verify();
    } catch (smtpError) {
      console.error("SMTP connection check failed:", smtpError.message);
      return res.status(503).json({
        message: "Password recovery email is unavailable because the SMTP service could not be reached. Check the SMTP configuration and try again.",
      });
    }

    const user = await User.findOne({ email, status: "active" });
    if (!user) return res.json(response);

    await PasswordReset.deleteMany({ userId: user._id });
    const token = crypto.randomBytes(32).toString("base64url");
    await PasswordReset.create({
      userId: user._id,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3001").replace(/\/$/, "");
    try {
      await transporter.sendMail({
        from: smtpFrom,
        to: user.email,
        subject: "Stock Traders password reset",
        text: `Reset your Stock Traders password: ${frontendUrl}/reset-password#token=${encodeURIComponent(token)}`,
      });
    } catch (mailError) {
      await PasswordReset.deleteMany({ userId: user._id });
      console.error("Password reset email delivery failed:", mailError.message);
      return res.status(503).json({
        message: "Password reset email could not be delivered. Check the SMTP configuration and try again.",
      });
    }
    return res.json(response);
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/reset-password", authLimiter, requireAllowedOrigin, async (req, res, next) => {
  try {
    const token = String(req.body?.token || "");
    const password = String(req.body?.password || "");
    if (password.length < 10 || password.length > 128 ||
      !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({
        message: "Password must be 10–128 characters and include uppercase, lowercase, and a number.",
      });
    }
    const reset = await PasswordReset.findOneAndDelete({
      tokenHash: sha256(token),
      expiresAt: { $gt: new Date() },
    });
    if (!reset) return res.status(400).json({ message: "Reset link is invalid or expired." });
    const passwordDigest = await passwordHash(password);
    const update = await User.updateOne({ _id: reset.userId, status: "active" }, { passwordHash: passwordDigest });
    if (update.matchedCount !== 1) {
      return res.status(400).json({ message: "Reset link is invalid or expired." });
    }
    await PasswordReset.deleteMany({ userId: reset.userId });
    await Session.deleteMany({ userId: reset.userId });
    return res.json({ message: "Password updated. Please sign in again." });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/watchlist", requireSession, async (req, res, next) => {
  try {
    const entries = await Watchlist.find({ userId: req.user._id }).sort({ createdAt: 1 });
    return res.json({ instruments: entries.map((entry) => entry.symbol) });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/watchlist", requireAllowedOrigin, requireSession, async (req, res, next) => {
  const symbol = String(req.body?.symbol || "").trim().toUpperCase();
  if (!/^[A-Z0-9.&-]{1,20}$/.test(symbol)) {
    return res.status(400).json({ message: "Enter a valid instrument symbol." });
  }
  try {
    const existingEntry = await Watchlist.exists({ userId: req.user._id, symbol });
    if (!existingEntry && await Watchlist.countDocuments({ userId: req.user._id }) >= 50) {
      return res.status(409).json({ message: "Your watchlist is full (maximum 50 instruments)." });
    }
    await Watchlist.updateOne(
      { userId: req.user._id, symbol },
      { $setOnInsert: { userId: req.user._id, symbol } },
      { upsert: true, runValidators: true },
    );
    return res.status(201).json({ symbol });
  } catch (error) {
    return next(error);
  }
});

app.delete("/api/watchlist/:symbol", requireAllowedOrigin, requireSession, async (req, res, next) => {
  try {
    const symbol = String(req.params.symbol || "").trim().toUpperCase();
    await Watchlist.deleteOne({ userId: req.user._id, symbol });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.get("/api/orders", requireSession, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
    return res.json({ simulated: true, orders });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/orders", requireAllowedOrigin, requireSession, async (req, res, next) => {
  const symbol = String(req.body?.symbol || "").trim().toUpperCase();
  const side = String(req.body?.side || "").toUpperCase();
  const quantity = Number(req.body?.quantity);
  if (!/^[A-Z0-9.&-]{1,20}$/.test(symbol) ||
    !["BUY", "SELL"].includes(side) ||
    !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000) {
    return res.status(400).json({ message: "Enter a valid simulated order." });
  }
  try {
    const order = await Order.create({
      userId: req.user._id,
      symbol,
      side,
      quantity,
      status: "simulated",
    });
    return res.status(201).json({ simulated: true, order });
  } catch (error) {
    return next(error);
  }
});

app.get("/allHoldings", requireSession, async (_req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Holdings database is unavailable." });
    }
    const holdings = await HoldingsModel.find({}).lean();
    return res.json({ simulated: true, holdings });
  } catch (error) {
    return next(error);
  }
});

app.get("/allPositions", requireSession, async (_req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Positions database is unavailable." });
    }
    const positions = await PositionsModel.find({}).lean();
    return res.json({ simulated: true, positions });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error("Request failed:", error.message);
  if (res.headersSent) return;
  if (error?.code === 11000) {
    return res.status(409).json({ message: "An account with those details already exists." });
  }
  return res.status(500).json({
    message: isProduction ? "An unexpected server error occurred." : error.message,
  });
});

async function startServer() {
  await connectDatabase(mongoUrl);
  console.log("MongoDB connected");
  app.listen(PORT, () => console.log(`Stock Traders API listening on port ${PORT}`));
}

startServer().catch((error) => {
  console.error("Stock Traders startup failed:", error.message);
  process.exit(1);
});
