const express = require('express');
const Product = require('../models/Product');
const { userAuth } = require('../middleware/userAuth');
const User = require('../models/User');

const router = express.Router();


router.post('/createProduct',userAuth, async (req, res) => {
    
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

    }catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
    
    
});

module.exports = router;