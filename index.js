const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");
const auth = require("./routes/api/auth");
const profile = require("./routes/api/profile");
const question = require("./routes/api/question");

const app = express();
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

const db = require("./setup/dbconfig").dbconnection;

mongoose.
    connect(db).
    then(() => console.log("Mongodb connected successfully")).
    catch(err => console.log(err));

//Passport middleware
app.use(passport.initialize());

//Config for JWT strategy
require("./strategies/jsonwtStrategy")(passport);

app.get("/",(req,res) => {
    res.send("It is working correct");
})

app.use("/api/auth",auth);
app.use("/api/profile",profile);
app.use("/api/question",question);


const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server is running on port ${port}`));