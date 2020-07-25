const express = require("express");
const { check, validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("./auth");
const Seat  = require('./seat.model');
const User = require('./user.model');

router.post("/add", auth, async(req, res) => {
    const  seatNum = req.body.seatNum;
    const group = req.body.group;
    try{
        let  seat  = await  Seat.findOne({
            seatNum,
        });

        if(seat){
            return res.status(400).json({
                msg: "Seat  With This Number Already Exist"
            });
        }
        else{
            seat = new Seat({
                seatNum,
                isAvailable: 1,
                email: "",
                group
            });
            await seat.save();
            res.status(200).json({
                msg: "Desk added succesfully"
            })
        }
    } catch (err) {
        // console.log(err);
        res.status(500).send('Error Accured While Saving Seat')
    }
})

router.post("/hold", auth, async(req,res)  => {
    const email = req.body.email
    try{
        let seat = await Seat.findOne({
            email
        })
        let user = await User.findOne({
            email
        })
        if(seat){
            console.log("fuck")
            res.status(400).json({
                msg: "You Are Already Holding a Desk"
            })
        }
        else {
            if(user.seatNum > 0){
                console.log("fucks")
                res.status(400).json({
                
                    msg : "You Are Already Sit A Desk"
                })
            }
        
            else{
                let query = {
                    "seatNum": req.body.seatNum
                }
                let update = {
                    "isAvailable" : 0,
                    "email": req.body.email
                }
                let options = {
                    "upsert" : false
                }
                let query1 = {
                    "email" : req.body.email
                }
                let update1 = {
                    "isSeated" : true,
                    "seatNum": req.body.seatNum
                }
                let options1 = {
                    "upsert" : false
                }

                let checker = 0 
            
                await Seat.updateOne(query, update, options )
                .then (result => {
                    checker = 1
                })
                .catch(err => {
                    console.log("fuck2")
                    res.status(400).json({
                    msg : "There has been a mistake in Seat Fill"
                })})
                
                if(checker){
                    await User.updateOne(query1, update1, options1)
                    .then(result => {
                        res.status(200).json({
                            msg : "Holding Is Success"
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(400).json({
                            msg: "an Error Accured in User"
                        })
                    })

                } 
            }   
        }   
    }
    catch(err){
        res.status(500).json({
            msg: "An Error Accured In Server"
        })
    }
})


router.post("/waiting", auth, async(req,res)  => {
    const email = req.body.email
    try{
        let seat = await Seat.findOne({
            email
        })

        if(seat){
            res.status(400).json({
                msg: "You have a desk"
            })
        }
        else {
            let query = {
                "seatNum": req.body.seatNum
            }
            let update = {
                "isAvailable" : 2,
                "email": req.body.email
            }
            let options = {
                "upsert" : false
            }
        
            await Seat.updateOne(query, update, options )
            .then (result => {
                res.status(200).json({result});
            })
            .catch(err => {
                res.status(400).json({msg: err})
            })
        }
        
    }
    catch(err){
        res.status(500).json({msg : err})
    }
    
})

router.post("/unhold", auth , async(req,res) => {
    let query = {
        "seatNum" : req.body.seatNum
    }
    let update = {
        "isAvailable" : 1,
        "email" : ""
    }
    let options = {
        "upsert" : false
    }
    let checker = 0

    await Seat.updateOne(query, update, options )
    .then (result => {
        // console.log(result);
        res.status(200).json({result});
        checker = 1
    })
    .catch(err => res.status(400).json({messeage: err}))

    if(checker){
        let query1 = {
            "email" : req.body.email
        }
        let update1 = {
            "isSeated" : false,
            "seatNum": 0,
        }
        let options1 = {
            "upsert" : false
        }
        
        await User.updateOne(query1, update1, options1)
        .then(result => {
            // console.log(result);
            res.status(200).json({result});
        }) 
        .catch(err =>
            res.status(400).json({messeage: err})
        )
    }
    

})

router.post("/all", auth ,async (req, res)=> {
    // try{
        const  group = req.body.group
        let  query = {
            group : group
        }
        let sort = {
            seatNum: 1
        }
        await Seat.find(query).sort(sort)
        .then(result => {
            // console.log(result);
            res.status(200).json({result});
        }) 
        .catch(err =>   {
            // console.log(err)
            res.status(400).json({messeage: err})
        }
        )
  })


module.exports = router;
