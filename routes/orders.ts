import { Router } from 'express';
import { getDb } from '../db';
import { PubSub } from '@google-cloud/pubsub';

const router = Router();
const pubsub = new PubSub();

// =======================
// Get all orders
// =======================
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.request().query('SELECT * FROM orders');
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Get All Orders Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// =======================
// Get orders by user
// =======================
router.get('/user/:userId', async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.request()
      .input('userId', String(req.params.userId))
      .query('SELECT * FROM orders WHERE userId = @userId');

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Get User Orders Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// =======================
// Checkout (FINAL VERSION)
// =======================
router.post('/checkout', async (req, res) => {
  let transaction;

  try {
    const { userId, userEmail, items, total } = req.body;
    const db = await getDb();

    transaction = db.transaction();
    await transaction.begin();

    // 1️⃣ Check stock
    for (const item of items) {
      const productResult = await transaction.request()
        .input('pid', String(item.productId || item.id))
        .query('SELECT * FROM products WHERE id = @pid');

      const product = productResult.recordset[0];

      if (!product) throw new Error(`Product ${item.name} not found`);
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }
    }

    // 2️⃣ Reduce stock
    for (const item of items) {
      await transaction.request()
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

    await transaction.request()
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
      await transaction.request()
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
    await transaction.commit();

    console.log(`🎉 SUCCESS: Order ${orderId} placed successfully.`);

    // =========================
    // 📩 Pub/Sub EMAIL TRIGGER
    // =========================
    await pubsub.topic('notifications').publishMessage({
      json: {
        type: "ORDER",
        email: userEmail,
        orderId: orderId
      }
    });

    console.log(`📩 ORDER event published for ${userEmail}`);

    res.json({ message: 'Order placed', orderId });

  } catch (err: any) {
    console.error("🔥 Checkout Logic Error:", err.message);

    if (transaction) await transaction.rollback();

    res.status(500).json({ message: err.message });
  }
});

export default router;
