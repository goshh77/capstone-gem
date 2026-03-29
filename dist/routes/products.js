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
const router = (0, express_1.Router)();
// Get all products
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getDb)();
        const result = yield db.request().query('SELECT * FROM products');
        res.json(result.recordset);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Add product
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, price, image, stock } = req.body;
        const db = yield (0, db_1.getDb)();
        const id = Math.random().toString(36).substr(2, 9);
        yield db.request()
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Delete product
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getDb)();
        const result = yield db.request()
            .input('id', req.params.id)
            .query('DELETE FROM products WHERE id = @id');
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Product deleted' });
        }
        else {
            res.status(404).json({ message: 'Product not found' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}));
// ✅ UPDATE PRODUCT (ONLY ADDITION — SAFE)
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getDb)();
        const { name, description, price, stock, image } = req.body;
        yield db.request()
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
    }
    catch (err) {
        console.error("❌ Update Product Error:", err);
        res.status(500).json({ message: 'Update failed' });
    }
}));
exports.default = router;
