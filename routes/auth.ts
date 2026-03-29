import { Router } from 'express';
import { getDb } from '../db';
import { Firestore } from '@google-cloud/firestore';
import { PubSub } from '@google-cloud/pubsub'; // 🔥 ADD THIS

const router = Router();
const firestore = new Firestore();
const pubsub = new PubSub(); // 🔥 ADD THIS

// 🔥 Helper: Sanitize email for Firestore Document ID (Requirement #3 Best Practice)
const getDocId = (email: string) => email.replace(/[^a-zA-Z0-9]/g, "_");

// =======================
// Signup (Generate & Store OTP)
// =======================
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await getDb();

    // 1. Check SQL if user already exists
    const existing = await db.request()
      .input('email', email)
      .query('SELECT * FROM users WHERE email = @email');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Store in Firestore NoSQL
    await firestore.collection('otps').doc(getDocId(email)).set({
      email,
      otp: generatedOtp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 600000
    });

    console.log(`✅ NoSQL: OTP ${generatedOtp} stored for ${email}`);

    // 🔥 4. Publish event to Pub/Sub (ONLY NEW LOGIC)
    await pubsub.topic('notifications').publishMessage({
      json: {
        type: "OTP",
        email,
        otp: generatedOtp
      }
    });

    console.log(`📨 OTP event published for ${email}`);

    // RESPONSE (unchanged)
    res.json({ message: 'OTP generated (Check email soon)' });

  } catch (err: any) {
    console.error("❌ Signup Error:", err.message);
    res.status(500).json({ message: 'Internal server error during signup' });
  }
});

// =======================
// Verify OTP (Finalize User in SQL)
// =======================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    const docId = getDocId(email);
    const otpDoc = await firestore.collection('otps').doc(docId).get();

    if (!otpDoc.exists) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    const data = otpDoc.data();

    if (data?.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > data?.expiresAt) {
      await firestore.collection('otps').doc(docId).delete();
      return res.status(400).json({ message: "OTP has expired" });
    }

    const db = await getDb();
    const userId = Math.random().toString(36).substr(2, 9);

    await db.request()
      .input('id', userId)
      .input('email', email)
      .input('password', password)
      .input('role', 'user')
      .query(`
        INSERT INTO users (id, email, password, role, isVerified)
        VALUES (@id, @email, @password, @role, 1)
      `);

    await firestore.collection('otps').doc(docId).delete();

    console.log(`👤 SQL: User ${email} created successfully.`);
    res.json({ user: { id: userId, email, role: 'user' } });

  } catch (err: any) {
    console.error("❌ Verification Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// =======================
// Login (UNCHANGED)
// =======================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await getDb();

    const result = await db.request()
      .input('email', email)
      .input('password', password)
      .query(`SELECT * FROM users WHERE email = @email AND password = @password`);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      res.json({ user: { id: user.id, email: user.email, role: user.role } });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err: any) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
