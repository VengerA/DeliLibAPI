const mongoose = require("mongoose");

const Library = mongoose.model(
  "Library",
  new mongoose.Schema({
    libName : {
        type : String, 
        required : true
    },
    seatCount :  {
        type:  Number,
        required: true
    },
    groupCount : {
        type : Number,
        required:  true
    },
    password : {
        type : String,
        required : true
    },
    seatCollectionName: {
        type: String,
        required: true
    },
    isAvailable: {
        type : Boolean,
        required: true
    },
    ipAdress: {
        type : String,
        required: false
    }
  })
);

module.exports = Library;


