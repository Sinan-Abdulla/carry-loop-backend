const express = require('express');
const Order = require('../models/Order');
const { userAuth } = require('../middleware/userAuth');

const router = express.Router();

router.get("/my-orders", userAuth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "server error" });
    }
});

router.get("/:id", userAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            "user",
            "firstName email"
        );
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "server error" });
    }
});

module.exports = router;