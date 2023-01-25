const express = require("express");
require('dotenv').config()
require("./db/conn");
const app = express();
const path = require("path");
const session =require("express-session");
const index_router = require("./routes/indexroutes");
const post_router = require("./routes/postroutes")
const flash = require('express-flash');
var moment = require('moment');
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/public", express.static(__dirname + "/public/"));
app.use("/assets", express.static(__dirname + "/assets"))
app.set('trust proxy', 1) // trust first proxy

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge:  24 * 60 * 60 * 1000 }
}))


app.locals.moment = moment;

app.use(flash());
app.use((req, res, next)=>{
    res.locals.formValue = req.flash("formValue")[0];
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.user = req.session.user
    next();
})

app.use(index_router);
app.use(post_router);
// app.get("/", (req, res)=> { res.status(200).json({greet: "HELLO"})})
app.set('view engine', 'ejs');

app.listen(PORT, (err)=>{
    if(err){
        console.log("Error in listening", err);
    } else {
        console.log(`Listening to Port ${PORT}`);
    }
})