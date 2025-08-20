const express = require("express");
const Order = require("../models/Order");
const { userAuth, admin } = require("../middleware/userAuth");

const router = express.Router();

router.get("/allOrders", userAuth, admin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate("user", "firstName email");
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "server error" });
    }
});

router.put("/updateOrder/:id", userAuth, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status || order.status;
            order.isDelivered = req.body.status === "Delivered" ? true : order.isDelivered;
            order.deliveredAt = req.body.status === "Delivered" ? Date.now() : order.deliveredAt;

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json("server error")
    }
});

router.delete("/deleteOrder/:id", userAuth, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            await order.deleteOne();
            res.json({ message: "order removed" });
        } else {
            res.status(400).json({ message: "order not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json("server error");
    }
})

module.exports = router;