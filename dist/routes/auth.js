"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const firestore_1 = require("@google-cloud/firestore");
const pubsub_1 = require("@google-cloud/pubsub"); // 🔥 ADD THIS
const router = (0, express_1.Router)();
const firestore = new firestore_1.Firestore();
const pubsub = new pubsub_1.PubSub(); // 🔥 ADD THIS
// 🔥 Helper: Sanitize email for Firestore Document ID (Requirement #3 Best Practice)
const getDocId = (email) => email.replace(/[^a-zA-Z0-9]/g, "_");
// =======================
// Signup (Generate & Store OTP)
// =======================
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const db = yield (0, db_1.getDb)();
        // 1. Check SQL if user already exists
        const existing = yield db.request()
            .input('email', email)
            .query('SELECT * FROM users WHERE email = @email');
        if (existing.recordset.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // 2. Generate 6-digit OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        // 3. Store in Firestore NoSQL
        yield firestore.collection('otps').doc(getDocId(email)).set({
            email,
            otp: generatedOtp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 600000
        });
        console.log(`✅ NoSQL: OTP ${generatedOtp} stored for ${email}`);
        // 🔥 4. Publish event to Pub/Sub (ONLY NEW LOGIC)
        yield pubsub.topic('notifications').publishMessage({
            json: {
                type: "OTP",
                email,
                otp: generatedOtp
            }
        });
        console.log(`📨 OTP event published for ${email}`);
        // RESPONSE (unchanged)
        res.json({ message: 'OTP generated (Check email soon)' });
    }
    catch (err) {
        console.error("❌ Signup Error:", err.message);
        res.status(500).json({ message: 'Internal server error during signup' });
    }
}));
// =======================
// Verify OTP (Finalize User in SQL)
// =======================
router.post('/verify-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, otp } = req.body;
        const docId = getDocId(email);
        const otpDoc = yield firestore.collection('otps').doc(docId).get();
        if (!otpDoc.exists) {
            return res.status(400).json({ message: "OTP expired or not found" });
        }
        const data = otpDoc.data();
        if ((data === null || data === void 0 ? void 0 : data.otp) !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (Date.now() > (data === null || data === void 0 ? void 0 : data.expiresAt)) {
            yield firestore.collection('otps').doc(docId).delete();
            return res.status(400).json({ message: "OTP has expired" });
        }
        const db = yield (0, db_1.getDb)();
        const userId = Math.random().toString(36).substr(2, 9);
        yield db.request()
            .input('id', userId)
            .input('email', email)
            .input('password', password)
            .input('role', 'user')
            .query(`
        INSERT INTO users (id, email, password, role, isVerified)
        VALUES (@id, @email, @password, @role, 1)
      `);
        yield firestore.collection('otps').doc(docId).delete();
        console.log(`👤 SQL: User ${email} created successfully.`);
        res.json({ user: { id: userId, email, role: 'user' } });
    }
    catch (err) {
        console.error("❌ Verification Error:", err.message);
        res.status(500).json({ message: err.message });
    }
}));
// =======================
// Login (UNCHANGED)
// =======================
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const db = yield (0, db_1.getDb)();
        const result = yield db.request()
            .input('email', email)
            .input('password', password)
            .query(`SELECT * FROM users WHERE email = @email AND password = @password`);
        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            res.json({ user: { id: user.id, email: user.email, role: user.role } });
        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    catch (err) {
        console.error("❌ Login Error:", err.message);
        res.status(500).json({ message: 'Server error' });
    }
}));
exports.default = router;
