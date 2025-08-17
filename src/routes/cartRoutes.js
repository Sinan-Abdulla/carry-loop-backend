const express = require('express');
const Cart = require("../models/Cart");
const Product = require("../models/Product");

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



module.exports = router;
