const express = require("express");
const User = require("../models/User");
const { userAuth, admin } = require("../middleware/userAuth");

const router = express.Router();

router.get("/", userAuth, admin, async (req, res) => {
    try {
        const user = await User.find({});
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "sever Error" });
    }
});

router.post("/", userAuth, admin, async (req, res) => {
    const { firstName, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ message: "user already exists" });
        }
        user = new User({
            firstName,
            email,
            password,
            role: role || "customer",
        });
        await user.save();
        res.status(200).json({ message: "user created succesfully", user })
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "server Error" })
    }
})

router.put("/update/:id", userAuth, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.firstName = req.body.firstName || user.firstName;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
        }
        const updatedUser = await user.save();
        res.json({ message: "User upadated succesfully ", user: updatedUser })
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "server Error" });
    }
})

router.delete("/delete/:id", userAuth, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: "user deleted succesfully" });
        } else {
            res.status(400).json({ message: "user not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "server error" });
    }

})

module.exports = router;
