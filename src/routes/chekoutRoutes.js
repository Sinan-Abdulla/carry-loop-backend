const express = require('express');
const Checkout = require('../models/Checkout');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { userAuth } = require('../middleware/userAuth');


const router = express.Router();

router.post("/", userAuth, async (req, res) => {
    const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;
    if (!checkoutItems || checkoutItems.length === 0) {
        return res.status(400).json({ message: "No Checkout items is there" });
    }
    try {
        const newCheckout = await Checkout.create({
            user: req.user._id,
            checkoutItems: checkoutItems,
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod,
            totalPrice: totalPrice,
            paymentStatus: "pending",
            isPaid: false,
        });
        console.log("checkout Created for the user: ", req.user._id);
        return res.status(201).json(newCheckout);

    } catch (error) {
        console.log("Error creating checkout: ", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.put("/:id/pay", userAuth, async (req, res) => {
    const { paymentStatus, paymentDetails } = req.body;
    try {
        const checkout = await Checkout.findById(req.params.id);
        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }
        if (paymentStatus === "paid") {
            checkout.isPaid = true;
            checkout.paymentStatus = paymentStatus;
            checkout.paymentDetails = paymentDetails;
            checkout.paidAt = Date.now();
            await checkout.save();

            res.status(200).json(checkout);
        } else {
            return res.status(400).json({ message: "Payment status is not paid" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.post("/:id/finalize", userAuth, async (req, res) => {
    try {
        const checkout = await Checkout.findById(req.params.id);
        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }
        if (checkout.isPaid && !checkout.isFinalised) {

            const finalOrder = await Order.create({
                user: checkout.user,
                orderItems: checkout.checkoutItems,
                shippingAddress: checkout.shippingAddress,
                paymentMethod: checkout.paymentMethod,
                totalPrice: checkout.totalPrice,
                isPaid: true,
                paidAt: checkout.paidAt,
                isDelivered: false,
                paymentStatus: "paid",
                paymentDetails: checkout.paymentDetails,
            });
            checkout.isFinalised = true;
            checkout.finalisedAt = Date.now();
            await checkout.save();

            await Cart.findOneAndDelete({ user: checkout.user });
            res.status(200).json(finalOrder);
        } else if (checkout.isFinalised) {
            return res.status(400).json({ message: "Checkout is already finalized" });
        } else {
            return res.status(400).json({ message: "Checkout is not paid" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;