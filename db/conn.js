const mongoose = require("mongoose");

mongoose.connect(`${process.env.DB}`).then(()=>{
    console.log("Database connected")
}).catch((error)=>{
    console.log(error)
})