import { Router } from 'express';
import { getDb } from '../db';

const router = Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.request().query('SELECT * FROM products');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, image, stock } = req.body;

    const db = await getDb();
    const id = Math.random().toString(36).substr(2, 9);

    await db.request()
      .input('id', id)
      .input('name', name)
      .input('description', description)
      .input('price', Number(price))
      .input('image', image || `https://picsum.photos/seed/${name}/400/300`)
      .input('stock', Number(stock) || 0)
      .query(`
        INSERT INTO products (id, name, description, price, image, stock)
        VALUES (@id, @name, @description, @price, @image, @stock)
      `);

    res.json({ message: 'Product added', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();

    const result = await db.request()
      .input('id', req.params.id)
      .query('DELETE FROM products WHERE id = @id');

    if (result.rowsAffected[0] > 0) {
      res.json({ message: 'Product deleted' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ UPDATE PRODUCT (ONLY ADDITION — SAFE)
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { name, description, price, stock, image } = req.body;

    await db.request()
      .input('id', String(req.params.id))
      .input('name', name)
      .input('description', description)
      .input('price', Number(price))
      .input('stock', Number(stock))
      .input('image', image)
      .query(`
        UPDATE products
        SET name=@name,
            description=@description,
            price=@price,
            stock=@stock,
            image=@image
        WHERE id=@id
      `);

    console.log(`✅ Product ${req.params.id} updated`);

    res.json({ message: 'Product updated' });

  } catch (err) {
    console.error("❌ Update Product Error:", err);
    res.status(500).json({ message: 'Update failed' });
  }
});

export default router;
