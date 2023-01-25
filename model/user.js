const mongoose = require("mongoose");

const user_schema = mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    contact:{
        type: String,
        required: true
    },
    is_active:{
        type: Boolean,
        default: true
    },
    user_pic:{
        type: String,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    country:{
        type: String,
        required: true
    }, 
    token:{
        type: String
    }
}, {timestamps:true}
)

const user_model = mongoose.model("User", user_schema);
module.exports = user_model;