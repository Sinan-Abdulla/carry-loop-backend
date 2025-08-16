const express = require('express');
const Product = require('../models/Product');
const { userAuth, admin } = require('../middleware/userAuth');
const User = require('../models/User');

const router = express.Router();


router.post('/createProduct', userAuth, admin, async (req, res) => {

    try {

        const { name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku } = req.body;

        const product = new Product({
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
            user: req.user._id,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
});

router.put('/:id', userAuth, admin, async (req, res) => {
    try {
        const { name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku } = req.body;

        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.discountPrice = discountPrice || product.discountPrice;
            product.countInStock = countInStock || product.countInStock;
            product.category = category || product.category;
            product.brand = brand || product.brand;
            product.sizes = sizes || product.sizes;
            product.colors = colors || product.colors;
            product.collections = collections || product.collections;
            product.material = material || product.material;
            product.gender = gender || product.gender;
            product.images = images || product.images;
            product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
            product.isPublished = isPublished !== undefined ? isPublished : product.isPublished;
            product.tags = tags || product.tags;
            product.dimensions = dimensions || product.dimensions;
            product.weight = weight || product.weight;
            product.sku = sku || product.sku;

            const updatedproduct = await product.save();
            res.json(updatedproduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch {
        res.status(500).json({ message: 'Error updating product' });
    }
});

router.delete("/:id", userAuth, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
    }

});


router.get("/", async (req, res) => {
    try {
        const {
            collection,
            size,
            color,
            gender,
            minPrice,
            maxPrice,
            sortBy,
            search,
            category,
            material,
            brand,
            limit
        } = req.query;

        let query = {};

        if (collection && collection.toLowerCase() !== "all") {
            query.collections = { $regex: new RegExp(collection, "i") };
        }

        if (category && category.toLowerCase() !== "all") {
            query.category = { $regex: new RegExp(category, "i") };
        }

        if (material) {
            query.material = { $in: material.split(",").map(m => new RegExp(m, "i")) };
        }

        if (brand) {
            query.brand = { $in: brand.split(",").map(b => new RegExp(b, "i")) };
        }

        if (size) {
            query.sizes = { $in: size.split(",").map(s => new RegExp(s, "i")) };
        }

        if (color) {
            query.colors = { $in: color.split(",").map(c => new RegExp(c, "i")) };
        }

        if (gender) {
            query.gender = { $regex: new RegExp(gender, "i") };
        }

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
            switch (sortBy) {
                case "priceAsc":
                    sort = { price: 1 };
                    break;
                case "priceDesc":
                    sort = { price: -1 };
                    break;
                case "popularity":
                    sort = { rating: -1 };
                    break;
                default:
                    break;
            }
        }

        console.log("MongoDB Query:", query);

        let products = await Product.find(query)
            .sort(sort)
            .limit(Number(limit) || 0);

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
