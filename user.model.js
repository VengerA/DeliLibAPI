const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    firstname:{ 
      type :String,
      required: false
    },
    lastname: {
      type : String,
      required: false
    },
    email: {
      type : String,
      required: false
    },
    password: {
      type : String,
      required: false
    },
    job: {
      type : String,
      required: false
    },
    library: {
      type : String,
      required: false
    },
    isSeated : {
      type : Boolean,
      required: false
    },
    seatNum: {
      type : Number,
      required: false
    },
    timeStarted: {
      type : Date,
      required: false
    },
    isTrue: { 
      type : Boolean, 
      required: false
    },
    totalTimeStudied: {
      type: Number,
      required: true
    }
  })
);

module.exports = User;


