const mongoose = require("mongoose");

const Seat = mongoose.model(
  "Seat",
  new mongoose.Schema({
    seatNum : { 
        type : String,
        required: true
    },
    isAvailable: {
        type : Number, 
        required: true, 
    },
    email: {
      type : String, 
      required: false, 
    },
    group : {
      type : String, 
      required: false, 
    },
    isVirtual : {
      type : Boolean,
      required: true
    },
    timeStarted: {
      type: Date,
      required: false
    }
  })
);

module.exports = Seat;


