const mongoose = require("mongoose");
const MongoClient = require('mongodb').MongoClient;
const Library = require('./library.model');
const Str = require('@supercharge/strings');

const MongoUri = "mongodb+srv://test:test@node-auth-md2ex.mongodb.net/node-auth?retryWrites=true&w=majority";
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const InitiateMongoServer = async () => {
  try {
  
    await mongoose.connect(MongoUri)
    console.log("Connected to DB !!");
  } catch (e) {
    throw e;
  }
};

const CreateSeatCollection = async  (name) => {
  try {
    MongoClient.connect(MongoUri, function(err, db) {
      if (err) throw err;
      var dbo = db.db("node-auth");
      
      dbo.createCollection(name, function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
        db.close();
      });
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
  await Library.find(query)
  .then(result => {
      result.forEach(item =>  {
        Changer(item.libName)
      })
  })
}

const Changer = async (name)  => {
  let query = {
    "libName" : name
  }
  let update = {
    "password" : Str.random(4)
  }
  let options = {
    "upsert" : false
  }

  let date = new Date();
  
  await Library.updateOne(query, update, options)

  .then(res => {
    console.log(name + " sifresi degisti" + "   " + date.getMinutes());
  })
  .catch(err => {
    console.log(err)
  })
}

module.exports = {
  InitiateMongoServer,
  CreateSeatCollection,
  ChangeLibPasswords
};