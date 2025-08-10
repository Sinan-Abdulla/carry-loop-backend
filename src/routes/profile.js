const express = require('express');
const profileRouter = express.Router();

const { userAuth } = require("../middleware/userAuth");
const { validateEditProfileData } = require("../utiles/validation");


profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const users = req.user;

        res.send(users);
    } catch (error) {
        res.status(400).send("error: " + error.message);
    }
});

module.exports = profileRouter; 