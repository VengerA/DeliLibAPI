const express = require("express");
const { check, validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("./auth");
const Seat  = require('./seat.model');
const User = require('./user.model');
const Library  = require('./library.model');
const MongoServerFuncs = require("./db");
const Str = require('@supercharge/strings');

router.post("/add", auth, async(req, res) => {
    const libName = req.body.libName;
    const isAvailable = req.body.isAvailable;

    const seatCollectionName = req.body.libName+"_seats"
    try{
        let  library  = await  Library.findOne({
            libName,
        });
        if(library){
            res.status(404).json({
                msg: "Library Already Exists"
            })
        }

        else{

            MongoServerFuncs.CreateSeatCollection(seatCollectionName);

            library = new Library({
                libName,
                seatCollectionName,
                isAvailable,
                seatCount  : 0,
                groupCount : 0,
                password: Str.random(4),

            });
            await library.save()
            .then(result => {
                res.status(200).json({
                    msg: "Library added succesfully"
                })
            })
            .catch(err => {
                console.log(err)
            })
            
            
        }
    } catch (err) {
        // console.log(err);
        console.log(err);
    }
})



module.exports = router;
