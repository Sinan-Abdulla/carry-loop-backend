const express = require('express');
const Product = require("../models/Product");
const { userAuth, admin } = require("../middleware/userAuth");

const router = express.Router();

router.get("/getAllProduct", userAuth, admin, async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "server error" });
    }
});

module.exports = router;