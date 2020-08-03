const express = require("express");
const mongoose = require("mongoose")
const { check, validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("./auth");
const User = require("./user.model");
const db = require('./db');

router.post(
    "/signup",
    [
        check("email", "Please enter a valid email").isEmail()
        .not()
        .isEmpty(),
        check("password", "Please enter a valid password").isLength({
            min: 8
        })
        
    ],   
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            firstname,
            lastname,
            email,
            job,
            password,


        } = req.body;
        await mongoose.connect(db.MongoDeliDb)

        try {
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    msg: "User With This Email Already Exists"
                });
            }

            user = {
                firstname,
                lastname,
                email,
                job,
                password,
                isSeated : false,
                seatNum: 0,
                isVirtual: false,
                totalTimeStudied: 0,
                library: ""
            };

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await db.deliLibdb.collection('users').insertOne(user)
            .catch(err=>{
              res.status(400).json({
                msg: 'Giris Basarisiz'
              })
            })

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                "randomString", {
                    expiresIn: 10000
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        token
                    });
                }
            );
            // mongoose.disconnect()
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error Accured While Saving");
        }
    }
);


router.post(
    "/login",
    [
      check("email", "Please enter a valid email").isEmail(),
      check("password", "Please enter a valid password").isLength({
        min: 8
      })
    ],
    async (req, res) => {
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array()
        });
      }
      console.log("istek geldi")
      const { email, password } = req.body;
      try {
        let user = await db.deliLibdb.collection('users').findOne({
          email
        });
        if (!user)
          return res.status(404).json({
            message: "User Not Exist"
          });
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return res.status(404).json({
            message: "Incorrect Password !"
          });
  
        const payload = {
          user: {
            id: user.id
          }
        };
  
        jwt.sign(
          payload,
          "randomString",
          {
            expiresIn: 3600
          },
          (err, token) => {
            if (err) throw err;
            res.status(200).json({
              token
            });
          }
        );
        // mongoose.disconnect()
      } catch (e) {
        console.error(e);
        res.status(500).json({
          msg: "Server Error"
        });
      }
    }
  );

router.post("/me", auth, async (req, res) => {
    try {
        console.log(req.body.email)
        const user = await db.deliLibdb.collection('users').findOne({
          email : req.body.email
        });
        res.status(200).json(user);
    } catch (e) {
        res.send(e);
    }
});

router.post("/delete", auth, async (req,res) => {
    try{
      
      await User.deleteOne({"email" : req.body.email});
      res.send({messeage: "Success"})
    } catch(err){
        res.status(400).send ({messeage: "Error In Deleting User "});
    }
})

router.get("/all", auth ,async (req, res)=> {
      try{
        await mongoose.connect(db.MongoDeliDb)
        await User.find()
        .then(result => {
            console.log(result);
            res.status(200).json({result});
        }) 
        .catch(err =>
            res.status(400).json({messeage: err})
        )
      }
      catch(err){
        throw(err)
      }
})

router.post("/changePasswd", auth ,async (req, res)=> {
    try{
        const email = req.body.email
        // console.log(email)
        let user = await db.deliLibdb.collection('users').findOne({
          email
        })
        let query = {
            "email" : req.body.email
        }
        const salt = await bcrypt.genSalt(10);
        let update = {
          $set: {
            "password": await bcrypt.hash(req.body.password, salt)
          }  
        }

        const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
        if (!isMatch)
          return res.status(400).json({
            message: "Incorrect Password !"
          });
        const isMatch2 = await bcrypt.compare(req.body.password, user.password);

        if(isMatch2){
          return res.status(400).json({
            msg: "Old Password and New Password Can not Match"
          })
        }
        
        
        await db.deliLibdb.collection('users').updateOne(query, update)
        .then(result => {
            res.status(200).json({
                msg: "Sifre Degisimi Basarili"
            });
        }) 
        .catch(err =>
            res.status(400).json({msg: "An Error Accured"})
        )
        }
      catch(err){
        throw(err)
      }
})


module.exports = router;
