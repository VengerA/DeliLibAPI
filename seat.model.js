const mongoose = require("mongoose");

const Seat = mongoose.model(
  "Seat",
  new mongoose.Schema({
    seatNum : { 
        type : Number,
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
      required: true, 
  }
  })
);

module.exports = Seat;


