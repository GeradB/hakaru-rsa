import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import Stripe from 'stripe';
import { jwtDecode } from 'jwt-decode';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import {
  createMembership,
  updateMembership,
  getMembership,
  listPublishedGalleryItems,
  listAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  createRenewal,
  updateRenewal,
  createDonation,
  updateDonation,
  listPublishedAlbums,
  listAllAlbums,
  ensureSiteImagesAlbum,
  SITE_IMAGES_ALBUM_NAME,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from './db.js';
import { uploadGalleryImage, deleteGalleryBlob, isAzureGalleryConfigured } from './galleryBlob.js';
import { pickFragment, CMS_SLUGS } from './cmsMerge.js';
import {
  getMergedSiteContentSafe,
  saveFragment,
  detectImageType,
  uploadCmsImage,
} from './cmsService.js';
import { teamsMessagingHandler, isTeamsBotConfigured } from './agent/teamsBot.js';
import {
  createDonorDonationEmail,
  createAdminDonationEmail,
  createMembershipConfirmationEmail,
  createAdminMembershipEmail,
  createRenewalConfirmationEmail,
  createAdminRenewalEmail,
} from './emailTemplates.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

/** Strip trailing slashes so env and browser Origin match */
const normalizeOrigin = (s) => (typeof s === 'string' ? s.trim().replace(/\/+$/, '') : '');

const resolveAllowedOrigins = () => {
  const raw = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '';
  const urls = raw
    .split(',')
    .map((s) => normalizeOrigin(s))
    .filter(Boolean);

  return urls.length ? urls : [normalizeOrigin('http://localhost:5173')];
};

/** Canonical public site (www). Apex requests for the site hostname redirect here. */
const PUBLIC_SITE_ORIGIN = normalizeOrigin(
  process.env.PUBLIC_SITE_URL || 'https://www.hakarursa.co.nz',
);
const APEX_REDIRECT_HOSTS = new Set(
  (process.env.APEX_REDIRECT_HOSTS || 'hakarursa.co.nz')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

// Redirect bare domain (and http) to https://www… — used when apex DNS points at this App Service
app.use((req, res, next) => {
  const rawHost = req.headers['x-forwarded-host'] || req.headers.host || '';
  const host = String(rawHost)
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '');
  if (!host || !APEX_REDIRECT_HOSTS.has(host)) {
    return next();
  }
  try {
    const dest = new URL(req.originalUrl || '/', `${PUBLIC_SITE_ORIGIN}/`);
    return res.redirect(301, dest.toString());
  } catch {
    return res.redirect(301, `${PUBLIC_SITE_ORIGIN}/`);
  }
});

// Middleware — browsers require your Static Web App URL in FRONTEND_URLS (see server/.env.example)
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = resolveAllowedOrigins();

      // Same-origin / server-side / curl (no Origin header)
      if (!origin) return callback(null, true);

      const o = normalizeOrigin(origin);
      if (allowed.includes(o)) return callback(null, true);

      console.warn(`CORS rejected Origin="${origin}"; set FRONTEND_URLS on the API (allowed: ${allowed.join(', ')})`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);
app.use(express.json());
app.use(cookieParser());

// In-memory store for pending memberships (fallback if DB not configured)
const pendingMemberships = new Map();
const dbConfigured = !!(process.env.SQL_SERVER_HOST || process.env.SQL_SERVER_DATABASE);

// --- Gallery & admin auth ---
const MAX_GALLERY_UPLOAD_BYTES = 10 * 1024 * 1024;
const ADMIN_SESSION_MS = 8 * 60 * 60 * 1000;
const adminSessions = new Map(); // token -> expiresAt (epoch ms)
const loginAttemptsByIp = new Map();

const mapGalleryRow = (row) => ({
  id: row.id,
  title: row.title,
  caption: row.caption,
  blobName: row.blob_name,
  publicUrl: row.public_url,
  sortOrder: row.sort_order,
  isPublished: !!row.is_published,
  albumId: row.album_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const adminAuthConfigured = () =>
  !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD_HASH);

const getClientIp = (req) =>
  req.ip ||
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.socket?.remoteAddress ||
  'unknown';

const checkLoginRateLimit = (ip) => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 20;
  let entry = loginAttemptsByIp.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    loginAttemptsByIp.set(ip, entry);
  }
  entry.count += 1;
  if (entry.count > maxAttempts) {
    return false;
  }
  return true;
};

const requireAdmin = async (req, res, next) => {
  // Check for Entra ID Bearer token first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.substring(7);
    try {
      // Decode and validate the Entra ID token
      const decoded = jwtDecode(idToken);

      // Verify token is from our tenant
      const expectedTenantId = '0f9e3c4e-92b5-4caf-ae9a-56a7e71882a8';

      if (decoded.tid !== expectedTenantId) {
        return res.status(401).json({ error: 'Invalid token tenant' });
      }

      // Check token expiration
      if (decoded.exp && Date.now() > decoded.exp * 1000) {
        return res.status(401).json({ error: 'Token expired' });
      }

      // Token is valid, attach user info to request
      req.user = {
        email: decoded.email || decoded.preferred_username,
        name: decoded.name,
        oid: decoded.oid,
      };
      return next();
    } catch (err) {
      console.error('Token validation error:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  // Fallback to username/password session
  if (!adminAuthConfigured()) {
    return res.status(503).json({ error: 'Admin authentication is not configured' });
  }
  const token = req.cookies?.admin_session;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const expiresAt = adminSessions.get(token);
  if (!expiresAt || Date.now() > expiresAt) {
    adminSessions.delete(token);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

const adminSessionCookieOptions = () => ({
  httpOnly: true,
  path: '/',
  maxAge: ADMIN_SESSION_MS,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_GALLERY_UPLOAD_BYTES },
});

/**
 * From: must match SMTP auth user unless Exchange "Send As" is granted for EMAIL_FROM.
 * If EMAIL_FROM differs from EMAIL_USER, we use EMAIL_USER unless EMAIL_FROM_TRUST_SEND_AS=true.
 */
const resolveEmailFrom = () => {
  const from = process.env.EMAIL_FROM?.trim();
  const user = process.env.EMAIL_USER?.trim();
  const trustSendAs = process.env.EMAIL_FROM_TRUST_SEND_AS === 'true';

  if (!user) return from || '';
  if (!from || from.toLowerCase() === user.toLowerCase()) return user;
  if (trustSendAs) return from;

  console.warn(
    `[email] EMAIL_FROM (${from}) ≠ EMAIL_USER (${user}); sending as ${user} to avoid SendAsDenied (554). ` +
      'Create a shared mailbox + Send As, or set EMAIL_FROM_TRUST_SEND_AS=true after granting Send As.',
  );
  return user;
};

// Email transporter setup - Office 365 / Microsoft 365 SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.office365.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Office 365 requires TLS
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false, // Required for some Office 365 setups
    },
  });
};

// Helper to send emails with error handling
const sendEmail = async (to, subject, html) => {
  const toNorm = typeof to === 'string' ? to.trim() : '';
  if (!toNorm || !toNorm.includes('@')) {
    console.error(`[email] skip send: invalid or missing recipient (${JSON.stringify(to)})`);
    return false;
  }

  try {
    const fromAddr = resolveEmailFrom();
    const smtpHost = process.env.EMAIL_HOST || 'smtp.office365.com';
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: fromAddr,
      to: toNorm,
      subject,
      html,
    });
    // SMTP 250 = accepted by this server; M365 message trace is in the tenant of EMAIL_USER.
    console.log(
      `[email] accepted by ${smtpHost} from=${fromAddr} to=${toNorm} messageId=${info.messageId || 'n/a'}`,
    );
    if (info.response) console.log(`[email] smtp last response: ${info.response}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${toNorm}:`, error.message);
    return false;
  }
};

// Generate unique transaction reference
const generateTxnRef = () => {
  return `MEM-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
};

const nzdToMinorUnits = (amountNzd) => {
  return Math.round(Number(amountNzd) * 100);
};

// POST /api/stripe/create-payment-intent
// Creates a Stripe PaymentIntent for Stripe Elements / Payment Element
app.post('/api/stripe/create-payment-intent', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(501).json({ error: 'Stripe is not configured (missing STRIPE_SECRET_KEY)' });
    }

    const { amountNzd, currency, receiptEmail, metadata } = req.body || {};

    const minorAmount = nzdToMinorUnits(amountNzd);
    const currencyLower = (currency || process.env.CURRENCY || 'NZD').toLowerCase();

    if (!Number.isFinite(minorAmount) || minorAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Validate email if provided
    if (receiptEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(receiptEmail)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: minorAmount,
      currency: currencyLower,
      receipt_email: receiptEmail || undefined,
      // Card (+ wallets via Payment Element). allow_redirects:never excludes Klarna etc.
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      metadata: metadata && typeof metadata === 'object' ? metadata : {},
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating Stripe PaymentIntent:', error);
    res.status(500).json({ error: 'Failed to create Stripe PaymentIntent' });
  }
});


// Send donation confirmation emails (to donor and admin)
const sendDonationEmails = async (formData, transactionRef, paidAt) => {
  try {
    const {
      donorType,
      fullName,
      organisationName,
      email,
      isAnonymous,
      amount,
      timing,
      interval,
      phone,
      homePhone,
      mobile,
      mailingAddress,
      mailingTown,
      mailingPostCode,
    } = formData;

    // Send confirmation to donor (if not anonymous)
    if (!isAnonymous && email) {
      const donorEmail = createDonorDonationEmail({
        fullName,
        organisationName,
        email,
        amount,
        timing,
        interval,
        donorType,
        isAnonymous,
        transactionRef,
        paidAt,
      });
      await sendEmail(email, donorEmail.subject, donorEmail.html);
    }

    // Send admin notification
    const adminEmail = createAdminDonationEmail({
      fullName,
      organisationName,
      email,
      amount,
      timing,
      interval,
      donorType,
      isAnonymous,
      homePhone: homePhone || phone,
      mobile,
      mailingAddress,
      mailingTown,
      mailingPostCode,
      transactionRef,
      paidAt,
    });
    await sendEmail(process.env.EMAIL_TO, adminEmail.subject, adminEmail.html);
  } catch (error) {
    console.error('Error sending donation emails:', error);
  }
};

// Send membership application emails (to applicant and admin)
const sendMembershipEmails = async (formData, transactionRef) => {
  try {
    const { fullName, fullName2, email, membershipType, fee, donation, total, mailingAddress, mailingTown, mailingPostCode } = formData;

    // Send confirmation to applicant
    const confirmationEmail = createMembershipConfirmationEmail({
      fullName,
      fullName2,
      email,
      membershipType,
      fee,
      donation,
      total,
      transactionRef,
      mailingAddress,
      mailingTown,
      mailingPostCode,
    });
    await sendEmail(email, confirmationEmail.subject, confirmationEmail.html);

    // Send admin notification
    const adminEmail = createAdminMembershipEmail({
      ...formData,
      transactionRef,
    });
    await sendEmail(process.env.EMAIL_TO, adminEmail.subject, adminEmail.html);
  } catch (error) {
    console.error('Error sending membership emails:', error);
  }
};

// Send renewal confirmation emails (to member and admin)
const sendRenewalEmails = async (formData, transactionRef) => {
  try {
    const { fullName, email, membershipType, fee, donation, total, mailingAddress, mailingTown, mailingPostCode } = formData;

    // Send confirmation to member
    const confirmationEmail = createRenewalConfirmationEmail({
      fullName,
      email,
      membershipType,
      fee,
      donation,
      total,
      transactionRef,
      mailingAddress,
      mailingTown,
      mailingPostCode,
    });
    await sendEmail(email, confirmationEmail.subject, confirmationEmail.html);

    // Send admin notification
    const adminEmail = createAdminRenewalEmail({
      fullName,
      email,
      membershipType,
      fee,
      donation,
      total,
      transactionRef,
    });
    await sendEmail(process.env.EMAIL_TO, adminEmail.subject, adminEmail.html);
  } catch (error) {
    console.error('Error sending renewal emails:', error);
  }
};

// GET /api/membership/status/:txnRef
// Check payment status
app.get('/api/membership/status/:txnRef', (req, res) => {
  const { txnRef } = req.params;
  const membershipData = pendingMemberships.get(txnRef);

  if (!membershipData) {
    return res.status(404).json({ error: 'Membership not found' });
  }

  res.json({
    success: true,
    status: membershipData.status,
    paidAt: membershipData.paidAt,
  });
});

// POST /api/membership/submit
// Submit membership application to database
app.post('/api/membership/submit', async (req, res) => {
  try {
    const { formData } = req.body;

    if (!formData || !formData.email || !formData.fullName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Use database if configured, otherwise fall back to in-memory
    if (dbConfigured) {
      const membershipId = await createMembership(formData);

      console.log(`Membership created in database: ${membershipId} for ${formData.email}`);

      res.json({
        success: true,
        membershipId,
        message: 'Membership application submitted',
      });
    } else {
      // Fallback to in-memory storage
      const txnRef = generateTxnRef();
      pendingMemberships.set(txnRef, {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'pending',
      });

      console.log(`Membership created in-memory: ${txnRef} for ${formData.email}`);

      res.json({
        success: true,
        membershipId: txnRef,
        message: 'Membership application submitted (in-memory)',
      });
    }
  } catch (error) {
    console.error('Error creating membership:', error);
    res.status(500).json({ error: 'Failed to create membership application' });
  }
});

// POST /api/membership/update-payment
// Update membership with payment information and all form data
app.post('/api/membership/update-payment', async (req, res) => {
  try {
    const { membershipId, paymentIntentId, status, amount, formData } = req.body;

    if (!membershipId) {
      return res.status(400).json({ error: 'Missing membershipId' });
    }

    const paymentData = {
      stripePaymentIntentId: paymentIntentId,
      paymentStatus: status,
      amountPaid: amount,
      paidAt: status === 'succeeded' ? new Date().toISOString() : null,
      status: status === 'succeeded' ? 'paid' : status,
    };

    if (dbConfigured) {
      await updateMembership(membershipId, formData || {}, paymentData);
      console.log(`Membership ${membershipId} updated with payment: ${status}`);

      // Send emails on successful payment
      if (status === 'succeeded') {
        const membership = await getMembership(membershipId);
        if (membership) {
          const txnRef = membership.stripe_payment_intent_id || membershipId;
          await sendMembershipEmails({
            ...formData,
            fee: membership.fee,
            donation: membership.donation,
            total: membership.total,
          }, txnRef);
        }
      }
    } else {
      // Fallback: find and update in-memory record
      for (const [key, value] of pendingMemberships.entries()) {
        if (key === membershipId || value.stripePaymentIntentId === paymentIntentId) {
          pendingMemberships.set(key, { ...value, ...formData, ...paymentData });
          break;
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment information' });
  }
});

// GET /api/membership/:id
// Get membership details by ID
app.get('/api/membership/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (dbConfigured) {
      const membership = await getMembership(id);

      if (!membership) {
        return res.status(404).json({ error: 'Membership not found' });
      }

      res.json({ success: true, membership });
    } else {
      const membershipData = pendingMemberships.get(id);

      if (!membershipData) {
        return res.status(404).json({ error: 'Membership not found' });
      }

      res.json({ success: true, membership: membershipData });
    }
  } catch (error) {
    console.error('Error fetching membership:', error);
    res.status(500).json({ error: 'Failed to fetch membership' });
  }
});

// POST /api/renewal/submit
// Submit membership renewal to database
app.post('/api/renewal/submit', async (req, res) => {
  try {
    const { formData, fee, donation, total } = req.body;

    if (!formData || !formData.email || !formData.fullName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (dbConfigured) {
      const renewalId = await createRenewal({ ...formData, fee, donation, total });

      console.log(`Renewal created in database: ${renewalId} for ${formData.email}`);

      res.json({
        success: true,
        renewalId,
        message: 'Membership renewal submitted',
      });
    } else {
      return res.status(503).json({ error: 'Database is not configured' });
    }
  } catch (error) {
    console.error('Error creating renewal:', error);
    res.status(500).json({ error: 'Failed to create membership renewal' });
  }
});

// POST /api/renewal/update-payment — single handler (duplicate routes skipped email send)
app.post('/api/renewal/update-payment', async (req, res) => {
  try {
    const { renewalId, paymentIntentId, status, amount, formData, fee, donation } = req.body;

    if (!renewalId) {
      return res.status(400).json({ error: 'Missing renewalId' });
    }

    const paymentData = {
      stripePaymentIntentId: paymentIntentId,
      paymentStatus: status,
      amountPaid: amount,
      fee,
      total: donation ? (fee || 0) + (parseFloat(donation) || 0) : (fee || 0),
      paidAt: status === 'succeeded' ? new Date().toISOString() : null,
      status: status === 'succeeded' ? 'paid' : status,
    };

    if (dbConfigured) {
      await updateRenewal(renewalId, formData || {}, paymentData);
      console.log(`Renewal ${renewalId} updated with payment: ${status}`);

      // Applicant copy uses formData.email from the renewal form (client sends formData: form)
      if (status === 'succeeded') {
        const txnRef = paymentIntentId || renewalId;
        await sendRenewalEmails(
          { ...(formData || {}), fee, donation, total: paymentData.total },
          txnRef,
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment information' });
  }
});

// POST /api/donation/submit — persists donor form (incl. email) before Stripe; client sends formData: { ...donorData }
app.post('/api/donation/submit', async (req, res) => {
  try {
    const { formData } = req.body;
    if (!formData) {
      return res.status(400).json({ error: 'Missing formData' });
    }
    if (!dbConfigured) {
      return res.status(503).json({ error: 'Database is not configured' });
    }
    const donationId = await createDonation(formData);
    res.json({ success: true, donationId });
  } catch (error) {
    console.error('Error creating donation:', error);
    const msg = error?.message || '';
    if (
      msg.includes('amount must be greater') ||
      msg.includes('Email is required')
    ) {
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: 'Failed to create donation' });
  }
});

// POST /api/donation/update-payment
// Update donation with payment information and all form data
app.post('/api/donation/update-payment', async (req, res) => {
  try {
    const { donationId, paymentIntentId, status, amount, formData } = req.body;

    if (!donationId) {
      return res.status(400).json({ error: 'Missing donationId' });
    }

    const paymentData = {
      stripePaymentIntentId: paymentIntentId,
      paymentStatus: status,
      amountPaid: amount,
      paidAt: status === 'succeeded' ? new Date().toISOString() : null,
      status: status === 'succeeded' ? 'paid' : status,
    };

    if (dbConfigured) {
      await updateDonation(donationId, formData || {}, paymentData);
      console.log(`Donation ${donationId} updated with payment: ${status}`);

      // Send emails on successful payment
      if (status === 'succeeded') {
        const txnRef = paymentIntentId || donationId;
        await sendDonationEmails(formData, txnRef, paymentData.paidAt);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment information' });
  }
});

// GET /api/gallery — published images for public site
app.get('/api/gallery', async (_req, res) => {
  if (!dbConfigured) {
    return res.json({ items: [] });
  }
  try {
    const rows = await listPublishedGalleryItems();
    res.json({ items: rows.map(mapGalleryRow) });
  } catch (error) {
    console.error('Error listing gallery:', error);
    res.json({ items: [] });
  }
});

// POST /api/admin/login
app.post('/api/admin/login', async (req, res) => {
  try {
    if (!adminAuthConfigured()) {
      return res.status(503).json({ error: 'Admin authentication is not configured' });
    }
    const ip = getClientIp(req);
    if (!checkLoginRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many login attempts' });
    }

    const { username, password } = req.body || {};
    const expectedUser = process.env.ADMIN_USERNAME;
    const hash = process.env.ADMIN_PASSWORD_HASH;
    if (
      !username ||
      !password ||
      username !== expectedUser ||
      !bcrypt.compareSync(password, hash)
    ) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.set(token, Date.now() + ADMIN_SESSION_MS);
    res.cookie('admin_session', token, adminSessionCookieOptions());
    res.json({ success: true });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req, res) => {
  const token = req.cookies?.admin_session;
  if (token) adminSessions.delete(token);
  res.clearCookie('admin_session', { path: '/' });
  res.json({ success: true });
});

// GET /api/admin/gallery — all items (draft + published)
app.get('/api/admin/gallery', requireAdmin, async (_req, res) => {
  if (!dbConfigured) {
    return res.status(503).json({ error: 'Database is not configured' });
  }
  try {
    const rows = await listAllGalleryItems();
    res.json({ items: rows.map(mapGalleryRow) });
  } catch (error) {
    console.error('Error listing admin gallery:', error);
    res.status(500).json({ error: 'Failed to list gallery items' });
  }
});

// POST /api/admin/gallery/upload
app.post(
  '/api/admin/gallery/upload',
  requireAdmin,
  upload.array('images', 20),
  async (req, res) => {
    if (!dbConfigured) {
      return res.status(503).json({ error: 'Database is not configured' });
    }
    if (!isAzureGalleryConfigured()) {
      return res.status(503).json({ error: 'Azure Blob Storage is not configured' });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Missing image files (field name: images)' });
    }

    const uploaded = [];
    const errors = [];

    for (const file of files) {
      const kind = detectImageType(file.buffer);
      if (!kind) {
        errors.push({ filename: file.originalname, error: 'Invalid format (JPEG, PNG, WebP only)' });
        continue;
      }

      const now = new Date();
      const y = now.getUTCFullYear();
      const m = String(now.getUTCMonth() + 1).padStart(2, '0');
      const blobName = `${y}/${m}/${crypto.randomUUID()}.${kind.ext}`;
      let publicUrl;

      try {
        publicUrl = await uploadGalleryImage(file.buffer, blobName, kind.mime);
      } catch (error) {
        console.error('Azure upload failed:', error);
        errors.push({ filename: file.originalname, error: 'Upload failed' });
        continue;
      }

      try {
        const id = await createGalleryItem({
          title: null,
          caption: null,
          blobName,
          publicUrl,
          sortOrder: null,
          isPublished: false,
          albumId: req.body?.albumId || null,
        });
        if (!id) {
          await deleteGalleryBlob(blobName).catch(() => {});
          errors.push({ filename: file.originalname, error: 'DB insert failed' });
          continue;
        }
        uploaded.push({ id, publicUrl, blobName });
      } catch (error) {
        console.error('Gallery DB insert failed:', error);
        await deleteGalleryBlob(blobName).catch(() => {});
        errors.push({ filename: file.originalname, error: 'DB insert failed' });
      }
    }

    if (uploaded.length === 0) {
      return res.status(500).json({ error: 'All uploads failed', errors });
    }

    res.status(201).json({
      success: true,
      count: uploaded.length,
      uploaded,
      errors: errors.length > 0 ? errors : undefined,
    });
  },
);

// PUT /api/admin/gallery/:id
app.put('/api/admin/gallery/:id', requireAdmin, async (req, res) => {
  if (!dbConfigured) {
    return res.status(503).json({ error: 'Database is not configured' });
  }
  const { id } = req.params;
  const { title, caption, sortOrder, isPublished } = req.body || {};

  try {
    const existing = await getGalleryItemById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    let nextOrder = existing.sort_order;
    if (sortOrder !== undefined && sortOrder !== null) {
      const n = Number(sortOrder);
      if (!Number.isInteger(n) || n < 0) {
        return res.status(400).json({ error: 'sortOrder must be a non-negative integer' });
      }
      nextOrder = n;
    }

    await updateGalleryItem(id, {
      title: title !== undefined ? title : existing.title,
      caption: caption !== undefined ? caption : existing.caption,
      sortOrder: nextOrder,
      isPublished: isPublished !== undefined ? !!isPublished : !!existing.is_published,
      albumId: req.body?.albumId !== undefined ? req.body.albumId : existing.album_id,
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Gallery update failed:', error);
    res.status(500).json({ error: 'Failed to update gallery item' });
  }
});

// DELETE /api/admin/gallery/:id
app.delete('/api/admin/gallery/:id', requireAdmin, async (req, res) => {
  if (!dbConfigured) {
    return res.status(503).json({ error: 'Database is not configured' });
  }
  const { id } = req.params;
  try {
    const blobName = await deleteGalleryItem(id);
    if (!blobName) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    if (isAzureGalleryConfigured()) {
      await deleteGalleryBlob(blobName);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Gallery delete failed:', error);
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

// --- Album endpoints ---

// GET /api/admin/albums — all albums
app.get('/api/admin/albums', requireAdmin, async (_req, res) => {
  if (!dbConfigured) {
    return res.status(503).json({ error: 'Database is not configured' });
  }
  try {
    await ensureSiteImagesAlbum();
    const albums = await listAllAlbums();
    res.json({ albums: albums.map(a => ({ ...a, id: a.id.toString ? a.id.toString() : a.id })) });
  } catch (error) {
    console.error('Error listing albums:', error);
    res.status(500).json({ error: 'Failed to list albums' });
  }
});

// POST /api/admin/albums — create album
app.post('/api/admin/albums', requireAdmin, async (req, res) => {
  if (!dbConfigured) {
    return res.status(503).json({ error: 'Database is not configured' });
  }
  try {
    const { name, description, sortOrder, isPublished } = req.body || {};
    if (!name) {
      return res.status(400).json({ error: 'Album name is required' });
    }
    if (String(name).trim().toLowerCase() === SITE_IMAGES_ALBUM_NAME.toLowerCase()) {
      // Reserved internal album: create if missing, never public
      const album = await ensureSiteImagesAlbum();
      return res.status(201).json({ success: true, id: album.id.toString ? album.id.toString() : album.id });
    }
    const id = await createAlbum({ name, description, sortOrder, isPublished });
    res.status(201).json({ success: true, id: id.toString ? id.toString() : id });
  } catch (error) {
    console.error('Create album failed:', error);
    res.status(500).json({ error: 'Failed to create album' });
  }
});

// PUT /api/admin/albums/:id — update album
app.put('/api/admin/albums/:id', requireAdmin, async (req, res) => {
  if (!dbConfigured) {
    return res.status(503).json({ error: 'Database is not configured' });
  }
  const { id } = req.params;
  try {
    const { name, description, sortOrder, isPublished } = req.body || {};
    const existing = await getAlbumById(id);
    if (!existing) return res.status(404).json({ error: 'Album not found' });
    if (String(existing.name).toLowerCase() === SITE_IMAGES_ALBUM_NAME.toLowerCase()) {
      // Internal album: allow metadata edits but never publish/rename.
      await updateAlbum(id, {
        name: SITE_IMAGES_ALBUM_NAME,
        description: description ?? existing.description,
        sortOrder: sortOrder ?? existing.sort_order ?? 0,
        isPublished: false,
      });
      return res.json({ success: true });
    }
    await updateAlbum(id, { name, description, sortOrder, isPublished });
    res.json({ success: true });
  } catch (error) {
    console.error('Update album failed:', error);
    res.status(500).json({ error: 'Failed to update album' });
  }
});

// DELETE /api/admin/albums/:id — delete album
app.delete('/api/admin/albums/:id', requireAdmin, async (req, res) => {
  if (!dbConfigured) {
    return res.status(503).json({ error: 'Database is not configured' });
  }
  const { id } = req.params;
  try {
    const existing = await getAlbumById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Album not found' });
    }
    if (String(existing.name).toLowerCase() === SITE_IMAGES_ALBUM_NAME.toLowerCase()) {
      return res.status(403).json({ error: 'This album is reserved for site images and cannot be deleted.' });
    }
    const deletedId = await deleteAlbum(id);
    if (!deletedId) {
      return res.status(404).json({ error: 'Album not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete album failed:', error);
    res.status(500).json({ error: 'Failed to delete album' });
  }
});

// GET /api/albums — public endpoint for published albums
app.get('/api/albums', async (_req, res) => {
  if (!dbConfigured) {
    return res.json({ albums: [] });
  }
  try {
    const albums = await listPublishedAlbums();
    res.json({ albums: albums.map(a => ({ ...a, id: a.id.toString ? a.id.toString() : a.id })) });
  } catch (error) {
    console.error('Error listing albums:', error);
    res.json({ albums: [] });
  }
});

// GET /api/gallery/:albumId — public endpoint for published items in an album
app.get('/api/gallery/:albumId', async (req, res) => {
  if (!dbConfigured) {
    return res.json({ items: [] });
  }
  try {
    const { albumId } = req.params;
    const rows = await listPublishedGalleryItems(albumId);
    res.json({ items: rows.map(mapGalleryRow) });
  } catch (error) {
    console.error('Error listing gallery:', error);
    res.json({ items: [] });
  }
});

// GET /api/admin/gallery/album/:albumId — admin endpoint for all items in an album
app.get('/api/admin/gallery/album/:albumId', requireAdmin, async (req, res) => {
  if (!dbConfigured) {
    return res.status(503).json({ error: 'Database is not configured' });
  }
  try {
    const { albumId } = req.params;
    const rows = await listAllGalleryItems(albumId);
    res.json({ items: rows.map(mapGalleryRow) });
  } catch (error) {
    console.error('Error listing gallery items:', error);
    res.status(500).json({ error: 'Failed to list gallery items' });
  }
});

// --- Public CMS (merged defaults + DB patches) ---
app.get('/api/site-content', async (_req, res) => {
  try {
    const merged = await getMergedSiteContentSafe();
    res.json(merged);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load site content' });
  }
});

// --- Admin CMS ---
app.get('/api/admin/site-content/slugs', requireAdmin, (_req, res) => {
  res.json({ slugs: [...CMS_SLUGS] });
});

app.get('/api/admin/site-content/:slug', requireAdmin, async (req, res) => {
  const { slug } = req.params;
  if (!CMS_SLUGS.includes(slug)) {
    return res.status(400).json({ error: 'Unknown slug' });
  }
  try {
    const merged = await getMergedSiteContentSafe();
    const fragment = pickFragment(slug, merged);
    res.json({ slug, fragment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load content fragment' });
  }
});

app.put('/api/admin/site-content/:slug', requireAdmin, async (req, res) => {
  const { slug } = req.params;
  if (!CMS_SLUGS.includes(slug)) {
    return res.status(400).json({ error: 'Unknown slug' });
  }
  const payload = req.body?.payload ?? req.body;
  try {
    const fragment = await saveFragment(slug, payload);
    res.json({ success: true, fragment });
  } catch (err) {
    if (err.message === 'Database is not configured') {
      return res.status(503).json({ error: err.message });
    }
    if (
      err.message === 'Payload must be a JSON object' ||
      err.message === 'Payload contains invalid keys for this slug'
    ) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to save content' });
  }
});

const MAX_CMS_UPLOAD_BYTES = 10 * 1024 * 1024;
const cmsUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_CMS_UPLOAD_BYTES },
});

app.post(
  '/api/admin/site-content/upload',
  requireAdmin,
  cmsUpload.single('image'),
  async (req, res) => {
    const file = req.file;
    if (!file || !file.buffer?.length) {
      return res.status(400).json({ error: 'Missing image file (field name: image)' });
    }
    try {
      const { publicUrl, blobName } = await uploadCmsImage(file.buffer);
      res.status(201).json({ success: true, publicUrl, blobName });
    } catch (err) {
      if (err.message?.includes('not configured') || err.message?.includes('Invalid format')) {
        return res.status(err.message.includes('not configured') ? 503 : 400).json({
          error: err.message,
        });
      }
      console.error('CMS image upload:', err);
      res.status(500).json({ error: 'Upload failed' });
    }
  },
);

// --- Teams content agent (Bot Framework) ---
app.post('/api/messaging', teamsMessagingHandler);

// GET /api/address/lookup
// Proxy NZ address lookup to avoid CORS and rate limiting
const addressCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

app.get('/api/address/lookup', async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.length < 3) {
      return res.json([]);
    }

    // Check cache first
    const cached = addressCache.get(query);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    // Call Nominatim API with proper User-Agent
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          format: 'json',
          q: query,
          countrycodes: 'nz',
          limit: 5,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'HakaruRSA/1.0',
        },
      }
    );

    // Cache the result
    addressCache.set(query, {
      data: response.data,
      timestamp: Date.now(),
    });

    // Clean old cache entries
    const now = Date.now();
    for (const [key, value] of addressCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        addressCache.delete(key);
      }
    }

    res.json(response.data);
  } catch (error) {
    console.error('Address lookup error:', error.message);
    res.status(500).json({ error: 'Address lookup failed' });
  }
});

const HTTP_PORT = process.env.PORT || 3001;
const HTTPS_PORT = parseInt(HTTP_PORT) + 1 || 3002;

// Start HTTP server
app.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${HTTP_PORT}`);
  console.log(`CORS allowed origins (FRONTEND_URLS): ${resolveAllowedOrigins().join(' | ')}`);
  if (isTeamsBotConfigured()) {
    console.log('Teams content agent: POST /api/messaging (configured)');
  } else {
    console.log('Teams content agent: not configured (set MICROSOFT_APP_* and AGENT_ALLOWED_*)');
  }
});

// Start HTTPS server for local development with MSAL
const HTTPS_ENABLED = process.env.HTTPS_ENABLED === 'true';
if (HTTPS_ENABLED) {
  try {
    const certDir = path.resolve(__dirname, '../certs');
    const httpsOptions = {
      key: fs.readFileSync(path.join(certDir, 'key.pem')),
      cert: fs.readFileSync(path.join(certDir, 'cert.pem')),
    };
    https.createServer(httpsOptions, app).listen(HTTPS_PORT, '0.0.0.0', () => {
      console.log(`HTTPS server running on port ${HTTPS_PORT}`);
    });
  } catch (err) {
    console.error('Failed to start HTTPS server:', err.message);
  }
}
