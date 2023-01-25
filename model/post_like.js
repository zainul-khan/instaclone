const mongoose = require("mongoose");
const user_model = require("./user");
const post_model = require("./post")

const like_schema = mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: user_model
    },
    post_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    date:{
        type: Date,
        default: new Date()
    }
})

const like_model = mongoose.model('Like', like_schema);
module.exports = like_model;