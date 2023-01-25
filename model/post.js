const mongoose = require("mongoose");
const user_model = require("./user");
const comment_model = require("./comment");
const like_model = require("./post_like");

const post_schema = mongoose.Schema({
    caption:{
        type: String,
        required: false
    },
    post:{
        type:String,
        required: true
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    adType:{
        type: String,
        required: false
    },
    like_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like"
    }],
    comment_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    date:{
        type: Date,
        default: new Date()
    }
})

post_schema.virtual('child_count_for_like', {
    ref: 'Like',
    localField: '_id',
    foreignField: 'post_id',
    count: true // Set `count: true` on the virtual
  });
  
 post_schema.virtual('child_count_for_comment', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post_id',
    count: true // Set `count: true` on the virtual
});
  


const post_model = mongoose.model("Post", post_schema)
module.exports = post_model;