const express = require('express');
const Product = require('../models/Product');
const { userAuth, admin } = require('../middleware/userAuth');
const User = require('../models/User');

const router = express.Router();

/**
 * @route   POST /api/products/createProduct
 * @desc    Create a new product (Admin only)
 */
router.post('/createProduct', userAuth, admin, async (req, res) => {
    try {
        const {
            name, description, price, discountPrice, countInStock, category, brand,
            sizes, colors, collections, material, gender, images,
            isFeatured, isPublished, tags, dimensions, weight, sku
        } = req.body;

        const product = new Product({
            name, description, price, discountPrice, countInStock, category, brand,
            sizes, colors, collections, material, gender, images,
            isFeatured, isPublished, tags, dimensions, weight, sku,
            user: req.user._id,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update product by ID (Admin only)
 */
router.put('/:id', userAuth, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        Object.assign(product, req.body); // Simple update
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating product' });
    }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product by ID (Admin only)
 */
router.delete('/:id', userAuth, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await product.deleteOne();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route   GET /api/products
 * @desc    Get all products with filters
 */
router.get('/', async (req, res) => {
    try {
        const {
            collection, size, color, gender, minPrice, maxPrice,
            sortBy, search, category, material, brand, limit
        } = req.query;

        let query = {};

        if (collection && collection.toLowerCase() !== "all") query.collections = { $regex: new RegExp(collection, "i") };
        if (category && category.toLowerCase() !== "all") query.category = { $regex: new RegExp(category, "i") };
        if (material) query.material = { $in: material.split(",").map(m => new RegExp(m, "i")) };
        if (brand) query.brand = { $in: brand.split(",").map(b => new RegExp(b, "i")) };
        if (size) query.sizes = { $in: size.split(",").map(s => new RegExp(s, "i")) };
        if (color) query.colors = { $in: color.split(",").map(c => new RegExp(c, "i")) };
        if (gender) query.gender = { $regex: new RegExp(gender, "i") };

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        let sort = {};
        if (sortBy) {
            if (sortBy === "priceAsc") sort = { price: 1 };
            else if (sortBy === "priceDesc") sort = { price: -1 };
            else if (sortBy === "popularity") sort = { rating: -1 };
        }

        const products = await Product.find(query).sort(sort).limit(Number(limit) || 0);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route   GET /api/products/best-seller
 */
router.get('/best-seller', async (req, res) => {
    try {
        const product = await Product.find().sort({ rating: -1 }).limit(1);
        res.json(product || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route   GET /api/products/new-arrivals
 */
router.get('/new-arrivals', async (req, res) => {
    try {
        const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(6);
        res.json(newArrivals || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
/**
 * @route   GET /api/products/similar/:id
 * @desc    Get similar products
 */
router.get('/similar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) return res.status(404).json({ message: 'Product not found' });

        const similarProducts = await Product.find({
            _id: { $ne: id },
            gender: product.gender,
            category: product.category
        }).limit(4);

        res.json(similarProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product Not Found' });
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


module.exports = router;
