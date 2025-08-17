const express = require('express');
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { userAuth } = require('../middleware/userAuth');

const router = express.Router();

const getCart = async (userId, guestId) => {
    if (userId) return await Cart.findOne({ user: userId });
    if (guestId) return await Cart.findOne({ guestId });
    return null;
};

router.post("/", async (req, res) => {
    console.log("Headers:", req.headers);
    console.log("Raw Body:", req.body);
    // Defensive logging
    if (!req.body) {
        return res.status(400).json({ error: "Missing request body" });
    }

    const { productId, quantity, size, color, guestId, userId } = req.body;

    // Validate required fields
    if (!productId || !quantity || !size || !color) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let cart = await getCart(userId, guestId);

        if (cart) {
            const productIndex = cart.products.findIndex(
                (p) =>
                    p.productId.toString() === productId &&
                    p.size === size &&
                    p.color === color
            );

            if (productIndex > -1) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({
                    productId,
                    name: product.name,
                    image: product.images[0]?.url || "",
                    price: product.price,
                    size,
                    color,
                    quantity,
                });
            }

            cart.totalPrice = cart.products.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
            );

            await cart.save();
            return res.status(200).json(cart);
        } else {
            const newCart = await Cart.create({
                user: userId ? userId : undefined,
                guestId: guestId || "guest_" + Date.now(),
                products: [
                    {
                        productId,
                        name: product.name,
                        image: product.images[0]?.url || "",
                        price: product.price,
                        size,
                        color,
                        quantity,
                    },
                ],
                totalPrice: product.price * quantity,
            });

            return res.status(201).json(newCart);
        }
    } catch (error) {
        console.error("Cart creation error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.put("/", async (req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body;
    try {
        let cart = await getCart(userId, guestId);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const productIndex = cart.products.findIndex(
            (p) =>
                p.productId.toString() === productId &&
                p.size === size &&
                p.color === color
        );

        if (productIndex > -1) {
            if (quantity > 0) {
                cart.products[productIndex].quantity = quantity;
            } else {
                cart.products.splice(productIndex, 1);
            }
        }

        cart.totalPrice = cart.products.reduce(
            (acc, p) => acc + p.price * p.quantity,
            0
        );

        await cart.save();
        return res.status(200).json(cart);

    } catch (error) {
        console.error("Cart creation error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.delete("/", async (req, res) => {
    const { productId, size, color, guestId, userId } = req.body;
    try {
        let cart = await getCart(userId, guestId);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const productIndex = cart.products.findIndex(
            (p) =>
                p.productId.toString() === productId &&
                p.size === size &&
                p.color === color
        );

        if (productIndex > -1) {
            cart.products.splice(productIndex, 1);
        }
        cart.totalPrice = cart.products.reduce(
            (acc, p) => acc + p.price * p.quantity,
            0
        );
        await cart.save();
        return res.status(200).json(cart);

    } catch (error) {
        console.error("Cart creation error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/", async (req, res) => {
    const { userId, guestId } = req.body;
    try {
        let cart = await getCart(userId, guestId);
        if (cart) {
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({ message: "Cart not found" });
        }
    } catch (error) {
        console.error("Cart creation error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.post("/merge", userAuth, async (req, res) => {

    const { guestId } = req.body;

    if (!guestId) {
        return res.status(400).json({ message: "Guest ID is required" });
    }

    try {
        // Find guest cart and user cart
        const guestCart = await Cart.findOne({ guestId });
        const userCart = await Cart.findOne({ user: req.user._id });

        if (!guestCart || guestCart.products.length === 0) {
            return res.status(400).json({ message: "Guest cart is empty" });
        }

        if (userCart) {
            // Merge guest cart into existing user cart
            guestCart.products.forEach((guestItem) => {
                const productIndex = userCart.products.findIndex(
                    (item) =>
                        item.productId.toString() === guestItem.productId.toString() &&
                        item.size === guestItem.size &&
                        item.color === guestItem.color
                );

                if (productIndex > -1) {
                    userCart.products[productIndex].quantity += guestItem.quantity;
                } else {
                    userCart.products.push(guestItem);
                }
            });

            // Recalculate total price
            userCart.totalPrice = userCart.products.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
            );

            await userCart.save();

            // Delete guest cart after merging
            try {
                await Cart.findOneAndDelete({ guestId });
            } catch (deleteError) {
                console.error("Error deleting guest cart:", deleteError);
            }

            return res.status(200).json(userCart);
        } else {
            // No user cart exists → assign guest cart to user
            guestCart.user = req.user._id;
            guestCart.guestId = undefined; // remove guestId
            await guestCart.save();

            return res.status(200).json(guestCart);
        }
    } catch (error) {
        console.error("Cart merge error:", error);
        return res.status(500).json({ message: "Server Error" });
    }
});


module.exports = router;
