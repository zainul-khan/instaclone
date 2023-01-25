const mongoose = require("mongoose");
const user_model = require("./user");
const post_model = require("./post");

const comment_schema = mongoose.Schema({
    comment:{
        type: String,
        required: false
    },
    post_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    date:{
        type: Date,
        default: new Date()
    }
})

const comment_model = mongoose.model("Comment", comment_schema);
module.exports = comment_model;