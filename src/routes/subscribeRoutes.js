const express = require("express");
const router = express.Router();
const subscribe = require("../models/Subscribe");
const Subscribe = require("../models/Subscribe");

router.post("/subscribe",async (req,res)=>{
    const {email} = req.body;

    if(!email){
        return res.status(400).json({message:"Email is required"});
    }

    try {
        let subscribe = await Subscribe.findOne({email});
        
        if(subscribe){
            return res.status(400).json({message:"email is already subscribed"})
        }


        subscribe = new Subscribe({email});
        await subscribe.save();
        
        res.status(201).json({message:"succesfully subscribed to news letter"})
    } catch (error) {
        console.error(error);
        res.status(400).json({message:"server error"});
    }
});

module.exports = router;
