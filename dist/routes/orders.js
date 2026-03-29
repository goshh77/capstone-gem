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
const pubsub_1 = require("@google-cloud/pubsub");
const router = (0, express_1.Router)();
const pubsub = new pubsub_1.PubSub();
// =======================
// Get all orders
// =======================
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getDb)();
        const result = yield db.request().query('SELECT * FROM orders');
        res.json(result.recordset);
    }
    catch (err) {
        console.error("❌ Get All Orders Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
}));
// =======================
// Get orders by user
// =======================
router.get('/user/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getDb)();
        const result = yield db.request()
            .input('userId', String(req.params.userId))
            .query('SELECT * FROM orders WHERE userId = @userId');
        res.json(result.recordset);
    }
    catch (err) {
        console.error("❌ Get User Orders Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
}));
// =======================
// Checkout (FINAL VERSION)
// =======================
router.post('/checkout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let transaction;
    try {
        const { userId, userEmail, items, total } = req.body;
        const db = yield (0, db_1.getDb)();
        transaction = db.transaction();
        yield transaction.begin();
        // 1️⃣ Check stock
        for (const item of items) {
            const productResult = yield transaction.request()
                .input('pid', String(item.productId || item.id))
                .query('SELECT * FROM products WHERE id = @pid');
            const product = productResult.recordset[0];
            if (!product)
                throw new Error(`Product ${item.name} not found`);
            if (product.stock < item.quantity) {
                throw new Error(`Not enough stock for ${product.name}`);
            }
        }
        // 2️⃣ Reduce stock
        for (const item of items) {
            yield transaction.request()
                .input('pid', String(item.productId || item.id))
                .input('qty', item.quantity)
                .query(`
          UPDATE products
          SET stock = stock - @qty
          WHERE id = @pid
        `);
        }
        // 3️⃣ Create Order
        const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        yield transaction.request()
            .input('id', orderId)
            .input('userId', String(userId))
            .input('userEmail', userEmail)
            .input('total', total)
            .input('status', 'paid')
            .input('createdAt', new Date())
            .query(`
        INSERT INTO orders (id, userId, userEmail, total, status, createdAt)
        VALUES (@id, @userId, @userEmail, @total, @status, @createdAt)
      `);
        // 4️⃣ Insert Order Items
        for (const item of items) {
            yield transaction.request()
                .input('orderId', orderId)
                .input('productId', String(item.productId || item.id))
                .input('name', item.name)
                .input('price', item.price)
                .input('quantity', item.quantity)
                .query(`
          INSERT INTO order_items (orderId, productId, name, price, quantity)
          VALUES (@orderId, @productId, @name, @price, @quantity)
        `);
        }
        // ✅ Commit transaction
        yield transaction.commit();
        console.log(`🎉 SUCCESS: Order ${orderId} placed successfully.`);
        // =========================
        // 📩 Pub/Sub EMAIL TRIGGER
        // =========================
        yield pubsub.topic('notifications').publishMessage({
            json: {
                type: "ORDER",
                email: userEmail,
                orderId: orderId
            }
        });
        console.log(`📩 ORDER event published for ${userEmail}`);
        res.json({ message: 'Order placed', orderId });
    }
    catch (err) {
        console.error("🔥 Checkout Logic Error:", err.message);
        if (transaction)
            yield transaction.rollback();
        res.status(500).json({ message: err.message });
    }
}));
exports.default = router;
