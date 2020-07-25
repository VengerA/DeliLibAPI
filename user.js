const express = require("express");
const { check, validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("./auth");
const User = require("./user.model");

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
        console.log("IStek Geldi");
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
        try {
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    msg: "User With This Email Already Exists"
                });
            }

            user = new User({
                firstname,
                lastname,
                email,
                job,
                password,
                isSeated : false,
                seatNum: 0
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

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
  
      const { email, password } = req.body;
      try {
        let user = await User.findOne({
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
      } catch (e) {
        console.error(e);
        res.status(500).json({
          msg: "Server Error"
        });
      }
    }
  );

router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (e) {
        res.send({ message: "Error in Fetching user" });
    }
});

router.post("/delete", auth, async (req,res) => {
    try{
        await User.deleteOne({"email" : req.body.email});
        res.send({messeage: "Success"})
    } catch(err){
        res.send ({messeage: "Error In Deleting User "});
    }
})

router.get("/all", auth ,async (req, res)=> {
    // try{
        await User.find()
        .then(result => {
            console.log(result);
            res.status(200).json({result});
        }) 
        .catch(err =>
            res.status(400).json({messeage: err})
        )
})

router.post("/changePasswd", auth ,async (req, res)=> {
    // try{
        const email = req.body.email
        // console.log(email)
        let user = await User.findOne({email})
        let query = {
            "email" : req.body.email
        }
        const salt = await bcrypt.genSalt(10);
        let update = {
            "password": await bcrypt.hash(req.body.password, salt)
        }
        let options = {
            "upsert" : false
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
        
        
        await User.updateOne(query, update, options)
        .then(result => {
            // console.log(result);
            res.status(200).json({
                msg: "Sifre Degisimi Basarili"
            });
        }) 
        .catch(err =>
            res.status(400).json({msg: "An Error Accured"})
        )
})

router.post("/sit", auth ,async (req, res)=> {
  try{
      let query = {
          "email" : req.body.email
      }
      let update = {
          "isSeated" : true,
          "seatNum": req.body.seatNum,
          "timeStarted": req.body.time
      }
      let options = {
          "upsert" : false
      }
      
      await User.updateOne(query, update, options)
      .then(result => {
          console.log(result);
          res.status(200).json({result});
      }) 
      .catch(err =>
          res.status(400).json({messeage: err})
      )
    }
    catch(err){
      res.status(500).json({messeage: err})
    }
})

router.post("/stand", auth ,async (req, res)=> {
  // try{
      let query = {
          "email" : req.body.email
      }
      let update = {
          "isSeated" : false,
          "seatNum": 0,
          "timeStarted": null
      }
      let options = {
          "upsert" : false
      }
      
      await User.updateOne(query, update, options)
      .then(result => {
          console.log(result);
          res.status(200).json({result});
      }) 
      .catch(err =>
          res.status(400).json({messeage: err})
      )
})

module.exports = router;
