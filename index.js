const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors')
const user = require("./user"); //new addition
const MongoServerFuncs = require("./db");
const seat = require('./seat');
const library = require('./library');

const app = express();

app.use(cors())
app.use(bodyParser.json());
app.use("/user", user);
app.use("/seat", seat);
app.use("/library", library);

app.listen(3000, function () {
  console.log("app listening on port 3000!");
});

app.get("/", (req, res) => {
  res.json({ message: "API Working" });
});

MongoServerFuncs.InitiateMongoServer();

let date =new Date()

console.log(date);
setInterval(MongoServerFuncs.ChangeLibPasswords, 60000);



;

