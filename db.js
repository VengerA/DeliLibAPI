const mongoose = require("mongoose");
const MongoClient = require('mongodb').MongoClient;
const Library = require('./library.model');
const Str = require('@supercharge/strings');
const User = require('./user.model');

const MongoUri = "mongodb+srv://udago:udago@delilib.gykr1.mongodb.net";
const MongoDeliDb = "mongodb+srv://udago:udago@delilib.gykr1.mongodb.net/DeliLib?retryWrites=true&w=majority";
const MongoSeatsDb = "mongodb+srv://udago:udago@delilib.gykr1.mongodb.net/Seats?retryWrites=true&w=majority";
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// const InitiateMongoServer = async () => {
//   try {
  
//     await mongoose.connect(MongoUri)
//     .then(res => {
//       res.createConnection('DeliLib?retryWrites=true&w=majority')
//     })
//   } catch (e) {
//     throw e;
//   }
// };


const deliLibdb = mongoose.createConnection(MongoDeliDb);
const seatsDb = mongoose.createConnection(MongoSeatsDb);

const CreateSeatCollection = async  (name) => {
  try {
      seatsDb.createCollection(name, function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
        db.close();
      });
  }
  catch(err){
    throw(err)
  }
}

const ChangeLibPasswords = async () => {
  let  query  = {
    isAvailable : true
  }
  // console.log("g")
  await deliLibdb.collection('libraries').find(query).toArray(function(err,result) {
      if(err){
        throw(err)
      }
      // console.log(result)
      result.map(item =>  {
        // console.log(item.libName)
        Changer(item.libName)
      })
  })
}

const Changer = async (name)  => {
  // console.log(name)
  let query = {
    "libName" : name
  }
  let update = {
    $set:{
      "password" : Str.random(4)
    } 
  }
  
  await deliLibdb.collection('libraries').updateOne(query, update)
  .then(result=> {
    // console.log("ahasdhashdß")
  })
  .catch(err => {
    console.log(err)
  })
}

module.exports = {
  CreateSeatCollection,
  ChangeLibPasswords,
  MongoDeliDb,
  MongoSeatsDb,
  deliLibdb,
  seatsDb,
};