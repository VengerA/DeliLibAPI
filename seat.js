const express = require("express");
const mongoose = require('mongoose');
const { check, validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("./auth");
const Seat  = require('./seat.model');
const User = require('./user.model');
const db = require('./db');

router.post("/add", auth, async(req, res) => {
    const seatCollectionName = req.body.seatCollectionName
    const seatNum = req.body.seatNum;
    const group = req.body.group;
    const libName = req.body.library;
    try{
        let  seat  = await  db.seatsDb.collection(seatCollectionName).findOne({
            seatNum
        })
        if(seat){
            res.status('400').json({
                msg: "This Seat Already Exists"
            })
        }

        else{
            seat = {
                seatNum,
                isAvailable: 1,
                email: "",
                group
            }
            let lib = await db.deliLibdb.collection('libraries').findOne({
                "libName" : libName
            })

            let groupCheck = await db.seatsDb.collection(seatCollectionName).findOne({
                group
            })

            if(!groupCheck){
                await db.deliLibdb.collection('libraries').updateOne(
                    {
                        libName
                    },
                    {
                        $set:{
                            "seatCount" : lib.seatCount + 1,
                            "groupCount": lib.groupCount + 1
                        }
                        
                    }
                )
            }
            else {
                await db.deliLibdb.collection('libraries').updateOne(
                    {
                        libName
                    },
                    {
                        $set:{
                            "seatCount" : lib.seatCount + 1
                        }
                        
                    }
                )
            }
            
            await db.seatsDb.collection(seatCollectionName).insertOne(seat)
            res.status(200).json({
                msg: "Desk added succesfully"
            })
        }
       
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
})

router.post("/hold", auth, async(req,res)  => {
    const email = req.body.email;
    const seatCollectionName = req.body.seatCollectionName;
    const library = req.body.library;
    const ipAdress = req.body.ipAdress
    const date = new Date();
    try{
        let seat = {}
        let user = {}
       let lib =  await db.deliLibdb.collection('libraries').findOne({
           libName: library
       })
       console.log(lib.ipAdress === ipAdress)
       if(lib.ipAdress === ipAdress){

            seat = await db.seatsDb.collection(seatCollectionName).findOne({
                email
            })


            user = await db.deliLibdb.collection('users').findOne({
                email
            })             
            
            if(seat){
                res.status(400).json({
                    msg: "You Are Already Holding a Desk"
                })
            }
            else {
                if(user.seatNum > 0){
                    res.status(400).json({
                        msg : "You Are Already Sit A Desk"
                    })
                }
            
                else{
                    let query = {
                        "seatNum": req.body.seatNum
                    }
                    let update = {
                        $set:{
                            "isAvailable" : 0,
                            "email": req.body.email,
                            "timeStarted": date 
                        }
                    }
                    let options = {
                        "upsert" : false
                    }
                    let query1 = {
                        "email" : req.body.email
                    }
                    let update1 = {
                        $set:{
                            "isSeated" : true,
                            "seatNum": req.body.seatNum,
                            "library": library,
                            "seatCollectionName": req.body.seatCollectionName,
                            "timeStarted": date
                        }
                    }
                    let options1 = {
                        "upsert" : false
                    }
                    await db.seatsDb.collection(seatCollectionName).updateOne(query, update)
                    .catch(err=> {
                        // mongoose.disconnect()
                        sitUser(0, query1, update1, seatCollectionName, req.body.seatNum) 
                        res.status(400).json({
                            msg:"An error accured"
                        })
                    })
                    console.log(query1);
                    console.log(update1);
                    await db.deliLibdb.collection('users').updateOne(query1,update1)
                    .then(result => {
                        res.status(200).json({
                            msg : "Holding Is Success"
                        })
                    })
                    .catch(err => {
                        sitUser(0, query1, update1, seatCollectionName, req.body.seatNum) 
                        throw(err)
                        
                    })
                }
            }
       }else {
           res.status(400).json({
               msg: "Your Ip Adress Does Not Match"
           })
       }
    }
    catch(err){
        throw(err)
    }
})

const sitUser  = async (checker, query, update, seatCollectionName, seatNum) => {
    query1 = {
        seatNum : seatNum
    }
    update1 = {
        $set:{
            "isAvailable" : 1,
            "email": ""
        }
    }
    await db.seatsDb.collection(seatCollectionName).updateOne(query1, update1)
}


// router.post("/waiting", auth, async(req,res)  => {
//     const email = req.body.email
//     try{
//         let seat = await Seat.findOne({
//             email
//         })

//         if(seat){
//             res.status(400).json({
//                 msg: "You have a desk"
//             })
//         }
//         else {
//             let query = {
//                 "seatNum": req.body.seatNum
//             }
//             let update = {
//                 "isAvailable" : 2,
//                 "email": req.body.email
//             }
//             let options = {
//                 "upsert" : false
//             }
        
//             await Seat.updateOne(query, update, options )
//             .then (result => {
//                 res.status(200).json({result});
//             })
//             .catch(err => {
//                 res.status(400).json({msg: err})
//             })
//         }
        
//     }
//     catch(err){
//         res.status(500).json({msg : err})
//     }
    
// })

router.post("/unhold", auth , async(req,res) => {
    let date2 = new Date()
    const email = req.body.email
    let query = {
        "seatNum" : req.body.seatNum
    }
    let update = {
        $set: {
            "isAvailable" : 1,
            "email" : ""
        }
       
    }

    let user = await db.deliLibdb.collection('users').findOne({
        email
    })

    let date = user.timeStarted;

    let totalTimeWorked = Math.ceil((date2-date)/1000)+ user.totalTimeWorked;

    await db.seatsDb.collection(req.body.seatCollectionName).updateOne(query, update)
    .catch(err => res.status(400).json({messeage: err}))

    let query1 = {
        "email" : email
    }
    let update1 = {
        $set: {
            "isSeated" : false,
            "seatNum": "0",
            "library" : "",
            "seatCollectionName": "",
            "totalTimeWorked": totalTimeWorked + user.totalTimeWorked
        }
    }

    


    
    await db.deliLibdb.collection('users').updateOne(query1, update1)
    .then(result => {
        res.status(200).json({result});
    }) 
    .catch(err =>
        res.status(400).json({messeage: err})
    )
})

router.post("/all", auth ,async (req, res)=> {
    try{
        const  group = req.body.group
        const seatCollectionName = req.body.seatCollectionName
        let  query = {
            group : group
        }
        let sort = {
            seatNum: 1
        }
        await db.seatsDb.collection(seatCollectionName).find(query).sort(sort).toArray(function(err, result){
            if(err){
                throw(err)
            }
            res.status(200).send(result)
        })
    }
    catch(err){
        throw(err)
    }
})

router.post('/addVirtual', auth, async (req,res) => {
    const seatCollectionName = req.body.seatCollectionName
    const libName = req.body.library
    const timeStarted = new Date()
    const email = req.body.email
    try{
        let seat = await db.seatsDb.collection(seatCollectionName).findOne({
            email
        })

        let user = await db.deliLibdb.collection('users').findOne({
            email
        })

        if(seat){
            res.status(400).json({
                msg: "You already have a virtual desk"
            })
        }
        if(user.isSeated){
            res.status(400).json({
                msg: " You already have a desk"
            })
        }
        await db.seatsDb.collection(seatCollectionName).insertOne(
            {
                seatNum: "Virtual",
                group: "Virtual",
                email,
                isVirtual: true,
                timeStarted: timeStarted
            }
        )

        await db.deliLibdb.collection('users').updateOne(
            {
                email: email
            },
            {
                $set: {
                    "seatNum": "Virtual-"+libName,
                    "isSeated": true,
                    "library": libName,
                    "seatCollectionName": seatCollectionName,
                    "timeStarted": timeStarted
                }
            })
            .then(result => {
                res.status(200).json({
                    msg: "Virtual Desk Is Open Now"
                })
            })
    }
    catch(err){
        throw(err)
    }
})

router.post('/deleteVirtual', auth, async (req,res) => {
    const seatCollectionName = req.body.seatCollectionName;
    const email = req.body.email;
    try{
        await db.seatsDb.collection(seatCollectionName).deleteOne({
            email        
        })

        let user = await db.deliLibdb.collection('users').findOne({
            email
        })

        let date = user.timeStarted
        let date2 = new Date()
        
        let totalTimeWorked = Math.ceil((date2 - date)/1000)+ user.totalTimeWorked;

        await db.deliLibdb.collection('users').updateOne(
            {
                email
            },
            {
                $set:{
                    "seatNum": "",
                    "isSeated": false,
                    "library" : "",
                    "seatCollectionName": "",
                    "totalTimeWorked": totalTimeWorked
                }
            }
        )
        .then(result => {
            res.status(200).json({
                msg: "Delete Successfull"
            })
        })
    }
    catch(err){
        throw(err)
    }
})


module.exports = router;
